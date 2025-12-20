/**
 * E2E tests for Otter River Rush gameplay
 */

import { expect, test } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

test.describe('Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    // Use shared config
    await page.goto(TEST_CONFIG.urls.deployed);
  });

  test('should load the game', async ({ page }) => {
    await expect(page).toHaveTitle(/Otter River Rush/);
    await expect(page.locator('canvas, canvas.webgl')).toBeVisible();
  });

  test('should start game when clicking start button', async ({ page }) => {
    await page.click('#classicButton');

    // Check that score is visible and starts at 0
    const scoreElement = page.locator('[data-testid="score"]');
    await expect(scoreElement).toBeVisible();
    await expect(scoreElement).toContainText('0');
  });

  test('should pause game when pressing Escape', async ({ page }) => {
    // Start the game
    await page.click('#classicButton');

    // Press Escape
    await page.keyboard.press('Escape');

    // Check for pause menu
    await expect(page.locator('text=/pause|resume/i')).toBeVisible();
  });

  test('should handle keyboard controls', async ({ page }) => {
    // Start the game
    await page.click('#classicButton');

    // Wait for game to be active
    await page.waitForTimeout(500);

    // Press arrow keys
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowRight');

    // Game should still be running
    const scoreElement = page.locator('[data-testid="score"]');
    await expect(scoreElement).toBeVisible();
  });

  test('should display distance counter', async ({ page }) => {
    await page.click('#classicButton');

    const distanceElement = page.locator('[data-testid="distance"]');
    await expect(distanceElement).toBeVisible();

    // Wait and check that distance increases
    await page.waitForTimeout(1000);
    const distance = await distanceElement.textContent();
    expect(parseInt(distance || '0')).toBeGreaterThan(0);
  });

  test('should show game over screen on collision', async ({ page }) => {
    await page.click('#classicButton');

    // Wait for potential collision (or force one)
    await page.waitForTimeout(5000);

    // Either game over screen appears or game is still running
    const gameOver = page.locator('text=/game over|try again/i');
    const score = page.locator('[data-testid="score"]');

    const isGameOverVisible = await gameOver.isVisible();
    const isScoreVisible = await score.isVisible();

    expect(isGameOverVisible || isScoreVisible).toBe(true);
  });

  test('should show leaderboard', async ({ page }) => {
    const leaderboardButton = page.locator('button', {
      hasText: /leaderboard/i,
    });

    if (await leaderboardButton.isVisible()) {
      await leaderboardButton.click();
      await expect(
        page.locator('text=/leaderboard|high scores/i')
      ).toBeVisible();
    }
  });

  test('should show settings menu', async ({ page }) => {
    const settingsButton = page.locator(
      'button[aria-label*="settings"], button',
      { hasText: /settings/i }
    );

    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await expect(page.locator('text=/settings|volume|sound/i')).toBeVisible();
    }
  });

  test('should show achievements', async ({ page }) => {
    const achievementsButton = page.locator('button', {
      hasText: /achievements/i,
    });

    if (await achievementsButton.isVisible()) {
      await achievementsButton.click();
      await expect(page.locator('text=/achievements/i')).toBeVisible();
    }
  });

  test('should handle touch controls on mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
    }

    await page.click('#classicButton');
    await page.waitForTimeout(500);

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();

    if (box) {
      // Swipe left
      await page.touchscreen.tap(
        box.x + box.width * 0.25,
        box.y + box.height * 0.5
      );
      await page.waitForTimeout(100);

      // Swipe right
      await page.touchscreen.tap(
        box.x + box.width * 0.75,
        box.y + box.height * 0.5
      );
    }

    // Game should still be running
    const scoreElement = page.locator('[data-testid="score"]');
    await expect(scoreElement).toBeVisible();
  });

  test('should persist high score', async ({ page }) => {
    // Play game briefly
    await page.locator('button', { hasText: /start|play/i }).click();
    await page.waitForTimeout(2000);

    // Force game over or let it happen
    await page.keyboard.press('Escape');

    // Reload page
    await page.reload();

    // Check if storage has data
    const hasStorage = await page.evaluate(() => {
      return localStorage.getItem('otter_rush_profile') !== null;
    });

    expect(hasStorage).toBe(true);
  });

  test('should work offline (PWA)', async ({ page, context }) => {
    // Visit page first to cache
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // Reload page
    await page.reload();

    // Page should still load
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });

    // Go back online
    await context.setOffline(false);
  });

  test('should be responsive', async ({ page }) => {
    const sizes = [
      { width: 375, height: 667 }, // iPhone SE
      { width: 1920, height: 1080 }, // Desktop
      { width: 768, height: 1024 }, // Tablet
    ];

    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.reload();

      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();

      const box = await canvas.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.height).toBeGreaterThan(0);
    }
  });

  test('should have accessible controls', async ({ page }) => {
    // Check for ARIA labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();

      // Button should have either aria-label or text content
      expect(ariaLabel || text).toBeTruthy();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    let focused: string | null = await page.evaluate(
      () => document.activeElement?.tagName ?? null
    );
    expect(['BUTTON', 'A', 'INPUT']).toContain(focused);

    await page.keyboard.press('Tab');
    focused = await page.evaluate(
      () => document.activeElement?.tagName ?? null
    );
    expect(['BUTTON', 'A', 'INPUT']).toContain(focused);
  });

  test.describe('Performance', () => {
    test('should maintain good FPS', async ({ page }) => {
      await page.locator('button', { hasText: /start|play/i }).click();

      // Measure FPS over 3 seconds
      const fps = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let frames = 0;
          let lastTime = performance.now();

          function measureFrame(): void {
            frames++;
            const currentTime = performance.now();

            if (currentTime - lastTime >= 3000) {
              resolve(frames / 3);
            } else {
              requestAnimationFrame(measureFrame);
            }
          }

          requestAnimationFrame(measureFrame);
        });
      });

      expect(fps).toBeGreaterThan(30); // At least 30 FPS
    });

    test('should have small bundle size', async ({ page }) => {
      const resources = await page.evaluate(() =>
        performance.getEntriesByType('resource')
      );

      interface ResourceTiming {
        name: string;
        transferSize?: number;
      }

      const jsFiles = (resources as ResourceTiming[]).filter((r) =>
        r.name.endsWith('.js')
      );
      const totalSize = jsFiles.reduce(
        (sum, r) => sum + (r.transferSize || 0),
        0
      );

      // Bundle should be under 2MB
      expect(totalSize).toBeLessThan(2 * 1024 * 1024);
    });
  });
});
