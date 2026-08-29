'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Send,
  ArrowRight,
  Clock,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  RotateCcw,
  Loader2,
  Bot
} from 'lucide-react';
import { interviewApi } from '@/lib/interviewApi';
import { speechService } from '@/lib/speech';
import { InterviewSession, InterviewQuestion } from '@/types/interview';
import { AudioVisualizer } from '@/components/interview/AudioVisualizer';
import { WebcamSimulator } from '@/components/interview/WebcamSimulator';
import { cn } from '@/lib/utils';

export default function LiveInterviewRoom() {
  const params = useParams();
  const router = useRouter();
  const sessionId = (params?.id as string) || 'int-demo-001';

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch session
  useEffect(() => {
    async function load() {
      try {
        const data = await interviewApi.getInterview(sessionId);
        if (data) {
          setSession(data);
          setCurrentQuestionIndex(data.current_question_index || 0);
          // Speak first question
          const firstQ = data.questions[data.current_question_index || 0];
          if (firstQ) {
            speakQuestion(firstQ.question_text);
          }
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Could not load interview session');
      }
    }
    load();

    return () => {
      speechService.stopSpeaking();
      speechService.stopListening();
    };
  }, [sessionId]);

  const speakQuestion = (text: string) => {
    setIsAiSpeaking(true);
    speechService.speak(
      text,
      () => setIsAiSpeaking(false),
      () => setIsAiSpeaking(true)
    );
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    } else {
      if (!speechService.isSpeechRecognitionSupported()) {
        setErrorMsg('Speech recognition is not supported in this browser. You can type your answer directly.');
        return;
      }
      setErrorMsg(null);
      speechService.startListening(
        (transcript) => {
          setCandidateAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        () => {
          setIsRecording(false);
        }
      );
      setIsRecording(true);
    }
  };

  const currentQuestion: InterviewQuestion | undefined = session?.questions[currentQuestionIndex];

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !candidateAnswer.trim() || isSubmitting) return;

    speechService.stopListening();
    speechService.stopSpeaking();
    setIsRecording(false);
    setIsSubmitting(true);

    try {
      const res = await interviewApi.submitAnswer({
        session_id: sessionId,
        question_id: currentQuestion.id,
        answer_text: candidateAnswer,
        is_follow_up: Boolean(followUpQuestion)
      });

      if (res.has_follow_up && res.follow_up_question && !followUpQuestion) {
        setFollowUpQuestion(res.follow_up_question);
        setCandidateAnswer('');
        speakQuestion(`Follow-up question: ${res.follow_up_question}`);
      } else {
        setFollowUpQuestion(null);
        setCandidateAnswer('');
        setShowHint(false);

        if (res.is_session_complete || currentQuestionIndex + 1 >= (session?.questions.length || 0)) {
          // Finish session and generate evaluation
          await interviewApi.evaluateInterview(sessionId);
          router.push(`/feedback/${sessionId}`);
        } else {
          const nextIdx = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextIdx);
          const nextQ = session?.questions[nextIdx];
          if (nextQ) {
            speakQuestion(nextQ.question_text);
          }
        }
      }
    } catch {
      // Fallback advance
      if (currentQuestionIndex + 1 >= (session?.questions.length || 0)) {
        router.push(`/feedback/${sessionId}`);
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
        setCandidateAnswer('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishEarly = async () => {
    speechService.stopSpeaking();
    speechService.stopListening();
    setIsSubmitting(true);
    try {
      await interviewApi.evaluateInterview(sessionId);
    } catch {}
    router.push(`/feedback/${sessionId}`);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!session || !currentQuestion) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-500" />
          <p className="text-sm font-semibold">Setting up your AI Mock Interview Room...</p>
        </div>
      </div>
    );
  }

  const totalQ = session.questions.length;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQ) * 100);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Session Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>{session.role_title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/20">
                {session.seniority}
              </span>
            </h1>
          </div>
        </div>

        {/* Center Progress & Timer */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">
              Question {currentQuestionIndex + 1} of {totalQ}
            </span>
            <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleFinishEarly}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors"
          >
            End & Evaluate
          </button>
        </div>
      </header>

      {/* Main Room Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: AI Interviewer Stream */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl bg-[#0c121e] border border-slate-800 p-6 shadow-xl space-y-5">
            {/* AI Avatar & Audio Waveform Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all duration-300",
                  isAiSpeaking
                    ? "bg-gradient-to-tr from-sky-500 to-indigo-600 ring-4 ring-sky-500/20 scale-105"
                    : "bg-slate-800"
                )}>
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">AI Technical Interviewer</h3>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                      isAiSpeaking
                        ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                        : "bg-slate-800 text-slate-400"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", isAiSpeaking ? "bg-sky-400 animate-ping" : "bg-slate-500")} />
                      {isAiSpeaking ? "Speaking" : "Listening"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Category: {currentQuestion.category}</p>
                </div>
              </div>

              {/* Audio Waveform */}
              <AudioVisualizer isActive={isAiSpeaking} type="ai" />
            </div>

            {/* Question Text Box */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-sky-400 uppercase tracking-wider text-[11px]">
                  {followUpQuestion ? "⚡ Follow-up Question" : `Question #${currentQuestion.question_order}`}
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {currentQuestion.difficulty}
                </span>
              </div>

              <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                {followUpQuestion || currentQuestion.question_text}
              </p>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => speakQuestion(followUpQuestion || currentQuestion.question_text)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Replay Question Audio</span>
                </button>

                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? "Hide Hint" : "Get a Hint"}</span>
                </button>
              </div>

              {showHint && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
                  <p className="font-bold">💡 Architectural Hint:</p>
                  <p>Structure your answer with: 1) Core definition, 2) Trade-offs / constraints, and 3) A concrete production example.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Candidate Feed & Response Area */}
        <div className="lg:col-span-5 space-y-4">
          {/* Candidate Webcam Stream Simulator */}
          <WebcamSimulator
            isCandidateSpeaking={isRecording}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
          />

          {/* Response Box */}
          <div className="rounded-3xl bg-[#0c121e] border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-emerald-400" />
                <span>Your Answer</span>
              </span>

              <button
                onClick={handleToggleRecording}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md",
                  isRecording
                    ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                )}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>Speak Answer (Mic)</span>
                  </>
                )}
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <textarea
              rows={5}
              value={candidateAnswer}
              onChange={(e) => setCandidateAnswer(e.target.value)}
              placeholder="Speak using microphone or type your technical answer here..."
              className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 outline-none focus:border-sky-500 transition-colors leading-relaxed"
            />

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{candidateAnswer.split(/\s+/).filter(Boolean).length} words recorded</span>
              <button
                onClick={() => setCandidateAnswer('')}
                className="text-[11px] hover:text-slate-200"
              >
                Clear
              </button>
            </div>

            {/* Submit Response CTA */}
            <button
              onClick={handleSubmitAnswer}
              disabled={!candidateAnswer.trim() || isSubmitting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {currentQuestionIndex + 1 >= totalQ && !followUpQuestion
                      ? "Submit & Get Final Scorecard"
                      : followUpQuestion
                      ? "Submit Follow-Up Answer"
                      : "Submit Answer & Next Question"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
