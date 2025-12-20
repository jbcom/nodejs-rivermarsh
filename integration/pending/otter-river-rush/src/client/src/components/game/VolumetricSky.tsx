/**
 * Volumetric Sky with Realistic Clouds
 * Uses @takram/three-clouds for professional atmospheric rendering
 * Based on ser-plonk's Sky.tsx implementation
 *
 * Performance targets:
 * - Phones: 60 FPS with 'low' preset
 * - Tablets: 60 FPS with 'medium' preset
 * - Desktop: 60 FPS with 'high' preset
 */

import { Atmosphere } from '@takram/three-atmosphere/r3f';
import { CloudLayer, Clouds } from '@takram/three-clouds/r3f';
import React from 'react';
import { useBiome } from '../../ecs/biome-system';
import { useMobileConstraints } from '../../hooks/useMobileConstraints';

interface VolumetricSkyProps {
  timeOfDay?: number; // 0-24 (for future day/night cycle)
  coverage?: number; // 0-1 cloud coverage
}

export function VolumetricSky({
  timeOfDay: _timeOfDay = 12,
  coverage = 0.4,
}: VolumetricSkyProps): React.JSX.Element {
  const constraints = useMobileConstraints();
  const biome = useBiome();

  // Mobile performance: reduce cloud quality based on device
  const qualityPreset = constraints.isPhone
    ? 'low'
    : constraints.isTablet
      ? 'medium'
      : 'high';

  // Adjust coverage by biome
  const biomeCoverage = {
    forest: 0.3, // Light clouds
    mountain: 0.5, // More dramatic clouds
    canyon: 0.2, // Clear desert sky
    rapids: 0.6, // Stormy clouds
  };

  const finalCoverage =
    biomeCoverage[biome.name as keyof typeof biomeCoverage] || coverage;

  return (
    <Atmosphere>
      <Clouds
        qualityPreset={qualityPreset}
        coverage={finalCoverage}
        disableDefaultLayers
      >
        {/* Low altitude clouds (cumulus) - fluffy clouds close to horizon */}
        <CloudLayer channel="r" altitude={750} height={650} shadow />

        {/* Mid altitude clouds - main cloud layer */}
        <CloudLayer channel="g" altitude={1500} height={800} shadow />

        {/* High altitude clouds (cirrus) - wispy clouds far above */}
        <CloudLayer
          channel="b"
          altitude={5000}
          height={500}
          densityScale={0.003}
          shapeAmount={0.4}
          shapeDetailAmount={0}
          coverageFilterWidth={0.5}
        />
      </Clouds>
    </Atmosphere>
  );
}
