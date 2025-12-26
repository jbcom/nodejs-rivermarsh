/**
 * GPU-Driven Vegetation System - Using @jbcom/strata
 *
 * Replaces custom CPU-based instancing with Strata's GPU-optimized
 * vegetation components with built-in wind animation and LOD.
 */

import type { BiomeData } from '@jbcom/strata';
import {
    GrassInstances as StrataGrass,
    RockInstances as StrataRocks,
    TreeInstances as StrataTrees,
} from '@jbcom/strata';
import * as THREE from 'three';

// Re-export BiomeData type for consumers
export type { BiomeData };

// =============================================================================
// DEFAULT BIOMES (Rivermarsh-specific)
// =============================================================================

export const DEFAULT_BIOMES: BiomeData[] = [
    { type: 'marsh', center: new THREE.Vector2(0, 0), radius: 30 },
    { type: 'forest', center: new THREE.Vector2(50, 0), radius: 40 },
    { type: 'savanna', center: new THREE.Vector2(60, 60), radius: 50 },
    { type: 'mountain', center: new THREE.Vector2(-40, 40), radius: 35 },
    { type: 'tundra', center: new THREE.Vector2(-60, -30), radius: 45 },
    { type: 'desert', center: new THREE.Vector2(70, -50), radius: 40 },
    { type: 'scrubland', center: new THREE.Vector2(-30, -60), radius: 35 },
];

// =============================================================================
// GRASS INSTANCES
// =============================================================================

interface GrassInstancesProps {
    count?: number;
    areaSize?: number;
    biomes?: BiomeData[];
    heightFunc?: (x: number, z: number) => number;
}

export function GrassInstances({
    count = 12000,
    areaSize = 150,
    biomes = DEFAULT_BIOMES,
    heightFunc,
}: GrassInstancesProps) {
    return (
        <StrataGrass
            count={count}
            areaSize={areaSize}
            biomes={biomes}
            heightFunc={heightFunc}
            height={0.4}
            color="#4a7c23"
        />
    );
}

// =============================================================================
// TREE INSTANCES
// =============================================================================

interface TreeInstancesProps {
    count?: number;
    areaSize?: number;
    biomes?: BiomeData[];
    heightFunc?: (x: number, z: number) => number;
}

export function TreeInstances({
    count = 600,
    areaSize = 150,
    biomes = DEFAULT_BIOMES,
    heightFunc,
}: TreeInstancesProps) {
    return (
        <StrataTrees count={count} areaSize={areaSize} biomes={biomes} heightFunc={heightFunc} />
    );
}

// =============================================================================
// ROCK INSTANCES
// =============================================================================

interface RockInstancesProps {
    count?: number;
    areaSize?: number;
    biomes?: BiomeData[];
    heightFunc?: (x: number, z: number) => number;
}

export function RockInstances({
    count = 250,
    areaSize = 150,
    biomes = DEFAULT_BIOMES,
    heightFunc,
}: RockInstancesProps) {
    return (
        <StrataRocks count={count} areaSize={areaSize} biomes={biomes} heightFunc={heightFunc} />
    );
}
