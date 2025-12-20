#!/usr/bin/env node

/**
 * Idempotent Asset Processor
 *
 * This processor runs DURING asset generation (not after):
 * 1. Resizes assets to proper dimensions
 * 2. Converts to correct formats (PNG, ICO, WebP)
 * 3. Preserves transparency and aspect ratios
 * 4. Optimizes file sizes
 * 5. Detects and fixes quality issues
 * 6. IS IDEMPOTENT - can be run multiple times safely
 *
 * IMPORTANT: This runs as part of generation, BEFORE commit/push
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import sharp from 'sharp';
import type { AssetDefinition, QualityMetrics } from './asset-manifest.js';

const PUBLIC_DIR = join(process.cwd(), 'public');

export interface ProcessingOptions {
  forceResize?: boolean;
  targetFormat?: 'png' | 'webp' | 'jpg' | 'ico';
  quality?: number;
  preserveTransparency?: boolean;
  removeWhiteBackground?: boolean;
}

/**
 * Remove white background and make it transparent
 */
async function removeWhiteBackground(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .removeAlpha() // Remove existing alpha
    .ensureAlpha() // Add new alpha channel
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => {
      // Convert white pixels (RGB > 250) to transparent
      const channels = info.channels || 4;
      for (let i = 0; i < data.length; i += channels) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // If pixel is white-ish, make it transparent
        if (r > 250 && g > 250 && b > 250) {
          data[i + 3] = 0; // Set alpha to 0
        }
      }

      return sharp(data, {
        raw: {
          width: info.width,
          height: info.height,
          channels: channels,
        },
      })
        .png()
        .toBuffer();
    });
}

/**
 * Setup sharp processing pipeline with common operations
 */
async function setupPipeline(
  sourceBuffer: Buffer,
  asset: AssetDefinition,
  needsWhiteBackgroundRemoval: boolean,
  needsResize: boolean
): Promise<sharp.Sharp> {
  let pipeline = sharp(sourceBuffer);

  // Remove white background if requested
  if (needsWhiteBackgroundRemoval) {
    const cleaned = await removeWhiteBackground(sourceBuffer);
    pipeline = sharp(cleaned);
  }

  // Resize if needed (preserve aspect ratio)
  if (needsResize) {
    pipeline = pipeline.resize(
      asset.expectedSize.width,
      asset.expectedSize.height,
      {
        fit: 'contain',
        background: asset.requiresTransparency
          ? { r: 0, g: 0, b: 0, alpha: 0 }
          : { r: 255, g: 255, b: 255, alpha: 1 },
      }
    );
  }

  return pipeline;
}

/**
 * Apply format conversion to a sharp pipeline and return the output buffer.
 *
 * @param {sharp.Sharp} pipeline - The sharp processing pipeline to apply the format conversion to.
 * @param {'png' | 'webp' | 'jpg' | 'ico'} targetFormat - The desired output image format.
 * @param {number} quality - The quality setting for the output format (1-100).
 * @returns {Promise<Buffer>} A promise that resolves to the converted image buffer.
 */
async function applyFormatConversion(
  pipeline: sharp.Sharp,
  targetFormat: 'png' | 'webp' | 'jpg' | 'ico',
  quality: number
): Promise<Buffer> {
  switch (targetFormat) {
    case 'png':
      return pipeline
        .png({
          quality,
          compressionLevel: 9,
          effort: 10,
        })
        .toBuffer();

    case 'webp':
      return pipeline.webp({ quality, effort: 6 }).toBuffer();

    case 'jpg':
      return pipeline.jpeg({ quality }).toBuffer();

    case 'ico':
      // ICO creation is complex; using PNG format.
      // Resizing is handled by setupPipeline based on the asset manifest.
      return pipeline
        .png({ quality, compressionLevel: 9, effort: 10 })
        .toBuffer();

    default: {
      // This should be unreachable given the type of targetFormat
      const _exhaustiveCheck: never = targetFormat;
      throw new Error(`Unsupported format: ${targetFormat}`);
    }
  }
}

