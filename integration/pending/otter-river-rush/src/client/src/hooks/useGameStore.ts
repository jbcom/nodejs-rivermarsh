import { create } from 'zustand';
import { resetWorld } from '../ecs/world';

/**
 * Game State Store using Zustand
 * Central state management for React components
 */

export type GameMode = 'classic' | 'time_trial' | 'zen' | 'daily_challenge';
export type GameStatus = 'menu' | 'playing' | 'paused' | 'game_over';

interface PowerUpState {
  shield: boolean;
  speedBoost: number;
  multiplier: number;
  magnet: number;
  ghost: number;
  slowMotion: number;
}

interface GameState {
  // Game status
  status: GameStatus;
  mode: GameMode;

  // Player stats
  score: number;
  distance: number;
  coins: number;
  gems: number;
  combo: number;
  lives: number;

  // Power-ups
  powerUps: PowerUpState;

  // Settings
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;

  // High scores
  highScore: number;

  // Actions
  startGame: (mode: GameMode) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  returnToMenu: () => void;

  updateScore: (points: number) => void;
  updateDistance: (meters: number) => void;
  collectCoin: (value: number) => void;
  collectGem: (value: number) => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  loseLife: () => void;

  activatePowerUp: (type: keyof PowerUpState, duration?: number) => void;
  deactivatePowerUp: (type: keyof PowerUpState) => void;

  updateSettings: (
    settings: Partial<
      Pick<GameState, 'soundEnabled' | 'musicEnabled' | 'volume'>
    >
  ) => void;

  reset: () => void;
}

const initialPowerUps: PowerUpState = {
  shield: false,
  speedBoost: 0,
  multiplier: 1,
  magnet: 0,
  ghost: 0,
  slowMotion: 0,
};

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  status: 'menu',
  mode: 'classic',
  score: 0,
  distance: 0,
  coins: 0,
  gems: 0,
  combo: 0,
  lives: 3,
  powerUps: { ...initialPowerUps },
  soundEnabled: true,
  musicEnabled: true,
  volume: 0.7,
  highScore: 0,

  // Actions
  startGame: (mode) => {
    // Reset the ECS world to clear all entities
    resetWorld();

    set(() => ({
      status: 'playing',
      mode,
      score: 0,
      distance: 0,
      coins: 0,
      gems: 0,
      combo: 0,
      lives: 3,
      powerUps: { ...initialPowerUps },
    }));
  },

  pauseGame: () => set({ status: 'paused' }),
  resumeGame: () => set({ status: 'playing' }),

  endGame: () =>
    set((state) => {
      const newHighScore = Math.max(state.score, state.highScore);
      return {
        status: 'game_over',
        highScore: newHighScore,
        lives: 0,
      };
    }),

  returnToMenu: () => {
    // Reset the ECS world to clear all entities
    resetWorld();

    set({
      status: 'menu',
      score: 0,
      distance: 0,
      coins: 0,
      gems: 0,
      combo: 0,
      lives: 3,
      powerUps: { ...initialPowerUps },
    });
  },

  updateScore: (points) =>
    set((state) => ({
      score: state.score + points,
    })),

  updateDistance: (meters) =>
    set((state) => ({
      distance: state.distance + meters,
    })),

  collectCoin: (value) =>
    set((state) => ({
      coins: state.coins + value,
      score: state.score + value * 10,
    })),

  collectGem: (value) =>
    set((state) => ({
      gems: state.gems + value,
      score: state.score + value * 50,
    })),

  incrementCombo: () =>
    set((state) => ({
      combo: state.combo + 1,
    })),

  resetCombo: () => set({ combo: 0 }),

  loseLife: () => {
    const state = get();
    const newLives = state.lives - 1;
    if (newLives <= 0) {
      get().endGame();
    } else {
      set({ lives: newLives });
    }
  },

  activatePowerUp: (type, duration) =>
    set((state) => {
      const now = Date.now();
      const endTime = duration ? now + duration : now + 5000;

      if (type === 'shield') {
        return {
          powerUps: { ...state.powerUps, shield: true },
        };
      }

      if (type === 'multiplier') {
        return {
          powerUps: { ...state.powerUps, multiplier: 2 },
        };
      }

      return {
        powerUps: { ...state.powerUps, [type]: endTime },
      };
    }),

  deactivatePowerUp: (type) =>
    set((state) => {
      if (type === 'shield') {
        return {
          powerUps: { ...state.powerUps, shield: false },
        };
      }

      if (type === 'multiplier') {
        return {
          powerUps: { ...state.powerUps, multiplier: 1 },
        };
      }

      return {
        powerUps: { ...state.powerUps, [type]: 0 },
      };
    }),

  updateSettings: (settings) => set(() => ({ ...settings })),

  reset: () =>
    set({
      status: 'menu',
      mode: 'classic',
      score: 0,
      distance: 0,
      coins: 0,
      gems: 0,
      combo: 0,
      lives: 3,
      powerUps: { ...initialPowerUps },
    }),
}));
