import { DocumentItem, Conversation, SummaryData, QuizData, Flashcard, MetricsSummary, User } from '@/types';

export const DEMO_USER: User = {
  id: 'usr-demo-001',
  email: 'alex.chen@mit.edu',
  full_name: 'Alex Chen',
  role: 'student',
  is_active: true,
  created_at: '2026-08-20T10:00:00Z'
};

export const DEMO_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-dist-rag-01',
    title: 'Distributed Systems & Enterprise GenAI RAG Architecture',
    filename: 'distributed_systems_rag_guide.pdf',
    file_size_bytes: 1024 * 480,
    file_type: 'application/pdf',
    total_pages: 18,
    total_chunks: 34,
    status: 'READY',
    created_at: '2026-08-28T14:30:00Z',
    updated_at: '2026-08-28T14:31:12Z'
  },
  {
    id: 'doc-os-memory-02',
    title: 'Operating Systems: Virtual Memory & Page Replacement',
    filename: 'cs162_virtual_memory_notes.pdf',
    file_size_bytes: 1024 * 320,
    file_type: 'application/pdf',
    total_pages: 12,
    total_chunks: 22,
    status: 'READY',
    created_at: '2026-08-27T09:15:00Z',
    updated_at: '2026-08-27T09:16:05Z'
  },
  {
    id: 'doc-database-lsm-03',
    title: 'Storage Internals: LSM-Trees vs B+ Trees in Modern KV Engines',
    filename: 'storage_engines_lsm_trees.pdf',
    file_size_bytes: 1024 * 610,
    file_type: 'application/pdf',
    total_pages: 24,
    total_chunks: 48,
    status: 'READY',
    created_at: '2026-08-26T18:00:00Z',
    updated_at: '2026-08-26T18:01:45Z'
  }
];

export const DEMO_CONVERSATION: Conversation = {
  id: 'conv-demo-01',
  title: 'RAG Chunking Strategy & Page Citations',
  document_id: 'doc-dist-rag-01',
  created_at: '2026-08-28T15:00:00Z',
  updated_at: '2026-08-28T15:05:00Z',
  messages: [
    {
      id: 'msg-1',
      conversation_id: 'conv-demo-01',
      role: 'user',
      content: 'How does sliding-window chunk overlap prevent context loss across arbitrary document boundaries?',
      created_at: '2026-08-28T15:01:00Z'
    },
    {
      id: 'msg-2',
      conversation_id: 'conv-demo-01',
      role: 'assistant',
      content: `According to **Chapter 2 of the Distributed Systems & Enterprise GenAI RAG Architecture Guide (Page 2)**:

Fixed-length naive chunking causes a fundamental flaw known as **boundary context truncation**, where split boundaries bisect complex clauses or mathematical statements.

### 🛡️ How Sliding-Window Overlap Resolves This:
1. **Clause Continuity**: By retaining an overlap buffer (e.g. 600 tokens with 100 token overlap), sentences that bridge across the end of chunk $N$ and the start of chunk $N+1$ remain semantically coherent in both vectors.
2. **Deterministic Metadata Binding**: Each chunk retains its specific page number and character offsets, ensuring that cosine similarity queries map directly to actionable inline citations [Source: Distributed Systems & Enterprise GenAI RAG Architecture, Page 2].
3. **Anti-Hallucination Anchor**: With overlapping context, the LLM receives unbroken sentences and does not need to guess missing prepositions or pronouns.`,
      citations: [
        {
          document_id: 'doc-dist-rag-01',
          document_title: 'Distributed Systems & Enterprise GenAI RAG Architecture',
          page_number: 2,
          snippet: 'Modern production systems implement Recursive Character Splitting with sliding-window overlap (e.g., 600 tokens with 100 token overlap). This structure guarantees that contextual continuity is preserved across chunk boundaries...',
          similarity_score: 0.942
        }
      ],
      tokens_used: { prompt_tokens: 412, completion_tokens: 185 },
      latency_ms: { retrieval_ms: 36.2, generation_ms: 275.4 },
      created_at: '2026-08-28T15:01:03Z'
    }
  ]
};

