export const GAME_CONFIG = {
  // Canvas dimensions
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,

  // Lanes
  LANES: [-2, 0, 2],
  LANE_WIDTH: 2,

  // Scroll speed
  BASE_SCROLL_SPEED: 5,
  MIN_SCROLL_SPEED: 3,
  MAX_SCROLL_SPEED: 12,

  // Difficulty
  DIFFICULTY_INCREASE_INTERVAL: 30000, // 30 seconds
  DIFFICULTY_INCREASE_RATE: 0.05,
  DISTANCE_PER_DIFFICULTY: 100, // meters

  // Player
  PLAYER_HEALTH: 3,
  PLAYER_INVULNERABILITY_TIME: 1000, // 1 second after hit
  TUTORIAL_DURATION: 30000, // 30 seconds invincible

  // Scoring
  COIN_VALUE: 10,
  GEM_VALUE: 50,
  DISTANCE_POINTS_PER_METER: 1,
  COMBO_BONUS_MULTIPLIER: 0.1,
  COMBO_TIMEOUT: 2000, // 2 seconds

  // Spawning
  OBSTACLE_SPAWN_INTERVAL: 2000, // milliseconds
  COLLECTIBLE_SPAWN_INTERVAL: 3000,
  POWER_UP_SPAWN_INTERVAL: 15000,

  // Power-ups
  POWER_UP_DURATION: 5000,
  SHIELD_DURATION: 5000,
  GHOST_DURATION: 5000,
  MAGNET_DURATION: 8000,
  MAGNET_RADIUS: 3,
  MULTIPLIER_DURATION: 10000,
  MULTIPLIER_VALUE: 2,
  SLOW_MOTION_DURATION: 5000,
  SLOW_MOTION_FACTOR: 0.5,

  // Particles
  PARTICLE_LIFETIME: 1000,
  PARTICLE_COUNT_COLLECT: 12,
  PARTICLE_COUNT_COLLISION: 8,
  PARTICLE_SPEED: 200,
  PARTICLE_SIZE: 4,

  // Biomes
  BIOME_DISTANCE: 500, // meters per biome
  BIOME_TRANSITION_TIME: 3000, // milliseconds

  // Animation
  ANIMATION_TRANSITION_TIME: 300, // milliseconds
  HIT_ANIMATION_DURATION: 500,
  JUMP_ANIMATION_DURATION: 400,
  COLLECT_ANIMATION_DURATION: 300,
  DODGE_ANIMATION_DURATION: 300,

  // Physics
  GRAVITY: 9.8,
  FRICTION: 0.98,
  AIR_RESISTANCE: 0.99,

  // Camera
  CAMERA_FOLLOW_SPEED: 0.1,
  CAMERA_SHAKE_DECAY: 0.9,
  CAMERA_SHAKE_INTENSITY_HIT: 0.3,
  CAMERA_SHAKE_INTENSITY_COLLECT: 0.1,

  // Visual
  FOG_NEAR: 5,
  FOG_FAR: 20,
  AMBIENT_LIGHT_INTENSITY: 0.9,
  DIRECTIONAL_LIGHT_INTENSITY: 0.6,

  // Performance
  MAX_PARTICLES: 100,
  MAX_OBSTACLES: 20,
  MAX_COLLECTIBLES: 15,
  ENTITY_CLEANUP_DISTANCE: -10,

  // Mobile
  SWIPE_THRESHOLD: 50, // pixels
  TOUCH_SENSITIVITY: 1.0,

  // Audio
  SFX_VOLUME: 0.5,
  MUSIC_VOLUME: 0.3,

  // Accessibility
  REDUCED_MOTION_SCALE: 0.5,
  HIGH_CONTRAST_ENABLED: false,
  COLORBLIND_MODE: 'none' as
    | 'none'
    | 'protanopia'
    | 'deuteranopia'
    | 'tritanopia',
} as const;

export const COLORS = {
  // Biome colors
  FOREST_WATER: '#1e40af',
  MOUNTAIN_WATER: '#0c4a6e',
  CANYON_WATER: '#78350f',
  CRYSTAL_WATER: '#701a75',

  FOREST_FOG: '#0f172a',
  MOUNTAIN_FOG: '#1e3a8a',
  CANYON_FOG: '#451a03',
  CRYSTAL_FOG: '#3b0764',

  // Entity colors
  COIN_COLOR: '#ffd700',
  GEM_BLUE: '#3b82f6',
  GEM_RED: '#ef4444',

  // Particles
  PARTICLE_COLLECT: '#ffd700',
  PARTICLE_HIT: '#ff6b6b',
  PARTICLE_POWER_UP: '#fbbf24',

  // UI
  SCORE_COLOR: '#ffffff',
  COMBO_COLOR: '#fbbf24',
  HEALTH_COLOR: '#ef4444',
  DISTANCE_COLOR: '#3b82f6',
} as const;

// Re-export ASSET_URLS from utils/assets.ts with proper base path handling
export { ASSET_URLS } from '../utils/assets';

export const DIFFICULTY_PRESETS = {
  EASY: {
    scrollSpeedMultiplier: 0.7,
    spawnRateMultiplier: 0.8,
    healthBonus: 1,
  },
  NORMAL: {
    scrollSpeedMultiplier: 1.0,
    spawnRateMultiplier: 1.0,
    healthBonus: 0,
  },
  HARD: {
    scrollSpeedMultiplier: 1.3,
    spawnRateMultiplier: 1.2,
    healthBonus: -1,
  },
} as const;

export const GAME_MODES = {
  CLASSIC: 'classic',
  TIME_TRIAL: 'time_trial',
  ZEN: 'zen',
  DAILY_CHALLENGE: 'daily_challenge',
} as const;
