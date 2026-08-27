import React from 'react';
import { Heart } from 'lucide-react';
import { GithubIcon } from './icons/GithubIcon';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-black py-12 px-4 sm:px-6 lg:px-8 text-xs text-zinc-400 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        
        {/* Brand & Author */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-base">♟ CHESS AI</span>
            <span className="text-[10px] font-mono text-zinc-500">v1.0.0</span>
          </div>
          <p className="text-zinc-500 text-xs font-light max-w-sm">
            Autonomous multi-level chess agent engineered with Minimax Alpha-Beta search, PST heuristics, and real-time commentary.
          </p>
        </div>

        {/* Center Credits */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-zinc-400 fill-zinc-400" />
            <span>by</span>
            <a
              href="https://github.com/Ishant6565"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline font-semibold"
            >
              Ishant6565
            </a>
          </div>
          <span className="text-[11px] text-zinc-600 font-mono">
            Open Source under MIT License &bull; 2026
          </span>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-4 text-zinc-400">
          <a
            href="https://github.com/Ishant6565/CHESS-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <GithubIcon className="w-4 h-4" />
            <span>CHESS-AI Repository</span>
          </a>
          <a
            href="https://github.com/Ishant6565"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Developer Profile
          </a>
        </div>

      </div>
    </footer>
  );
};
