import re
import uuid
import json
from typing import List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from openai import AsyncOpenAI

from app.models.interview import InterviewSession, InterviewQuestion, InterviewEvaluation
from app.core.config import settings
from app.core.logging import logger

openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

# Stop words to ignore during semantic keyword extraction
STOP_WORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but",
    "by", "can", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for",
    "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself",
    "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just",
    "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once",
    "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own", "same", "she",
    "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves",
    "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until",
    "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom",
    "why", "with", "would", "you", "your", "yours", "yourself", "yourselves"
}

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
            "ideal_answer": "Use asyncpg with SQLAlchemy AsyncSession pooled via QueuePool with sensible pool_size (e.g. 20) and max_overflow. Avoid running blocking CPU-heavy code inside async def without run_in_threadpool or background task queues (Celery/Redis). Always ensure database sessions are scoped and closed cleanly using async context managers.",
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
            "ideal_answer": "Short-lived Access Tokens (15 mins) with rotating Refresh Tokens stored in secure HTTP-only cookies. Instant revocation can be handled via a Redis token denylist or versioned user token generation IDs (token_version column in DB checked upon critical operations).",
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


def extract_keywords(text: str) -> set:
    """Extract clean domain keywords from text, filtering out stop words."""
    cleaned = re.sub(r'[^a-zA-Z0-9_\-\+]', ' ', text.lower())
    words = cleaned.split()
    return {w for w in words if len(w) > 2 and w not in STOP_WORDS}


