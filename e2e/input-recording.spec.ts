/**
 * Input Recording and Replay Testing
 */

import { expect, test, type Page } from '@playwright/test';
import { bypassMainMenu } from './test-utils';

interface InputEvent {
    type: 'keydown' | 'keyup';
    key: string;
    timestamp: number;
}

interface GameSnapshot {
    position: { x: number; y: number; z: number } | null;
    health: number | null;
    stamina: number | null;
    timestamp: number;
}

// Helper to record inputs
async function startInputRecording(page: Page) {
    await page.evaluate(() => {
        (window as any).__RECORDED_INPUTS__ = [];
        const startTime = Date.now();
        
        const recordEvent = (e: KeyboardEvent) => {
            (window as any).__RECORDED_INPUTS__.push({
                type: e.type,
                key: e.key,
                timestamp: Date.now() - startTime,
            });
        };
        
        document.addEventListener('keydown', recordEvent);
        document.addEventListener('keyup', recordEvent);
        (window as any).__RECORDING_START__ = startTime;
    });
}

async function stopInputRecording(page: Page): Promise<InputEvent[]> {
    return page.evaluate(() => {
        const inputs = (window as any).__RECORDED_INPUTS__ || [];
        return inputs;
    });
}

// Helper to replay inputs
async function replayInputs(page: Page, inputs: InputEvent[]) {
    for (const input of inputs) {
        if (input.type === 'keydown') {
            await page.keyboard.down(input.key);
        } else {
            await page.keyboard.up(input.key);
        }
        
        // Wait until next input timestamp
        const nextInput = inputs[inputs.indexOf(input) + 1];
        if (nextInput) {
            const delay = nextInput.timestamp - input.timestamp;
            if (delay > 0) {
                await page.waitForTimeout(delay);
            }
        }
    }
}

// Helper to take game snapshot
async function takeSnapshot(page: Page): Promise<GameSnapshot> {
    return page.evaluate(() => {
        const store = (window as any).__GAME_STORE__?.getState?.();
        const player = (window as any).__PLAYER_REF__;
        
        return {
            position: player ? {
                x: player.position.x,
                y: player.position.y,
                z: player.position.z,
            } : null,
            health: store?.player?.health ?? null,
            stamina: store?.player?.stamina ?? null,
            timestamp: Date.now(),
        };
    });
}

test.describe('Input Recording and Replay', () => {
    test('basic movement should be reproducible', async ({ page }) => {
        // First run - record inputs
        await page.goto('');
        await bypassMainMenu(page);
        await page.waitForTimeout(3000);
        
        await startInputRecording(page);
        
        // Perform a specific movement sequence
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(1000);
        await page.keyboard.up('ArrowUp');
        await page.keyboard.press('Space');
        await page.waitForTimeout(500);
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(1000);
        await page.keyboard.up('ArrowRight');
        
        const recordedInputs = await stopInputRecording(page);
        const firstSnapshot = await takeSnapshot(page);
        
        // Second run - replay inputs
        await page.goto('');
        await bypassMainMenu(page);
        await page.waitForTimeout(3000);
        
        await replayInputs(page, recordedInputs);
        await page.waitForTimeout(500); // Wait for physics to settle
        
        const secondSnapshot = await takeSnapshot(page);
        
        // Positions should be similar (allowing for physics variance)
        if (firstSnapshot.position && secondSnapshot.position) {
            const tolerance = 2.0; // Allow 2 unit variance for physics
            expect(Math.abs(firstSnapshot.position.x - secondSnapshot.position.x)).toBeLessThan(tolerance);
            expect(Math.abs(firstSnapshot.position.z - secondSnapshot.position.z)).toBeLessThan(tolerance);
        }
    });
});
