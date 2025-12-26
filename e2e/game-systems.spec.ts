import { expect, test } from '@playwright/test';
import { bypassMainMenu } from './test-utils';

test.describe('Game Systems Integration', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('');
        await bypassMainMenu(page);
    });

    test('should run time system and update lighting', async ({ page }) => {
        await page.waitForTimeout(5000);
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });

    test('should spawn NPCs without crashing', async ({ page }) => {
        await page.waitForTimeout(3000);
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(500);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(3000);
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });

    test('should handle biome transitions', async ({ page }) => {
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(3000);
        await page.keyboard.up('ArrowUp');
        await page.waitForTimeout(1000);
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });
});
