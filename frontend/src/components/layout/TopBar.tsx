'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Bell,
  ChevronDown,
  FileText,
  Menu,
  X,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { api } from '@/lib/api';
import { DocumentItem } from '@/types';
import { cn } from '@/lib/utils';

export function TopBar({ onOpenMobileMenu }: { onOpenMobileMenu?: () => void }) {
  const { activeDocument, setActiveDocument } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);

  useEffect(() => {
    async function fetchDocs() {
      const docs = await api.getDocuments();
      setDocuments(docs);
    }
    fetchDocs();
  }, []);

  return (
    <header className="h-16 border-b bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Left: Document Context Selector & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Active Study Document Selector */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-xs font-medium text-slate-800 dark:text-slate-200 transition-all max-w-[280px] md:max-w-md truncate"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
            <span className="truncate">
              {activeDocument ? activeDocument.title : 'All Documents (Global Workspace)'}
            </span>
            <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform', isDropdownOpen && 'rotate-180')} />
          </button>

          {/* Document Context Menu Dropdown */}
          {isDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-80 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Active Study Context
              </div>

              <button
                onClick={() => {
                  setActiveDocument(null);
                  setIsDropdownOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
                  activeDocument === null && 'text-sky-600 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-500/10'
                )}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                  <span>Global Workspace (All Notes)</span>
                </div>
                {activeDocument === null && <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />}
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

              {documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    setActiveDocument(doc);
                    setIsDropdownOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
                    activeDocument?.id === doc.id && 'text-sky-600 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-500/10'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{doc.title}</span>
                  </div>
                  {activeDocument?.id === doc.id && <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Quick Search Pill & Notifications */}
      <div className="flex items-center gap-3">
        {/* Global Search Shortcut Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-400">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Quick Search...</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            ⌘K
          </kbd>
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setHasNotifications(false)}
            aria-label="Notifications"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {hasNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-500 animate-ping" />
            )}
            {hasNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
