import * as THREE from 'three';
import { create } from 'zustand';
import { loadGame as loadGameUtil, saveGame as saveGameUtil } from '../utils/save';
import { PLAYER, LEVELING } from '../constants/game';
import { getAudioManager } from '../utils/audioManager';

export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'legendary';

/**
 * Calculate the XP required for the next level using iterative flooring
 * to ensure consistency with the leveling loop.
 */
const calculateExpToNext = (level: number): number => {
    let required: number = LEVELING.BASE_XP_REQUIRED;
    for (let i = 1; i < level; i++) {
        required = Math.floor(required * LEVELING.XP_MULTIPLIER);
    }
    return required;
};

interface InputState {
    direction: { x: number; y: number };
    active: boolean;
    jump: boolean;
}

interface PlayerState {
    position: THREE.Vector3;
    rotation: number;
    speed: number;
    maxSpeed: number;
    verticalSpeed: number;
    isMoving: boolean;
    isJumping: boolean;
    fallStartY?: number;
    health: number;
    maxHealth: number;
    stamina: number;
    maxStamina: number;
    level: number;
    experience: number;
    expToNext: number;
    damage: number;
    speedMultiplier: number;
    invulnerable: boolean;
    invulnerableUntil: number;
}

interface RockData {
    position: THREE.Vector3;
    scale: THREE.Vector3;
    rotation: THREE.Euler;
    radius: number; // Simplified collision radius
}

interface NearbyResource {
    name: string;
    icon: string;
    type: string;
}

interface GameState {
    loaded: boolean;
    time: number;
    difficulty: DifficultyLevel;
    input: InputState;
    player: PlayerState;
    rocks: RockData[];
    gameOver: boolean;
    nearbyResource: NearbyResource | null;
    score: number;
    distance: number;

    // Actions
    setLoaded: (loaded: boolean) => void;
    updateTime: (delta: number) => void;
    setDifficulty: (difficulty: DifficultyLevel) => void;
    setInput: (x: number, y: number, active: boolean, jump: boolean) => void;
    updatePlayer: (updates: Partial<PlayerState>) => void;
    setRocks: (rocks: RockData[]) => void;
    damagePlayer: (amount: number) => void;
    healPlayer: (amount: number) => void;
    restoreStamina: (amount: number) => void;
    consumeStamina: (amount: number) => void;
    addExperience: (amount: number) => void;
    setGameOver: (gameOver: boolean) => void;
    setNearbyResource: (resource: NearbyResource | null) => void;
    addScore: (amount: number) => void;
    setDistance: (distance: number) => void;
    respawn: () => void;
    saveGame: () => void;
    loadGame: () => void;
}

