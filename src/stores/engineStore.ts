import * as THREE from 'three';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type GameMode = 'main_menu' | 'exploration' | 'racing' | 'boss_battle' | 'examples';

export interface InputState {
    direction: { x: number; y: number };
    active: boolean;
    jump: boolean;
}

export interface EngineState {
    // Basic World State
    loaded: boolean;
    gameMode: GameMode;
    gameTime: number;
    isPaused: boolean;
    gameOver: boolean;

    // Player Physics State
    player: {
        position: THREE.Vector3;
        rotation: number;
        speed: number;
        maxSpeed: number;
        verticalSpeed: number;
        isMoving: boolean;
        isJumping: boolean;
        speedMultiplier: number;
    };

    // Performance & Meta
    score: number;
    distance: number;
    input: InputState;
    settings: {
        soundEnabled: boolean;
        musicEnabled: boolean;
        hapticsEnabled: boolean;
        volume: number;
        showHelp: boolean;
    };

    // System Actions
    setLoaded: (loaded: boolean) => void;
    setGameMode: (mode: GameMode) => void;
    updateTime: (delta: number) => void;
    setPaused: (isPaused: boolean) => void;
    togglePause: () => void;
    setGameOver: (gameOver: boolean) => void;
    
    // Physics Actions
    updatePlayerPhysics: (updates: Partial<EngineState['player']>) => void;
    setInput: (x: number, y: number, active: boolean, jump: boolean) => void;
    addScore: (amount: number) => void;
    setDistance: (distance: number) => void;
    updateSettings: (settings: Partial<EngineState['settings']>) => void;
    resetEngine: () => void;
}

export const useEngineStore = create<EngineState>()(
    subscribeWithSelector((set) => ({
        // --- Initial State ---
        loaded: false,
        gameMode: 'main_menu',
        gameTime: 0,
        isPaused: false,
        gameOver: false,

        player: {
            position: new THREE.Vector3(0, 1, 0),
            rotation: 0,
            speed: 0,
            maxSpeed: 0.15,
            verticalSpeed: 0,
            isMoving: false,
            isJumping: false,
            speedMultiplier: 1.0,
        },

        score: 0,
        distance: 0,
        input: { direction: { x: 0, y: 0 }, active: false, jump: false },
        settings: {
            soundEnabled: true,
            musicEnabled: true,
            hapticsEnabled: true,
            volume: 0.8,
            showHelp: true,
        },

        // --- Actions ---
        setLoaded: (loaded) => set({ loaded }),
        setGameMode: (mode) => set({ gameMode: mode }),
        updateTime: (delta) => set((state) => ({ gameTime: state.gameTime + delta })),
        setPaused: (isPaused) => set({ isPaused }),
        togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
        setGameOver: (gameOver) => set({ gameOver }),

        updatePlayerPhysics: (updates) =>
            set((state) => ({
                player: { ...state.player, ...updates },
            })),

        setInput: (x, y, active, jump) =>
            set({ input: { direction: { x, y }, active, jump } }),

        addScore: (amount) => set((state) => ({ score: state.score + amount })),
        setDistance: (distance) => set({ distance }),
        updateSettings: (settings) =>
            set((state) => ({ settings: { ...state.settings, ...settings } })),
        
        resetEngine: () => set({
            gameTime: 0,
            isPaused: false,
            gameOver: false,
            score: 0,
            distance: 0,
            player: {
                position: new THREE.Vector3(0, 1, 0),
                rotation: 0,
                speed: 0,
                maxSpeed: 0.15,
                verticalSpeed: 0,
                isMoving: false,
                isJumping: false,
                speedMultiplier: 1.0,
            },
        }),
    }))
);
