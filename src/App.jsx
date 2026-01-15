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
  const isInitialStartRef = useRef(false);

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
      // Game: play from 0:00
      // Skip immediate play on initial start (handled in handleStart with delay)
      if (isInitialStartRef.current) {
        isInitialStartRef.current = false;
        return;
      }
      music.currentTime = 0;
      music.play().catch(() => {});
    } else if (gameState === 'gameover') {
      // Game over: continue playing music (don't restart)
      if (music.paused) {
        music.play().catch(() => {});
      }
    }
  }, [gameState, musicStarted]);

  const handleStart = useCallback(() => {
    // Start music on first user interaction with 1 second delay
    if (!musicStarted) {
      setMusicStarted(true);
    }
    
    isInitialStartRef.current = true; // Flag to skip immediate play in useEffect
    const music = bgMusicRef.current;
    if (music) {
      music.volume = 0.3; // Ensure volume is set
      music.currentTime = 0; // Will play from 0:00 when game starts
      // Delay music by 1 second
      setTimeout(() => {
        music.play().catch(() => {});
      }, 1000);
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
    // Delay music by 1 second on restart
    isInitialStartRef.current = true; // Flag to skip immediate play in useEffect
    const music = bgMusicRef.current;
    if (music) {
      music.volume = 0.3; // Restore volume
      music.currentTime = 0; // Will play from 0:00 when game starts
      // Delay music by 1 second
      setTimeout(() => {
        music.play().catch(() => {});
      }, 1000);
    }
    
    setScore(0);
    setLives(INITIAL_LIVES);
    setIsNewHighScore(false);
    setGameState('playing');
  }, []);

  const handleHome = useCallback(() => {
    setScore(0);
    setLives(INITIAL_LIVES);
    setIsNewHighScore(false);
    setGameState('start');
  }, []);

  return (
    <div className="app">
      <div className={`game-wrapper ${gameState === 'gameover' ? 'game-over-wrapper' : ''}`}>
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
            onHome={handleHome}
          />
        )}
      </div>

      <div className="scanlines"></div>
    </div>
  );
}

export default App;
