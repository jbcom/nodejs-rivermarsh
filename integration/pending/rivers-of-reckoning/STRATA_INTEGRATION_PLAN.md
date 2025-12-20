# Strata Integration Plan for Rivermarsh

> **How Rivers of Reckoning's Strata work accelerates Rivermarsh Issue #2**

## Executive Summary

Rivers of Reckoning has successfully integrated `@jbcom/strata@1.4.7` and validated its API. This knowledge can directly accelerate Rivermarsh's Strata integration (Issue #2), replacing custom implementations with battle-tested library code.

---

## Strata API → Rivermarsh Mapping

### 1. SDF Terrain (Replace `src/utils/sdf.ts` + `marchingCubes.ts`)

**Current Rivermarsh (Custom):**
```typescript
// src/utils/sdf.ts - Custom implementations
export function sdSphere(...) { ... }
export function sdBox(...) { ... }
export function opSmoothUnion(...) { ... }
```

**With Strata:**
```typescript
import {
  sdSphere, sdBox, sdCapsule, sdTorus, sdCone, sdRock,
  opUnion, opSubtraction, opIntersection,
  opSmoothUnion, opSmoothSubtraction, opSmoothIntersection,
  noise3D, fbm, warpedFbm,
  calcNormal, sdTerrain, sdCaves,
  marchingCubes, createGeometryFromMarchingCubes, generateTerrainChunk
} from '@jbcom/strata/core'
```

**Benefit**: Full SDF primitive library + marching cubes + caves built-in.

---

### 2. SDFTerrain Component (Replace `src/components/SDFTerrain.tsx`)

**Current Rivermarsh (393 lines):**
```tsx
// Custom chunk-based terrain with biome blending
export function SDFTerrain({ chunkSize, resolution, viewDistance, biomes }) {
  // Manual chunk management, LOD, biome vertex colors
}
```

**With Strata:**
```typescript
import { 
  sdTerrain, 
  generateTerrainChunk, 
  getBiomeAt, 
  getTerrainHeight 
} from '@jbcom/strata/core'

// Use Strata's terrain SDF with Rivermarsh's biome definitions
const terrainSDF = (p: Vector3) => sdTerrain(p, biomeData)
const chunk = generateTerrainChunk(terrainSDF, chunkPos, 32, 24)
```

**Benefit**: GPU-optimized terrain with caves, biome-aware height functions.

---

### 3. Water (Replace `src/components/Water.tsx` + `src/shaders/water.ts`)

**Current Rivermarsh (150 lines):**
```tsx
// Custom water shader with caustics, reflection, waves
export function Water({ position, size }) {
  // ShaderMaterial with custom vertex/fragment shaders
}
```

**With Strata:**
```tsx
import { Water, AdvancedWater, createWaterMaterial } from '@jbcom/strata'

<AdvancedWater 
  size={size}
  waterColor="#006994"
  deepWaterColor="#003366"
  foamColor="#ffffff"
  causticIntensity={0.4}
/>
```

**Benefit**: Caustics, foam, depth-based coloring out of the box.

---

### 4. Volumetric Effects (Replace `src/components/VolumetricEffects.tsx` + `src/shaders/volumetrics.ts`)

**Current Rivermarsh (280 lines):**
```tsx
// Custom volumetric fog + underwater effects
export function VolumetricEffects({ enableFog, enableUnderwater, fogSettings, underwaterSettings }) {
  // Custom raymarching shaders
}
```

**With Strata:**
```tsx
import { 
  VolumetricEffects as StrataVolumetrics,
  VolumetricFogMesh, 
  UnderwaterOverlay 
} from '@jbcom/strata'

<StrataVolumetrics fogEnabled={true} underwaterEnabled={true} />
// OR more granular:
<VolumetricFogMesh color="#667788" density={0.015} height={5} />
<UnderwaterOverlay waterColor="#004066" density={0.08} causticStrength={0.4} />
```

**Benefit**: Pre-optimized raymarching with mobile performance tuning.

---

### 5. Fur System (Replace `src/shaders/fur.ts`)

**Current Rivermarsh (75 lines):**
```typescript
// Custom fur vertex/fragment shaders
export const furVertexShader = `...`
export const furFragmentShader = `...`
```

