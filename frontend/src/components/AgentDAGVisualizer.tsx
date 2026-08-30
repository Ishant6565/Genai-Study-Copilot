"use client";

import React from 'react';
import { 
  Crown, 
  Code2, 
  FlaskConical, 
  ShieldCheck, 
  FileText, 
  RotateCcw, 
  Check, 
  Loader2, 
  ArrowRight 
} from 'lucide-react';
import { AgentRole, ProjectStatus } from '@/lib/types';

interface AgentDAGVisualizerProps {
  activeAgent: AgentRole;
  status: ProjectStatus;
}

export const AgentDAGVisualizer: React.FC<AgentDAGVisualizerProps> = ({
  activeAgent,
  status,
}) => {
  const agents = [
    {
      id: "manager",
      name: "Manager Agent",
      role: "Spec & Task DAG",
      icon: Crown,
    },
    {
      id: "developer",
      name: "Developer Agent",
      role: "Code Generation",
      icon: Code2,
    },
    {
      id: "tester",
      name: "Tester Agent",
      role: "Docker Test Suite",
      icon: FlaskConical,
    },
    {
      id: "reviewer",
      name: "Reviewer Agent",
      role: "Security & AST",
      icon: ShieldCheck,
    },
    {
      id: "documentation",
      name: "Doc Agent",
      role: "README & OpenAPI",
      icon: FileText,
    },
  ];

  const getAgentState = (agentId: string) => {
    if (status === "completed") return "completed";
    if (activeAgent === agentId) return "active";

    const order = ["manager", "developer", "tester", "reviewer", "documentation"];
    const currentIndex = order.indexOf(activeAgent);
    const thisIndex = order.indexOf(agentId);

    if (thisIndex < currentIndex) return "completed";
    return "pending";
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-4 border border-zinc-800 relative overflow-hidden">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
            Multi-Agent State Machine (LangGraph DAG)
          </h3>
        </div>
        
        {status === "self_healing" && (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-200 border border-zinc-700 text-[11px] font-mono font-semibold animate-pulse">
            <RotateCcw className="w-3 h-3 animate-spin" />
            <span>Self-Correction Loop Active</span>
          </div>
        )}
      </div>

      {/* Nodes Pipeline */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
        {agents.map((agent, index) => {
          const Icon = agent.icon;
          const state = getAgentState(agent.id);
          const isActive = state === "active" || (agent.id === "developer" && status === "self_healing");
          const isCompleted = state === "completed";

          return (
            <div key={agent.id} className="relative group">
              <div
                className={`p-3 rounded-xl border transition-all duration-300 flex flex-col justify-between h-full ${
                  isActive
                    ? 'border-white bg-zinc-900 text-white shadow-lg ring-1 ring-white/30 scale-[1.02]'
                    : isCompleted
                    ? 'bg-zinc-950/80 border-zinc-800 text-zinc-300'
                    : 'bg-black border-zinc-900 text-zinc-600 opacity-40'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-white text-black' : isCompleted ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-zinc-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {isActive ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  ) : isCompleted ? (
                    <Check className="w-3.5 h-3.5 text-zinc-200 font-bold" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-semibold truncate text-zinc-100">{agent.name}</h4>
                  <p className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">{agent.role}</p>
                </div>
              </div>

              {index < agents.length - 1 && (
                <div className="hidden sm:block absolute top-1/2 -right-2.5 transform -translate-y-1/2 z-10 text-zinc-700">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Self-Healing Loopback indicator */}
      {status === "self_healing" && (
        <div className="mt-3 p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700 flex items-center justify-between text-xs text-zinc-300 font-mono">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 animate-spin text-white" />
            <span>
              <strong>Feedback Router:</strong> Stack trace parsed from Tester Agent ➔ Developer Agent applying patch
            </span>
          </div>
          <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-white font-mono">Attempt 1 / 3</span>
        </div>
      )}
    </div>
  );
};
