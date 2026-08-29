from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


# Document Schemas
class DocumentChunkResponse(BaseModel):
    id: str
    chunk_index: int
    page_number: int
    content: str
    token_count: int

    class Config:
        from_attributes = True


class DocumentResponse(BaseModel):
    id: str
    title: str
    filename: str
    file_size_bytes: int
    total_pages: int
    total_chunks: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentUploadResponse(BaseModel):
    message: str
    document: DocumentResponse


# Chat & RAG Schemas
class CitationItem(BaseModel):
    document_id: str
    document_title: str
    page_number: int
    snippet: str
    similarity_score: float = 0.0


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_id: Optional[str] = None
    document_id: Optional[str] = None


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    citations: List[CitationItem] = []
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    conversation_id: str
    message: MessageResponse


# Study Tools Schemas
class SummaryRequest(BaseModel):
    document_id: str


class DefinitionItem(BaseModel):
    term: str
    definition: str


class SummaryResponse(BaseModel):
    id: str
    document_id: str
    title: str
    quick_summary: str
    detailed_summary: str
    key_concepts: List[str] = []
    definitions: List[DefinitionItem] = []
    created_at: datetime

    class Config:
        from_attributes = True


class QuizQuestionItem(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_answer: int
    explanation: str


class QuizRequest(BaseModel):
    document_id: str
    difficulty: Optional[str] = "Medium"


class QuizResponse(BaseModel):
    id: str
    document_id: str
    title: str
    difficulty: str
    total_questions: int
    questions: List[QuizQuestionItem]
    created_at: datetime

    class Config:
        from_attributes = True


class QuizSubmitAnswer(BaseModel):
    question_id: int
    selected_option: int


class QuizSubmitRequest(BaseModel):
    answers: List[QuizSubmitAnswer]


class QuizResultResponse(BaseModel):
    quiz_id: str
    total_questions: int
    correct_count: int
    score_percentage: float
    feedback: str
    details: List[Dict[str, Any]]


class FlashcardRequest(BaseModel):
    document_id: str


class FlashcardItem(BaseModel):
    id: str
    document_id: str
    front: str
    back: str
    category: str
    difficulty: str
    created_at: datetime

    class Config:
        from_attributes = True
