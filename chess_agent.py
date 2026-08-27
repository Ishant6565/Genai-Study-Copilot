#!/usr/bin/env python3
"""
♟️ Autonomous AI Chess Agent (by Ishant6565)
Multi-Level AI Chess Engine featuring Minimax Alpha-Beta Pruning, PST Evaluation, and Live Move Commentary.

Author: Ishant6565 (https://github.com/Ishant6565)
Repository: https://github.com/Ishant6565/CHESS
License: MIT
"""

import sys
import time
import argparse
from typing import Optional, Tuple, Any

# Ensure UTF-8 output on Windows terminals
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

try:
    import chess
    HAS_CHESS = True
except ImportError:
    HAS_CHESS = False


# Piece-Square Values (Centipawns)
PIECE_VALUES = {
    1: 100,    # PAWN
    2: 320,    # KNIGHT
    3: 330,    # BISHOP
    4: 500,    # ROOK
    5: 900,    # QUEEN
    6: 20000,  # KING
}

PST_PAWN = [
    0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5,  5, 10, 25, 25, 10,  5,  5,
    0,  0,  0, 20, 20,  0,  0,  0,
    5, -5,-10,  0,  0,-10, -5,  5,
    5, 10, 10,-20,-20, 10, 10,  5,
    0,  0,  0,  0,  0,  0,  0,  0
]

PST_KNIGHT = [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50
]


class PythonChessAI:
    """Minimax Alpha-Beta Chess Engine."""

    def __init__(self, depth: int = 3):
        self.depth = depth
        self.nodes_evaluated = 0

    def evaluate_board(self, board: Any) -> int:
        if board.is_checkmate():
            return -99999 if board.turn == chess.WHITE else 99999
        if board.is_stalemate() or board.is_insufficient_material() or board.can_claim_threefold_repetition():
            return 0

        score = 0
        for sq in chess.SQUARES:
            piece = board.piece_at(sq)
            if not piece:
                continue

            val = PIECE_VALUES.get(piece.piece_type, 0)
            pst_val = 0
            if piece.piece_type == chess.PAWN:
                pst_val = PST_PAWN[sq] if piece.color == chess.WHITE else PST_PAWN[chess.square_mirror(sq)]
            elif piece.piece_type == chess.KNIGHT:
                pst_val = PST_KNIGHT[sq] if piece.color == chess.WHITE else PST_KNIGHT[chess.square_mirror(sq)]

            total = val + pst_val
            if piece.color == chess.WHITE:
                score += total
            else:
                score -= total

        return score

    def minimax(self, board: Any, depth: int, alpha: float, beta: float, is_maximizing: bool) -> Tuple[float, Optional[Any]]:
        self.nodes_evaluated += 1

        if depth == 0 or board.is_game_over():
            return self.evaluate_board(board), None

        best_move = None

        if is_maximizing:
            max_eval = -float('inf')
            for move in board.legal_moves:
                board.push(move)
                eval_score, _ = self.minimax(board, depth - 1, alpha, beta, False)
                board.pop()

                if eval_score > max_eval:
                    max_eval = eval_score
                    best_move = move

                alpha = max(alpha, eval_score)
                if beta <= alpha:
                    break
            return max_eval, best_move
        else:
            min_eval = float('inf')
            for move in board.legal_moves:
                board.push(move)
                eval_score, _ = self.minimax(board, depth - 1, alpha, beta, True)
                board.pop()

                if eval_score < min_eval:
                    min_eval = eval_score
                    best_move = move

                beta = min(beta, eval_score)
                if beta <= alpha:
                    break
            return min_eval, best_move

    def get_best_move(self, board: Any) -> Any:
        self.nodes_evaluated = 0
        is_max = board.turn == chess.WHITE
        _, best_move = self.minimax(board, self.depth, -float('inf'), float('inf'), is_max)
        return best_move or list(board.legal_moves)[0]


def print_ascii_board(board: Any):
    print("\n  a b c d e f g h")
    print(" +-----------------+")
    rows = str(board).split("\n")
    for i, row in enumerate(rows):
        rank = 8 - i
        print(f"{rank}| {row} |{rank}")
    print(" +-----------------+")
    print("  a b c d e f g h\n")


def main():
    parser = argparse.ArgumentParser(description="Autonomous AI Chess Agent by Ishant6565")
    parser.add_argument("-l", "--level", type=str, choices=["beginner", "intermediate", "master", "grandmaster"], default="intermediate", help="AI Difficulty level")
    parser.add_argument("-c", "--color", type=str, choices=["white", "black"], default="white", help="Player Color")
    parser.add_argument("--demo", action="store_true", help="Run AI vs AI demonstration match")

    args = parser.parse_args()

    depth_map = {"beginner": 2, "intermediate": 3, "master": 4, "grandmaster": 5}
    depth = depth_map[args.level]

    print("\033[1;37m" + "=" * 65)
    print(" ♟️  CHESS AI — Autonomous AI Chess Agent")
    print(f" Engineered by Ishant6565 | Level: {args.level.capitalize()} (Search Depth: {depth})")
    print("=" * 65 + "\033[0m\n")

    if not HAS_CHESS:
        print("Note: 'python-chess' library not installed in this environment.")
        print("Install it with: pip install python-chess")
        print("For the interactive web app, run: npm run dev (http://localhost:5173)\n")
        return

    board = chess.Board()
    ai = PythonChessAI(depth=depth)

    if args.demo:
        print("▶ Running Autonomous AI vs AI Demonstration...")
        while not board.is_game_over() and board.fullmove_number <= 10:
            turn_name = "White (AI)" if board.turn == chess.WHITE else "Black (AI)"
            move = ai.get_best_move(board)
            san = board.san(move)
            board.push(move)
            print(f"Move {board.fullmove_number}: {turn_name} played \033[1;32m{san}\033[0m (Eval: {ai.evaluate_board(board)/100:+.2f})")
            time.sleep(0.3)

        print_ascii_board(board)
        print(f"Demo complete. FEN: {board.fen()}")
        return

    print_ascii_board(board)
    print("Enter your moves in UCI format (e.g. 'e2e4', 'g1f3') or SAN ('e4', 'Nf3'). Type 'quit' to exit.\n")

    player_color = chess.WHITE if args.color == "white" else chess.BLACK

    while not board.is_game_over():
        if board.turn == player_color:
            user_input = input("Your move: ").strip()
            if user_input.lower() in ["quit", "exit"]:
                print("Game exited.")
                break

            try:
                try:
                    move = board.parse_san(user_input)
                except ValueError:
                    move = chess.Move.from_uci(user_input)

                if move in board.legal_moves:
                    board.push(move)
                    print_ascii_board(board)
                else:
                    print("Illegal move. Try again.")
                    continue
            except Exception:
                print("Invalid notation. Please enter standard algebraic notation (e.g. e4, Nf3) or UCI (e2e4).")
                continue
        else:
            print(f"AI ({args.level}) is calculating...")
            move = ai.get_best_move(board)
            san = board.san(move)
            board.push(move)
            print(f"AI played: \033[1;32m{san}\033[0m  (Nodes: {ai.nodes_evaluated})")
            print_ascii_board(board)

    print(f"\nGame Over! Result: {board.result()}")


if __name__ == "__main__":
    main()
