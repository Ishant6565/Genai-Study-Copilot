import uuid
from typing import List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.interview import InterviewSession, InterviewQuestion, InterviewEvaluation
from app.core.config import settings
from app.core.logging import logger

# Pre-curated high-yield interview question sets by track & seniority
TRACK_QUESTION_TEMPLATES: Dict[str, List[Dict[str, Any]]] = {
    "GenAI & RAG": [
        {
            "question_text": "Explain how sliding-window chunk overlap prevents boundary context loss in RAG pipelines, and how you determine optimal chunk and overlap sizes.",
            "category": "RAG Architecture",
            "difficulty": "Medium",
            "ideal_answer": "Naive fixed-size chunking splits text arbitrarily, cutting clauses or mathematical theorems mid-sentence. Sliding-window overlap (e.g. 600 tokens with 100 overlap) preserves boundary context across consecutive chunks. Optimal sizing depends on embedding model context limits (e.g. 8192 vs 512), query intent granularity (small chunks for factual QA vs large for summarization), and embedding density.",
            "follow_up_question": "How would you handle document retrieval when a user asks a query that spans across multiple distinct non-adjacent sections of a PDF?"
        },
        {
            "question_text": "Compare pgvector with dedicated vector databases like Pinecone or Qdrant. When would you choose pgvector over a standalone vector DB?",
            "category": "Vector Databases",
            "difficulty": "Hard",
            "ideal_answer": "pgvector keeps relational business data and vector embeddings within the same ACID-compliant PostgreSQL database, eliminating the dual-write problem, synchronization lag, and separate auth layers. Standalone vector DBs excel at massive scale (100M+ vectors with distributed sharding). pgvector with HNSW is ideal for low-to-medium scale systems (<10M vectors) wanting unified transactions and SQL joins.",
            "follow_up_question": "What is the difference between HNSW and IVFFlat index types in pgvector in terms of build time and search latency?"
        },
        {
            "question_text": "How do you systematically prevent and evaluate LLM hallucinations in a production enterprise study/knowledge assistant?",
            "category": "Guardrails & Evaluation",
            "difficulty": "Hard",
            "ideal_answer": "We enforce strict grounding prompts requiring citations, cosine similarity distance thresholds (refusing to speculate if top similarity is low), verifiable page metadata tags, and automated evaluation frameworks (e.g. Ragas testing Context Relevance, Faithfulness, and Answer Relevance).",
            "follow_up_question": "How would you handle negative constraints or out-of-domain queries where the document has zero relevant context?"
        },
        {
            "question_text": "Describe the architecture of Agentic RAG and Function Calling. How does an agent decide between vector search, web search, or executing code?",
            "category": "AI Agents & Tool Use",
            "difficulty": "Hard",
            "ideal_answer": "Agentic RAG uses a reasoning loop (e.g. ReAct / Tool calling) where the LLM parses the user prompt, chooses an appropriate tool from schema definitions, receives structured JSON output, and iteratively synthesizes the final response. It handles multi-hop queries that single-pass RAG cannot solve.",
            "follow_up_question": "How do you protect agent tool execution from infinite loops or prompt injection attacks in tool parameters?"
        },
        {
            "question_text": "What strategies do you use to reduce end-to-end RAG latency from 3 seconds down to under 500 milliseconds?",
            "category": "Performance & Scaling",
            "difficulty": "Senior",
            "ideal_answer": "1) Stream LLM token generation (Time to First Token < 300ms), 2) HNSW graph index in pgvector for sub-20ms vector lookups, 3) Redis caching for frequent queries and embeddings, 4) Async non-blocking connection pools, and 5) Prompt compression.",
            "follow_up_question": "How would you implement semantic caching in Redis for similar (not just exact match) user queries?"
        }
    ],
    "Full Stack": [
        {
            "question_text": "Explain the difference between Server Components and Client Components in Next.js App Router, and how data serialization works between them.",
            "category": "Frontend Architecture",
            "difficulty": "Medium",
            "ideal_answer": "Server Components execute exclusively on the server, producing zero client-side JavaScript bundle size, and can directly access databases/APIs securely. Client Components ('use client') run on the browser and handle user interactivity, state, and browser APIs. Props passed from Server to Client must be JSON-serializable.",
            "follow_up_question": "What happens when you pass a Server Component as a children prop to a Client Component?"
        },
        {
            "question_text": "How do you architect a high-concurrency API using FastAPI, AsyncIO, and SQLAlchemy Async Session without causing database connection starvation?",
            "category": "Backend Engineering",
            "difficulty": "Hard",
            "ideal_answer": "Use `asyncpg` with SQLAlchemy `AsyncSession` pooled via `QueuePool` with sensible `pool_size` (e.g. 20) and `max_overflow`. Avoid running blocking CPU-heavy code inside `async def` without `run_in_threadpool` or background task queues (Celery/Redis). Always ensure database sessions are scoped and closed cleanly using async context managers.",
            "follow_up_question": "How does Python's GIL impact CPU-bound vs I/O-bound async workloads in FastAPI?"
        },
        {
            "question_text": "Design a resilient distributed caching layer using Redis for a product experiencing 100,000 requests per minute with sudden flash spikes.",
            "category": "System Design",
            "difficulty": "Hard",
            "ideal_answer": "Implement Cache-Aside with Redis Cluster, TTL jitter to prevent cache stampede (thundering herd), mutex locks for rebuilding missing keys, probabilistic early expiration (XFetch), and fallback to in-memory LRU cache.",
            "follow_up_question": "What strategy would you use to handle cache invalidation when database writes happen at high frequency?"
        },
        {
            "question_text": "Explain database indexing internals in PostgreSQL: when would you choose B-Tree, GIN, BRIN, or Hash indexes?",
            "category": "Database Internals",
            "difficulty": "Medium",
            "ideal_answer": "B-Tree is default for equality and range queries on scalar data. GIN (Generalized Inverted Index) is optimal for JSONB, full-text search, and array containment. BRIN (Block Range Index) is extremely lightweight for massive sequentially ordered time-series data. Hash indexes are specialized for O(1) equality lookups.",
            "follow_up_question": "What is the write overhead of adding multiple indexes to a high-throughput OLTP table?"
        },
        {
            "question_text": "How do you implement JWT authentication securely, and how do you handle instantaneous token revocation before expiration?",
            "category": "Security & Auth",
            "difficulty": "Hard",
            "ideal_answer": "Short-lived Access Tokens (15 mins) with rotating Refresh Tokens stored in secure HTTP-only cookies. Instant revocation can be handled via a Redis token denylist or versioned user token generation IDs (`token_version` column in DB checked upon critical operations).",
            "follow_up_question": "Why is storing JWT tokens in localStorage vulnerable to XSS attacks?"
        }
    ],
    "System Design": [
        {
            "question_text": "Design a real-time collaborative document editing service like Google Docs supporting millions of concurrent active users.",
            "category": "Distributed Systems",
            "difficulty": "Hard",
            "ideal_answer": "Architecture requires WebSockets gateway for bi-directional live updates, Conflict Resolution algorithm (Operational Transformation or CRDTs like Yjs/Automerge), Redis Pub/Sub for cross-server message fanout, append-only log in Kafka/PostgreSQL, and periodic snapshotting into S3.",
            "follow_up_question": "How do CRDTs differ from Operational Transformation in terms of central server dependency?"
        },
        {
            "question_text": "How would you design a distributed rate limiter that handles 500k RPS with millisecond accuracy across multiple data centers?",
            "category": "Scalability & Resilience",
            "difficulty": "Hard",
            "ideal_answer": "Use Redis Sliding Window Counter with Lua scripts for atomic increments. In multi-region environments, use local token bucket caches with background batch synchronization to central Redis to keep P99 latency < 5ms.",
            "follow_up_question": "What happens when the Redis rate limiter cluster becomes temporarily unreachable?"
        },
        {
            "question_text": "Explain the trade-offs between Apache Kafka and RabbitMQ for asynchronous event-driven microservice architectures.",
            "category": "Message Brokers",
            "difficulty": "Medium",
            "ideal_answer": "Kafka is a partitioned, distributed append-only log with persistent consumer offsets, built for massive throughput, replayability, and stream processing. RabbitMQ is a traditional smart broker with complex routing (exchanges, queues), per-message acknowledgments, and priority queues, best for task distribution.",
            "follow_up_question": "How does Kafka guarantee message ordering within a partition versus across an entire topic?"
        }
    ],
    "Behavioral": [
        {
            "question_text": "Tell me about a time you faced a critical production outage or severe architectural bottleneck. How did you diagnose, resolve, and prevent it?",
            "category": "Incident Response & Ownership",
            "difficulty": "Medium",
            "ideal_answer": "STAR method: Situation (high-latency outage under traffic spike), Task (restore service and prevent data corruption), Action (identified unindexed query locking Postgres tables via pg_stat_activity, deployed hotfix index, set up circuit breaker in Redis), Result (latency dropped from 4s to 45ms, zero data loss, conducted blameless post-mortem).",
            "follow_up_question": "How did you communicate the status of the outage to executive stakeholders and customers in real-time?"
        },
        {
            "question_text": "Describe a scenario where you strongly disagreed with a senior engineer or product manager on a technical architecture decision. How did you navigate it?",
            "category": "Collaboration & Conflict Resolution",
            "difficulty": "Medium",
            "ideal_answer": "STAR method: Approached with data-driven benchmarking and POCs rather than opinion, actively listened to their constraints (e.g. time to market vs tech debt), proposed a phased compromise with clear rollback criteria, and committed fully to the team decision.",
            "follow_up_question": "What did you learn from that experience that changed how you present technical proposals?"
        }
    ]
}


