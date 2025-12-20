#!/usr/bin/env node
/**
 * Quick Asset Quality Check - Just evaluates and reports, no fixes
 */

import { ASSET_MANIFEST } from './asset-manifest.js';
import {
  evaluateAllAssets,
  generateQualityReport,
} from './asset-quality-evaluator.js';

async function main() {
  const qualityResults = await evaluateAllAssets(ASSET_MANIFEST);
  generateQualityReport(ASSET_MANIFEST, qualityResults);

  const needsWork = Array.from(qualityResults.values()).filter(
    (q) => q.needsRegeneration
  ).length;

  if (needsWork > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch(console.error);
