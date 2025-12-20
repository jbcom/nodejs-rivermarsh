# Visual Test Baselines

This directory contains baseline screenshots for visual regression testing.

## Structure

Baseline screenshots are automatically organized by test file and browser:
```
tests/e2e/visual.spec.ts-snapshots/
├── menu-screen-chromium.png
├── gameplay-screen-chromium.png
├── game-ui-elements-chromium.png
├── canvas-rendering-chromium.png
├── mobile-menu-chromium.png
├── tablet-menu-chromium.png
├── desktop-menu-chromium.png
├── background-rendering-chromium.png
├── pause-menu-chromium.png
└── otter-sprite-chromium.png
```

## Generating Baselines

First time setup:
```bash
# Install Playwright browsers
npx playwright install chromium

# Build the project
npm run build

# Generate baseline screenshots
npm run test:visual:update
```

## Updating Baselines

After making intentional visual changes:
```bash
npm run test:visual:update
```

Then commit the updated screenshot files:
```bash
git add tests/e2e/visual.spec.ts-snapshots/
git commit -m "Update visual test baselines"
```

## Reviewing Differences

When tests fail, review the diff:
```bash
npx playwright show-report
```

This will show:
- Expected (baseline) image
- Actual (current) image
- Diff highlighting changed pixels

## Tips

1. **Keep baselines current** - Update them when you intentionally change visuals
2. **Review carefully** - Make sure changes are intentional before updating baselines
3. **Test locally** - Run visual tests before pushing to catch issues early
4. **Browser-specific** - Different browsers may render slightly differently

## CI/CD

Visual tests run automatically in GitHub Actions:
- On pull requests
- Before deployments
- Baseline screenshots are stored in the repository
- Failed tests upload artifacts showing differences
