from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class MetricItemResponse(BaseModel):
    id: str
    query: str
    retrieval_latency_ms: float
    generation_latency_ms: float
    total_latency_ms: float
    top_k_chunks: int
    avg_similarity_score: float
    prompt_tokens: int
    completion_tokens: int
    model_name: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class MetricsSummaryResponse(BaseModel):
    total_queries: int
    avg_total_latency_ms: float
    avg_retrieval_latency_ms: float
    avg_generation_latency_ms: float
    total_prompt_tokens: int
    total_completion_tokens: int
    success_rate_percentage: float
    total_documents: int
    total_chunks: int
    recent_metrics: List[MetricItemResponse] = []
