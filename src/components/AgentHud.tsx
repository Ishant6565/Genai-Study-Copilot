import React from 'react';
import type { DifficultyLevel, EvaluationResult } from '../chess/types';
import { AI_LEVELS } from '../chess/ai';
import type { AgentCommentary } from '../services/chessAgent';
import { Cpu, Sparkles, HelpCircle, Loader2, Zap, AlertTriangle } from 'lucide-react';

interface AgentHudProps {
  level: DifficultyLevel;
  onLevelChange: (lvl: DifficultyLevel) => void;
  commentary?: AgentCommentary | null;
  evaluation?: EvaluationResult | null;
  isAiThinking: boolean;
  onGetHint: () => void;
  hintText?: string | null;
}

export const AgentHud: React.FC<AgentHudProps> = ({
  level,
  onLevelChange,
  commentary,
  evaluation,
  isAiThinking,
  onGetHint,
  hintText,
}) => {
  const currentPersona = AI_LEVELS[level];

  return (
    <div className="w-full rounded-2xl bg-[#0e0e11] border border-white/15 p-5 shadow-2xl flex flex-col space-y-4">
      
      {/* 1. Level / Persona Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-black text-xl flex items-center justify-center font-bold shadow-md shrink-0">
            {currentPersona.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-sm sm:text-base text-white">
                {currentPersona.name}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-white border border-white/20">
                Elo {currentPersona.elo}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-light">
              {currentPersona.playstyle} &bull; Search Depth: {currentPersona.depth}
            </p>
          </div>
        </div>

        {/* Level Selector Dropdown / Pills */}
        <div className="flex items-center gap-1 bg-[#16161a] p-1 rounded-xl border border-white/10">
          {(Object.keys(AI_LEVELS) as DifficultyLevel[]).map((lvl) => {
            const isSelected = level === lvl;
            const p = AI_LEVELS[lvl];
            return (
              <button
                key={lvl}
                onClick={() => onLevelChange(lvl)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  isSelected
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title={`${p.name} (Elo ${p.elo})`}
              >
                {p.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Live Agent Commentary Bubble */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-xs font-mono font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Agent Analysis & Move Commentary
          </span>

          {isAiThinking && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-300 animate-pulse">
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
              Thinking...
            </span>
          )}
        </div>

        <p className="text-xs text-zinc-200 leading-relaxed font-light">
          {commentary?.summary || "Game started. The board is ready. Make your opening move!"}
        </p>

        {/* Tactical Threat Warnings */}
        {commentary?.threatWarning && (
          <div className="mt-2.5 p-2 rounded-lg bg-zinc-800/60 border border-zinc-600/50 flex items-start gap-2 text-[11px] text-zinc-200">
            <AlertTriangle className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
            <span>{commentary.threatWarning}</span>
          </div>
        )}
      </div>

      {/* 3. Live Chain-of-Thought & Telemetry */}
      {evaluation && (
        <div className="p-3.5 rounded-xl bg-[#09090b] border border-white/10 font-mono text-[11px] space-y-2">
          <div className="flex items-center justify-between text-zinc-400 border-b border-white/5 pb-2">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Cpu className="w-3 h-3 text-white" />
              Engine Metrics
            </span>
            <div className="flex items-center gap-3">
              <span>Nodes: <strong className="text-white">{evaluation.nodesEvaluated.toLocaleString()}</strong></span>
              <span>Depth: <strong className="text-white">{evaluation.depth}</strong></span>
            </div>
          </div>

          {evaluation.bestLine.length > 0 && (
            <div className="pt-1 text-zinc-400">
              <span className="text-zinc-500">Calculated Best Line: </span>
              <span className="text-white font-medium">{evaluation.bestLine.slice(0, 5).join(' ')}</span>
            </div>
          )}
        </div>
      )}

      {/* 4. Coach Hint Action & Display */}
      <div>
        <button
          onClick={onGetHint}
          disabled={isAiThinking}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Ask AI Coach for a Hint</span>
        </button>

        {hintText && (
          <div className="mt-3 p-3 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-zinc-200 animate-fade-in flex items-start gap-2">
            <Zap className="w-4 h-4 text-white shrink-0 mt-0.5" />
            <p className="font-light leading-relaxed">{hintText}</p>
          </div>
        )}
      </div>

    </div>
  );
};
