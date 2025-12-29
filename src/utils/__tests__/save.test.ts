import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadGame, type SaveData } from '../save';

const SAVE_KEY = 'rivermarsh_save';
const SAVE_VERSION = '1.0.0';

describe('save utils', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    describe('loadGame', () => {
        it('should return null if no save exists', () => {
            expect(loadGame()).toBeNull();
        });

        it('should return data if valid save exists', () => {
            const validData: SaveData = {
                version: SAVE_VERSION,
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
            localStorage.setItem(SAVE_KEY, JSON.stringify(validData));

            const result = loadGame();
            expect(result).toEqual(validData);
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
    });
});
