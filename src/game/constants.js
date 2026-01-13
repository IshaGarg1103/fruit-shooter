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
  speed: 12,
  color: '#ffcc00',
};

// Fruit types with their properties
export const FRUIT_TYPES = [
  { emoji: '🍎', name: 'apple', points: 10, speed: 2, size: 36, hits: 1 },
  { emoji: '🍊', name: 'orange', points: 20, speed: 2.5, size: 36, hits: 1 },
  { emoji: '🍇', name: 'grape', points: 30, speed: 3.5, size: 28, hits: 1 },
  { emoji: '🍌', name: 'banana', points: 25, speed: 2.5, size: 36, hits: 1, wobble: true },
  { emoji: '🍉', name: 'watermelon', points: 50, speed: 1.5, size: 48, hits: 2 },
];

// Difficulty progression
export const DIFFICULTY = {
  baseSpawnRate: 2000,      // ms between spawns at start
  minSpawnRate: 600,        // fastest spawn rate
  spawnRateDecrease: 50,    // ms decrease per wave
  speedMultiplierIncrease: 0.05, // speed increase per wave
  waveThreshold: 5,         // fruits per wave
};

// Colors (retro palette)
export const COLORS = {
  background: '#1a1a2e',
  primary: '#eeff00',
  accent: '#ff004d',
  secondary: '#00e5ff',
  white: '#ffffff',
  darkOverlay: 'rgba(0, 0, 0, 0.85)',
};
