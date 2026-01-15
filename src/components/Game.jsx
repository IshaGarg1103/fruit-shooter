import { useRef, useCallback, useState, useEffect } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { CANVAS_WIDTH, CANVAS_HEIGHT, CHARACTER, COLORS, DIFFICULTY, COMBO, INITIAL_LIVES } from '../game/constants';
import { createFruit, createPowerUp, updateFruit, drawFruit, isFruitOffScreen, createExplosion, updateParticles } from '../game/Fruit';
import { createBullet, updateBullet, drawBullet, isBulletOffScreen } from '../game/Bullet';
import { processCollisions } from '../game/collision';
import HUD from './HUD';

// Preload life-lost sound
const lifeLostSound = new Audio('./life-lost.mp3');
lifeLostSound.volume = 1.0;

const playLifeLostSound = () => {
  lifeLostSound.currentTime = 0;
  lifeLostSound.play().catch(() => {});
};

const Game = ({ onGameOver, score, setScore, lives, setLives }) => {
  const canvasRef = useRef(null);
  const gojoImageRef = useRef(null);
  const fruitsRef = useRef([]);
  const bulletsRef = useRef([]);
  const particlesRef = useRef([]);
  const lastSpawnRef = useRef(0);
  const fruitsDestroyedRef = useRef(0);
  const lastHitTimeRef = useRef(0);
  const [wave, setWave] = useState(1);
  const [characterX, setCharacterX] = useState(CANVAS_WIDTH / 2);
  const [combo, setCombo] = useState(0);
  const [comboDisplay, setComboDisplay] = useState(null);
  const [activeEffects, setActiveEffects] = useState({});
  const [floatingScores, setFloatingScores] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);

  // Load Orbitron font for canvas
  useEffect(() => {
    if (document.fonts && document.fonts.check) {
      document.fonts.ready.then(() => {
        setFontLoaded(true);
      });
    } else {
      // Fallback: wait a bit for font to load
      setTimeout(() => setFontLoaded(true), 1000);
    }
  }, []);

  // Load Gojo sprite
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      console.log('Gojo image loaded successfully!', img.width, img.height);
      gojoImageRef.current = img;
      setImageLoaded(true);
    };
    img.onerror = (e) => {
      console.error('Failed to load Gojo image:', e);
    };
    // Try relative path
    img.src = './gojo.png';
  }, []);

  const getSpawnRate = useCallback(() => {
    return Math.max(
      DIFFICULTY.minSpawnRate,
      DIFFICULTY.baseSpawnRate - (wave - 1) * DIFFICULTY.spawnRateDecrease
    );
  }, [wave]);

  // Handle mouse/touch movement
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updatePosition = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * CANVAS_WIDTH;
      setCharacterX(Math.max(CHARACTER.width / 2, Math.min(x, CANVAS_WIDTH - CHARACTER.width / 2)));
    };

    const handleMouseMove = (e) => updatePosition(e.clientX);
    const handleTouchMove = (e) => {
      e.preventDefault();
      updatePosition(e.touches[0].clientX);
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

    // Bullets spawn from character center (above head)
    const bulletX = characterX;
    const baseY = CANVAS_HEIGHT + 5;
    const bulletY = baseY - CHARACTER.height - 5; // Just above character's head
    
    const bullet = createBullet(bulletX, bulletY);
    bulletsRef.current.push(bullet);
    
    if (activeEffects.rapidFire) {
      setTimeout(() => {
        bulletsRef.current.push(createBullet(bulletX - 25, bulletY));
        bulletsRef.current.push(createBullet(bulletX + 25, bulletY));
      }, 50);
    }
  }, [activeEffects, characterX]);

  const addFloatingScore = useCallback((x, y, points, isCombo = false) => {
    const id = Date.now() + Math.random();
    setFloatingScores(prev => [...prev, { id, x, y, points, isCombo, life: 1 }]);
    setTimeout(() => {
      setFloatingScores(prev => prev.filter(s => s.id !== id));
    }, 800);
  }, []);

  // Draw Gojo-themed background
  const drawBackground = useCallback((ctx, time) => {
    // Dark gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#0f0f2a');
    gradient.addColorStop(1, '#1a1a3a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Animated infinity domain effect (subtle)
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const radius = 100 + i * 80 + Math.sin(time / 2000 + i) * 20;
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT + 100, radius, Math.PI, 0);
      ctx.stroke();
    }

    // Floating particles (infinity energy)
    for (let i = 0; i < 30; i++) {
      const x = (i * 97 + time * 0.02) % CANVAS_WIDTH;
      const y = (i * 53 + Math.sin(time / 1000 + i) * 20) % (CANVAS_HEIGHT - 80);
      const alpha = 0.3 + Math.sin(time / 500 + i) * 0.2;
      const size = 2 + Math.sin(time / 300 + i) * 1;
      
      ctx.fillStyle = i % 2 === 0 ? `rgba(0, 212, 255, ${alpha})` : `rgba(123, 104, 238, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hexagonal grid pattern (subtle)
    ctx.strokeStyle = 'rgba(123, 104, 238, 0.05)';
    ctx.lineWidth = 1;
    const hexSize = 60;
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 15; col++) {
        const offsetX = row % 2 === 0 ? 0 : hexSize * 0.866;
        const x = col * hexSize * 1.732 + offsetX;
        const y = row * hexSize * 1.5;
        drawHexagon(ctx, x, y, hexSize * 0.5);
      }
    }

    // Bottom platform with glow (lower, at character's feet)
    const platformGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - 15, 0, CANVAS_HEIGHT);
    platformGradient.addColorStop(0, 'rgba(0, 212, 255, 0.15)');
    platformGradient.addColorStop(0.5, 'rgba(123, 104, 238, 0.25)');
    platformGradient.addColorStop(1, 'rgba(42, 26, 74, 0.9)');
    ctx.fillStyle = platformGradient;
    ctx.fillRect(0, CANVAS_HEIGHT - 15, CANVAS_WIDTH, 15);

    // Platform edge glow
    ctx.strokeStyle = COLORS.infinityBlue;
    ctx.lineWidth = 2;
    ctx.shadowColor = COLORS.infinityBlue;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT - 15);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 15);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, []);

  // Helper to draw hexagon
  const drawHexagon = (ctx, x, y, size) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const px = x + size * Math.cos(angle);
      const py = y + size * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  };

  // Draw Gojo character
  const drawCharacter = useCallback((ctx) => {
    const x = characterX;
    const baseY = CANVAS_HEIGHT + 5; // Feet on the platform
    const imgWidth = CHARACTER.width;
    const imgHeight = CHARACTER.height;
    
    // Subtle glow effect under character
    ctx.save();
    ctx.shadowColor = COLORS.infinityBlue;
    ctx.shadowBlur = 15;
    ctx.fillStyle = 'rgba(0, 212, 255, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x, baseY - 5, 40, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Draw Gojo sprite if loaded, otherwise draw placeholder
    if (gojoImageRef.current && gojoImageRef.current.complete) {
      ctx.drawImage(
        gojoImageRef.current,
        x - imgWidth / 2,
        baseY - imgHeight,
        imgWidth,
        imgHeight
      );
    } else {
      // Fallback: draw a blocky Gojo character
      ctx.fillStyle = '#1a1a4a';
      // Body
      ctx.fillRect(x - 25, baseY - 70, 50, 55);
      // Head
      ctx.fillStyle = '#f5d0a9';
      ctx.fillRect(x - 18, baseY - 95, 36, 30);
      // Blindfold (Gojo style)
      ctx.fillStyle = '#000';
      ctx.fillRect(x - 20, baseY - 88, 40, 10);
      // Hair (white spiky)
      ctx.fillStyle = '#e8e8f0';
      ctx.beginPath();
      ctx.moveTo(x - 20, baseY - 93);
      ctx.lineTo(x - 12, baseY - 112);
      ctx.lineTo(x - 4, baseY - 100);
      ctx.lineTo(x, baseY - 115);
      ctx.lineTo(x + 4, baseY - 100);
      ctx.lineTo(x + 12, baseY - 112);
      ctx.lineTo(x + 20, baseY - 93);
      ctx.closePath();
      ctx.fill();
      // Legs
      ctx.fillStyle = '#1a1a3a';
      ctx.fillRect(x - 18, baseY - 15, 16, 15);
      ctx.fillRect(x + 2, baseY - 15, 16, 15);
    }
  }, [characterX]);

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
        particlesRef.current.push(...createExplosion(fruit.x, fruit.y, fruit.emoji, fruit.color));
        
        if (fruit.isPowerUp) {
          if (fruit.effect === 'extraLife') {
            // Only add life if player doesn't already have full lives (3)
            if (lives < INITIAL_LIVES) {
              setLives(prev => Math.min(prev + 1, 5));
              addFloatingScore(fruit.x, fruit.y, '+💙', true);
            }
            // If lives are full, don't add life or show floating score
          } else if (fruit.effect === 'doublePoints') {
            setActiveEffects(prev => ({ ...prev, doublePoints: true }));
            setTimeout(() => setActiveEffects(prev => ({ ...prev, doublePoints: false })), fruit.duration);
            addFloatingScore(fruit.x, fruit.y, '⚡', true);
          } else if (fruit.effect === 'rapidFire') {
            setActiveEffects(prev => ({ ...prev, rapidFire: true }));
            setTimeout(() => setActiveEffects(prev => ({ ...prev, rapidFire: false })), fruit.duration);
            addFloatingScore(fruit.x, fruit.y, '⚡', true);
          }
        } else if (fruit.isBomb) {
          // Bomb takes away 1 life
          playLifeLostSound();
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              onGameOver();
            }
            return Math.max(0, newLives);
          });
          addFloatingScore(fruit.x, fruit.y, '-1 💔', false);
          setCombo(0);
        } else {
          const timeSinceLastHit = now - lastHitTimeRef.current;
          let newCombo = combo;
          
          if (timeSinceLastHit < COMBO.timeWindow) {
            newCombo = Math.min(combo + 1, COMBO.multiplierCap);
          } else {
            newCombo = 1;
          }
          
          setCombo(newCombo);
          lastHitTimeRef.current = now;
          
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

      if (fruitsDestroyedRef.current >= DIFFICULTY.waveThreshold * wave) {
        setWave(prev => prev + 1);
      }
    }

    // Check for escaped fruits (fruits that pass below character)
    const escapeLineY = CANVAS_HEIGHT - 20;
    const escapedFruits = fruitsRef.current.filter(f => 
      isFruitOffScreen(f, escapeLineY) && !f.isPowerUp
    );
    
    if (escapedFruits.length > 0) {
      fruitsRef.current = fruitsRef.current.filter(f => !isFruitOffScreen(f, escapeLineY));
      
      const livesLost = escapedFruits.filter(f => !f.isBomb).length;
      if (livesLost > 0) {
        playLifeLostSound();
        setCombo(0);
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

    // Draw fruits (enhanced)
    fruitsRef.current.forEach((fruit) => drawFruit(ctx, fruit));

    // Draw character
    drawCharacter(ctx);

    // Draw floating scores
    floatingScores.forEach(fs => {
      const age = (Date.now() - fs.id) / 800;
      ctx.save();
      ctx.globalAlpha = 1 - age;
      ctx.font = fs.isCombo ? '700 22px "Orbitron", sans-serif' : '400 18px "Orbitron", sans-serif';
      ctx.fillStyle = fs.isCombo ? COLORS.combo : (typeof fs.points === 'string' ? COLORS.infinityBlue : (fs.points < 0 ? COLORS.accent : COLORS.primary));
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      const text = typeof fs.points === 'string' ? fs.points : `+${fs.points}`;
      ctx.strokeText(text, fs.x, fs.y - age * 50);
      ctx.fillText(text, fs.x, fs.y - age * 50);
      ctx.restore();
    });

    // Draw combo display
    if (comboDisplay && performance.now() - comboDisplay.time < 1000) {
      const age = (performance.now() - comboDisplay.time) / 1000;
      ctx.save();
      ctx.globalAlpha = 1 - age;
      // Use numeric weight (700 = bold) and ensure font is loaded
      ctx.font = '700 36px "Orbitron", sans-serif';
      ctx.fillStyle = COLORS.combo;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.textAlign = 'center';
      ctx.shadowColor = COLORS.combo;
      ctx.shadowBlur = 20;
      ctx.strokeText(`${comboDisplay.combo}x COMBO!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - age * 40);
      ctx.fillText(`${comboDisplay.combo}x COMBO!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - age * 40);
      ctx.restore();
    }
  }, [wave, combo, getSpawnRate, drawCharacter, drawBackground, setScore, setLives, onGameOver, addFloatingScore, floatingScores, comboDisplay, activeEffects]);

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
