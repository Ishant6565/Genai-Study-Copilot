from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class StartInterviewRequest(BaseModel):
    role_title: str = Field(default="Senior GenAI Engineer")
    track: str = Field(default="GenAI & RAG")
    seniority: str = Field(default="Senior")
    interview_type: str = Field(default="Technical")
    total_questions: int = Field(default=5, ge=3, le=10)
    job_description: Optional[str] = None


class InterviewQuestionResponse(BaseModel):
    id: str
    question_order: int
    question_text: str
    category: str
    difficulty: str
    ideal_answer: Optional[str] = None
    candidate_answer: Optional[str] = None
    feedback: Optional[str] = None
    score: Optional[float] = None
    follow_up_question: Optional[str] = None
    follow_up_answer: Optional[str] = None

    class Config:
        from_attributes = True


class InterviewEvaluationResponse(BaseModel):
    id: str
    session_id: str
    overall_score: float
    hiring_verdict: str
    technical_depth_score: float
    communication_score: float
    problem_solving_score: float
    edge_case_score: float
    strengths: List[str] = []
    areas_to_improve: List[str] = []
    summary: str
    created_at: datetime

    class Config:
        from_attributes = True


class InterviewSessionResponse(BaseModel):
    id: str
    role_title: str
    track: str
    seniority: str
    interview_type: str
    total_questions: int
    current_question_index: int
    status: str
    created_at: datetime
    questions: List[InterviewQuestionResponse] = []
    evaluation: Optional[InterviewEvaluationResponse] = None

    class Config:
        from_attributes = True


class SubmitAnswerRequest(BaseModel):
    question_id: str
    answer_text: str
    is_follow_up: bool = False


class SubmitAnswerResponse(BaseModel):
    question_id: str
    recorded_answer: str
    has_follow_up: bool = False
    follow_up_question: Optional[str] = None
    is_session_complete: bool = False
    next_question_index: int


class GenerateFollowUpRequest(BaseModel):
    question_id: str
    answer_text: str
