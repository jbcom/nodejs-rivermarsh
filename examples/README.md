# Rivermarsh Examples

This directory contains standalone examples demonstrating how to use `@jbcom/strata` within the Rivermarsh engine.

## Examples

### 1. Basic Strata (`BasicStrata.tsx`)
Shows the fundamental atmospheric components:
- `ProceduralSky`: Dynamic skybox with sun/moon positioning.
- `AdvancedWater`: High-performance water with caustics and foam.
- `VolumetricFogMesh`: Height-based volumetric fog for atmospheric depth.

### 2. Weather System (`WeatherSystem.tsx`)
Demonstrates Strata's particle systems:
- `Rain`: GPU-accelerated rain with wind influence.
- `Snow`: Soft snow particles with turbulence.
- Dynamic intensity and day/night transitions.

### 3. Combat Demo (`CombatDemo.tsx`)
Demonstrates the integration of:
- `miniplex`: Entity management and combat logic.
- `@react-three/rapier`: Physics-based movement and collisions.
- Player interaction and visual feedback.

## How to use these in your code

All Strata components are designed to work seamlessly with `@react-three/fiber`.

```tsx
import { AdvancedWater, ProceduralSky } from '@jbcom/strata';

function Scene() {
  return (
    <>
      <ProceduralSky timeOfDay={0.5} />
      <AdvancedWater size={100} color="#006994" />
    </>
  );
}
```

## Running the Examples

(Note: To make these runnable, you can import them into your main `App.tsx` or set up a separate Vite entry point).
