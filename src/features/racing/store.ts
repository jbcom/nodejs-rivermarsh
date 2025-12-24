import { create } from 'zustand';

interface RacingState {
  isPlaying: boolean;
  score: number;
  lives: number;
  distance: number;

  startGame: () => void;
  endGame: () => void;
  addScore: (amount: number) => void;
  takeDamage: () => void;
}

export const useRacingStore = create<RacingState>((set) => ({
  isPlaying: false,
  score: 0,
  lives: 3,
  distance: 0,

  startGame: () => set({ isPlaying: true, score: 0, lives: 3, distance: 0 }),
  endGame: () => set({ isPlaying: false }),
  addScore: (amount) => set((state) => ({ score: state.score + amount })),
  takeDamage: () => set((state) => ({ lives: Math.max(0, state.lives - 1) })),
}));
