from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.models.study import Summary, Quiz, Flashcard
from app.schemas import (
    SummaryRequest, SummaryResponse,
    QuizRequest, QuizResponse, QuizSubmitRequest, QuizResultResponse,
    FlashcardRequest, FlashcardItem, DefinitionItem, QuizQuestionItem
)
from app.services.study_service import (
    generate_summary_for_document,
    generate_quiz_for_document,
    evaluate_quiz_submission,
    generate_flashcards_for_document
)

router = APIRouter(prefix="/study", tags=["Study Tools"])

DEFAULT_USER_ID = "default_user_001"


@router.post("/summaries", response_model=SummaryResponse)
async def create_summary(request: SummaryRequest, db: AsyncSession = Depends(get_db)):
    """Generate executive summary for a document."""
    try:
        summary_obj = await generate_summary_for_document(db, DEFAULT_USER_ID, request.document_id)
        return SummaryResponse(
            id=summary_obj.id,
            document_id=summary_obj.document_id,
            title=summary_obj.title,
            quick_summary=summary_obj.quick_summary,
            detailed_summary=summary_obj.detailed_summary,
            key_concepts=summary_obj.key_concepts or [],
            definitions=[DefinitionItem(**d) for d in (summary_obj.definitions or [])],
            created_at=summary_obj.created_at
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/quizzes", response_model=QuizResponse)
async def create_quiz(request: QuizRequest, db: AsyncSession = Depends(get_db)):
    """Generate multiple-choice quiz questions from a document."""
    try:
        quiz_obj = await generate_quiz_for_document(db, DEFAULT_USER_ID, request.document_id, request.difficulty or "Medium")
        return QuizResponse(
            id=quiz_obj.id,
            document_id=quiz_obj.document_id,
            title=quiz_obj.title,
            difficulty=quiz_obj.difficulty,
            total_questions=quiz_obj.total_questions,
            questions=[QuizQuestionItem(**q) for q in (quiz_obj.questions or [])],
            created_at=quiz_obj.created_at
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/quizzes/{quiz_id}/submit", response_model=QuizResultResponse)
async def submit_quiz(quiz_id: str, request: QuizSubmitRequest, db: AsyncSession = Depends(get_db)):
    """Submit quiz answers and get score with explanations."""
    result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz_obj = result.scalar_one_or_none()
    if not quiz_obj:
        raise HTTPException(status_code=404, detail="Quiz not found")

    answers_dict = {a.question_id: a.selected_option for a in request.answers}
    eval_result = evaluate_quiz_submission(quiz_obj, answers_dict)
    return eval_result


@router.post("/flashcards", response_model=List[FlashcardItem])
async def create_flashcards(request: FlashcardRequest, db: AsyncSession = Depends(get_db)):
    """Generate 3D flashcard decks from a document."""
    try:
        cards = await generate_flashcards_for_document(db, DEFAULT_USER_ID, request.document_id)
        return [
            FlashcardItem(
                id=c.id,
                document_id=c.document_id,
                front=c.front,
                back=c.back,
                category=c.category,
                difficulty=c.difficulty,
                created_at=c.created_at
            )
            for c in cards
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
