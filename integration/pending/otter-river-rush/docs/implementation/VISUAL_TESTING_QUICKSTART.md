# Quick Start: Visual Testing

This guide helps you get started with visual regression testing for Otter River Rush.

## 🎯 What is Visual Testing?

Visual testing automatically compares screenshots of your game against baseline images to detect unintended visual changes. Think of it as "unit tests for pixels."

## 🚀 Quick Start

### 1. Install Browsers (One-time)

```bash
npx playwright install chromium
```

### 2. Build the Game

```bash
npm run build
```

### 3. Run Visual Tests

```bash
npm run test:visual
```

If this is your first time, you'll need to generate baselines:

```bash
npm run test:visual:update
```

## 📋 Common Tasks

### Running Tests

```bash
# Run all visual tests
npm run test:visual

# Run with interactive UI
npm run test:visual:ui

# Run on specific browser
npm run test:visual -- --project=chromium
```

### Updating Baselines

When you intentionally change the visual appearance:

```bash
# Update all baselines
npm run test:visual:update

# Update specific test
npm run test:visual:update -- --grep "menu screen"
```

### Debugging Failures

```bash
# View test report with visual diffs
npx playwright show-report

# Run tests in headed mode (see browser)
npm run test:visual -- --headed

# Debug specific test
npm run test:visual:ui
```

## 🔍 Understanding Test Results

### ✅ Test Passes
Screenshot matches baseline (within tolerance)

### ❌ Test Fails
Visual differences detected:
1. Review the diff in HTML report
2. Decide if change is intentional
3. Update baseline if intentional, or fix the bug

## 💡 Tips

### Reduce Flakiness

Visual tests can be flaky. Our tests:
- Disable animations
- Wait for network idle
- Allow small pixel differences

### When to Update Baselines

Update baselines when:
- ✅ You intentionally changed UI/styling
- ✅ You added new visual features
- ✅ You fixed a visual bug
- ❌ NOT when tests randomly fail

### Debugging Tips

```bash
# See what changed
npx playwright show-report

# Run one test at a time
npm run test:visual -- --grep "menu screen"

# Increase tolerance temporarily
# Edit test to add: maxDiffPixels: 500
```

## 📝 Best Practices

1. **Run tests before committing**
   ```bash
   npm run test:visual
   ```

2. **Review diffs carefully**
   - Don't blindly update baselines
   - Understand what changed and why

3. **Commit baselines with code**
   ```bash
   git add tests/e2e/visual.spec.ts-snapshots/
   git commit -m "Update visual baselines for button redesign"
   ```

4. **Test on multiple viewports**
   - Mobile, tablet, desktop tests are included
   - Ensures responsive design

5. **Keep tests fast**
   - Focus on critical user journeys
   - Don't screenshot every pixel

## 🐛 Troubleshooting

### "Browsers not installed"

```bash
npx playwright install chromium
```

### "Port 4173 already in use"

Kill the preview server:
```bash
pkill -f "vite preview"
```

### Tests fail in CI but pass locally

- Fonts may render differently
- Timing issues
- Adjust `maxDiffPixels` in test config

### Baseline doesn't exist

First run needs to generate baselines:
```bash
npm run test:visual:update
```

## 🤝 Contributing

Before submitting a PR with visual changes:

1. ✅ Run visual tests locally
2. ✅ Update baselines if needed
3. ✅ Commit baseline screenshots
4. ✅ Document what changed in PR

## 📚 Learn More

- [VISUAL_TESTING.md](./VISUAL_TESTING.md) - Comprehensive guide
- [Playwright Docs](https://playwright.dev/docs/test-snapshots) - Official documentation
- [tests/e2e/visual.spec.ts](./tests/e2e/visual.spec.ts) - Test source code

## 🆘 Need Help?

- Check test report: `npx playwright show-report`
- Read full guide: [VISUAL_TESTING.md](./VISUAL_TESTING.md)
- Open an issue on GitHub
