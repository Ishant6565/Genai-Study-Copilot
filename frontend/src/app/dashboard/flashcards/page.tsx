'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Sparkles,
  Shuffle,
  CheckCircle2,
  Bookmark,
  Loader2,
  BookOpen
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/layout/AuthContext';
import { Flashcard, DocumentItem } from '@/types';
import { cn } from '@/lib/utils';

export default function FlashcardsPage() {
  const searchParams = useSearchParams();
  const docIdParam = searchParams.get('docId');

  const { activeDocument } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadData() {
      const docs = await api.getDocuments();
      setDocuments(docs);
      const initialDocId = docIdParam || activeDocument?.id || (docs.length > 0 ? docs[0].id : '');
      if (initialDocId) {
        setSelectedDocId(initialDocId);
        loadFlashcardsForDoc(initialDocId);
      }
    }
    loadData();
  }, [docIdParam, activeDocument]);

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flashcards, currentIndex]);

  const loadFlashcardsForDoc = async (docId: string) => {
    try {
      const list = await api.getFlashcards(docId);
      setFlashcards(list);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error('Error fetching flashcards:', err);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!selectedDocId || isGenerating) return;
    setIsGenerating(true);
    try {
      const newCards = await api.generateFlashcards({
        document_id: selectedDocId,
        num_cards: 6,
        category: 'Core Concepts'
      });
      setFlashcards(newCards);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err: any) {
      alert(`Flashcards generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (flashcards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    if (flashcards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const toggleMastered = (id: string) => {
    setMasteredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const currentCard = flashcards[currentIndex];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-purple-500" />
            <span>Interactive Concept Flashcards</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Accelerate recall with 3D flip flashcards synthesized from your study documents.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedDocId}
            onChange={(e) => {
              setSelectedDocId(e.target.value);
              loadFlashcardsForDoc(e.target.value);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none shadow-sm cursor-pointer"
          >
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleShuffle}
            disabled={flashcards.length === 0}
            className="p-2.5 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
            title="Shuffle Deck"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={handleGenerateFlashcards}
            disabled={isGenerating || !selectedDocId}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Creating Deck...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Flashcards</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3D Flashcard Deck Runner */}
      {flashcards.length > 0 && currentCard ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Deck Stats Header */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-2">
            <span>
              Card {currentIndex + 1} of {flashcards.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">
                {currentCard.category}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                {currentCard.difficulty}
              </span>
            </div>
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="perspective-1000 w-full h-80 sm:h-96 cursor-pointer select-none"
          >
            <div
              className={cn(
                'relative w-full h-full transform-style-preserve-3d transition-transform duration-500 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800/80',
                isFlipped && 'rotate-y-180'
              )}
            >
              {/* Front Side */}
              <div className="absolute inset-0 backface-hidden p-8 rounded-3xl bg-white dark:bg-[#0c121e] flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold uppercase tracking-wider">Question / Concept</span>
                  <span className="text-[11px] font-mono">Click card or press Space to flip ↺</span>
                </div>

                <div className="text-center my-auto px-4">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                    {currentCard.front}
                  </h2>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px]">Category: {currentCard.category}</span>
                  <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Flip Card</span>
                  </div>
                </div>
              </div>

              {/* Back Side (Answer) */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 p-8 rounded-3xl bg-gradient-to-tr from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-purple-300">
                  <span className="font-bold uppercase tracking-wider">Answer & Theoretical Context</span>
                  <span className="text-[11px] font-mono">Click to flip back ↺</span>
                </div>

                <div className="text-center my-auto px-4">
                  <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
                    {currentCard.back}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-purple-300">
                  <span className="text-[11px]">Verified from document</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMastered(currentCard.id);
                    }}
                    className={cn(
                      'flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                      masteredIds.has(currentCard.id)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    )}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{masteredIds.has(currentCard.id) ? 'Mastered ✓' : 'Mark as Mastered'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between px-4">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="text-center text-xs text-slate-400">
              <span className="font-semibold text-emerald-500">{masteredIds.size}</span> of {flashcards.length} mastered
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02]"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 text-center max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              No Flashcards Created Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click below to generate high-yield study flashcards from your indexed study notes.
            </p>
          </div>
          <button
            onClick={handleGenerateFlashcards}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/20 transition-all"
          >
            Generate Flashcards Now
          </button>
        </div>
      )}
    </div>
  );
}
