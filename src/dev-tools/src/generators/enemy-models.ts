#!/usr/bin/env tsx

/**
 * Enemy Model Generator - Generates 3D models for all enemies
 * Called automatically by generate-content.ts
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { TextTo3DAPI } from '../meshy/text_to_3d';

const OUTPUT_DIR = join(process.cwd(), 'src/client/public/models');

async function generateEnemyModels() {
  // Read enemy definitions from generated file
  const defPath = join(
    process.cwd(),
    'src/client/src/game/data/enemy-definitions.ts'
  );
  const content = readFileSync(defPath, 'utf-8');
  const match = content.match(
    /export const ENEMY_DEFINITIONS = (\[[\s\S]*?\]);/
  );
  if (!match) {
    return;
  }

  const ENEMY_DEFINITIONS = JSON.parse(match[1]);

  const apiKey = process.env.MESHY_API_KEY;
  if (!apiKey) {
    return;
  }

  const client = new TextTo3DAPI(apiKey);
  const results = [];

  for (const enemy of ENEMY_DEFINITIONS) {
    const outputPath = join(OUTPUT_DIR, `enemy-${enemy.id}.glb`);

    // Skip if already exists
    if (existsSync(outputPath)) {
      results.push({ id: enemy.id, status: 'cached', path: outputPath });
      continue;
    }

    const prompt = `${enemy.name}, ${enemy.description}. River creature for endless runner game. Style: stylized, game-ready, low-poly. Color: ${enemy.visual.color}. Size: ${enemy.visual.size}m. Suitable for mobile game.`;

    try {
      const result = await client.generateModel({
        prompt,
        artStyle: 'realistic',
        negativePrompt: 'text, watermark, blurry, low quality',
      });

      // Save model
      writeFileSync(outputPath, result.modelData);

      results.push({
        id: enemy.id,
        name: enemy.name,
        status: 'generated',
        path: outputPath,
        size: result.modelData.length,
      });
    } catch (error) {
      console.error(`❌ ${enemy.name}: Failed - ${error.message}`);
      results.push({
        id: enemy.id,
        name: enemy.name,
        status: 'failed',
        error: error.message,
      });
    }
  }

  // Write manifest
  const manifest = {
    generated: new Date().toISOString(),
    enemies: results,
    total: ENEMY_DEFINITIONS.length,
    success: results.filter(
      (r) => r.status === 'generated' || r.status === 'cached'
    ).length,
  };

  writeFileSync(
    join(OUTPUT_DIR, 'enemy-models-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  return manifest;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateEnemyModels().catch(console.error);
}

export { generateEnemyModels };
