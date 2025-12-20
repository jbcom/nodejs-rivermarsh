/**
 * Asset path utilities
 * Handles base URL prefixing for production builds
 */

/**
 * Get the proper asset path with base URL prefix
 * @param path - Relative path to asset (e.g., '/icons/coin.png')
 * @returns Full path including base URL
 */
export function getAssetPath(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // In development, base URL is typically '/'
  // In production (GitHub Pages), it's '/otter-river-rush/'
  const baseUrl = import.meta.env.BASE_URL || '/';

  // Combine base URL with path
  return `${baseUrl}${cleanPath}`;
}

/**
 * Get icon asset path
 */
export function getIconPath(filename: string): string {
  return getAssetPath(`icons/${filename}`);
}

/**
 * Get HUD asset path
 */
export function getHudPath(filename: string): string {
  return getAssetPath(`hud/${filename}`);
}

// Sprites removed - we use GLB 3D models exclusively

/**
 * Get model asset path
 */
export function getModelPath(filename: string): string {
  return getAssetPath(`models/${filename}`);
}

/**
 * Get all asset URLs with proper base path
 */
export const ASSET_URLS = {
  MODELS: {
    OTTER: getModelPath('otter-rusty.glb'),
    ROCK_RIVER: getModelPath('rock-river.glb'),
    ROCK_MOSSY: getModelPath('rock-mossy.glb'),
    ROCK_CRACKED: getModelPath('rock-cracked.glb'),
    ROCK_CRYSTAL: getModelPath('rock-crystal.glb'),
    COIN: getModelPath('coin-gold.glb'),
    GEM_RED: getModelPath('gem-red.glb'),
  },
  ANIMATIONS: {
    OTTER_IDLE: getModelPath('otter-rusty.glb'),
    OTTER_WALK: getModelPath('otter-rusty-walk.glb'),
    OTTER_RUN: getModelPath('otter-rusty-run.glb'),
    OTTER_JUMP: getModelPath('otter-rusty-jump.glb'),
    OTTER_COLLECT: getModelPath('otter-rusty-collect.glb'),
    OTTER_HIT: getModelPath('otter-rusty-hit.glb'),
    OTTER_DEATH: getModelPath('otter-rusty-death.glb'),
    OTTER_VICTORY: getModelPath('otter-rusty-victory.glb'),
    OTTER_HAPPY: getModelPath('otter-rusty-happy.glb'),
    OTTER_DODGE_LEFT: getModelPath('otter-rusty-dodge-left.glb'),
    OTTER_DODGE_RIGHT: getModelPath('otter-rusty-dodge-right.glb'),
  },
  // SPRITES kept for HUD/UI icons only if needed; gameplay entities use GLB models
  HUD: {
    HEART: getHudPath('heart-icon.png'),
    COIN_PANEL: getHudPath('coin-panel.png'),
    ACHIEVEMENT_BADGE: getHudPath('achievement-badge.png'),
    PAUSE_BUTTON: getHudPath('pause-button.png'),
  },
} as const;
