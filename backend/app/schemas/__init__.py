from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
from app.schemas.document import DocumentResponse, DocumentDetailResponse, DocumentChunkResponse, DocumentUploadResponse
from app.schemas.chat import ChatRequest, ChatResponse, MessageResponse, ConversationResponse, ConversationSummaryResponse, CitationItem
from app.schemas.study import (
    SummaryRequest, SummaryResponse, DefinitionItem,
    QuizRequest, QuizResponse, QuizQuestionItem, QuizSubmitRequest, QuizResultResponse,
    FlashcardRequest, FlashcardItem, FlashcardListResponse
)
from app.schemas.metrics import MetricItemResponse, MetricsSummaryResponse

__all__ = [
    "UserRegister", "UserLogin", "Token", "UserResponse",
    "DocumentResponse", "DocumentDetailResponse", "DocumentChunkResponse", "DocumentUploadResponse",
    "ChatRequest", "ChatResponse", "MessageResponse", "ConversationResponse", "ConversationSummaryResponse", "CitationItem",
    "SummaryRequest", "SummaryResponse", "DefinitionItem",
    "QuizRequest", "QuizResponse", "QuizQuestionItem", "QuizSubmitRequest", "QuizResultResponse",
    "FlashcardRequest", "FlashcardItem", "FlashcardListResponse",
    "MetricItemResponse", "MetricsSummaryResponse"
]
