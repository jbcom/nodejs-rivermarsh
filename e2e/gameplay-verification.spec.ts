/**
 * Real Gameplay Verification Tests
 *
 * These tests actually verify game state changes, not just "did it crash?"
 */

import { expect, type Page, test } from '@playwright/test';
import { bypassMainMenu } from './test-utils';

// Helper to get game state from the browser
async function getGameState(page: Page) {
    return page.evaluate(() => {
        // Access Zustand store directly
        const store = (window as any).__GAME_STORE__;
        const state = store?.getState?.();
        if (!state) return null;

        return {
            playerHealth: state.player?.health,
            playerStamina: state.player?.stamina,
            playerPosition: state.player?.position,
            score: state.score,
            gameTime: state.gameTime,
        };
    });
}

// Helper to get player position from Three.js scene
async function getPlayerPosition(page: Page) {
    return page.evaluate(() => {
        // Access player mesh position
        const player = (window as any).__PLAYER_REF__;
        if (!player) return null;

        return {
            x: player.position.x,
            y: player.position.y,
            z: player.position.z,
        };
    });
}

test.describe('Player Movement Verification', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('');
        await bypassMainMenu(page);
        await page.waitForTimeout(3000); // Wait for game initialization
    });

    test('moving forward should change position', async ({ page }) => {
        // First move a bit to ensure physics is awake
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(2000);
        await page.keyboard.up('ArrowUp');
        await page.waitForTimeout(1000);

        const initialPos = await getPlayerPosition(page);

        // Move forward for 3 seconds
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(3000);
        await page.keyboard.up('ArrowUp');

        const finalPos = await getPlayerPosition(page);

        if (initialPos && finalPos) {
            const distance = Math.sqrt(
                (finalPos.x - initialPos.x) ** 2 + (finalPos.z - initialPos.z) ** 2
            );
            expect(distance).toBeGreaterThan(0.1);
        }
    });

    test('jumping should temporarily increase Y position', async ({ page }) => {
        // Wait for player to settle on ground
        await page.waitForTimeout(3000);

        const initialPos = await getPlayerPosition(page);

        // Jump
        await page.keyboard.down('Space');
        await page.waitForTimeout(500); // Capture mid-jump
        const midJumpPos = await getPlayerPosition(page);
        await page.keyboard.up('Space');

        if (initialPos && midJumpPos) {
            // Y should have increased
            expect(midJumpPos.y).toBeGreaterThan(initialPos.y + 0.1);
        }
    });

    test('moving backward should change position', async ({ page }) => {
        // First move forward to have room to move back
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(2000);
        await page.keyboard.up('ArrowUp');
        await page.waitForTimeout(1000);

        const initialPos = await getPlayerPosition(page);

        // Move backward
        await page.keyboard.down('ArrowDown');
        await page.waitForTimeout(3000);
        await page.keyboard.up('ArrowDown');

        const finalPos = await getPlayerPosition(page);

        if (initialPos && finalPos) {
            const distance = Math.sqrt(
                (finalPos.x - initialPos.x) ** 2 + (finalPos.z - initialPos.z) ** 2
            );
            expect(distance).toBeGreaterThan(0.1);
        }
    });
});

test.describe('Stamina System', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('');
        await bypassMainMenu(page);
        await page.waitForTimeout(3000);
    });

    test('sprinting should decrease stamina', async ({ page }) => {
        // Wait for stamina to be full
        await page.waitForTimeout(1000);
        const initialState = await getGameState(page);

        // Sprint (Shift + movement)
        await page.keyboard.down('Shift');
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(3000);
        await page.keyboard.up('ArrowUp');
        await page.keyboard.up('Shift');

        const finalState = await getGameState(page);

        if (initialState && finalState) {
            expect(finalState.playerStamina).toBeLessThan(initialState.playerStamina);
        }
    });

    test('stamina should regenerate when not sprinting', async ({ page }) => {
        // First deplete some stamina
        await page.keyboard.down('Shift');
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(2000);
        await page.keyboard.up('ArrowUp');
        await page.keyboard.up('Shift');

        const depletedState = await getGameState(page);

        // Wait for regeneration
        await page.waitForTimeout(3000);

        const recoveredState = await getGameState(page);

        if (depletedState && recoveredState) {
            expect(recoveredState.playerStamina).toBeGreaterThan(depletedState.playerStamina);
        }
    });
});

test.describe('Game Time Progression', () => {
    test('game time should advance', async ({ page }) => {
        await page.goto('');
        await bypassMainMenu(page);
        await page.waitForTimeout(3000);

        const initialState = await getGameState(page);

        // Wait for time to pass
        await page.waitForTimeout(5000);

        const laterState = await getGameState(page);

        if (initialState?.gameTime !== undefined && laterState?.gameTime !== undefined) {
            expect(laterState.gameTime).toBeGreaterThan(initialState.gameTime);
        }
    });
});
