from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


class CitationItem(BaseModel):
    document_id: str
    document_title: str
    page_number: int
    chunk_id: Optional[str] = None
    snippet: str
    similarity_score: float = 0.0


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_id: Optional[str] = None
    document_id: Optional[str] = None  # Scoped to specific document or None for all
    model: Optional[str] = "gpt-4o-mini"
    temperature: float = 0.2


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    citations: Optional[List[CitationItem]] = []
    tokens_used: Optional[Any] = None
    latency_ms: Optional[Any] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    id: str
    title: str
    document_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True


class ConversationSummaryResponse(BaseModel):
    id: str
    title: str
    document_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    conversation_id: str
    message: MessageResponse
