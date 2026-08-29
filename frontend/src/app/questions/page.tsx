'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Search,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Award,
  Filter,
  Play
} from 'lucide-react';
import { TRACK_TEMPLATES } from '@/lib/interviewData';
import { cn } from '@/lib/utils';

const ALL_QUESTIONS = [
  {
    id: 'qb-1',
    track: 'GenAI & RAG',
    question: 'Explain how sliding-window chunk overlap prevents boundary context loss in RAG pipelines.',
    difficulty: 'Medium',
    category: 'RAG Architecture',
    modelAnswer: 'Naive fixed-size chunking cuts text arbitrarily, breaking sentences across chunk boundaries. Sliding-window overlap (e.g. 600 tokens with 100 overlap) ensures boundary sentences appear fully in both vectors. Optimal sizing depends on embedding model context limits, query intent granularity, and token density.'
  },
  {
    id: 'qb-2',
    track: 'GenAI & RAG',
    question: 'Compare pgvector with dedicated vector databases like Pinecone or Qdrant. When would you choose pgvector?',
    difficulty: 'Hard',
    category: 'Vector Databases',
    modelAnswer: 'pgvector stores embeddings directly in PostgreSQL alongside relational business data, eliminating the dual-write problem, synchronization lag, and separate auth layers. Standalone vector DBs are better for 100M+ vectors with distributed sharding.'
  },
  {
    id: 'qb-3',
    track: 'GenAI & RAG',
    question: 'How do you systematically prevent and evaluate LLM hallucinations in a production assistant?',
    difficulty: 'Hard',
    category: 'Guardrails & Evaluation',
    modelAnswer: 'We enforce strict grounding prompts requiring citations, cosine similarity distance thresholds (refusing to speculate if top similarity is low), verifiable page metadata tags, and automated evaluation frameworks (e.g. Ragas testing Context Relevance, Faithfulness, and Answer Relevance).'
  },
  {
    id: 'qb-4',
    track: 'Full Stack',
    question: 'Explain the difference between Server Components and Client Components in Next.js App Router.',
    difficulty: 'Medium',
    category: 'Frontend Architecture',
    modelAnswer: 'Server Components execute exclusively on the server, producing zero client-side JavaScript bundle size, and can directly access databases/APIs securely. Client Components (\'use client\') run on the browser and handle user interactivity, state, and browser APIs.'
  },
  {
    id: 'qb-5',
    track: 'Full Stack',
    question: 'How do you architect a high-concurrency API using FastAPI, AsyncIO, and SQLAlchemy Async Session?',
    difficulty: 'Hard',
    category: 'Backend Engineering',
    modelAnswer: 'Use asyncpg with SQLAlchemy AsyncSession pooled via QueuePool with sensible pool_size and max_overflow. Avoid running blocking CPU-heavy code inside async def without run_in_threadpool or background task queues. Always ensure database sessions are scoped and closed cleanly using async context managers.'
  },
  {
    id: 'qb-6',
    track: 'System Design',
    question: 'Design a real-time collaborative document editing service like Google Docs supporting millions of users.',
    difficulty: 'Hard',
    category: 'Distributed Systems',
    modelAnswer: 'Architecture requires WebSockets gateway for bi-directional live updates, Conflict Resolution algorithm (Operational Transformation or CRDTs like Yjs/Automerge), Redis Pub/Sub for cross-server message fanout, append-only log in Kafka/PostgreSQL, and periodic snapshotting into S3.'
  },
  {
    id: 'qb-7',
    track: 'System Design',
    question: 'How would you design a distributed rate limiter that handles 500k RPS across multiple data centers?',
    difficulty: 'Hard',
    category: 'Scalability & Resilience',
    modelAnswer: 'Use Redis Sliding Window Counter with Lua scripts for atomic increments. In multi-region environments, use local token bucket caches with background batch synchronization to central Redis to keep P99 latency < 5ms.'
  },
  {
    id: 'qb-8',
    track: 'Behavioral',
    question: 'Tell me about a time you faced a critical production outage. How did you diagnose, resolve, and prevent it?',
    difficulty: 'Medium',
    category: 'Incident Response (STAR)',
    modelAnswer: 'STAR method: Situation (high-latency outage under traffic spike), Task (restore service and prevent data corruption), Action (identified unindexed query locking Postgres tables via pg_stat_activity, deployed hotfix index, set up circuit breaker in Redis), Result (latency dropped from 4s to 45ms, zero data loss, conducted blameless post-mortem).'
  }
];

export default function QuestionBankPage() {
  const router = useRouter();
  const [selectedTrack, setSelectedTrack] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredQuestions = ALL_QUESTIONS.filter((q) => {
    const matchesTrack = selectedTrack === 'All' || q.track === selectedTrack;
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.modelAnswer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTrack && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 md:p-10 selection:bg-sky-500 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Launchpad</span>
          </button>

          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Live Interview</span>
          </button>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curated Technical Question Repository</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Tech Interview Question Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Explore high-frequency technical questions, difficulty levels, and top-tier expert model answers.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions by keyword, topic, or model answer..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 outline-none focus:border-sky-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'GenAI & RAG', 'Full Stack', 'System Design', 'Behavioral'].map((track) => (
              <button
                key={track}
                onClick={() => setSelectedTrack(track)}
                className={cn(
                  'px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border',
                  selectedTrack === track
                    ? 'bg-sky-500/15 border-sky-500 text-sky-400 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                )}
              >
                {track}
              </button>
            ))}
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const isExpanded = expandedId === q.id;

            return (
              <div
                key={q.id}
                className="rounded-3xl bg-[#0c121e] border border-slate-800 shadow-xl overflow-hidden"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-900/60 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/20">
                        {q.track}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {q.category}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                        {q.difficulty}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {q.question}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 flex-shrink-0 mt-1">
                    <span className="text-xs hidden sm:inline text-sky-400 font-semibold">
                      {isExpanded ? 'Hide Answer' : 'View Model Answer'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-6 pt-4 border-t border-slate-800/80 bg-slate-900/40 space-y-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      <span>🌟 Top-Tier Expert Model Answer:</span>
                    </span>
                    <p className="text-xs text-slate-300 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 leading-relaxed">
                      {q.modelAnswer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
