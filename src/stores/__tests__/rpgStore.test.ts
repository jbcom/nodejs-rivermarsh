import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRPGStore } from '../rpgStore';

// Mock the audio manager
vi.mock('@/utils/audioManager', () => ({
    getAudioManager: () => ({
        playSound: vi.fn(),
    }),
}));

describe('RPGStore - Gameplay Logic', () => {
    beforeEach(() => {
        // Reset store to initial state
        useRPGStore.setState({
            player: {
                position: [0, 1, 0],
                rotation: [0, 0],
                stats: {
                    health: 100,
                    maxHealth: 100,
                    stamina: 100,
                    maxStamina: 100,
                    gold: 0,
                    otterAffinity: 50,
                    level: 1,
                    experience: 0,
                    expToNext: 100,
                    mana: 20,
                    maxMana: 20,
                    damage: 10,
                    skills: {} as any,
                    swordLevel: 0,
                    shieldLevel: 0,
                    bootsLevel: 0,
                    invulnerable: false,
                    invulnerableUntil: 0,
                },
                inventory: [],
                equipped: {},
                activeQuests: [],
                completedQuests: [],
                factionReputation: {} as any,
            },
        });
    });

    describe('Health Mechanics', () => {
        it('should decrease health when taking damage', () => {
            const { takeDamage } = useRPGStore.getState();
            takeDamage(30);
            expect(useRPGStore.getState().player.stats.health).toBe(70);
        });

        it('should respect invulnerability window', () => {
            const { takeDamage } = useRPGStore.getState();
            
            // Set invulnerable until 1 minute from now
            useRPGStore.setState({
                player: {
                    ...useRPGStore.getState().player,
                    stats: {
                        ...useRPGStore.getState().player.stats,
                        invulnerableUntil: Date.now() + 60000,
                    }
                }
            });

            takeDamage(30);
            expect(useRPGStore.getState().player.stats.health).toBe(100);
        });

        it('should handle healing', () => {
            const { takeDamage, heal } = useRPGStore.getState();
            takeDamage(50);
            heal(20);
            expect(useRPGStore.getState().player.stats.health).toBe(70);
        });

        it('should not heal beyond maxHealth', () => {
            const { heal } = useRPGStore.getState();
            heal(50);
            expect(useRPGStore.getState().player.stats.health).toBe(100);
        });
    });

    describe('Leveling System', () => {
        it('should gain experience and level up', () => {
            const { addExperience } = useRPGStore.getState();
            
            // Add enough XP to level up
            addExperience(100);
            
            const state = useRPGStore.getState().player.stats;
            expect(state.level).toBe(2);
            expect(state.health).toBe(state.maxHealth);
            expect(state.experience).toBe(0);
        });

        it('should scale XP requirements for next level', () => {
            const { addExperience } = useRPGStore.getState();
            
            // Level up to 2
            addExperience(100);
            expect(useRPGStore.getState().player.stats.level).toBe(2);
            
            // Check next level requirements
            const expToNext = useRPGStore.getState().player.stats.expToNext;
            expect(expToNext).toBeGreaterThan(100);
        });
    });

    describe('Mana and Stamina', () => {
        it('should consume mana correctly', () => {
            const { useMana } = useRPGStore.getState();
            const success = useMana(5);
            expect(success).toBe(true);
            expect(useRPGStore.getState().player.stats.mana).toBe(15);
        });

        it('should return false if not enough mana', () => {
            const { useMana } = useRPGStore.getState();
            const success = useMana(30);
            expect(success).toBe(false);
            expect(useRPGStore.getState().player.stats.mana).toBe(20);
        });

        it('should consume and restore stamina', () => {
            const { useStamina, restoreStamina } = useRPGStore.getState();
            useStamina(40);
            expect(useRPGStore.getState().player.stats.stamina).toBe(60);
            restoreStamina(20);
            expect(useRPGStore.getState().player.stats.stamina).toBe(80);
        });
    });

    describe('Gold and Items', () => {
        it('should add gold', () => {
            const { addGold } = useRPGStore.getState();
            addGold(50);
            expect(useRPGStore.getState().player.stats.gold).toBe(50);
        });

        it('should spend gold if sufficient', () => {
            const { addGold, spendGold } = useRPGStore.getState();
            addGold(100);
            const success = spendGold(60);
            expect(success).toBe(true);
            expect(useRPGStore.getState().player.stats.gold).toBe(40);
        });
    });
});
