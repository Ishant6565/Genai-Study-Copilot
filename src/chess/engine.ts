import type { Board, Piece, PieceColor, PieceType, Move, GameState, GameStatus, Square } from './types';

export const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export class ChessEngine {
  public static squareToCoords(square: Square): { row: number; col: number } {
    const col = square.charCodeAt(0) - 97; // 'a' -> 0
    const row = 8 - parseInt(square[1], 10); // '8' -> 0, '1' -> 7
    return { row, col };
  }

  public static coordsToSquare(row: number, col: number): Square {
    const file = String.fromCharCode(97 + col);
    const rank = (8 - row).toString();
    return `${file}${rank}`;
  }

  public static createInitialBoard(): Board {
    return this.parseFen(INITIAL_FEN).board;
  }

  public static createInitialState(): GameState {
    const parsed = this.parseFen(INITIAL_FEN);
    return {
      board: parsed.board,
      turn: parsed.turn,
      castlingRights: parsed.castlingRights,
      enPassantTarget: parsed.enPassantTarget,
      halfmoveClock: parsed.halfmoveClock,
      fullmoveNumber: parsed.fullmoveNumber,
      moveHistory: [],
      fenHistory: [INITIAL_FEN],
      status: 'in_progress',
      winner: null,
      inCheck: false,
    };
  }

  public static parseFen(fen: string): {
    board: Board;
    turn: PieceColor;
    castlingRights: { w: { kingside: boolean; queenside: boolean }; b: { kingside: boolean; queenside: boolean } };
    enPassantTarget: { row: number; col: number } | null;
    halfmoveClock: number;
    fullmoveNumber: number;
  } {
    const parts = fen.trim().split(/\s+/);
    const placement = parts[0];
    const turn = (parts[1] || 'w') as PieceColor;
    const castlingStr = parts[2] || 'KQkq';
    const epStr = parts[3] || '-';
    const halfmove = parseInt(parts[4] || '0', 10);
    const fullmove = parseInt(parts[5] || '1', 10);

    const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
    const ranks = placement.split('/');

    for (let r = 0; r < 8; r++) {
      let c = 0;
      for (const ch of ranks[r]) {
        if (/\d/.test(ch)) {
          c += parseInt(ch, 10);
        } else {
          const color: PieceColor = ch === ch.toUpperCase() ? 'w' : 'b';
          const type = ch.toLowerCase() as PieceType;
          board[r][c] = { type, color };
          c++;
        }
      }
    }

    const castlingRights = {
      w: { kingside: castlingStr.includes('K'), queenside: castlingStr.includes('Q') },
      b: { kingside: castlingStr.includes('k'), queenside: castlingStr.includes('q') },
    };

    let enPassantTarget: { row: number; col: number } | null = null;
    if (epStr !== '-') {
      enPassantTarget = this.squareToCoords(epStr);
    }

    return {
      board,
      turn,
      castlingRights,
      enPassantTarget,
      halfmoveClock: halfmove,
      fullmoveNumber: fullmove,
    };
  }

  public static generateFen(state: GameState): string {
    let placement = '';
    for (let r = 0; r < 8; r++) {
      let emptyCount = 0;
      for (let c = 0; c < 8; c++) {
        const piece = state.board[r][c];
        if (!piece) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            placement += emptyCount;
            emptyCount = 0;
          }
          const ch = piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
          placement += ch;
        }
      }
      if (emptyCount > 0) placement += emptyCount;
      if (r < 7) placement += '/';
    }

    let castling = '';
    if (state.castlingRights.w.kingside) castling += 'K';
    if (state.castlingRights.w.queenside) castling += 'Q';
    if (state.castlingRights.b.kingside) castling += 'k';
    if (state.castlingRights.b.queenside) castling += 'q';
    if (!castling) castling = '-';

    const ep = state.enPassantTarget ? this.coordsToSquare(state.enPassantTarget.row, state.enPassantTarget.col) : '-';

    return `${placement} ${state.turn} ${castling} ${ep} ${state.halfmoveClock} ${state.fullmoveNumber}`;
  }

  public static cloneBoard(board: Board): Board {
    return board.map(row => row.map(piece => (piece ? { ...piece } : null)));
  }

  public static isSquareAttacked(board: Board, row: number, col: number, attackerColor: PieceColor): boolean {
    // 1. Pawn attacks
    const pawnDir = attackerColor === 'w' ? 1 : -1; // If attacker is white, they attack upwards (row + 1 to row)
    const pRow = row + pawnDir;
    if (pRow >= 0 && pRow < 8) {
      if (col > 0 && board[pRow][col - 1]?.type === 'p' && board[pRow][col - 1]?.color === attackerColor) return true;
      if (col < 7 && board[pRow][col + 1]?.type === 'p' && board[pRow][col + 1]?.color === attackerColor) return true;
    }

    // 2. Knight attacks
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of knightMoves) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const p = board[nr][nc];
        if (p && p.type === 'n' && p.color === attackerColor) return true;
      }
    }

    // 3. Straight rays (Rook & Queen)
    const straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of straightDirs) {
      let nr = row + dr;
      let nc = col + dc;
      while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const p = board[nr][nc];
        if (p) {
          if (p.color === attackerColor && (p.type === 'r' || p.type === 'q')) return true;
          break;
        }
        nr += dr;
        nc += dc;
      }
    }

    // 4. Diagonal rays (Bishop & Queen)
    const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of diagDirs) {
      let nr = row + dr;
      let nc = col + dc;
      while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const p = board[nr][nc];
        if (p) {
          if (p.color === attackerColor && (p.type === 'b' || p.type === 'q')) return true;
          break;
        }
        nr += dr;
        nc += dc;
      }
    }

    // 5. King attacks
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const p = board[nr][nc];
          if (p && p.type === 'k' && p.color === attackerColor) return true;
        }
      }
    }

    return false;
  }

  public static findKing(board: Board, color: PieceColor): { row: number; col: number } | null {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === color) {
          return { row: r, col: c };
        }
      }
    }
    return null;
  }

  public static isKingInCheck(board: Board, color: PieceColor): boolean {
    const kingPos = this.findKing(board, color);
    if (!kingPos) return false;
    const opponentColor: PieceColor = color === 'w' ? 'b' : 'w';
    return this.isSquareAttacked(board, kingPos.row, kingPos.col, opponentColor);
  }

  public static getPseudoLegalMoves(state: GameState, color: PieceColor = state.turn): Move[] {
    const moves: Move[] = [];
    const board = state.board;
    const opponent: PieceColor = color === 'w' ? 'b' : 'w';

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece || piece.color !== color) continue;

        const from = { row: r, col: c };
        const fromSquare = this.coordsToSquare(r, c);

        // PAWN
        if (piece.type === 'p') {
          const forward = color === 'w' ? -1 : 1;
          const startRow = color === 'w' ? 6 : 1;
          const promoRow = color === 'w' ? 0 : 7;

          // 1-step forward
          const f1Row = r + forward;
          if (f1Row >= 0 && f1Row < 8 && !board[f1Row][c]) {
            if (f1Row === promoRow) {
              const promos: PieceType[] = ['q', 'r', 'b', 'n'];
              for (const pr of promos) {
                moves.push({
                  from,
                  to: { row: f1Row, col: c },
                  fromSquare,
                  toSquare: this.coordsToSquare(f1Row, c),
                  piece: 'p',
                  color,
                  promotion: pr,
                  san: '',
                });
              }
            } else {
              moves.push({
                from,
                to: { row: f1Row, col: c },
                fromSquare,
                toSquare: this.coordsToSquare(f1Row, c),
                piece: 'p',
                color,
                san: '',
              });

              // 2-step forward from starting rank
              const f2Row = r + 2 * forward;
              if (r === startRow && !board[f2Row][c]) {
                moves.push({
                  from,
                  to: { row: f2Row, col: c },
                  fromSquare,
                  toSquare: this.coordsToSquare(f2Row, c),
                  piece: 'p',
                  color,
                  san: '',
                });
              }
            }
          }

          // Diagonal Captures
          for (const dc of [-1, 1]) {
            const capCol = c + dc;
            if (capCol >= 0 && capCol < 8 && f1Row >= 0 && f1Row < 8) {
              const target = board[f1Row][capCol];
              if (target && target.color === opponent) {
                if (f1Row === promoRow) {
                  const promos: PieceType[] = ['q', 'r', 'b', 'n'];
                  for (const pr of promos) {
                    moves.push({
                      from,
                      to: { row: f1Row, col: capCol },
                      fromSquare,
                      toSquare: this.coordsToSquare(f1Row, capCol),
                      piece: 'p',
                      color,
                      captured: target.type,
                      promotion: pr,
                      san: '',
                    });
                  }
                } else {
                  moves.push({
                    from,
                    to: { row: f1Row, col: capCol },
                    fromSquare,
                    toSquare: this.coordsToSquare(f1Row, capCol),
                    piece: 'p',
                    color,
                    captured: target.type,
                    san: '',
                  });
                }
              }

              // En Passant
              if (state.enPassantTarget && state.enPassantTarget.row === f1Row && state.enPassantTarget.col === capCol) {
                moves.push({
                  from,
                  to: { row: f1Row, col: capCol },
                  fromSquare,
                  toSquare: this.coordsToSquare(f1Row, capCol),
                  piece: 'p',
                  color,
                  captured: 'p',
                  isEnPassant: true,
                  san: '',
                });
              }
            }
          }
        }

        // KNIGHT
        else if (piece.type === 'n') {
          const knightDeltas = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
          ];
          for (const [dr, dc] of knightDeltas) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
              const target = board[nr][nc];
              if (!target || target.color === opponent) {
                moves.push({
                  from,
                  to: { row: nr, col: nc },
                  fromSquare,
                  toSquare: this.coordsToSquare(nr, nc),
                  piece: 'n',
                  color,
                  captured: target ? target.type : undefined,
                  san: '',
                });
              }
            }
          }
        }

        // BISHOP & QUEEN (diagonals)
        if (piece.type === 'b' || piece.type === 'q') {
          const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
          for (const [dr, dc] of diagDirs) {
            let nr = r + dr;
            let nc = c + dc;
            while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
              const target = board[nr][nc];
              if (!target) {
                moves.push({
                  from,
                  to: { row: nr, col: nc },
                  fromSquare,
                  toSquare: this.coordsToSquare(nr, nc),
                  piece: piece.type,
                  color,
                  san: '',
                });
              } else {
                if (target.color === opponent) {
                  moves.push({
                    from,
                    to: { row: nr, col: nc },
                    fromSquare,
                    toSquare: this.coordsToSquare(nr, nc),
                    piece: piece.type,
                    color,
                    captured: target.type,
                    san: '',
                  });
                }
                break;
              }
              nr += dr;
              nc += dc;
            }
          }
        }

        // ROOK & QUEEN (straights)
        if (piece.type === 'r' || piece.type === 'q') {
          const straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
          for (const [dr, dc] of straightDirs) {
            let nr = r + dr;
            let nc = c + dc;
            while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
              const target = board[nr][nc];
              if (!target) {
                moves.push({
                  from,
                  to: { row: nr, col: nc },
                  fromSquare,
                  toSquare: this.coordsToSquare(nr, nc),
                  piece: piece.type,
                  color,
                  san: '',
                });
              } else {
                if (target.color === opponent) {
                  moves.push({
                    from,
                    to: { row: nr, col: nc },
                    fromSquare,
                    toSquare: this.coordsToSquare(nr, nc),
                    piece: piece.type,
                    color,
                    captured: target.type,
                    san: '',
                  });
                }
                break;
              }
              nr += dr;
              nc += dc;
            }
          }
        }

        // KING
        else if (piece.type === 'k') {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                const target = board[nr][nc];
                if (!target || target.color === opponent) {
                  moves.push({
                    from,
                    to: { row: nr, col: nc },
                    fromSquare,
                    toSquare: this.coordsToSquare(nr, nc),
                    piece: 'k',
                    color,
                    captured: target ? target.type : undefined,
                    san: '',
                  });
                }
              }
            }
          }

          // Castling
          const rights = state.castlingRights[color];
          const kRow = color === 'w' ? 7 : 0;
          if (r === kRow && c === 4 && !this.isSquareAttacked(board, kRow, 4, opponent)) {
            // Kingside (O-O) -> squares f1, g1 / f8, g8
            if (rights.kingside && !board[kRow][5] && !board[kRow][6] && board[kRow][7]?.type === 'r' && board[kRow][7]?.color === color) {
              if (!this.isSquareAttacked(board, kRow, 5, opponent) && !this.isSquareAttacked(board, kRow, 6, opponent)) {
                moves.push({
                  from,
                  to: { row: kRow, col: 6 },
                  fromSquare,
                  toSquare: this.coordsToSquare(kRow, 6),
                  piece: 'k',
                  color,
                  isCastling: 'kingside',
                  san: 'O-O',
                });
              }
            }
            // Queenside (O-O-O) -> squares d1, c1, b1 / d8, c8, b8
            if (rights.queenside && !board[kRow][3] && !board[kRow][2] && !board[kRow][1] && board[kRow][0]?.type === 'r' && board[kRow][0]?.color === color) {
              if (!this.isSquareAttacked(board, kRow, 3, opponent) && !this.isSquareAttacked(board, kRow, 2, opponent)) {
                moves.push({
                  from,
                  to: { row: kRow, col: 2 },
                  fromSquare,
                  toSquare: this.coordsToSquare(kRow, 2),
                  piece: 'k',
                  color,
                  isCastling: 'queenside',
                  san: 'O-O-O',
                });
              }
            }
          }
        }
      }
    }

    return moves;
  }

  public static getLegalMoves(state: GameState, color: PieceColor = state.turn): Move[] {
    const pseudo = this.getPseudoLegalMoves(state, color);
    const legal: Move[] = [];

    for (const move of pseudo) {
      const nextBoard = this.simulateMove(state.board, move);
      if (!this.isKingInCheck(nextBoard, color)) {
        // Compute SAN string with check/checkmate flag
        const opponent: PieceColor = color === 'w' ? 'b' : 'w';
        const inCheck = this.isKingInCheck(nextBoard, opponent);
        const nextState: GameState = {
          ...state,
          board: nextBoard,
          turn: opponent,
        };
        const hasOpponentLegal = this.hasAnyLegalMove(nextState, opponent);
        const isMate = inCheck && !hasOpponentLegal;

        const san = this.formatSan(move, inCheck, isMate);
        legal.push({
          ...move,
          isCheck: inCheck,
          isCheckmate: isMate,
          san,
        });
      }
    }

    return legal;
  }

  private static hasAnyLegalMove(state: GameState, color: PieceColor): boolean {
    const pseudo = this.getPseudoLegalMoves(state, color);
    for (const move of pseudo) {
      const nextBoard = this.simulateMove(state.board, move);
      if (!this.isKingInCheck(nextBoard, color)) {
        return true;
      }
    }
    return false;
  }

  public static simulateMove(board: Board, move: Move): Board {
    const next = this.cloneBoard(board);
    const piece = next[move.from.row][move.from.col];
    next[move.from.row][move.from.col] = null;

    if (move.promotion) {
      next[move.to.row][move.to.col] = { type: move.promotion, color: move.color };
    } else {
      next[move.to.row][move.to.col] = piece;
    }

    // Handle En Passant capture removal
    if (move.isEnPassant) {
      const capRow = move.color === 'w' ? move.to.row + 1 : move.to.row - 1;
      next[capRow][move.to.col] = null;
    }

    // Handle Castling Rook move
    if (move.isCastling === 'kingside') {
      const rookRow = move.from.row;
      next[rookRow][7] = null;
      next[rookRow][5] = { type: 'r', color: move.color };
    } else if (move.isCastling === 'queenside') {
      const rookRow = move.from.row;
      next[rookRow][0] = null;
      next[rookRow][3] = { type: 'r', color: move.color };
    }

    return next;
  }

  public static makeMove(state: GameState, move: Move): GameState {
    const nextBoard = this.simulateMove(state.board, move);
    const opponent: PieceColor = state.turn === 'w' ? 'b' : 'w';

    // Update castling rights
    const castlingRights = {
      w: { ...state.castlingRights.w },
      b: { ...state.castlingRights.b },
    };

    if (move.piece === 'k') {
      castlingRights[state.turn].kingside = false;
      castlingRights[state.turn].queenside = false;
    } else if (move.piece === 'r') {
      if (move.from.row === 7 && move.from.col === 0) castlingRights.w.queenside = false;
      if (move.from.row === 7 && move.from.col === 7) castlingRights.w.kingside = false;
      if (move.from.row === 0 && move.from.col === 0) castlingRights.b.queenside = false;
      if (move.from.row === 0 && move.from.col === 7) castlingRights.b.kingside = false;
    }

    // Rook captured on starting square
    if (move.captured === 'r') {
      if (move.to.row === 7 && move.to.col === 0) castlingRights.w.queenside = false;
      if (move.to.row === 7 && move.to.col === 7) castlingRights.w.kingside = false;
      if (move.to.row === 0 && move.to.col === 0) castlingRights.b.queenside = false;
      if (move.to.row === 0 && move.to.col === 7) castlingRights.b.kingside = false;
    }

    // Update En Passant target
    let enPassantTarget: { row: number; col: number } | null = null;
    if (move.piece === 'p' && Math.abs(move.from.row - move.to.row) === 2) {
      enPassantTarget = {
        row: (move.from.row + move.to.row) / 2,
        col: move.from.col,
      };
    }

    // Halfmove clock (50-move rule: reset on pawn move or capture)
    const isPawnMoveOrCapture = move.piece === 'p' || !!move.captured;
    const halfmoveClock = isPawnMoveOrCapture ? 0 : state.halfmoveClock + 1;
    const fullmoveNumber = state.turn === 'b' ? state.fullmoveNumber + 1 : state.fullmoveNumber;

    // In-check detection for next side
    const inCheck = this.isKingInCheck(nextBoard, opponent);

    const partialState: GameState = {
      board: nextBoard,
      turn: opponent,
      castlingRights,
      enPassantTarget,
      halfmoveClock,
      fullmoveNumber,
      moveHistory: [...state.moveHistory, move],
      fenHistory: [...state.fenHistory],
      status: 'in_progress',
      winner: null,
      inCheck,
    };

    const newFen = this.generateFen(partialState);
    partialState.fenHistory.push(newFen);

    // Determine Game Status
    const opponentLegalMoves = this.getLegalMoves(partialState, opponent);
    let status: GameStatus = 'in_progress';
    let winner: PieceColor | 'draw' | null = null;

    if (opponentLegalMoves.length === 0) {
      if (inCheck) {
        status = 'checkmate';
        winner = state.turn;
      } else {
        status = 'stalemate';
        winner = 'draw';
      }
    } else if (halfmoveClock >= 100) {
      status = 'draw_50_moves';
      winner = 'draw';
    } else if (this.isThreefoldRepetition(partialState.fenHistory)) {
      status = 'draw_repetition';
      winner = 'draw';
    } else if (this.isInsufficientMaterial(nextBoard)) {
      status = 'draw_material';
      winner = 'draw';
    }

    return {
      ...partialState,
      status,
      winner,
    };
  }

  private static isThreefoldRepetition(fenHistory: string[]): boolean {
    const fenCounts: Record<string, number> = {};
    for (const fen of fenHistory) {
      // Compare only the position part (board + turn + castling + ep)
      const key = fen.split(' ').slice(0, 4).join(' ');
      fenCounts[key] = (fenCounts[key] || 0) + 1;
      if (fenCounts[key] >= 3) return true;
    }
    return false;
  }

  private static isInsufficientMaterial(board: Board): boolean {
    const pieces: Piece[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type !== 'k') {
          pieces.push(p);
        }
      }
    }
    // King vs King
    if (pieces.length === 0) return true;
    // King + minor piece vs King
    if (pieces.length === 1 && (pieces[0].type === 'b' || pieces[0].type === 'n')) return true;
    return false;
  }

  private static formatSan(move: Move, inCheck: boolean, isMate: boolean): string {
    if (move.isCastling === 'kingside') return isMate ? 'O-O#' : inCheck ? 'O-O+' : 'O-O';
    if (move.isCastling === 'queenside') return isMate ? 'O-O-O#' : inCheck ? 'O-O-O+' : 'O-O-O';

    let san = '';
    const pieceChar = move.piece.toUpperCase();

    if (move.piece === 'p') {
      if (move.captured) {
        san += move.fromSquare[0] + 'x' + move.toSquare;
      } else {
        san += move.toSquare;
      }
      if (move.promotion) {
        san += '=' + move.promotion.toUpperCase();
      }
    } else {
      san += pieceChar;
      if (move.captured) san += 'x';
      san += move.toSquare;
    }

    if (isMate) san += '#';
    else if (inCheck) san += '+';

    return san;
  }
}
