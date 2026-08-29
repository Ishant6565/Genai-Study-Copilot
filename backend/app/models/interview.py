from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), default="default_user_001", index=True)
    role_title = Column(String(128), nullable=False)
    track = Column(String(64), nullable=False)  # e.g., "GenAI Engineer", "Full Stack", "System Design"
    seniority = Column(String(32), default="Senior")  # Junior, Mid-Level, Senior, Staff
    interview_type = Column(String(32), default="Technical")  # Technical, System Design, Behavioral
    total_questions = Column(Integer, default=5)
    current_question_index = Column(Integer, default=0)
    status = Column(String(32), default="IN_PROGRESS")  # IN_PROGRESS, COMPLETED, ABANDONED
    job_description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    questions = relationship("InterviewQuestion", back_populates="session", cascade="all, delete-orphan")
    evaluation = relationship("InterviewEvaluation", back_populates="session", uselist=False, cascade="all, delete-orphan")


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(String(64), primary_key=True, index=True)
    session_id = Column(String(64), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False)
    question_order = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    category = Column(String(64), default="Core Architecture")
    difficulty = Column(String(32), default="Medium")
    ideal_answer = Column(Text, nullable=True)
    
    # Candidate Response
    candidate_answer = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)
    score = Column(Float, nullable=True)  # 1.0 - 10.0
    follow_up_question = Column(Text, nullable=True)
    follow_up_answer = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("InterviewSession", back_populates="questions")


class InterviewEvaluation(Base):
    __tablename__ = "interview_evaluations"

    id = Column(String(64), primary_key=True, index=True)
    session_id = Column(String(64), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, unique=True)
    overall_score = Column(Float, nullable=False)  # 0 - 100
    hiring_verdict = Column(String(32), nullable=False)  # "Strong Hire", "Hire", "Lean Hire", "Needs Improvement"
    technical_depth_score = Column(Float, default=8.0)  # 1 - 10
    communication_score = Column(Float, default=8.5)   # 1 - 10
    problem_solving_score = Column(Float, default=8.0) # 1 - 10
    edge_case_score = Column(Float, default=7.5)       # 1 - 10
    strengths = Column(JSON, default=list)             # List of strings
    areas_to_improve = Column(JSON, default=list)      # List of strings
    summary = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("InterviewSession", back_populates="evaluation")
