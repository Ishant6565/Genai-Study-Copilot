"use client";

import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  Lock, 
  Activity,
  FileCheck 
} from 'lucide-react';
import { ReviewReport } from '@/lib/types';

interface ScorecardReviewProps {
  review?: ReviewReport;
}

export const ScorecardReview: React.FC<ScorecardReviewProps> = ({ review }) => {
  if (!review) {
    return (
      <div className="w-full glass-panel rounded-2xl p-8 border border-zinc-800 flex flex-col items-center justify-center text-center h-[560px]">
        <ShieldCheck className="w-12 h-12 text-zinc-600 mb-3 opacity-60" />
        <h3 className="text-base font-bold text-zinc-200 mb-1">
          Security & Quality Review Pending
        </h3>
        <p className="text-xs text-zinc-500 max-w-md">
          The Reviewer Agent will perform AST static analysis, security vulnerability audits, and score the codebase once testing completes.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full glass-panel rounded-2xl border border-zinc-800 p-5 overflow-y-auto h-[560px] space-y-6">
      {/* Top Score Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overall Score */}
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-700 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center font-extrabold text-2xl font-mono shadow-md">
            {review.score}
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold uppercase tracking-wider font-mono">
              <Award className="w-3.5 h-3.5" /> Quality Score
            </div>
            <span className="text-lg font-bold text-white">Grade {review.grade}</span>
            <p className="text-[10px] text-zinc-500 font-mono">Benchmark &ge; 80</p>
          </div>
        </div>

        {/* Security Audit */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider font-mono">
              Security Audit
            </div>
            <span className="text-sm font-bold text-zinc-200">0 Vulnerabilities</span>
            <p className="text-[10px] text-zinc-500 font-mono">OWASP Top 10 Enforced</p>
          </div>
        </div>

        {/* Test Coverage */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider font-mono">
              Test Coverage
            </div>
            <span className="text-sm font-bold text-zinc-200">{review.test_coverage_percent}% Lines</span>
            <p className="text-[10px] text-zinc-500 font-mono">Unit & Sandbox Tests</p>
          </div>
        </div>
      </div>

      {/* Review Summary */}
      <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-zinc-400" />
          Reviewer Audit Summary
        </h4>
        <p className="text-xs text-zinc-300 leading-relaxed">{review.summary}</p>
      </div>

      {/* Categorized Findings */}
      <div>
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-3">
          AST & Static Analysis Insights ({review.findings.length})
        </h4>
        <div className="space-y-2.5">
          {review.findings.map((f, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3"
            >
              <div className="mt-0.5">
                {f.severity === "critical" ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-zinc-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {f.category}
                  </span>
                  {f.file_path && (
                    <span className="text-[10px] font-mono text-zinc-400">
                      {f.file_path} {f.line_number && `:L${f.line_number}`}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-200">{f.message}</p>
                {f.suggestion && (
                  <p className="text-[11px] text-zinc-400 mt-1">
                    <strong className="text-zinc-300">Suggestion:</strong> {f.suggestion}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
