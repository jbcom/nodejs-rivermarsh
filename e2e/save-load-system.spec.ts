import { expect, test } from '@playwright/test';
import { bypassMainMenu } from './test-utils';

/**
 * E2E Tests for Save/Load System
 */

const SAVE_KEY = 'rivermarsh-game-state';

test.describe('Save/Load System', () => {
    test.beforeEach(async ({ page }) => {
        // Clear localStorage before each test
        await page.goto('');
        await page.evaluate(() => {
            localStorage.clear();
        });
        await bypassMainMenu(page);
    });

    test('should save game state to localStorage', async ({ page }) => {
        await page.waitForTimeout(3000);

        // Move player
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(2000);
        await page.keyboard.up('ArrowUp');

        await page.waitForTimeout(500);

        // Zustand persist saves automatically on state change
        // Check localStorage
        const saveData = await page.evaluate((key) => {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        }, SAVE_KEY);

        expect(saveData).not.toBeNull();
        expect(saveData.state).toBeDefined();
        expect(saveData.state.player).toBeDefined();
    });

    test('should reset player to spawn point on death', async ({ page }) => {
        await page.waitForTimeout(3000);

        // Move away from spawn
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(2000);
        await page.keyboard.up('ArrowUp');

        // Kill player
        await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            if (store) {
                store.getState().damagePlayer(1000); // Massive damage
            }
        });

        await page.waitForTimeout(1000);

        // Check for game over screen
        const gameOverVisible = await page.locator('text=/game over/i').isVisible();
        expect(gameOverVisible).toBe(true);

        // Click try again button
        const respawnButton = page.locator('button:has-text("Try Again")');
        await respawnButton.click();

        await page.waitForTimeout(1000);

        // Check player position is reset to spawn
        const position = await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            return store?.getState?.()?.player?.position || null;
        });

        expect(position).not.toBeNull();
        expect(Math.abs(position.x)).toBeLessThan(5);
        expect(Math.abs(position.z)).toBeLessThan(5);
    });
});
