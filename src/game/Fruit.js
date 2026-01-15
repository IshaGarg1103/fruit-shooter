import { FRUIT_TYPES, POWERUP_TYPES, CANVAS_WIDTH, DIFFICULTY, COLORS } from './constants';

let fruitIdCounter = 0;

// Preload Sukuna bomb image
let sukunaBombImage = null;
const loadBombImage = () => {
  if (!sukunaBombImage) {
    sukunaBombImage = new Image();
    sukunaBombImage.src = './sukuna-bomb.png';
  }
}
loadBombImage();

const selectWeightedFruit = () => {
  const totalWeight = FRUIT_TYPES.reduce((sum, f) => sum + f.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const fruit of FRUIT_TYPES) {
    random -= fruit.weight;
    if (random <= 0) {
      return fruit;
    }
  }
  return FRUIT_TYPES[0];
};

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
    rotationSpeed: (Math.random() - 0.5) * 0.15,
    time: 0,
    scale: 1,
  };
};

export const createPowerUp = () => {
  const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
  
  return {
    id: ++fruitIdCounter,
    x: Math.random() * (CANVAS_WIDTH - type.size * 2) + type.size,
    y: -type.size,
    ...type,
    speed: 2.5,
    time: 0,
    isPowerUp: true,
    currentHits: 0,
    hits: 1,
    rotation: 0,
    rotationSpeed: 0.02,
    scale: 1,
  };
};

export const updateFruit = (fruit, deltaTime) => {
  const timeScale = deltaTime / 16.67;
  
  fruit.y += fruit.speed * timeScale;
  fruit.time += deltaTime;
  fruit.rotation += fruit.rotationSpeed * timeScale;

  if (fruit.wobble) {
    fruit.x += Math.sin(fruit.time / 200 + fruit.wobbleOffset) * 2.5;
  }
  
  if (fruit.isPowerUp) {
    fruit.x += Math.sin(fruit.time / 300) * 1.5;
    fruit.scale = 1 + Math.sin(fruit.time / 200) * 0.15;
  }

  fruit.x = Math.max(fruit.size / 2, Math.min(fruit.x, CANVAS_WIDTH - fruit.size / 2));

  return fruit;
};

/**
 * Draw custom stylized fruit
 */
export const drawFruit = (ctx, fruit) => {
  ctx.save();
  ctx.translate(fruit.x, fruit.y);
  ctx.rotate(fruit.rotation);
  ctx.scale(fruit.scale || 1, fruit.scale || 1);
  
  const size = fruit.size * 0.45;
  
  // Multi-hit fruits flash when damaged
  if (fruit.currentHits > 0 && fruit.hits > 1) {
    ctx.globalAlpha = 0.7 + Math.sin(fruit.time / 50) * 0.3;
  }
  
  // Draw based on fruit type
  if (fruit.isPowerUp) {
    drawPowerUp(ctx, fruit, size);
  } else if (fruit.isBomb) {
    drawBomb(ctx, fruit, size);
  } else {
    drawStylizedFruit(ctx, fruit, size);
  }
  
  ctx.restore();
};

// Draw custom stylized fruits
const drawStylizedFruit = (ctx, fruit, size) => {
  const name = fruit.name;
  
  // Glow effect
  ctx.shadowColor = fruit.color;
  ctx.shadowBlur = 12;
  
  switch(name) {
    case 'apple':
      drawApple(ctx, size);
      break;
    case 'orange':
      drawOrange(ctx, size);
      break;
    case 'lemon':
      drawLemon(ctx, size);
      break;
    case 'grape':
      drawGrape(ctx, size);
      break;
    case 'banana':
      drawBanana(ctx, size);
      break;
    case 'watermelon':
      drawWatermelon(ctx, size);
      break;
    case 'strawberry':
      drawStrawberry(ctx, size);
      break;
    case 'kiwi':
      drawKiwi(ctx, size);
      break;
    default:
      drawApple(ctx, size);
  }
};