export const useEngineStore = create<GameState>((set) => ({
    loaded: false,
    time: 0,
    difficulty: 'normal',
    input: { direction: { x: 0, y: 0 }, active: false, jump: false },
    player: {
        position: new THREE.Vector3(0, 0, 0),
        rotation: 0,
        speed: 0,
        maxSpeed: 0.15,
        verticalSpeed: 0,
        isMoving: false,
        isJumping: false,
        health: PLAYER.INITIAL_HEALTH,
        maxHealth: PLAYER.INITIAL_HEALTH,
        stamina: PLAYER.INITIAL_STAMINA,
        maxStamina: PLAYER.INITIAL_STAMINA,
        level: 1,
        experience: 0,
        expToNext: LEVELING.BASE_XP_REQUIRED,
        damage: PLAYER.BASE_DAMAGE,
        speedMultiplier: 1.0,
        invulnerable: false,
        invulnerableUntil: 0,
    },
    rocks: [],
    gameOver: false,
    nearbyResource: null,
    score: 0,
    distance: 0,

    setLoaded: (loaded) => set({ loaded }),
    updateTime: (delta) => set((state) => ({ time: state.time + delta })),
    setDifficulty: (difficulty) => set({ difficulty }),
    setInput: (x, y, active, jump) => set({ input: { direction: { x, y }, active, jump } }),
    updatePlayer: (updates) => set((state) => ({
        player: { ...state.player, ...updates },
    })),
    setRocks: (rocks) => set({ rocks }),
    damagePlayer: (amount) => set((state) => {
        if (state.player.invulnerable || Date.now() < state.player.invulnerableUntil) {
            return state;
        }
        const newHealth = Math.max(0, state.player.health - amount);
        const gameOver = newHealth <= 0;
        
        // Play damage sound (optional, may not be available in tests)
        const audioManager = getAudioManager();
        if (audioManager) {
            audioManager.playSound('damage', 0.5);
        }
        
        return {
            player: {
                ...state.player,
                health: newHealth,
                invulnerableUntil: Date.now() + 1000, // 1 second invulnerability
            },
            gameOver,
        };
    }),
    healPlayer: (amount) => set((state) => ({
        player: {
            ...state.player,
            health: Math.min(state.player.maxHealth, state.player.health + amount),
        },
    })),
    restoreStamina: (amount) => set((state) => ({
        player: {
            ...state.player,
            stamina: Math.min(state.player.maxStamina, state.player.stamina + amount),
        },
    })),
    consumeStamina: (amount) => set((state) => ({
        player: {
            ...state.player,
            stamina: Math.max(0, state.player.stamina - amount),
        },
    })),
    addExperience: (amount) => set((state) => {
        let exp = state.player.experience + amount;
        let level = state.player.level;
        let expToNext = state.player.expToNext;
        let maxHealth = state.player.maxHealth;
        let damage = state.player.damage;
        let health = state.player.health;
        let leveledUp = false;

        // Level up loop with soft cap
        while (exp >= expToNext && level < LEVELING.MAX_LEVEL) {
            exp -= expToNext;
            level += 1;
            expToNext = Math.floor(expToNext * LEVELING.XP_MULTIPLIER);
            maxHealth = PLAYER.INITIAL_HEALTH + (level - 1) * PLAYER.HEALTH_PER_LEVEL;
            damage = PLAYER.BASE_DAMAGE + (level - 1) * PLAYER.DAMAGE_PER_LEVEL;
            leveledUp = true;
        }

        // If at max level, cap experience at expToNext - 1 to keep the bar full 
        // but not level up again.
        if (level >= LEVELING.MAX_LEVEL && exp >= expToNext) {
            exp = expToNext - 1;
        }

        if (leveledUp) {
            // Heal on level up
            health = maxHealth;
            
            // Play level up sound
            const audioManager = getAudioManager();
            if (audioManager) {
                audioManager.playSound('level-up' as any, 0.7);
            }
        }

        return {
            player: {
                ...state.player,
                experience: exp,
                level,
                expToNext,
                maxHealth,
                health,
                damage,
            },
        };
    }),
    setGameOver: (gameOver) => set({ gameOver }),
    setNearbyResource: (resource) => set({ nearbyResource: resource }),
    addScore: (amount) => set((state) => ({ score: state.score + amount })),
    setDistance: (distance) => set({ distance }),
    respawn: () => set((state) => ({
        player: {
            ...state.player,
            position: new THREE.Vector3(0, 0, 0),
            health: state.player.maxHealth,
            stamina: state.player.maxStamina,
            verticalSpeed: 0,
            isJumping: false,
        },
        gameOver: false,
        score: 0,
        distance: 0,
    })),
    saveGame: () => {
        const state = useGameStore.getState();
        saveGameUtil({
            position: state.player.position,
            health: state.player.health,
            stamina: state.player.stamina,
            level: state.player.level,
            experience: state.player.experience,
        });
    },
    loadGame: () => {
        const saveData = loadGameUtil();
        if (!saveData) return;

        set((state) => ({
            player: {
                ...state.player,
                position: new THREE.Vector3(...saveData.player.position),
                health: saveData.player.health,
                stamina: saveData.player.stamina,
                level: saveData.player.level || 1,
                experience: saveData.player.experience || 0,
                maxHealth: PLAYER.INITIAL_HEALTH + ((saveData.player.level || 1) - 1) * PLAYER.HEALTH_PER_LEVEL,
                damage: PLAYER.BASE_DAMAGE + ((saveData.player.level || 1) - 1) * PLAYER.DAMAGE_PER_LEVEL,
                expToNext: calculateExpToNext(saveData.player.level || 1),
            },
        }));
    },
}));
