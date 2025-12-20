import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0, // Reduced from 2 to 1 for speed
  workers: process.env['CI'] ? 2 : undefined, // Increased from 1 to 2 for speed
  reporter: 'list',
  timeout: 30000, // 30s per test (default is 30s anyway)
  use: {
    baseURL: process.env['BASE_URL'] || 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure', // Record video for failures (AI tests override to 'on')
    actionTimeout: 10000, // 10s for actions
  },
  // Visual testing specific settings
  expect: {
    toHaveScreenshot: {
      // Maximum number of pixels that can differ
      maxDiffPixels: 100,
      // Threshold for color difference (0-1)
      threshold: 0.2,
      // Animation handling
      animations: 'disabled',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-video',
      use: {
        ...devices['Desktop Chrome'],
        video: 'on', // Always record video
      },
      testMatch: '**/ai-playthrough.spec.ts', // Only for AI playthrough tests
    },
    // Mobile and Tablet profiles for cross-device coverage (executed locally by default)
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'tablet-ipad',
      use: { ...devices['iPad Pro 11'] },
    },
  ],
  webServer: process.env['BASE_URL']
    ? undefined
    : {
        command: 'npm run preview',
        port: 4173,
        reuseExistingServer: !process.env['CI'],
      },
});
