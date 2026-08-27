import React from 'react';

interface EvaluationBarProps {
  score: number; // in pawns relative to White (+2.5, -1.0)
  isMate?: boolean;
  mateIn?: number;
  orientation?: 'white' | 'black';
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({
  score,
  isMate,
  mateIn,
  orientation = 'white',
}) => {
  // Convert pawn score to percentage: -10 pawns -> 5%, 0 -> 50%, +10 pawns -> 95%
  let whitePercent = 50;
  if (isMate) {
    whitePercent = score > 0 ? 100 : 0;
  } else {
    // Sigmoid compression: p = 1 / (1 + 10^(-score / 4))
    const sigmoid = 1 / (1 + Math.pow(10, -score / 4));
    whitePercent = Math.min(96, Math.max(4, sigmoid * 100));
  }

  // Adjust for board flip
  const displayWhiteBottom = orientation === 'white';
  const bottomPercent = displayWhiteBottom ? whitePercent : 100 - whitePercent;

  const formatScore = () => {
    if (isMate) {
      return mateIn ? `M${Math.abs(mateIn)}` : 'M';
    }
    if (score === 0) return '0.0';
    return (score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1));
  };

  return (
    <div className="relative w-8 h-full min-h-[380px] sm:min-h-[480px] rounded-xl overflow-hidden bg-[#18181b] border border-white/15 flex flex-col justify-between shadow-2xl shrink-0 select-none">
      
      {/* Black Section (Top) */}
      <div 
        className="w-full bg-[#121214] transition-all duration-500 ease-out flex items-start justify-center pt-2"
        style={{ height: `${100 - bottomPercent}%` }}
      >
        {!displayWhiteBottom && (
          <span className="text-[10px] font-mono font-bold text-zinc-400">
            {formatScore()}
          </span>
        )}
      </div>

      {/* White Section (Bottom) */}
      <div 
        className="w-full bg-[#ffffff] transition-all duration-500 ease-out flex items-end justify-center pb-2"
        style={{ height: `${bottomPercent}%` }}
      >
        {displayWhiteBottom && (
          <span className="text-[10px] font-mono font-bold text-black">
            {formatScore()}
          </span>
        )}
      </div>

      {/* Middle Equilibrium Notch */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-zinc-500/50 -translate-y-1/2 pointer-events-none" />

    </div>
  );
};
