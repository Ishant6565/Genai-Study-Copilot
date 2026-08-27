import React from 'react';
import type { PieceColor } from '../chess/types';
import { X, Sliders } from 'lucide-react';

interface ChessSettings {
  playerColor: PieceColor;
  showLegalMoves: boolean;
  showCoordinates: boolean;
  autoPromoteQueen: boolean;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ChessSettings;
  onUpdateSettings: (newSettings: ChessSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md rounded-2xl bg-[#0e0e11] border border-white/20 overflow-hidden shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-white" />
            <h3 className="font-display font-bold text-sm text-white">
              Chessboard Preferences
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4 text-xs">
          
          {/* Play As Color */}
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-mono">Play As:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ ...settings, playerColor: 'w' })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  settings.playerColor === 'w'
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-white/5 text-zinc-400 border-white/10'
                }`}
              >
                <span>White (First Move)</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ ...settings, playerColor: 'b' })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  settings.playerColor === 'b'
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-white/5 text-zinc-400 border-white/10'
                }`}
              >
                <span>Black (Defending)</span>
              </button>
            </div>
          </div>

          {/* Show Legal Move Dots */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer">
            <span className="text-zinc-300">Highlight Legal Move Targets</span>
            <input
              type="checkbox"
              checked={settings.showLegalMoves}
              onChange={(e) => onUpdateSettings({ ...settings, showLegalMoves: e.target.checked })}
              className="accent-white w-4 h-4 rounded"
            />
          </label>

          {/* Show Coordinates */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer">
            <span className="text-zinc-300">Show Board Coordinates (1-8, a-h)</span>
            <input
              type="checkbox"
              checked={settings.showCoordinates}
              onChange={(e) => onUpdateSettings({ ...settings, showCoordinates: e.target.checked })}
              className="accent-white w-4 h-4 rounded"
            />
          </label>

        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all shadow-md"
        >
          Save & Close
        </button>

      </div>
    </div>
  );
};
