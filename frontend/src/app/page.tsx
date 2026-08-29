'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Layers,
  Cpu,
  Palette,
  Users,
  ArrowRight,
  Mic,
  Volume2,
  Award,
  BookOpen,
  CheckCircle2,
  Play,
  Briefcase,
  Sliders,
  FileText
} from 'lucide-react';
import { TRACK_TEMPLATES } from '@/lib/interviewData';
import { interviewApi } from '@/lib/interviewApi';
import { cn } from '@/lib/utils';

export default function InterviewLaunchpad() {
  const router = useRouter();
  const [selectedTrack, setSelectedTrack] = useState(TRACK_TEMPLATES[0]);
  const [roleTitle, setRoleTitle] = useState(TRACK_TEMPLATES[0].roleTitle);
  const [seniority, setSeniority] = useState('Senior');
  const [interviewType, setInterviewType] = useState('Technical');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [jobDescription, setJobDescription] = useState('');
  const [showCustomJD, setShowCustomJD] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleTrackSelect = (track: typeof TRACK_TEMPLATES[0]) => {
    setSelectedTrack(track);
    setRoleTitle(track.roleTitle);
  };

  const handleStartInterview = async () => {
    setIsStarting(true);
    try {
      const session = await interviewApi.startInterview({
        role_title: roleTitle,
        track: selectedTrack.title,
        seniority,
        interview_type: interviewType,
        total_questions: totalQuestions,
        job_description: jobDescription || undefined
      });
      router.push(`/interview/${session.id}`);
    } catch {
      router.push(`/interview/int-demo-001`);
    } finally {
      setIsStarting(false);
    }
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'Layers':
        return <Layers className="w-5 h-5" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5" />;
      case 'Palette':
        return <Palette className="w-5 h-5" />;
      case 'Users':
        return <Users className="w-5 h-5" />;
      default:
        return <Briefcase className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 md:p-10 selection:bg-sky-500 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Voice & Technical Mock Interview Coach</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Ace your next tech interview with{' '}
            <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Live Voice AI
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Practice role-specific technical questions, speak your answers aloud to an AI interviewer, receive real-time follow-ups, and get a comprehensive hiring scorecard with expert model answers.
          </p>
        </div>

        {/* Core Setup Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Track Selection */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-sky-400" />
                <span>1. Select Interview Track</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">5 Curated Roles</span>
            </div>

            <div className="space-y-3">
              {TRACK_TEMPLATES.map((track) => {
                const isSelected = selectedTrack.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => handleTrackSelect(track)}
                    className={cn(
                      'p-4 rounded-2xl border transition-all cursor-pointer relative',
                      isSelected
                        ? 'bg-slate-900/90 border-sky-500/80 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/30'
                        : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                            isSelected
                              ? 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-400'
                          )}
                        >
                          {getIcon(track.iconName)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-white">{track.title}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-slate-700">
                              {track.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{track.description}</p>
                        </div>
                      </div>

                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-1',
                          isSelected
                            ? 'border-sky-500 bg-sky-500 text-white'
                            : 'border-slate-700 bg-slate-800'
                        )}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    {/* Popular Topics Pill */}
                    <div className="mt-3 flex flex-wrap gap-1.5 pl-13">
                      {track.popularTopics.map((topic) => (
                        <span
                          key={topic}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-300 border border-slate-700/50"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Customizer & Launch Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>2. Customize Parameters</span>
              </h2>
            </div>

            <div className="p-6 rounded-3xl bg-[#0c121e] border border-slate-800 shadow-xl space-y-5">
              {/* Role Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Target Role Title</label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              {/* Seniority Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Seniority Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Junior', 'Mid-Level', 'Senior', 'Staff'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSeniority(level)}
                      className={cn(
                        'py-2 rounded-xl text-xs font-semibold border transition-all',
                        seniority === level
                          ? 'bg-sky-500/15 border-sky-500 text-sky-400 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interview Type & Questions Count */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Type</label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-sky-500"
                  >
                    <option value="Technical">Technical</option>
                    <option value="System Design">System Design</option>
                    <option value="Behavioral">Behavioral (STAR)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Length</label>
                  <select
                    value={totalQuestions}
                    onChange={(e) => setTotalQuestions(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-sky-500"
                  >
                    <option value={3}>3 Questions (~10 min)</option>
                    <option value={5}>5 Questions (~15 min)</option>
                    <option value={7}>7 Questions (~25 min)</option>
                  </select>
                </div>
              </div>

              {/* Optional Custom Job Description */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setShowCustomJD(!showCustomJD)}
                  className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{showCustomJD ? '- Hide Job Description' : '+ Add Custom Job Description (Optional)'}</span>
                </button>

                {showCustomJD && (
                  <textarea
                    rows={3}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste job description or requirements to tailor questions..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-600 outline-none focus:border-sky-500"
                  />
                )}
              </div>

              {/* Features summary */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2 text-slate-300 font-semibold text-[11px]">
                  <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>AI Voice Synthesis + Speech Recognition Enabled</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-semibold text-[11px]">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Instant Hiring Scorecard & Model Answer Report</span>
                </div>
              </div>

              {/* Launch CTA Button */}
              <button
                onClick={handleStartInterview}
                disabled={isStarting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isStarting ? (
                  <span>Initializing Voice Room...</span>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Launch AI Mock Interview Room</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
          <div
            onClick={() => router.push('/questions')}
            className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-1 group"
          >
            <div className="flex items-center justify-between text-white font-bold text-xs">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>Question Bank</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <p className="text-[11px] text-slate-400">
              Browse top interview questions with expert model answers.
            </p>
          </div>

          <div
            onClick={() => router.push('/history')}
            className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-1 group"
          >
            <div className="flex items-center justify-between text-white font-bold text-xs">
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Past Scorecards</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <p className="text-[11px] text-slate-400">
              Track your interview performance scores and progress.
            </p>
          </div>

          <div
            onClick={() => router.push('/feedback/int-demo-001')}
            className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-1 group"
          >
            <div className="flex items-center justify-between text-white font-bold text-xs">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>View Sample Evaluation</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <p className="text-[11px] text-slate-400">
              Inspect an evaluation report with radar breakdown & model answers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
