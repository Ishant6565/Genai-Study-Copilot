from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.interview import InterviewSession
from app.schemas.interview import (
    StartInterviewRequest,
    InterviewSessionResponse,
    SubmitAnswerRequest,
    SubmitAnswerResponse,
    InterviewEvaluationResponse
)
from app.services.interview_service import (
    create_interview_session,
    submit_candidate_answer,
    generate_interview_evaluation
)

router = APIRouter(prefix="/interviews", tags=["AI Mock Interviews"])


@router.post("/start", response_model=InterviewSessionResponse)
async def start_interview(request: StartInterviewRequest, db: AsyncSession = Depends(get_db)):
    """Initialize a new AI Voice Mock Interview session."""
    try:
        session = await create_interview_session(
            db=db,
            role_title=request.role_title,
            track=request.track,
            seniority=request.seniority,
            interview_type=request.interview_type,
            total_questions=request.total_questions,
            job_description=request.job_description
        )
        return session
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{session_id}", response_model=InterviewSessionResponse)
async def get_interview_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """Get active interview session details and questions."""
    result = await db.execute(
        select(InterviewSession)
        .options(
            selectinload(InterviewSession.questions),
            selectinload(InterviewSession.evaluation)
        )
        .where(InterviewSession.id == session_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    return session


@router.post("/{session_id}/answer", response_model=SubmitAnswerResponse)
async def submit_answer(
    session_id: str,
    request: SubmitAnswerRequest,
    db: AsyncSession = Depends(get_db)
):
    """Submit candidate response (from speech recognition or text) to question."""
    try:
        q_obj, is_complete, next_idx = await submit_candidate_answer(
            db=db,
            session_id=session_id,
            question_id=request.question_id,
            answer_text=request.answer_text,
            is_follow_up=request.is_follow_up
        )
        return SubmitAnswerResponse(
            question_id=q_obj.id,
            recorded_answer=request.answer_text,
            has_follow_up=bool(q_obj.follow_up_question and not request.is_follow_up),
            follow_up_question=q_obj.follow_up_question if not request.is_follow_up else None,
            is_session_complete=is_complete,
            next_question_index=next_idx
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{session_id}/evaluate", response_model=InterviewEvaluationResponse)
async def evaluate_interview(session_id: str, db: AsyncSession = Depends(get_db)):
    """Generate final comprehensive hiring evaluation scorecard."""
    try:
        evaluation = await generate_interview_evaluation(db, session_id)
        return evaluation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=List[InterviewSessionResponse])
async def list_interview_history(db: AsyncSession = Depends(get_db)):
    """List previous mock interviews and scores."""
    result = await db.execute(
        select(InterviewSession)
        .options(
            selectinload(InterviewSession.questions),
            selectinload(InterviewSession.evaluation)
        )
        .order_by(desc(InterviewSession.created_at))
    )
    return result.scalars().all()
