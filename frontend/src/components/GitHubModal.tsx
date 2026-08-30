"use client";

import React, { useState } from 'react';
import { Github, X, Check, Lock, Globe, ExternalLink, Loader2, Sparkles } from 'lucide-react';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  totalFiles: number;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({
  isOpen,
  onClose,
  projectName,
  totalFiles,
}) => {
  const [repoName, setRepoName] = useState(projectName || "todo-cloud-app");
  const [isPrivate, setIsPrivate] = useState(false);
  const [token, setToken] = useState("");
  const [isPushing, setIsPushing] = useState(false);
  const [successUrl, setSuccessUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePush = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPushing(true);
    
    // Simulate GitHub commit & repo creation API call
    setTimeout(() => {
      setIsPushing(false);
      setSuccessUrl(`https://github.com/developer/${repoName.toLowerCase().replace(/\s+/g, '-')}`);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md glass-panel-glow rounded-2xl p-6 border border-white/[0.12] bg-[#0B0F19] text-slate-100 relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Github className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Push to GitHub</h3>
            <p className="text-xs text-slate-400">Export autonomous codebase directly to GitHub</p>
          </div>
        </div>

        {successUrl ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-200">Repository Published Successfully!</h4>
            <p className="text-xs text-slate-400">
              Committed {totalFiles} files with atomic commit history.
            </p>
            <a
              href={successUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
            >
              <span>View on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <form onSubmit={handlePush} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Repository Name
              </label>
              <input
                type="text"
                required
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Personal Access Token (Optional for mock)
              </label>
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                {isPrivate ? <Lock className="w-4 h-4 text-amber-400" /> : <Globe className="w-4 h-4 text-emerald-400" />}
                <span>{isPrivate ? 'Private Repository' : 'Public Repository'}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPrivate(!isPrivate)}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Change
              </button>
            </div>

            <button
              type="submit"
              disabled={isPushing}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              {isPushing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating & Pushing Repository...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Push {totalFiles} Files to GitHub</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
