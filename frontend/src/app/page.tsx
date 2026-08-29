'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
  FileText,
  MessageSquare,
  HelpCircle,
  Layers,
  Activity,
  CheckCircle2,
  Database,
  Lock,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/components/layout/AuthContext';

export default function LandingPage() {
  const { demoLogin } = useAuth();

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 selection:bg-sky-500 selection:text-white transition-colors duration-200">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                StudyPilot
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                AI
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#rag-architecture" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              RAG Architecture
            </a>
            <a href="#tech-stack" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Tech Stack
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Enterprise-Grade Full-Stack AI Study Copilot</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Turn your study material into an{' '}
            <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              AI-powered learning system.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Upload PDFs, lecture slides, and notes. Ask complex questions, get grounded answers with verifiable page citations, and generate instant summaries, mastery quizzes, and flashcards.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold shadow-xl shadow-sky-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Start Studying Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>Launch Live Demo Mode</span>
            </Link>
          </div>

          <div className="pt-3 flex items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>pgvector Cosine Search</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Zero Hallucination Guard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Page-Level Citations</span>
            </div>
          </div>
        </div>

        {/* Live Product Preview UI Mockup */}
        <div className="max-w-5xl mx-auto mt-16 rounded-2xl p-2 bg-gradient-to-b from-slate-200 dark:from-slate-800 to-transparent shadow-2xl relative z-10">
          <div className="rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-inner">
            {/* Mock Header */}
            <div className="h-10 px-4 bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-mono text-slate-400 ml-2">
                  StudyPilot AI — Grounded RAG Workspace
                </span>
              </div>
              <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-bold">
                pgvector HNSW: 38ms
              </span>
            </div>

            {/* Mock Chat Body */}
            <div className="p-6 space-y-4">
              {/* User message */}
              <div className="flex gap-3 max-w-xl ml-auto flex-row-reverse">
                <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  U
                </div>
                <div className="p-3.5 rounded-2xl bg-sky-600 text-white rounded-tr-none text-xs font-medium">
                  How does sliding-window chunk overlap prevent context loss across arbitrary document boundaries?
                </div>
              </div>

              {/* Assistant message with citation */}
              <div className="flex gap-3 max-w-2xl mr-auto">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-2">
                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800/80 rounded-tl-none text-xs leading-relaxed">
                    <p className="font-semibold text-sky-600 dark:text-sky-400 mb-1">
                      📘 Grounded Analysis (Distributed Systems & RAG Guide, Page 2):
                    </p>
                    Fixed-length naive chunking often splits text in the middle of sentences or logical clauses.
                    <strong> Recursive Character Splitting with sliding-window overlap (e.g. 600 tokens with 100 token overlap)</strong>{' '}
                    retains trailing context from previous chunks so boundary clauses remain fully coherent in vector space.
                  </div>

                  {/* Citation Pill */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-500/10 border border-sky-500/20 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                      <FileText className="w-3 h-3" />
                      <span>Distributed Systems & RAG Guide</span>
                      <span className="px-1 py-0.2 rounded bg-sky-500/20 text-[10px]">Page 2</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Retrieval: 38ms • Cosine Similarity: 94.2%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/50 dark:bg-[#070a12]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              The Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              How StudyPilot AI Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              From raw unstructured PDF notes to grounded vectors, multi-turn chat, and automated study tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                PDF Upload & Extraction
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Async background worker parses pages, strips artifacts, and prepares clean text streams.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Recursive Chunking & Embeddings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Splits into 600-token chunks with 100-token overlap; embeds via 1536-dim vector models.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                pgvector HNSW Indexing
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Stores vectors in PostgreSQL with HNSW graph indexes for sub-millisecond approximate nearest neighbor retrieval.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                04
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Grounded Citations & AI Tools
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Generates verifiable answers with page badges, executive summaries, interactive quizzes, and flashcards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Complete Learning Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Engineered for Deep Subject Mastery
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Not a toy chatbot — a full study suite designed for STEM students, researchers, and engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3 hover:border-sky-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Multi-Turn Grounded Chat
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Conversational memory that synthesizes multi-turn contexts with inline verifiable page citations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3 hover:border-indigo-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Executive Summarizer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Instant high-level overviews, key concept checklists, and terminology glossaries for rapid review.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3 hover:border-purple-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Mastery Exam Generator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Configurable multiple-choice exams with live timer, score tracking, and pedagogical explanations.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3 hover:border-emerald-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                3D Concept Flashcards
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Flip card animations, category filtering, shuffle mode, and spaced-repetition mastery tagging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RAG Architecture Deep Dive */}
      <section id="rag-architecture" className="py-20 px-6 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/50 dark:bg-[#070a12]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Engineering Deep Dive
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Why StudyPilot AI Outperforms Basic Chatbots
            </h2>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Strict Anti-Hallucination Guardrail</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  When cosine similarity falls below safety thresholds, the copilot explicitly refuses to speculate, avoiding deceptive model fabrications.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-sky-500" />
                  <span>pgvector Vector Database</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  1536-dimensional embeddings indexed using HNSW graph structures with cosine distance metrics for sub-40ms vector lookups.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>Auditable Page-Level Citations</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Every assistant claim is tagged with exact page numbers and chunk IDs, allowing single-click human auditing.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <span>Real-Time Observability</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Built-in telemetry tracking retrieval latency, LLM generation time, token consumption, and grounding accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Badges */}
      <section id="tech-stack" className="py-16 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Production Tech Stack
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              'Next.js 15 (App Router)',
              'TypeScript',
              'FastAPI (Python 3.11)',
              'PostgreSQL 16',
              'pgvector (HNSW)',
              'SQLAlchemy 2.0',
              'OpenAI API',
              'Tailwind CSS',
              'Redis',
              'Docker Compose'
            ].map((tech) => (
              <span
                key={tech}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 px-6 border-t border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-transparent to-sky-500/5">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Ready to supercharge your study workflow?
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Experience grounded GenAI study copilot with instant citations, executive summaries, and interactive quizzes.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold shadow-xl shadow-sky-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <div className="flex items-center justify-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
          <GraduationCap className="w-4 h-4 text-sky-500" />
          <span>StudyPilot AI — Enterprise GenAI Study Copilot</span>
        </div>
        <p>Engineered for Top-Tier AI / GenAI Engineering Portfolios • MIT License</p>
      </footer>
    </div>
  );
}
