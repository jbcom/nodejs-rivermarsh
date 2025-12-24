import * as fc from 'fast-check';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TimePhase } from '../../components';
import { world } from '../../world';
import { TimeSystem } from '../TimeSystem';
import { LIGHTING, TIME } from '@/constants/game';

// Helper to create a time entity with proper typing
function createTimeEntity(hour: number, phase: TimePhase, timeScale: number = 1) {
    return world.add({
        time: {
            hour,
            phase,
            timeScale,
            sunAngle: 0,
            sunIntensity: 1,
            ambientLight: 1,
            fogDensity: 0.025
        }
    });
}

describe('TimeSystem - Property-Based Tests', () => {
    beforeEach(() => {
        // Clear all entities before each test
        world.clear();
    });

    afterEach(() => {
        // Ensure cleanup after each test
        world.clear();
    });

    describe('Property 1: Time Progression Monotonicity', () => {
        it('should always advance time forward with positive delta', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: Math.fround(0), max: Math.fround(24), noNaN: true }), // Initial hour
                    fc.float({ min: Math.fround(0.001), max: Math.fround(10), noNaN: true }), // Delta (positive)
                    fc.float({ min: Math.fround(0.1), max: Math.fround(10), noNaN: true }), // Time scale
                    (initialHour, delta, timeScale) => {
                        // Setup
                        const entity = createTimeEntity(initialHour, 'day', timeScale);
                        const hourBefore = entity.time!.hour;

                        // Execute
                        TimeSystem(delta);

                        const hourAfter = entity.time!.hour;

                        // Calculate expected advancement
                        const expectedAdvancement = (delta * timeScale) / 3600;
                        const expectedHour = (hourBefore + expectedAdvancement) % 24;

                        // Verify: Time should advance forward (modulo 24)
                        const tolerance = Math.max(0.001, expectedHour * 1e-6);
                        expect(Math.abs(hourAfter - expectedHour)).toBeLessThan(tolerance);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should wrap around correctly at 24 hours', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: Math.fround(23), max: Math.fround(23.99), noNaN: true }), // Hour near midnight
                    fc.float({ min: Math.fround(0.1), max: Math.fround(2), noNaN: true }), // Delta that will cause wrap
                    (initialHour, delta) => {
                        // Setup
                        const entity = createTimeEntity(initialHour, 'night');

                        // Execute
                        TimeSystem(delta);

                        const hourAfter = entity.time!.hour;

                        // Verify: Hour should always be in [0, 24)
                        expect(hourAfter).toBeGreaterThanOrEqual(0);
                        expect(hourAfter).toBeLessThan(24);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should never go backwards with positive delta', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: Math.fround(0), max: Math.fround(23.99), noNaN: true }),
                    fc.float({ min: Math.fround(0.001), max: Math.fround(5), noNaN: true }),
                    (initialHour, delta) => {
                        // Setup
                        const entity = createTimeEntity(initialHour, 'day');
                        const hourBefore = entity.time!.hour;

                        // Execute
                        TimeSystem(delta);

                        const hourAfter = entity.time!.hour;

                        // Calculate advancement
                        const advancement = (delta * 1) / 3600;

                        // Verify: If advancement is small enough to not wrap, hour should be greater
                        if (hourBefore + advancement < 24) {
                            expect(hourAfter).toBeGreaterThanOrEqual(hourBefore);
                        } else {
                            // Wrapped around
                            expect(hourAfter).toBeLessThan(hourBefore);
                            expect(hourAfter).toBeGreaterThanOrEqual(0);
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe('Property 2: Phase Transition Consistency', () => {
        it('should always assign correct phase for any hour', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: Math.fround(0), max: Math.fround(23.99), noNaN: true }),
                    (hour) => {
                        // Setup
                        const entity = createTimeEntity(hour, 'day');

                        // Execute
                        TimeSystem(0.001); // Tiny delta to trigger phase update

                        const phase = entity.time!.phase;
                        const h = entity.time!.hour % 24;

                        // Verify: Phase matches hour
                        if (h >= TIME.DAWN_START && h < TIME.DAWN_END) {
                            expect(phase).toBe('dawn');
                        } else if (h >= TIME.DAWN_END && h < TIME.DAY_END) {
                            expect(phase).toBe('day');
                        } else if (h >= TIME.DAY_END && h < TIME.DUSK_END) {
                            expect(phase).toBe('dusk');
                        } else {
                            expect(phase).toBe('night');
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should maintain phase boundaries across time progression', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom(
                        Math.fround(4.9),
                        Math.fround(6.9),
                        Math.fround(17.9),
                        Math.fround(19.9)
                    ), // Just before phase transitions
                    fc.float({ min: Math.fround(0.01), max: Math.fround(0.2), noNaN: true }), // Small delta
                    (initialHour, delta) => {
                        // Setup
                        const entity = createTimeEntity(initialHour, 'day');

                        // Execute
                        TimeSystem(delta);

                        const phase = entity.time!.phase;
                        const h = entity.time!.hour % 24;

                        // Verify: Phase is always valid for the hour
                        const isValidPhase =
                            (h >= TIME.DAWN_START && h < TIME.DAWN_END && phase === 'dawn') ||
                            (h >= TIME.DAWN_END && h < TIME.DAY_END && phase === 'day') ||
                            (h >= TIME.DAY_END && h < TIME.DUSK_END && phase === 'dusk') ||
                            ((h >= TIME.DUSK_END || h < TIME.DAWN_START) && phase === 'night');

                        expect(isValidPhase).toBe(true);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should update lighting properties based on time', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: Math.fround(0), max: Math.fround(23.99), noNaN: true }),
                    fc.float({ min: Math.fround(0.001), max: Math.fround(1), noNaN: true }),
                    (initialHour, delta) => {
                        // Setup
                        const entity = createTimeEntity(initialHour, 'day');

                        // Execute
                        TimeSystem(delta);

                        const { sunIntensity, ambientLight, fogDensity } = entity.time!;

                        // Verify: Lighting properties are within expected ranges defined in constants
                        expect(sunIntensity).toBeGreaterThanOrEqual(Math.min(...Object.values(LIGHTING.SUN_INTENSITY)));
                        expect(sunIntensity).toBeLessThanOrEqual(Math.max(...Object.values(LIGHTING.SUN_INTENSITY)));
                        
                        expect(ambientLight).toBeGreaterThanOrEqual(Math.min(...Object.values(LIGHTING.AMBIENT_INTENSITY)));
                        expect(ambientLight).toBeLessThanOrEqual(Math.max(...Object.values(LIGHTING.AMBIENT_INTENSITY)));
                        
                        expect(fogDensity).toBeGreaterThanOrEqual(Math.min(...Object.values(LIGHTING.FOG_DENSITY)));
                        expect(fogDensity).toBeLessThanOrEqual(Math.max(...Object.values(LIGHTING.FOG_DENSITY)));
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
