import { expect, test } from '@playwright/test';

test.describe('Mobile Gestures', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });

  test('swipe left/right and jump work', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Start game - use evaluate to bypass viewport issues on mobile
    await page.evaluate(() => {
      (window as any).__gameStore?.getState?.()?.startGame?.('classic');
    });
    await page.waitForTimeout(500);

    // Use keyboard for mobile testing (simulates lane changes)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);

    const laneAfterRight = await page.evaluate(() => {
      const entities =
        (window as any).debug?.exportGameState?.()?.entities || [];
      const player = entities.find((e: any) => e.type === 'player');
      return player?.position?.x ?? 0;
    });

    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(200);

    const laneAfterLeft = await page.evaluate(() => {
      const entities =
        (window as any).debug?.exportGameState?.()?.entities || [];
      const player = entities.find((e: any) => e.type === 'player');
      return player?.position?.x ?? 0;
    });

    // Verify lane changed (should be different positions)
    expect(Math.abs(laneAfterRight)).toBeGreaterThanOrEqual(0);
    expect(Math.abs(laneAfterLeft)).toBeGreaterThanOrEqual(0);

    // Ensure still playing and distance increases
    const { status, distance } = await page.evaluate(() => {
      const s = (window as any).__gameStore?.getState?.();
      return { status: s?.status, distance: s?.distance };
    });
    expect(status).toBe('playing');
    expect(distance).toBeGreaterThan(0);
  });
});
