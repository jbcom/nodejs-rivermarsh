# Reorganization Plan - Otter River Rush
## From Canvas 2D Monolith to React Three Fiber Monorepo

**Date:** 2025-10-27
**Version:** 1.0
**Status:** 🟡 AWAITING APPROVAL

---

## Overview

This document outlines the complete reorganization of the Otter River Rush codebase from a Canvas 2D monolith to a modern React Three Fiber monorepo structure with proper asset management and 3D model support.

**Timeline:** 5 weeks
**Risk:** Medium
**Effort:** High
**Reward:** Functional 3D game matching project vision

---

## Current State Analysis

### Problems
1. ❌ Canvas 2D cannot render 3D models
2. ❌ Monolithic structure (no workspace separation)
3. ❌ No asset manifest system
4. ❌ Dev tools mixed with runtime
5. ❌ God object anti-pattern (Game.ts 1000+ lines)
6. ❌ React/R3F installed but unused

### Consequences
- Game has NEVER run successfully
- Cannot use Meshy-generated 3D models
- Poor maintainability
- Impossible to test properly
- No clear boundaries

---

## Target State

### New Architecture
```
otter-river-rush/
├── pnpm-workspace.yaml          # Workspace config
├── package.json                 # Root scripts only
├── src/
│   ├── client/                  # 🎮 WORKSPACE 1: Runtime
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── public/              # All assets
│   │   │   ├── models/          # GLB files from Meshy
│   │   │   ├── textures/        # PBR from ambientCG
│   │   │   ├── sprites/         # PNGs from OpenAI
│   │   │   ├── audio/           # Sound files
│   │   │   └── manifest.json    # Asset manifest
│   │   └── src/
│   │       ├── components/      # React components
│   │       │   ├── game/       # R3F game scenes
│   │       │   └── ui/         # UI overlays
│   │       ├── hooks/          # Custom React hooks
│   │       ├── stores/         # Zustand state
│   │       ├── three/          # Three.js utils
│   │       ├── game/           # Game logic
│   │       └── main.tsx        # Entry point
│   └── dev-tools/               # 🛠️ WORKSPACE 2: Dev tools
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── meshy/          # Meshy API client
│           │   ├── index.ts
│           │   ├── base-client.ts
│           │   ├── text-to-3d.ts
│           │   ├── retexture.ts
│           │   └── rigging.ts
│           ├── generators/     # Asset generators
│           │   ├── meshy-models.ts
│           │   ├── ambient-textures.ts
│           │   └── openai-sprites.ts
│           ├── pipelines/      # Processing
│           │   ├── asset-pipeline.ts
│           │   ├── quality-check.ts
│           │   └── manifest-sync.ts
│           └── schemas/        # Manifest schemas
│               ├── index.ts
│               ├── asset-manifest.ts
│               ├── model-asset.ts
│               ├── texture-asset.ts
│               └── sprite-asset.ts
├── wrappers/                    # Platform wrappers
│   ├── electron/
│   └── capacitor/
├── docs/
└── tests/
```

### Benefits
- ✅ Clear workspace separation
- ✅ Independent versioning
- ✅ Better dependency management
- ✅ 3D model support via R3F
- ✅ Component-based architecture
- ✅ Testable units
- ✅ Maintainable codebase

---

## Phase 1: Monorepo Setup (Days 1-7)

### Day 1: Initialize pnpm Workspace

#### 1.1 Install pnpm globally
```bash
npm install -g pnpm
```

#### 1.2 Create workspace configuration
```yaml
# pnpm-workspace.yaml
packages:
  - 'src/client'
  - 'src/dev-tools'
```

