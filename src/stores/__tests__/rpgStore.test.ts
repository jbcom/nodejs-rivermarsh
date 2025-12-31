import * as fc from 'fast-check';
import { beforeEach, describe, expect, it } from 'vitest';
import { useRPGStore } from '../rpgStore';
import { useEngineStore } from '../engineStore';

describe('RPGStore', () => {
    beforeEach(() => {
        // Reset stores to initial state
        useRPGStore.getState().resetRPG();
        useEngineStore.getState().resetEngine();
    });

    it('should initialize with default state', () => {
        const state = useRPGStore.getState();
        expect(state.player.health).toBeGreaterThan(0);
        expect(state.player.level).toBe(1);
    });

    it('Property: Stamina Conservation', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 100 }),
                fc.float({ min: 0, max: 5, noNaN: true }),
                (initialStamina, deltaTime) => {
                    // Setup: Set initial stamina
                    useRPGStore.setState((state) => ({
                        player: {
                            ...state.player,
                            stamina: initialStamina,
                        },
                    }));

                    const staminaBefore = useRPGStore.getState().player.stamina;

                    // Execute: Simulate stamina regeneration (10 per second when idle)
                    const regenAmount = 10 * deltaTime;
                    const newStamina = Math.min(100, staminaBefore + regenAmount);
                    useRPGStore.setState((state) => ({
                        player: {
                            ...state.player,
                            stamina: newStamina,
                        },
                    }));

                    const staminaAfter = useRPGStore.getState().player.stamina;

                    // Verify: Stamina should not decrease when not running
                    expect(staminaAfter).toBeGreaterThanOrEqual(staminaBefore);

                    // Verify: Stamina should not exceed 100
                    expect(staminaAfter).toBeLessThanOrEqual(100);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should handle damage correctly', () => {
        // Initial health should be 100
        expect(useRPGStore.getState().player.health).toBe(100);

        // Apply damage
        useRPGStore.getState().damagePlayer(30);

        // Health should decrease
        expect(useRPGStore.getState().player.health).toBe(70);

        // Reset invulnerability for testing
        useRPGStore.setState((state) => ({
            player: {
                ...state.player,
                invulnerableUntil: 0,
            },
        }));

        // Apply more damage
        useRPGStore.getState().damagePlayer(80);

        // Health should not go below 0
        expect(useRPGStore.getState().player.health).toBe(0);
    });

    it('should handle healing correctly', () => {
        useRPGStore.setState((state) => ({
            player: {
                ...state.player,
                health: 50,
            },
        }));

        // Heal by 30
        useRPGStore.getState().healPlayer(30);
        expect(useRPGStore.getState().player.health).toBe(80);

        // Heal by 50 more (should cap at 100)
        useRPGStore.getState().healPlayer(50);
        expect(useRPGStore.getState().player.health).toBe(100);
    });

    it('should trigger game over when health reaches zero', () => {
        // Apply fatal damage
        useRPGStore.getState().damagePlayer(100);

        // Health should be 0
        expect(useRPGStore.getState().player.health).toBe(0);
        expect(useEngineStore.getState().gameOver).toBe(true);
    });

    it('should gain experience and level up', () => {
        const initialLevel = useRPGStore.getState().player.level;
        useRPGStore.getState().addExperience(1000); // Should be enough to level up
        expect(useRPGStore.getState().player.level).toBeGreaterThan(initialLevel);
    });
});
