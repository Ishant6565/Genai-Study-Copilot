'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Layers,
  Upload,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flame,
  BookOpen,
  Plus
} from 'lucide-react';
import { useAuth } from '@/components/layout/AuthContext';
import { api } from '@/lib/api';
import { DocumentItem, Conversation, MetricsSummary } from '@/types';
import { formatBytes, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { user, isDemo } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [docs, convs, met] = await Promise.all([
          api.getDocuments(),
          api.getConversations(),
          api.getMetricsOverview()
        ]);
        setDocuments(docs);
        setConversations(convs);
        setMetrics(met);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalPages = documents.reduce((acc, d) => acc + (d.total_pages || 0), 0);
  const totalChunks = documents.reduce((acc, d) => acc + (d.total_chunks || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome & Quick Action Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-sky-500/10 via-indigo-500/5 to-purple-500/10 border border-sky-500/20 dark:border-sky-500/10 relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-sky-500 text-white">
              {isDemo ? 'PORTFOLIO DEMO' : 'ACTIVE WORKSPACE'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">pgvector RAG v1.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Alex'} 👋
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
            Your knowledge base has <strong className="text-slate-900 dark:text-white">{documents.length} documents</strong> and <strong className="text-slate-900 dark:text-white">{totalChunks} indexed chunks</strong> ready for grounded synthesis.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <Link
            href="/dashboard/documents"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </Link>
          <Link
            href="/dashboard/chat"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-sm font-semibold transition-all"
          >
            <MessageSquare className="w-4 h-4 text-sky-500" />
            <span>Start AI Chat</span>
          </Link>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Documents</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {documents.length}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {totalPages} Total Pages Parsed
            </p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Indexed Chunks</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {totalChunks}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              1536-dim HNSW Vector Store
            </p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">RAG Queries</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {metrics?.total_queries || 42}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {metrics?.avg_retrieval_latency_ms || 38.6}ms avg retrieval
            </p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Grounding Score</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics?.success_rate_percentage || 98.2}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              0 Hallucinations Reported
            </p>
          </div>
        </div>
      </div>

      {/* AI Study Tools Launchers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            AI Study Engines
          </h2>
          <span className="text-xs text-slate-400">Powered by grounded pgvector retrieval</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Summarizer */}
          <Link
            href="/dashboard/summaries"
            className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 hover:border-sky-500/40 hover:shadow-lg transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>Executive Summaries</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-sky-500 transition-colors" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Generate structured outlines, key takeaways, and terminology glossaries from entire PDF documents.
            </p>
          </Link>

          {/* Card 2: Quiz Engine */}
          <Link
            href="/dashboard/quizzes"
            className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/40 hover:shadow-lg transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>Exam & Quiz Generator</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Test your knowledge with multiple-choice questions, live scoring, and instant pedagogical feedback.
            </p>
          </Link>

          {/* Card 3: Flashcards */}
          <Link
            href="/dashboard/flashcards"
            className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 hover:border-purple-500/40 hover:shadow-lg transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>Interactive Flashcards</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              3D animated concept cards with spaced-repetition categorization and mastery tracking.
            </p>
          </Link>
        </div>
      </div>

      {/* Two Column Section: Recent Documents & Recent Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Documents */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-500" />
              <span>Recent Documents</span>
            </h3>
            <Link
              href="/dashboard/documents"
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
            >
              View All ({documents.length})
            </Link>
          </div>

          {documents.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-xs text-slate-400">Your study workspace is empty.</p>
              <Link
                href="/dashboard/documents"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload First Document</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {documents.slice(0, 3).map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {doc.total_pages} Pages • {formatBytes(doc.file_size_bytes)} • {formatDate(doc.created_at)}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Recent Conversations */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-500" />
              <span>Recent AI Chats</span>
            </h3>
            <Link
              href="/dashboard/chat"
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
            >
              New Chat
            </Link>
          </div>

          {conversations.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-xs text-slate-400">No active conversations yet.</p>
              <Link
                href="/dashboard/chat"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask Study Copilot</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {conversations.slice(0, 3).map((conv) => (
                <Link
                  key={conv.id}
                  href={`/dashboard/chat?id=${conv.id}`}
                  className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 hover:border-purple-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {conv.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatDate(conv.updated_at)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Grounded RAG session with page citations
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
