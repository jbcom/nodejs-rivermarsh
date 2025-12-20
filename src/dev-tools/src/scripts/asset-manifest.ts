#!/usr/bin/env node
/**
 * Asset Manifest System - Comprehensive asset tracking with quality metrics
 * This is the central registry for ALL game assets
 */

export interface QualityMetrics {
  // File metrics
  fileSize: number; // bytes
  fileSizeKB: number;

  // Image metrics
  width: number;
  height: number;
  aspectRatio: number;
  format: string;

  // Quality checks
  hasTransparency: boolean;
  hasWhiteBackground: boolean; // BAD - should be transparent
  isDistorted: boolean; // Aspect ratio doesn't match expected
  isUndersized: boolean; // Smaller than minimum required
  isOversized: boolean; // Unnecessarily large file

  // Computed quality score
  qualityScore: number; // 0-100, 100 = perfect
  issues: string[];

  // Generation metadata
  lastGenerated?: Date;
  generationMethod?: 'ai' | 'manual' | 'placeholder';
  needsRegeneration: boolean;
}

export interface AssetDefinition {
  id: string;
  category: 'sprite' | 'hud' | 'icon' | 'pwa' | 'ui';
  name: string;
  description: string;

  // File location
  path: string; // relative to public/

  // Expected specifications
  expectedSize: { width: number; height: number };
  expectedFormat: 'png' | 'ico' | 'webp' | 'jpg';
  maxFileSizeKB: number;
  requiresTransparency: boolean;

  // Generation config
  aiPrompt?: string;
  aiModel?: 'gpt-image-1' | 'dall-e-3' | 'stable-diffusion';
  canBeGenerated: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';

  // Current quality
  currentQuality?: QualityMetrics;
}

/**
 * Complete asset manifest for Otter River Rush
 */
