import { FRUIT_TYPES, CANVAS_WIDTH, DIFFICULTY } from './constants';

let fruitIdCounter = 0;

/**
 * Create a new fruit object
 * @param {number} wave - Current wave number for difficulty scaling
 */
export const createFruit = (wave = 1) => {
  // Determine which fruit types are available based on wave
  let availableTypes;
  if (wave <= 5) {
    availableTypes = FRUIT_TYPES.slice(0, 1); // Apple only
  } else if (wave <= 10) {
    availableTypes = FRUIT_TYPES.slice(0, 3); // Apple, Orange, Grape
  } else if (wave <= 15) {
    availableTypes = FRUIT_TYPES.slice(0, 4); // + Banana
  } else {
    availableTypes = FRUIT_TYPES; // All fruits
  }

  const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
  const speedMultiplier = 1 + (wave - 1) * DIFFICULTY.speedMultiplierIncrease;

  return {
    id: ++fruitIdCounter,
    x: Math.random() * (CANVAS_WIDTH - type.size * 2) + type.size,
    y: -type.size,
    ...type,
    speed: type.speed * speedMultiplier,
    currentHits: 0,
    wobbleOffset: type.wobble ? Math.random() * Math.PI * 2 : 0,
    time: 0,
  };
};

/**
 * Update fruit position
 * @param {Object} fruit - Fruit object to update
 * @param {number} deltaTime - Time since last frame in ms
 */
export const updateFruit = (fruit, deltaTime) => {
  fruit.y += fruit.speed * (deltaTime / 16.67); // Normalize to 60fps
  fruit.time += deltaTime;

  // Apply wobble for bananas
  if (fruit.wobble) {
    fruit.x += Math.sin(fruit.time / 200 + fruit.wobbleOffset) * 1.5;
  }

  return fruit;
};

/**
 * Draw fruit on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} fruit - Fruit to draw
 */
export const drawFruit = (ctx, fruit) => {
  ctx.font = `${fruit.size}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Flash effect when hit
  if (fruit.currentHits > 0 && fruit.hits > 1) {
    ctx.globalAlpha = 0.6 + Math.sin(fruit.time / 50) * 0.4;
  }
  
  ctx.fillText(fruit.emoji, fruit.x, fruit.y);
  ctx.globalAlpha = 1;
};

/**
 * Check if fruit is off screen (escaped)
 * @param {Object} fruit - Fruit to check
 * @param {number} canvasHeight - Height of canvas
 */
export const isFruitOffScreen = (fruit, canvasHeight) => {
  return fruit.y > canvasHeight + fruit.size;
};
