'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  BookOpen,
  FileText,
  Copy,
  Check,
  Download,
  Layers,
  ChevronDown,
  Loader2,
  Bookmark,
  BookCheck
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/layout/AuthContext';
import { SummaryData, DocumentItem } from '@/types';
import { formatDate } from '@/lib/utils';

export default function SummariesPage() {
  const searchParams = useSearchParams();
  const docIdParam = searchParams.get('docId');

  const { activeDocument } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [focusArea, setFocusArea] = useState('Comprehensive');

  useEffect(() => {
    async function loadData() {
      const docs = await api.getDocuments();
      setDocuments(docs);
      const initialDocId = docIdParam || activeDocument?.id || (docs.length > 0 ? docs[0].id : '');
      if (initialDocId) {
        setSelectedDocId(initialDocId);
        loadSummaryForDoc(initialDocId);
      }
    }
    loadData();
  }, [docIdParam, activeDocument]);

  const loadSummaryForDoc = async (docId: string) => {
    try {
      const list = await api.getSummaries(docId);
      if (list.length > 0) {
        setSummary(list[0]);
      } else {
        setSummary(null);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const handleGenerateSummary = async () => {
    if (!selectedDocId || isGenerating) return;
    setIsGenerating(true);
    try {
      const newSummary = await api.generateSummary(selectedDocId, focusArea);
      setSummary(newSummary);
    } catch (err: any) {
      alert(`Summary generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    const fullText = `# ${summary.title}\n\n## Quick Summary\n${summary.quick_summary}\n\n## Detailed Breakdown\n${summary.detailed_summary}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-sky-500" />
            <span>AI Executive Summaries</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Distill complex multi-page textbooks and research notes into structured insights, core concepts, and key definitions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Document Selector */}
          <select
            value={selectedDocId}
            onChange={(e) => {
              setSelectedDocId(e.target.value);
              loadSummaryForDoc(e.target.value);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none shadow-sm cursor-pointer"
          >
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title}
              </option>
            ))}
          </select>

          {/* Focus Area */}
          <select
            value={focusArea}
            onChange={(e) => setFocusArea(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none shadow-sm cursor-pointer"
          >
            <option value="Comprehensive">Comprehensive Overview</option>
            <option value="Exam Prep">Exam Preparation & High Yield</option>
            <option value="Architecture">Systems & Architecture Deep Dive</option>
          </select>

          {/* Generate Button */}
          <button
            onClick={handleGenerateSummary}
            disabled={isGenerating || !selectedDocId}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{summary ? 'Regenerate Summary' : 'Generate Summary'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Content Display */}
      {summary ? (
        <div className="space-y-6">
          {/* Action Row */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-slate-400 font-medium">
              Generated on {formatDate(summary.created_at)}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Copied Markdown</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Summary Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-500/10 via-indigo-500/5 to-purple-500/10 border border-sky-500/20 dark:border-sky-500/10 space-y-2">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Bookmark className="w-4 h-4" />
              <span>Executive Overview</span>
            </div>
            <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
              {summary.quick_summary}
            </p>
          </div>

          {/* Two Column Breakdown: Key Concepts & Definitions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Concepts */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <BookCheck className="w-4 h-4" />
                <span>Crucial Concepts to Master</span>
              </div>
              <ul className="space-y-2.5">
                {summary.key_concepts.map((concept, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-2.5 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200"
                  >
                    <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{concept}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Definitions Glossary */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>Terminology Glossary</span>
              </div>
              <div className="space-y-2.5">
                {summary.definitions.map((def, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1"
                  >
                    <h4 className="text-xs font-bold text-sky-600 dark:text-sky-400">
                      {def.term}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {def.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Structured Summary */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
              Detailed Structured Notes
            </h3>
            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans space-y-4">
              {summary.detailed_summary}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 text-center max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              No Summary Generated Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click below to generate an AI study summary from <strong>{selectedDoc?.title || 'your document'}</strong>.
            </p>
          </div>
          <button
            onClick={handleGenerateSummary}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-500/20 transition-all"
          >
            Generate Summary Now
          </button>
        </div>
      )}
    </div>
  );
}
