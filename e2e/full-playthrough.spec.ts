import { expect, type Page, test } from '@playwright/test';

// Helper to get game state from the browser
async function getFullGameState(page: Page) {
    return page.evaluate(() => {
        const engineState = (window as any).__GAME_STORE__?.getState?.();
        const rpgState = (window as any).__RPG_STORE__?.getState?.();
        
        if (!engineState || !rpgState) return null;

        return {
            mode: engineState.mode,
            playerPosition: {
                x: engineState.player.position.x,
                y: engineState.player.position.y,
                z: engineState.player.position.z
            },
            score: engineState.score,
            distance: engineState.distance,
            health: rpgState.player.stats.health,
            stamina: rpgState.player.stats.stamina,
            gold: rpgState.player.stats.gold,
            level: rpgState.player.stats.level,
            experience: rpgState.player.stats.experience,
            inventory: rpgState.player.inventory,
            jsErrors: (window as any).__JS_ERRORS__ || []
        };
    });
}

async function waitForGameReady(page: Page) {
    await page.waitForFunction(() => (window as any).__GAME_READY__ === true, { timeout: 30000 });
}

test.describe('Full Playthrough Sequence', () => {
    test.setTimeout(120000); // 2 minutes
    test('should complete a basic gameplay loop', async ({ page }) => {
        // 1. Initial Load
        await page.goto('/');
        await waitForGameReady(page);
        await page.waitForTimeout(2000);
        
        const initialState = await getFullGameState(page);
        expect(initialState).not.toBeNull();
        expect(initialState?.jsErrors).toHaveLength(0);
        
        await page.screenshot({ path: 'playthrough-1-start.png' });
        console.log('Capture: playthrough-1-start.png');

        // 2. Exploration & Movement
        console.log('Exploring...');
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(3000);
        await page.keyboard.up('ArrowUp');
        
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(1000);
        await page.keyboard.up('ArrowRight');
        
        const explorationState = await getFullGameState(page);
        expect(explorationState?.playerPosition.z).toBeGreaterThan(initialState!.playerPosition.z);
        expect(explorationState?.distance).toBeGreaterThan(0);
        
        await page.screenshot({ path: 'playthrough-2-explored.png' });
        console.log('Capture: playthrough-2-explored.png');

        // 3. UI Interaction (Inventory)
        console.log('Opening Inventory...');
        await page.keyboard.press('i');
        await page.waitForTimeout(500);
        await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible();
        await page.screenshot({ path: 'playthrough-3-inventory.png' });
        console.log('Capture: playthrough-3-inventory.png');
        await page.keyboard.press('i'); // Close

        // 4. Combat Simulation (Jump and Attack)
        console.log('Testing Combat Actions...');
        await page.keyboard.press('Space'); // Jump
        await page.waitForTimeout(200);
        await page.keyboard.press('e'); // Interaction/Attack if mapped
        await page.waitForTimeout(500);
        
        const combatState = await getFullGameState(page);
        expect(combatState?.jsErrors).toHaveLength(0);
        await page.screenshot({ path: 'playthrough-4-combat.png' });
        console.log('Capture: playthrough-4-combat.png');

        // 5. Check HUD elements
        await expect(page.getByText(/LVL \d+/).first()).toBeVisible();
        await expect(page.getByText(/HP:/).or(page.getByText(/Health/)).first()).toBeVisible();
        
        console.log('Final State:', await getFullGameState(page));
        await page.screenshot({ path: 'playthrough-5-final.png' });
        console.log('Capture: playthrough-5-final.png');
    });
});
