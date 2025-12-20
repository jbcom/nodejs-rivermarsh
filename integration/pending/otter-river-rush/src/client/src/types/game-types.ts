import type { Entity } from '../ecs/world';

export type GameMode = 'classic' | 'time_trial' | 'zen' | 'daily_challenge';
export type GameStatus = 'menu' | 'playing' | 'paused' | 'game_over';
export type Difficulty = 'easy' | 'normal' | 'hard';

export interface GameState {
  status: GameStatus;
  mode: GameMode;
  score: number;
  distance: number;
  coins: number;
  gems: number;
  combo: number;
  lives: number;
  highScore: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
}

export interface PowerUpState {
  shield: boolean;
  speedBoost: number;
  multiplier: number;
  magnet: number;
  ghost: number;
  slowMotion: number;
}

export interface CollisionEvent {
  entityA: Entity;
  entityB: Entity;
  point: { x: number; y: number; z: number };
  normal: { x: number; y: number; z: number };
  penetration: number;
}

export interface ScoreEvent {
  points: number;
  multiplier: number;
  combo: number;
  reason: 'distance' | 'coin' | 'gem' | 'combo' | 'achievement';
}

export interface AchievementEvent {
  id: string;
  name: string;
  description: string;
  timestamp: number;
}

export interface BiomeData {
  name: string;
  waterColor: string;
  fogColor: string;
  ambient: number;
  musicTrack?: string;
}

export interface LevelPattern {
  obstacles: Array<{ lane: number; type: number; distance: number }>;
  collectibles: Array<{ lane: number; type: 'coin' | 'gem'; distance: number }>;
  powerUps?: Array<{ lane: number; type: string; distance: number }>;
  difficulty: number;
}

export interface GameStats {
  totalGames: number;
  totalDistance: number;
  totalCoins: number;
  totalGems: number;
  bestScore: number;
  longestRun: number;
  achievementsUnlocked: number;
  powerUpsCollected: number;
  obstaclesAvoided: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  distance: number;
  mode: GameMode;
  timestamp: number;
  rank?: number;
}

export interface SaveData {
  highScore: number;
  totalGamesPlayed: number;
  achievements: string[];
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
  };
  stats?: GameStats;
  leaderboard?: LeaderboardEntry[];
}

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  pause: boolean;
  lastInputTime: number;
}

export interface CameraState {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  shake: { intensity: number; decay: number };
  zoom: number;
}

export interface ParticleEffect {
  type: 'collect' | 'hit' | 'powerup' | 'splash' | 'trail';
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  color: string;
  size: number;
  lifetime: number;
  gravity?: number;
}

export interface AudioEvent {
  sound: 'collect' | 'hit' | 'powerup' | 'jump' | 'menu' | 'achievement';
  volume?: number;
  pitch?: number;
}

export interface VisualEffect {
  type: 'bloom' | 'glow' | 'trail' | 'ripple' | 'explosion';
  position: { x: number; y: number; z: number };
  duration: number;
  intensity: number;
}
