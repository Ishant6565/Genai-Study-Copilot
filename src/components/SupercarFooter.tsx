import React from 'react';
import { GithubIcon } from './icons/GithubIcon';

export const SupercarFooter: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-black py-12 px-4 sm:px-6 lg:px-8 text-xs text-zinc-400 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-white text-base tracking-widest uppercase">
              APEX<span className="text-red-500">.HYPERCARS</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-500">v2.0 Commercial Edition</span>
          </div>
          <p className="text-zinc-500 text-xs font-light max-w-sm">
            Commercial-grade Supercar Showcase, Exploded Engine X-Ray & Multi-Architecture Acoustic Telemetry Platform.
          </p>
        </div>

        {/* Center Credits */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
            <span>Engineered with passion by</span>
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
            High-Performance Automotive Engineering &bull; MIT License 2026
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4 text-zinc-400">
          <a
            href="https://github.com/Ishant6565"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub Profile</span>
          </a>
        </div>

      </div>
    </footer>
  );
};
