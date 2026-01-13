import { useRef, useCallback, useState, useEffect } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { CANVAS_WIDTH, CANVAS_HEIGHT, CANNON, COLORS, DIFFICULTY, COMBO } from '../game/constants';
import { createFruit, createPowerUp, updateFruit, drawFruit, isFruitOffScreen, createExplosion, updateParticles } from '../game/Fruit';
import { createBullet, updateBullet, drawBullet, isBulletOffScreen } from '../game/Bullet';
import { processCollisions } from '../game/collision';
import HUD from './HUD';

const Game = ({ onGameOver, score, setScore, lives, setLives }) => {
  const canvasRef = useRef(null);
  const fruitsRef = useRef([]);
  const bulletsRef = useRef([]);
  const particlesRef = useRef([]);
  const lastSpawnRef = useRef(0);
  const fruitsDestroyedRef = useRef(0);
  const lastHitTimeRef = useRef(0);
  const [wave, setWave] = useState(1);
  const [cannonX, setCannonX] = useState(CANVAS_WIDTH / 2);
  const [combo, setCombo] = useState(0);
  const [comboDisplay, setComboDisplay] = useState(null);
  const [activeEffects, setActiveEffects] = useState({});
  const [floatingScores, setFloatingScores] = useState([]);

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

    // Rapid fire if power-up active
    const bullet = createBullet(x, CANVAS_HEIGHT);
    bulletsRef.current.push(bullet);
    
    if (activeEffects.rapidFire) {
      setTimeout(() => {
        bulletsRef.current.push(createBullet(x - 15, CANVAS_HEIGHT));
        bulletsRef.current.push(createBullet(x + 15, CANVAS_HEIGHT));
      }, 50);
    }
  }, [activeEffects]);

  // Add floating score
  const addFloatingScore = useCallback((x, y, points, isCombo = false) => {
    const id = Date.now() + Math.random();
    setFloatingScores(prev => [...prev, { id, x, y, points, isCombo, life: 1 }]);
    setTimeout(() => {
      setFloatingScores(prev => prev.filter(s => s.id !== id));
    }, 800);
  }, []);

  // Draw cannon
  const drawCannon = useCallback((ctx) => {
    const x = cannonX;
    const y = CANVAS_HEIGHT - 20;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x, CANVAS_HEIGHT - 5, CANNON.width / 2, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Base
    ctx.fillStyle = CANNON.color;
    ctx.beginPath();
    ctx.roundRect(x - CANNON.width / 2, y - CANNON.height / 2, CANNON.width, CANNON.height, 8);
    ctx.fill();

    // Barrel
    ctx.fillStyle = CANNON.barrelColor;
    ctx.beginPath();
    ctx.roundRect(x - 7, y - CANNON.height - 12, 14, 24, 4);
    ctx.fill();

    // Barrel highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(x - 4, y - CANNON.height - 10, 4, 18, 2);
    ctx.fill();

    // Base highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.roundRect(x - CANNON.width / 2 + 4, y - CANNON.height / 2 + 4, CANNON.width - 8, 8, 4);
    ctx.fill();
    
    // Cannon glow when rapid fire
    if (activeEffects.rapidFire) {
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 20;
      ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.roundRect(x - CANNON.width / 2, y - CANNON.height / 2, CANNON.width, CANNON.height, 8);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }, [cannonX, activeEffects]);

  // Draw background
  const drawBackground = useCallback((ctx, time) => {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#0f0f2a');
    gradient.addColorStop(1, '#1a1a3a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Animated stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 60; i++) {
      const x = (i * 97 + time * 0.01) % CANVAS_WIDTH;
      const y = (i * 53) % (CANVAS_HEIGHT - 100);
      const twinkle = Math.sin(time / 500 + i) * 0.5 + 0.5;
      ctx.globalAlpha = twinkle * 0.8;
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1;

    // Ground gradient
    const groundGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - 40, 0, CANVAS_HEIGHT);
    groundGradient.addColorStop(0, 'transparent');
    groundGradient.addColorStop(1, 'rgba(74, 156, 45, 0.3)');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, CANVAS_HEIGHT - 40, CANVAS_WIDTH, 40);
  }, []);

  // Main game loop
  const gameLoop = useCallback((deltaTime) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const currentTime = performance.now();

    // Draw background
    drawBackground(ctx, currentTime);

    // Spawn fruits
    lastSpawnRef.current += deltaTime;
    if (lastSpawnRef.current >= getSpawnRate()) {
      lastSpawnRef.current = 0;
      
      // Chance to spawn power-up
      if (Math.random() < DIFFICULTY.powerUpChance) {
        fruitsRef.current.push(createPowerUp());
      } else {
        fruitsRef.current.push(createFruit(wave));
      }
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

    // Process destroyed fruits
    if (destroyedFruits.length > 0) {
      const now = performance.now();
      
      destroyedFruits.forEach(fruit => {
        // Create explosion particles
        particlesRef.current.push(...createExplosion(fruit.x, fruit.y, fruit.emoji));
        
        // Handle power-ups
        if (fruit.isPowerUp) {
          if (fruit.effect === 'extraLife') {
            setLives(prev => Math.min(prev + 1, 5));
          } else if (fruit.effect === 'doublePoints') {
            setActiveEffects(prev => ({ ...prev, doublePoints: true }));
            setTimeout(() => setActiveEffects(prev => ({ ...prev, doublePoints: false })), fruit.duration);
          } else if (fruit.effect === 'rapidFire') {
            setActiveEffects(prev => ({ ...prev, rapidFire: true }));
            setTimeout(() => setActiveEffects(prev => ({ ...prev, rapidFire: false })), fruit.duration);
          }
          addFloatingScore(fruit.x, fruit.y, fruit.effect === 'extraLife' ? '+♥' : '⚡', true);
        } else if (fruit.isBomb) {
          // Bomb penalty
          setScore(prev => Math.max(0, prev + fruit.points));
          addFloatingScore(fruit.x, fruit.y, fruit.points, false);
          setCombo(0);
        } else {
          // Calculate combo
          const timeSinceLastHit = now - lastHitTimeRef.current;
          let newCombo = combo;
          
          if (timeSinceLastHit < COMBO.timeWindow) {
            newCombo = Math.min(combo + 1, COMBO.multiplierCap);
          } else {
            newCombo = 1;
          }
          
          setCombo(newCombo);
          lastHitTimeRef.current = now;
          
          // Calculate points with combo and power-up multipliers
          let points = fruit.points * newCombo;
          if (activeEffects.doublePoints) points *= 2;
          
          setScore(prev => prev + points);
          addFloatingScore(fruit.x, fruit.y, points, newCombo > 1);
          
          if (newCombo > 1) {
            setComboDisplay({ combo: newCombo, time: now });
          }
        }
      });
      
      fruitsDestroyedRef.current += destroyedFruits.filter(f => !f.isPowerUp && !f.isBomb).length;

      // Check for wave progression
      if (fruitsDestroyedRef.current >= DIFFICULTY.waveThreshold * wave) {
        setWave(prev => prev + 1);
      }
    }

    // Check for escaped fruits (not power-ups or bombs)
    const escapedFruits = fruitsRef.current.filter(f => 
      isFruitOffScreen(f, CANVAS_HEIGHT) && !f.isPowerUp
    );
    
    if (escapedFruits.length > 0) {
      fruitsRef.current = fruitsRef.current.filter(f => !isFruitOffScreen(f, CANVAS_HEIGHT));
      
      const livesLost = escapedFruits.filter(f => !f.isBomb).length;
      if (livesLost > 0) {
        setCombo(0); // Reset combo on miss
        setLives(prev => {
          const newLives = prev - livesLost;
          if (newLives <= 0) {
            onGameOver();
          }
          return Math.max(0, newLives);
        });
      }
    }

    // Update and draw particles
    particlesRef.current = updateParticles(particlesRef.current, ctx, deltaTime);

    // Draw fruits
    fruitsRef.current.forEach((fruit) => drawFruit(ctx, fruit));

    // Draw cannon
    drawCannon(ctx);

    // Draw ground line
    ctx.strokeStyle = COLORS.primary;
    ctx.lineWidth = 3;
    ctx.shadowColor = COLORS.primary;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT - 4);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 4);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw floating scores
    floatingScores.forEach(fs => {
      const age = (Date.now() - fs.id) / 800;
      ctx.save();
      ctx.globalAlpha = 1 - age;
      ctx.font = fs.isCombo ? 'bold 18px "Press Start 2P", monospace' : '14px "Press Start 2P", monospace';
      ctx.fillStyle = fs.isCombo ? COLORS.combo : (typeof fs.points === 'string' ? '#00ff00' : (fs.points < 0 ? '#ff0000' : COLORS.primary));
      ctx.textAlign = 'center';
      ctx.fillText(typeof fs.points === 'string' ? fs.points : `+${fs.points}`, fs.x, fs.y - age * 40);
      ctx.restore();
    });

    // Draw combo display
    if (comboDisplay && performance.now() - comboDisplay.time < 1000) {
      const age = (performance.now() - comboDisplay.time) / 1000;
      ctx.save();
      ctx.globalAlpha = 1 - age;
      ctx.font = 'bold 24px "Press Start 2P", monospace';
      ctx.fillStyle = COLORS.combo;
      ctx.textAlign = 'center';
      ctx.shadowColor = COLORS.combo;
      ctx.shadowBlur = 15;
      ctx.fillText(`${comboDisplay.combo}x COMBO!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - age * 30);
      ctx.restore();
    }
  }, [wave, combo, getSpawnRate, drawCannon, drawBackground, setScore, setLives, onGameOver, addFloatingScore, floatingScores, comboDisplay, activeEffects]);

  // Run game loop
  useGameLoop(gameLoop, true);

  return (
    <div className="game-container">
      <HUD score={score} lives={lives} wave={wave} combo={combo} activeEffects={activeEffects} />
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
