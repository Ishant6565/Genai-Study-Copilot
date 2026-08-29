import os
import uuid
import shutil
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.core.database import get_db, AsyncSessionLocal
from app.core.security import get_current_user
from app.core.config import settings
from app.core.logging import logger
from app.models.user import User
from app.models.document import Document, DocumentStatus
from app.models.document_chunk import DocumentChunk
from app.schemas.document import DocumentResponse, DocumentDetailResponse, DocumentChunkResponse, DocumentUploadResponse
from app.services.document_service import process_document_pipeline

router = APIRouter(prefix="/documents", tags=["Documents"])


async def run_async_document_task(document_id: str):
    """Background execution runner with fresh database session."""
    async with AsyncSessionLocal() as session:
        try:
            await process_document_pipeline(document_id, session)
        except Exception as e:
            logger.exception(f"Background document processing error: {e}")


@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload a study document (PDF), validate format, and trigger asynchronous ingestion.
    """
    # 1. Validate file extension
    filename = file.filename or "uploaded_study_document.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF documents (.pdf) are supported currently."
        )

    # 2. Save file to disk
    file_id = str(uuid.uuid4())
    clean_filename = f"{file_id}_{filename.replace(' ', '_')}"
    file_path = os.path.join(settings.UPLOAD_DIR, clean_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        file_size = os.path.getsize(file_path)
    except Exception as e:
        logger.error(f"File save error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save uploaded file."
        )

    # 3. Create document record
    doc_title = os.path.splitext(filename)[0].replace("_", " ").replace("-", " ").title()
    doc = Document(
        id=file_id,
        user_id=current_user.id,
        title=doc_title,
        filename=filename,
        file_path=file_path,
        file_size_bytes=file_size,
        file_type="application/pdf",
        status=DocumentStatus.UPLOADING.value
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    # 4. Enqueue background ingestion (PDF text extraction, recursive chunking, embedding generation)
    background_tasks.add_task(run_async_document_task, doc.id)

    return {
        "message": "Document uploaded successfully. Processing and vector indexing started in background.",
        "document": doc
    }


@router.get("", response_model=List[DocumentResponse])
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all documents uploaded by the authenticated user."""
    stmt = select(Document).where(Document.user_id == current_user.id).order_by(Document.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get single document details and processing status."""
    stmt = select(Document).where(and_(Document.id == document_id, Document.user_id == current_user.id))
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")
    return doc


@router.get("/{document_id}/chunks", response_model=List[DocumentChunkResponse])
async def get_document_chunks(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all indexed chunks and page numbers for a document."""
    # Verify ownership
    doc_stmt = select(Document).where(and_(Document.id == document_id, Document.user_id == current_user.id))
    doc_res = await db.execute(doc_stmt)
    if not doc_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    chunk_stmt = (
        select(DocumentChunk)
        .where(DocumentChunk.document_id == document_id)
        .order_by(DocumentChunk.chunk_index)
    )
    chunk_res = await db.execute(chunk_stmt)
    return chunk_res.scalars().all()


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a document and purge all associated vector embeddings."""
    stmt = select(Document).where(and_(Document.id == document_id, Document.user_id == current_user.id))
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    # Remove physical file if exists
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception as e:
            logger.warning(f"Could not delete physical file: {e}")

    await db.delete(doc)
    await db.commit()
    return None
