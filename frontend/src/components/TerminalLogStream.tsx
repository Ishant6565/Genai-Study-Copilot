"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, 
  Trash2, 
  ArrowDown, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  BrainCircuit 
} from 'lucide-react';

interface TerminalLogStreamProps {
  logs: string;
  agentThoughts: string[];
}

export const TerminalLogStream: React.FC<TerminalLogStreamProps> = ({
  logs,
  agentThoughts,
}) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showThoughts, setShowThoughts] = useState(true);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const rawLines = logs.split('\n');
  const filteredLines = searchQuery
    ? rawLines.filter((l) => l.toLowerCase().includes(searchQuery.toLowerCase()))
    : rawLines;

  return (
    <div className="w-full glass-panel rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col h-[280px] bg-[#05080E]">
      {/* Terminal Top Bar */}
      <div className="p-2.5 bg-slate-950/90 border-b border-white/[0.08] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <TerminalIcon className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200">Sandbox Docker Stream</span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">(/dev/pts/0 — ephemeral container)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Filter logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-200 placeholder-slate-500 w-32 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded-lg border text-xs transition-all ${
              autoScroll ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Auto-scroll"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collapsible Chain-of-Thought Accordion */}
      {agentThoughts.length > 0 && (
        <div className="bg-indigo-950/30 border-b border-indigo-500/20 px-3 py-1.5 text-xs text-indigo-300 flex items-center justify-between cursor-pointer" onClick={() => setShowThoughts(!showThoughts)}>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
            <span>Agent Reasoning: <strong>{agentThoughts[agentThoughts.length - 1]}</strong></span>
          </div>
          {showThoughts ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </div>
      )}

      {/* Terminal Output Area */}
      <div className="flex-1 overflow-auto p-3 font-mono text-[11px] leading-relaxed select-text space-y-1 text-slate-300">
        {filteredLines.map((line, idx) => {
          let lineClass = "text-slate-300";
          if (line.includes("PASS") || line.includes("✓")) {
            lineClass = "text-emerald-400 font-semibold";
          } else if (line.includes("FAIL") || line.includes("✗") || line.includes("AssertionError")) {
            lineClass = "text-rose-400 font-semibold bg-rose-500/10 px-1 rounded";
          } else if (line.includes("[SANDBOX]") || line.includes("docker run")) {
            lineClass = "text-cyan-400";
          } else if (line.includes("Self-Healing") || line.includes("ALERT")) {
            lineClass = "text-amber-400 font-semibold";
          }

          return (
            <div key={idx} className={lineClass}>
              {line || '\n'}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
