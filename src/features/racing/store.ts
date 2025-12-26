import { create } from 'zustand';

export type RacingStatus = 'menu' | 'playing' | 'paused' | 'game_over';

interface PowerUpState {
    shield: boolean;
    speedBoost: number;
    multiplier: number;
}

interface RacingState {
    status: RacingStatus;
    score: number;
    coins: number;
    gems: number;
    lives: number;
    distance: number;
    combo: number;
    highScore: number;
    powerUps: PowerUpState;

    startGame: () => void;
    pauseGame: () => void;
    resumeGame: () => void;
    endGame: () => void;
    addScore: (amount: number) => void;
    collectCoin: (value: number) => void;
    collectGem: (value: number) => void;
    takeDamage: () => void;
    incrementCombo: () => void;
    resetCombo: () => void;
    updateDistance: (delta: number) => void;
}

const initialPowerUps: PowerUpState = {
    shield: false,
    speedBoost: 0,
    multiplier: 1,
};

export const useRacingStore = create<RacingState>((set) => ({
    status: 'menu',
    score: 0,
    coins: 0,
    gems: 0,
    lives: 3,
    distance: 0,
    combo: 0,
    highScore: 0,
    powerUps: { ...initialPowerUps },

    startGame: () =>
        set({
            status: 'playing',
            score: 0,
            coins: 0,
            gems: 0,
            lives: 3,
            distance: 0,
            combo: 0,
            powerUps: { ...initialPowerUps },
        }),

    pauseGame: () => set({ status: 'paused' }),
    resumeGame: () => set({ status: 'playing' }),

    endGame: () =>
        set((state) => ({
            status: 'game_over',
            highScore: Math.max(state.score, state.highScore),
        })),

    addScore: (amount) => set((state) => ({ score: state.score + amount })),

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

    takeDamage: () =>
        set((state) => {
            const newLives = Math.max(0, state.lives - 1);
            if (newLives === 0) {
                return { lives: 0, status: 'game_over' };
            }
            return { lives: newLives };
        }),

    incrementCombo: () => set((state) => ({ combo: state.combo + 1 })),
    resetCombo: () => set({ combo: 0 }),

    updateDistance: (delta) => set((state) => ({ distance: state.distance + delta })),
}));
