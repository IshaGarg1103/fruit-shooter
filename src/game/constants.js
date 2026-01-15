// Game configuration constants

// Rectangular landscape layout
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 500;

export const INITIAL_LIVES = 3;

// Character settings (Gojo)
export const CHARACTER = {
  width: 100,
  height: 140,
  sprite: '/gojo.png',
};

// Bullet settings (Gojo's infinity-style projectile)
export const BULLET = {
  width: 12,
  height: 24,
  speed: 18,
  color: '#00d4ff',
  glowColor: '#7b68ee',
};

// Fruit types with their properties
export const FRUIT_TYPES = [
  { emoji: '🍎', name: 'apple', points: 10, speed: 3, size: 50, hits: 1, weight: 30, color: '#ff4444' },
  { emoji: '🍊', name: 'orange', points: 15, speed: 3.5, size: 48, hits: 1, weight: 25, color: '#ff9922' },
  { emoji: '🍋', name: 'lemon', points: 20, speed: 4, size: 44, hits: 1, weight: 20, color: '#ffee44' },
  { emoji: '🍇', name: 'grape', points: 25, speed: 4.5, size: 40, hits: 1, weight: 15, color: '#9944ff' },
  { emoji: '🍌', name: 'banana', points: 30, speed: 3.5, size: 52, hits: 1, weight: 15, wobble: true, color: '#ffdd22' },
  { emoji: '🍉', name: 'watermelon', points: 50, speed: 2.5, size: 60, hits: 2, weight: 10, color: '#44cc44' },
  { emoji: '🍓', name: 'strawberry', points: 35, speed: 5, size: 42, hits: 1, weight: 10, color: '#ff5566' },
  { emoji: '🥝', name: 'kiwi', points: 40, speed: 4, size: 44, hits: 1, weight: 8, color: '#88cc44' },
  { emoji: '💣', name: 'bomb', points: -50, speed: 3, size: 55, hits: 1, weight: 12, isBomb: true, color: '#ff4444' },
];

// Power-up types
export const POWERUP_TYPES = [
  { emoji: '⭐', name: 'star', effect: 'doublePoints', duration: 5000, size: 45 },
  { emoji: '💙', name: 'heart', effect: 'extraLife', duration: 0, size: 45 },
  { emoji: '⚡', name: 'lightning', effect: 'rapidFire', duration: 4000, size: 45 },
];

// Difficulty progression
export const DIFFICULTY = {
  baseSpawnRate: 1400,
  minSpawnRate: 400,
  spawnRateDecrease: 35,
  speedMultiplierIncrease: 0.07,
  waveThreshold: 8,
  powerUpChance: 0.08,
};

// Combo settings
export const COMBO = {
  timeWindow: 1500,
  multiplierCap: 5,
};

// Colors (Gojo-inspired blue/purple/black theme)
export const COLORS = {
  // Main theme colors
  background: '#0a0a1a',
  backgroundAlt: '#121228',
  
  // Gojo signature colors
  infinityBlue: '#00d4ff',
  infinityPurple: '#7b68ee',
  darkPurple: '#2a1a4a',
  
  // UI colors
  primary: '#00d4ff',
  accent: '#ff4466',
  secondary: '#7b68ee',
  white: '#ffffff',
  
  // Overlays
  darkOverlay: 'rgba(10, 10, 26, 0.95)',
  glowBlue: 'rgba(0, 212, 255, 0.5)',
  glowPurple: 'rgba(123, 104, 238, 0.5)',
  
  // Combo
  combo: '#ffaa00',
};
