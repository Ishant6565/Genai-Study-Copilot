import React, { useState } from 'react';
import type { Board, Move, PieceColor, PieceType } from '../chess/types';
import { ChessEngine } from '../chess/engine';
import { ChessPiece } from './ChessPieces';

interface ChessBoardProps {
  board: Board;
  turn: PieceColor;
  legalMoves: Move[];
  lastMove?: Move | null;
  inCheck: boolean;
  orientation: 'white' | 'black';
  isAiThinking: boolean;
  onMakeMove: (move: Move) => void;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  turn,
  legalMoves,
  lastMove,
  inCheck,
  orientation,
  isAiThinking,
  onMakeMove,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<{ row: number; col: number } | null>(null);
  const [promotionPending, setPromotionPending] = useState<{ from: { row: number; col: number }; to: { row: number; col: number }; color: PieceColor } | null>(null);

  const isFlipped = orientation === 'black';

  // Get available destinations for selected piece
  const availableMoves = selectedSquare
    ? legalMoves.filter(
        (m) => m.from.row === selectedSquare.row && m.from.col === selectedSquare.col
      )
    : [];

  const handleSquareClick = (row: number, col: number) => {
    if (isAiThinking) return;

    const clickedPiece = board[row][col];

    // If a piece is already selected, check if clicked square is a legal destination
    if (selectedSquare) {
      const matchMove = availableMoves.find(
        (m) => m.to.row === row && m.to.col === col
      );

      if (matchMove) {
        // Check if pawn promotion is needed
        const movingPiece = board[selectedSquare.row][selectedSquare.col];
        const isPromoRow = matchMove.color === 'w' ? row === 0 : row === 7;
        
        if (movingPiece?.type === 'p' && isPromoRow) {
          setPromotionPending({
            from: selectedSquare,
            to: { row, col },
            color: movingPiece.color,
          });
          return;
        }

        // Make standard move
        onMakeMove(matchMove);
        setSelectedSquare(null);
        return;
      }

      // If clicked on another friendly piece, switch selection
      if (clickedPiece && clickedPiece.color === turn) {
        setSelectedSquare({ row, col });
        return;
      }

      // Deselect
      setSelectedSquare(null);
      return;
    }

    // New selection: only allow selecting pieces of current turn
    if (clickedPiece && clickedPiece.color === turn) {
      setSelectedSquare({ row, col });
    }
  };

  const handlePromotionSelect = (promoType: PieceType) => {
    if (!promotionPending) return;
    
    const matchMove = legalMoves.find(
      (m) =>
        m.from.row === promotionPending.from.row &&
        m.from.col === promotionPending.from.col &&
        m.to.row === promotionPending.to.row &&
        m.to.col === promotionPending.to.col &&
        m.promotion === promoType
    );

    if (matchMove) {
      onMakeMove(matchMove);
    }
    setPromotionPending(null);
    setSelectedSquare(null);
  };

  // Find in-check King coordinate
  const checkedKing = inCheck ? ChessEngine.findKing(board, turn) : null;

  return (
    <div className="relative aspect-square w-full max-w-[560px] rounded-2xl overflow-hidden bg-[#0a0a0c] border border-white/20 p-2 sm:p-3 shadow-2xl select-none">
      
      {/* 8x8 Grid */}
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-xl overflow-hidden border border-white/10">
        {Array.from({ length: 8 }, (_, rIdx) => {
          const r = isFlipped ? 7 - rIdx : rIdx;

          return Array.from({ length: 8 }, (_, cIdx) => {
            const c = isFlipped ? 7 - cIdx : cIdx;
            const piece = board[r][c];
            const isLightSquare = (r + c) % 2 === 0;

            const isSelected = selectedSquare?.row === r && selectedSquare?.col === c;
            const isLastMoveFrom = lastMove?.from.row === r && lastMove?.from.col === c;
            const isLastMoveTo = lastMove?.to.row === r && lastMove?.to.col === c;
            const isCheckedKingSquare = checkedKing?.row === r && checkedKing?.col === c;

            // Check if this square is an available target move
            const targetMove = availableMoves.find((m) => m.to.row === r && m.to.col === c);
            const isMoveTarget = !!targetMove;
            const isCaptureTarget = isMoveTarget && !!piece;

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                className={`relative flex items-center justify-center cursor-pointer transition-colors ${
                  isLightSquare ? 'bg-[#d4d4d8] text-black' : 'bg-[#222226] text-white'
                } ${isSelected ? 'ring-inset ring-2 ring-white' : ''} ${
                  isLastMoveFrom || isLastMoveTo ? (isLightSquare ? 'bg-[#f4f4f5]' : 'bg-[#323238]') : ''
                }`}
              >
                {/* Board Rank Label (Leftmost file) */}
                {cIdx === 0 && (
                  <span
                    className={`absolute top-1 left-1.5 text-[10px] font-mono font-bold pointer-events-none opacity-60 ${
                      isLightSquare ? 'text-black' : 'text-zinc-400'
                    }`}
                  >
                    {8 - r}
                  </span>
                )}

                {/* Board File Label (Bottom rank) */}
                {rIdx === 7 && (
                  <span
                    className={`absolute bottom-0.5 right-1.5 text-[10px] font-mono font-bold pointer-events-none opacity-60 ${
                      isLightSquare ? 'text-black' : 'text-zinc-400'
                    }`}
                  >
                    {String.fromCharCode(97 + c)}
                  </span>
                )}

                {/* Checked King Glow */}
                {isCheckedKingSquare && (
                  <div className="absolute inset-0 bg-red-500/30 border-2 border-red-500 rounded-sm animate-pulse pointer-events-none" />
                )}

                {/* Piece Vector Graphic */}
                {piece && (
                  <div className="relative z-10 w-[82%] h-[82%] drop-shadow-md transform transition-transform hover:scale-105">
                    <ChessPiece type={piece.type} color={piece.color} />
                  </div>
                )}

                {/* Legal Move Indicators */}
                {isMoveTarget && !isCaptureTarget && (
                  <div className="absolute z-20 w-3.5 h-3.5 rounded-full bg-black/40 border border-white/40 pointer-events-none" />
                )}

                {isCaptureTarget && (
                  <div className="absolute inset-1 z-20 border-2 border-white rounded-full animate-ping-slow pointer-events-none" />
                )}
              </div>
            );
          });
        })}
      </div>

      {/* Pawn Promotion Modal Overlay */}
      {promotionPending && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121215] border border-white/20 rounded-2xl p-4 shadow-2xl text-center">
            <h4 className="text-xs font-mono font-semibold text-white uppercase tracking-wider mb-3">
              Promote Pawn To:
            </h4>
            <div className="flex items-center gap-3">
              {(['q', 'r', 'b', 'n'] as PieceType[]).map((pType) => (
                <button
                  key={pType}
                  onClick={() => handlePromotionSelect(pType)}
                  className="w-14 h-14 rounded-xl bg-white/[0.06] hover:bg-white/20 border border-white/15 p-2 flex items-center justify-center transition-all hover:scale-110"
                >
                  <ChessPiece type={pType} color={promotionPending.color} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
