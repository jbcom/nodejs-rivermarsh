import { describe, expect, it, beforeEach } from 'vitest';
import { useGameStore } from '../gameStore';
import { LEVELING, PLAYER } from '../../constants/game';

describe('GameStore Leveling', () => {
    beforeEach(() => {
        useGameStore.getState().respawn();
        // Manually reset stats to level 1 for consistency
        useGameStore.setState((state) => ({
            player: {
                ...state.player,
                level: 1,
                experience: 0,
                expToNext: LEVELING.BASE_XP_REQUIRED,
                health: PLAYER.INITIAL_HEALTH,
                maxHealth: PLAYER.INITIAL_HEALTH,
                damage: PLAYER.BASE_DAMAGE,
            }
        }));
    });

    it('should initialize with correct leveling stats', () => {
        const { player } = useGameStore.getState();
        expect(player.level).toBe(1);
        expect(player.experience).toBe(0);
        expect(player.expToNext).toBe(LEVELING.BASE_XP_REQUIRED);
    });

    it('should gain experience', () => {
        const { addExperience } = useGameStore.getState();
        addExperience(50);
        const { player } = useGameStore.getState();
        expect(player.experience).toBe(50);
        expect(player.level).toBe(1);
    });

    it('should level up when reaching experience threshold', () => {
        const { addExperience } = useGameStore.getState();
        const initialMaxHealth = useGameStore.getState().player.maxHealth;
        
        // Gain enough XP to level up
        addExperience(LEVELING.BASE_XP_REQUIRED);
        
        const { player } = useGameStore.getState();
        expect(player.level).toBe(2);
        expect(player.experience).toBe(0);
        expect(player.expToNext).toBe(Math.floor(LEVELING.BASE_XP_REQUIRED * LEVELING.XP_MULTIPLIER));
        expect(player.maxHealth).toBe(initialMaxHealth + PLAYER.HEALTH_PER_LEVEL);
        expect(player.health).toBe(player.maxHealth); // Healed on level up
        expect(player.damage).toBe(PLAYER.BASE_DAMAGE + PLAYER.DAMAGE_PER_LEVEL);
    });

    it('should handle multiple level ups at once', () => {
        const { addExperience } = useGameStore.getState();
        
        // Gain massive XP
        addExperience(1000);
        
        const { player } = useGameStore.getState();
        expect(player.level).toBeGreaterThan(2);
        expect(player.maxHealth).toBe(PLAYER.INITIAL_HEALTH + (player.level - 1) * PLAYER.HEALTH_PER_LEVEL);
    });

    it('should respect the max level cap', () => {
        const { addExperience } = useGameStore.getState();
        
        // Set player to near max level
        useGameStore.setState((state) => ({
            player: {
                ...state.player,
                level: LEVELING.MAX_LEVEL,
                experience: 0,
                expToNext: 1000,
            }
        }));
        
        addExperience(2000);
        
        const { player } = useGameStore.getState();
        expect(player.level).toBe(LEVELING.MAX_LEVEL);
        // Verify excess XP is handled properly (capped at expToNext - 1)
        expect(player.experience).toBe(player.expToNext - 1);
    });
});
