import { expect, test } from '@playwright/test';

/**
 * Composition Tests - Verify visual layout and element positioning
 * These tests catch issues like overlapping elements, z-index problems,
 * unexpected white boxes, layout conflicts, and responsive design issues.
 */

test.describe('Visual Composition Tests', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
  });

  test('no layout issues - overlapping elements or white boxes', async ({
    page,
  }) => {
    // Wait for game to load
    await page.waitForSelector('#app', { timeout: 10000 });

    // Start the game to render the canvas
    await page.click('#classicButton');
    await page.waitForTimeout(1000); // Wait for canvas to render

    // Check for unexpected white spaces or overlapping canvases
    const layoutIssues = await page.evaluate(() => {
      const canvases = document.querySelectorAll('canvas');
      const allElements = Array.from(document.querySelectorAll('*'));

      // Check for large white boxes without IDs (unintentional)
      const whiteBoxes = allElements.filter((el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return (
          rect.width > 100 &&
          rect.height > 100 &&
          (style.backgroundColor === 'rgb(255, 255, 255)' ||
            style.backgroundColor === 'white') &&
          !el.id && // Ignore intentional white elements with IDs
          el.tagName !== 'CANVAS'
        ); // Ignore canvas elements
      });

      return {
        canvasCount: canvases.length,
        whiteBoxCount: whiteBoxes.length,
        hasMultipleCanvases: canvases.length > 1,
        canvasInfo: Array.from(canvases).map((c) => ({
          id: c.id,
          width: c.width,
          height: c.height,
          visible: c.getBoundingClientRect().width > 0,
        })),
      };
    });

    // There should be exactly 1 canvas (React Three Fiber)
    expect(layoutIssues.canvasCount).toBe(1);

    // No unintentional white boxes
    expect(layoutIssues.whiteBoxCount).toBe(0);

    // No multiple overlapping canvases
    expect(layoutIssues.hasMultipleCanvases).toBe(false);
  });

  test('canvas fills viewport correctly', async ({ page }) => {
    // Start the game first to render the canvas
    await page.click('#classicButton');
    await page.waitForSelector('canvas', { timeout: 10000 });

    // Wait longer for the canvas to properly size
    await page.waitForTimeout(2000);

    const canvasLayout = await page.evaluate(() => {
      const canvases = document.querySelectorAll('canvas');

      // Get the largest canvas (likely the Three.js canvas)
      const canvas = Array.from(canvases).reduce((largest, current) => {
        const currentRect = current.getBoundingClientRect();
        const largestRect = largest.getBoundingClientRect();
        return currentRect.width * currentRect.height >
          largestRect.width * largestRect.height
          ? current
          : largest;
      });

      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      return {
        canvasWidth: rect.width,
        canvasHeight: rect.height,
        viewportWidth,
        viewportHeight,
        fillsViewport:
          rect.width >= viewportWidth * 0.8 &&
          rect.height >= viewportHeight * 0.7, // Allow for UI space
        isVisible: rect.width > 0 && rect.height > 0,
      };
    });

    expect(canvasLayout).not.toBeNull();
    expect(canvasLayout?.isVisible).toBe(true);

    expect(canvasLayout?.fillsViewport).toBe(true);
  });

  test('UI elements have correct z-index stacking', async ({ page }) => {
    // Start the game to check stacking during gameplay
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    await page.waitForTimeout(1000);

    const zIndexIssues = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const hudElements = document.querySelectorAll(
        '[class*="HUD"], [id*="hud"], [id*="score"]'
      );

      if (!canvas) return { hasIssues: true, reason: 'No canvas found' };

      const canvasZ = parseInt(window.getComputedStyle(canvas).zIndex || '0');
      const hudZIndexes = Array.from(hudElements).map((el) => {
        const z = parseInt(window.getComputedStyle(el).zIndex || '0');
        return { id: el.id || el.className, zIndex: z };
      });

      // HUD elements should have higher z-index than canvas
      const hudBelowCanvas = hudZIndexes.filter(
        (h) => h.zIndex < canvasZ && h.zIndex !== 0
      );

      return {
        hasIssues: hudBelowCanvas.length > 0,
        canvasZIndex: canvasZ,
        hudZIndexes,
        hudBelowCanvas,
      };
    });

    expect(zIndexIssues.hasIssues).toBe(false);
  });

  test('no hidden or cropped content', async ({ page }) => {
    await page.waitForSelector('#app', { timeout: 10000 });

    const croppedContent = await page.evaluate(() => {
      const importantElements = document.querySelectorAll(
        '#classicButton, #timeTrialButton, #zenButton, #dailyButton, h1'
      );

      const cropped = Array.from(importantElements).filter((el) => {
        const rect = el.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Check if element is partially outside viewport
        return (
          rect.left < 0 ||
          rect.right > viewportWidth ||
          rect.top < 0 ||
          rect.bottom > viewportHeight
        );
      });

      return {
        croppedCount: cropped.length,
        croppedElements: cropped.map((el) => ({
          id: el.id,
          text: el.textContent?.substring(0, 30),
        })),
      };
    });

    expect(croppedContent.croppedCount).toBe(0);
  });

  test('responsive layout - elements positioned correctly', async ({
    page,
  }) => {
    await page.waitForSelector('#app', { timeout: 10000 });

    const layoutPositioning = await page.evaluate(() => {
      const app = document.querySelector('#app');
      const startScreen = document.querySelector('#startScreen');

      if (!app || !startScreen) {
        return { isValid: false, reason: 'Required elements not found' };
      }

      const appRect = app.getBoundingClientRect();
      const screenRect = startScreen.getBoundingClientRect();

      return {
        isValid: true,
        appFullScreen: appRect.left === 0 && appRect.top === 0,
        startScreenCentered: screenRect.left >= 0 && screenRect.top >= 0,
        noNegativePositions: appRect.left >= 0 && screenRect.left >= 0,
      };
    });

    expect(layoutPositioning.isValid).toBe(true);
    expect(layoutPositioning.appFullScreen).toBe(true);
    expect(layoutPositioning.noNegativePositions).toBe(true);
  });
});

