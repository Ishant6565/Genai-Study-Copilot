'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Layers,
  Activity,
  ShieldCheck,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { interviewApi } from '@/lib/interviewApi';
import { InterviewSession, InterviewEvaluation } from '@/types/interview';
import { cn } from '@/lib/utils';

export default function InterviewFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = (params?.id as string) || 'int-demo-001';

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const sess = await interviewApi.getInterview(sessionId);
        if (sess) {
          setSession(sess);
          if (sess.evaluation) {
            setEvaluation(sess.evaluation);
          } else {
            const ev = await interviewApi.evaluateInterview(sessionId);
            setEvaluation(ev);
          }
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  const handleCopyMarkdown = () => {
    if (!evaluation || !session) return;

    let md = `# Interview Evaluation Report: ${session.role_title} (${session.seniority})\n\n`;
    md += `**Overall Score:** ${evaluation.overall_score}/100\n`;
    md += `**Hiring Verdict:** ${evaluation.hiring_verdict}\n\n`;
    md += `## 📊 Skill Breakdown\n`;
    md += `- Technical Depth: ${evaluation.technical_depth_score}/10\n`;
    md += `- Communication: ${evaluation.communication_score}/10\n`;
    md += `- Problem Solving: ${evaluation.problem_solving_score}/10\n`;
    md += `- Edge Cases: ${evaluation.edge_case_score}/10\n\n`;
    md += `## 🌟 Strengths\n`;
    evaluation.strengths.forEach((s) => (md += `- ${s}\n`));
    md += `\n## 💡 Areas to Improve\n`;
    evaluation.areas_to_improve.forEach((a) => (md += `- ${a}\n`));
    md += `\n## 📝 Question Breakdown\n`;
    session.questions.forEach((q, i) => {
      md += `### Question ${i + 1}: ${q.question_text}\n`;
      md += `**Your Answer:** ${q.candidate_answer || 'N/A'}\n`;
      md += `**Feedback:** ${q.feedback || 'N/A'}\n`;
      md += `**Ideal Model Answer:** ${q.ideal_answer || 'N/A'}\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !session || !evaluation) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-500" />
          <p className="text-sm font-semibold">Synthesizing comprehensive hiring evaluation report...</p>
        </div>
      </div>
    );
  }

  const getVerdictStyle = (v: string) => {
    switch (v) {
      case 'Strong Hire':
        return {
          badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent'
        };
      case 'Hire':
        return {
          badge: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
          gradient: 'from-sky-500/20 via-indigo-500/10 to-transparent'
        };
      case 'Lean Hire':
        return {
          badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          gradient: 'from-amber-500/20 via-orange-500/10 to-transparent'
        };
      default:
        return {
          badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
          gradient: 'from-rose-500/20 via-red-500/10 to-transparent'
        };
    }
  };

  const verdictStyle = getVerdictStyle(evaluation.hiring_verdict);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 md:p-10 selection:bg-sky-500 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Launchpad</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Markdown!' : 'Copy Report'}</span>
            </button>

            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Practice Again</span>
            </button>
          </div>
        </div>

        {/* Hero Verdict Card */}
        <div className={cn(
          "rounded-3xl border border-slate-800 p-8 shadow-2xl bg-gradient-to-b relative overflow-hidden space-y-6",
          verdictStyle.gradient
        )}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                  verdictStyle.badge
                )}>
                  {evaluation.hiring_verdict}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {session.seniority} • {session.track}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Interview Scorecard: {session.role_title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {evaluation.summary}
              </p>
            </div>

            {/* Overall Score Circle */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center p-5 rounded-2xl bg-[#0c121e] border border-slate-800 shadow-xl min-w-[140px]">
              <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                {evaluation.overall_score}
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Overall Score / 100
              </span>
            </div>
          </div>

          {/* Skill Radar / 4 Pillars Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Technical Depth</span>
                <span className="text-sky-400 font-bold">{evaluation.technical_depth_score}/10</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full"
                  style={{ width: `${evaluation.technical_depth_score * 10}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Communication</span>
                <span className="text-emerald-400 font-bold">{evaluation.communication_score}/10</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${evaluation.communication_score * 10}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Problem Solving</span>
                <span className="text-indigo-400 font-bold">{evaluation.problem_solving_score}/10</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${evaluation.problem_solving_score * 10}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Edge Cases</span>
                <span className="text-purple-400 font-bold">{evaluation.edge_case_score}/10</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${evaluation.edge_case_score * 10}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Areas to Improve 2-Col */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="p-6 rounded-3xl bg-[#0c121e] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Key Strengths</span>
            </h3>
            <ul className="space-y-2.5">
              {evaluation.strengths.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas to Improve */}
          <div className="p-6 rounded-3xl bg-[#0c121e] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Areas for Growth</span>
            </h3>
            <ul className="space-y-2.5">
              {evaluation.areas_to_improve.map((a, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Question-by-Question Deep Dive */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-400" />
              <span>Question-by-Question Analysis</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {session.questions.length} Questions Evaluated
            </span>
          </div>

          <div className="space-y-4">
            {session.questions.map((q, idx) => {
              const isExpanded = expandedQuestionId === q.id || idx === 0;

              return (
                <div
                  key={q.id}
                  className="rounded-3xl bg-[#0c121e] border border-slate-800 shadow-xl overflow-hidden"
                >
                  <div
                    onClick={() => setExpandedQuestionId(isExpanded && idx !== 0 ? null : q.id)}
                    className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-900/60 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-sky-400">
                          Q{idx + 1} • {q.category}
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                          {q.difficulty}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-white">
                        {q.question_text}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {q.score && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
                          {q.score} / 10
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-6 space-y-4 border-t border-slate-800/80 pt-4 bg-slate-900/30">
                      {/* Candidate Answer */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                          Candidate Answer:
                        </span>
                        <p className="text-xs text-slate-200 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 leading-relaxed font-mono">
                          {q.candidate_answer || 'No answer recorded for this question.'}
                        </p>
                      </div>

                      {/* Coach Feedback */}
                      {q.feedback && (
                        <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 space-y-1">
                          <p className="font-bold flex items-center gap-1.5 text-[11px]">
                            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                            <span>AI Coach Assessment:</span>
                          </p>
                          <p className="leading-relaxed">{q.feedback}</p>
                        </div>
                      )}

                      {/* Top-Tier Model Answer */}
                      {q.ideal_answer && (
                        <div className="space-y-1.5">
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-emerald-400" />
                            <span>🌟 Top-Tier Expert Model Answer:</span>
                          </span>
                          <p className="text-xs text-slate-300 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 leading-relaxed">
                            {q.ideal_answer}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
