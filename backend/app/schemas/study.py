from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# Summary Schemas
class SummaryRequest(BaseModel):
    document_id: str
    focus_area: Optional[str] = "Comprehensive"


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


# Quiz Schemas
class QuizQuestionItem(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_answer: int  # 0-indexed option
    explanation: str


class QuizRequest(BaseModel):
    document_id: str
    title: Optional[str] = None
    num_questions: int = Field(default=5, ge=3, le=15)
    difficulty: str = Field(default="Medium")  # Easy, Medium, Hard


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


# Flashcard Schemas
class FlashcardRequest(BaseModel):
    document_id: str
    num_cards: int = Field(default=8, ge=3, le=25)
    category: Optional[str] = "Key Concepts"


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


class FlashcardListResponse(BaseModel):
    document_id: str
    flashcards: List[FlashcardItem]
