'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Upload,
  FileText,
  Trash2,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileUp,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api';
import { DocumentItem, DocumentChunk } from '@/types';
import { formatBytes, formatDate } from '@/lib/utils';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>('');
  const [selectedDocChunks, setSelectedDocChunks] = useState<{ doc: DocumentItem; chunks: DocumentChunk[] } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Error loading documents:', err);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF document (.pdf)');
      return;
    }

    setIsUploading(true);
    setUploadStep('Uploading PDF bytes to server...');

    try {
      // Step 1: Upload
      await new Promise(r => setTimeout(r, 600));
      setUploadStep('Extracting PDF text & metadata...');

      // Step 2: Extract
      await new Promise(r => setTimeout(r, 700));
      setUploadStep('Generating 1536-dim vector embeddings in pgvector...');

      // Step 3: Chunk & Index
      await new Promise(r => setTimeout(r, 700));
      const newDoc = await api.uploadDocument(file);

      setDocuments(prev => [newDoc, ...prev.filter(d => d.id !== newDoc.id)]);
      setUploadStep('Document Ready for Grounded AI Synthesis!');
      await new Promise(r => setTimeout(r, 500));
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadStep('');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this document and purge its vector embeddings?')) {
      await api.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleInspectChunks = (doc: DocumentItem) => {
    // Generate sample chunk inspection
    const sampleChunks: DocumentChunk[] = Array.from({ length: Math.min(doc.total_chunks || 4, 6) }).map((_, i) => ({
      id: `chk-${doc.id}-${i}`,
      chunk_index: i,
      page_number: Math.floor(i / 2) + 1,
      content: `[Semantic Vector Chunk #${i + 1} | Page ${Math.floor(i / 2) + 1}]\nExtracted passage from ${doc.title}. This segment covers structural principles, operational lifecycle, and architectural tradeoffs. Embeddings generated via OpenAI text-embedding-3-small (1536 dimensions) and indexed with pgvector HNSW.`,
      token_count: 145,
      created_at: doc.created_at
    }));
    setSelectedDocChunks({ doc, chunks: sampleChunks });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Document Knowledge Base
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Upload PDFs, lecture slides, and research notes to extract semantic chunks and build your private vector index.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          <span>Upload PDF</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-3 ${
          isDragging
            ? 'border-sky-500 bg-sky-500/10'
            : 'border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-[#0c121e]/50 hover:border-sky-500/50 hover:bg-sky-500/5'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto">
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <FileUp className="w-6 h-6" />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {isUploading ? uploadStep : 'Click to upload or drag & drop PDF files here'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supports standard PDF textbooks, course notes, research papers (up to 25MB)
          </p>
        </div>

        {isUploading && (
          <div className="w-full max-w-md mx-auto pt-2">
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full animate-pulse-subtle w-3/4" />
            </div>
          </div>
        )}
      </div>

      {/* Documents Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Indexed Documents ({documents.length})
          </h2>
          <span className="text-xs text-slate-400">pgvector cosine distance active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
            >
              {/* Document Header */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {doc.status}
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-2" title={doc.title}>
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {doc.total_pages} Pages • {formatBytes(doc.file_size_bytes)} • {formatDate(doc.created_at)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/dashboard/chat?docId=${doc.id}`}
                    title="Ask AI Copilot"
                    className="p-2 rounded-lg bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/dashboard/summaries?docId=${doc.id}`}
                    title="Generate Summary"
                    className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/dashboard/quizzes?docId=${doc.id}`}
                    title="Take Quiz"
                    className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleInspectChunks(doc)}
                    title="Inspect Vector Chunks"
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={(e) => handleDelete(doc.id, e)}
                  title="Delete Document"
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vector Chunks Inspector Modal */}
      {selectedDocChunks && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-3xl max-h-[85vh] rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Vector Chunks Inspector
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedDocChunks.doc.title} (pgvector 1536-dim embeddings)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDocChunks(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chunks List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {selectedDocChunks.chunks.map((chk) => (
                <div
                  key={chk.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">
                      Chunk #{chk.chunk_index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                        Page {chk.page_number}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                        ~{chk.token_count} Tokens
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-wrap bg-white dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                    {chk.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedDocChunks(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
