import { BULLET, CANVAS_WIDTH } from './constants';

let bulletIdCounter = 0;

/**
 * Create a new bullet object
 * @param {number} x - X position to spawn bullet
 * @param {number} canvasHeight - Height of canvas (bullet spawns at bottom)
 */
export const createBullet = (x, canvasHeight) => {
  return {
    id: ++bulletIdCounter,
    x: Math.max(BULLET.width / 2, Math.min(x, CANVAS_WIDTH - BULLET.width / 2)),
    y: canvasHeight - 50, // Start above cannon
    width: BULLET.width,
    height: BULLET.height,
    speed: BULLET.speed,
  };
};

/**
 * Update bullet position
 * @param {Object} bullet - Bullet to update
 * @param {number} deltaTime - Time since last frame in ms
 */
export const updateBullet = (bullet, deltaTime) => {
  bullet.y -= bullet.speed * (deltaTime / 16.67); // Move up, normalize to 60fps
  return bullet;
};

/**
 * Draw bullet on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} bullet - Bullet to draw
 */
export const drawBullet = (ctx, bullet) => {
  // Main bullet body
  ctx.fillStyle = BULLET.color;
  ctx.beginPath();
  ctx.roundRect(
    bullet.x - bullet.width / 2,
    bullet.y - bullet.height / 2,
    bullet.width,
    bullet.height,
    4
  );
  ctx.fill();

  // Glow effect
  ctx.shadowColor = BULLET.color;
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;
};

/**
 * Check if bullet is off screen
 * @param {Object} bullet - Bullet to check
 */
export const isBulletOffScreen = (bullet) => {
  return bullet.y < -bullet.height;
};
