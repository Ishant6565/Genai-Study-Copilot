from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DocumentChunkResponse(BaseModel):
    id: str
    chunk_index: int
    page_number: int
    content: str
    token_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentResponse(BaseModel):
    id: str
    title: str
    filename: str
    file_size_bytes: int
    file_type: str
    total_pages: int
    total_chunks: int
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DocumentDetailResponse(DocumentResponse):
    chunks: List[DocumentChunkResponse] = []


class DocumentUploadResponse(BaseModel):
    message: str
    document: DocumentResponse