const drawApple = (ctx, size) => {
  // Main body
  const gradient = ctx.createRadialGradient(-size*0.2, -size*0.2, 0, 0, 0, size);
  gradient.addColorStop(0, '#ff6b6b');
  gradient.addColorStop(0.7, '#e63946');
  gradient.addColorStop(1, '#9d0208');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();
  
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.ellipse(-size*0.3, -size*0.3, size*0.3, size*0.2, -0.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Stem
  ctx.strokeStyle = '#5a3921';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(2, -size - 8);
  ctx.stroke();
  
  // Leaf
  ctx.fillStyle = '#2d6a4f';
  ctx.beginPath();
  ctx.ellipse(6, -size - 4, 8, 4, 0.5, 0, Math.PI * 2);
  ctx.fill();
};

const drawOrange = (ctx, size) => {
  const gradient = ctx.createRadialGradient(-size*0.2, -size*0.2, 0, 0, 0, size);
  gradient.addColorStop(0, '#ffc947');
  gradient.addColorStop(0.6, '#ff9f1c');
  gradient.addColorStop(1, '#e85d04');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();
  
  // Texture dots
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    const r = size * 0.5;
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.ellipse(-size*0.3, -size*0.3, size*0.25, size*0.15, -0.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Leaf
  ctx.fillStyle = '#2d6a4f';
  ctx.beginPath();
  ctx.ellipse(0, -size - 2, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();
};

const drawLemon = (ctx, size) => {
  const gradient = ctx.createRadialGradient(-size*0.2, -size*0.2, 0, 0, 0, size * 1.2);
  gradient.addColorStop(0, '#fff75e');
  gradient.addColorStop(0.6, '#ffe227');
  gradient.addColorStop(1, '#ffc800');
  ctx.fillStyle = gradient;
  
  // Oval lemon shape
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.2, size * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.ellipse(-size*0.4, -size*0.2, size*0.3, size*0.15, -0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Tips
  ctx.fillStyle = '#ffc800';
  ctx.beginPath();
  ctx.ellipse(-size * 1.1, 0, 6, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(size * 1.1, 0, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();
};

const drawGrape = (ctx, size) => {
  const grapeColor = '#8338ec';
  const highlight = '#a855f7';
  
  // Draw grape cluster
  const positions = [
    [0, -size*0.6], [-size*0.5, 0], [size*0.5, 0],
    [-size*0.25, size*0.5], [size*0.25, size*0.5], [0, 0]
  ];
  
  positions.forEach(([x, y], i) => {
    const gradient = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, size * 0.45);
    gradient.addColorStop(0, highlight);
    gradient.addColorStop(0.6, grapeColor);
    gradient.addColorStop(1, '#5b21b6');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // Tiny highlight
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(x - 4, y - 4, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Stem
  ctx.strokeStyle = '#5a3921';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(0, -size - 10);
  ctx.stroke();
};

const drawBanana = (ctx, size) => {
  ctx.save();
  ctx.rotate(-0.3);
  
  const gradient = ctx.createLinearGradient(-size, 0, size, 0);
  gradient.addColorStop(0, '#ffe169');
  gradient.addColorStop(0.5, '#ffd000');
  gradient.addColorStop(1, '#e6b800');
  ctx.fillStyle = gradient;
  
  // Curved banana shape
  ctx.beginPath();
  ctx.moveTo(-size * 1.2, 0);
  ctx.quadraticCurveTo(-size * 0.8, -size * 0.8, 0, -size * 0.6);
  ctx.quadraticCurveTo(size * 0.8, -size * 0.4, size * 1.2, size * 0.1);
  ctx.quadraticCurveTo(size * 0.8, size * 0.3, 0, size * 0.2);
  ctx.quadraticCurveTo(-size * 0.8, size * 0.1, -size * 1.2, 0);
  ctx.fill();
  
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.ellipse(-size*0.3, -size*0.3, size*0.5, size*0.1, -0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Tips
  ctx.fillStyle = '#8b7355';
  ctx.beginPath();
  ctx.arc(-size * 1.15, 0, 4, 0, Math.PI * 2);
  ctx.arc(size * 1.15, size * 0.1, 4, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
};

const drawWatermelon = (ctx, size) => {
  // Outer rind (green)
  const rindGradient = ctx.createRadialGradient(0, size*0.3, 0, 0, 0, size * 1.1);
  rindGradient.addColorStop(0.7, '#4ade80');
  rindGradient.addColorStop(0.85, '#22c55e');
  rindGradient.addColorStop(1, '#166534');
  ctx.fillStyle = rindGradient;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner flesh (red)
  const fleshGradient = ctx.createRadialGradient(-size*0.2, -size*0.2, 0, 0, 0, size * 0.8);
  fleshGradient.addColorStop(0, '#ff6b81');
  fleshGradient.addColorStop(0.7, '#ef4444');
  fleshGradient.addColorStop(1, '#dc2626');
  ctx.fillStyle = fleshGradient;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.75, 0, Math.PI * 2);
  ctx.fill();
  
  // Seeds
  ctx.fillStyle = '#1a1a1a';
  const seedPositions = [[0, 0], [-8, -6], [8, -6], [-6, 8], [6, 8]];
  seedPositions.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.ellipse(x, y, 3, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.ellipse(-size*0.3, -size*0.3, size*0.2, size*0.12, -0.5, 0, Math.PI * 2);
  ctx.fill();
};

const drawStrawberry = (ctx, size) => {
  const gradient = ctx.createRadialGradient(-size*0.2, -size*0.3, 0, 0, 0, size * 1.1);
  gradient.addColorStop(0, '#ff6b81');
  gradient.addColorStop(0.6, '#ef4444');
  gradient.addColorStop(1, '#b91c1c');
  ctx.fillStyle = gradient;
  
  // Strawberry shape (heart-ish)
  ctx.beginPath();
  ctx.moveTo(0, size);
  ctx.bezierCurveTo(-size * 1.2, size * 0.3, -size * 0.8, -size * 0.8, 0, -size * 0.5);
  ctx.bezierCurveTo(size * 0.8, -size * 0.8, size * 1.2, size * 0.3, 0, size);
  ctx.fill();
  
  // Seeds
  ctx.fillStyle = '#fef08a';
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6 + 0.5;
    const r = size * 0.4;
    ctx.beginPath();
    ctx.ellipse(Math.cos(angle) * r, Math.sin(angle) * r * 0.8, 2, 3, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Leaves on top
  ctx.fillStyle = '#22c55e';
  for (let i = 0; i < 5; i++) {
    const angle = Math.PI + (i - 2) * 0.4;
    ctx.beginPath();
    ctx.ellipse(Math.cos(angle) * 8, -size * 0.6 + Math.sin(angle) * 4, 6, 3, angle - Math.PI/2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(-size*0.25, -size*0.15, size*0.2, size*0.1, -0.5, 0, Math.PI * 2);
  ctx.fill();
};

const drawKiwi = (ctx, size) => {
  // Brown fuzzy outside
  const outerGradient = ctx.createRadialGradient(-size*0.2, -size*0.2, 0, 0, 0, size);
  outerGradient.addColorStop(0, '#a78b71');
  outerGradient.addColorStop(0.8, '#8b7355');
  outerGradient.addColorStop(1, '#6b5344');
  ctx.fillStyle = outerGradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Green inside
  const innerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.7);
  innerGradient.addColorStop(0, '#bef264');
  innerGradient.addColorStop(0.7, '#84cc16');
  innerGradient.addColorStop(1, '#65a30d');
  ctx.fillStyle = innerGradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.75, size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // White center
  ctx.fillStyle = '#fefce8';
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.15, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Seeds radiating from center
  ctx.fillStyle = '#1a1a1a';
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12;
    const r = size * 0.4;
    ctx.beginPath();
    ctx.ellipse(Math.cos(angle) * r, Math.sin(angle) * r * 0.8, 2, 1, angle, 0, Math.PI * 2);
    ctx.fill();
  }
};

// Power-up drawing
const drawPowerUp = (ctx, fruit, size) => {
  // Glowing ring
  ctx.strokeStyle = `rgba(0, 212, 255, ${0.7 + Math.sin(fruit.time / 150) * 0.3})`;
  ctx.lineWidth = 3;
  ctx.shadowColor = '#00d4ff';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(0, 0, size + 8, 0, Math.PI * 2);
  ctx.stroke();
  
  // Inner glow
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  gradient.addColorStop(0, 'rgba(0, 212, 255, 0.8)');
  gradient.addColorStop(0.5, 'rgba(123, 104, 238, 0.5)');
  gradient.addColorStop(1, 'rgba(123, 104, 238, 0.2)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();
  
  // Icon
  ctx.shadowBlur = 0;
  ctx.font = `${size * 1.2}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(fruit.emoji, 0, 2);
};

// Bomb drawing - Sukuna bomb!
const drawBomb = (ctx, fruit, size) => {
  const bombRadius = size * 1.2;
  
  // Danger glow around bomb
  ctx.shadowColor = '#ff4444';
  ctx.shadowBlur = 25;
  ctx.fillStyle = 'rgba(255, 68, 68, 0.3)';
  ctx.beginPath();
  ctx.arc(0, 0, bombRadius + 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Draw Sukuna image clipped to a circle
  if (sukunaBombImage && sukunaBombImage.complete) {
    ctx.save();
    
    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(0, 0, bombRadius, 0, Math.PI * 2);
    ctx.clip();
    
    // Draw image to fill the circle
    const imgSize = bombRadius * 2.2;
    ctx.drawImage(
      sukunaBombImage,
      -imgSize / 2,
      -imgSize / 2 + bombRadius * 0.15,
      imgSize,
      imgSize
    );
    
    ctx.restore();
    
    // Add circular border
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, bombRadius, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Fallback - simple bomb
    const gradient = ctx.createRadialGradient(-size*0.3, -size*0.3, 0, 0, 0, bombRadius);
    gradient.addColorStop(0, '#4a4a4a');
    gradient.addColorStop(0.7, '#2a2a2a');
    gradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, bombRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw fuse at top
  const fuseStartX = bombRadius * 0.3;
  const fuseStartY = -bombRadius * 0.85;
  
  // Fuse holder (black cylinder)
  ctx.fillStyle = '#2a2a2a';
  ctx.beginPath();
  ctx.ellipse(fuseStartX, fuseStartY + 5, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(fuseStartX - 6, fuseStartY - 5, 12, 12);
  
  // Fuse rope
  ctx.strokeStyle = '#a87c4f';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(fuseStartX, fuseStartY - 5);
  ctx.quadraticCurveTo(fuseStartX + 15, fuseStartY - 20, fuseStartX + 8, fuseStartY - 35);
  ctx.stroke();
  
  // Fuse rope texture
  ctx.strokeStyle = '#8b6914';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(fuseStartX, fuseStartY - 5);
  ctx.quadraticCurveTo(fuseStartX + 15, fuseStartY - 20, fuseStartX + 8, fuseStartY - 35);
  ctx.stroke();
  
  // Animated spark at fuse end
  const sparkX = fuseStartX + 8;
  const sparkY = fuseStartY - 35;
  const sparkTime = fruit.time || 0;
  
  // Main spark glow
  ctx.shadowColor = '#ffaa00';
  ctx.shadowBlur = 20;
  
  // Spark core
  const sparkSize = 6 + Math.sin(sparkTime / 50) * 2;
  const gradient = ctx.createRadialGradient(sparkX, sparkY, 0, sparkX, sparkY, sparkSize * 2);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.3, '#ffee00');
  gradient.addColorStop(0.6, '#ff8800');
  gradient.addColorStop(1, 'rgba(255, 68, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(sparkX, sparkY, sparkSize * 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Spark particles flying off
  for (let i = 0; i < 5; i++) {
    const angle = (sparkTime / 100 + i * 1.2) % (Math.PI * 2);
    const dist = 8 + Math.sin(sparkTime / 30 + i) * 4;
    const px = sparkX + Math.cos(angle) * dist;
    const py = sparkY + Math.sin(angle) * dist - 5;
    const pSize = 2 + Math.random();
    
    ctx.fillStyle = i % 2 === 0 ? '#ffdd00' : '#ff6600';
    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.shadowBlur = 0;
};

export const isFruitOffScreen = (fruit, canvasHeight) => {
  return fruit.y > canvasHeight + fruit.size;
};

/**
 * Create enhanced explosion particles with color
 */
export const createExplosion = (x, y, emoji, color = '#ffffff', count = 8) => {
  const particles = [];
  
  // Emoji fragments
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 3 + Math.random() * 3;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      emoji,
      size: 12 + Math.random() * 10,
      life: 1,
      decay: 0.025 + Math.random() * 0.015,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.4,
      type: 'emoji',
    });
  }
  
  // Juice splatter particles
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      color: color || '#ffaa00',
      size: 4 + Math.random() * 6,
      life: 1,
      decay: 0.03 + Math.random() * 0.02,
      type: 'juice',
    });
  }
  
  // Sparkle particles
  for (let i = 0; i < 6; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 2;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      color: '#ffffff',
      size: 2 + Math.random() * 3,
      life: 1,
      decay: 0.04 + Math.random() * 0.02,
      type: 'sparkle',
    });
  }
  
  return particles;
};

/**
 * Update and draw particles with enhanced effects
 */
export const updateParticles = (particles, ctx, deltaTime) => {
  const timeScale = deltaTime / 16.67;
  
  return particles.filter(p => {
    p.x += p.vx * timeScale;
    p.y += p.vy * timeScale;
    p.vy += 0.2 * timeScale; // Gravity
    p.life -= p.decay * timeScale;
    
    if (p.rotation !== undefined) {
      p.rotation += p.rotationSpeed * timeScale;
    }
    
    if (p.life > 0) {
      ctx.save();
      ctx.globalAlpha = p.life;
      
      if (p.type === 'emoji') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `${p.size * p.life}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
      } else if (p.type === 'juice') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'sparkle') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
      return true;
    }
    return false;
  });
};
