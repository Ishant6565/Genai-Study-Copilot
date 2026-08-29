import time
import json
from typing import List, Dict, Any, Optional, AsyncGenerator, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.core.config import settings
from app.core.logging import logger
from app.models.document import Document, DocumentStatus
from app.models.document_chunk import DocumentChunk
from app.models.conversation import Conversation, Message
from app.models.metrics import RAGMetric
from app.schemas.chat import CitationItem
from app.services.embedding_service import get_embedding, calculate_cosine_similarity, openai_client


async def retrieve_relevant_chunks(
    query: str,
    user_id: str,
    document_id: Optional[str],
    db: AsyncSession,
    top_k: int = 4
) -> Tuple[List[Dict[str, Any]], float]:
    """
    Retrieve top-k relevant document chunks using vector similarity search.
    Returns (chunks_list, retrieval_latency_ms).
    """
    start_time = time.perf_counter()
    
    # 1. Embed query
    query_vector = await get_embedding(query)
    
    # 2. Retrieve candidate chunks for the user
    stmt = (
        select(DocumentChunk, Document.title, Document.filename)
        .join(Document, DocumentChunk.document_id == Document.id)
        .where(
            and_(
                Document.user_id == user_id,
                Document.status == DocumentStatus.READY.value
            )
        )
    )
    
    if document_id:
        stmt = stmt.where(Document.id == document_id)
        
    result = await db.execute(stmt)
    records = result.all()
    
    if not records:
        retrieval_latency_ms = (time.perf_counter() - start_time) * 1000
        return [], retrieval_latency_ms

    # 3. Calculate cosine similarity
    scored_chunks = []
    for chunk, doc_title, doc_filename in records:
        embedding = chunk.embedding
        if not embedding:
            continue
            
        # If stored as string or list
        if isinstance(embedding, str):
            try:
                embedding = json.loads(embedding)
            except Exception:
                continue
                
        score = calculate_cosine_similarity(query_vector, list(embedding))
        
        scored_chunks.append({
            "chunk_id": chunk.id,
            "document_id": chunk.document_id,
            "document_title": doc_title,
            "document_filename": doc_filename,
            "page_number": chunk.page_number,
            "content": chunk.content,
            "score": score
        })

    # Sort descending by similarity score
    scored_chunks.sort(key=lambda x: x["score"], reverse=True)
    top_chunks = scored_chunks[:top_k]
    
    retrieval_latency_ms = (time.perf_counter() - start_time) * 1000
    return top_chunks, retrieval_latency_ms


def build_system_prompt(chunks: List[Dict[str, Any]]) -> str:
    """Build grounded system prompt with strict anti-hallucination and citation rules."""
    context_blocks = []
    for i, c in enumerate(chunks, 1):
        context_blocks.append(
            f"--- SOURCE [{i}] (Document: '{c['document_title']}', Page: {c['page_number']}) ---\n"
            f"{c['content']}\n"
        )
    
    context_text = "\n".join(context_blocks)
    
    system_prompt = (
        "You are StudyPilot AI, an elite AI Study Copilot and expert educational mentor.\n"
        "Your role is to help students, researchers, and engineers master complex subjects based strictly on their uploaded study materials.\n\n"
        "=== STRICT GROUNDING RULES ===\n"
        "1. Answer the user's question using ONLY the provided Source Context below.\n"
        "2. Include precise inline citations whenever stating facts, using the format: [Source: <Document Title>, Page <Page Number>].\n"
        "3. Format your response cleanly using Markdown (bold key terms, use bullet points, clear headings, and syntax-highlighted code blocks if relevant).\n"
        "4. ANTI-HALLUCINATION GUARD: If the provided source context does not contain sufficient information to answer the question accurately, explicitly state:\n"
        "   'I could not find information regarding this topic in your uploaded study documents. Please verify if the relevant chapter or document has been uploaded.'\n"
        "5. Do NOT invent facts or extrapolate beyond what is documented in the source material.\n\n"
        f"=== SOURCE CONTEXT ===\n{context_text}"
    )
    return system_prompt


def generate_fallback_grounded_answer(query: str, chunks: List[Dict[str, Any]]) -> str:
    """
    Fallback deterministic grounding response generator when running without OpenAI key.
    Extracts actual sentences from retrieved chunks with citations.
    """
    if not chunks or chunks[0]["score"] < 0.2:
        return (
            "I could not find information regarding this question in your uploaded study documents. "
            "Please ensure the document covering this topic is uploaded and indexed in your workspace."
        )

    response_lines = [
        f"### 📘 Analysis for: *{query}*",
        "",
        "Based on your uploaded study materials, here are the key findings:",
        ""
    ]

    for i, chunk in enumerate(chunks[:3], 1):
        snippet = chunk["content"].strip().replace("\n\n", " ")
        # Take key sentences
        sentences = [s.strip() for s in snippet.split(".") if len(s.strip()) > 20][:3]
        summary_point = ". ".join(sentences) + "." if sentences else snippet[:200]
        
        response_lines.append(
            f"- **Core Concept ({chunk['document_title']}, Page {chunk['page_number']})**: "
            f"{summary_point} "
            f"[Source: {chunk['document_title']}, Page {chunk['page_number']}]"
        )
        response_lines.append("")

    response_lines.append(
        "> 💡 **Study Tip**: Review the cited pages in your original document for detailed mathematical formulas and diagrams."
    )
    return "\n".join(response_lines)


