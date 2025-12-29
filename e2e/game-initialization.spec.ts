import { expect, test } from '@playwright/test';
import { bypassMainMenu } from './test-utils';

test.describe('Game Initialization', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('');
        await bypassMainMenu(page);
    });

    test('should load the game and display canvas', async ({ page }) => {
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible({ timeout: 15000 });

        const box = await canvas.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.width).toBeGreaterThan(100);
        expect(box!.height).toBeGreaterThan(100);
    });

    test('should display HUD elements', async ({ page }) => {
        await page.waitForTimeout(2000);

        // Check for vitality and energy labels or bars
        const vitalityText = page.locator('text=/vitality/i').first();
        const energyText = page.locator('text=/energy/i').first();

        // One of them should be visible
        const isVitalityVisible = await vitalityText.isVisible();
        const isEnergyVisible = await energyText.isVisible();

        expect(isVitalityVisible || isEnergyVisible).toBe(true);
    });

    test('should not show game over screen on start', async ({ page }) => {
        await page.waitForTimeout(2000);
        const gameOverText = page.locator('text=/game over/i');
        await expect(gameOverText).not.toBeVisible();
    });
});
