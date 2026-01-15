import { useState, useCallback, useEffect, useRef } from 'react';
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
  const [musicStarted, setMusicStarted] = useState(false);
  
  const bgMusicRef = useRef(null);

  // Initialize background music
  useEffect(() => {
    bgMusicRef.current = new Audio('./bg-music.mp3');
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.3;
    
    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
    };
  }, []);

  // Control music based on game state
  useEffect(() => {
    const music = bgMusicRef.current;
    if (!music || !musicStarted) return;

    if (gameState === 'start') {
      // Title screen: play from 0:00
      music.currentTime = 0;
      music.play().catch(() => {});
    } else if (gameState === 'playing') {
      // Game: play from 0:20
      music.currentTime = 20;
      music.play().catch(() => {});
    } else if (gameState === 'gameover') {
      // Game over: stop music
      music.pause();
    }
  }, [gameState, musicStarted]);

  const handleStart = useCallback(() => {
    // Start music on first user interaction
    if (!musicStarted) {
      setMusicStarted(true);
      const music = bgMusicRef.current;
      if (music) {
        music.currentTime = 20; // Will play from 0:20 when game starts
        music.play().catch(() => {});
      }
    }
    
    setScore(0);
    setLives(INITIAL_LIVES);
    setIsNewHighScore(false);
    setGameState('playing');
  }, [musicStarted]);

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
    setScore(0);
    setLives(INITIAL_LIVES);
    setIsNewHighScore(false);
    setGameState('playing');
  }, []);

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
