// Game configuration constants

export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 640;

export const INITIAL_LIVES = 3;

// Cannon settings
export const CANNON = {
  width: 48,
  height: 32,
  color: '#4a9c2d',
  barrelColor: '#2d5a1d',
};

// Bullet settings
export const BULLET = {
  width: 8,
  height: 16,
  speed: 14,
  color: '#ffcc00',
};

// Fruit types with their properties
export const FRUIT_TYPES = [
  { emoji: '🍎', name: 'apple', points: 10, speed: 2.5, size: 40, hits: 1, weight: 30 },
  { emoji: '🍊', name: 'orange', points: 15, speed: 2.8, size: 38, hits: 1, weight: 25 },
  { emoji: '🍋', name: 'lemon', points: 20, speed: 3.2, size: 34, hits: 1, weight: 20 },
  { emoji: '🍇', name: 'grape', points: 25, speed: 3.8, size: 30, hits: 1, weight: 15 },
  { emoji: '🍌', name: 'banana', points: 30, speed: 3.0, size: 42, hits: 1, weight: 15, wobble: true },
  { emoji: '🍉', name: 'watermelon', points: 50, speed: 2.0, size: 52, hits: 2, weight: 10 },
  { emoji: '🍓', name: 'strawberry', points: 35, speed: 4.0, size: 32, hits: 1, weight: 10 },
  { emoji: '🥝', name: 'kiwi', points: 40, speed: 3.5, size: 34, hits: 1, weight: 8 },
  { emoji: '💣', name: 'bomb', points: -50, speed: 2.5, size: 38, hits: 1, weight: 5, isBomb: true },
];

// Power-up types
export const POWERUP_TYPES = [
  { emoji: '⭐', name: 'star', effect: 'doublePoints', duration: 5000, size: 36 },
  { emoji: '💖', name: 'heart', effect: 'extraLife', duration: 0, size: 36 },
  { emoji: '⚡', name: 'lightning', effect: 'rapidFire', duration: 4000, size: 36 },
];

// Difficulty progression - more aggressive
export const DIFFICULTY = {
  baseSpawnRate: 1500,      // ms between spawns at start (faster)
  minSpawnRate: 400,        // fastest spawn rate
  spawnRateDecrease: 40,    // ms decrease per wave
  speedMultiplierIncrease: 0.08, // speed increase per wave
  waveThreshold: 8,         // fruits destroyed to advance wave
  powerUpChance: 0.08,      // 8% chance to spawn power-up
};

// Combo settings
export const COMBO = {
  timeWindow: 1500,         // ms to maintain combo
  multiplierCap: 5,         // max combo multiplier
};

// Colors (retro palette)
export const COLORS = {
  background: '#0f0f1a',
  primary: '#eeff00',
  accent: '#ff004d',
  secondary: '#00e5ff',
  white: '#ffffff',
  darkOverlay: 'rgba(0, 0, 0, 0.9)',
  combo: '#ff9900',
};
