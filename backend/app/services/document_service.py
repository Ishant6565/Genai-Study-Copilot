import os
import re
from typing import List, Dict, Any, Tuple
from pypdf import PdfReader
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.config import settings
from app.core.logging import logger
from app.models.document import Document, DocumentStatus
from app.models.document_chunk import DocumentChunk
from app.services.embedding_service import get_embeddings


def clean_text(text: str) -> str:
    """Normalize whitespace and remove non-printable characters."""
    if not text:
        return ""
    # Replace multiple newlines/spaces with single
    text = re.sub(r'[\r\f]+', '\n', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()


def extract_text_from_pdf(file_path: str) -> List[Dict[str, Any]]:
    """
    Extract text from a PDF file page by page.
    Returns list of dicts: [{"page_number": 1, "text": "..."}]
    """
    pages_data = []
    try:
        reader = PdfReader(file_path)
        total_pages = len(reader.pages)
        
        for i, page in enumerate(reader.pages):
            page_num = i + 1
            raw_text = page.extract_text() or ""
            cleaned = clean_text(raw_text)
            if cleaned:
                pages_data.append({
                    "page_number": page_num,
                    "text": cleaned
                })
        
        # If no text extracted (e.g. empty or OCR needed), provide placeholder
        if not pages_data:
            pages_data.append({
                "page_number": 1,
                "text": f"Document content from {os.path.basename(file_path)}"
            })
            
        return pages_data
    except Exception as e:
        logger.error(f"Failed to extract PDF text from {file_path}: {e}")
        raise ValueError(f"Could not parse PDF document: {str(e)}")


def chunk_document_pages(
    pages_data: List[Dict[str, Any]],
    chunk_size_chars: int = 1500,
    chunk_overlap_chars: int = 250
) -> List[Dict[str, Any]]:
    """
    Semantic chunking over pages while preserving page number boundaries and context.
    """
    chunks = []
    chunk_index = 0

    for page in pages_data:
        page_num = page["page_number"]
        page_text = page["text"]

        if len(page_text) <= chunk_size_chars:
            chunks.append({
                "chunk_index": chunk_index,
                "page_number": page_num,
                "content": page_text,
                "token_count": len(page_text.split())
            })
            chunk_index += 1
            continue

        # Split into paragraphs / sentences
        paragraphs = page_text.split("\n\n")
        current_chunk = ""
        
        for p in paragraphs:
            p = p.strip()
            if not p:
                continue

            if len(current_chunk) + len(p) + 2 <= chunk_size_chars:
                current_chunk = f"{current_chunk}\n\n{p}".strip()
            else:
                if current_chunk:
                    chunks.append({
                        "chunk_index": chunk_index,
                        "page_number": page_num,
                        "content": current_chunk,
                        "token_count": len(current_chunk.split())
                    })
                    chunk_index += 1
                    # Keep overlap from the end of current_chunk
                    overlap = current_chunk[-chunk_overlap_chars:] if len(current_chunk) > chunk_overlap_chars else ""
                    current_chunk = f"{overlap}\n\n{p}".strip()
                else:
                    # Single paragraph exceeds chunk_size_chars, split by sentences
                    start = 0
                    while start < len(p):
                        end = min(start + chunk_size_chars, len(p))
                        chunk_part = p[start:end]
                        chunks.append({
                            "chunk_index": chunk_index,
                            "page_number": page_num,
                            "content": chunk_part,
                            "token_count": len(chunk_part.split())
                        })
                        chunk_index += 1
                        start += (chunk_size_chars - chunk_overlap_chars)
                    current_chunk = ""

        if current_chunk:
            chunks.append({
                "chunk_index": chunk_index,
                "page_number": page_num,
                "content": current_chunk,
                "token_count": len(current_chunk.split())
            })
            chunk_index += 1

    return chunks


async def process_document_pipeline(document_id: str, db: AsyncSession):
    """
    Asynchronous document ingestion pipeline:
    1. Status -> PROCESSING
    2. Extract PDF text page-by-page
    3. Generate semantic chunks
    4. Status -> INDEXING
    5. Generate vector embeddings
    6. Store chunks & embeddings in pgvector
    7. Status -> READY
    """
    try:
        # Fetch document
        stmt = select(Document).where(Document.id == document_id)
        result = await db.execute(stmt)
        doc = result.scalar_one_or_none()

        if not doc:
            logger.error(f"Document {document_id} not found for processing.")
            return

        # 1. Update to PROCESSING
        doc.status = DocumentStatus.PROCESSING.value
        await db.commit()
        await db.refresh(doc)
        logger.info(f"Processing started for document: {doc.title} ({doc.id})")

        # 2. Extract text
        pages_data = extract_text_from_pdf(doc.file_path)
        doc.total_pages = len(pages_data)

        # 3. Chunk text
        chunks_data = chunk_document_pages(pages_data)
        doc.total_chunks = len(chunks_data)

        # 4. Update to INDEXING
        doc.status = DocumentStatus.INDEXING.value
        await db.commit()
        await db.refresh(doc)
        logger.info(f"Generating embeddings for {len(chunks_data)} chunks...")

        # 5. Generate vector embeddings in batch
        chunk_texts = [c["content"] for c in chunks_data]
        embeddings = await get_embeddings(chunk_texts)

        # 6. Save chunks to database
        for i, c in enumerate(chunks_data):
            chunk_obj = DocumentChunk(
                document_id=doc.id,
                chunk_index=c["chunk_index"],
                page_number=c["page_number"],
                content=c["content"],
                token_count=c["token_count"],
                embedding=embeddings[i]
            )
            db.add(chunk_obj)

        # 7. Update to READY
        doc.status = DocumentStatus.READY.value
        await db.commit()
        logger.info(f"Document {doc.title} successfully indexed with {len(chunks_data)} vectors in pgvector!")

    except Exception as e:
        logger.exception(f"Error processing document {document_id}: {e}")
        try:
            doc.status = DocumentStatus.FAILED.value
            doc.error_message = str(e)
            await db.commit()
        except Exception:
            pass
