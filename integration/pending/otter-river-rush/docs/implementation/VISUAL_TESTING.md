# Visual Testing Guide

## Overview

This project uses Playwright for visual regression testing to ensure the game renders correctly across different browsers and viewports.

## Running Visual Tests

### First Time Setup

1. Install Playwright browsers:
```bash
npx playwright install
```

2. Build the project:
```bash
npm run build
```

3. Generate baseline screenshots:
```bash
npm run test:e2e -- tests/e2e/visual.spec.ts --update-snapshots
```

### Running Tests

Run visual regression tests:
```bash
npm run test:visual
```

Run with UI mode for debugging:
```bash
npm run test:visual:ui
```

### Updating Baselines

When you intentionally change the visual appearance:

```bash
npm run test:e2e -- tests/e2e/visual.spec.ts --update-snapshots
```

## What We Test

The visual regression test suite covers:

1. **Menu Screen** - Initial game menu appearance
2. **Gameplay Screen** - In-game rendering and UI
3. **UI Elements** - HUD, score, distance counters
4. **Canvas Rendering** - Game canvas dimensions and content
5. **Responsive Design** - Mobile, tablet, and desktop viewports
6. **Background Rendering** - Dynamic biomes and scenery
7. **Pause Menu** - Pause screen appearance
8. **Sprite Rendering** - Otter and other game sprites

## Baseline Images

Baseline screenshots are stored in:
- `tests/e2e/visual.spec.ts-snapshots/`

These images represent the "correct" visual state of the game. When tests run, Playwright compares current screenshots against these baselines.

## Configuration

Visual testing settings are in `playwright.config.ts`:

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 100,      // Max pixels that can differ
    threshold: 0.2,          // Color difference threshold (0-1)
    animations: 'disabled',  // Disable animations for consistency
  },
}
```

## Troubleshooting

### Tests Failing After Valid Changes

If you've made intentional visual changes, update the baselines:
```bash
npm run test:visual:update
```

### Flaky Tests

Visual tests can be flaky due to:
- Animations not fully disabled
- Font rendering differences
- Timing issues

Adjust `maxDiffPixels` in test configuration if needed.

### Browser-Specific Issues

Run tests for a specific browser:
```bash
npm run test:visual -- --project=chromium
npm run test:visual -- --project=firefox
npm run test:visual -- --project=webkit
```

## CI/CD Integration

Visual tests run automatically in CI:
- On pull requests
- Before deployments
- Generate reports in `playwright-report/`

## Best Practices

1. **Keep baselines up to date** - Commit updated screenshots when visual changes are intentional
2. **Review diffs carefully** - Use `npx playwright show-report` to review differences
3. **Test multiple viewports** - Ensure responsive design works
4. **Disable animations** - Use `animations: 'disabled'` for consistency
5. **Wait for loading** - Use `waitForLoadState('networkidle')` before screenshots

## Viewing Test Reports

After running tests:
```bash
npx playwright show-report
```

This opens an interactive HTML report showing:
- Which tests passed/failed
- Visual diffs for failed tests
- Screenshots and traces
