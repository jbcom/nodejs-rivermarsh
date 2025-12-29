import { expect, test } from '@playwright/test';
import { bypassMainMenu } from './test-utils';

test.setTimeout(120000); // 2 minutes

test.describe('Extended Play Stability', () => {
    test('60 second continuous play without crash', async ({ page }) => {
        await page.goto('');
        await bypassMainMenu(page);
        await page.waitForTimeout(3000);

        const startTime = Date.now();
        const duration = 60000; // 60 seconds

        // Continuous random input
        while (Date.now() - startTime < duration) {
            const actions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];
            const action = actions[Math.floor(Math.random() * actions.length)];

            await page.keyboard.press(action);
            await page.waitForTimeout(100 + Math.random() * 200);
        }

        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });
});

test.describe('Memory Stress', () => {
    test('memory should stabilize after initial load', async ({ page }) => {
        await page.goto('');
        await bypassMainMenu(page);
        await page.waitForTimeout(5000);

        const measurements: number[] = [];

        for (let i = 0; i < 6; i++) {
            const memory = await page.evaluate(() => {
                if ((performance as any).memory) {
                    return (performance as any).memory.usedJSHeapSize / (1024 * 1024);
                }
                return null;
            });

            if (memory) measurements.push(memory);

            await page.keyboard.down('ArrowUp');
            await page.waitForTimeout(2000);
            await page.keyboard.up('ArrowUp');
            await page.keyboard.press('Space');
            await page.waitForTimeout(3000);
        }

        if (measurements.length >= 3) {
            const firstHalf = measurements.slice(0, 3);
            const secondHalf = measurements.slice(3);
            const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
            expect(secondAvg).toBeLessThan(firstAvg * 1.5);
        }
    });
});
