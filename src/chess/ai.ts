import type { Board, Move, GameState, PieceColor, PieceType, DifficultyLevel, LevelConfig, EvaluationResult } from './types';
import { ChessEngine } from './engine';

export const AI_LEVELS: Record<DifficultyLevel, LevelConfig> = {
  beginner: {
    id: 'beginner',
    name: 'Novice Bot',
    title: 'Beginner',
    elo: 800,
    depth: 2,
    blunderChance: 0.25,
    avatar: '♟️',
    description: 'Casual beginner bot. Makes occasional blunders and plays friendly, intuitive chess.',
    playstyle: 'Aggressive & Casual',
  },
  intermediate: {
    id: 'intermediate',
    name: 'Club Master',
    title: 'Intermediate',
    elo: 1500,
    depth: 3,
    blunderChance: 0.05,
    avatar: '♞',
    description: 'Solid club player. Controls the center, develops pieces rapidly, and capitalizes on tactical blunders.',
    playstyle: 'Positional & Solid',
  },
  master: {
    id: 'master',
    name: 'Tactical Engine',
    title: 'Master',
    elo: 2200,
    depth: 4,
    blunderChance: 0.0,
    avatar: '♜',
    description: 'Deep calculating master engine with sharp tactical vision, king safety evaluation, and piece activity.',
    playstyle: 'Sharp & Calculating',
  },
  grandmaster: {
    id: 'grandmaster',
    name: 'Autonomous GM Agent',
    title: 'Grandmaster',
    elo: 2800,
    depth: 5,
    blunderChance: 0.0,
    avatar: '👑',
    description: 'Uncompromising grandmaster AI agent analyzing multi-move depth, king safety, and strategic plans.',
    playstyle: 'Grandmaster Classical',
  },
};

const PIECE_VALUES: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tables (White perspective: row 0 = rank 8, row 7 = rank 1)
const PST_PAWN_MG: number[][] = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const PST_KNIGHT: number[][] = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const PST_BISHOP: number[][] = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const PST_ROOK: number[][] = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0]
];

const PST_QUEEN: number[][] = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,  0,  5,  5,  5,  5,  0, -5],
  [0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const PST_KING_MG: number[][] = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 20,  0,  0,  0,  0, 20, 20],
  [20, 30, 10,  0,  0, 10, 30, 20]
];

export class ChessAI {
  private static nodesEvaluated = 0;

  public static evaluatePosition(board: Board): number {
    let score = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        const val = PIECE_VALUES[piece.type];
        let pstVal = 0;

        // Lookup PST (mirror rows for black)
        const tableRow = piece.color === 'w' ? r : 7 - r;
        const tableCol = piece.color === 'w' ? c : 7 - c;

        switch (piece.type) {
          case 'p': pstVal = PST_PAWN_MG[tableRow][tableCol]; break;
          case 'n': pstVal = PST_KNIGHT[tableRow][tableCol]; break;
          case 'b': pstVal = PST_BISHOP[tableRow][tableCol]; break;
          case 'r': pstVal = PST_ROOK[tableRow][tableCol]; break;
          case 'q': pstVal = PST_QUEEN[tableRow][tableCol]; break;
          case 'k': pstVal = PST_KING_MG[tableRow][tableCol]; break;
        }

        const totalPieceScore = val + pstVal;
        if (piece.color === 'w') {
          score += totalPieceScore;
        } else {
          score -= totalPieceScore;
        }
      }
    }

    return score;
  }

  public static evaluateState(state: GameState): number {
    if (state.status === 'checkmate') {
      return state.winner === 'w' ? 99999 : -99999;
    }
    if (state.status !== 'in_progress' && state.winner === 'draw') {
      return 0;
    }
    return this.evaluatePosition(state.board);
  }

  private static orderMoves(moves: Move[]): Move[] {
    return moves.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
      if (a.captured) {
        scoreA += 10 * PIECE_VALUES[a.captured] - PIECE_VALUES[a.piece];
      }
      if (a.promotion) {
        scoreA += PIECE_VALUES[a.promotion];
      }
      if (a.isCheck) {
        scoreA += 50;
      }

      if (b.captured) {
        scoreB += 10 * PIECE_VALUES[b.captured] - PIECE_VALUES[b.piece];
      }
      if (b.promotion) {
        scoreB += PIECE_VALUES[b.promotion];
      }
      if (b.isCheck) {
        scoreB += 50;
      }

      return scoreB - scoreA;
    });
  }

  public static minimax(
    state: GameState,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): { score: number; bestMove: Move | null; pv: string[] } {
    this.nodesEvaluated++;

    if (depth === 0 || state.status !== 'in_progress') {
      return { score: this.evaluateState(state), bestMove: null, pv: [] };
    }

    const color: PieceColor = isMaximizing ? 'w' : 'b';
    const rawMoves = ChessEngine.getLegalMoves(state, color);
    const moves = this.orderMoves(rawMoves);

    if (moves.length === 0) {
      return { score: this.evaluateState(state), bestMove: null, pv: [] };
    }

    let bestMove: Move = moves[0];
    let bestPv: string[] = [];

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const nextState = ChessEngine.makeMove(state, move);
        const result = this.minimax(nextState, depth - 1, alpha, beta, false);

        if (result.score > maxEval) {
          maxEval = result.score;
          bestMove = move;
          bestPv = [move.san, ...result.pv];
        }
        alpha = Math.max(alpha, result.score);
        if (beta <= alpha) break; // Beta cutoff
      }
      return { score: maxEval, bestMove, pv: bestPv };
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const nextState = ChessEngine.makeMove(state, move);
        const result = this.minimax(nextState, depth - 1, alpha, beta, true);

        if (result.score < minEval) {
          minEval = result.score;
          bestMove = move;
          bestPv = [move.san, ...result.pv];
        }
        beta = Math.min(beta, result.score);
        if (beta <= alpha) break; // Alpha cutoff
      }
      return { score: minEval, bestMove, pv: bestPv };
    }
  }

  public static findBestMove(
    state: GameState,
    level: DifficultyLevel = 'grandmaster'
  ): { move: Move; evaluation: EvaluationResult } {
    this.nodesEvaluated = 0;
    const config = AI_LEVELS[level];
    const isMaximizing = state.turn === 'w';

    const legalMoves = ChessEngine.getLegalMoves(state, state.turn);
    if (legalMoves.length === 0) {
      throw new Error('No legal moves available');
    }

    // Blunder chance for beginner/intermediate
    if (config.blunderChance > 0 && Math.random() < config.blunderChance) {
      const randomIndex = Math.floor(Math.random() * legalMoves.length);
      const randomMove = legalMoves[randomIndex];
      return {
        move: randomMove,
        evaluation: {
          score: this.evaluateState(state) / 100,
          depth: 1,
          nodesEvaluated: 1,
          bestLine: [randomMove.san],
          isMate: false,
        },
      };
    }

    // Search minimax with alpha-beta
    const result = this.minimax(state, config.depth, -Infinity, Infinity, isMaximizing);
    const chosenMove = result.bestMove || legalMoves[0];

    // Score in centipawns / pawns (e.g. +1.50)
    const scoreInPawns = (result.score / 100);
    const isMate = Math.abs(result.score) > 90000;

    return {
      move: chosenMove,
      evaluation: {
        score: scoreInPawns,
        depth: config.depth,
        nodesEvaluated: this.nodesEvaluated,
        bestLine: result.pv,
        isMate,
      },
    };
  }
}
