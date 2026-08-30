"use client";

import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Terminal, 
  Download, 
  Github, 
  Sparkles, 
  Clock, 
  Coins, 
  Layers, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';
import { ProjectStatus } from '@/lib/types';

interface HeaderProps {
  projectName: string;
  status: ProjectStatus;
  tokens: number;
  cost: number;
  totalFiles: number;
  onExportZip: () => void;
  onOpenGitHubModal: () => void;
  isBuilding: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  projectName,
  status,
  tokens,
  cost,
  totalFiles,
  onExportZip,
  onOpenGitHubModal,
  isBuilding,
}) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isBuilding) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (status === "idle") {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isBuilding, status]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}s`;
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'planning':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-200 border border-zinc-700 animate-pulse">
            Manager Planning
          </span>
        );
      case 'developing':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-100 border border-zinc-600 animate-pulse">
            Developing Code
          </span>
        );
      case 'testing':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-200 border border-zinc-700 animate-pulse">
            Sandbox Testing
          </span>
        );
      case 'self_healing':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-100 border border-zinc-500 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Self-Healing Fix
          </span>
        );
      case 'reviewing':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-200 border border-zinc-700 animate-pulse">
            Security Audit
          </span>
        );
      case 'documenting':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-200 border border-zinc-700 animate-pulse">
            Documentation
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-black border border-white font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" /> Project Ready
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
            Idle Ready
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-zinc-800/80 px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-bold shadow-md">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-sm text-white">
              MYAPPMYWEB
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              v1.0
            </span>
          </div>
          <p className="text-xs text-zinc-400 truncate max-w-[200px] md:max-w-xs">
            {projectName || "Autonomous Multi-Agent Workspace"}
          </p>
        </div>
      </div>

      {/* Telemetry Stats */}
      <div className="hidden lg:flex items-center gap-4 text-xs text-zinc-300 font-mono">
        <div className="flex items-center gap-2 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-500">TIME:</span>
          <span className="font-semibold text-zinc-200">{formatTimer(seconds)}</span>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
          <Coins className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-500">TOKENS:</span>
          <span className="font-semibold text-zinc-200">{tokens.toLocaleString()}</span>
          <span className="text-[11px] text-zinc-500">(${cost.toFixed(3)})</span>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
          <Layers className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-500">FILES:</span>
          <span className="font-semibold text-zinc-200">{totalFiles}</span>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="flex items-center gap-2.5">
        {getStatusBadge()}

        <button
          onClick={onExportZip}
          disabled={totalFiles === 0}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span>ZIP</span>
        </button>

        <button
          onClick={onOpenGitHubModal}
          disabled={totalFiles === 0}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-zinc-200 text-black shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Github className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Push GitHub</span>
        </button>
      </div>
    </header>
  );
};
