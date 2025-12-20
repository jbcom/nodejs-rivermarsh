#!/usr/bin/env tsx
/**
 * Download AmbientCG Textures
 * Downloads required PBR texture sets for terrain
 */

import chalk from 'chalk';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import fetch from 'node-fetch';
import ora from 'ora';
import { join } from 'path';
import { pipeline } from 'stream/promises';

const TEXTURES_TO_DOWNLOAD = [
  {
    id: 'Grass001',
    resolution: '1K',
    format: 'JPG',
    tags: ['grass', 'ground'],
  },
  {
    id: 'Rock024',
    resolution: '1K',
    format: 'JPG',
    tags: ['granite', 'mountain'],
  },
  { id: 'Rock022', resolution: '1K', format: 'JPG', tags: ['river', 'wet'] },
  {
    id: 'Ground037',
    resolution: '1K',
    format: 'JPG',
    tags: ['sand', 'desert'],
  },
  // Water002 doesn't exist on AmbientCG - using custom River component instead
];

const OUTPUT_DIR = join(process.cwd(), 'src/client/public/textures');

async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }
  const fileStream = createWriteStream(outputPath);
  // Node.js fetch returns a web ReadableStream which needs to be converted
  const { Readable } = await import('stream');
  const nodeStream = Readable.fromWeb(
    response.body as import('stream/web').ReadableStream
  );
  await pipeline(nodeStream, fileStream);
}

async function extractZip(zipPath: string, outputDir: string): Promise<void> {
  const AdmZip = (await import('adm-zip')).default;
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(outputDir, true);
}

async function downloadTexture(
  texture: (typeof TEXTURES_TO_DOWNLOAD)[0]
): Promise<void> {
  const spinner = ora(`Downloading ${texture.id}...`).start();

  try {
    const textureDir = join(OUTPUT_DIR, texture.id);
    if (!existsSync(textureDir)) {
      mkdirSync(textureDir, { recursive: true });
    }

    // Download URL from AmbientCG
    const fileName = `${texture.id}_${texture.resolution}-${texture.format}.zip`;
    const downloadUrl = `https://ambientcg.com/get?file=${encodeURIComponent(fileName)}`;
    const zipPath = join(textureDir, fileName);

    // Check if already downloaded
    const expectedFiles = [
      `${texture.id}_${texture.resolution}_Color.${texture.format.toLowerCase()}`,
      `${texture.id}_${texture.resolution}_NormalGL.${texture.format.toLowerCase()}`,
      `${texture.id}_${texture.resolution}_Roughness.${texture.format.toLowerCase()}`,
      `${texture.id}_${texture.resolution}_AmbientOcclusion.${texture.format.toLowerCase()}`,
    ];

    const allExist = expectedFiles.every((f) =>
      existsSync(join(textureDir, f))
    );
    if (allExist) {
      spinner.succeed(`${texture.id} already downloaded`);
      return;
    }

    // Download ZIP
    spinner.text = `Downloading ${texture.id} (${texture.resolution}-${texture.format})...`;
    await downloadFile(downloadUrl, zipPath);

    // Extract
    spinner.text = `Extracting ${texture.id}...`;
    await extractZip(zipPath, textureDir);

    // Clean up ZIP
    const fs = await import('fs/promises');
    await fs.unlink(zipPath);

    spinner.succeed(`${texture.id} downloaded and extracted`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    spinner.fail(`Failed to download ${texture.id}: ${message}`);
    throw error;
  }
}

async function main() {
  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Download all textures
  for (const texture of TEXTURES_TO_DOWNLOAD) {
    await downloadTexture(texture);
  }
}

main().catch(console.error);