**With Strata:**
```typescript
import { createFurSystem, createFurMaterial, updateFurUniforms } from '@jbcom/strata'

const furSystem = createFurSystem(otterGeometry, baseMaterial, {
  baseColor: 0x3e2723,
  tipColor: 0x795548,
  layerCount: 6,
  spacing: 0.02,
  windStrength: 0.3,
  gravityDroop: 0.1
})

// In animation loop:
updateFurUniforms(furSystem, elapsedTime)
```

**Benefit**: Wind animation, gravity droop, layer management handled automatically.

---

### 6. GPU Instancing (Replace `src/components/GPUInstancing.tsx`)

**Current Rivermarsh (200+ lines):**
```tsx
// Custom GrassInstances, TreeInstances, RockInstances
export function GrassInstances({ count, areaSize, biomes, heightFunc }) {
  // Manual instance matrix generation, wind shader
}
```

**With Strata:**
```tsx
import { 
  GrassInstances, TreeInstances, RockInstances,
  generateInstanceData, GPUInstancedMesh 
} from '@jbcom/strata'

// Direct component usage (simplest):
<GrassInstances count={12000} areaSize={150} biomes={biomeData} />
<TreeInstances count={600} areaSize={150} biomes={biomeData} />
<RockInstances count={250} areaSize={150} biomes={biomeData} />

// OR manual control:
const instances = generateInstanceData(12000, 150, biomeData, heightFunc, seed)
<GPUInstancedMesh 
  geometry={grassGeometry}
  material={grassMaterial}
  count={12000}
  instances={instances}
  enableWind={true}
  windStrength={0.5}
  lodDistance={50}
/>
```

**Benefit**: Seeded deterministic placement, LOD, wind animation built-in.

---

### 7. Procedural Sky (NEW - not in Rivermarsh)

**Add to Rivermarsh:**
```tsx
import { ProceduralSky } from '@jbcom/strata'

<ProceduralSky 
  timeOfDay={{ hour: 14, phase: 'day', sunAngle: 60 }}
  weather={{ type: 'clear', intensity: 0 }}
/>
```

**Benefit**: Dynamic sky that responds to ECS TimeSystem data.

---

### 8. Weather Particles (Enhance `src/components/WeatherParticles.tsx`)

**Current Rivermarsh:**
```tsx
// Custom rain/snow particle system
export function WeatherParticles() { ... }
```

**With Strata:**
```tsx
import { Rain, Snow, createParticleSystem } from '@jbcom/strata'

// Simple:
{weather.type === 'rain' && <Rain intensity={weather.intensity} />}
{weather.type === 'snow' && <Snow intensity={weather.intensity} />}

// Or custom particle system:
const particleSystem = createParticleSystem({
  maxParticles: 5000,
  lifetime: 3,
  rate: 500,
  shape: 'box',
  shapeParams: { width: 50, height: 0.1, depth: 50 },
  velocity: { min: new Vector3(-1, -10, -1), max: new Vector3(1, -15, 1) },
  color: { start: new Color(0xaabbcc), end: new Color(0x8899aa) },
  size: { start: 0.1, end: 0.05 },
  opacity: { start: 0.8, end: 0.2 }
})
```

**Benefit**: Pre-built rain/snow or fully customizable particle systems.

---

### 9. Post-Processing (Replace `@react-three/postprocessing` usage)

**Current Rivermarsh:**
```tsx
import { Bloom, Vignette, DepthOfField } from '@react-three/postprocessing'
```

**With Strata:**
```tsx
import { CinematicEffects, createPostProcessingPipeline } from '@jbcom/strata'

// Simple:
<CinematicEffects 
  bloomIntensity={0.4}
  vignetteDarkness={0.6}
  chromaticAberration={0.002}
/>

// Or full pipeline:
const pipeline = createPostProcessingPipeline({
  renderer, scene, camera,
  effects: [
    { type: 'bloom', intensity: 0.4, threshold: 0.75 },
    { type: 'ssao', radius: 0.5, intensity: 1.0 },
    { type: 'vignette', offset: 0.25, darkness: 0.6 },
    { type: 'depthOfField', focus: 0.01, aperture: 0.02 },
    { type: 'filmGrain', intensity: 0.1 }
  ]
})
```