#### 1.3 Update root package.json
```json
{
  "name": "otter-river-rush-monorepo",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "pnpm --filter client dev",
    "build": "pnpm --filter client build",
    "test": "pnpm --filter client test",
    "dev-tools": "pnpm --filter dev-tools tsx",
    "generate:models": "pnpm --filter dev-tools tsx src/generators/meshy-models.ts",
    "generate:textures": "pnpm --filter dev-tools tsx src/generators/ambient-textures.ts",
    "generate:sprites": "pnpm --filter dev-tools tsx src/generators/openai-sprites.ts",
    "generate:all": "pnpm generate:models && pnpm generate:textures && pnpm generate:sprites",
    "pipeline": "pnpm --filter dev-tools tsx src/pipelines/asset-pipeline.ts",
    "verify:quality": "pnpm --filter dev-tools tsx src/pipelines/quality-check.ts",
    "sync:manifest": "pnpm --filter dev-tools tsx src/pipelines/manifest-sync.ts"
  }
}
```

**Verification:**
```bash
pnpm --version  # Should be 9.0+
cat pnpm-workspace.yaml
```

### Day 2: Create Client Workspace Structure

#### 2.1 Create client workspace directory
```bash
mkdir -p src/client/src
mkdir -p src/client/public
```

#### 2.2 Create client package.json
```json
{
  "name": "@otter-river-rush/client",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "@react-three/fiber": "^9.4.0",
    "@react-three/drei": "^10.7.6",
    "three": "^0.180.0",
    "zustand": "^5.0.8",
    "howler": "^2.2.4",
    "nipplejs": "^0.10.2"
  },
  "devDependencies": {
    "@types/react": "^19.2.2",
    "@types/react-dom": "^19.2.2",
    "@types/three": "^0.180.0",
    "@types/howler": "^2.2.11",
    "typescript": "^5.5.0",
    "vite": "^7.1.12",
    "vitest": "^4.0.3",
    "@playwright/test": "^1.47.0",
    "eslint": "^9.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0"
  }
}
```

#### 2.3 Copy and adapt Vite config
```bash
cp vite.config.ts src/client/vite.config.ts
# Update paths to be relative to client workspace
```

#### 2.4 Copy TypeScript config
```bash
cp tsconfig.json src/client/tsconfig.json
# Update paths and includes
```

**Verification:**
```bash
ls -la src/client/
cat src/client/package.json
```

### Day 3: Create Dev-Tools Workspace

#### 3.1 Create dev-tools workspace directory
```bash
mkdir -p src/dev-tools/src/{meshy,generators,pipelines,schemas}
```

#### 3.2 Create dev-tools package.json
```json
{
  "name": "@otter-river-rush/dev-tools",
  "version": "2.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "generate:models": "tsx src/generators/meshy-models.ts",
    "generate:textures": "tsx src/generators/ambient-textures.ts",
    "generate:sprites": "tsx src/generators/openai-sprites.ts",
    "pipeline": "tsx src/pipelines/asset-pipeline.ts",
    "quality-check": "tsx src/pipelines/quality-check.ts"
  },
  "dependencies": {
    "zod": "^3.23.0",
    "fs-extra": "^11.2.0",
    "sharp": "^0.34.4",
    "openai": "^6.7.0",
    "node-fetch": "^3.3.2",
    "chalk": "^5.3.0",
    "ora": "^8.0.0"
  },
  "devDependencies": {
    "@types/node": "^24.9.1",
    "@types/fs-extra": "^11.0.4",
    "typescript": "^5.5.0",
    "tsx": "^4.20.6"
  }
}
```

#### 3.3 Create dev-tools tsconfig.json
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "ESNext",
    "target": "ES2022",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Verification:**
```bash
ls -la src/dev-tools/
cat src/dev-tools/package.json
```

### Day 4: Install Workspace Dependencies

#### 4.1 Install all dependencies
```bash
pnpm install
```

#### 4.2 Verify workspace links
```bash
pnpm list --depth 0
```

#### 4.3 Test workspace commands
```bash
pnpm --filter client build  # Should fail (no source yet) - expected
pnpm --filter dev-tools tsx --version  # Should work
```

**Verification:**
```bash
ls -la node_modules/
ls -la src/client/node_modules/
ls -la src/dev-tools/node_modules/
```