/**
 * Process a single asset with proper handling
 */
export async function processAsset(
  asset: AssetDefinition,
  options: ProcessingOptions = {}
): Promise<boolean> {
  const sourcePath = join(PUBLIC_DIR, asset.path);

  // Check if source exists
  if (!existsSync(sourcePath)) {
    console.error(`   ❌ Source file does not exist: ${sourcePath}`);
    return false;
  }

  try {
    const sourceBuffer = readFileSync(sourcePath);

    // Get current metadata
    const metadata = await sharp(sourceBuffer).metadata();
    const currentWidth = metadata.width || 0;
    const currentHeight = metadata.height || 0;

    // Determine if processing is needed
    const needsResize =
      options.forceResize ||
      currentWidth !== asset.expectedSize.width ||
      currentHeight !== asset.expectedSize.height;

    const needsFormatConversion =
      options.targetFormat && metadata.format !== options.targetFormat;

    const needsWhiteBackgroundRemoval =
      options.removeWhiteBackground && asset.requiresTransparency;

    // If no processing needed, skip
    if (
      !needsResize &&
      !needsFormatConversion &&
      !needsWhiteBackgroundRemoval
    ) {
      return true;
    }

    // Start sharp pipeline
    let pipeline = await setupPipeline(
      sourceBuffer,
      asset,
      needsWhiteBackgroundRemoval,
      needsResize
    );

    // Determine quality based on file size target
    const quality = options.quality || 85;

    // Convert format
    const targetFormat = options.targetFormat || asset.expectedFormat;
    let outputBuffer = await applyFormatConversion(
      pipeline,
      targetFormat,
      quality
    );

    // Check if output is too large
    const outputSizeKB = Math.round(outputBuffer.length / 1024);
    if (outputSizeKB > asset.maxFileSizeKB) {
      // Recalculate quality to hit target
      const targetQuality = Math.max(50, Math.floor(quality * 0.7));

      // Re-setup pipeline with lower quality
      pipeline = await setupPipeline(
        sourceBuffer,
        asset,
        needsWhiteBackgroundRemoval,
        needsResize
      );

      outputBuffer = await applyFormatConversion(
        pipeline,
        targetFormat,
        targetQuality
      );
    }

    // Ensure directory exists
    const outputDir = dirname(sourcePath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Write output
    writeFileSync(sourcePath, outputBuffer);

    const _finalSizeKB = Math.round(outputBuffer.length / 1024);

    return true;
  } catch (error) {
    console.error(`   ❌ Error processing asset: ${error}`);
    return false;
  }
}

/**
 * Process all assets in manifest
 */
export async function processAllAssets(
  manifest: AssetDefinition[],
  options: ProcessingOptions = {}
): Promise<void> {
  let _successCount = 0;
  let _failCount = 0;

  for (const asset of manifest) {
    const success = await processAsset(asset, {
      ...options,
      preserveTransparency: asset.requiresTransparency,
      removeWhiteBackground: asset.requiresTransparency,
    });

    if (success) {
      _successCount++;
    } else {
      _failCount++;
    }
  }
}

/**
 * Process only assets that need regeneration based on quality metrics
 */
export async function processDeficientAssets(
  manifest: AssetDefinition[],
  qualityMetrics: Map<string, QualityMetrics>
): Promise<void> {
  const deficientAssets = manifest.filter((asset) => {
    const quality = qualityMetrics.get(asset.id);
    return quality?.needsRegeneration;
  });

  if (deficientAssets.length === 0) {
    return;
  }
  deficientAssets.forEach((asset) => {
    const _quality = qualityMetrics.get(asset.id);
  });
  await processAllAssets(deficientAssets, {
    forceResize: true,
    removeWhiteBackground: true,
    quality: 85,
  });
}
