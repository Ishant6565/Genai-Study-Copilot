import React, { useState, useEffect } from 'react';
import type { Supercar } from '../types/car';
import { Gauge, Zap, Play, Eye, Flame, ArrowRight } from 'lucide-react';
import { supercarAudio } from '../services/supercarAudio';

interface HeroShowcaseProps {
  car: Supercar;
  onOpenExplodedView: () => void;
  onOpenModal: () => void;
  onToggleCompare: (car: Supercar) => void;
  isCompared: boolean;
}

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({
  car,
  onOpenExplodedView,
  onOpenModal,
  onToggleCompare,
  isCompared,
}) => {
  const [isRevving, setIsRevving] = useState(false);
  const [simulatedRpm, setSimulatedRpm] = useState(1200);

  // Revving loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRevving) {
      supercarAudio.setPowertrain(car.powertrainType);
      supercarAudio.start();
      interval = setInterval(() => {
        setSimulatedRpm((prev) => {
          const target = car.maxRpm;
          const next = Math.min(target, prev + 600);
          supercarAudio.updateRev(next, 95);
          return next;
        });
      }, 50);
    } else {
      interval = setInterval(() => {
        setSimulatedRpm((prev) => {
          if (prev <= 1200) {
            clearInterval(interval);
            return 1200;
          }
          const next = Math.max(1200, prev - 400);
          supercarAudio.updateRev(next, 0);
          return next;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isRevving, car]);

  // Color-Adaptive Class Logic
  const isWhite = car.themeColor === 'white';
  const isBlack = car.themeColor === 'black';
  const isRed = car.themeColor === 'red';

  // Outer container classes
  const containerClasses = isWhite
    ? 'bg-gradient-to-b from-[#09090c] via-[#050507] to-[#000000] text-white border-white/15'
    : isBlack
    ? 'bg-gradient-to-b from-[#ffffff] via-[#f4f4f7] to-[#e4e4e9] text-black border-black/10 shadow-2xl'
    : 'bg-gradient-to-b from-[#faf9f6] via-[#f2efe9] to-[#e8e4dc] text-zinc-900 border-red-500/30 shadow-2xl';

  const cardBg = isWhite
    ? 'bg-white/[0.04] border-white/10 text-white'
    : isBlack
    ? 'bg-white border-black/10 text-black shadow-md'
    : 'bg-white/80 border-red-500/20 text-zinc-900 shadow-md';

  const textMuted = isWhite ? 'text-zinc-400' : isBlack ? 'text-zinc-600' : 'text-zinc-700';
  const titleColor = isWhite ? 'text-white' : isBlack ? 'text-black' : 'text-zinc-950';

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden border p-6 sm:p-10 transition-all duration-700 ${containerClasses}`}>
      
      {/* Ambient Lighting FX */}
      <div 
        className={`absolute -top-32 -right-32 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-1000 ${
          isRed ? 'bg-red-500' : isWhite ? 'bg-zinc-400' : 'bg-zinc-800'
        }`}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Hypercar Meta & Performance Specs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Brand & Edition Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3.5 py-1 rounded-full text-xs font-display font-extrabold uppercase tracking-wider ${
              isRed
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : isBlack
                ? 'bg-black text-white'
                : 'bg-white text-black'
            }`}>
              {car.brand}
            </span>
            <span className={`text-xs font-mono font-semibold flex items-center gap-1.5 ${textMuted}`}>
              <span>{car.flag}</span>
              <span>{car.originCountry}</span>
              <span>&bull;</span>
              <span className="font-bold">{car.edition}</span>
            </span>
          </div>

          {/* Massive Kinetic Typography */}
          <div>
            <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight uppercase drop-shadow-sm ${titleColor}`}>
              {car.name}
            </h1>
            <p className={`text-xs sm:text-sm font-mono mt-2 font-medium tracking-wide ${
              isRed ? 'text-red-700' : textMuted
            }`}>
              {car.tagline}
            </p>
          </div>

          {/* Overview Statement */}
          <p className={`text-xs sm:text-sm font-light leading-relaxed max-w-2xl ${textMuted}`}>
            {car.overview}
          </p>

          {/* Key Engineering Benchmarks Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <div className={`p-3.5 rounded-2xl border text-center ${cardBg}`}>
              <span className={`block text-[10px] font-mono uppercase font-bold ${textMuted}`}>Horsepower</span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xl font-display font-black">{car.horsepowerHp} <small className="text-[10px] font-normal">HP</small></span>
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border text-center ${cardBg}`}>
              <span className={`block text-[10px] font-mono uppercase font-bold ${textMuted}`}>0 to 100 KM/H</span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xl font-display font-black">{car.zeroToHundredSec} <small className="text-[10px] font-normal">SEC</small></span>
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border text-center ${cardBg}`}>
              <span className={`block text-[10px] font-mono uppercase font-bold ${textMuted}`}>Top Velocity</span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <Gauge className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xl font-display font-black">{car.topSpeedKmh} <small className="text-[10px] font-normal">KM/H</small></span>
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border text-center ${cardBg}`}>
              <span className={`block text-[10px] font-mono uppercase font-bold ${textMuted}`}>Valuation</span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className="text-xl font-display font-black">${(car.priceUsd / 1000000).toFixed(2)}M</span>
              </div>
            </div>

          </div>

          {/* Interactive CTAs */}
          <div className="flex items-center gap-3 flex-wrap pt-2">
            
            {/* Exploded Engine X-Ray Button */}
            <button
              onClick={onOpenExplodedView}
              className={`px-6 py-3.5 rounded-2xl font-display font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-xl ${
                isRed
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                  : isBlack
                  ? 'bg-black hover:bg-zinc-800 text-white shadow-black/30'
                  : 'bg-white hover:bg-zinc-200 text-black shadow-white/20'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>EXPLODE & ZOOM ENGINE X-RAY</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Hold to Rev Engine Acoustic Pedal */}
            <button
              onMouseDown={() => setIsRevving(true)}
              onMouseUp={() => setIsRevving(false)}
              onMouseLeave={() => setIsRevving(false)}
              onTouchStart={() => setIsRevving(true)}
              onTouchEnd={() => setIsRevving(false)}
              className={`px-5 py-3.5 rounded-2xl font-display font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border select-none ${
                isRevving
                  ? 'bg-red-600 text-white border-red-500 scale-95 shadow-lg'
                  : isBlack
                  ? 'bg-zinc-200 hover:bg-zinc-300 text-black border-zinc-300'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/20'
              }`}
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isRevving ? 'animate-spin' : ''}`} />
              <span>HOLD TO REV ({simulatedRpm} RPM)</span>
            </button>

            {/* Deep Specs Modal */}
            <button
              onClick={onOpenModal}
              className={`px-4 py-3.5 rounded-2xl font-mono text-xs font-bold transition-all border ${
                isBlack
                  ? 'bg-transparent text-black border-black/20 hover:bg-black/5'
                  : 'bg-transparent text-white border-white/20 hover:bg-white/5'
              }`}
            >
              View Full Blueprints
            </button>

          </div>

        </div>

        {/* Right Column: Visual Stage & High-Res Car Photography (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden border border-white/20 shadow-2xl group">
            
            {/* High-Res Car Hero Image */}
            <img 
              src={car.heroImage} 
              alt={car.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />

            {/* Gradient Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

            {/* Floating Top Badge */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-black/80 text-white border border-white/20 backdrop-blur-md">
                {car.powertrainType}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-black/80 text-white border border-white/20 backdrop-blur-md">
                {car.productionLimit}
              </span>
            </div>

            {/* Floating Bottom Action Bar */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-white uppercase block drop-shadow-md">
                  {car.engineDisplacement}
                </span>
                <span className="text-[10px] text-zinc-300 font-mono">
                  Redline: {car.maxRpm.toLocaleString()} RPM &bull; {car.gearbox}
                </span>
              </div>

              {/* Compare Toggle Button */}
              <button
                onClick={() => onToggleCompare(car)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all border ${
                  isCompared
                    ? 'bg-red-600 text-white border-red-500 shadow-md'
                    : 'bg-black/70 hover:bg-black text-white border-white/30 backdrop-blur-md'
                }`}
              >
                {isCompared ? 'Added ✓' : '+ Compare'}
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
