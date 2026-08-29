import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.core.security import get_password_hash
from app.core.logging import logger
from app.models.user import User
from app.models.document import Document, DocumentStatus
from app.models.document_chunk import DocumentChunk
from app.models.conversation import Conversation, Message
from app.models.study import Summary, Quiz, Flashcard
from app.models.metrics import RAGMetric
from app.services.embedding_service import get_embeddings


SAMPLE_DOCUMENT_PAGES = [
    {
        "page_number": 1,
        "content": (
            "Chapter 1: Foundations of Enterprise Retrieval-Augmented Generation (RAG)\n\n"
            "Retrieval-Augmented Generation (RAG) is an architectural framework that bridges external authoritative knowledge "
            "bases with Large Language Models (LLMs). While traditional LLMs rely strictly on static parametric weights trained at "
            "a specific point in time, RAG augments the context window dynamically with factual, verifiable domain documents.\n\n"
            "The core RAG lifecycle comprises three fundamental stages:\n"
            "1. Ingestion & Pre-processing: Raw unstructured documents (PDFs, Markdown, Docx) are parsed, cleaned, stripped of noise, "
            "and decomposed into semantic chunks.\n"
            "2. Vector Indexing: Chunks are transformed into dense mathematical embeddings using embedding models (e.g. OpenAI text-embedding-3-small, "
            "dimension 1536) and indexed into vector stores using pgvector with HNSW indexing.\n"
            "3. Query Time Retrieval & Synthesis: User queries are embedded, matched via cosine similarity (1 - cosine distance), and passed "
            "into the LLM context prompt alongside strict grounding instructions."
        )
    },
    {
        "page_number": 2,
        "content": (
            "Chapter 2: Chunking Strategies and Context Window Optimization\n\n"
            "Selecting the optimal chunking strategy directly dictates retrieval precision and answer groundedness. "
            "Naive fixed-length chunking often bisects sentences in the middle of crucial clauses, causing semantic truncation.\n\n"
            "Modern production systems implement Recursive Character Splitting with sliding-window overlap (e.g., 600 tokens with 100 token overlap). "
            "This structure guarantees that contextual continuity is preserved across chunk boundaries.\n\n"
            "Furthermore, metadata preservation is vital. Every chunk must retain: document ID, original filename, exact page number, "
            "character start/end offsets, and token count. Preserving page numbers enables inline verifiable citations [Source: Doc, Page X], "
            "which eliminates human friction during auditability."
        )
    },
    {
        "page_number": 3,
        "content": (
            "Chapter 3: Anti-Hallucination Guardrails & Verifiable Inline Citations\n\n"
            "In critical enterprise and academic workflows, a confident hallucination is far more dangerous than a refusal to answer. "
            "Production RAG architectures enforce prompt-level and programmatic guardrails:\n\n"
            "- Strict Grounding Instruction: The system prompt instructs the model to answer exclusively from the provided source context.\n"
            "- Explicit Non-Disclosure Trigger: If the cosine similarity score of top retrieved chunks is below a threshold (e.g., < 0.50), "
            "the system returns a standardized message stating that the information cannot be found in the uploaded documents.\n"
            "- Inline Citation Tagging: Every assertion made by the assistant is tagged with the corresponding source document and page number, "
            "allowing client interfaces to render interactive citation cards with instant PDF snippet previews."
        )
    }
]


