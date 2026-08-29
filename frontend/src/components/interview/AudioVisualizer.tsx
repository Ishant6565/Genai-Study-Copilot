'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  isActive: boolean;
  type?: 'ai' | 'user';
  className?: string;
}

export function AudioVisualizer({ isActive, type = 'ai', className }: AudioVisualizerProps) {
  const barCount = 18;

  return (
    <div className={cn('flex items-center justify-center gap-1 h-12 px-4', className)}>
      {Array.from({ length: barCount }).map((_, i) => {
        // Vary heights dynamically based on index and active state
        const delay = (i % 6) * 0.1;
        const baseHeight = isActive ? 12 + ((i * 7) % 24) : 4;

        return (
          <span
            key={i}
            className={cn(
              'w-1 rounded-full transition-all duration-150',
              type === 'ai'
                ? isActive
                  ? 'bg-gradient-to-t from-sky-500 to-indigo-500 animate-pulse'
                  : 'bg-slate-300 dark:bg-slate-700'
                : isActive
                ? 'bg-gradient-to-t from-emerald-500 to-teal-400 animate-pulse'
                : 'bg-slate-300 dark:bg-slate-700'
            )}
            style={{
              height: isActive ? `${baseHeight}px` : '4px',
              animationDelay: `${delay}s`,
              animationDuration: '0.6s'
            }}
          />
        );
      })}
    </div>
  );
}
