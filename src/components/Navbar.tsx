import React from 'react';
import type { DifficultyLevel } from '../chess/types';
import { AI_LEVELS } from '../chess/ai';
import { GithubIcon } from './icons/GithubIcon';
import { RotateCw, Settings, PlusCircle } from 'lucide-react';

interface NavbarProps {
  level: DifficultyLevel;
  onNewGame: () => void;
  onFlipBoard: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  level,
  onNewGame,
  onFlipBoard,
  onOpenSettings,
}) => {
  const currentPersona = AI_LEVELS[level];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-black/90 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Author */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-bold text-lg shadow-md">
            ♟
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base tracking-tight text-white">
                CHESS<span className="text-zinc-400">.ai</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider font-semibold rounded-full bg-white/10 text-white border border-white/20 hidden sm:inline-block">
                {currentPersona.title} (Elo {currentPersona.elo})
              </span>
            </div>
            <a
              href="https://github.com/Ishant6565"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1 group"
            >
              by <span className="font-medium text-zinc-300 group-hover:text-white group-hover:underline">Ishant6565</span>
            </a>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* New Game */}
          <button
            onClick={onNewGame}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-black bg-white hover:bg-zinc-200 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Game</span>
          </button>

          {/* Flip Board */}
          <button
            onClick={onFlipBoard}
            className="p-2 rounded-xl text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            title="Flip Board Orientation"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            title="Board & Engine Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* GitHub Repo */}
          <a
            href="https://github.com/Ishant6565/CHESS-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-300 bg-white/5 hover:bg-white/15 hover:text-white border border-white/10 transition-all group"
          >
            <GithubIcon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
            <span>CHESS-AI</span>
          </a>
        </div>

      </div>
    </header>
  );
};
