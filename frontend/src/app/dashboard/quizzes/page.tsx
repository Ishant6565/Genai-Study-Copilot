'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Trophy,
  Award,
  Clock,
  BookOpen,
  Loader2
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/layout/AuthContext';
import { QuizData, DocumentItem, QuizResult } from '@/types';
import { cn } from '@/lib/utils';

export default function QuizzesPage() {
  const searchParams = useSearchParams();
  const docIdParam = searchParams.get('docId');

  const { activeDocument } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Quiz Taking State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: number]: number }>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    async function loadData() {
      const docs = await api.getDocuments();
      setDocuments(docs);
      const initialDocId = docIdParam || activeDocument?.id || (docs.length > 0 ? docs[0].id : '');
      if (initialDocId) {
        setSelectedDocId(initialDocId);
        loadQuizForDoc(initialDocId);
      }
    }
    loadData();
  }, [docIdParam, activeDocument]);

  const loadQuizForDoc = async (docId: string) => {
    try {
      const list = await api.getQuizzes(docId);
      if (list.length > 0) {
        setQuiz(list[0]);
        resetQuizState();
      } else {
        setQuiz(null);
      }
    } catch (err) {
      console.error('Error fetching quiz:', err);
    }
  };

  const resetQuizState = () => {
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setQuizCompleted(false);
    setQuizResult(null);
  };

  const handleGenerateQuiz = async () => {
    if (!selectedDocId || isGenerating) return;
    setIsGenerating(true);
    try {
      const newQuiz = await api.generateQuiz({
        document_id: selectedDocId,
        num_questions: 5,
        difficulty
      });
      setQuiz(newQuiz);
      resetQuizState();
    } catch (err: any) {
      alert(`Quiz generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (optIdx: number) => {
    if (showExplanation || !quiz) return;
    const currentQ = quiz.questions[currentQIndex];
    setSelectedAnswers(prev => ({ ...prev, [currentQ.id]: optIdx }));
    setShowExplanation(true);
  };

  const handleNextQuestion = async () => {
    if (!quiz) return;
    setShowExplanation(false);
    if (currentQIndex < quiz.questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      // Complete quiz
      const formattedAnswers = Object.entries(selectedAnswers).map(([qId, ans]) => ({
        question_id: Number(qId),
        selected_option: ans
      }));
      const result = await api.submitQuiz(quiz.id, formattedAnswers);
      setQuizResult(result);
      setQuizCompleted(true);
    }
  };

  const currentQ = quiz?.questions[currentQIndex];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-indigo-500" />
            <span>Mastery Exam & Quiz Engine</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Evaluate retention with multi-choice exams generated directly from your uploaded study documents.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedDocId}
            onChange={(e) => {
              setSelectedDocId(e.target.value);
              loadQuizForDoc(e.target.value);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none shadow-sm cursor-pointer"
          >
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title}
              </option>
            ))}
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none shadow-sm cursor-pointer"
          >
            <option value="Easy">Easy (Foundations)</option>
            <option value="Medium">Medium (Standard)</option>
            <option value="Hard">Hard (Deep Dive)</option>
          </select>

          <button
            onClick={handleGenerateQuiz}
            disabled={isGenerating || !selectedDocId}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Exam...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate New Quiz</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quiz Runner Experience */}
      {quiz && !quizCompleted && currentQ ? (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Progress Header */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Question {currentQIndex + 1} of {quiz.questions.length}
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                {quiz.difficulty}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-36 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentQIndex + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {currentQ.question}
            </h2>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentQ.id] === optIdx;
                const isCorrect = optIdx === currentQ.correct_answer;

                let optionStyle =
                  'bg-slate-50 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 hover:border-indigo-500/50';

                if (showExplanation) {
                  if (isCorrect) {
                    optionStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold';
                  } else if (isSelected && !isCorrect) {
                    optionStyle = 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300';
                  } else {
                    optionStyle = 'opacity-50 border-slate-200 dark:border-slate-800';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={showExplanation}
                    className={cn(
                      'w-full flex items-center justify-between p-4 rounded-xl border text-xs sm:text-sm text-left transition-all',
                      optionStyle
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {showExplanation && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    )}
                    {showExplanation && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Drawer */}
            {showExplanation && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pedagogical Explanation:</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {currentQ.explanation}
                </p>
              </div>
            )}

            {/* Next / Submit Button */}
            {showExplanation && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]"
                >
                  <span>{currentQIndex < quiz.questions.length - 1 ? 'Next Question' : 'View Results'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : quizCompleted && quizResult ? (
        /* Quiz Results Card */
        <div className="max-w-xl mx-auto p-8 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/20">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Exam Complete
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {quizResult.score_percentage}%
            </h2>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              You scored {quizResult.correct_count} out of {quizResult.total_questions} questions correctly.
            </p>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {quizResult.feedback}
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={resetQuizState}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Exam</span>
            </button>
            <button
              onClick={handleGenerateQuiz}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate New Questions</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 text-center max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              No Quiz Generated Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click below to generate a challenging exam quiz from your indexed study materials.
            </p>
          </div>
          <button
            onClick={handleGenerateQuiz}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all"
          >
            Generate Quiz Now
          </button>
        </div>
      )}
    </div>
  );
}
