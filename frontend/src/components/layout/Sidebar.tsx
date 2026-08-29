'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  FileText,
  Sparkles,
  HelpCircle,
  Layers,
  Activity,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from './ThemeContext';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Chat with PDF', href: '/dashboard/chat', icon: MessageSquare, badge: 'RAG' },
  { label: 'My Documents', href: '/dashboard/documents', icon: FileText },
  { label: 'Summaries', href: '/dashboard/summaries', icon: Sparkles },
  { label: 'Quizzes & Tests', href: '/dashboard/quizzes', icon: HelpCircle },
  { label: 'Flashcards', href: '/dashboard/flashcards', icon: Layers },
  { label: 'System Stats', href: '/dashboard/metrics', icon: Activity }
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="w-64 h-screen bg-white dark:bg-[#0c121e] border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col flex-shrink-0 transition-colors duration-200">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
              StudyPilot
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              AI
            </span>
          </div>
        </Link>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
          Study Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group',
                isActive
                  ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive
                      ? 'text-sky-600 dark:text-sky-400'
                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-sky-500/15 text-sky-600 dark:text-sky-400 font-mono font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Footer with Dark Mode Toggle */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Theme</span>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Toggle light/dark mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
