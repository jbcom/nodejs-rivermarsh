import { expect, test } from '@playwright/test';
import { bypassMainMenu } from './test-utils';

/**
 * E2E Tests for NPC Behaviors
 */

test.describe('NPC Behaviors', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('');
        await bypassMainMenu(page);
        // Wait longer for NPCs to spawn
        await page.waitForTimeout(5000);
    });

    test('should spawn NPCs in the world', async ({ page }) => {
        const npcCount = await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            return store?.getState?.()?.npcs?.length || 0;
        });

        // Should have spawned some NPCs
        expect(npcCount).toBeGreaterThan(0);
    });

    test('should maintain NPC count within reasonable bounds', async ({ page }) => {
        const npcCount = await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            return store?.getState?.()?.npcs?.length || 0;
        });

        expect(npcCount).toBeLessThan(100);
        expect(npcCount).toBeGreaterThan(0);
    });
});
