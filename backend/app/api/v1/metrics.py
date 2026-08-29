from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.metrics import RAGMetric
from app.schemas.metrics import MetricsSummaryResponse, MetricItemResponse

router = APIRouter(prefix="/metrics", tags=["RAG Observability & Metrics"])


@router.get("/overview", response_model=MetricsSummaryResponse)
async def get_metrics_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve aggregate RAG latency, token usage, and accuracy metrics for observability."""
    # 1. Total documents & chunks
    doc_count_stmt = select(func.count(Document.id)).where(Document.user_id == current_user.id)
    doc_count_res = await db.execute(doc_count_stmt)
    total_docs = doc_count_res.scalar() or 0

    chunk_count_stmt = (
        select(func.count(DocumentChunk.id))
        .join(Document, DocumentChunk.document_id == Document.id)
        .where(Document.user_id == current_user.id)
    )
    chunk_count_res = await db.execute(chunk_count_stmt)
    total_chunks = chunk_count_res.scalar() or 0

    # 2. Fetch all user metrics
    metric_stmt = (
        select(RAGMetric)
        .where(RAGMetric.user_id == current_user.id)
        .order_by(RAGMetric.created_at.desc())
    )
    metric_res = await db.execute(metric_stmt)
    all_metrics = metric_res.scalars().all()

    total_queries = len(all_metrics)
    if total_queries == 0:
        return MetricsSummaryResponse(
            total_queries=0,
            avg_total_latency_ms=0.0,
            avg_retrieval_latency_ms=0.0,
            avg_generation_latency_ms=0.0,
            total_prompt_tokens=0,
            total_completion_tokens=0,
            success_rate_percentage=100.0,
            total_documents=total_docs,
            total_chunks=total_chunks,
            recent_metrics=[]
        )

    avg_total_lat = sum(m.total_latency_ms for m in all_metrics) / total_queries
    avg_retrieval_lat = sum(m.retrieval_latency_ms for m in all_metrics) / total_queries
    avg_gen_lat = sum(m.generation_latency_ms for m in all_metrics) / total_queries
    total_prompt_tok = sum(m.prompt_tokens for m in all_metrics)
    total_comp_tok = sum(m.completion_tokens for m in all_metrics)
    success_count = sum(1 for m in all_metrics if m.status == "SUCCESS")
    success_pct = round((success_count / total_queries) * 100.0, 1)

    return MetricsSummaryResponse(
        total_queries=total_queries,
        avg_total_latency_ms=round(avg_total_lat, 2),
        avg_retrieval_latency_ms=round(avg_retrieval_lat, 2),
        avg_generation_latency_ms=round(avg_gen_lat, 2),
        total_prompt_tokens=total_prompt_tok,
        total_completion_tokens=total_comp_tok,
        success_rate_percentage=success_pct,
        total_documents=total_docs,
        total_chunks=total_chunks,
        recent_metrics=all_metrics[:10]
    )


@router.get("/recent", response_model=List[MetricItemResponse])
async def get_recent_metrics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get the 25 most recent RAG query metrics."""
    stmt = (
        select(RAGMetric)
        .where(RAGMetric.user_id == current_user.id)
        .order_by(RAGMetric.created_at.desc())
        .limit(25)
    )
    result = await db.execute(stmt)
    return result.scalars().all()
