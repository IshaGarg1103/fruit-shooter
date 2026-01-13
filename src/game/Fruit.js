import { FRUIT_TYPES, POWERUP_TYPES, CANVAS_WIDTH, DIFFICULTY } from './constants';

let fruitIdCounter = 0;

/**
 * Select a random fruit type using weighted probability
 */
const selectWeightedFruit = () => {
  const totalWeight = FRUIT_TYPES.reduce((sum, f) => sum + f.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const fruit of FRUIT_TYPES) {
    random -= fruit.weight;
    if (random <= 0) {
      return fruit;
    }
  }
  return FRUIT_TYPES[0]; // Fallback
};

/**
 * Create a new fruit object
 * @param {number} wave - Current wave number for difficulty scaling
 */
export const createFruit = (wave = 1) => {
  const type = selectWeightedFruit();
  const speedMultiplier = 1 + (wave - 1) * DIFFICULTY.speedMultiplierIncrease;

  return {
    id: ++fruitIdCounter,
    x: Math.random() * (CANVAS_WIDTH - type.size * 2) + type.size,
    y: -type.size,
    ...type,
    speed: type.speed * speedMultiplier,
    currentHits: 0,
    wobbleOffset: type.wobble ? Math.random() * Math.PI * 2 : 0,
    rotation: 0,
    rotationSpeed: (Math.random() - 0.5) * 0.1,
    time: 0,
    scale: 1,
  };
};

/**
 * Create a power-up
 */
export const createPowerUp = () => {
  const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
  
  return {
    id: ++fruitIdCounter,
    x: Math.random() * (CANVAS_WIDTH - type.size * 2) + type.size,
    y: -type.size,
    ...type,
    speed: 2,
    time: 0,
    isPowerUp: true,
    currentHits: 0,
    hits: 1,
  };
};

/**
 * Update fruit position
 * @param {Object} fruit - Fruit object to update
 * @param {number} deltaTime - Time since last frame in ms
 */
export const updateFruit = (fruit, deltaTime) => {
  const timeScale = deltaTime / 16.67; // Normalize to 60fps
  
  fruit.y += fruit.speed * timeScale;
  fruit.time += deltaTime;
  fruit.rotation += fruit.rotationSpeed * timeScale;

  // Apply wobble for bananas
  if (fruit.wobble) {
    fruit.x += Math.sin(fruit.time / 200 + fruit.wobbleOffset) * 2;
  }
  
  // Floating effect for power-ups
  if (fruit.isPowerUp) {
    fruit.x += Math.sin(fruit.time / 300) * 1;
    fruit.scale = 1 + Math.sin(fruit.time / 200) * 0.1;
  }

  // Keep within bounds
  fruit.x = Math.max(fruit.size / 2, Math.min(fruit.x, CANVAS_WIDTH - fruit.size / 2));

  return fruit;
};

/**
 * Draw fruit on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} fruit - Fruit to draw
 */
export const drawFruit = (ctx, fruit) => {
  ctx.save();
  ctx.translate(fruit.x, fruit.y);
  ctx.rotate(fruit.rotation);
  ctx.scale(fruit.scale || 1, fruit.scale || 1);
  
  ctx.font = `${fruit.size}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Flash effect when hit (for multi-hit fruits)
  if (fruit.currentHits > 0 && fruit.hits > 1) {
    ctx.globalAlpha = 0.6 + Math.sin(fruit.time / 50) * 0.4;
  }
  
  // Glow effect for power-ups
  if (fruit.isPowerUp) {
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 15;
  }
  
  // Bomb glow
  if (fruit.isBomb) {
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 10;
  }
  
  ctx.fillText(fruit.emoji, 0, 0);
  
  ctx.restore();
};

/**
 * Check if fruit is off screen (escaped)
 * @param {Object} fruit - Fruit to check
 * @param {number} canvasHeight - Height of canvas
 */
export const isFruitOffScreen = (fruit, canvasHeight) => {
  return fruit.y > canvasHeight + fruit.size;
};

/**
 * Create explosion particles
 */
export const createExplosion = (x, y, emoji, count = 6) => {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * (2 + Math.random() * 2),
      vy: Math.sin(angle) * (2 + Math.random() * 2) - 2,
      emoji,
      size: 16 + Math.random() * 8,
      life: 1,
      decay: 0.02 + Math.random() * 0.01,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
    });
  }
  return particles;
};

/**
 * Update and draw particles
 */
export const updateParticles = (particles, ctx, deltaTime) => {
  const timeScale = deltaTime / 16.67;
  
  return particles.filter(p => {
    p.x += p.vx * timeScale;
    p.y += p.vy * timeScale;
    p.vy += 0.15 * timeScale; // Gravity
    p.life -= p.decay * timeScale;
    p.rotation += p.rotationSpeed * timeScale;
    
    if (p.life > 0) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.life;
      ctx.font = `${p.size * p.life}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.emoji, 0, 0);
      ctx.restore();
      return true;
    }
    return false;
  });
};
