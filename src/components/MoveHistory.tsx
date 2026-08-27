import React, { useState } from 'react';
import type { MoveRecord } from '../chess/types';
import { Copy, Check, Download, History, RotateCcw } from 'lucide-react';

interface MoveHistoryProps {
  moveRecords: MoveRecord[];
  currentFen: string;
  onUndo: () => void;
  onRestart: () => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  moveRecords,
  currentFen,
  onUndo,
  onRestart,
}) => {
  const [copiedFen, setCopiedFen] = useState(false);

  const handleCopyFen = () => {
    navigator.clipboard.writeText(currentFen);
    setCopiedFen(true);
    setTimeout(() => setCopiedFen(false), 1500);
  };

  const handleExportPgn = () => {
    let pgn = `[Event "Autonomous AI Chess Match"]\n[Site "CineAgent Chess AI by Ishant6565"]\n[Date "${new Date().toISOString().slice(0, 10)}"]\n[White "Player"]\n[Black "AI Agent"]\n\n`;
    
    moveRecords.forEach((record) => {
      pgn += `${record.moveNumber}. ${record.white?.san || ''} ${record.black?.san || ''} `;
    });

    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess-match-${new Date().toISOString().slice(0, 10)}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full rounded-2xl bg-[#0e0e11] border border-white/15 p-5 shadow-2xl flex flex-col justify-between space-y-4 max-h-[420px]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-white" />
          <h3 className="font-display font-bold text-sm text-white">
            Move Notation (PGN)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={moveRecords.length === 0}
            className="px-2.5 py-1 rounded-lg text-xs font-mono text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all disabled:opacity-40"
            title="Takeback Move"
          >
            Undo
          </button>
          <button
            onClick={onRestart}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            title="Restart Match"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Move Scrollable List */}
      <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1 pr-1 min-h-[160px]">
        {moveRecords.length > 0 ? (
          moveRecords.map((record) => (
            <div
              key={record.moveNumber}
              className="grid grid-cols-12 py-1 px-2 rounded hover:bg-white/[0.04] transition-colors items-center text-zinc-300"
            >
              <span className="col-span-2 text-zinc-500 font-semibold">
                {record.moveNumber}.
              </span>
              <span className="col-span-5 text-white font-medium">
                {record.white?.san}
              </span>
              <span className="col-span-5 text-zinc-300 font-medium">
                {record.black?.san || ''}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-zinc-500 font-light text-xs">
            No moves played yet.
          </div>
        )}
      </div>

      {/* Footer: Copy FEN & Export PGN */}
      <div className="pt-3 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyFen}
            className="flex-1 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all truncate"
            title="Copy FEN string"
          >
            {copiedFen ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedFen ? 'FEN Copied!' : 'Copy FEN'}</span>
          </button>

          <button
            onClick={handleExportPgn}
            disabled={moveRecords.length === 0}
            className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
            title="Download PGN File"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PGN</span>
          </button>
        </div>
      </div>

    </div>
  );
};