export const ASSET_MANIFEST: AssetDefinition[] = [
  // ============================================================================
  // GAME SPRITES - The core game visuals
  // ============================================================================
  {
    id: 'otter-normal',
    category: 'sprite',
    name: 'Otter (Normal)',
    description: 'Main playable character in swimming position',
    path: 'sprites/otter.png',
    expectedSize: { width: 512, height: 512 },
    expectedFormat: 'png',
    maxFileSizeKB: 100,
    requiresTransparency: true,
    aiPrompt:
      'Cute cartoon otter character for a river game, swimming position, playful expression, simple design, vibrant colors, transparent PNG background, game sprite style, clean edges, 512x512',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'critical',
  },
  {
    id: 'otter-shield',
    category: 'sprite',
    name: 'Otter (Shield)',
    description: 'Otter with protective shield power-up active',
    path: 'sprites/otter-shield.png',
    expectedSize: { width: 512, height: 512 },
    expectedFormat: 'png',
    maxFileSizeKB: 150,
    requiresTransparency: true,
    aiPrompt:
      'Cute cartoon otter character with a glowing blue magical shield bubble around it, swimming position, protected look, vibrant colors, transparent PNG background, game sprite style, 512x512',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },

  // Rock obstacles
  {
    id: 'rock-1',
    category: 'sprite',
    name: 'Rock Obstacle 1',
    description: 'Smooth river rock obstacle',
    path: 'sprites/rock-1.png',
    expectedSize: { width: 256, height: 256 },
    expectedFormat: 'png',
    maxFileSizeKB: 80,
    requiresTransparency: true,
    aiPrompt:
      'Smooth river rock obstacle, gray stone with moss, simple geometric shape, game sprite style, transparent PNG background, top-down view, clean edges, 256x256',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'critical',
  },
  {
    id: 'rock-2',
    category: 'sprite',
    name: 'Rock Obstacle 2',
    description: 'Jagged river rock obstacle',
    path: 'sprites/rock-2.png',
    expectedSize: { width: 256, height: 256 },
    expectedFormat: 'png',
    maxFileSizeKB: 80,
    requiresTransparency: true,
    aiPrompt:
      'Jagged river rock obstacle, dark gray stone, angular shape, game sprite style, transparent PNG background, top-down view, slightly different from first rock, 256x256',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'critical',
  },
  {
    id: 'rock-3',
    category: 'sprite',
    name: 'Rock Obstacle 3',
    description: 'Rounded boulder obstacle',
    path: 'sprites/rock-3.png',
    expectedSize: { width: 256, height: 256 },
    expectedFormat: 'png',
    maxFileSizeKB: 80,
    requiresTransparency: true,
    aiPrompt:
      'Rounded boulder obstacle, light gray with cracks, game sprite style, transparent PNG background, top-down view, distinct shape variation, 256x256',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'critical',
  },

  // Collectibles
  {
    id: 'coin',
    category: 'sprite',
    name: 'Coin',
    description: 'Golden coin collectible',
    path: 'sprites/coin.png',
    expectedSize: { width: 128, height: 128 },
    expectedFormat: 'png',
    maxFileSizeKB: 50,
    requiresTransparency: true,
    aiPrompt:
      'Shiny golden coin collectible, circular, gleaming effect, simple game icon style, transparent PNG background, sparkle effect, clean edges, 128x128',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },
  {
    id: 'gem-blue',
    category: 'sprite',
    name: 'Blue Gem',
    description: 'Rare blue gem collectible',
    path: 'sprites/gem-blue.png',
    expectedSize: { width: 128, height: 128 },
    expectedFormat: 'png',
    maxFileSizeKB: 50,
    requiresTransparency: true,
    aiPrompt:
      'Beautiful blue gem diamond collectible, faceted crystal, glowing effect, game icon style, transparent PNG background, magical sparkle, 128x128',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },
  {
    id: 'gem-red',
    category: 'sprite',
    name: 'Red Gem',
    description: 'Rare red ruby collectible',
    path: 'sprites/gem-red.png',
    expectedSize: { width: 128, height: 128 },
    expectedFormat: 'png',
    maxFileSizeKB: 50,
    requiresTransparency: true,
    aiPrompt:
      'Beautiful red ruby gem collectible, faceted crystal, glowing effect, game icon style, transparent PNG background, valuable appearance, 128x128',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },

  // Power-ups
  {
    id: 'powerup-shield',
    category: 'sprite',
    name: 'Shield Power-up',
    description: 'Shield protection power-up',
    path: 'sprites/powerup-shield.png',
    expectedSize: { width: 128, height: 128 },
    expectedFormat: 'png',
    maxFileSizeKB: 50,
    requiresTransparency: true,
    aiPrompt:
      'Blue shield icon power-up, glowing magical shield symbol, game power-up style, transparent PNG background, bright colors, circular base, 128x128',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },
  {
    id: 'powerup-speed',
    category: 'sprite',
    name: 'Speed Boost Power-up',
    description: 'Speed/control boost power-up',
    path: 'sprites/powerup-speed.png',
    expectedSize: { width: 128, height: 128 },
    expectedFormat: 'png',
    maxFileSizeKB: 50,
    requiresTransparency: true,
    aiPrompt:
      'Yellow lightning bolt icon power-up, energy effect, speed boost symbol, game power-up style, transparent PNG background, dynamic appearance, 128x128',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },
  {
    id: 'powerup-multiplier',
    category: 'sprite',
    name: 'Score Multiplier Power-up',
    description: 'Score multiplier power-up',
    path: 'sprites/powerup-multiplier.png',
    expectedSize: { width: 128, height: 128 },
    expectedFormat: 'png',
    maxFileSizeKB: 50,
    requiresTransparency: true,
    aiPrompt:
      'Green star with x2 symbol power-up icon, score multiplier indicator, game power-up style, transparent PNG background, vibrant colors, 128x128',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },
  {
    id: 'powerup-magnet',
    category: 'sprite',
    name: 'Magnet Power-up',
    description: 'Coin magnet power-up',
    path: 'sprites/powerup-magnet.png',
    expectedSize: { width: 128, height: 128 },
    expectedFormat: 'png',
    maxFileSizeKB: 50,
    requiresTransparency: true,
    aiPrompt:
      'Purple horseshoe magnet icon power-up, attractive force symbol, game power-up style, transparent PNG background, magical effect, 128x128',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },

  // VFX
  {
    id: 'splash',
    category: 'sprite',
    name: 'Water Splash',
    description: 'Water splash particle effect',
    path: 'sprites/splash.png',
    expectedSize: { width: 256, height: 256 },
    expectedFormat: 'png',
    maxFileSizeKB: 80,
    requiresTransparency: true,
    aiPrompt:
      'Water splash effect, dynamic droplets, white and blue water spray, game VFX sprite, transparent PNG background, impact effect, 256x256',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'medium',
  },
  {
    id: 'water-ripple',
    category: 'sprite',
    name: 'Water Ripple',
    description: 'Water ripple particle effect',
    path: 'sprites/water-ripple.png',
    expectedSize: { width: 256, height: 256 },
    expectedFormat: 'png',
    maxFileSizeKB: 80,
    requiresTransparency: true,
    aiPrompt:
      'Water ripple effect, circular wave pattern, translucent blue, game sprite overlay, transparent PNG background, subtle animation frame, 256x256',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'medium',
  },

  // ============================================================================
  // HUD ELEMENTS - On-screen UI
  // ============================================================================
  {
    id: 'splash-screen',
    category: 'hud',
    name: 'Splash Screen',
    description: 'Game title/loading screen',
    path: 'hud/splash-screen.png',
    expectedSize: { width: 1920, height: 1080 },
    expectedFormat: 'png',
    maxFileSizeKB: 400,
    requiresTransparency: false,
    aiPrompt:
      'Otter River Rush game title screen, cute otter surfing on water, vibrant cartoon style, blue river background, playful logo design, game art, bright colors, professional mobile game splash screen, 1920x1080',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },
  {
    id: 'heart-icon',
    category: 'hud',
    name: 'Heart/Life Icon',
    description: 'Player life indicator',
    path: 'hud/heart-icon.png',
    expectedSize: { width: 128, height: 128 },
    expectedFormat: 'png',
    maxFileSizeKB: 50,
    requiresTransparency: true,
    aiPrompt:
      'Cute red heart icon for game UI, simple clean design, slight 3D effect, game HUD element, transparent background, 128x128',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },
  {
    id: 'coin-panel',
    category: 'hud',
    name: 'Coin Counter Panel',
    description: 'Background panel for coin display',
    path: 'hud/coin-panel.png',
    expectedSize: { width: 256, height: 128 },
    expectedFormat: 'png',
    maxFileSizeKB: 80,
    requiresTransparency: true,
    aiPrompt:
      'Small rounded rectangle UI panel for coin counter, wood texture, game HUD element, slightly transparent, warm brown color, 256x128',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'medium',
  },
  {
    id: 'pause-button',
    category: 'hud',
    name: 'Pause Button',
    description: 'Pause game button',
    path: 'hud/pause-button.png',
    expectedSize: { width: 128, height: 128 },
    expectedFormat: 'png',
    maxFileSizeKB: 50,
    requiresTransparency: true,
    aiPrompt:
      'Pause button icon for mobile game, two vertical bars, circular blue background, glossy effect, game UI button, 128x128',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },
  {
    id: 'play-button',
    category: 'hud',
    name: 'Play Button',
    description: 'Start/resume game button',
    path: 'hud/play-button.png',
    expectedSize: { width: 128, height: 128 },
    expectedFormat: 'png',
    maxFileSizeKB: 50,
    requiresTransparency: true,
    aiPrompt:
      'Play button icon for mobile game, triangle play symbol, circular green background, glossy effect, game UI button, 128x128',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },
  {
    id: 'settings-button',
    category: 'hud',
    name: 'Settings Button',
    description: 'Open settings menu',
    path: 'hud/settings-button.png',
    expectedSize: { width: 128, height: 128 },
    expectedFormat: 'png',
    maxFileSizeKB: 50,
    requiresTransparency: true,
    aiPrompt:
      'Settings gear icon for mobile game, circular gray background, modern clean design, game UI button, 128x128',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },
  {
    id: 'achievement-badge',
    category: 'hud',
    name: 'Achievement Badge',
    description: 'Achievement unlock notification',
    path: 'hud/achievement-badge.png',
    expectedSize: { width: 256, height: 256 },
    expectedFormat: 'png',
    maxFileSizeKB: 80,
    requiresTransparency: true,
    aiPrompt:
      'Golden star achievement badge, shiny metallic effect, ribbon banner, game UI element, celebration icon, 256x256',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'medium',
  },
  {
    id: 'levelup-banner',
    category: 'hud',
    name: 'Level Up Banner',
    description: 'Level up celebration banner',
    path: 'hud/levelup-banner.png',
    expectedSize: { width: 1024, height: 256 },
    expectedFormat: 'png',
    maxFileSizeKB: 400,
    requiresTransparency: true,
    aiPrompt:
      'Level up celebration banner, colorful confetti, golden text background, game UI victory element, wide banner format, 1024x256',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'medium',
  },

  // ============================================================================
  // PWA ICONS - Installation and system icons
  // ============================================================================
  {
    id: 'pwa-512',
    category: 'pwa',
    name: 'PWA Icon 512x512',
    description: 'Large PWA icon for installation',
    path: 'pwa-512x512.png',
    expectedSize: { width: 512, height: 512 },
    expectedFormat: 'png',
    maxFileSizeKB: 150,
    requiresTransparency: false,
    aiPrompt:
      'Otter River Rush app icon, cute otter face, blue circular background, simple clean design, mobile game icon style, 512x512',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'critical',
  },
  {
    id: 'pwa-192',
    category: 'pwa',
    name: 'PWA Icon 192x192',
    description: 'Standard PWA icon',
    path: 'pwa-192x192.png',
    expectedSize: { width: 192, height: 192 },
    expectedFormat: 'png',
    maxFileSizeKB: 50,
    requiresTransparency: false,
    aiPrompt:
      'Otter River Rush app icon, cute otter face, blue circular background, simple clean design, mobile game icon style, 192x192',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'critical',
  },
  {
    id: 'apple-touch-icon',
    category: 'pwa',
    name: 'Apple Touch Icon',
    description: 'iOS home screen icon',
    path: 'apple-touch-icon.png',
    expectedSize: { width: 180, height: 180 },
    expectedFormat: 'png',
    maxFileSizeKB: 50,
    requiresTransparency: false,
    aiPrompt:
      'Otter River Rush app icon, cute otter face, blue circular background, simple clean design, mobile game icon style, 180x180',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'critical',
  },
  {
    id: 'favicon',
    category: 'pwa',
    name: 'Favicon',
    description: 'Browser tab icon',
    path: 'favicon.ico',
    expectedSize: { width: 32, height: 32 },
    expectedFormat: 'ico',
    maxFileSizeKB: 10,
    requiresTransparency: false,
    canBeGenerated: true,
    priority: 'critical',
  },
];
