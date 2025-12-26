import * as fc from 'fast-check';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '../gameStore';
import * as THREE from 'three';
import { LEVELING } from '../../constants/game';

describe('GameStore Properties', () => {
    beforeEach(() => {
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
            gameOver: false,
        } as any);
    });

    it('Leveling System: XP addition should never decrease level', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 5000 }),
                (xpToAdd) => {
                    const initialLevel = useGameStore.getState().player.level;
                    useGameStore.getState().addExperience(xpToAdd);
                    const finalLevel = useGameStore.getState().player.level;
                    expect(finalLevel).toBeGreaterThanOrEqual(initialLevel);
                }
            )
        );
    });

    it('Leveling System: Multiple level ups should be handled correctly', () => {
        // Adding 1000 XP at level 1 should definitely level up multiple times
        useGameStore.getState().addExperience(1000);
        expect(useGameStore.getState().player.level).toBeGreaterThan(1);
        expect(useGameStore.getState().player.experience).toBeLessThan(useGameStore.getState().player.expToNext);
    });

    it('Gold System: Spend gold should only succeed if enough funds', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 200 }),
                fc.integer({ min: 0, max: 200 }),
                (initialGold, cost) => {
                    useGameStore.setState((s) => ({
                        player: { ...s.player, gold: initialGold }
                    }));
                    
                    const success = useGameStore.getState().spendGold(cost);
                    const finalGold = useGameStore.getState().player.gold;
                    
                    if (initialGold >= cost) {
                        expect(success).toBe(true);
                        expect(finalGold).toBe(initialGold - cost);
                    } else {
                        expect(success).toBe(false);
                        expect(finalGold).toBe(initialGold);
                    }
                }
            )
        );
    });
});