**Benefit**: Unified post-processing with SSAO, motion blur, color grading.

---

## Migration Priority

| Priority | Component | Lines Replaced | Effort |
|----------|-----------|----------------|--------|
| 🔴 High | SDFTerrain + marchingCubes | ~600 | 4h |
| 🔴 High | Water + shaders | ~250 | 2h |
| 🟡 Medium | VolumetricEffects | ~280 | 2h |
| 🟡 Medium | GPUInstancing | ~200 | 2h |
| 🟡 Medium | Fur shaders | ~75 | 1h |
| 🟢 Low | WeatherParticles | ~100 | 1h |
| 🟢 Low | Post-processing | ~30 | 0.5h |
| **Total** | | **~1,535 lines** | **~12.5h** |

---

## Integration Strategy

### Phase 1: Add Strata Dependency
```bash
cd /path/to/nodejs-rivermarsh
pnpm add @jbcom/strata
```

### Phase 2: Create Compatibility Layer
```typescript
// src/lib/strata-compat.ts
// Re-export Strata functions with Rivermarsh's expected signatures
import { sdTerrain, getBiomeAt } from '@jbcom/strata/core'
import { DEFAULT_BIOMES } from '@/components/SDFTerrain'

export function getTerrainHeight(x: number, z: number): number {
  return getBiomeAt(x, z, DEFAULT_BIOMES).height
}
```

### Phase 3: Replace Components One-by-One
1. Start with Water (isolated, easy to test)
2. Then VolumetricEffects
3. Then GPUInstancing
4. Finally SDFTerrain (most complex)

### Phase 4: Remove Old Code
- Delete `src/shaders/*.ts`
- Delete `src/utils/sdf.ts`
- Delete `src/utils/marchingCubes.ts`
- Simplify components

---

## What Rivers of Reckoning Learned

1. **Correct `fbm` signature**: `fbm(x, y, z, octaves?)` - NOT `fbm(x, z, octaves, lacunarity, seed)`
2. **Vegetation components are React components**: `<GrassInstances>` not `createGrassInstances()`
3. **Strata is on npm**: `@jbcom/strata@1.4.7` - lock file confirms it works
4. **Peer dependency**: Need `@react-three/rapier` for some components
5. **Post-processing**: `CinematicEffects` wraps common effects nicely

---

## Rivermarsh-Specific Considerations

### Keep Custom:
- **Otter character model** (too specialized for Strata)
- **NPC AI system** (Yuka integration is great)
- **ECS architecture** (Miniplex works well)
- **Touch controls** (nipplejs is perfect for mobile)

### Replace with Strata:
- **Terrain generation**
- **Water rendering**
- **Volumetrics**
- **Vegetation instancing**
- **Fur shaders** (use `createFurSystem`)

---

## PR Structure for Rivermarsh

```
feat(strata): Integrate @jbcom/strata for procedural generation

Closes #2

## Changes
- Add @jbcom/strata dependency
- Replace custom SDF utilities with Strata core functions
- Replace Water component with Strata AdvancedWater
- Replace VolumetricEffects with Strata implementation
- Replace GPUInstancing with Strata components
- Replace fur shaders with Strata createFurSystem
- Delete ~1,500 lines of custom shader/utility code

## Test Plan
- [ ] Terrain renders correctly with caves
- [ ] Water has caustics and foam
- [ ] Fog/underwater effects work
- [ ] Vegetation instances render with wind
- [ ] Otter fur animates properly
- [ ] Performance maintains 60fps on mobile
```

---

## Cross-Repository Benefits

| From Rivers | To Rivermarsh |
|-------------|---------------|
| Strata API knowledge | Accelerates Issue #2 |
| Combat system | New gameplay mechanic |
| XP/Leveling | Progression system |
| Constants pattern | Cleaner config |
| GAME_IDENTITY.md | Design documentation |

| From Rivermarsh | To Rivers |
|-----------------|-----------|
| ECS architecture | Better state management |
| Physics (Rapier) | Real collisions |
| Yuka AI | Smarter enemies |
| Touch controls | Mobile support |
| Comprehensive testing | Better quality |

---

*This plan enables both projects to benefit from shared work.*