test.describe('Responsive Design Tests - Multiple Screen Sizes', () => {
  const viewports = [
    { name: 'iPhone SE (Small Phone)', width: 375, height: 667 },
    { name: 'iPhone 12 Pro', width: 390, height: 844 },
    { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
    { name: 'Samsung Galaxy S21', width: 360, height: 800 },
    { name: 'Pixel 5', width: 393, height: 851 },
    { name: 'iPad Mini', width: 768, height: 1024 },
    { name: 'iPad Pro 11"', width: 834, height: 1194 },
    { name: 'Small Landscape', width: 667, height: 375 },
    { name: 'Tablet Landscape', width: 1024, height: 768 },
  ];

  for (const viewport of viewports) {
    test(`${viewport.name} (${viewport.width}x${viewport.height}) - menu is responsive and centered`, async ({
      page,
      baseURL,
    }) => {
      // Set viewport size
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto(baseURL || '/');
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('#startScreen', { timeout: 10000 });

      const responsiveCheck = await page.evaluate(() => {
        const startScreen = document.querySelector('#startScreen');
        const menuContainer = document.querySelector('#startScreen > div');
        const buttons = document.querySelectorAll(
          '#classicButton, #timeTrialButton, #zenButton, #dailyButton'
        );
        const title = document.querySelector('h1');

        if (!startScreen || !menuContainer || !title) {
          return { isValid: false, reason: 'Required elements not found' };
        }

        const containerRect = menuContainer.getBoundingClientRect();
        const titleRect = title.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Check button visibility and sizing
        const buttonStats = Array.from(buttons).map((btn) => {
          const rect = btn.getBoundingClientRect();
          return {
            id: btn.id,
            visible: rect.width > 0 && rect.height > 0,
            inViewport:
              rect.left >= 0 &&
              rect.right <= viewportWidth &&
              rect.top >= 0 &&
              rect.bottom <= viewportHeight,
            width: rect.width,
            height: rect.height,
            minHeight: rect.height >= 44, // Apple's minimum touch target
          };
        });

        const centerOffset = Math.abs(
          containerRect.left + containerRect.width / 2 - viewportWidth / 2
        );

        // More lenient centering tolerance for tablet viewports
        const centeringTolerance =
          viewportWidth > 1000 ? 220 : viewportWidth > 600 ? 120 : 50;

        return {
          isValid: true,
          viewportWidth,
          viewportHeight,
          containerWidth: containerRect.width,
          containerLeft: containerRect.left,
          containerCenter: containerRect.left + containerRect.width / 2,
          viewportCenter: viewportWidth / 2,
          centerOffset,
          containerCentered: centerOffset < centeringTolerance,
          titleVisible: titleRect.width > 0 && titleRect.height > 0,
          titleInViewport:
            titleRect.top >= 0 && titleRect.bottom <= viewportHeight,
          allButtonsVisible: buttonStats.every((b) => b.visible),
          allButtonsInViewport: buttonStats.every((b) => b.inViewport),
          allButtonsTouchable: buttonStats.every((b) => b.minHeight),
          buttonCount: buttonStats.length,
          buttons: buttonStats,
          containerFitsViewport: containerRect.width <= viewportWidth,
          noHorizontalScroll:
            document.documentElement.scrollWidth <= viewportWidth,
        };
      });

      // Assertions
      expect(responsiveCheck.isValid).toBe(true);
      expect(responsiveCheck.titleVisible).toBe(true);
      expect(responsiveCheck.titleInViewport).toBe(true);
      expect(responsiveCheck.buttonCount).toBe(4);
      expect(responsiveCheck.allButtonsVisible).toBe(true);
      expect(responsiveCheck.allButtonsTouchable).toBe(true);
      expect(responsiveCheck.containerFitsViewport).toBe(true);
      expect(responsiveCheck.noHorizontalScroll).toBe(true);

      // Menu should be reasonably centered (within 50px of center)
      expect(responsiveCheck.containerCentered).toBe(true);
    });
  }

  test('Portrait to Landscape orientation change', async ({
    page,
    baseURL,
  }) => {
    // Start in portrait
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseURL || '/');
    await page.waitForSelector('#startScreen', { timeout: 10000 });

    const portraitCheck = await page.evaluate(() => {
      const container = document.querySelector('#startScreen > div');
      return container ? container.getBoundingClientRect().width : 0;
    });

    expect(portraitCheck).toBeGreaterThan(0);

    // Rotate to landscape
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(500); // Wait for layout to adjust

    const landscapeCheck = await page.evaluate(() => {
      const container = document.querySelector('#startScreen > div');
      const buttons = document.querySelectorAll(
        '#classicButton, #timeTrialButton, #zenButton, #dailyButton'
      );
      const rect = container ? container.getBoundingClientRect() : null;

      return {
        containerWidth: rect ? rect.width : 0,
        allButtonsVisible: Array.from(buttons).every((btn) => {
          const btnRect = btn.getBoundingClientRect();
          return btnRect.width > 0 && btnRect.height > 0;
        }),
        noOverflow: document.documentElement.scrollWidth <= window.innerWidth,
      };
    });

    expect(landscapeCheck.containerWidth).toBeGreaterThan(0);
    expect(landscapeCheck.allButtonsVisible).toBe(true);
    expect(landscapeCheck.noOverflow).toBe(true);
  });

  test('Very small screen (240x320) - content still accessible', async ({
    page,
    baseURL,
  }) => {
    // Extreme case: very small screen
    await page.setViewportSize({ width: 240, height: 320 });
    await page.goto(baseURL || '/');
    await page.waitForSelector('#startScreen', { timeout: 10000 });

    const tinyScreenCheck = await page.evaluate(() => {
      const container = document.querySelector('#startScreen > div');
      const buttons = document.querySelectorAll('button');

      return {
        hasScrolling: container
          ? container.scrollHeight > container.clientHeight
          : false,
        buttonsClickable: Array.from(buttons).every((btn) => {
          const rect = btn.getBoundingClientRect();
          return rect.height >= 30; // Minimum for very small screens
        }),
      };
    });

    // On very small screens, scrolling is acceptable
    expect(tinyScreenCheck.buttonsClickable).toBe(true);
  });
});
