'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  FileText,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Clock,
  Layers,
  MessageSquare
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/layout/AuthContext';
import { Conversation, Message, CitationItem, DocumentItem } from '@/types';
import { cn, formatDate } from '@/lib/utils';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const docIdParam = searchParams.get('docId');
  const convIdParam = searchParams.get('id');

  const { activeDocument } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<CitationItem | null>(null);
  const [selectedModel, setSelectedModel] = useState<'gpt-4o-mini' | 'gpt-4o'>('gpt-4o-mini');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    api.getDocuments().then(setDocuments);
  }, []);

  useEffect(() => {
    if (convIdParam) {
      loadConversation(convIdParam);
    }
  }, [convIdParam]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const loadConversations = async () => {
    try {
      const list = await api.getConversations();
      setConversations(list);
      if (list.length > 0 && !activeConvId) {
        loadConversation(convIdParam || list[0].id);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  const loadConversation = async (id: string) => {
    setActiveConvId(id);
    try {
      const conv = await api.getConversation(id);
      setMessages(conv.messages || []);
    } catch (err) {
      console.error('Error loading conversation:', err);
    }
  };

  const handleNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputQuery.trim();
    if (!query || isGenerating) return;

    setInputQuery('');
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConvId || 'new',
      role: 'user',
      content: query,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setIsGenerating(true);

    try {
      const targetDocId = docIdParam || activeDocument?.id || undefined;
      const res = await api.sendMessage({
        message: query,
        conversation_id: activeConvId || undefined,
        document_id: targetDocId,
        model: selectedModel
      });

      if (!activeConvId) {
        setActiveConvId(res.conversation_id);
        loadConversations();
      }

      setMessages(prev => [...prev, res.message]);
    } catch (err: any) {
      console.error('Error in RAG generation:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const promptSuggestions = [
    'How does sliding-window chunk overlap prevent context loss?',
    'What are the 3 core stages of the enterprise RAG pipeline?',
    'Explain pgvector HNSW indexing mechanics and time complexity.',
    'How does the system ensure strict zero-hallucination answers?'
  ];

  return (
    <div className="h-[calc(100vh-6.5rem)] flex gap-4 animate-in fade-in duration-200">
      {/* Left Chat History Sidebar */}
      <div className="hidden lg:flex w-72 flex-col justify-between rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Study Chats
            </h2>
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-500/20 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Conversation List */}
          <div className="space-y-1 max-h-[calc(100vh-16rem)] overflow-y-auto">
            {conversations.map((conv) => {
              const isActive = activeConvId === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={cn(
                    'w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-left transition-all group',
                    isActive
                      ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold border border-sky-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{conv.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatDate(conv.updated_at)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Model Selector & RAG Engine Indicator */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span>RAG Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-sky-600 dark:text-sky-400 outline-none cursor-pointer"
            >
              <option value="gpt-4o-mini">GPT-4o Mini (Fast)</option>
              <option value="gpt-4o">GPT-4o (Reasoning)</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Anti-Hallucination Guard Active</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                StudyPilot AI Copilot
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Context:{' '}
                <span className="text-sky-600 dark:text-sky-400 font-semibold">
                  {activeDocument ? activeDocument.title : 'Global Knowledge Base'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="lg:hidden flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            /* Empty State / Suggested Prompts */
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-8 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-lg shadow-sky-500/10">
                <Sparkles className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  What would you like to master today?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Ask any question regarding your uploaded study documents. Answers are strictly grounded with verifiable page citations.
                </p>
              </div>

              {/* Prompt Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
                {promptSuggestions.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInputQuery(prompt);
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-sky-500/40 hover:bg-sky-50/50 dark:hover:bg-sky-500/5 transition-all text-xs text-slate-700 dark:text-slate-300 font-medium"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages List */
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-3 max-w-3xl',
                    isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1',
                      isUser
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                        : 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white'
                    )}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Content Bubble */}
                  <div className="space-y-2.5 min-w-0">
                    <div
                      className={cn(
                        'p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap',
                        isUser
                          ? 'bg-sky-600 text-white rounded-tr-none font-medium'
                          : 'bg-slate-100 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80 rounded-tl-none'
                      )}
                    >
                      {msg.content}
                    </div>

                    {/* Citations Cards & Action Row */}
                    {!isUser && (
                      <div className="space-y-2 pt-1">
                        {/* Inline Citations Cards */}
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              <BookOpen className="w-3 h-3 text-sky-500" />
                              <span>Verified Citations ({msg.citations.length})</span>
                            </span>

                            <div className="flex flex-wrap gap-2">
                              {msg.citations.map((cit, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedCitation(cit)}
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-500/10 border border-sky-500/20 hover:bg-sky-100 dark:hover:bg-sky-500/20 text-[11px] font-semibold text-sky-700 dark:text-sky-300 transition-all"
                                >
                                  <FileText className="w-3 h-3 text-sky-500" />
                                  <span className="max-w-[140px] truncate">{cit.document_title}</span>
                                  <span className="px-1 py-0.2 rounded bg-sky-500/20 text-[10px]">
                                    P.{cit.page_number}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons & Latency Badge */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleCopy(msg.id, msg.content)}
                              className="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
                            >
                              {copiedMsgId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" />
                                  <span className="text-emerald-500">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                            <button className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                          </div>

                          {msg.latency_ms && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Retrieval: {msg.latency_ms.retrieval_ms}ms • Gen: {msg.latency_ms.generation_ms}ms
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Loading Indicator */}
          {isGenerating && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs mt-1">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-tl-none space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching pgvector & synthesizing grounded answer...</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e]">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              type="text"
              placeholder="Ask a question about your study documents..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isGenerating}
              className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isGenerating}
              className="absolute right-2 p-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-40 disabled:hover:bg-sky-600 transition-all shadow-md shadow-sky-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>Powered by OpenAI & pgvector Vector Store</span>
            <span>Press Enter to ask</span>
          </div>
        </div>
      </div>

      {/* Citation Slide-over Inspector */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-md h-full bg-white dark:bg-[#0f172a] border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold text-sm">
                  <BookOpen className="w-4 h-4" />
                  <span>Source Citation Inspector</span>
                </div>
                <button
                  onClick={() => setSelectedCitation(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Document Reference
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {selectedCitation.document_title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold">
                    Page {selectedCitation.page_number}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    Similarity: {Math.round(selectedCitation.similarity_score * 100)}%
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Original Source Snippet
                </span>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                  {selectedCitation.snippet}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedCitation(null)}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-all mt-6"
            >
              Done Reviewing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