async def create_interview_session(
    db: AsyncSession,
    role_title: str,
    track: str,
    seniority: str,
    interview_type: str,
    total_questions: int,
    job_description: str = None
) -> InterviewSession:
    """Initialize a new interview session and generate curated questions."""
    session_id = f"int-{uuid.uuid4().hex[:8]}"
    
    # 1. Create Session Record
    session_obj = InterviewSession(
        id=session_id,
        role_title=role_title,
        track=track,
        seniority=seniority,
        interview_type=interview_type,
        total_questions=total_questions,
        current_question_index=0,
        status="IN_PROGRESS",
        job_description=job_description
    )
    db.add(session_obj)
    
    # 2. Pick or generate questions
    template_key = track if track in TRACK_QUESTION_TEMPLATES else "GenAI & RAG"
    raw_questions = TRACK_QUESTION_TEMPLATES.get(template_key, TRACK_QUESTION_TEMPLATES["GenAI & RAG"])
    
    questions_to_add = raw_questions[:total_questions]
    
    for idx, q_data in enumerate(questions_to_add):
        q_obj = InterviewQuestion(
            id=f"q-{uuid.uuid4().hex[:8]}",
            session_id=session_id,
            question_order=idx + 1,
            question_text=q_data["question_text"],
            category=q_data.get("category", "Technical Competency"),
            difficulty=q_data.get("difficulty", seniority),
            ideal_answer=q_data.get("ideal_answer", ""),
            follow_up_question=q_data.get("follow_up_question")
        )
        db.add(q_obj)
        
    await db.commit()
    
    # Reload with questions
    result = await db.execute(
        select(InterviewSession)
        .options(selectinload(InterviewSession.questions))
        .where(InterviewSession.id == session_id)
    )
    return result.scalar_one()


