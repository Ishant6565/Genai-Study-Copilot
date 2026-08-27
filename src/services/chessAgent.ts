import type { Move, GameState, MoveClassification, DifficultyLevel } from '../chess/types';
import { ChessAI } from '../chess/ai';
import { identifyOpening } from '../chess/openings';

export interface AgentCommentary {
  summary: string;
  tacticalNote?: string;
  threatWarning?: string;
  strategicPlan?: string;
  classification?: MoveClassification;
  evalScore: number;
}

export class ChessAgentService {
  public static generateCommentary(
    state: GameState,
    lastMove: Move,
    prevEval: number,
    level: DifficultyLevel = 'grandmaster'
  ): AgentCommentary {
    const currentEval = ChessAI.evaluateState(state) / 100;
    const evalDelta = (state.turn === 'w' ? 1 : -1) * (currentEval - prevEval);
    
    // Classify move
    let classification: MoveClassification = 'good';
    if (evalDelta >= -0.2) {
      classification = 'best';
    } else if (evalDelta >= -0.6) {
      classification = 'good';
    } else if (evalDelta >= -1.2) {
      classification = 'inaccuracy';
    } else if (evalDelta >= -2.5) {
      classification = 'mistake';
    } else {
      classification = 'blunder';
    }

    // Check opening database
    const opening = identifyOpening(state.moveHistory);

    let summary = '';
    const isWhite = lastMove.color === 'w';
    const sideName = isWhite ? 'White' : 'Black';

    // Contextual move description
    if (lastMove.isCastling) {
      summary = `${sideName} castles ${lastMove.isCastling}, securing king safety behind a solid pawn fortress and connecting the rooks.`;
    } else if (lastMove.promotion) {
      summary = `Pawn promoted to ${lastMove.promotion.toUpperCase()}! Massive material surge creating immediate decisive threats.`;
    } else if (lastMove.isCheckmate) {
      summary = `Checkmate! ${sideName} lands a lethal finishing strike. King has no escape squares.`;
    } else if (lastMove.isCheck) {
      summary = `Check! ${lastMove.san} puts direct pressure on the opponent's king.`;
    } else if (lastMove.captured) {
      summary = `${sideName} captures on ${lastMove.toSquare} with ${lastMove.san}, altering the material balance.`;
    } else if (lastMove.piece === 'p') {
      if (['e4', 'd4', 'e5', 'd5'].includes(lastMove.toSquare)) {
        summary = `${sideName} claims critical central space with ${lastMove.san}, opening pathways for bishops and queen.`;
      } else {
        summary = `${sideName} pushes pawn to ${lastMove.toSquare}, supporting pawn structure and restricting enemy infiltration.`;
      }
    } else if (lastMove.piece === 'n') {
      summary = `${sideName} develops Knight to ${lastMove.toSquare}, controlling key forward outposts and supporting central tension.`;
    } else if (lastMove.piece === 'b') {
      summary = `${sideName} activates Bishop to ${lastMove.toSquare}, carving out an active diagonal.`;
    } else if (lastMove.piece === 'r') {
      summary = `${sideName} positions Rook on ${lastMove.toSquare} to dominate the file.`;
    } else if (lastMove.piece === 'q') {
      summary = `${sideName} mobilizes Queen to ${lastMove.toSquare}, projecting multi-directional power.`;
    } else if (lastMove.piece === 'k') {
      summary = `${sideName} maneuvers the King to safety on ${lastMove.toSquare}.`;
    } else {
      summary = `${sideName} plays ${lastMove.san}.`;
    }

    // Add Opening commentary if within first 6 moves
    if (state.moveHistory.length <= 8 && opening) {
      summary += ` (${opening.name})`;
    }

    // Strategic plan from agent
    let strategicPlan = '';
    if (level === 'grandmaster') {
      strategicPlan = `Evaluating tactical motifs and pawn chain weaknesses. Current position evaluation: ${currentEval > 0 ? '+' : ''}${currentEval.toFixed(2)}.`;
    } else if (level === 'master') {
      strategicPlan = `Calculating deep forcing lines. Looking to control open files and build kingside pressure.`;
    } else if (level === 'intermediate') {
      strategicPlan = `Focusing on piece activity, coordination, and king protection.`;
    } else {
      strategicPlan = `Playing naturally and looking for open pieces!`;
    }

    let threatWarning: string | undefined;
    if (classification === 'blunder') {
      threatWarning = `Critical tactical shift! That move leaves a vulnerable target or tactical flaw.`;
    } else if (classification === 'mistake') {
      threatWarning = `Slight concession in positional balance. Watch out for counterplay.`;
    }

    return {
      summary,
      threatWarning,
      strategicPlan,
      classification,
      evalScore: currentEval,
    };
  }

  public static getCoachHint(state: GameState): { move: Move; advice: string } {
    const best = ChessAI.findBestMove(state, 'grandmaster');
    const move = best.move;
    
    let advice = `Recommended move: ${move.san}. `;
    if (move.isCastling) {
      advice += 'Castling safeguards your king and activates your rook.';
    } else if (move.captured) {
      advice += `Capturing the piece on ${move.toSquare} secures material advantage.`;
    } else if (move.piece === 'p') {
      advice += `Advancing to ${move.toSquare} stakes control over vital center squares.`;
    } else if (move.piece === 'n' || move.piece === 'b') {
      advice += `Developing your piece to ${move.toSquare} maximizes board activity and tactical control.`;
    } else {
      advice += `Playing ${move.san} optimizes your positional evaluation (+${best.evaluation.score.toFixed(2)}).`;
    }

    return { move, advice };
  }
}
