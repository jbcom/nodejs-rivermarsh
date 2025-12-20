/**
 * Global type declarations for window extensions
 */

import type { Entity } from '../ecs/world';
import type { useGameStore } from '../hooks/useGameStore';

/** Stats used for achievement checking */
export interface AchievementStats {
  coins: number;
  gems: number;
  distance: number;
  score: number;
  combo: number;
  health?: number;
  powerUpsUsed?: {
    shield?: boolean;
    ghost?: boolean;
    magnet?: boolean;
  };
}

/** Quest progress tracking */
export interface QuestProgress {
  coinsCollected: number;
  gemsCollected: number;
  distanceTraveled: number;
  maxCombo: number;
  perfectRuns: number;
  nearMisses: number;
}

/** Quest system API */
export interface QuestsAPI {
  getActive: () => Quest[] | undefined;
  getProgress?: () => QuestProgress;
  recordNearMiss?: () => void;
  recordPerfectRun?: () => void;
  complete?: (id: string) => void;
  reset?: () => void;
}

/** Quest definition */
export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'collect' | 'distance' | 'combo' | 'survival' | 'perfect';
  target: number;
  progress: number;
  completed: boolean;
  reward: {
    coins: number;
    gems: number;
    unlocks?: string[];
  };
}

/** Debug tools exposed to window */
export interface DebugTools {
  logAllEntities: () => void;
  logEntityCounts: () => void;
  logPlayer: () => void;
  clearAllEntities: () => void;
  spawnTestEntities: () => void;
  freezeGame: () => void;
  teleportPlayer: (x: number, y: number) => void;
  godMode: (enable?: boolean) => void;
  setHealth: (health: number) => void;
  triggerAnimation: (animationName: string) => void;
  getPerformanceStats: () => {
    totalEntities: number;
    obstacles: number;
    collectibles: number;
    particles: number;
    movingEntities: number;
    renderableEntities: number;
  };
  exportGameState: () => {
    entities: Array<{
      position: Entity['position'];
      velocity: Entity['velocity'];
      health: Entity['health'];
      type: string;
    }>;
    queries: {
      player: number;
      obstacles: number;
      collectibles: number;
    };
  };
}

/** Camera shake function */
export type CameraShakeFn = (intensity: number) => void;

/** Exported entity state from debug tools */
export interface ExportedEntity {
  position: { x: number; y: number; z: number };
  velocity?: { x: number; y: number; z: number };
  health?: number;
  type: string;
}

/** Leaderboard entry */
export interface LeaderboardEntryGlobal {
  rank: number;
  playerName: string;
  score: number;
  distance: number;
  date: string;
  mode: string;
}

/** Leaderboard API */
export interface LeaderboardAPI {
  get: (type?: 'daily' | 'weekly' | 'allTime') => LeaderboardEntryGlobal[];
  getPlayerRank: (
    playerScore: number,
    type?: 'daily' | 'weekly' | 'allTime'
  ) => number;
  clear: (type?: 'daily' | 'weekly' | 'allTime') => void;
}

declare global {
  interface Window {
    /** Game store for state management */
    __gameStore?: typeof useGameStore;
    /** Debug tools for development - using unique name to avoid conflict with 'debug' npm package */
    __debug?: DebugTools;
    /** Quest system API */
    quests?: QuestsAPI;
    /** Camera shake function */
    __cameraShake?: CameraShakeFn;
    /** Leaderboard API */
    leaderboard?: LeaderboardAPI;
  }
}

export {};
