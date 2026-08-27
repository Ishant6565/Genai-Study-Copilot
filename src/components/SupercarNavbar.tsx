import React from 'react';
import type { CarThemeColor } from '../types/car';
import { Volume2, VolumeX, Layers, ShieldCheck } from 'lucide-react';
import { GithubIcon } from './icons/GithubIcon';

interface SupercarNavbarProps {
  themeColor: CarThemeColor;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  compareCount: number;
  onOpenCompare: () => void;
  onOpenVipInquiry: () => void;
}

export const SupercarNavbar: React.FC<SupercarNavbarProps> = ({
  themeColor,
  isAudioMuted,
  onToggleAudio,
  compareCount,
  onOpenCompare,
  onOpenVipInquiry,
}) => {
  // Adaptive Styles based on car theme
  const isBlackCarTheme = themeColor === 'black';
  const isRedCarTheme = themeColor === 'red';

  const navBg = isBlackCarTheme
    ? 'bg-[#ffffff]/90 border-black/10 text-black shadow-xl shadow-black/5'
    : isRedCarTheme
    ? 'bg-[#141213]/90 border-red-500/20 text-white shadow-2xl shadow-red-950/20'
    : 'bg-[#09090b]/90 border-white/10 text-white shadow-2xl';

  const logoColor = isBlackCarTheme ? 'text-black' : 'text-white';
  const pillStyle = isBlackCarTheme
    ? 'bg-black text-white hover:bg-zinc-800'
    : 'bg-white text-black hover:bg-zinc-200';

  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-2xl border-b transition-all duration-700 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Brand & Author */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-zinc-900 via-black to-zinc-800 border border-white/20 text-white flex items-center justify-center font-display font-black text-base shadow-2xl tracking-tighter">
            APX
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`font-display font-black text-lg tracking-widest uppercase ${logoColor}`}>
                APEX<span className={isRedCarTheme ? 'text-red-500' : isBlackCarTheme ? 'text-zinc-500' : 'text-zinc-400'}>.HYPER</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                isBlackCarTheme
                  ? 'bg-zinc-100 text-zinc-800 border-zinc-300'
                  : 'bg-white/5 text-zinc-300 border-white/10'
              }`}>
                ENGINEERING X-RAY
              </span>
            </div>
            <a
              href="https://github.com/Ishant6565"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs transition-colors flex items-center gap-1 group ${
                isBlackCarTheme ? 'text-zinc-600 hover:text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              by <span className="font-semibold underline underline-offset-2">Ishant6565</span>
            </a>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          
          {/* Audio Engine Mute / Unmute */}
          <button
            onClick={onToggleAudio}
            className={`p-2.5 rounded-xl border text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
              isAudioMuted
                ? isBlackCarTheme ? 'bg-zinc-100 text-zinc-600 border-zinc-300' : 'bg-white/5 text-zinc-400 border-white/10'
                : 'bg-red-500/20 text-red-500 border-red-500/40 animate-pulse shadow-lg'
            }`}
            title="Toggle Engine Sound Synthesizer"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-red-500" />}
            <span className="hidden sm:inline">{isAudioMuted ? "Mute" : "Acoustic ON"}</span>
          </button>

          {/* Comparison Drawer Trigger */}
          <button
            onClick={onOpenCompare}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-2 ${
              compareCount > 0
                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/30'
                : isBlackCarTheme
                ? 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200'
                : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Compare ({compareCount}/3)</span>
          </button>

          {/* VIP Brokerage Inquire Button */}
          <button
            onClick={onOpenVipInquiry}
            className={`px-4 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider transition-all shadow-lg flex items-center gap-1.5 ${pillStyle}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Private Brokerage</span>
            <span className="sm:hidden">VIP</span>
          </button>

          {/* GitHub Profile */}
          <a
            href="https://github.com/Ishant6565"
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 rounded-xl border transition-all ${
              isBlackCarTheme ? 'border-zinc-300 hover:bg-zinc-100 text-black' : 'border-white/10 hover:bg-white/10 text-white'
            }`}
            title="Ishant6565 GitHub"
          >
            <GithubIcon className="w-4 h-4" />
          </a>

        </div>

      </div>
    </header>
  );
};
