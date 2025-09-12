import type { GameState } from "../types/GameState";
import { useState, useEffect } from "react";

export type Player = "X" | "O";
export type CellValue = Player | null;
export type Board = CellValue[];

export default function GameBoard() {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentPlayer: "X",
    winner: null,
    isDraw: false,
    scores: { X: 0, O: 0 },
    isAgainstAI: true,
  });

  // Check for winner or draw after each move
  useEffect(() => {
    const winner = checkWinnerForMiniMax(gameState.board);
    const isDraw = !winner && isBoardFull(gameState.board);
    
    if (winner || isDraw) {
      setGameState(prev => ({
        ...prev,
        winner,
        isDraw,
        scores: winner ? {
          ...prev.scores,
          [winner]: prev.scores[winner] + 1
        } : prev.scores
      }));
    }
  }, [gameState.board]);

  const checkWinnerForMiniMax = (board: Board): Player | null => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6] // diag
    ];
    
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] as Player;
      }
    }
    return null;
  };

  const isBoardFull = (board: Board): boolean => {
    return board.every((cell) => cell !== null);
  };

  const minimax = (
    board: Board,
    depth: number,
    isMaximizing: boolean,
    alpha: number,
    beta: number
  ): number => {
    const winner = checkWinnerForMiniMax(board);
    
    if (winner === "X") return 10 - depth; // Win for AI
    if (winner === "O") return depth - 10; // Loss for AI
    if (isBoardFull(board)) return 0; // Draw
    
    if (isMaximizing) {
      let bestScore = -Infinity;
      
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = "X"; // AI's move
          const score = minimax(board, depth + 1, false, alpha, beta);
          board[i] = null;
          
          bestScore = Math.max(score, bestScore);
          alpha = Math.max(alpha, score);
          if (beta <= alpha) break; // Alpha-beta pruning
        }
      }
      
      return bestScore;
    } else {
      let bestScore = Infinity;
      
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = "O"; // Player's move
          const score = minimax(board, depth + 1, true, alpha, beta);
          board[i] = null;
          
          bestScore = Math.min(score, bestScore);
          beta = Math.min(beta, score);
          if (beta <= alpha) break; // Alpha-beta pruning
        }
      }
      
      return bestScore;
    }
  };

  const getBestMove = (board: Board): number => {
    let bestScore = -Infinity;
    let bestMove = -1;
    
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = "X";
        const score = minimax(board, 0, false, -Infinity, Infinity);
        board[i] = null;
        
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    
    return bestMove;
  };

  const makeAIMove = () => {
    if (gameState.currentPlayer === "X" && !gameState.winner && !gameState.isDraw) {
      const bestMove = getBestMove([...gameState.board]);
      
      if (bestMove !== -1) {
        const newBoard = [...gameState.board];
        newBoard[bestMove] = "X";
        
        setGameState(prev => ({
          ...prev,
          board: newBoard,
          currentPlayer: "O"
        }));
      }
    }
  };

  useEffect(() => {
    if (gameState.currentPlayer === "X" && !gameState.winner && !gameState.isDraw) {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.winner, gameState.isDraw]);

  const handleCellClick = (index: number) => {
    // Prevent clicks if it's AI's turn, cell is occupied, or game is over
    if (gameState.board[index] || gameState.winner || gameState.isDraw || 
        gameState.currentPlayer === "X") {
      return;
    }
    
    const newBoard = [...gameState.board];
    newBoard[index] = "O"; // Player's move
    
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: "X" // Switch to AI's turn
    }));
  };

  const resetGame = () => {
    setGameState({
      board: Array(9).fill(null),
      currentPlayer: "X",
      winner: null,
      isDraw: false,
      scores: gameState.scores,
      isAgainstAI: true,
    });
  };

  const resetScores = () => {
    setGameState(prev => ({
      ...prev,
      scores: { X: 0, O: 0 }
    }));
  };

  // Get player text color
  const getPlayerColor = (player: Player) => {
    return player === "X" ? "text-blue-600" : "text-red-600";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Tic Tac Toe</h1>
      
      {/* Score display */}
      <div className="flex gap-8 mb-6">
        <div className={`text-2xl font-bold ${getPlayerColor("X")}`}>
          AI: {gameState.scores.X}
        </div>
        <div className={`text-2xl font-bold ${getPlayerColor("O")}`}>
          You: {gameState.scores.O}
        </div>
      </div>
      
      {/* Game status */}
      {gameState.winner && (
        <div className="text-2xl font-bold mb-4">
          {gameState.winner === "X" ? "AI" : "You"} won!
        </div>
      )}
      {gameState.isDraw && (
        <div className="text-2xl font-bold mb-4">It's a draw!</div>
      )}
      
      {/* Game board */}
      <div className="grid grid-cols-3 gap-2 mb-8 bg-white p-4 rounded-lg shadow-md">
        {gameState.board.map((tile, index) => (
          <button
            className={`w-20 h-20 border-2 border-gray-300 text-4xl font-bold flex items-center justify-center
              ${!tile && !gameState.winner && !gameState.isDraw && gameState.currentPlayer === "O" 
                ? "hover:bg-gray-100 cursor-pointer" 
                : "cursor-default"}
              ${tile === "X" ? "text-blue-600" : ""}
              ${tile === "O" ? "text-red-600" : ""}`}
            key={index}
            onClick={() => handleCellClick(index)}
            disabled={!!tile || !!gameState.winner || gameState.isDraw || gameState.currentPlayer === "X"}
          >
            {tile}
          </button>
        ))}
      </div>
      
      {/* Controls */}
      <div className="flex gap-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          onClick={resetGame}
        >
          New Game
        </button>
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          onClick={resetScores}
        >
          Reset Scores
        </button>
      </div>
    </div>
  );
}