async def seed_demo_data(db: AsyncSession):
    """Seed sample data for instant demo/portfolio evaluation."""
    try:
        # Check if demo user already exists
        stmt = select(User).where(User.email == settings.DEMO_USER_EMAIL)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            logger.info("Seeding demo user and initial study assets...")
            user = User(
                email=settings.DEMO_USER_EMAIL,
                hashed_password=get_password_hash(settings.DEMO_USER_PASSWORD),
                full_name=settings.DEMO_USER_NAME,
                role="student"
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

        # Check if sample document exists
        doc_stmt = select(Document).where(Document.user_id == user.id)
        doc_res = await db.execute(doc_stmt)
        existing_doc = doc_res.scalar_one_or_none()

        if not existing_doc:
            sample_file_path = os.path.join(settings.UPLOAD_DIR, "demo_distributed_systems_rag.pdf")
            with open(sample_file_path, "w", encoding="utf-8") as f:
                f.write("StudyPilot AI Seed Document: Distributed Systems & Enterprise GenAI RAG Architecture.")

            doc = Document(
                user_id=user.id,
                title="Distributed Systems & Enterprise GenAI RAG Guide",
                filename="distributed_systems_rag_guide.pdf",
                file_path=sample_file_path,
                file_size_bytes=1024 * 342,
                file_type="application/pdf",
                total_pages=len(SAMPLE_DOCUMENT_PAGES),
                total_chunks=len(SAMPLE_DOCUMENT_PAGES),
                status=DocumentStatus.READY.value
            )
            db.add(doc)
            await db.commit()
            await db.refresh(doc)

            # Seed Chunks & Embeddings
            chunk_texts = [p["content"] for p in SAMPLE_DOCUMENT_PAGES]
            embeddings = await get_embeddings(chunk_texts)

            for i, p in enumerate(SAMPLE_DOCUMENT_PAGES):
                chunk = DocumentChunk(
                    document_id=doc.id,
                    chunk_index=i,
                    page_number=p["page_number"],
                    content=p["content"],
                    token_count=len(p["content"].split()),
                    embedding=embeddings[i]
                )
                db.add(chunk)

            # Seed Sample Conversation
            conv = Conversation(
                user_id=user.id,
                document_id=doc.id,
                title="RAG Architecture & Chunking Strategy Q&A"
            )
            db.add(conv)
            await db.commit()
            await db.refresh(conv)

            # Seed Conversation Messages
            msg1 = Message(
                conversation_id=conv.id,
                role="user",
                content="How does recursive character chunking prevent context loss across document boundaries?"
            )
            msg2 = Message(
                conversation_id=conv.id,
                role="assistant",
                content=(
                    "According to **Chapter 2 of the Distributed Systems & Enterprise GenAI RAG Guide**, "
                    "naive fixed-length chunking often splits text in the middle of sentences or logical clauses.\n\n"
                    "**Recursive Character Splitting with sliding-window overlap** (e.g. 600 tokens with 100 token overlap) "
                    "solves this by:\n"
                    "1. Preserving semantic paragraphs and complete grammatical sentences.\n"
                    "2. Retaining trailing tokens from the previous chunk so boundary clauses remain fully coherent.\n"
                    "3. Associating exact page numbers to every chunk for precise inline auditability "
                    "[Source: Distributed Systems & Enterprise GenAI RAG Guide, Page 2]."
                ),
                citations=[
                    {
                        "document_id": doc.id,
                        "document_title": doc.title,
                        "page_number": 2,
                        "snippet": "Modern production systems implement Recursive Character Splitting with sliding-window overlap...",
                        "similarity_score": 0.94
                    }
                ],
                latency_ms={"retrieval_ms": 38.4, "generation_ms": 280.1}
            )
            db.add_all([msg1, msg2])

            # Seed Sample Quiz
            quiz = Quiz(
                user_id=user.id,
                document_id=doc.id,
                title="Mastery Exam: Enterprise RAG Foundations",
                difficulty="Medium",
                total_questions=3,
                questions=[
                    {
                        "id": 1,
                        "question": "What is the primary advantage of sliding-window chunk overlap in RAG pre-processing?",
                        "options": [
                            "It reduces disk storage by half",
                            "It preserves contextual continuity across chunk boundaries",
                            "It encrypts sensitive PII tokens",
                            "It bypasses the need for an embedding model"
                        ],
                        "correct_answer": 1,
                        "explanation": "Sliding-window overlap ensures sentences that span across split boundaries retain complete contextual meaning."
                    },
                    {
                        "id": 2,
                        "question": "Why is metadata (such as page numbers) preserved alongside vector embeddings in pgvector?",
                        "options": [
                            "To enable verifiable inline citations and easy human auditability",
                            "To speed up database connection pooling",
                            "To replace SQL joins with full table scans",
                            "To format JSON responses into CSV"
                        ],
                        "correct_answer": 0,
                        "explanation": "Page numbers allow the system to generate direct clickable citations linking answers to original pages."
                    },
                    {
                        "id": 3,
                        "question": "What happens when a user query fails to match any retrieved chunks above the similarity threshold?",
                        "options": [
                            "The LLM hallucinates an approximate answer",
                            "The server crashes with a 500 error",
                            "The anti-hallucination guardrail explicitly informs the user that the information is not found in their documents",
                            "The entire database is cleared"
                        ],
                        "correct_answer": 2,
                        "explanation": "Anti-hallucination guardrails guarantee that the AI refuses to guess or invent facts outside the uploaded context."
                    }
                ]
            )
            db.add(quiz)

            # Seed Sample Flashcards
            flashcards = [
                Flashcard(
                    user_id=user.id,
                    document_id=doc.id,
                    front="What is Retrieval-Augmented Generation (RAG)?",
                    back="An architecture that augments LLM prompts dynamically with factual retrieved documents from a vector store, preventing static model hallucinations.",
                    category="Core Architecture",
                    difficulty="Easy"
                ),
                Flashcard(
                    user_id=user.id,
                    document_id=doc.id,
                    front="What is HNSW in pgvector?",
                    back="Hierarchical Navigable Small World — a multi-layer graph index for sub-millisecond Approximate Nearest Neighbor (ANN) vector search.",
                    category="Database & Indexing",
                    difficulty="Hard"
                ),
                Flashcard(
                    user_id=user.id,
                    document_id=doc.id,
                    front="Why use Anti-Hallucination Guardrails?",
                    back="To ensure the AI strictly states when information is missing rather than confidently inventing inaccurate facts.",
                    category="Safety & Evaluation",
                    difficulty="Medium"
                )
            ]
            db.add_all(flashcards)

            # Seed Sample Summary
            summary = Summary(
                user_id=user.id,
                document_id=doc.id,
                title=f"Summary: {doc.title}",
                quick_summary="A comprehensive architectural breakdown of enterprise RAG pipelines, recursive chunking mechanics, pgvector HNSW indexing, and anti-hallucination guardrails.",
                detailed_summary=(
                    "### 📘 Executive Summary\n\n"
                    "This guide establishes production best practices for engineering high-reliability GenAI educational assistants.\n\n"
                    "#### 🎯 Key Architectural Pillars\n"
                    "- **Recursive Chunking**: Overcomes context loss by applying a sliding-window overlap across token boundaries.\n"
                    "- **pgvector HNSW Indexing**: Delivers sub-50ms vector similarity matching using cosine distance.\n"
                    "- **Auditable Citations**: Maps every response token directly to source page numbers."
                ),
                key_concepts=[
                    "Retrieval-Augmented Generation (RAG)",
                    "Recursive Character Chunking",
                    "HNSW Vector Indexing",
                    "Grounded Inline Citations",
                    "Anti-Hallucination Guardrails"
                ],
                definitions=[
                    {"term": "RAG", "definition": "Retrieval-Augmented Generation framework connecting LLMs to external vector databases."},
                    {"term": "Cosine Distance", "definition": "1 - Cosine Similarity, measuring the angular divergence between embedding vectors in high-dimensional space."},
                    {"term": "HNSW", "definition": "Hierarchical Navigable Small World graph index for fast nearest-neighbor search."}
                ]
            )
            db.add(summary)

            # Seed Sample Observability Metric
            metric = RAGMetric(
                user_id=user.id,
                query="How does recursive character chunking prevent context loss across document boundaries?",
                retrieval_latency_ms=38.4,
                generation_latency_ms=280.1,
                total_latency_ms=318.5,
                top_k_chunks=3,
                avg_similarity_score=0.942,
                prompt_tokens=420,
                completion_tokens=145,
                model_name="gpt-4o-mini",
                status="SUCCESS"
            )
            db.add(metric)

            await db.commit()
            logger.info("Demo user, sample documents, conversations, quizzes, and metrics seeded successfully!")

    except Exception as e:
        logger.exception(f"Error seeding demo data: {e}")