### Day 5-6: Integrate Meshy Tools

#### 5.1 Copy Meshy files from realm-walker
```bash
# Copy the 5 Meshy files
cp /Users/jbogaty/src/realm-walker/src/tools/meshy/*.ts \
   src/dev-tools/src/meshy/
```

#### 5.2 Update imports for ESM
```typescript
// Change all require() to import
// Add .js extensions to local imports
// Update fetch to use node-fetch if needed
```

#### 5.3 Create Meshy index.ts
```typescript
// src/dev-tools/src/meshy/index.ts
export { MeshyAPI } from './client';
export * from './text-to-3d';
export * from './retexture';
export * from './rigging';
export * from './base-client';
```

#### 5.4 Test Meshy integration
```typescript
// src/dev-tools/src/test-meshy.ts
import { MeshyAPI } from './meshy';

const api = new MeshyAPI(process.env.MESHY_API_KEY!);
console.log('Meshy API initialized');
```

```bash
MESHY_API_KEY=your_key pnpm --filter dev-tools tsx src/test-meshy.ts
```

**Verification:**
```bash
ls -la src/dev-tools/src/meshy/
pnpm --filter dev-tools tsx src/test-meshy.ts
```

### Day 7: Move Runtime Code to Client

#### 7.1 Move source files
```bash
# Move game logic
cp -r src/game src/client/src/
cp -r src/rendering src/client/src/
cp -r src/utils src/client/src/
cp -r src/types src/client/src/
cp -r src/hooks src/client/src/
cp -r src/components src/client/src/

# Move main entry
cp src/main.ts src/client/src/
cp src/main-react.tsx src/client/src/
cp src/style.css src/client/src/
```

#### 7.2 Move public assets
```bash
# Move all public assets under client
cp -r public/* src/client/public/
```

#### 7.3 Update imports in moved files
```bash
# Find all imports and update paths
# @/ should now work from client workspace
# May need to update some relative paths
```

#### 7.4 Test build
```bash
pnpm --filter client build
```

**Verification:**
```bash
ls -la src/client/src/
ls -la src/client/public/
pnpm --filter client type-check
```

---

## Phase 2: Asset Manifest System (Days 8-14)

### Day 8-9: Define Manifest Schemas

#### 8.1 Create base schema types
```typescript
// src/dev-tools/src/schemas/asset-manifest.ts
import { z } from 'zod';

export const ModelAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['character', 'obstacle', 'collectible', 'environment']),
  source: z.object({
    type: z.enum(['meshy', 'manual']),
    meshyTaskId: z.string().optional(),
    prompt: z.string().optional(),
  }),
  files: z.object({
    glb: z.string().url(),
    thumbnails: z.array(z.string().url()).optional(),
  }),
  variants: z.array(z.object({
    id: z.string(),
    name: z.string(),
    retextureTaskId: z.string(),
    prompt: z.string(),
    glb: z.string().url(),
  })).optional(),
  animations: z.array(z.object({
    name: z.string(),
    type: z.enum(['idle', 'walk', 'run', 'jump', 'hit', 'death']),
    url: z.string().url(),
  })).optional(),
  metadata: z.object({
    polycount: z.number(),
    size: z.number(),
    checksum: z.string(),
    generated: z.date(),
    version: z.string(),
  }),
});

export const TextureAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['pbr', 'environment', 'effect']),
  source: z.object({
    type: z.enum(['ambientcg', 'manual']),
    assetId: z.string().optional(),
    resolution: z.enum(['1K', '2K', '4K', '8K']),
  }),
  files: z.object({
    baseColor: z.string().url(),
    normal: z.string().url().optional(),
    roughness: z.string().url().optional(),
    metallic: z.string().url().optional(),
    ao: z.string().url().optional(),
    displacement: z.string().url().optional(),
  }),
  metadata: z.object({
    size: z.number(),
    checksum: z.string(),
    downloaded: z.date(),
  }),
});

export const SpriteAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['ui', 'particle', 'icon', 'effect', 'hud']),
  source: z.object({
    type: z.enum(['openai', 'manual']),
    prompt: z.string().optional(),
    model: z.enum(['dall-e-2', 'dall-e-3']).optional(),
  }),
  files: z.object({
    png: z.string(),
    variants: z.record(z.string(), z.string()).optional(),
  }),
  metadata: z.object({
    width: z.number(),
    height: z.number(),
    transparent: z.boolean(),
    size: z.number(),
    checksum: z.string(),
    generated: z.date(),
  }),
});

export const AssetManifestSchema = z.object({
  version: z.string(),
  generated: z.date(),
  models: z.array(ModelAssetSchema),
  textures: z.array(TextureAssetSchema),
  sprites: z.array(SpriteAssetSchema),
});

// Export types
export type AssetManifest = z.infer<typeof AssetManifestSchema>;
export type ModelAsset = z.infer<typeof ModelAssetSchema>;
export type TextureAsset = z.infer<typeof TextureAssetSchema>;
export type SpriteAsset = z.infer<typeof SpriteAssetSchema>;
```

