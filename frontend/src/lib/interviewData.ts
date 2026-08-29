import { TrackConfig, InterviewSession, InterviewEvaluation } from '@/types/interview';

export const TRACK_TEMPLATES: TrackConfig[] = [
  {
    id: 'genai',
    title: 'GenAI & RAG Engineer',
    roleTitle: 'Senior AI & LLM Systems Engineer',
    iconName: 'Sparkles',
    badge: 'Trending 🔥',
    description: 'pgvector, sliding-window chunking, prompt grounding, anti-hallucination guardrails, and agentic workflows.',
    popularTopics: ['pgvector & HNSW', 'Chunk Overlap', 'Hallucination Mitigation', 'Agent Tools', 'Latency Optimization'],
    defaultQuestionsCount: 5
  },
  {
    id: 'fullstack',
    title: 'Full Stack Engineer',
    roleTitle: 'Senior Full Stack Developer',
    iconName: 'Layers',
    badge: 'Popular 🚀',
    description: 'Next.js Server Components, FastAPI AsyncIO, PostgreSQL query optimization, and distributed caching.',
    popularTopics: ['Next.js App Router', 'FastAPI Concurrency', 'Redis Caching', 'Postgres Indexes', 'JWT Auth Security'],
    defaultQuestionsCount: 5
  },
  {
    id: 'systemdesign',
    title: 'System Design & Distributed',
    roleTitle: 'Staff Distributed Systems Architect',
    iconName: 'Cpu',
    badge: 'High Impact ⚡',
    description: 'High-concurrency architectures, rate limiters, CRDTs, message brokers, and horizontal scalability.',
    popularTopics: ['Distributed Rate Limiter', 'Google Docs CRDTs', 'Kafka vs RabbitMQ', 'CAP Theorem', 'Sharding'],
    defaultQuestionsCount: 4
  },
  {
    id: 'frontend',
    title: 'Frontend Specialist',
    roleTitle: 'Senior React & UI Architect',
    iconName: 'Palette',
    badge: 'Core 💻',
    description: 'React 19 reconciliation, CSS layout engines, web vitals (LCP/INP), and complex state management.',
    popularTopics: ['Virtual DOM Reconciliation', 'Core Web Vitals', 'Custom Hooks', 'Micro-Frontends', 'Accessibility'],
    defaultQuestionsCount: 5
  },
  {
    id: 'behavioral',
    title: 'Behavioral & Leadership',
    roleTitle: 'Engineering Leadership (STAR Method)',
    iconName: 'Users',
    badge: 'Crucial 🌟',
    description: 'Handling production outages, technical disagreements, cross-functional roadblocks, and mentorship.',
    popularTopics: ['Production Outage Post-Mortem', 'Architectural Disagreements', 'Tight Deadlines', 'Mentorship'],
    defaultQuestionsCount: 4
  }
];

export const SAMPLE_EVALUATION: InterviewEvaluation = {
  id: 'eval-sample-001',
  session_id: 'int-demo-001',
  overall_score: 88.5,
  hiring_verdict: 'Strong Hire',
  technical_depth_score: 8.8,
  communication_score: 9.2,
  problem_solving_score: 8.5,
  edge_case_score: 8.0,
  strengths: [
    'Demonstrated deep architectural intuition for sliding-window chunk overlap in RAG pipelines.',
    'Clear, articulate verbal communication structured with point-by-point trade-offs.',
    'Accurately highlighted why pgvector HNSW eliminates the dual-write problem of external vector DBs.'
  ],
  areas_to_improve: [
    'Quantify memory footprints when configuring HNSW M and efConstruction parameters.',
    'Mention automated regression evaluation benchmarks (e.g. Ragas metrics) for continuous hallucination tracking.'
  ],
  summary: 'The candidate gave strong, structured technical explanations with impressive depth across vector indexing, chunk boundaries, and low-latency API design. Recommended as a Strong Hire.',
  created_at: '2026-08-29T18:00:00Z'
};

