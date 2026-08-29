import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class Summary(Base):
    __tablename__ = "summaries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(String, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    
    quick_summary = Column(Text, nullable=False)
    detailed_summary = Column(Text, nullable=False)
    key_concepts = Column(JSON, default=list)  # list of concept strings or objects
    definitions = Column(JSON, default=list)   # list of { "term": "...", "definition": "..." }
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="summaries")
    document = relationship("Document", back_populates="summaries")


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(String, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    difficulty = Column(String, default="Medium")  # Easy, Medium, Hard
    
    # List of questions: [{ "id": 1, "question": "...", "options": ["A", "B", "C", "D"], "correct_answer": 0, "explanation": "..." }]
    questions = Column(JSON, nullable=False, default=list)
    total_questions = Column(Integer, default=5)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="quizzes")
    document = relationship("Document", back_populates="quizzes")


class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(String, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    
    front = Column(Text, nullable=False)
    back = Column(Text, nullable=False)
    category = Column(String, default="General")
    difficulty = Column(String, default="Medium")  # Easy, Medium, Hard
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="flashcards")
    document = relationship("Document", back_populates="flashcards")
