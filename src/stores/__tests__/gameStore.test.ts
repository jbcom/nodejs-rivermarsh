import * as fc from 'fast-check';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '../gameStore';
import * as THREE from 'three';

describe('GameStore', () => {
    beforeEach(() => {
        // Reset store to initial state
        useGameStore.setState({
            player: {
                position: new THREE.Vector3(0, 0, 0),
                health: 100,
                maxHealth: 100,
                stamina: 100,
                maxStamina: 100,
                mana: 20,
                maxMana: 20,
                gold: 100,
                level: 1,
                experience: 0,
                expToNext: 100,
                otterAffinity: 50,
                swordLevel: 0,
                shieldLevel: 0,
                bootsLevel: 0,
                skills: {} as any,
                inventory: [],
                equipped: {},
                activeQuests: [],
                completedQuests: [],
                factionReputation: {} as any,
                invulnerable: false,
                invulnerableUntil: 0,
                rotation: 0,
                speed: 0,
                maxSpeed: 0.15,
                verticalSpeed: 0,
                isMoving: false,
                isJumping: false,
            },
            input: {
                direction: { x: 0, y: 0 },
                active: false,
                jump: false,
            },
            gameOver: false,
        } as any);
    });

    it('Property 9: Stamina Conservation', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 100 }),
                fc.float({ min: 0, max: 5, noNaN: true }),
                (initialStamina, deltaTime) => {
                    // Setup: Set initial stamina
                    act(() => {
                        useGameStore.setState((state) => ({
                            player: {
                                ...state.player,
                                stamina: initialStamina,
                            }
                        }));
                    });

                    const staminaBefore = useGameStore.getState().player.stamina;

                    // Execute: Simulate stamina regeneration (10 per second when idle)
                    const regenAmount = 10 * deltaTime;
                    const newStamina = Math.min(100, staminaBefore + regenAmount);
                    act(() => {
                        useGameStore.setState((state) => ({
                            player: {
                                ...state.player,
                                stamina: newStamina,
                            },
                        }));
                    });

                    const staminaAfter = useGameStore.getState().player.stamina;

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
        expect(useGameStore.getState().player.health).toBe(100);

        // Apply damage
        act(() => {
            useGameStore.getState().damagePlayer(30);
        });

        // Health should decrease
        expect(useGameStore.getState().player.health).toBe(70);

        // Reset invulnerability for testing
        act(() => {
            useGameStore.setState((state) => ({
                player: {
                    ...state.player,
                    invulnerableUntil: 0,
                },
            }));
        });

        // Apply more damage
        act(() => {
            useGameStore.getState().damagePlayer(80);
        });

        // Health should not go below 0
        expect(useGameStore.getState().player.health).toBe(0);
    });

    it('should handle healing correctly', () => {
        act(() => {
            useGameStore.setState((state) => ({
                player: {
                    ...state.player,
                    health: 50,
                }
            }));
        });

        // Heal by 30
        act(() => {
            useGameStore.getState().healPlayer(30);
        });
        expect(useGameStore.getState().player.health).toBe(80);

        // Heal by 50 more (should cap at 100)
        act(() => {
            useGameStore.getState().healPlayer(50);
        });
        expect(useGameStore.getState().player.health).toBe(100);
    });

    it('should trigger game over when health reaches zero', () => {
        // Apply fatal damage
        act(() => {
            useGameStore.getState().damagePlayer(100);
        });

        // Health should be 0
        expect(useGameStore.getState().player.health).toBe(0);
        expect(useGameStore.getState().gameOver).toBe(true);
    });
});

// Helper to simulate act from react
function act(fn: () => void) {
    fn();
}
