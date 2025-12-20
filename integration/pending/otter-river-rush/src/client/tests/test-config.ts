/**
 * Test Configuration - Wellsprings from Runtime Constants
 * SINGLE SOURCE OF TRUTH for both testing and runtime
 */

import {
  FLOW,
  getLaneX,
  getModelScale,
  PHYSICS,
  VISUAL,
} from '../src/config/visual-constants';

/**
 * Test Fixtures - Use EXACT runtime values
 * Any change to visual-constants automatically updates tests
 */
export const TEST_CONFIG = {
  // Direct re-export of runtime constants
  visual: VISUAL,
  physics: PHYSICS,
  flow: FLOW,
  helpers: {
    getLaneX,
    getModelScale,
  },

  // Test-specific values derived from runtime
  expectations: {
    // Camera should match runtime exactly
    camera: {
      position: VISUAL.camera.position,
      zoom: VISUAL.camera.zoom,
    },

    // Entity scales should match runtime
    scales: {
      otter: getModelScale('otter'), // Must be 2.0
      rock: getModelScale('rock'), // Must be 1.5
      coin: getModelScale('coin'), // Must be 0.8
      gem: getModelScale('gem'), // Must be 1.0
    },

    // Positions should match runtime
    positions: {
      playerY: VISUAL.positions.player, // Must be -3
      spawnY: VISUAL.positions.spawnY, // Must be 8
      despawnY: VISUAL.positions.despawnY, // Must be -10
    },

    // Lane positions should match runtime
    lanes: {
      left: getLaneX(-1), // Must be -2
      center: getLaneX(0), // Must be 0
      right: getLaneX(1), // Must be 2
    },

    // Performance thresholds
    performance: {
      minFPS: 60,
      maxFrameTime: 16.67, // 60 FPS
    },
  },

  // Test URLs - derived from environment
  urls: {
    local:
      process.env.VITE_DEV_SERVER_URL ||
      'http://localhost:5173/otter-river-rush/',
    deployed:
      process.env.BASE_URL ||
      process.env.PLAYWRIGHT_TEST_BASE_URL ||
      'https://jbcom.github.io/otter-river-rush/',
  },
} as const;

/**
 * Validation: Ensure test expectations match runtime
 * Run this in CI to catch configuration drift
 */
export function validateTestRuntimeAlignment() {
  const errors: string[] = [];

  // Verify scales
  if (TEST_CONFIG.expectations.scales.otter !== 2.0) {
    errors.push(
      `Otter scale mismatch: expected 2.0, got ${TEST_CONFIG.expectations.scales.otter}`
    );
  }

  // Verify positions
  if (TEST_CONFIG.expectations.positions.playerY !== -3) {
    errors.push(
      `Player Y mismatch: expected -3, got ${TEST_CONFIG.expectations.positions.playerY}`
    );
  }

  // Verify lanes
  if (TEST_CONFIG.expectations.lanes.left !== -2) {
    errors.push(
      `Left lane mismatch: expected -2, got ${TEST_CONFIG.expectations.lanes.left}`
    );
  }

  if (errors.length > 0) {
    throw new Error(`Test/Runtime alignment broken:\n${errors.join('\n')}`);
  }

  return true;
}

// Validate on import
validateTestRuntimeAlignment();
