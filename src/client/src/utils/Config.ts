/**
 * Comprehensive configuration for Otter River Rush
 */

import type { GameConfig } from '@/types/Config.types';
import { BiomeType, DifficultyLevel, PowerUpType } from '@/types/Game.types';

export const CONFIG: Readonly<GameConfig> = {
  canvas: {
    width: 800,
    height: 600,
    backgroundColor: '#0f172a',
    targetFPS: 60,
    maxDeltaTime: 100,
  },

  game: {
    lanes: 3,
    laneWidth: 150,
    scrollSpeed: 5,
    scrollSpeedIncrease: 0.01,
    scrollSpeedMax: 15,
    closeCallDistance: 50,
    comboTimeout: 2000,
    comboMultiplier: 0.1,
  },

  player: {
    startLane: 1,
    laneChangeSpeed: 10,
    width: 50,
    height: 50,
    collisionRadius: 20,
    invincibilityDuration: 1000,
    respawnDelay: 2000,
  },

  obstacles: {
    minSpawnDistance: 200,
    maxSpawnDistance: 400,
    spawnDistanceDecrease: 0.5,
    minDistance: 100,
    types: [
      {
        id: 'rock_small',
        name: 'Small Rock',
        width: 40,
        height: 40,
        speed: 1.0,
        minDifficulty: DifficultyLevel.EASY,
        spawnWeight: 10,
        color: '#64748b',
      },
      {
        id: 'rock_medium',
        name: 'Medium Rock',
        width: 60,
        height: 60,
        speed: 0.8,
        minDifficulty: DifficultyLevel.NORMAL,
        spawnWeight: 7,
        color: '#475569',
      },
      {
        id: 'rock_large',
        name: 'Large Rock',
        width: 80,
        height: 80,
        speed: 0.6,
        minDifficulty: DifficultyLevel.HARD,
        spawnWeight: 5,
        color: '#334155',
      },
      {
        id: 'rock_giant',
        name: 'Giant Rock',
        width: 100,
        height: 100,
        speed: 0.5,
        minDifficulty: DifficultyLevel.EXPERT,
        spawnWeight: 3,
        color: '#1e293b',
      },
    ],
  },

  collectibles: {
    spawnChance: 0.3,
    despawnDistance: -100,
    magnetDistance: 100,
    types: {
      coin: {
        value: 1,
        size: 20,
        color: '#fbbf24',
      },
      gem: {
        value: 5,
        size: 25,
        color: '#3b82f6',
      },
      special: {
        value: 10,
        size: 30,
        color: '#a855f7',
      },
    },
  },

  powerUps: {
    spawnChance: 0.05,
    despawnDistance: -100,
    types: {
      [PowerUpType.SHIELD]: {
        duration: 10000,
        cooldown: 30000,
        effect: 1,
        color: '#3b82f6',
        rarity: 0.3,
      },
      [PowerUpType.MAGNET]: {
        duration: 8000,
        cooldown: 25000,
        effect: 200,
        color: '#ef4444',
        rarity: 0.25,
      },
      [PowerUpType.SLOW_MOTION]: {
        duration: 5000,
        cooldown: 35000,
        effect: 0.3,
        color: '#8b5cf6',
        rarity: 0.2,
      },
      [PowerUpType.GHOST]: {
        duration: 3000,
        cooldown: 40000,
        effect: 1,
        color: '#06b6d4',
        rarity: 0.15,
      },
      [PowerUpType.MULTIPLIER]: {
        duration: 10000,
        cooldown: 30000,
        effect: 2,
        color: '#f59e0b',
        rarity: 0.1,
      },
    },
  },

  procedural: {
    patternChangeInterval: 10000,
    difficultyScaling: {
      distanceThreshold: 1000,
      speedIncrease: 0.5,
      spawnRateIncrease: 0.05,
    },
    patterns: [
      {
        name: 'wave',
        difficulty: 1,
        duration: 5000,
        minLevelRequired: 1,
      },
      {
        name: 'zigzag',
        difficulty: 2,
        duration: 6000,
        minLevelRequired: 3,
      },
      {
        name: 'gauntlet',
        difficulty: 3,
        duration: 4000,
        minLevelRequired: 5,
      },
      {
        name: 'breather',
        difficulty: 0,
        duration: 3000,
        minLevelRequired: 1,
      },
    ],
  },

  biomes: {
    transitionDistance: 1000,
    biomes: {
      [BiomeType.FOREST]: {
        name: 'Peaceful Forest',
        minDistance: 0,
        colors: {
          primary: '#10b981',
          secondary: '#059669',
          accent: '#34d399',
          background: '#064e3b',
        },
        obstacles: {
          speedModifier: 1.0,
          sizeModifier: 1.0,
          densityModifier: 1.0,
        },
      },
      [BiomeType.MOUNTAIN]: {
        name: 'Mountain Rapids',
        minDistance: 1000,
        colors: {
          primary: '#60a5fa',
          secondary: '#3b82f6',
          accent: '#93c5fd',
          background: '#1e3a8a',
        },
        obstacles: {
          speedModifier: 1.2,
          sizeModifier: 1.1,
          densityModifier: 1.2,
        },
      },
      [BiomeType.CANYON]: {
        name: 'Desert Canyon',
        minDistance: 2000,
        colors: {
          primary: '#f97316',
          secondary: '#ea580c',
          accent: '#fb923c',
          background: '#7c2d12',
        },
        obstacles: {
          speedModifier: 1.3,
          sizeModifier: 1.2,
          densityModifier: 1.3,
        },
      },
      [BiomeType.RAPIDS]: {
        name: 'Raging Rapids',
        minDistance: 3000,
        colors: {
          primary: '#06b6d4',
          secondary: '#0891b2',
          accent: '#22d3ee',
          background: '#164e63',
        },
        obstacles: {
          speedModifier: 1.5,
          sizeModifier: 1.3,
          densityModifier: 1.5,
        },
      },
    },
  },

  scoring: {
    distancePoints: 1,
    coinValue: 10,
    gemValue: 50,
    comboBonus: 5,
    closeCallBonus: 25,
    powerUpBonus: 20,
    achievementBonus: 100,
    multiplierDuration: 5000,
  },

  progression: {
    baseExperienceRequired: 100,
    experienceScaling: 1.5,
    levelCap: 99,
    rewardPerLevel: {
      coins: 50,
      gems: 5,
    },
  },

  physics: {
    gravity: 0.5,
    friction: 0.9,
    maxVelocity: 20,
    collisionDamping: 0.5,
  },

  rendering: {
    enableShadows: true,
    enableParticles: true,
    particleCount: {
      low: 50,
      medium: 100,
      high: 200,
    },
    enableBloom: false,
    enableMotionBlur: false,
    backgroundColor: '#0f172a',
    foregroundColors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'],
  },

  audio: {
    enabled: true,
    maxSimultaneousSounds: 8,
    spatialAudio: false,
    fadeInDuration: 500,
    fadeOutDuration: 1000,
    soundSprites: {
      splash_small: [0, 200],
      splash_medium: [300, 300],
      splash_large: [700, 400],
      coin_pickup: [1200, 150],
      gem_pickup: [1450, 200],
      powerup_collect: [1750, 250],
      collision: [2100, 300],
      achievement: [2500, 500],
      button_click: [3100, 100],
      level_up: [3300, 600],
    },
  },
} as const;
