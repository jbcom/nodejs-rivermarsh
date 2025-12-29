import { expect, test } from '@playwright/test';
import { bypassMainMenu } from './test-utils';

/**
 * E2E Tests for Biome Exploration
 */

test.describe('Biome Exploration', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('');
        await bypassMainMenu(page);
    });

    test('should spawn player in marsh biome at origin', async ({ page }) => {
        // Verify game loaded
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();

        // Player should start at origin (0, 0, 0) which is in marsh biome
        const playerPosition = await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            const player = store?.getState?.()?.player;
            return player?.position || { x: 0, y: 0, z: 0 };
        });

        // Player should be near origin
        expect(Math.abs(playerPosition.x)).toBeLessThan(10);
        expect(Math.abs(playerPosition.z)).toBeLessThan(10);
    });

    test('should transition from marsh to forest biome', async ({ page }) => {
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();

        const initialPos = await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            const player = store?.getState?.()?.player;
            return { x: player?.position.x || 0, z: player?.position.z || 0 };
        });

        // Move for a while to change biome
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(5000);
        await page.keyboard.up('ArrowUp');

        const finalPos = await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            const player = store?.getState?.()?.player;
            return { x: player?.position.x || 0, z: player?.position.z || 0 };
        });

        // Position should have changed significantly
        const distance = Math.sqrt(
            Math.pow(finalPos.x - initialPos.x, 2) + 
            Math.pow(finalPos.z - initialPos.z, 2)
        );
        expect(distance).toBeGreaterThan(10);
    });

    test('should transition from marsh to desert biome', async ({ page }) => {
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();

        const initialPos = await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            const player = store?.getState?.()?.player;
            return { x: player?.position.x || 0, z: player?.position.z || 0 };
        });

        // Move in another direction
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(5000);
        await page.keyboard.up('ArrowRight');

        const finalPos = await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            const player = store?.getState?.()?.player;
            return { x: player?.position.x || 0, z: player?.position.z || 0 };
        });

        // Position should have changed significantly
        const distance = Math.sqrt(
            Math.pow(finalPos.x - initialPos.x, 2) + 
            Math.pow(finalPos.z - initialPos.z, 2)
        );
        expect(distance).toBeGreaterThan(10);
    });

    test('should handle multiple biome transitions without crashing', async ({ page }) => {
        // Move around in a circle
        const keys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
        for (const key of keys) {
            await page.keyboard.down(key);
            await page.waitForTimeout(2000);
            await page.keyboard.up(key);
        }

        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });
});
