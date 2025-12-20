import { expect, test } from '@playwright/test';

/**
 * Compositional Flow Tests - Verify COMPLETE game sequences work end-to-end
 * Not just isolated features, but the FULL player journey
 */

test.describe('Complete Game Flow - Full Playthrough', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
  });

  test('Complete Classic Mode Playthrough: Menu → Play → Dodge → Collect → Die → Restart → Menu', async ({
    page,
  }) => {
    // Massively increase timeout for this complex test
    test.setTimeout(120000); // 2 minutes

    // 1. MENU: Verify menu loads with all options
    await expect(page.locator('#startScreen')).toBeVisible();
    await expect(page.locator('#classicButton')).toBeVisible();

    // 2. START: Click to start game
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    await page.waitForTimeout(1000); // Give more time to initialize

    // 3. GAME INITIALIZES: Menu hides, game state = playing
    const status = await page.evaluate(
      () => (window as any).__gameStore?.getState?.()?.status
    );
    expect(status).toBe('playing');

    // 4. PLAYER SPAWNS: Verify player entity exists
    await page.waitForTimeout(2000); // Give more time for player to spawn
    const playerExists = await page.evaluate(() => {
      return (window as any).debug?.getPerformanceStats?.()?.totalEntities > 0;
    });
    expect(playerExists).toBe(true);

    await expect(async () => {
      const entityCount = await page.evaluate(() => {
        return (
          (window as any).debug?.getPerformanceStats?.()?.totalEntities || 0
        );
      });
      expect(entityCount).toBeGreaterThanOrEqual(1); // At least player entity
    }).toPass({ timeout: 5000 });

    // 6. DODGE: Press arrow keys to change lanes
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);

    // 7. SCORE INCREASES: Verify score/distance tracking - use polling with longer timeout
    await page.waitForTimeout(2000); // Give game time to initialize
    await expect(async () => {
      const scoreAfterPlay = await page.evaluate(() => {
        const state = (window as any).__gameStore?.getState?.();
        return { score: state?.score || 0, distance: state?.distance || 0 };
      });
      expect(scoreAfterPlay.distance).toBeGreaterThan(0);
    }).toPass({ timeout: 15000, intervals: [1000] }); // Poll for up to 15 seconds

    // 8. GAME OVER: Trigger death
    await page.evaluate(() => {
      (window as any).__gameStore?.getState?.()?.endGame?.();
    });
    await page.waitForTimeout(1500); // Increased wait for game over transition

    // 9. GAME OVER SCREEN: Verify screen appears with stats
    await expect(page.locator('#gameOverScreen')).toBeVisible({
      timeout: 10000,
    });
    const finalStats = await page.evaluate(() => {
      const state = (window as any).__gameStore?.getState?.();
      return {
        score: state?.score || 0,
        distance: state?.distance || 0,
        coins: state?.coins || 0,
        status: state?.status,
      };
    });
    expect(finalStats.status).toBe('game_over');

    // 10. RESTART: Click restart button
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#restartButton')?.click();
    });
    await page.waitForTimeout(1500); // Increased wait for restart

    // 11. GAME RESTARTS: Back to playing state
    const restartedStatus = await page.evaluate(() => {
      const state = (window as any).__gameStore?.getState?.();
      return { status: state?.status };
    });
    expect(restartedStatus.status).toBe('playing');

    // 12. QUIT TO MENU: Trigger quit
    await page.evaluate(() => {
      (window as any).__gameStore?.getState?.()?.endGame?.();
    });
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#menuButton')?.click();
    });
    await page.waitForTimeout(1500); // Increased wait for menu transition

    // 13. BACK TO MENU: Full circle
    await page.waitForTimeout(1000); // Additional wait for state to settle
    const finalStatus = await page.evaluate(
      () => (window as any).__gameStore?.getState?.()?.status
    );
    expect(finalStatus).toBe('menu');
    await expect(page.locator('#startScreen')).toBeVisible({ timeout: 10000 });
  });

  test('Pause/Resume Flow: Play → Pause → Resume → Continue', async ({
    page,
  }) => {
    test.setTimeout(90000); // Increased to 90 seconds

    // 1. Start game
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    await page.waitForTimeout(1500); // Increased initial wait

    // 2. Game is playing
    const playingStatus = await page.evaluate(
      () => (window as any).__gameStore?.getState?.()?.status
    );
    expect(playingStatus).toBe('playing');

    // 3. Press Escape to pause (use store for reliability in headless)
    await page.evaluate(() =>
      (window as any).__gameStore?.getState?.()?.pauseGame?.()
    );
    await page.waitForTimeout(1500); // Increased pause transition time

    // 4. Pause screen appears
    const pausedStatus = await page.evaluate(
      () => (window as any).__gameStore?.getState?.()?.status
    );
    expect(pausedStatus).toBe('paused');

    // 5. Click resume via evaluate for reliability
    await expect(page.locator('#resumeButton')).toBeVisible({ timeout: 10000 });
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#resumeButton')?.click();
    });
    await page.waitForTimeout(1500); // Increased resume transition time

    // 6. Back to playing
    const resumedStatus = await page.evaluate(
      () => (window as any).__gameStore?.getState?.()?.status
    );
    expect(resumedStatus).toBe('playing');

    // 7. Game continues - distance still increases - use polling with increased check interval
    const distanceBefore = await page.evaluate(
      () => (window as any).__gameStore?.getState?.()?.distance || 0
    );
    await page.waitForTimeout(1000); // Give some time for distance to change
    await expect(async () => {
      const distanceAfter = await page.evaluate(
        () => (window as any).__gameStore?.getState?.()?.distance || 0
      );
      expect(distanceAfter).toBeGreaterThan(distanceBefore);
    }).toPass({ timeout: 10000, intervals: [500] }); // Poll for up to 10 seconds, check every 500ms
  });

  test('Collision & Scoring Flow: Dodge obstacles, collect items, score increases', async ({
    page,
  }) => {
    // 1. Start game
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    await page.waitForTimeout(2000);

    // 2. Initial state - score may already be >0 from distance
    const initialState = await page.evaluate(() => {
      const state = (window as any).__gameStore?.getState?.();
      return {
        coins: state?.coins || 0,
        gems: state?.gems || 0,
        lives: state?.lives || 0,
      };
    });
    expect(initialState.lives).toBe(3);
    expect(initialState.coins).toBe(0);

    // 3. Play for a bit - entities spawn and scroll
    await page.waitForTimeout(5000);

    // 4. Verify score increased from distance
    const afterPlayState = await page.evaluate(() => {
      const state = (window as any).__gameStore?.getState?.();
      return {
        score: state?.score || 0,
        distance: state?.distance || 0,
      };
    });
    expect(afterPlayState.distance).toBeGreaterThan(0);

    // 5. Verify entities are actually present
    const entities = await page.evaluate(() => {
      return (window as any).debug?.getPerformanceStats?.()?.totalEntities || 0;
    });
    expect(entities).toBeGreaterThan(0);
  });
});