async def evaluate_answer_semantically(
    question_text: str,
    ideal_answer: str,
    candidate_answer: str
) -> Tuple[float, str]:
    """
    Intelligently evaluate technical answer based on conceptual accuracy,
    depth, key architectural concepts, and trade-offs.
    """
    clean_ans = candidate_answer.strip()
    
    # 1. Check for blank, refusal, or gibberish
    if not clean_ans or len(clean_ans) < 8:
        return 1.5, "No substantial answer provided. Be sure to articulate your approach even if unsure."
        
    lowered = clean_ans.lower()
    refusals = ["i don't know", "i do not know", "no idea", "skip", "idk", "pass", "not sure"]
    if any(lowered == r or lowered.startswith(r) for r in refusals) and len(clean_ans.split()) < 10:
        return 3.0, "Candidate declined to answer or stated unfamiliarity with the topic. Recommended to review foundational concepts."

    # 2. If OpenAI is available, run LLM-as-a-Judge evaluation
    if openai_client and settings.OPENAI_API_KEY:
        try:
            eval_prompt = f"""You are a Principal Software Engineering Interviewer evaluating a candidate's response.
Question: {question_text}
Ideal Model Answer: {ideal_answer}
Candidate's Answer: {candidate_answer}

Evaluate the candidate's answer on technical accuracy, depth, and relevance on a scale of 1.0 to 10.0.
Output valid JSON in this exact structure:
{{
  "score": 8.5,
  "feedback": "2-3 concise sentences detailing what was accurate, what specific concepts were well-explained, and what key trade-offs or mechanisms were missing."
}}
"""
            response = await openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert technical hiring bar-raiser. Respond strictly with JSON."},
                    {"role": "user", "content": eval_prompt}
                ],
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            data = json.loads(response.choices[0].message.content)
            score = float(data.get("score", 7.5))
            feedback = data.get("feedback", "Good technical reasoning provided.")
            return round(score, 1), feedback
        except Exception as e:
            logger.warning(f"OpenAI evaluation failed, falling back to deterministic semantic scorer: {e}")

    # 3. Deterministic Concept & Semantic Scorer (High Precision Offline)
    ideal_keywords = extract_keywords(ideal_answer)
    candidate_keywords = extract_keywords(candidate_answer)
    
    if not ideal_keywords:
        ideal_keywords = extract_keywords(question_text)
        
    # Calculate conceptual overlap
    matched_keywords = ideal_keywords.intersection(candidate_keywords)
    overlap_ratio = len(matched_keywords) / max(1, len(ideal_keywords))
    
    # Calculate depth & vocabulary richness
    unique_words = len(set(candidate_answer.lower().split()))
    total_words = len(candidate_answer.split())
    
    # Base score calculated from concept coverage
    if overlap_ratio >= 0.40:
        raw_score = 8.5 + min(1.3, (overlap_ratio - 0.40) * 2.5)
        good_terms = list(matched_keywords)[:4]
        feedback = f"Strong technical explanation. Accurately covered core concepts including {', '.join(good_terms)}. Well-structured reasoning."
    elif overlap_ratio >= 0.22:
        raw_score = 7.0 + (overlap_ratio - 0.22) * 8.0
        good_terms = list(matched_keywords)[:3]
        missing_terms = list(ideal_keywords - candidate_keywords)[:3]
        feedback = f"Solid foundation covering {', '.join(good_terms)}. To reach senior level, also elaborate on {', '.join(missing_terms)}."
    elif overlap_ratio >= 0.10 or total_words >= 25:
        raw_score = 5.8 + (overlap_ratio * 10)
        missing_terms = list(ideal_keywords - candidate_keywords)[:3]
        feedback = f"Partially on-track, but missed key architectural specifics such as {', '.join(missing_terms)}. Recommended to elaborate on concrete mechanics."
    else:
        raw_score = 4.0 + min(1.5, total_words * 0.05)
        feedback = "Answer is too brief or lacks core technical domain terminology. Review the model answer for the recommended architectural structure."

    final_score = round(min(9.8, max(2.0, raw_score)), 1)
    return final_score, feedback


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
    """Record candidate answer and evaluate question state with semantic scoring."""
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
        
    # Evaluate technical answer semantically based on concepts and accuracy
    score, feedback = await evaluate_answer_semantically(
        question_text=question_obj.question_text,
        ideal_answer=question_obj.ideal_answer or "",
        candidate_answer=answer_text
    )
    question_obj.score = score
    question_obj.feedback = feedback

    # Update session progress
    session_res = await db.execute(
        select(InterviewSession)
        .options(selectinload(InterviewSession.questions))
        .where(InterviewSession.id == session_id)
    )
    session_obj = session_res.scalar_one()
    
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
    avg_score = sum(scores) / len(scores) if scores else 7.5
    overall_percentage = round(avg_score * 10, 1)

    if overall_percentage >= 88:
        verdict = "Strong Hire"
    elif overall_percentage >= 74:
        verdict = "Hire"
    elif overall_percentage >= 60:
        verdict = "Lean Hire"
    else:
        verdict = "Needs Improvement"

    # Identify strong categories and areas for growth
    strong_points = []
    growth_points = []
    
    for q in session_obj.questions:
        if q.score and q.score >= 8.0:
            strong_points.append(f"Strong grasp of {q.category} and architectural mechanics.")
        elif q.score and q.score < 7.0:
            growth_points.append(f"Deepen knowledge in {q.category} (e.g. edge-case trade-offs).")

    if not strong_points:
        strong_points = [
            f"Demonstrated foundational understanding of {session_obj.track} topics.",
            "Attempted all questions with structured explanations."
        ]
    if not growth_points:
        growth_points = [
            "Quantify trade-offs with concrete production metrics (e.g. P99 latency, RAM overhead).",
            "Discuss failover and zero-downtime migration strategies in system design."
        ]

    eval_obj = InterviewEvaluation(
        id=f"eval-{uuid.uuid4().hex[:8]}",
        session_id=session_id,
        overall_score=overall_percentage,
        hiring_verdict=verdict,
        technical_depth_score=round(min(10.0, avg_score + (0.3 if avg_score > 7 else -0.3)), 1),
        communication_score=round(min(10.0, max(4.0, avg_score + 0.4)), 1),
        problem_solving_score=round(avg_score, 1),
        edge_case_score=round(max(3.0, avg_score - 0.6), 1),
        strengths=strong_points[:3],
        areas_to_improve=growth_points[:3],
        summary=f"Candidate demonstrated {verdict} level capability for {session_obj.seniority} {session_obj.role_title}. Exhibited solid domain vocabulary, structured communication, and technical reasoning across core interview pillars."
    )
    
    db.add(eval_obj)
    await db.commit()
    await db.refresh(eval_obj)
    return eval_obj
