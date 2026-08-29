from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.conversation import Conversation, Message
from app.schemas import ChatRequest, ChatResponse, ConversationResponse, MessageResponse, CitationItem
from app.services.rag_service import execute_rag_chat

router = APIRouter(prefix="/chat", tags=["Chat & RAG"])

DEFAULT_USER_ID = "default_user_001"


@router.post("", response_model=ChatResponse)
async def chat_rag(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Ask questions grounded in the PDF document."""
    try:
        conv_id, message_resp = await execute_rag_chat(
            db=db,
            user_id=DEFAULT_USER_ID,
            message_text=request.message,
            conversation_id=request.conversation_id,
            document_id=request.document_id
        )
        return ChatResponse(conversation_id=conv_id, message=message_resp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations", response_model=List[ConversationResponse])
async def list_conversations(db: AsyncSession = Depends(get_db)):
    """List recent conversation history."""
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .order_by(desc(Conversation.updated_at))
    )
    conversations = result.scalars().all()
    
    response = []
    for conv in conversations:
        msgs = [
            MessageResponse(
                id=m.id,
                role=m.role,
                content=m.content,
                citations=[CitationItem(**c) for c in (m.citations or [])],
                created_at=m.created_at
            )
            for m in conv.messages
        ]
        response.append(
            ConversationResponse(
                id=conv.id,
                title=conv.title,
                created_at=conv.created_at,
                messages=msgs
            )
        )
    return response


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(conversation_id: str, db: AsyncSession = Depends(get_db)):
    """Get single conversation by ID."""
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(Conversation.id == conversation_id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    msgs = [
        MessageResponse(
            id=m.id,
            role=m.role,
            content=m.content,
            citations=[CitationItem(**c) for c in (m.citations or [])],
            created_at=m.created_at
        )
        for m in conv.messages
    ]
    return ConversationResponse(
        id=conv.id,
        title=conv.title,
        created_at=conv.created_at,
        messages=msgs
    )


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a conversation session."""
    result = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    await db.delete(conv)
    await db.commit()
    return {"message": "Conversation deleted successfully"}