#### 8.2 Create schema validation utilities
```typescript
// src/dev-tools/src/schemas/validate.ts
import { AssetManifestSchema, type AssetManifest } from './asset-manifest';

export function validateManifest(data: unknown): AssetManifest {
  return AssetManifestSchema.parse(data);
}

export function isValidManifest(data: unknown): boolean {
  return AssetManifestSchema.safeParse(data).success;
}
```

**Verification:**
```bash
pnpm --filter dev-tools tsx -e "import {AssetManifestSchema} from './src/schemas/asset-manifest'; console.log('Schemas loaded')"
```

### Day 10-11: Build Asset Pipeline

#### 10.1 Create manifest manager
```typescript
// src/dev-tools/src/pipelines/manifest-manager.ts
import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import { AssetManifest, ModelAsset, TextureAsset, SpriteAsset } from '../schemas/asset-manifest';

const MANIFEST_PATH = '../../client/public/manifest.json';

export class ManifestManager {
  private manifest: AssetManifest;
  
  async load(): Promise<AssetManifest> {
    if (await fs.pathExists(MANIFEST_PATH)) {
      this.manifest = await fs.readJson(MANIFEST_PATH);
    } else {
      this.manifest = {
        version: '1.0.0',
        generated: new Date(),
        models: [],
        textures: [],
        sprites: [],
      };
    }
    return this.manifest;
  }
  
  async save(): Promise<void> {
    this.manifest.generated = new Date();
    await fs.writeJson(MANIFEST_PATH, this.manifest, { spaces: 2 });
  }
  
  addModel(model: ModelAsset): void {
    const existing = this.manifest.models.findIndex(m => m.id === model.id);
    if (existing >= 0) {
      this.manifest.models[existing] = model;
    } else {
      this.manifest.models.push(model);
    }
  }
  
  addTexture(texture: TextureAsset): void {
    const existing = this.manifest.textures.findIndex(t => t.id === texture.id);
    if (existing >= 0) {
      this.manifest.textures[existing] = texture;
    } else {
      this.manifest.textures.push(texture);
    }
  }
  
  addSprite(sprite: SpriteAsset): void {
    const existing = this.manifest.sprites.findIndex(s => s.id === sprite.id);
    if (existing >= 0) {
      this.manifest.sprites[existing] = sprite;
    } else {
      this.manifest.sprites.push(sprite);
    }
  }
  
  async calculateChecksum(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
  
  needsRegeneration(assetId: string, currentChecksum: string): boolean {
    // Check if asset exists and checksum matches
    const model = this.manifest.models.find(m => m.id === assetId);
    const texture = this.manifest.textures.find(t => t.id === assetId);
    const sprite = this.manifest.sprites.find(s => s.id === assetId);
    
    const existing = model || texture || sprite;
    if (!existing) return true;
    
    return existing.metadata.checksum !== currentChecksum;
  }
}
```

