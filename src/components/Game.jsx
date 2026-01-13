import { useRef, useCallback, useState, useEffect } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { CANVAS_WIDTH, CANVAS_HEIGHT, CANNON, COLORS, DIFFICULTY } from '../game/constants';
import { createFruit, updateFruit, drawFruit, isFruitOffScreen } from '../game/Fruit';
import { createBullet, updateBullet, drawBullet, isBulletOffScreen } from '../game/Bullet';
import { processCollisions } from '../game/collision';
import HUD from './HUD';

const Game = ({ onGameOver, score, setScore, lives, setLives }) => {
  const canvasRef = useRef(null);
  const fruitsRef = useRef([]);
  const bulletsRef = useRef([]);
  const lastSpawnRef = useRef(0);
  const fruitsDestroyedRef = useRef(0);
  const [wave, setWave] = useState(1);
  const [cannonX, setCannonX] = useState(CANVAS_WIDTH / 2);

  // Calculate spawn rate based on wave
  const getSpawnRate = useCallback(() => {
    return Math.max(
      DIFFICULTY.minSpawnRate,
      DIFFICULTY.baseSpawnRate - (wave - 1) * DIFFICULTY.spawnRateDecrease
    );
  }, [wave]);

  // Handle mouse/touch movement for cannon aiming
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCannonPosition = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * CANVAS_WIDTH;
      setCannonX(Math.max(CANNON.width / 2, Math.min(x, CANVAS_WIDTH - CANNON.width / 2)));
    };

    const handleMouseMove = (e) => updateCannonPosition(e.clientX);
    const handleTouchMove = (e) => {
      e.preventDefault();
      updateCannonPosition(e.touches[0].clientX);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Handle shooting
  const handleShoot = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x;

    if (e.type === 'click') {
      x = ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    } else if (e.type === 'touchstart') {
      e.preventDefault();
      x = ((e.touches[0].clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    }

    const bullet = createBullet(x, CANVAS_HEIGHT);
    bulletsRef.current.push(bullet);
  }, []);

  // Draw cannon
  const drawCannon = useCallback((ctx) => {
    const x = cannonX;
    const y = CANVAS_HEIGHT - 20;

    // Base
    ctx.fillStyle = CANNON.color;
    ctx.beginPath();
    ctx.roundRect(x - CANNON.width / 2, y - CANNON.height / 2, CANNON.width, CANNON.height, 8);
    ctx.fill();

    // Barrel
    ctx.fillStyle = CANNON.barrelColor;
    ctx.beginPath();
    ctx.roundRect(x - 6, y - CANNON.height - 10, 12, 20, 4);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.roundRect(x - CANNON.width / 2 + 4, y - CANNON.height / 2 + 4, CANNON.width - 8, 8, 4);
    ctx.fill();
  }, [cannonX]);

  // Main game loop
  const gameLoop = useCallback((deltaTime) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 50; i++) {
      const x = (i * 97) % CANVAS_WIDTH;
      const y = (i * 53) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 2, 2);
    }

    // Spawn fruits
    lastSpawnRef.current += deltaTime;
    if (lastSpawnRef.current >= getSpawnRate()) {
      lastSpawnRef.current = 0;
      const fruit = createFruit(wave);
      fruitsRef.current.push(fruit);
    }

    // Update and draw bullets
    bulletsRef.current = bulletsRef.current
      .map((bullet) => updateBullet(bullet, deltaTime))
      .filter((bullet) => !isBulletOffScreen(bullet));

    bulletsRef.current.forEach((bullet) => drawBullet(ctx, bullet));

    // Update fruits
    fruitsRef.current = fruitsRef.current.map((fruit) => updateFruit(fruit, deltaTime));

    // Check collisions
    const { remainingBullets, remainingFruits, destroyedFruits } = processCollisions(
      bulletsRef.current,
      fruitsRef.current
    );

    bulletsRef.current = remainingBullets;
    fruitsRef.current = remainingFruits;

    // Score for destroyed fruits
    if (destroyedFruits.length > 0) {
      const points = destroyedFruits.reduce((sum, f) => sum + f.points, 0);
      setScore((prev) => prev + points);
      fruitsDestroyedRef.current += destroyedFruits.length;

      // Check for wave progression
      if (fruitsDestroyedRef.current >= DIFFICULTY.waveThreshold * wave) {
        setWave((prev) => prev + 1);
      }
    }

    // Check for escaped fruits
    const escapedFruits = fruitsRef.current.filter((f) => isFruitOffScreen(f, CANVAS_HEIGHT));
    if (escapedFruits.length > 0) {
      fruitsRef.current = fruitsRef.current.filter((f) => !isFruitOffScreen(f, CANVAS_HEIGHT));
      setLives((prev) => {
        const newLives = prev - escapedFruits.length;
        if (newLives <= 0) {
          onGameOver();
        }
        return Math.max(0, newLives);
      });
    }

    // Draw fruits
    fruitsRef.current.forEach((fruit) => drawFruit(ctx, fruit));

    // Draw cannon
    drawCannon(ctx);

    // Draw ground line
    ctx.strokeStyle = COLORS.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT - 4);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 4);
    ctx.stroke();
  }, [wave, getSpawnRate, drawCannon, setScore, setLives, onGameOver]);

  // Run game loop
  useGameLoop(gameLoop, true);

  return (
    <div className="game-container">
      <HUD score={score} lives={lives} wave={wave} />
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleShoot}
        onTouchStart={handleShoot}
        className="game-canvas"
      />
    </div>
  );
};

export default Game;
