/**
 * Terrain with AmbientCG PBR Textures
 * Procedural heightmap terrain with realistic grass/ground materials
 * Based on ser-plonk's Terrain.tsx + ambientcg.ts integration
 */

import { useFrame } from '@react-three/fiber';
import React, { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useBiome } from '../../ecs/biome-system';
import { useMobileConstraints } from '../../hooks/useMobileConstraints';
import {
  AMBIENT_CG_TEXTURES,
  getLocalTexturePaths,
} from '../../utils/ambientcg';

function generateHeightmap(
  width: number,
  height: number,
  scale: number,
  seed: number
): Float32Array {
  const data = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = x / width - 0.5;
      const ny = y / height - 0.5;
      // Octave noise for natural terrain
      const e =
        1.0 * noise(nx * scale + seed, ny * scale + seed) +
        0.5 * noise(nx * scale * 2 + seed, ny * scale * 2 + seed) +
        0.25 * noise(nx * scale * 4 + seed, ny * scale * 4 + seed);
      data[y * width + x] = e * 1.5;
    }
  }
  return data;
}

// Simple value noise
function noise(x: number, y: number): number {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function TerrainMesh(): React.JSX.Element {
  const biome = useBiome();
  const constraints = useMobileConstraints();
  const meshRef = useRef<THREE.Mesh>(null);

  // Get texture paths for current biome (for future PBR implementation)
  const texturePaths = useMemo(() => {
    const biomeTextures = {
      forest: AMBIENT_CG_TEXTURES.GRASS,
      mountain: AMBIENT_CG_TEXTURES.ROCK_GRANITE,
      canyon: AMBIENT_CG_TEXTURES.SAND,
      rapids: AMBIENT_CG_TEXTURES.ROCK_RIVER,
    };
    const texture =
      biomeTextures[biome.name as keyof typeof biomeTextures] ||
      AMBIENT_CG_TEXTURES.GRASS;
    return getLocalTexturePaths(texture.id, '1K', 'jpg');
  }, [biome.name]);

  // TODO: Load PBR textures using texturePaths when texture loading is optimized
  // For now using simple material fallback to avoid loading hangs
  if (import.meta.env.DEV) {
    console.warn('PBR textures available but not loaded:', texturePaths);
  }

  // Simple material fallback (PBR textures cause loading hang)
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: biome.fogColor,
        roughness: 0.8,
        metalness: 0,
      }),
    [biome.fogColor]
  );

  const geometry = useMemo(() => {
    // Reduce detail on mobile for performance
    const detail = constraints.isPhone ? 64 : 128;
    const width = detail;
    const height = detail;
    const size = 40;
    const plane = new THREE.PlaneGeometry(size, size, width - 1, height - 1);
    plane.rotateX(-Math.PI / 2);

    // Generate heightmap
    const seed = biome.name
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hm = generateHeightmap(width, height, 3.0, seed);
    const pos = plane.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      const ix = i % width;
      const iy = Math.floor(i / width);
      const h = hm[iy * width + ix];
      // Lower near center (river strip), higher at edges
      pos.setY(i, h * (ix < 10 || ix > width - 10 ? 0.2 : 0.05));
    }
    pos.needsUpdate = true;
    plane.computeVertexNormals();

    return plane;
  }, [biome.name, constraints.isPhone]);

  useFrame(() => {
    if (!meshRef.current) return;
    // Terrain is static, no animation needed
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[0, -0.6, 0]}
      receiveShadow
    />
  );
}

export function Terrain() {
  return (
    <Suspense fallback={null}>
      <TerrainMesh />
    </Suspense>
  );
}