export const DEMO_SUMMARY: SummaryData = {
  id: 'sum-01',
  document_id: 'doc-dist-rag-01',
  title: 'Summary: Distributed Systems & Enterprise GenAI RAG Architecture',
  quick_summary: 'An authoritative study guide detailing the production lifecycle of enterprise RAG pipelines, recursive chunking mechanics, pgvector HNSW indexing, and anti-hallucination guardrails.',
  detailed_summary: `### 📘 Executive Summary

Retrieval-Augmented Generation (RAG) bridges external authoritative knowledge repositories with Large Language Models, eliminating the latency and hallucinations associated with static parametric model weights.

#### 🎯 Core Architectural Pillars:
- **Recursive Sliding-Window Chunking**: Splits text into 600-token semantic chunks with 100-token overlap, preserving clause integrity across page boundaries.
- **pgvector HNSW Approximate Nearest Neighbor (ANN)**: Stores 1536-dimensional embeddings for sub-40ms vector similarity matching with cosine distance indexing.
- **Strict Anti-Hallucination Guardrails**: Prompts enforce explicit non-disclosure when context relevance is insufficient, preventing confident model fabrications.`,
  key_concepts: [
    'Retrieval-Augmented Generation (RAG)',
    'Semantic Recursive Chunking',
    'pgvector HNSW Graph Indexing',
    'Verifiable Inline Citations',
    'Anti-Hallucination Guardrails'
  ],
  definitions: [
    {
      term: 'RAG (Retrieval-Augmented Generation)',
      definition: 'A framework that enhances LLM responses by querying external domain vector stores for factual context prior to text generation.'
    },
    {
      term: 'Cosine Distance',
      definition: 'A mathematical distance metric equal to 1 - Cosine Similarity, measuring the angular divergence between high-dimensional embedding vectors.'
    },
    {
      term: 'HNSW Index',
      definition: 'Hierarchical Navigable Small World — a multi-layer graph index structure enabling logarithmic search complexity for vector embeddings.'
    }
  ],
  created_at: '2026-08-28T14:35:00Z'
};

export const DEMO_QUIZ: QuizData = {
  id: 'quiz-01',
  document_id: 'doc-dist-rag-01',
  title: 'Mastery Exam: Enterprise RAG Foundations',
  difficulty: 'Medium',
  total_questions: 3,
  questions: [
    {
      id: 1,
      question: 'What is the primary advantage of sliding-window chunk overlap in RAG pre-processing?',
      options: [
        'It reduces database storage consumption by 50%',
        'It preserves contextual continuity across arbitrary split boundaries',
        'It automatically redacts confidential PII tokens',
        'It bypasses the need for an embedding neural network'
      ],
      correct_answer: 1,
      explanation: 'Sliding-window overlap ensures sentences that span across split boundaries retain complete contextual meaning in both vector chunks.'
    },
    {
      id: 2,
      question: 'Why is page number metadata preserved alongside vector embeddings in pgvector?',
      options: [
        'To enable verifiable inline citations and direct human auditability',
        'To speed up TCP socket connection pooling',
        'To replace SQL joins with full table scans',
        'To format API responses into PDF files'
      ],
      correct_answer: 0,
      explanation: 'Page numbers allow the system to generate direct clickable citations linking answers to original document pages for instant verification.'
    },
    {
      id: 3,
      question: 'What is the function of the Anti-Hallucination Guardrail in StudyPilot AI?',
      options: [
        'To force the LLM to invent an answer when facts are missing',
        'To terminate the web server on slow queries',
        'To explicitly state that information is not found when context is insufficient',
        'To translate all study notes into Latin'
      ],
      correct_answer: 2,
      explanation: 'Anti-hallucination guardrails guarantee that the AI refuses to guess or invent facts outside the uploaded study context.'
    }
  ],
  created_at: '2026-08-28T14:40:00Z'
};

