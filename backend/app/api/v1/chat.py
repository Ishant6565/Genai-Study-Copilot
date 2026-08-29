from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.schemas.chat import (
    ChatRequest, ChatResponse, ConversationResponse,
    ConversationSummaryResponse, MessageResponse
)
from app.services.rag_service import execute_rag_query

router = APIRouter(prefix="/chat", tags=["AI Chat & RAG"])


class RenameConversationRequest(BaseModel):
    title: str


@router.post("", response_model=ChatResponse)
async def ask_study_copilot(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Query the AI Study Copilot using RAG:
    - Embeds question
    - Retrieves top-k relevant document chunks from pgvector
    - Constructs grounded prompt with strict anti-hallucination rules
    - Returns answer with verifiable inline citations and latency metrics
    """
    result = await execute_rag_query(
        query=request.message,
        user_id=current_user.id,
        conversation_id=request.conversation_id,
        document_id=request.document_id,
        db=db,
        model=request.model or "gpt-4o-mini"
    )

    return {
        "conversation_id": result["conversation_id"],
        "message": result["message"]
    }


@router.get("/conversations", response_model=List[ConversationSummaryResponse])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all previous study conversations for the user."""
    stmt = (
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
    )
    result = await db.execute(stmt)
    conversations = result.scalars().all()
    
    summary_list = []
    for conv in conversations:
        # Get count of messages
        msg_stmt = select(Message).where(Message.conversation_id == conv.id)
        msg_res = await db.execute(msg_stmt)
        msg_count = len(msg_res.scalars().all())
        
        summary_list.append(ConversationSummaryResponse(
            id=conv.id,
            title=conv.title,
            document_id=conv.document_id,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            message_count=msg_count
        ))
        
    return summary_list


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get conversation message history and citation cards."""
    stmt = select(Conversation).where(
        and_(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    conv = result.scalar_one_or_none()

    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")

    msg_stmt = select(Message).where(Message.conversation_id == conv.id).order_by(Message.created_at.asc())
    msg_res = await db.execute(msg_stmt)
    messages = msg_res.scalars().all()

    return ConversationResponse(
        id=conv.id,
        title=conv.title,
        document_id=conv.document_id,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        messages=messages
    )


@router.patch("/conversations/{conversation_id}", response_model=ConversationResponse)
async def rename_conversation(
    conversation_id: str,
    payload: RenameConversationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Rename a conversation title."""
    stmt = select(Conversation).where(
        and_(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    conv = result.scalar_one_or_none()

    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")

    conv.title = payload.title.strip() or "Untitled Chat"
    await db.commit()
    await db.refresh(conv)

    msg_stmt = select(Message).where(Message.conversation_id == conv.id).order_by(Message.created_at.asc())
    msg_res = await db.execute(msg_stmt)
    messages = msg_res.scalars().all()

    return ConversationResponse(
        id=conv.id,
        title=conv.title,
        document_id=conv.document_id,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        messages=messages
    )


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a conversation and message history."""
    stmt = select(Conversation).where(
        and_(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    conv = result.scalar_one_or_none()

    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")

    await db.delete(conv)
    await db.commit()
    return None