export const SAMPLE_INTERVIEW_SESSION: InterviewSession = {
  id: 'int-demo-001',
  role_title: 'Senior GenAI & RAG Engineer',
  track: 'GenAI & RAG',
  seniority: 'Senior',
  interview_type: 'Technical',
  total_questions: 5,
  current_question_index: 0,
  status: 'IN_PROGRESS',
  created_at: '2026-08-29T17:50:00Z',
  questions: [
    {
      id: 'q-1',
      question_order: 1,
      question_text: 'Explain how sliding-window chunk overlap prevents boundary context loss in RAG pipelines, and how you determine optimal chunk and overlap sizes.',
      category: 'RAG Architecture',
      difficulty: 'Medium',
      ideal_answer: 'Naive fixed-size chunking cuts text arbitrarily, breaking sentences across chunk boundaries. Sliding-window overlap (e.g. 600 tokens with 100 overlap) ensures boundary sentences appear fully in both vectors. Optimal sizing depends on embedding model context limits, query intent granularity, and token density.',
      candidate_answer: 'Sliding-window overlap ensures that sentences spanning the boundary between two consecutive chunks are preserved in both embedding vectors, preventing context loss during similarity search.',
      score: 9.0,
      feedback: 'Excellent explanation of semantic boundary preservation.'
    },
    {
      id: 'q-2',
      question_order: 2,
      question_text: 'Compare pgvector with dedicated vector databases like Pinecone or Qdrant. When would you choose pgvector over a standalone vector DB?',
      category: 'Vector Databases',
      difficulty: 'Hard',
      ideal_answer: 'pgvector stores embeddings directly in PostgreSQL alongside relational business data, eliminating the dual-write problem and synchronization lag. Standalone vector DBs are better for 100M+ vectors with distributed sharding.',
      candidate_answer: 'pgvector is great because relational data and embeddings live in the same ACID database, avoiding separate network hops and synchronization issues.',
      score: 8.5,
      feedback: 'Strong answer highlighting ACID compliance and architectural simplicity.'
    },
    {
      id: 'q-3',
      question_order: 3,
      question_text: 'How do you systematically prevent and evaluate LLM hallucinations in a production enterprise study/knowledge assistant?',
      category: 'Guardrails & Evaluation',
      difficulty: 'Hard',
      ideal_answer: 'We enforce strict grounding prompts requiring citations, cosine similarity distance thresholds (refusing to speculate if top similarity is low), verifiable page metadata tags, and automated evaluation frameworks (e.g. Ragas testing Context Relevance, Faithfulness, and Answer Relevance).',
      candidate_answer: 'We use strict prompt guardrails, cosine similarity thresholds to refuse answering when relevance is low, and attach exact page citations.',
      score: 9.0,
      feedback: 'Very clear description of grounding guardrails and citation binding.'
    },
    {
      id: 'q-4',
      question_order: 4,
      question_text: 'Describe the architecture of Agentic RAG and Function Calling. How does an agent decide between vector search, web search, or executing code?',
      category: 'AI Agents & Tool Use',
      difficulty: 'Hard',
      ideal_answer: 'Agentic RAG uses a reasoning loop (ReAct) where the LLM parses the user prompt, chooses an appropriate tool from schema definitions, receives structured JSON output, and iteratively synthesizes the final response.',
      candidate_answer: 'The agent uses tool definitions in JSON schema. When a prompt arrives, the model chooses which tool to call based on the intent, receives the result, and loops until the answer is complete.',
      score: 8.5,
      feedback: 'Good overview of the tool calling loop.'
    },
    {
      id: 'q-5',
      question_order: 5,
      question_text: 'What strategies do you use to reduce end-to-end RAG latency from 3 seconds down to under 500 milliseconds?',
      category: 'Performance & Scaling',
      difficulty: 'Senior',
      ideal_answer: 'Stream LLM tokens, build HNSW graph index in pgvector, use Redis semantic caching, use async non-blocking connection pools, and compress prompt context.',
      candidate_answer: 'We stream responses, use HNSW indexes in pgvector for sub-40ms vector search, and cache frequent queries in Redis.',
      score: 9.2,
      feedback: 'Concise, high-impact strategies covering database, network, and caching layers.'
    }
  ],
  evaluation: SAMPLE_EVALUATION
};
