import os
import uuid
import aiofiles
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.core.config import settings
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.schemas import DocumentResponse, DocumentChunkResponse, DocumentUploadResponse
from app.services.document_service import process_document_background

router = APIRouter(prefix="/documents", tags=["Documents"])

DEFAULT_USER_ID = "default_user_001"


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload a PDF and process it for AI Study Copilot."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    doc_id = str(uuid.uuid4())
    filename = file.filename
    clean_title = os.path.splitext(filename)[0].replace("-", " ").replace("_", " ").title()
    
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, f"{doc_id}_{filename}")
    
    content = await file.read()
    file_size = len(content)

    async with aiofiles.open(file_path, "wb") as out_file:
        await out_file.write(content)

    new_doc = Document(
        id=doc_id,
        user_id=DEFAULT_USER_ID,
        title=clean_title,
        filename=filename,
        file_path=file_path,
        file_size_bytes=file_size,
        status="PROCESSING"
    )
    db.add(new_doc)
    await db.commit()
    await db.refresh(new_doc)

    background_tasks.add_task(process_document_background, doc_id, file_path)

    return DocumentUploadResponse(
        message="Document uploaded successfully. Processing text and chunks.",
        document=new_doc
    )


@router.get("", response_model=List[DocumentResponse])
async def list_documents(db: AsyncSession = Depends(get_db)):
    """List all study documents."""
    result = await db.execute(
        select(Document).order_by(desc(Document.created_at))
    )
    return result.scalars().all()


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: str, db: AsyncSession = Depends(get_db)):
    """Get single document details."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.get("/{document_id}/chunks", response_model=List[DocumentChunkResponse])
async def get_document_chunks(document_id: str, db: AsyncSession = Depends(get_db)):
    """Get chunks with page numbers for a document."""
    result = await db.execute(
        select(DocumentChunk)
        .where(DocumentChunk.document_id == document_id)
        .order_by(DocumentChunk.chunk_index)
    )
    return result.scalars().all()


@router.delete("/{document_id}")
async def delete_document(document_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a document and its chunks."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.file_path and os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    await db.delete(doc)
    await db.commit()
    return {"message": "Document deleted successfully"}