async def execute_rag_query(
    query: str,
    user_id: str,
    conversation_id: Optional[str],
    document_id: Optional[str],
    db: AsyncSession,
    model: str = "gpt-4o-mini"
) -> Dict[str, Any]:
    """
    Complete end-to-end RAG execution:
    1. Retrieve relevant chunks
    2. Format prompt
    3. Generate LLM answer
    4. Store message & update conversation
    5. Record observability metrics
    """
    overall_start = time.perf_counter()
    
    # 1. Retrieve chunks
    chunks, retrieval_latency_ms = await retrieve_relevant_chunks(
        query=query,
        user_id=user_id,
        document_id=document_id,
        db=db,
        top_k=settings.TOP_K_RETRIEVAL
    )
    
    # 2. Prepare conversation
    if conversation_id:
        conv_stmt = select(Conversation).where(Conversation.id == conversation_id)
        conv_res = await db.execute(conv_stmt)
        conv = conv_res.scalar_one_or_none()
    else:
        conv = Conversation(
            user_id=user_id,
            document_id=document_id,
            title=query[:45] + ("..." if len(query) > 45 else "")
        )
        db.add(conv)
        await db.commit()
        await db.refresh(conv)

    # 3. Add user message
    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=query
    )
    db.add(user_msg)
    await db.commit()

    # 4. Generate LLM answer
    gen_start = time.perf_counter()
    answer_text = ""
    prompt_tokens = 0
    completion_tokens = 0

    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-") and openai_client:
        try:
            # Build conversation history
            history_stmt = (
                select(Message)
                .where(Message.conversation_id == conv.id)
                .order_by(Message.created_at.desc())
                .limit(6)
            )
            history_res = await db.execute(history_stmt)
            past_messages = list(reversed(history_res.scalars().all()))

            messages_payload = [{"role": "system", "content": build_system_prompt(chunks)}]
            for m in past_messages:
                messages_payload.append({"role": m.role, "content": m.content})

            completion = await openai_client.chat.completions.create(
                model=model,
                messages=messages_payload,
                temperature=0.2,
                max_tokens=1200
            )
            answer_text = completion.choices[0].message.content
            prompt_tokens = completion.usage.prompt_tokens if completion.usage else 0
            completion_tokens = completion.usage.completion_tokens if completion.usage else 0
        except Exception as e:
            logger.warning(f"OpenAI Chat completion failed ({e}), using fallback grounded answer.")
            answer_text = generate_fallback_grounded_answer(query, chunks)
    else:
        answer_text = generate_fallback_grounded_answer(query, chunks)

    generation_latency_ms = (time.perf_counter() - gen_start) * 1000
    total_latency_ms = (time.perf_counter() - overall_start) * 1000

    # 5. Format citations
    citations_data = [
        {
            "document_id": c["document_id"],
            "document_title": c["document_title"],
            "page_number": c["page_number"],
            "chunk_id": c["chunk_id"],
            "snippet": c["content"][:220] + "...",
            "similarity_score": round(c["score"], 4)
        }
        for c in chunks
    ]

    # 6. Save assistant message
    asst_msg = Message(
        conversation_id=conv.id,
        role="assistant",
        content=answer_text,
        citations=citations_data,
        tokens_used={"prompt_tokens": prompt_tokens, "completion_tokens": completion_tokens},
        latency_ms={"retrieval_ms": round(retrieval_latency_ms, 2), "generation_ms": round(generation_latency_ms, 2)}
    )
    db.add(asst_msg)

    # 7. Record Observability Metric
    avg_sim = sum(c["score"] for c in chunks) / len(chunks) if chunks else 0.0
    metric = RAGMetric(
        user_id=user_id,
        query=query,
        retrieval_latency_ms=round(retrieval_latency_ms, 2),
        generation_latency_ms=round(generation_latency_ms, 2),
        total_latency_ms=round(total_latency_ms, 2),
        top_k_chunks=len(chunks),
        avg_similarity_score=round(avg_sim, 4),
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        model_name=model,
        status="SUCCESS" if chunks else "NO_CONTEXT"
    )
    db.add(metric)
    await db.commit()
    await db.refresh(asst_msg)

    return {
        "conversation_id": conv.id,
        "message": asst_msg,
        "citations": citations_data
    }
