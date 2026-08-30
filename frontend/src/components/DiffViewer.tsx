"use client";

import React from 'react';
import { 
  RotateCcw, 
  GitCompare, 
  CheckCircle2, 
  AlertTriangle, 
  FileCode2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DiffEntry } from '@/lib/types';

interface DiffViewerProps {
  diff?: DiffEntry;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ diff }) => {
  if (!diff) {
    return (
      <div className="w-full glass-panel rounded-2xl p-8 border border-white/[0.08] flex flex-col items-center justify-center text-center h-[560px]">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
          <GitCompare className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-200 mb-1">
          No Self-Healing Diffs Recorded Yet
        </h3>
        <p className="text-xs text-slate-400 max-w-md leading-relaxed">
          When the Tester Agent discovers a failing test assertion, the Developer Agent autonomously patches the source code and the exact before/after Git diff will appear here.
        </p>
      </div>
    );
  }

  const oldLines = diff.old_content.split('\n');
  const newLines = diff.new_content.split('\n');

  return (
    <div className="w-full glass-panel rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col h-[560px]">
      {/* Diff Banner */}
      <div className="p-4 bg-gradient-to-r from-rose-950/40 via-indigo-950/30 to-emerald-950/40 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">
                Self-Healing Iteration #{diff.iteration}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-400">
                {diff.file_path}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              <strong>Root Cause & Fix:</strong> {diff.reason}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Self-Corrected & Validated
          </span>
        </div>
      </div>

      {/* Side-by-Side Diff Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 flex-1 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
        {/* Left Column: Original Buggy Code */}
        <div className="flex flex-col bg-[#0E0B12]/80 overflow-hidden">
          <div className="p-2.5 bg-rose-950/30 border-b border-rose-500/20 flex items-center justify-between text-xs font-mono text-rose-300 px-4">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Original (Failed Assertion)
            </span>
            <span className="text-[10px] text-rose-400/80">- Old Version</span>
          </div>

          <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed space-y-0.5 text-slate-300">
            {oldLines.map((line, idx) => (
              <div 
                key={idx} 
                className={`px-1.5 py-0.5 rounded ${
                  line.includes("createTodo") || line.includes("title || ''")
                    ? "bg-rose-500/20 text-rose-200 border-l-2 border-rose-500" 
                    : "text-slate-400"
                }`}
              >
                <span className="inline-block w-6 text-slate-600 text-right mr-3 select-none">{idx + 1}</span>
                {line || '\n'}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Self-Corrected Code */}
        <div className="flex flex-col bg-[#08120F]/80 overflow-hidden">
          <div className="p-2.5 bg-emerald-950/30 border-b border-emerald-500/20 flex items-center justify-between text-xs font-mono text-emerald-300 px-4">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Autonomous Self-Healed Patch
            </span>
            <span className="text-[10px] text-emerald-400/80">+ Validated Version</span>
          </div>

          <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed space-y-0.5 text-slate-200">
            {newLines.map((line, idx) => (
              <div 
                key={idx} 
                className={`px-1.5 py-0.5 rounded ${
                  line.includes("Validation Error") || line.includes("400") || line.includes("title.trim()") || line.includes("SELF-HEALED")
                    ? "bg-emerald-500/20 text-emerald-200 border-l-2 border-emerald-400 font-semibold" 
                    : "text-slate-300"
                }`}
              >
                <span className="inline-block w-6 text-slate-600 text-right mr-3 select-none">{idx + 1}</span>
                {line || '\n'}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
