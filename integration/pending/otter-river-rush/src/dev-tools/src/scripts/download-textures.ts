#!/usr/bin/env node
/**
 * Texture Downloader - Gets CC0 textures from AmbientCG
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import https from 'https';
import { join } from 'path';

const TEXTURES_DIR = join(process.cwd(), 'public', 'textures');

if (!existsSync(TEXTURES_DIR)) {
  mkdirSync(TEXTURES_DIR, { recursive: true });
}

interface TextureConfig {
  name: string;
  ambientcgId: string;
  resolution: string;
  filename: string;
}

const TEXTURES: TextureConfig[] = [
  {
    name: 'Water 1',
    ambientcgId: 'Water001',
    resolution: '1K',
    filename: 'water-001.jpg',
  },
  {
    name: 'Water 2',
    ambientcgId: 'Water002',
    resolution: '1K',
    filename: 'water-002.jpg',
  },
  {
    name: 'Rock texture 1',
    ambientcgId: 'Rock035',
    resolution: '1K',
    filename: 'rock-texture-001.jpg',
  },
  {
    name: 'Rock texture 2',
    ambientcgId: 'Rock037',
    resolution: '1K',
    filename: 'rock-texture-002.jpg',
  },
  {
    name: 'Ground (riverbank)',
    ambientcgId: 'Ground037',
    resolution: '1K',
    filename: 'riverbank.jpg',
  },
];

async function _downloadTexture(config: TextureConfig): Promise<void> {
  // AmbientCG direct download URL format
  const _url = `https://ambientcg.com/get?file=${config.ambientcgId}_${config.resolution}-JPG.zip`;
}

async function main() {
  for (const _config of TEXTURES) {
    // Texture download logic removed as it's handled by download-ambientcg-textures.ts
  }
}

main().catch(console.error);
