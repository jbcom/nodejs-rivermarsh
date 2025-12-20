# Otter River Rush - Dev Tools

Development tools for generating 3D models and textures for Otter River Rush.

## 🎨 3D Model Generation

Generate game-ready 3D models with Meshy AI including animations and texture variants.

### Setup

1. Get your Meshy API key from [https://meshy.ai](https://meshy.ai)
2. Set the environment variable:
   ```bash
   export MESHY_API_KEY=your_key_here
   ```

### Generate Models

From the root directory:

```bash
pnpm generate:models
```

This will generate:
- **Rusty the Otter** - Rigged character with walk/run animations
- **River Rocks** - 4 variants (base, mossy, cracked, crystal)
- **Gold Coins** - Collectible with metallic finish
- **Blue & Red Gems** - Glowing collectibles

### What Gets Generated

```
src/client/public/models/
├── otter-rusty.glb           # Main character (rigged, animated)
├── rock-river.glb            # Base rock obstacle
├── rock-mossy.glb            # Variant 1: Mossy
├── rock-cracked.glb          # Variant 2: Cracked
├── rock-crystal.glb          # Variant 3: Crystal
├── coin-gold.glb             # Gold coin collectible
├── gem-blue.glb              # Blue gem collectible
├── gem-red.glb               # Red gem collectible
└── models-manifest.json      # Asset manifest with metadata
```

### Generation Time

- **Otter (rigged)**: ~15-20 minutes (preview + refine + rigging)
- **Rocks**: ~10 minutes each (preview + refine)
- **Collectibles**: ~8 minutes each
- **Variants**: ~12 minutes each (retexturing)

**Total**: ~2-3 hours for all models

### Model Specifications

| Model | Polycount | Rigged | Animated | Variants |
|-------|-----------|--------|----------|----------|
| Otter | 8,000 | ✅ | ✅ walk/run | - |
| Rock | 2,000 | ❌ | ❌ | 3 textures |
| Coin | 500 | ❌ | ❌ | - |
| Gems | 300 | ❌ | ❌ | - |

### Customization

Edit `src/dev-tools/src/generators/meshy-models.ts` to customize:
- Model prompts
- Art styles (cartoon, realistic, anime, sculpture)
- Polycount targets
- Texture variant prompts

### Troubleshooting

**"MESHY_API_KEY not set"**
```bash
export MESHY_API_KEY=msy_xxxxx
pnpm generate:models
```

**Generation fails**
- Check your Meshy account has sufficient credits
- Verify API key is correct
- Check internet connection
- Review error messages for specific issues

**Models already exist**
- Delete existing `.glb` files to regenerate
- Or edit prompts to generate different versions

## 🎯 Next Steps

After generating models:

1. **Update R3F Components**
   - Replace texture planes with `useGLTF` hooks
   - Load animated models with proper controls
   
2. **Sprites deprecated**: Gameplay uses GLB models; no sprite generation.

3. **Test in Browser**
   ```bash
   pnpm dev
   ```

## 📚 Asset Pipeline

### Asset Quality & Processing

**IMPORTANT**: Asset processing runs BEFORE commit/push. See [ASSET_WORKFLOW.md](./ASSET_WORKFLOW.md) for details.

```bash
# Full asset quality pipeline (evaluate + process + verify)
pnpm asset-pipeline

# Process assets individually (if needed)
pnpm asset-processor

# Generate all content + models
pnpm pipeline
```

### Individual Generators

```bash
pnpm generate:models      # 3D models via Meshy
pnpm generate:textures    # PBR textures from AmbientCG
pnpm generate:content     # AI-generated game content
```

### Key Workflow Points

✅ Asset processing happens **during generation** (not after)
✅ All quality checks run **before commit/push**
✅ Pipeline is idempotent (safe to re-run)

See [ASSET_WORKFLOW.md](./ASSET_WORKFLOW.md) for complete workflow documentation.

## 🔧 Development

This workspace uses:
- **TypeScript** - Type safety
- **Zod** - Schema validation
- **Meshy API** - 3D model generation
- **fs-extra** - File operations
- **chalk + ora** - CLI UI

### Scripts Location

```
src/dev-tools/src/
├── meshy/           # Meshy API client (from realm-walker)
├── generators/      # Asset generators
│   └── meshy-models.ts
├── pipelines/       # Asset processing pipelines
└── schemas/         # Asset manifest schemas
    └── asset-manifest.ts
```

## 💡 Tips

- **Run overnight**: Model generation takes hours
- **Check credits**: Each model costs ~$0.50, variants ~$0.20
- **Idempotent**: Script skips existing files
- **Manifest**: Track all generated assets
- **Variants**: Use retexturing for cheaper variations