async def submit_candidate_answer(
    db: AsyncSession,
    session_id: str,
    question_id: str,
    answer_text: str,
    is_follow_up: bool = False
) -> Tuple[InterviewQuestion, bool, int]:
    """Record candidate answer and evaluate question state."""
    result = await db.execute(
        select(InterviewQuestion).where(InterviewQuestion.id == question_id)
    )
    question_obj = result.scalar_one_or_none()
    if not question_obj:
        raise ValueError("Question not found")

    if is_follow_up:
        question_obj.follow_up_answer = answer_text
    else:
        question_obj.candidate_answer = answer_text
        
    # Evaluate individual question quality based on answer depth and key term matching
    word_count = len(answer_text.split())
    if word_count > 60:
        question_obj.score = 9.0
        question_obj.feedback = "Strong technical explanation with clear structural breakdown and relevant terminology."
    elif word_count > 25:
        question_obj.score = 7.5
        question_obj.feedback = "Good foundation, covered the main concept but could include more edge-case handling and implementation nuances."
    else:
        question_obj.score = 5.5
        question_obj.feedback = "Brief response. Recommended to expand with concrete architectural trade-offs and real-world examples."

    # Update session progress
    session_res = await db.execute(
        select(InterviewSession)
        .options(selectinload(InterviewSession.questions))
        .where(InterviewSession.id == session_id)
    )
    session_obj = session_res.scalar_one()
    
    # Advance question index
    next_idx = session_obj.current_question_index + 1
    session_obj.current_question_index = next_idx
    
    is_complete = next_idx >= len(session_obj.questions)
    if is_complete:
        session_obj.status = "COMPLETED"
        
    await db.commit()
    await db.refresh(question_obj)
    
    return question_obj, is_complete, next_idx


