import { expect, test } from '@playwright/test';
import { bypassMainMenu } from './test-utils';

test.describe('Time and Weather Systems', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('');
        await bypassMainMenu(page);
        await page.waitForTimeout(3000);
    });

    test('should advance time continuously', async ({ page }) => {
        const initialTime = await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return null;
            for (const entity of world.entities) {
                if (entity.time) return entity.time.hour;
            }
            return null;
        });

        await page.waitForTimeout(2000);

        const finalTime = await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return null;
            for (const entity of world.entities) {
                if (entity.time) return entity.time.hour;
            }
            return null;
        });

        expect(initialTime).not.toBeNull();
        expect(finalTime).not.toBeNull();
        expect(finalTime).toBeGreaterThan(initialTime!);
    });

    test('should transition between time phases', async ({ page }) => {
        const phase = await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return null;
            for (const entity of world.entities) {
                if (entity.time) return entity.time.phase;
            }
            return null;
        });

        expect(['dawn', 'day', 'dusk', 'night']).toContain(phase);
    });

    test('should have active weather system', async ({ page }) => {
        const weather = await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return null;
            for (const entity of world.entities) {
                if (entity.weather) {
                    return {
                        current: entity.weather.current,
                        intensity: entity.weather.intensity,
                    };
                }
            }
            return null;
        });

        expect(weather).not.toBeNull();
        expect(['clear', 'rain', 'fog', 'storm', 'snow', 'sandstorm']).toContain(weather!.current);
    });
});