#### 10.2 Create asset pipeline
```typescript
// src/dev-tools/src/pipelines/asset-pipeline.ts
import { ManifestManager } from './manifest-manager';
import { generateMeshyModels } from '../generators/meshy-models';
import { downloadAmbientTextures } from '../generators/ambient-textures';
import { generateOpenAISprites } from '../generators/openai-sprites';
import chalk from 'chalk';
import ora from 'ora';

async function main() {
  console.log(chalk.bold.cyan('\n🎨 Asset Generation Pipeline\n'));
  
  const manifest = new ManifestManager();
  await manifest.load();
  
  // Phase 1: Generate 3D Models via Meshy
  const spinner1 = ora('Generating 3D models via Meshy...').start();
  try {
    await generateMeshyModels(manifest);
    spinner1.succeed('3D models generated');
  } catch (error) {
    spinner1.fail(`Failed: ${error.message}`);
  }
  
  // Phase 2: Download PBR Textures from AmbientCG
  const spinner2 = ora('Downloading PBR textures from AmbientCG...').start();
  try {
    await downloadAmbientTextures(manifest);
    spinner2.succeed('Textures downloaded');
  } catch (error) {
    spinner2.fail(`Failed: ${error.message}`);
  }
  
  // Phase 3: Generate 2D Sprites via OpenAI
  const spinner3 = ora('Generating 2D sprites via OpenAI DALL-E...').start();
  try {
    await generateOpenAISprites(manifest);
    spinner3.succeed('Sprites generated');
  } catch (error) {
    spinner3.fail(`Failed: ${error.message}`);
  }
  
  // Save manifest
  await manifest.save();
  console.log(chalk.green('\n✅ Asset pipeline complete!\n'));
}

main().catch(console.error);
```

**Verification:**
```bash
pnpm --filter dev-tools tsx src/pipelines/asset-pipeline.ts --dry-run
```

### Day 12-13: Build Asset Generators