export const DEMO_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    document_id: 'doc-dist-rag-01',
    front: 'What is Retrieval-Augmented Generation (RAG)?',
    back: 'An AI architecture that queries an external vector database for factual context before prompting an LLM, ensuring responses are grounded in verified source materials.',
    category: 'Core Architecture',
    difficulty: 'Easy',
    created_at: '2026-08-28T14:45:00Z'
  },
  {
    id: 'fc-2',
    document_id: 'doc-dist-rag-01',
    front: 'Why is Chunk Overlap critical during document parsing?',
    back: 'It prevents loss of semantic context across chunk edges, ensuring sentences split across boundaries retain full contextual coherence in vector space.',
    category: 'Data Ingestion',
    difficulty: 'Medium',
    created_at: '2026-08-28T14:45:00Z'
  },
  {
    id: 'fc-3',
    document_id: 'doc-dist-rag-01',
    front: 'What is an HNSW Index in pgvector?',
    back: 'Hierarchical Navigable Small World — a state-of-the-art graph index for sub-millisecond Approximate Nearest Neighbor (ANN) vector search.',
    category: 'Database & Vectors',
    difficulty: 'Hard',
    created_at: '2026-08-28T14:45:00Z'
  },
  {
    id: 'fc-4',
    document_id: 'doc-dist-rag-01',
    front: 'What is the formula for Cosine Similarity?',
    back: 'Cosine Similarity = (A · B) / (||A|| * ||B||). It calculates the cosine of the angle between two embedding vectors regardless of their magnitude.',
    category: 'Mathematics',
    difficulty: 'Medium',
    created_at: '2026-08-28T14:45:00Z'
  },
  {
    id: 'fc-5',
    document_id: 'doc-dist-rag-01',
    front: 'How do Grounded Inline Citations improve user trust?',
    back: 'They link assistant assertions directly to specific document titles and page numbers, enabling single-click human auditing of AI answers.',
    category: 'Evaluation & Trust',
    difficulty: 'Easy',
    created_at: '2026-08-28T14:45:00Z'
  }
];

export const DEMO_METRICS: MetricsSummary = {
  total_queries: 42,
  avg_total_latency_ms: 312.4,
  avg_retrieval_latency_ms: 38.6,
  avg_generation_latency_ms: 273.8,
  total_prompt_tokens: 18450,
  total_completion_tokens: 6120,
  success_rate_percentage: 97.6,
  total_documents: 3,
  total_chunks: 104,
  recent_metrics: [
    {
      id: 'met-1',
      query: 'How does sliding-window chunk overlap prevent context loss across arbitrary document boundaries?',
      retrieval_latency_ms: 36.2,
      generation_latency_ms: 275.4,
      total_latency_ms: 311.6,
      top_k_chunks: 4,
      avg_similarity_score: 0.942,
      prompt_tokens: 412,
      completion_tokens: 185,
      model_name: 'gpt-4o-mini',
      status: 'SUCCESS',
      created_at: '2026-08-28T15:01:03Z'
    },
    {
      id: 'met-2',
      query: 'What is the difference between HNSW and IVFFlat in pgvector?',
      retrieval_latency_ms: 41.5,
      generation_latency_ms: 290.0,
      total_latency_ms: 331.5,
      top_k_chunks: 4,
      avg_similarity_score: 0.915,
      prompt_tokens: 430,
      completion_tokens: 198,
      model_name: 'gpt-4o-mini',
      status: 'SUCCESS',
      created_at: '2026-08-28T14:52:10Z'
    },
    {
      id: 'met-3',
      query: 'Explain page fault handling lifecycle in Linux virtual memory',
      retrieval_latency_ms: 34.8,
      generation_latency_ms: 260.1,
      total_latency_ms: 294.9,
      top_k_chunks: 4,
      avg_similarity_score: 0.963,
      prompt_tokens: 395,
      completion_tokens: 172,
      model_name: 'gpt-4o-mini',
      status: 'SUCCESS',
      created_at: '2026-08-28T14:20:45Z'
    }
  ]
};
