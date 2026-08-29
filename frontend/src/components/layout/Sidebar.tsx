'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Layers,
  Activity,
  LogOut,
  Moon,
  Sun,
  GraduationCap,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Documents', href: '/dashboard/documents', icon: FileText },
  { name: 'AI Study Chat', href: '/dashboard/chat', icon: MessageSquare, badge: 'RAG' },
  { name: 'Summaries', href: '/dashboard/summaries', icon: Sparkles },
  { name: 'Quizzes', href: '/dashboard/quizzes', icon: HelpCircle },
  { name: 'Flashcards', href: '/dashboard/flashcards', icon: Layers },
  { name: 'Observability', href: '/dashboard/metrics', icon: Activity, badge: 'P99' },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user, logout, isDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside
      className={cn(
        'w-64 flex-shrink-0 flex flex-col justify-between h-screen border-r bg-white dark:bg-[#0c121e] border-slate-200 dark:border-slate-800 transition-colors duration-200 select-none',
        className
      )}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  StudyPilot
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">GenAI Study Copilot</p>
            </div>
          </Link>
        </div>

        {/* Demo Indicator if active */}
        {isDemo && (
          <div className="mx-4 mt-3 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Demo / Portfolio Mode</span>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="p-3 space-y-1 mt-2">
          <div className="px-3 py-1 text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'text-[10px] font-semibold px-1.5 py-0.5 rounded',
                      isActive
                        ? 'bg-sky-600 text-white dark:bg-sky-400 dark:text-slate-950'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Footer Controls */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-xs text-slate-400 font-medium">Preferences</span>
          <button
            onClick={toggleTheme}
            aria-label="Toggle Dark/Light Mode"
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>

        {/* User Card */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase flex-shrink-0">
              {user?.full_name ? user.full_name.charAt(0) : 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                {user?.full_name || 'Alex Chen'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {user?.email || 'demo@studypilot.ai'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
