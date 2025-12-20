/**
 * Otter Animation Generator
 * Generates additional animations from Meshy Animation Library
 * Uses the rigged otter to apply 600+ available animations
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import ora from 'ora';
import path from 'path';
import { MeshyAPI, OTTER_ANIMATIONS } from '../meshy/index.js';

const OUTPUT_DIR = path.resolve(
  process.cwd(),
  '../../src/client/public/models'
);
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'models-manifest.json');
const API_KEY = process.env.MESHY_API_KEY;

if (!API_KEY) {
  console.error(chalk.red('❌ MESHY_API_KEY environment variable not set!'));
  process.exit(1);
}

/**
 * Download GLB from URL
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
 * Generate specific animation for otter
 */
async function generateAnimation(
  meshy: MeshyAPI,
  rigTaskId: string,
  animationName: string,
  actionId: number
): Promise<string | null> {
  const outputPath = path.join(OUTPUT_DIR, `otter-rusty-${animationName}.glb`);

  // Skip if already exists
  if (await fs.pathExists(outputPath)) {
    return `/models/otter-rusty-${animationName}.glb`;
  }

  const spinner = ora(
    `Generating ${animationName} animation (action ${actionId})...`
  ).start();

  try {
    // Create animation task
    const animTask = await meshy.animations.createAnimationTask({
      rig_task_id: rigTaskId,
      action_id: actionId,
    });

    // Poll until complete
    const completed = await meshy.animations.pollAnimationTask(
      animTask.id,
      60,
      10000
    );

    // Download animation GLB
    const animGLB = completed.result?.animation_glb_url;
    if (!animGLB) {
      throw new Error('No animation GLB URL');
    }

    await downloadGLB(animGLB, outputPath);
    spinner.succeed(
      `${animationName} animation generated (${(await fs.stat(outputPath)).size / 1024 / 1024} MB)`
    );

    return `/models/otter-rusty-${animationName}.glb`;
  } catch (error) {
    spinner.fail(`Failed: ${(error as Error).message}`);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  // Load manifest to get rig_task_id
  interface ManifestModel {
    id: string;
    source: { rigTaskId?: string };
    animations?: Array<{ url: string }>;
  }
  const manifest = await fs.readJson(MANIFEST_PATH);
  const otterModel = (manifest.models as ManifestModel[]).find(
    (m) => m.id === 'otter-rusty'
  );

  if (!otterModel) {
    console.error(chalk.red('❌ Otter model not found in manifest!'));
    process.exit(1);
  }

  const meshy = new MeshyAPI(API_KEY!);

  // Check if rigTaskId is saved in manifest
  let rigTaskId = otterModel.source.rigTaskId;

  if (!rigTaskId) {
    // Extract rigging task ID from animation URL
    if (otterModel.animations && otterModel.animations[0]?.url) {
      const walkUrl = otterModel.animations[0].url;
      // URL format: https://assets.meshy.ai/.../tasks/{rig_task_id}/output/...
      const match = walkUrl.match(/tasks\/([^/]+)\/output/);
      if (match) {
        rigTaskId = match[1];
      }
    }
  } else {
    // Logic for no rig task found
  }

  if (!rigTaskId) {
    console.error(chalk.red('❌ Could not determine rigging task ID!'));
    process.exit(1);
  }

  // Generate additional animations
  const animations = [
    { name: 'jump', actionId: OTTER_ANIMATIONS.jump, label: 'Jump' },
    { name: 'collect', actionId: OTTER_ANIMATIONS.collect, label: 'Collect' },
    { name: 'hit', actionId: OTTER_ANIMATIONS.hit, label: 'Hit Reaction' },
    { name: 'death', actionId: OTTER_ANIMATIONS.death, label: 'Death' },
    { name: 'victory', actionId: OTTER_ANIMATIONS.victory, label: 'Victory' },
    { name: 'happy', actionId: OTTER_ANIMATIONS.happy, label: 'Happy Jump' },
    {
      name: 'dodge-left',
      actionId: OTTER_ANIMATIONS.dodgeLeft,
      label: 'Dodge Left',
    },
    {
      name: 'dodge-right',
      actionId: OTTER_ANIMATIONS.dodgeRight,
      label: 'Dodge Right',
    },
  ];

  const generatedUrls: Record<string, string> = {};
  let _successCount = 0;

  for (const anim of animations) {
    const url = await generateAnimation(
      meshy,
      rigTaskId,
      anim.name,
      anim.actionId
    );
    if (url) {
      generatedUrls[anim.name] = url;
      _successCount++;
    }
  }
  for (const [_name, _url] of Object.entries(generatedUrls)) {
    // Logic to handle generated URLs
  }
}

main().catch((error) => {
  console.error(chalk.red('\n❌ Animation generation failed:'), error);
  process.exit(1);
});
