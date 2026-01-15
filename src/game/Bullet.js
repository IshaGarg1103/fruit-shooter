import { BULLET, CANVAS_WIDTH, COLORS } from './constants';

let bulletIdCounter = 0;

export const createBullet = (x, y) => {
  return {
    id: ++bulletIdCounter,
    x: Math.max(BULLET.width / 2, Math.min(x, CANVAS_WIDTH - BULLET.width / 2)),
    y: y,
    width: BULLET.width,
    height: BULLET.height,
    speed: BULLET.speed,
    time: 0,
  };
};

export const updateBullet = (bullet, deltaTime) => {
  bullet.y -= bullet.speed * (deltaTime / 16.67);
  bullet.time += deltaTime;
  return bullet;
};

/**
 * Draw Gojo's infinity-style projectile
 */
export const drawBullet = (ctx, bullet) => {
  ctx.save();
  ctx.translate(bullet.x, bullet.y);
  
  // Outer glow
  ctx.shadowColor = COLORS.infinityBlue;
  ctx.shadowBlur = 20;
  
  // Energy trail
  const trailGradient = ctx.createLinearGradient(0, -bullet.height, 0, bullet.height * 2);
  trailGradient.addColorStop(0, 'rgba(0, 212, 255, 0.8)');
  trailGradient.addColorStop(0.5, 'rgba(123, 104, 238, 0.4)');
  trailGradient.addColorStop(1, 'rgba(123, 104, 238, 0)');
  
  ctx.fillStyle = trailGradient;
  ctx.beginPath();
  ctx.moveTo(0, -bullet.height / 2);
  ctx.lineTo(-bullet.width / 2, bullet.height);
  ctx.lineTo(bullet.width / 2, bullet.height);
  ctx.closePath();
  ctx.fill();
  
  // Core energy ball
  const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, bullet.width);
  coreGradient.addColorStop(0, '#ffffff');
  coreGradient.addColorStop(0.3, COLORS.infinityBlue);
  coreGradient.addColorStop(1, COLORS.infinityPurple);
  
  ctx.fillStyle = coreGradient;
  ctx.beginPath();
  ctx.arc(0, 0, bullet.width / 1.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner bright core
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -2, bullet.width / 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Rotating energy ring
  ctx.strokeStyle = `rgba(0, 212, 255, ${0.5 + Math.sin(bullet.time / 50) * 0.3})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, bullet.width + Math.sin(bullet.time / 100) * 3, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.restore();
};

export const isBulletOffScreen = (bullet) => {
  return bullet.y < -bullet.height;
};
