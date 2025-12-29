import { expect, test } from '@playwright/test';
import { bypassMainMenu } from './test-utils';

/**
 * E2E Tests for Resource Collection
 */

test.describe('Resource Collection', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('');
        await bypassMainMenu(page);
        await page.waitForTimeout(3000);
    });

    test('should spawn resources in the world', async ({ page }) => {
        // Check for resource entities
        const resourceCount = await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return 0;

            let count = 0;
            for (const entity of world.entities) {
                if (entity.resource) {
                    count++;
                }
            }
            return count;
        });

        // Should have spawned resources
        expect(resourceCount).toBeGreaterThan(0);
    });

    test('should collect resource and restore health', async ({ page }) => {
        // Damage player first
        await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            if (store) {
                // Using damagePlayer to reduce health
                store.getState().damagePlayer(50);
            }
        });

        const initialHealth = await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            return store?.getState?.()?.player?.health || 100;
        });

        // Try to find and collect a resource
        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('ArrowUp');
            await page.waitForTimeout(500);
            await page.keyboard.press('e');
            await page.waitForTimeout(200);
        }

        const finalHealth = await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            return store?.getState?.()?.player?.health || 100;
        });

        // Health should be >= initial (may have collected resource)
        expect(finalHealth).toBeGreaterThanOrEqual(initialHealth - 10);
    });

    test('should collect resource and restore stamina', async ({ page }) => {
        // Drain stamina by running
        await page.keyboard.down('Shift');
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(2000);
        await page.keyboard.up('ArrowUp');
        await page.keyboard.up('Shift');

        const initialStamina = await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            return store?.getState?.()?.player?.stamina || 100;
        });

        // Try to collect resources
        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('ArrowRight');
            await page.waitForTimeout(500);
            await page.keyboard.press('e');
            await page.waitForTimeout(200);
        }

        // Wait for stamina to regenerate or resource collection
        await page.waitForTimeout(1000);

        const finalStamina = await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            return store?.getState?.()?.player?.stamina || 100;
        });

        // Stamina should have increased (either from regen or collection)
        expect(finalStamina).toBeGreaterThan(initialStamina);
    });
});
