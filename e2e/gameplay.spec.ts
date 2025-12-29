import { expect, test } from '@playwright/test';
import { bypassMainMenu } from './test-utils';

test.describe('Gameplay Features', () => {
    test('should allow player to explore the world', async ({ page }) => {
        await page.goto('');
        await bypassMainMenu(page);
        await page.waitForTimeout(2000);

        // Simulate exploration by moving in different directions
        const movements = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

        for (const direction of movements) {
            await page.keyboard.down(direction);
            await page.waitForTimeout(1000);
            await page.keyboard.up(direction);
            await page.waitForTimeout(200);
        }

        // Game should remain stable after exploration
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });

    test('should handle jumping', async ({ page }) => {
        await page.goto('');
        await bypassMainMenu(page);
        await page.waitForTimeout(2000);

        // Jump multiple times
        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('Space');
            await page.waitForTimeout(300);
        }

        // Game should handle jumping without issues
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });
});
