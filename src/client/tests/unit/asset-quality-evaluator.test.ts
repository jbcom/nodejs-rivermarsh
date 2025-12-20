/**
 * Test suite for asset-quality-evaluator functions
 */

import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

/**
 * Check if image has any transparency
 * This is the optimized version using sharp.stats()
 */
async function hasTransparency(buffer: Buffer): Promise<boolean> {
  const stats = await sharp(buffer).stats();
  // The alpha channel is the 4th channel (index 3).
  // If it exists and its minimum value is less than 255, the image has transparency.
  return stats.channels.length > 3 && stats.channels[3].min < 255;
}

describe('hasTransparency', () => {
  it('should return false for image without alpha channel (RGB)', async () => {
    // Create a simple RGB image (no alpha channel)
    const buffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .png()
      .toBuffer();

    const result = await hasTransparency(buffer);
    expect(result).toBe(false);
  });

  it('should return false for fully opaque RGBA image', async () => {
    // Create an RGBA image with all pixels fully opaque (alpha = 255)
    const buffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 1 }, // alpha: 1 means fully opaque
      },
    })
      .png()
      .toBuffer();

    const result = await hasTransparency(buffer);
    expect(result).toBe(false);
  });

  it('should return true for image with full transparency', async () => {
    // Create an RGBA image with all pixels fully transparent (alpha = 0)
    const buffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 0 }, // alpha: 0 means fully transparent
      },
    })
      .png()
      .toBuffer();

    const result = await hasTransparency(buffer);
    expect(result).toBe(true);
  });

  it('should return true for image with partial transparency', async () => {
    // Create an RGBA image with partial transparency (alpha = 0.5)
    const buffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 0.5 }, // alpha: 0.5 means semi-transparent
      },
    })
      .png()
      .toBuffer();

    const result = await hasTransparency(buffer);
    expect(result).toBe(true);
  });

  it('should return true for image where even one pixel has transparency', async () => {
    // Create a mostly opaque image with one transparent pixel using raw pixel data
    const width = 10;
    const height = 10;
    const channels = 4;

    // Create raw pixel data - all red pixels (255, 0, 0, 255) except first pixel which is transparent
    const pixelData = Buffer.alloc(width * height * channels);

    for (let i = 0; i < width * height; i++) {
      const offset = i * channels;
      pixelData[offset] = 255; // R
      pixelData[offset + 1] = 0; // G
      pixelData[offset + 2] = 0; // B
      pixelData[offset + 3] = 255; // A - fully opaque
    }

    // Make the first pixel transparent
    pixelData[3] = 0; // Set alpha of first pixel to 0

    const buffer = await sharp(pixelData, {
      raw: {
        width,
        height,
        channels,
      },
    })
      .png()
      .toBuffer();

    const result = await hasTransparency(buffer);
    expect(result).toBe(true);
  });

  it('should handle large images efficiently', async () => {
    // Create a large image to test performance
    const largeBuffer = await sharp({
      create: {
        width: 2000,
        height: 2000,
        channels: 4,
        background: { r: 100, g: 150, b: 200, alpha: 0.8 },
      },
    })
      .png()
      .toBuffer();

    const startTime = Date.now();
    const result = await hasTransparency(largeBuffer);
    const endTime = Date.now();

    expect(result).toBe(true);
    // The stats() approach should complete in a reasonable time even on slower systems
    expect(endTime - startTime).toBeLessThan(5000); // Less than 5 seconds (generous for CI)
  });
});
