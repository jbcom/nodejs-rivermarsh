/**
 * Configuration type definitions
 */

import type { BiomeType, DifficultyLevel, PowerUpType } from './Game.types';

export interface GameConfig {
  canvas: CanvasConfig;
  game: GameplayConfig;
  player: PlayerConfig;
  obstacles: ObstacleConfig;
  collectibles: CollectibleConfig;
  powerUps: PowerUpConfig;
  procedural: ProceduralConfig;
  biomes: BiomeConfig;
  scoring: ScoringConfig;
  progression: ProgressionConfig;
  physics: PhysicsConfig;
  rendering: RenderingConfig;
  audio: AudioConfig;
}

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  targetFPS: number;
  maxDeltaTime: number;
}

export interface GameplayConfig {
  lanes: number;
  laneWidth: number;
  scrollSpeed: number;
  scrollSpeedIncrease: number;
  scrollSpeedMax: number;
  closeCallDistance: number;
  comboTimeout: number;
  comboMultiplier: number;
}

export interface PlayerConfig {
  startLane: number;
  laneChangeSpeed: number;
  width: number;
  height: number;
  collisionRadius: number;
  invincibilityDuration: number;
  respawnDelay: number;
}

export interface ObstacleConfig {
  minSpawnDistance: number;
  maxSpawnDistance: number;
  spawnDistanceDecrease: number;
  minDistance: number;
  types: ObstacleTypeConfig[];
}

export interface ObstacleTypeConfig {
  id: string;
  name: string;
  width: number;
  height: number;
  speed: number;
  minDifficulty: DifficultyLevel;
  spawnWeight: number;
  color: string;
}

export interface CollectibleConfig {
  spawnChance: number;
  despawnDistance: number;
  magnetDistance: number;
  types: {
    coin: {
      value: number;
      size: number;
      color: string;
    };
    gem: {
      value: number;
      size: number;
      color: string;
    };
    special: {
      value: number;
      size: number;
      color: string;
    };
  };
}

export interface PowerUpConfig {
  spawnChance: number;
  despawnDistance: number;
  types: Record<PowerUpType, PowerUpTypeConfig>;
}

export interface PowerUpTypeConfig {
  duration: number;
  cooldown: number;
  effect: number;
  color: string;
  rarity: number;
}

export interface ProceduralConfig {
  patternChangeInterval: number;
  difficultyScaling: {
    distanceThreshold: number;
    speedIncrease: number;
    spawnRateIncrease: number;
  };
  patterns: PatternConfig[];
}

export interface PatternConfig {
  name: string;
  difficulty: number;
  duration: number;
  minLevelRequired: number;
}

export interface BiomeConfig {
  transitionDistance: number;
  biomes: Record<BiomeType, BiomeTypeConfig>;
}

export interface BiomeTypeConfig {
  name: string;
  minDistance: number;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  obstacles: {
    speedModifier: number;
    sizeModifier: number;
    densityModifier: number;
  };
  music?: string;
  ambience?: string;
}

export interface ScoringConfig {
  distancePoints: number;
  coinValue: number;
  gemValue: number;
  comboBonus: number;
  closeCallBonus: number;
  powerUpBonus: number;
  achievementBonus: number;
  multiplierDuration: number;
}

export interface ProgressionConfig {
  baseExperienceRequired: number;
  experienceScaling: number;
  levelCap: number;
  rewardPerLevel: {
    coins: number;
    gems: number;
  };
}

export interface PhysicsConfig {
  gravity: number;
  friction: number;
  maxVelocity: number;
  collisionDamping: number;
}

export interface RenderingConfig {
  enableShadows: boolean;
  enableParticles: boolean;
  particleCount: {
    low: number;
    medium: number;
    high: number;
  };
  enableBloom: boolean;
  enableMotionBlur: boolean;
  backgroundColor: string;
  foregroundColors: string[];
}

export interface AudioConfig {
  enabled: boolean;
  maxSimultaneousSounds: number;
  spatialAudio: boolean;
  fadeInDuration: number;
  fadeOutDuration: number;
  soundSprites: {
    [key: string]: [number, number];
  };
}
