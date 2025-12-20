#!/usr/bin/env node
/**
 * UI Icon Generator - Manifest-based, idempotent icon generation
 * Only generates missing icons, can be run multiple times safely
 */

import { openai } from '@ai-sdk/openai';
import { experimental_generateImage as generateImage } from 'ai';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ICONS_DIR = join(process.cwd(), 'public', 'icons');
const MANIFEST_PATH = join(ICONS_DIR, 'manifest.json');

interface IconConfig {
  name: string;
  prompt: string;
  filename: string;
  size: '1024x1024';
  category: 'mode' | 'hud' | 'menu';
}

interface IconManifest {
  version: string;
  generated: string;
  icons: {
    [key: string]: {
      name: string;
      category: string;
      generated: string;
      size: number;
    };
  };
}

const ICON_MANIFEST: IconConfig[] = [
  // Game Mode Icons
  {
    name: 'Rapid Rush Mode',
    prompt:
      'Cute cartoon otter mascot running fast through blue water with dynamic splash, vibrant colors, circular icon badge design, playful energetic style, clean simple design for mobile game UI, icon illustration',
    filename: 'mode-rapid-rush.png',
    size: '1024x1024',
    category: 'mode',
  },
  {
    name: 'Speed Splash Mode',
    prompt:
      'Stopwatch timer icon with blue water droplets and splashes, orange and blue color scheme, fast motion lines, circular icon badge design, energetic feel, clean simple design for mobile game UI',
    filename: 'mode-speed-splash.png',
    size: '1024x1024',
    category: 'mode',
  },
  {
    name: 'Chill Cruise Mode',
    prompt:
      'Relaxed cartoon otter floating peacefully on calm water, serene expression, gentle ripples, soft pastel blue and green colors, circular icon badge design, zen peaceful meditation style, clean simple design for mobile game UI',
    filename: 'mode-chill-cruise.png',
    size: '1024x1024',
    category: 'mode',
  },
  {
    name: 'Daily Dive Mode',
    prompt:
      'Calendar icon with water splash effect and cartoon otter diving, daily challenge theme, vibrant colorful design with blue and orange, circular icon badge design, exciting dynamic feel, clean simple design for mobile game UI',
    filename: 'mode-daily-dive.png',
    size: '1024x1024',
    category: 'mode',
  },

  // HUD Icons - Small, high contrast
  {
    name: 'Score Star',
    prompt:
      'Bright golden yellow star icon with sparkles and water droplets, shiny glossy effect, simple clean design readable at small sizes, game UI icon for score display',
    filename: 'hud-star.png',
    size: '1024x1024',
    category: 'hud',
  },
  {
    name: 'Distance Meter',
    prompt:
      'Small cartoon otter silhouette running, side view profile, simple clean design, blue color, readable at tiny sizes, game UI icon for distance counter',
    filename: 'hud-distance.png',
    size: '1024x1024',
    category: 'hud',
  },
  {
    name: 'Coin Currency',
    prompt:
      'Shiny gold coin with otter paw print embossed on surface, sparkling highlights, simple clean design readable at small sizes, game currency icon',
    filename: 'hud-coin.png',
    size: '1024x1024',
    category: 'hud',
  },
  {
    name: 'Gem Premium Currency',
    prompt:
      'Brilliant blue gemstone crystal, diamond faceted cut, sparkling highlights, simple clean design readable at small sizes, premium game currency icon',
    filename: 'hud-gem.png',
    size: '1024x1024',
    category: 'hud',
  },
  {
    name: 'Heart Life',
    prompt:
      'Cute cartoon heart with water droplet texture pattern, bright red color, glossy shiny effect, simple clean design readable at small sizes, life counter health icon',
    filename: 'hud-heart.png',
    size: '1024x1024',
    category: 'hud',
  },

  // Menu Icons
  {
    name: 'Leaderboard Trophy',
    prompt:
      'Golden trophy cup with cute otter ears on top, victory celebration theme, shiny metallic gold, game leaderboard icon, clean simple design for menu button',
    filename: 'menu-leaderboard.png',
    size: '1024x1024',
    category: 'menu',
  },
  {
    name: 'Stats Chart',
    prompt:
      'Bar chart statistics graph with water wave theme, blue and orange color bars, game stats icon, clean simple design for menu button',
    filename: 'menu-stats.png',
    size: '1024x1024',
    category: 'menu',
  },
  {
    name: 'Settings Gear',
    prompt:
      'Mechanical gear cog icon with water droplets, blue-gray metallic color, game settings icon, clean simple design for menu button',
    filename: 'menu-settings.png',
    size: '1024x1024',
    category: 'menu',
  },
];

function loadManifest(): IconManifest {
  if (!existsSync(MANIFEST_PATH)) {
    return {
      version: '1.0.0',
      generated: new Date().toISOString(),
      icons: {},
    };
  }
  return JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
}

function saveManifest(manifest: IconManifest): void {
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

function iconExists(filename: string, manifest: IconManifest): boolean {
  const filepath = join(ICONS_DIR, filename);
  return existsSync(filepath) && manifest.icons[filename] !== undefined;
}

async function generateIcon(
  config: IconConfig,
  manifest: IconManifest
): Promise<boolean> {
  const filepath = join(ICONS_DIR, config.filename);

  // Skip if already exists and in manifest
  if (iconExists(config.filename, manifest)) {
    return false;
  }

  try {
    const result = await generateImage({
      model: openai.image('dall-e-3'),
      prompt: config.prompt,
      size: config.size,
    });

    const base64Data = result.image.base64;
    const buffer = Buffer.from(base64Data, 'base64');

    writeFileSync(filepath, buffer);

    // Update manifest
    manifest.icons[config.filename] = {
      name: config.name,
      category: config.category,
      generated: new Date().toISOString(),
      size: buffer.length,
    };
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to generate ${config.name}:`, error);
    return false;
  }
}

async function main() {
  // Ensure directory exists
  if (!existsSync(ICONS_DIR)) {
    mkdirSync(ICONS_DIR, { recursive: true });
  }

  // Load existing manifest
  const manifest = loadManifest();

  // Determine what needs to be generated
  const toGenerate = ICON_MANIFEST.filter(
    (config) => !iconExists(config.filename, manifest)
  );
  const _skipped = ICON_MANIFEST.length - toGenerate.length;

  if (toGenerate.length === 0) {
    return;
  }

  // Generate missing icons
  let _generated = 0;
  let _failed = 0;

  for (const config of toGenerate) {
    const success = await generateIcon(config, manifest);
    if (success) {
      _generated++;
      saveManifest(manifest);
      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } else {
      _failed++;
    }
  }
}

main().catch(console.error);