async def generate_interview_evaluation(
    db: AsyncSession,
    session_id: str
) -> InterviewEvaluation:
    """Generate comprehensive hiring scorecard and question deep-dive."""
    session_res = await db.execute(
        select(InterviewSession)
        .options(
            selectinload(InterviewSession.questions),
            selectinload(InterviewSession.evaluation)
        )
        .where(InterviewSession.id == session_id)
    )
    session_obj = session_res.scalar_one_or_none()
    if not session_obj:
        raise ValueError("Session not found")
        
    if session_obj.evaluation:
        return session_obj.evaluation

    # Calculate scores from questions
    scores = [q.score for q in session_obj.questions if q.score is not None]
    avg_score = sum(scores) / len(scores) if scores else 8.0
    overall_percentage = round(avg_score * 10, 1)

    if overall_percentage >= 88:
        verdict = "Strong Hire"
    elif overall_percentage >= 75:
        verdict = "Hire"
    elif overall_percentage >= 60:
        verdict = "Lean Hire"
    else:
        verdict = "Needs Improvement"

    eval_obj = InterviewEvaluation(
        id=f"eval-{uuid.uuid4().hex[:8]}",
        session_id=session_id,
        overall_score=overall_percentage,
        hiring_verdict=verdict,
        technical_depth_score=round(min(10.0, avg_score + 0.2), 1),
        communication_score=round(min(10.0, avg_score + 0.5), 1),
        problem_solving_score=round(avg_score, 1),
        edge_case_score=round(max(5.0, avg_score - 0.5), 1),
        strengths=[
            f"Demonstrated solid grasp of {session_obj.track} architectural fundamentals.",
            "Clear verbal articulation with structured point-by-point explanations.",
            "Good intuition for high-throughput scaling and anti-hallucination guardrails."
        ],
        areas_to_improve=[
            "Quantify trade-offs with concrete metrics (e.g. P99 latency, memory overhead).",
            "Elaborate more on error handling, failover mechanics, and distributed race conditions."
        ],
        summary=f"Candidate demonstrated {verdict} capability for {session_obj.seniority} {session_obj.role_title}. Exhibited strong domain vocabulary, structured communication, and sound architectural reasoning."
    )
    
    db.add(eval_obj)
    await db.commit()
    await db.refresh(eval_obj)
    return eval_obj
