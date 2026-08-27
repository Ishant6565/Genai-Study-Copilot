import { useState, useEffect, useCallback } from 'react';
import type { GameState, Move, DifficultyLevel, PieceColor, MoveRecord, EvaluationResult } from './chess/types';
import { ChessEngine } from './chess/engine';
import { ChessAI } from './chess/ai';
import { ChessAgentService, type AgentCommentary } from './services/chessAgent';
import { identifyOpening } from './chess/openings';
import { Navbar } from './components/Navbar';
import { ChessBoard } from './components/ChessBoard';
import { EvaluationBar } from './components/EvaluationBar';
import { AgentHud } from './components/AgentHud';
import { MoveHistory } from './components/MoveHistory';
import { GameReviewModal } from './components/GameReviewModal';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';

export function App() {
  const [gameState, setGameState] = useState<GameState>(() => ChessEngine.createInitialState());
  const [level, setLevel] = useState<DifficultyLevel>('intermediate');
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [playerColor, setPlayerColor] = useState<PieceColor>('w');
  
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [commentary, setCommentary] = useState<AgentCommentary | null>(null);
  const [hintText, setHintText] = useState<string | null>(null);
  const [moveRecords, setMoveRecords] = useState<MoveRecord[]>([]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const [settings, setSettings] = useState({
    playerColor: 'w' as PieceColor,
    showLegalMoves: true,
    showCoordinates: true,
    autoPromoteQueen: true,
  });

  const legalMoves = ChessEngine.getLegalMoves(gameState, gameState.turn);
  const currentOpening = identifyOpening(gameState.moveHistory);

  // Execute a move (by player or AI)
  const applyMove = useCallback((move: Move) => {
    setGameState((prevState) => {
      const prevEval = evaluation ? evaluation.score : 0;
      const nextState = ChessEngine.makeMove(prevState, move);

      // Generate Agent Commentary
      const newCommentary = ChessAgentService.generateCommentary(nextState, move, prevEval, level);
      setCommentary(newCommentary);
      setHintText(null);

      // Update Move Records (for notation table)
      setMoveRecords((prevRecords) => {
        const moveNumber = Math.ceil(nextState.moveHistory.length / 2);
        const isWhite = move.color === 'w';

        if (isWhite) {
          return [
            ...prevRecords,
            {
              moveNumber,
              white: move,
              whiteAnalysis: {
                classification: newCommentary.classification || 'good',
                score: newCommentary.evalScore,
                commentary: newCommentary.summary,
              },
            },
          ];
        } else {
          const updated = [...prevRecords];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0) {
            updated[lastIdx] = {
              ...updated[lastIdx],
              black: move,
              blackAnalysis: {
                classification: newCommentary.classification || 'good',
                score: newCommentary.evalScore,
                commentary: newCommentary.summary,
              },
            };
          }
          return updated;
        }
      });

      // Update Evaluation bar
      const newEvalScore = ChessAI.evaluateState(nextState) / 100;
      setEvaluation({
        score: newEvalScore,
        depth: 4,
        nodesEvaluated: 120,
        bestLine: [move.san],
        isMate: Math.abs(newEvalScore) > 900,
      });

      // Check game completion
      if (nextState.status !== 'in_progress') {
        setTimeout(() => setIsReviewOpen(true), 600);
      }

      return nextState;
    });
  }, [evaluation, level]);

  // AI Turn Trigger
  useEffect(() => {
    if (gameState.status !== 'in_progress') return;

    const isAiTurn = gameState.turn !== playerColor;
    if (isAiTurn && !isAiThinking) {
      setIsAiThinking(true);

      const timer = setTimeout(() => {
        try {
          const result = ChessAI.findBestMove(gameState, level);
          setEvaluation(result.evaluation);
          applyMove(result.move);
        } catch (err) {
          console.error('AI calculation error:', err);
        } finally {
          setIsAiThinking(false);
        }
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [gameState, playerColor, level, isAiThinking, applyMove]);

  // New Game
  const handleNewGame = () => {
    const fresh = ChessEngine.createInitialState();
    setGameState(fresh);
    setMoveRecords([]);
    setCommentary(null);
    setHintText(null);
    setIsReviewOpen(false);
    setEvaluation({
      score: 0,
      depth: 1,
      nodesEvaluated: 0,
      bestLine: ['e4', 'e5'],
      isMate: false,
    });
  };

  // Undo Move (Take back 2 moves: AI + Player)
  const handleUndo = () => {
    if (isAiThinking || gameState.moveHistory.length === 0) return;
    
    // Step back 2 moves if against AI, or 1 move
    const stepsToUndo = gameState.moveHistory.length >= 2 ? 2 : 1;
    const targetMoveCount = gameState.moveHistory.length - stepsToUndo;

    let replayState = ChessEngine.createInitialState();
    for (let i = 0; i < targetMoveCount; i++) {
      replayState = ChessEngine.makeMove(replayState, gameState.moveHistory[i]);
    }

    setGameState(replayState);
    setMoveRecords((prev) => prev.slice(0, Math.ceil(targetMoveCount / 2)));
    setHintText(null);
    setCommentary({
      summary: 'Move undone. Reposition your pieces and rethink your strategy.',
      evalScore: ChessAI.evaluateState(replayState) / 100,
    });
  };

  // Ask Coach Hint
  const handleGetHint = () => {
    if (gameState.status !== 'in_progress') return;
    const hint = ChessAgentService.getCoachHint(gameState);
    setHintText(hint.advice);
  };

  const handleFlipBoard = () => {
    setOrientation((prev) => (prev === 'white' ? 'black' : 'white'));
  };

  return (
    <div className="min-h-screen bg-mesh-gradient text-white flex flex-col justify-between selection:bg-white selection:text-black">
      
      {/* 1. Header */}
      <Navbar
        level={level}
        onNewGame={handleNewGame}
        onFlipBoard={handleFlipBoard}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Chess Arena */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 w-full flex-1">
        
        {/* Game Title & Opening Banner */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Autonomous AI Chess Agent
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            {currentOpening ? (
              <span className="text-white font-medium">Opening: {currentOpening.name} ({currentOpening.eco})</span>
            ) : (
              <span>Engineered with Minimax Alpha-Beta, PST Evaluation & Real-Time Commentary</span>
            )}
          </p>
        </div>

        {/* Arena Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Evaluation Bar + Chessboard (7 Cols on desktop) */}
          <div className="lg:col-span-7 flex items-center justify-center gap-3 sm:gap-4 w-full">
            
            {/* Dynamic Vertical Evaluation Bar */}
            <EvaluationBar
              score={evaluation?.score || 0}
              isMate={evaluation?.isMate}
              mateIn={evaluation?.mateIn}
              orientation={orientation}
            />

            {/* Main Interactive Chessboard */}
            <div className="flex-1 max-w-[560px]">
              <ChessBoard
                board={gameState.board}
                turn={gameState.turn}
                legalMoves={legalMoves}
                lastMove={gameState.moveHistory[gameState.moveHistory.length - 1]}
                inCheck={gameState.inCheck}
                orientation={orientation}
                isAiThinking={isAiThinking}
                onMakeMove={applyMove}
              />
            </div>

          </div>

          {/* Right Column: Agent HUD & Move History (5 Cols on desktop) */}
          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            
            {/* Autonomous Agent Intelligence HUD */}
            <AgentHud
              level={level}
              onLevelChange={(lvl) => setLevel(lvl)}
              commentary={commentary}
              evaluation={evaluation}
              isAiThinking={isAiThinking}
              onGetHint={handleGetHint}
              hintText={hintText}
            />

            {/* Move Notation & PGN Exporter */}
            <MoveHistory
              moveRecords={moveRecords}
              currentFen={gameState.fenHistory[gameState.fenHistory.length - 1]}
              onUndo={handleUndo}
              onRestart={handleNewGame}
            />

          </div>

        </div>

      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <GameReviewModal
        isOpen={isReviewOpen}
        status={gameState.status}
        winner={gameState.winner}
        playerColor={playerColor}
        moveCount={gameState.moveHistory.length}
        openingName={currentOpening?.name}
        onRestart={handleNewGame}
        onClose={() => setIsReviewOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          setPlayerColor(newSettings.playerColor);
          setOrientation(newSettings.playerColor === 'w' ? 'white' : 'black');
        }}
      />

    </div>
  );
}

export default App;
