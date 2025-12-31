import { beforeEach, describe, expect, it } from 'vitest';
import { useRPGStore } from '../rpgStore';

describe('RPGStore', () => {
    beforeEach(() => {
        useRPGStore.getState().resetRPG();
    });

    it('should initialize with default state', () => {
        const state = useRPGStore.getState();
        expect(state.player.health).toBeGreaterThan(0);
        expect(state.player.level).toBe(1);
    });

    it('should handle damage correctly', () => {
        const initialHealth = useRPGStore.getState().player.health;
        useRPGStore.getState().damagePlayer(10);
        expect(useRPGStore.getState().player.health).toBe(initialHealth - 10);
    });

    it('should handle healing correctly', () => {
        useRPGStore.setState((s) => ({ player: { ...s.player, health: 50 } }));
        useRPGStore.getState().healPlayer(20);
        expect(useRPGStore.getState().player.health).toBe(70);
    });

    it('should gain experience and level up', () => {
        const initialLevel = useRPGStore.getState().player.level;
        useRPGStore.getState().addExperience(1000); // Should be enough to level up
        expect(useRPGStore.getState().player.level).toBeGreaterThan(initialLevel);
    });
});
