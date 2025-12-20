/**
 * Core game type definitions
 */

export interface Vector2D {
  x: number;
  y: number;
}

export interface Transform {
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  scale: Vector2D;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Collider {
  type: 'circle' | 'rectangle';
  radius?: number;
  width?: number;
  height?: number;
  offset: Vector2D;
}

export enum GameState {
  LOADING = 'LOADING',
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  LEADERBOARD = 'LEADERBOARD',
  SETTINGS = 'SETTINGS',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
}

export enum GameMode {
  CLASSIC = 'CLASSIC',
  TIME_TRIAL = 'TIME_TRIAL',
  ZEN = 'ZEN',
  CHALLENGE = 'CHALLENGE',
}

export enum DifficultyLevel {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
}

export enum BiomeType {
  FOREST = 'FOREST',
  MOUNTAIN = 'MOUNTAIN',
  CANYON = 'CANYON',
  RAPIDS = 'RAPIDS',
}

export enum PowerUpType {
  SHIELD = 'SHIELD',
  MAGNET = 'MAGNET',
  SLOW_MOTION = 'SLOW_MOTION',
  GHOST = 'GHOST',
  MULTIPLIER = 'MULTIPLIER',
}

export enum CollectibleType {
  COIN = 'COIN',
  GEM = 'GEM',
  SPECIAL = 'SPECIAL',
}

export interface GameStats {
  distance: number;
  score: number;
  coins: number;
  gems: number;
  multiplier: number;
  combo: number;
  powerUpsCollected: number;
  obstaclesAvoided: number;
  rocksAvoided?: number; // Alias for obstaclesAvoided
  closeCallsCount: number;
  gamesPlayed: number;
  sessionTime?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  distance: number;
  date: number;
  mode: GameMode;
}

export interface PlayerProfile {
  name: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  totalCoins: number;
  totalGems: number;
  gamesPlayed: number;
  bestScore: number;
  bestDistance: number;
  totalPlayTime: number;
  unlockedSkins: string[];
  currentSkin: string;
  achievements: Achievement[];
  settings: GameSettings;
}

export interface GameSettings {
  volume: {
    master: number;
    music: number;
    sfx: number;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    colorblindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
    gameSpeed: number;
  };
  controls: {
    touchEnabled: boolean;
    mouseEnabled: boolean;
    keyboardEnabled: boolean;
  };
  graphics: {
    particleQuality: 'low' | 'medium' | 'high';
    showFPS: boolean;
    maxDevicePixelRatio: number;
  };
  gameplay: {
    hapticFeedback: boolean;
    showTutorial: boolean;
    autoSave: boolean;
  };
}

export interface DailyChallenge {
  id: string;
  date: string;
  name: string;
  description: string;
  mode: GameMode;
  difficulty: DifficultyLevel;
  requirements: {
    type: 'score' | 'distance' | 'coins' | 'combo' | 'time';
    value: number;
  }[];
  rewards: {
    coins: number;
    gems: number;
    experience: number;
  };
  completed: boolean;
  bestScore: number;
}

export interface UnlockableSkin {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  unlockRequirement: {
    type: 'level' | 'achievement' | 'coins' | 'gems';
    value: string | number;
  };
  isUnlocked: boolean;
  cost?: {
    coins?: number;
    gems?: number;
  };
}
