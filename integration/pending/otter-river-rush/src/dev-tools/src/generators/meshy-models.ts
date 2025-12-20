/**
 * Meshy 3D Model Generator for Otter River Rush
 * Generates game-ready 3D models with animations and texture variants
 */

import chalk from 'chalk';
import crypto from 'crypto';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import ora from 'ora';
import path from 'path';
import { MeshyAPI } from '../meshy/index.js';
import type { ModelAsset } from '../schemas/asset-manifest.js';

// When run from dev-tools workspace, go up to root then to client
const OUTPUT_DIR = path.resolve(
  process.cwd(),
  '../../src/client/public/models'
);
const API_KEY = process.env.MESHY_API_KEY;

if (!API_KEY) {
  console.error(chalk.red('❌ MESHY_API_KEY environment variable not set!'));
  process.exit(1);
}

interface ModelSpec {
  id: string;
  name: string;
  category: 'character' | 'obstacle' | 'collectible';
  prompt: string;
  artStyle: 'realistic' | 'cartoon' | 'anime' | 'sculpture';
  needsRigging: boolean;
  polycount: number;
  variants?: Array<{
    id: string;
    name: string;
    prompt: string;
  }>;
}

/**
 * Model specifications for Otter River Rush
 */
const MODEL_SPECS: ModelSpec[] = [
  {
    id: 'otter-rusty',
    name: 'Rusty the Otter',
    category: 'character',
    prompt:
      'cute otter character standing upright on two legs, wearing a small adventure vest, friendly expression, cartoon style, game-ready low-poly 3D model, smooth topology, T-pose for rigging',
    artStyle: 'sculpture',
    needsRigging: true,
    polycount: 8000,
  },
  {
    id: 'rock-river',
    name: 'River Rock',
    category: 'obstacle',
    prompt:
      'smooth river rock, rounded boulder, natural stone texture, game-ready low-poly 3D model, simple geometry',
    artStyle: 'realistic',
    needsRigging: false,
    polycount: 2000,
    variants: [
      {
        id: 'rock-mossy',
        name: 'Mossy River Rock',
        prompt:
          'smooth river rock covered in vibrant green moss and small plants, damp appearance',
      },
      {
        id: 'rock-cracked',
        name: 'Cracked River Rock',
        prompt:
          'weathered river rock with visible cracks and chips, aged stone texture',
      },
      {
        id: 'rock-crystal',
        name: 'Crystal River Rock',
        prompt:
          'river rock embedded with shiny purple and blue crystals, magical appearance',
      },
    ],
  },
  {
    id: 'coin-gold',
    name: 'Gold Coin',
    category: 'collectible',
    prompt:
      'shiny gold coin with otter paw print embossed on surface, game collectible, low-poly 3D model, metallic finish, cartoon style',
    artStyle: 'sculpture',
    needsRigging: false,
    polycount: 500,
  },
  // Commented out - Blue Gem keeps failing in refine stage
  // {
  //   id: 'gem-blue',
  //   name: 'Blue Gem',
  //   category: 'collectible',
  //   prompt: 'brilliant blue gemstone, faceted crystal, game collectible, low-poly 3D model, glowing appearance, stylized',
  //   artStyle: 'sculpture',
  //   needsRigging: false,
  //   polycount: 300,
  // },
  {
    id: 'gem-red',
    name: 'Red Gem',
    category: 'collectible',
    prompt:
      'brilliant red ruby gemstone, faceted crystal, game collectible, low-poly 3D model, glowing appearance, stylized',
    artStyle: 'sculpture',
    needsRigging: false,
    polycount: 300,
  },
];

/**
 * Calculate file checksum
 */
async function calculateChecksum(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Download GLB file from URL
 */
async function downloadGLB(url: string, outputPath: string): Promise<number> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeFile(outputPath, buffer);
  return buffer.length;
}

/**
 * Generate 3D model with Meshy
 */
