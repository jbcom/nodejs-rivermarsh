import type { Page } from '@playwright/test';

/**
 * Bypasses the main menu and goes directly to exploration mode.
 * This is used in E2E tests to skip the menu and load the game world.
 */
export async function bypassMainMenu(page: Page) {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Wait for the store to be available on window
    await page.waitForFunction(() => (window as any).__GAME_STORE__ !== undefined, {
        timeout: 30000,
    });

    // Set game mode to exploration and mark as loaded
    await page.evaluate(() => {
        const store = (window as any).__GAME_STORE__;
        if (store) {
            // Force state updates to skip menu and loading screen
            store.getState().setGameMode('exploration');
            store.getState().setLoaded(true);
            store.getState().setPaused(false);
        }
    });

    // Wait a bit for the UI to update and the scene to initialize
    await page.waitForTimeout(2000);
}
