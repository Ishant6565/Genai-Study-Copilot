import React from 'react';
import type { GameStatus, PieceColor } from '../chess/types';
import { RotateCcw, X } from 'lucide-react';

interface GameReviewModalProps {
  isOpen: boolean;
  status: GameStatus;
  winner: PieceColor | 'draw' | null;
  playerColor: PieceColor;
  moveCount: number;
  openingName?: string;
  onRestart: () => void;
  onClose: () => void;
}

export const GameReviewModal: React.FC<GameReviewModalProps> = ({
  isOpen,
  status,
  winner,
  playerColor,
  moveCount,
  openingName,
  onRestart,
  onClose,
}) => {
  if (!isOpen || status === 'in_progress') return null;

  const isPlayerWinner = winner === playerColor;
  const isDraw = winner === 'draw';

  let title = '';
  let subtitle = '';

  if (isDraw) {
    title = 'Game Drawn!';
    if (status === 'stalemate') subtitle = 'Stalemate - No legal moves available.';
    else if (status === 'draw_50_moves') subtitle = 'Drawn by 50-move rule.';
    else if (status === 'draw_repetition') subtitle = 'Drawn by 3-fold repetition.';
    else if (status === 'draw_material') subtitle = 'Drawn by insufficient mating material.';
  } else if (isPlayerWinner) {
    title = 'Victory! Checkmate Delivered';
    subtitle = 'Outstanding performance! You successfully outplayed the AI agent.';
  } else {
    title = 'Defeat by Checkmate';
    subtitle = 'The AI agent found a decisive mating sequence. Review your game and try again!';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md rounded-2xl bg-[#0e0e11] border border-white/20 overflow-hidden shadow-2xl p-6 text-center space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/5"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Header */}
        <div className="w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center mx-auto shadow-xl text-3xl">
          {isPlayerWinner ? '🏆' : isDraw ? '🤝' : '♟️'}
        </div>

        <div>
          <h3 className="font-display font-extrabold text-xl text-white mb-1">
            {title}
          </h3>
          <p className="text-xs text-zinc-400 font-light leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Match Statistics */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono">
          <div className="text-left">
            <span className="text-zinc-500 block text-[10px]">Total Moves</span>
            <span className="text-white font-bold text-sm">{moveCount}</span>
          </div>
          <div className="text-left">
            <span className="text-zinc-500 block text-[10px]">Opening Played</span>
            <span className="text-white font-medium text-xs truncate block" title={openingName || 'Custom Opening'}>
              {openingName || 'Standard'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              onClose();
              onRestart();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-medium text-xs transition-all border border-white/10"
          >
            Review Board Position
          </button>
        </div>

      </div>
    </div>
  );
};
