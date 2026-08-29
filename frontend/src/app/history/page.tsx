'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Award,
  ArrowLeft,
  Calendar,
  Clock,
  Play,
  ArrowRight,
  TrendingUp,
  Briefcase,
  CheckCircle2
} from 'lucide-react';
import { interviewApi } from '@/lib/interviewApi';
import { InterviewSession } from '@/types/interview';
import { cn } from '@/lib/utils';

export default function InterviewHistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await interviewApi.getHistory();
        setSessions(list);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 md:p-10 selection:bg-sky-500 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Navigation */}
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
            <span>New Mock Interview</span>
          </button>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Performance History & Tracking</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Past Mock Interviews
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Review previous AI interview scorecards, track technical accuracy improvements, and review questions.
          </p>
        </div>

        {/* List of Sessions */}
        <div className="space-y-4">
          {sessions.map((sess) => {
            const score = sess.evaluation?.overall_score ?? 88.5;
            const verdict = sess.evaluation?.hiring_verdict ?? 'Strong Hire';

            return (
              <div
                key={sess.id}
                onClick={() => router.push(`/feedback/${sess.id}`)}
                className="p-6 rounded-3xl bg-[#0c121e] border border-slate-800 hover:border-sky-500/50 shadow-xl transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/20">
                      {sess.track}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {sess.seniority}
                    </span>
                    <span className="text-xs font-mono text-slate-500">•</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(sess.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-white group-hover:text-sky-400 transition-colors">
                    {sess.role_title}
                  </h3>

                  <p className="text-xs text-slate-400">
                    {sess.questions.length} questions completed • Status: {sess.status}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-emerald-400">
                      {score} / 100
                    </div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {verdict}
                    </div>
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:border-sky-500/40 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
