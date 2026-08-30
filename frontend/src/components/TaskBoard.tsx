"use client";

import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Loader2, 
  Layers, 
  FileCode2, 
  ChevronRight, 
  AlertCircle 
} from 'lucide-react';
import { TaskItem } from '@/lib/types';

interface TaskBoardProps {
  tasks: TaskItem[];
  specSummary: string;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  specSummary,
}) => {
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="w-full glass-panel rounded-2xl p-4 md:p-5 flex flex-col h-full border border-zinc-800">
      {/* Header & Progress */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-zinc-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
            Task Execution DAG
          </h3>
        </div>
        <span className="text-xs font-semibold text-zinc-400 font-mono">
          {completedCount}/{tasks.length} ({progressPercent}%)
        </span>
      </div>

      {/* Monochrome Progress Bar */}
      <div className="w-full bg-zinc-900 rounded-full h-1.5 mb-4 overflow-hidden border border-zinc-800">
        <div 
          className="bg-white h-full transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Spec Summary Card */}
      {specSummary && (
        <div className="mb-4 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-mono">
          <span className="font-semibold text-white">SPEC: </span>
          {specSummary}
        </div>
      )}

      {/* Task List */}
      <div className="space-y-2.5 overflow-y-auto max-h-[420px] pr-1">
        {tasks.map((task) => {
          const isPending = task.status === "pending";
          const isInProgress = task.status === "in_progress";
          const isCompleted = task.status === "completed";

          return (
            <div
              key={task.id}
              className={`p-3 rounded-xl border transition-all duration-200 flex items-start justify-between gap-3 ${
                isInProgress
                  ? 'bg-zinc-900 border-white text-white shadow-sm ring-1 ring-white/20'
                  : isCompleted
                  ? 'bg-zinc-950/60 border-zinc-850 text-zinc-300'
                  : 'bg-black border-zinc-900 opacity-40 text-zinc-600'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="mt-0.5">
                  {isInProgress ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-zinc-300" />
                  ) : (
                    <Clock className="w-4 h-4 text-zinc-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {task.id}
                    </span>
                    <h4 className={`text-xs font-semibold truncate ${
                      isCompleted ? 'text-zinc-200' : isInProgress ? 'text-white' : 'text-zinc-500'
                    }`}>
                      {task.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                    {task.description}
                  </p>

                  {task.file_targets && task.file_targets.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {task.file_targets.map((file, i) => (
                        <span 
                          key={i} 
                          className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800"
                        >
                          <FileCode2 className="w-3 h-3 text-zinc-400" />
                          {file.split('/').pop()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
