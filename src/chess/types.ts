export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export type Board = (Piece | null)[][]; // 8x8 grid: board[row][col], row 0 is rank 8, row 7 is rank 1

export type Square = string; // e.g. "e4", "a1", "h8"

export interface Move {
  from: { row: number; col: number };
  to: { row: number; col: number };
  fromSquare: Square;
  toSquare: Square;
  piece: PieceType;
  color: PieceColor;
  captured?: PieceType;
  promotion?: PieceType;
  isCastling?: 'kingside' | 'queenside';
  isEnPassant?: boolean;
  isCheck?: boolean;
  isCheckmate?: boolean;
  san: string; // Standard Algebraic Notation e.g. "Nf3", "O-O", "e4", "Qxf7#"
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'master' | 'grandmaster';

export interface LevelConfig {
  id: DifficultyLevel;
  name: string;
  title: string;
  elo: number;
  depth: number;
  blunderChance: number; // 0 to 1
  avatar: string;
  description: string;
  playstyle: string;
}

export type GameStatus = 
  | 'in_progress' 
  | 'checkmate' 
  | 'stalemate' 
  | 'draw_50_moves' 
  | 'draw_repetition' 
  | 'draw_material'
  | 'resigned'
  | 'timeout';

export interface EvaluationResult {
  score: number; // Centipawns relative to white (+1.5, -2.0)
  depth: number;
  nodesEvaluated: number;
  bestLine: string[];
  isMate: boolean;
  mateIn?: number;
}

export type MoveClassification = 'best' | 'great' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';

export interface MoveRecord {
  moveNumber: number;
  white?: Move;
  black?: Move;
  whiteAnalysis?: {
    classification: MoveClassification;
    score: number;
    commentary: string;
  };
  blackAnalysis?: {
    classification: MoveClassification;
    score: number;
    commentary: string;
  };
}

export interface GameState {
  board: Board;
  turn: PieceColor;
  castlingRights: {
    w: { kingside: boolean; queenside: boolean };
    b: { kingside: boolean; queenside: boolean };
  };
  enPassantTarget: { row: number; col: number } | null;
  halfmoveClock: number; // For 50-move rule
  fullmoveNumber: number;
  moveHistory: Move[];
  fenHistory: string[];
  status: GameStatus;
  winner: PieceColor | 'draw' | null;
  inCheck: boolean;
}

export interface ClockSettings {
  initialMinutes: number;
  incrementSeconds: number;
}
