#!/usr/bin/env node

/**
 * Icon Post-Processor - Resizes and converts generated icons to proper formats
 */

import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

const PUBLIC_DIR = join(process.cwd(), 'public');

// Image optimization quality settings
const IMAGE_QUALITY_TIERS = [
  { threshold: 300 * 1024, quality: 60 }, // For images > 300KB
  { threshold: 200 * 1024, quality: 70 }, // For images > 200KB
];
const NORMAL_IMAGE_QUALITY = 85;

interface IconTask {
  source: string;
  output: string;
  size: number;
  format?: 'png' | 'ico';
}

const ICON_TASKS: IconTask[] = [
  // PWA Icons - resize to proper dimensions
  {
    source: 'pwa-512x512.png',
    output: 'pwa-512x512.png',
    size: 512,
    format: 'png',
  },
  {
    source: 'pwa-192x192.png',
    output: 'pwa-192x192.png',
    size: 192,
    format: 'png',
  },
  {
    source: 'apple-touch-icon.png',
    output: 'apple-touch-icon.png',
    size: 180, // Apple recommends 180x180
    format: 'png',
  },
  // Favicon - multiple sizes for ICO
  {
    source: 'favicon-temp.png',
    output: 'favicon-16.png',
    size: 16,
    format: 'png',
  },
  {
    source: 'favicon-temp.png',
    output: 'favicon-32.png',
    size: 32,
    format: 'png',
  },
  {
    source: 'favicon-temp.png',
    output: 'favicon-48.png',
    size: 48,
    format: 'png',
  },
];

async function resizeIcon(task: IconTask): Promise<void> {
  const sourcePath = join(PUBLIC_DIR, task.source);
  const outputPath = join(PUBLIC_DIR, task.output);

  if (!existsSync(sourcePath)) {
    return;
  }

  try {
    // Use buffer to avoid file conflict
    const buffer = await sharp(sourcePath)
      .resize(task.size, task.size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
      })
      .png({ quality: 90, compressionLevel: 9 })
      .toBuffer();

    writeFileSync(outputPath, buffer);

    const _stats = await sharp(buffer).metadata();
  } catch (error) {
    console.error(`   ❌ Failed to process ${task.source}:`, error);
  }
}

async function createFaviconICO(): Promise<void> {
  const _sizes = [16, 32, 48];
  const _tempFiles: string[] = [];

  try {
    // Check if we have the favicon source
    const faviconSource = join(PUBLIC_DIR, 'favicon-temp.png');
    if (!existsSync(faviconSource)) {
      return;
    }

    // ICO format is complex, so we'll use a simpler approach:
    // Just use the 32x32 PNG as favicon.ico (modern browsers support PNG favicons)
    const favicon32 = join(PUBLIC_DIR, 'favicon-32.png');
    const faviconOutput = join(PUBLIC_DIR, 'favicon.ico');

    if (existsSync(favicon32)) {
      // Copy 32x32 as .ico (browsers will accept it)
      const buffer = readFileSync(favicon32);
      writeFileSync(faviconOutput, buffer);

      // Clean up temp files
      [
        'favicon-16.png',
        'favicon-32.png',
        'favicon-48.png',
        'favicon-temp.png',
      ].forEach((file) => {
        const path = join(PUBLIC_DIR, file);
        if (existsSync(path)) {
          unlinkSync(path);
        }
      });
    }
  } catch (error) {
    console.error('   ❌ Failed to create favicon.ico:', error);
  }
}

async function optimizeExistingImages(): Promise<void> {
  const imagesToOptimize = [
    // HUD images
    'hud/splash-screen.png',
    'hud/levelup-banner.png',
    'hud/achievement-badge.png',
    'hud/coin-panel.png',
    'hud/heart-icon.png',
    'hud/pause-button.png',
    'hud/play-button.png',
    'hud/settings-button.png',
    // UI Icons
    'icons/mode-rapid-rush.png',
    'icons/mode-speed-splash.png',
    'icons/mode-chill-cruise.png',
    'icons/mode-daily-dive.png',
    'icons/hud-star.png',
    'icons/hud-distance.png',
    'icons/hud-coin.png',
    'icons/hud-gem.png',
    'icons/hud-heart.png',
    'icons/menu-leaderboard.png',
    'icons/menu-stats.png',
    'icons/menu-settings.png',
    // Sprites
    'sprites/otter.png',
    'sprites/otter-shield.png',
    'sprites/coin.png',
    'sprites/gem-blue.png',
    'sprites/gem-red.png',
    'sprites/powerup-shield.png',
    'sprites/powerup-speed.png',
    'sprites/powerup-multiplier.png',
    'sprites/powerup-magnet.png',
    'sprites/splash.png',
    'sprites/water-ripple.png',
    'sprites/rock-1.png',
    'sprites/rock-2.png',
    'sprites/rock-3.png',
  ];

  for (const imagePath of imagesToOptimize) {
    const fullPath = join(PUBLIC_DIR, imagePath);
    if (!existsSync(fullPath)) {
      continue;
    }

    try {
      const originalSize = readFileSync(fullPath).length;

      // Use lower quality for larger images to reduce bundle size
      let quality = NORMAL_IMAGE_QUALITY;
      if (originalSize > IMAGE_QUALITY_TIERS[0].threshold) {
        quality = IMAGE_QUALITY_TIERS[0].quality; // Very large images
      } else if (originalSize > IMAGE_QUALITY_TIERS[1].threshold) {
        quality = IMAGE_QUALITY_TIERS[1].quality; // Large images
      }

      // Create optimized version
      const buffer = await sharp(fullPath)
        .png({ quality, compressionLevel: 9, effort: 10 })
        .toBuffer();

      writeFileSync(fullPath, buffer);
    } catch (error) {
      console.error(`   ❌ Failed to optimize ${imagePath}:`, error);
    }
  }
}

async function main() {
  for (const task of ICON_TASKS) {
    await resizeIcon(task);
  }

  // Step 2: Create proper favicon.ico
  await createFaviconICO();

  // Step 3: Optimize all existing images
  await optimizeExistingImages();
}

main().catch(console.error);