#### 12.1 Create Meshy model generator
```typescript
// src/dev-tools/src/generators/meshy-models.ts
import { MeshyAPI } from '../meshy';
import { ManifestManager } from '../pipelines/manifest-manager';
import fs from 'fs-extra';
import path from 'path';
import fetch from 'node-fetch';

const OUTPUT_DIR = '../../client/public/models';

interface ModelSpec {
  id: string;
  name: string;
  category: 'character' | 'obstacle' | 'collectible';
  prompt: string;
  artStyle: 'realistic' | 'cartoon';
  needsRigging: boolean;
  variants?: Array<{ id: string; name: string; prompt: string }>;
}

const MODEL_SPECS: ModelSpec[] = [
  {
    id: 'otter-main',
    name: 'Rusty the Otter',
    category: 'character',
    prompt: 'cute otter character, game-ready, anthropomorphic, wearing adventure gear, low poly, cartoon style',
    artStyle: 'cartoon',
    needsRigging: true,
  },
  {
    id: 'rock-base',
    name: 'River Rock',
    category: 'obstacle',
    prompt: 'smooth river rock, rounded, natural stone, game-ready, low poly',
    artStyle: 'realistic',
    needsRigging: false,
    variants: [
      { id: 'rock-mossy', name: 'Mossy Rock', prompt: 'smooth river rock covered in green moss' },
      { id: 'rock-cracked', name: 'Cracked Rock', prompt: 'river rock with visible cracks and weathering' },
      { id: 'rock-crystal', name: 'Crystal Rock', prompt: 'river rock with embedded shiny crystals' },
    ],
  },
  {
    id: 'coin-gold',
    name: 'Gold Coin',
    category: 'collectible',
    prompt: 'gold coin, shiny, game collectible, low poly, spinning animation ready',
    artStyle: 'cartoon',
    needsRigging: false,
  },
];

export async function generateMeshyModels(manifest: ManifestManager) {
  const meshy = new MeshyAPI(process.env.MESHY_API_KEY!);
  
  await fs.ensureDir(OUTPUT_DIR);
  
  for (const spec of MODEL_SPECS) {
    console.log(`\n📦 Generating: ${spec.name}`);
    
    // Check if already generated
    const outputPath = path.join(OUTPUT_DIR, `${spec.id}.glb`);
    if (await fs.pathExists(outputPath)) {
      const checksum = await manifest.calculateChecksum(outputPath);
      if (!manifest.needsRegeneration(spec.id, checksum)) {
        console.log('  ✓ Already up-to-date');
        continue;
      }
    }
    
    // Generate preview
    console.log('  ⏳ Creating preview...');
    const preview = await meshy.createPreviewTask({
      text_prompt: spec.prompt,
      art_style: spec.artStyle,
      ai_model: 'meshy-5',
      topology: 'quad',
      target_polycount: 5000,
    });
    
    // Wait for preview
    const previewTask = await meshy.pollTask(preview.id);
    console.log('  ✓ Preview complete');
    
    // Refine
    console.log('  ⏳ Refining...');
    const refined = await meshy.createRefineTask(previewTask.id, {
      enable_pbr: true,
    });
    const refinedTask = await meshy.pollTask(refined.id);
    console.log('  ✓ Refine complete');
    
    // Rigging if needed
    let finalGLB = meshy.getGLBUrl(refinedTask);
    if (spec.needsRigging) {
      console.log('  ⏳ Rigging...');
      const rigged = await meshy.createRiggingTask({ input_task_id: refined.id });
      const riggedTask = await meshy.pollRiggingTask(rigged.id);
      finalGLB = riggedTask.result?.rigged_model_url || finalGLB;
      console.log('  ✓ Rigging complete');
    }
    
    // Download GLB
    console.log('  ⏳ Downloading...');
    const response = await fetch(finalGLB!);
    const buffer = await response.buffer();
    await fs.writeFile(outputPath, buffer);
    console.log(`  ✓ Saved: ${spec.id}.glb`);
    
    // Add to manifest
    const checksum = await manifest.calculateChecksum(outputPath);
    manifest.addModel({
      id: spec.id,
      name: spec.name,
      category: spec.category,
      source: {
        type: 'meshy',
        meshyTaskId: refined.id,
        prompt: spec.prompt,
      },
      files: {
        glb: `/models/${spec.id}.glb`,
      },
      metadata: {
        polycount: 5000,
        size: buffer.length,
        checksum,
        generated: new Date(),
        version: '1.0.0',
      },
    });
    
    // Generate variants via retexture
    if (spec.variants) {
      for (const variant of spec.variants) {
        console.log(`  ⏳ Creating variant: ${variant.name}`);
        const retextured = await meshy.createRetextureTask({
          model_url: finalGLB!,
          prompt: variant.prompt,
          art_style: 'realistic',
          enable_pbr: true,
        });
        const retexturedTask = await meshy.pollRetextureTask(retextured.id);
        
        const variantGLB = meshy.getGLBUrl(retexturedTask);
        const variantPath = path.join(OUTPUT_DIR, `${variant.id}.glb`);
        const variantResponse = await fetch(variantGLB!);
        const variantBuffer = await variantResponse.buffer();
        await fs.writeFile(variantPath, variantBuffer);
        console.log(`  ✓ Variant saved: ${variant.id}.glb`);
      }
    }
  }
}
```

#### 12.2 Create AmbientCG texture downloader
```typescript
// src/dev-tools/src/generators/ambient-textures.ts
import { ManifestManager } from '../pipelines/manifest-manager';
import fs from 'fs-extra';
import path from 'path';
import fetch from 'node-fetch';

const OUTPUT_DIR = '../../client/public/textures';
const AMBIENTCG_API = 'https://ambientcg.com/api/v2/full_json';

interface TextureSpec {
  id: string;
  name: string;
  assetId: string;  // AmbientCG asset ID
  resolution: '2K' | '
