import { useState, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { INITIAL_LIVES } from './game/constants';
import StartScreen from './components/StartScreen';
import Game from './components/Game';
import GameOver from './components/GameOver';
import './App.css';

function App() {
  const [gameState, setGameState] = useState('start'); // 'start' | 'playing' | 'gameover'
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [highScore, setHighScore] = useLocalStorage('fruitShooterHighScore', 0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const handleStart = useCallback(() => {
    setScore(0);
    setLives(INITIAL_LIVES);
    setIsNewHighScore(false);
    setGameState('playing');
  }, []);

  const handleGameOver = useCallback(() => {
    setGameState('gameover');
    // Check for new high score
    setScore((currentScore) => {
      if (currentScore > highScore) {
        setHighScore(currentScore);
        setIsNewHighScore(true);
      }
      return currentScore;
    });
  }, [highScore, setHighScore]);

  const handleRestart = useCallback(() => {
    handleStart();
  }, [handleStart]);

  return (
    <div className="app">
      <div className="game-wrapper">
        {gameState === 'start' && (
          <StartScreen onStart={handleStart} highScore={highScore} />
        )}

        {gameState === 'playing' && (
          <Game
            onGameOver={handleGameOver}
            score={score}
            setScore={setScore}
            lives={lives}
            setLives={setLives}
          />
        )}

        {gameState === 'gameover' && (
          <GameOver
            score={score}
            highScore={Math.max(score, highScore)}
            isNewHighScore={isNewHighScore}
            onRestart={handleRestart}
          />
        )}
      </div>

      <div className="scanlines"></div>
    </div>
  );
}

export default App;