async function generateModel(
  meshy: MeshyAPI,
  spec: ModelSpec
): Promise<ModelAsset> {
  const outputPath = path.join(OUTPUT_DIR, `${spec.id}.glb`);

  // Check if already exists
  if (await fs.pathExists(outputPath)) {
    const stats = await fs.stat(outputPath);
    const checksum = await calculateChecksum(outputPath);

    return {
      id: spec.id,
      name: spec.name,
      category: spec.category,
      source: {
        type: 'meshy',
        prompt: spec.prompt,
      },
      files: {
        glb: `/models/${spec.id}.glb`,
      },
      metadata: {
        polycount: spec.polycount,
        size: stats.size,
        checksum,
        generated: new Date(),
        version: '1.0.0',
      },
    };
  }

  // Step 1: Generate preview
  const previewSpinner = ora('Creating preview...').start();
  const preview = await meshy.createPreviewTask({
    text_prompt: spec.prompt,
    art_style: spec.artStyle,
    ai_model: 'latest', // Use Meshy 6 Preview (20 credits but best quality)
    topology: 'quad',
    target_polycount: spec.polycount,
    should_remesh: true,
  });

  const previewTask = await meshy.pollTask(preview.id, 60, 10000);
  previewSpinner.succeed('Preview complete');

  // Step 2: Refine
  const refineSpinner = ora('Refining model...').start();
  const refined = await meshy.createRefineTask(previewTask.id, {
    enable_pbr: true,
    ai_model: 'meshy-5',
  });
  const refinedTask = await meshy.pollTask(refined.id, 120, 10000);
  refineSpinner.succeed('Refine complete');

  // Step 3: Rigging (if needed)
  let finalGLB = meshy.getGLBUrl(refinedTask);
  const animations: ModelAsset['animations'] = [];
  let rigTaskId: string | undefined;

  if (spec.needsRigging) {
    const riggingSpinner = ora('Adding character rigging...').start();
    const rigged = await meshy.createRiggingTask(refined.id);
    const riggedTask = await meshy.pollRiggingTask(rigged.id, 120, 10000);
    rigTaskId = rigged.id; // Save this for generating more animations later!

    // Get animation URLs
    const animUrls = meshy.getAnimationUrls(riggedTask);
    finalGLB = animUrls.rigged || finalGLB;

    riggingSpinner.succeed('Rigging complete');

    // Download animation files separately
    if (animUrls.walking) {
      const walkPath = path.join(OUTPUT_DIR, `${spec.id}-walk.glb`);
      const walkSpinner = ora('Downloading walk animation...').start();
      await downloadGLB(animUrls.walking, walkPath);
      walkSpinner.succeed('Walk animation downloaded');

      animations.push({
        name: 'walk',
        type: 'walk',
        url: `/models/${spec.id}-walk.glb`, // Local path, not Meshy URL
      });
    }

    if (animUrls.running) {
      const runPath = path.join(OUTPUT_DIR, `${spec.id}-run.glb`);
      const runSpinner = ora('Downloading run animation...').start();
      await downloadGLB(animUrls.running, runPath);
      runSpinner.succeed('Run animation downloaded');

      animations.push({
        name: 'run',
        type: 'run',
        url: `/models/${spec.id}-run.glb`, // Local path, not Meshy URL
      });
    }
  }

  // Download GLB
  const downloadSpinner = ora('Downloading model...').start();
  if (!finalGLB) {
    throw new Error('No GLB URL available');
  }
  const size = await downloadGLB(finalGLB, outputPath);
  downloadSpinner.succeed(`Downloaded: ${(size / 1024).toFixed(2)} KB`);

  const checksum = await calculateChecksum(outputPath);

  return {
    id: spec.id,
    name: spec.name,
    category: spec.category,
    source: {
      type: 'meshy',
      meshyTaskId: refined.id,
      rigTaskId, // Saved if model was rigged
      prompt: spec.prompt,
    },
    files: {
      glb: `/models/${spec.id}.glb`,
    },
    animations: animations.length > 0 ? animations : undefined,
    metadata: {
      polycount: spec.polycount,
      size,
      checksum,
      generated: new Date(),
      version: '1.0.0',
    },
  };
}

/**
 * Generate texture variants via retexturing
 */
