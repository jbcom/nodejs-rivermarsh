import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadGame, type SaveData, SAVE_VERSION } from '../save';

const SAVE_KEY = 'rivermarsh_save';

describe('save utils', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    describe('loadGame', () => {
        it('should return null if no save exists', () => {
            expect(loadGame()).toBeNull();
        });

        it('should return data if valid 1.1.0 save exists', () => {
            const validData: SaveData = {
                version: SAVE_VERSION,
                timestamp: Date.now(),
                player: {
                    position: [1, 2, 3],
                    health: 100,
                    stamina: 100,
                    level: 1,
                    experience: 0,
                    mana: 20,
                    gold: 50,
                    activeQuests: [],
                    completedQuests: [],
                    achievements: [],
                },
                world: {
                    time: 8,
                    weather: 'clear',
                },
                resources: [],
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(validData));

            const result = loadGame();
            expect(result).toEqual(validData);
        });

        it('should handle backward compatibility for 1.0.0 saves', () => {
            const oldData = {
                version: '1.0.0',
                timestamp: Date.now(),
                player: {
                    position: [1, 2, 3],
                    health: 100,
                    stamina: 100,
                    level: 1,
                    experience: 0,
                },
                world: {
                    time: 8,
                    weather: 'clear',
                },
                resources: [],
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(oldData));

            const result = loadGame();
            expect(result).not.toBeNull();
            expect(result?.player.mana).toBe(20);
            expect(result?.player.gold).toBe(0);
            expect(result?.player.activeQuests).toEqual([]);
            expect(result?.player.completedQuests).toEqual([]);
            expect(result?.player.achievements).toEqual([]);
        });

        it('should return null for malformed data', () => {
            const malformedData = {
                version: SAVE_VERSION,
                // Missing player, world, resources
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(malformedData));

            const result = loadGame();
            expect(result).toBeNull();
        });

        it('should return null for invalid types', () => {
            const invalidData = {
                version: SAVE_VERSION,
                timestamp: Date.now(),
                player: {
                    position: [1, 2, 3],
                    health: '100', // Should be number
                },
                world: {
                    time: 8,
                    weather: 'clear',
                },
                resources: [],
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(invalidData));

            const result = loadGame();
            expect(result).toBeNull();
        });

        it('should return null for negative health/mana/gold', () => {
            const invalidData = {
                version: SAVE_VERSION,
                timestamp: Date.now(),
                player: {
                    position: [1, 2, 3],
                    health: -10,
                    mana: 20,
                    gold: 50,
                },
                world: {
                    time: 8,
                    weather: 'clear',
                },
                resources: [],
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(invalidData));

            const result = loadGame();
            expect(result).toBeNull();
        });

        it('should return null for unsupported versions', () => {
            const futureData = {
                version: '2.0.0',
                timestamp: Date.now(),
                player: {
                    position: [1, 2, 3],
                },
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(futureData));

            const result = loadGame();
            expect(result).toBeNull();
        });
    });
});
