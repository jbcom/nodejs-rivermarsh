# Asset Processing Workflow

## Overview

The asset processing system runs **BEFORE commit/push** as part of the generation workflow. This is NOT post-processing - it's integrated into the generation pipeline.

## Workflow Stages

### 1. Asset Generation
- AI generates sprites/icons using OpenAI DALL-E or similar
- Raw assets are saved to `public/` directories
- Assets may have quality issues (wrong size, white backgrounds, etc.)

### 2. Asset Processing (PRE-COMMIT) ⚠️
**This happens IMMEDIATELY after generation, BEFORE any commit**

- **File**: `src/scripts/asset-processor.ts`
- **Purpose**: Ensure all assets meet quality standards
- **Operations**:
  - Resize to correct dimensions
  - Convert to proper formats (PNG, ICO, WebP)
  - Remove white backgrounds
  - Optimize file sizes
  - Preserve transparency

### 3. Quality Verification
- **File**: `src/scripts/asset-pipeline.ts`
- **Purpose**: Orchestrate quality checking and processing
- **Steps**:
  1. Evaluate all asset quality
  2. Process deficient assets (calls asset-processor.ts)
  3. Re-evaluate to verify fixes
  4. Report final status

### 4. Ready to Commit
Only after assets pass quality checks should they be committed to the repository.

## Running the Pipeline

```bash
# Full pipeline: evaluate + process + verify
cd src/dev-tools
pnpm asset-pipeline

# Process assets manually (if needed)
pnpm asset-processor
```

## Key Points

✅ **PRE-COMMIT**: All processing happens BEFORE git commit/push
✅ **AUTOMATED**: Runs automatically during generation
✅ **IDEMPOTENT**: Can be run multiple times safely
✅ **QUALITY GATES**: Assets must pass quality checks before commit

❌ **NOT** post-processing (done after commit)
❌ **NOT** optional (required for quality)
❌ **NOT** manual (integrated into pipeline)

## File Naming

- **OLD**: `asset-post-processor.ts` ❌ (misleading)
- **NEW**: `asset-processor.ts` ✅ (correct)

The "post" prefix was removed because this processing is NOT done after committing - it's done during generation, before any assets are committed to the repository.