async function generateVariants(
  meshy: MeshyAPI,
  baseModel: ModelAsset,
  spec: ModelSpec
): Promise<void> {
  if (!spec.variants || spec.variants.length === 0) return;

  const baseGLBPath = path.join(OUTPUT_DIR, `${spec.id}.glb`);
  const _baseGLBUrl = `file://${baseGLBPath}`; // Local file for retexturing

  for (const variant of spec.variants) {
    const variantPath = path.join(OUTPUT_DIR, `${variant.id}.glb`);

    if (await fs.pathExists(variantPath)) {
      continue;
    }

    const spinner = ora(`Creating ${variant.name}...`).start();

    try {
      // Use input_task_id for retexturing (cheaper and correct API)
      const retextured = await meshy.createRetextureTask({
        input_task_id: baseModel.source.meshyTaskId!,
        text_style_prompt: variant.prompt,
        enable_pbr: true,
        enable_original_uv: true,
        ai_model: 'meshy-5',
      });

      const retexturedTask = await meshy.pollRetextureTask(
        retextured.id,
        120,
        10000
      );
      const variantGLB = meshy.getGLBUrl(retexturedTask);

      if (!variantGLB) {
        throw new Error('No variant GLB URL');
      }

      await downloadGLB(variantGLB, variantPath);
      spinner.succeed(`${variant.name} created`);
    } catch (error) {
      spinner.fail(
        `Failed to create ${variant.name}: ${(error as Error).message}`
      );
    }
  }
}

/**
 * Download missing files from manifest (idempotent recovery)
 */
async function syncFromManifest(manifestPath: string): Promise<void> {
  if (!(await fs.pathExists(manifestPath))) return;

  const manifest = await fs.readJson(manifestPath);
  let downloaded = 0;

  for (const model of manifest.models) {
    // Check main model file
    const modelPath = path.join(OUTPUT_DIR, path.basename(model.files.glb));
    if (!(await fs.pathExists(modelPath))) {
      // Logic for missing model file
    }

    // Check animation files
    if (model.animations) {
      for (const anim of model.animations) {
        // If URL starts with http, it hasn't been downloaded yet
        // Extract filename from URL (before query params)
        if (anim.url.startsWith('http')) {
          const urlPath = new URL(anim.url).pathname;
          const _animFile = path.basename(urlPath);
          const animPath = path.join(
            OUTPUT_DIR,
            `${model.id}-${anim.name}.glb`
          );

          if (!(await fs.pathExists(animPath))) {
            const spinner = ora(
              `Downloading ${model.id}-${anim.name}.glb...`
            ).start();
            try {
              await downloadGLB(anim.url, animPath);
              spinner.succeed(`Downloaded ${model.id}-${anim.name}.glb`);
              downloaded++;
            } catch (error) {
              spinner.fail(`Failed: ${(error as Error).message}`);
            }
          }
        }
      }
    }
  }

  if (downloaded > 0) {
    // Logic for successful downloads
  } else {
    // Logic for no downloads
  }
}

/**
 * Main generator function
 */
async function main() {
  await fs.ensureDir(OUTPUT_DIR);

  const meshy = new MeshyAPI(API_KEY!);
  const manifestPath = path.join(OUTPUT_DIR, 'models-manifest.json');

  // Idempotent: Download any missing files from manifest
  await syncFromManifest(manifestPath);

  const generatedModels: ModelAsset[] = [];

  // Generate base models
  for (const spec of MODEL_SPECS) {
    try {
      const model = await generateModel(meshy, spec);
      generatedModels.push(model);

      // Generate variants if applicable
      if (spec.variants) {
        await generateVariants(meshy, model, spec);
      }
    } catch (error) {
      console.error(chalk.red(`❌ Failed to generate ${spec.name}:`), error);
    }
  }

  // Save manifest
  await fs.writeJson(
    manifestPath,
    {
      version: '1.0.0',
      generated: new Date().toISOString(),
      models: generatedModels,
    },
    { spaces: 2 }
  );
}

// Run generator
main().catch((error) => {
  console.error(chalk.red('\n❌ Generation failed:'), error);
  process.exit(1);
});
