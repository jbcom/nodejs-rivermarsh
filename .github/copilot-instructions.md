# Rivermarsh - GitHub Copilot Instructions

## 🎮 Project Context

**Rivermarsh** is a mobile-first 3D exploration game built with:
- React Three Fiber + `@jbcom/strata`
- Miniplex ECS
- Zustand state management
- Capacitor for mobile

### Current Phase: Integration

We are unifying three codebases. Reference code in `integration/pending/` is **read-only**.

## 🛠️ Development Commands

```bash
# Package manager: pnpm (required)
pnpm install          # Install dependencies
pnpm run dev          # Dev server at localhost:5173
pnpm run build        # Production build
pnpm run test         # Vitest unit tests
pnpm run test:e2e     # Playwright E2E tests
pnpm run typecheck    # TypeScript validation
pnpm run lint         # ESLint
```

## 📁 Key Directories

| Path | Purpose |
|------|---------|
| `src/components/` | React Three Fiber components |
| `src/ecs/` | Entity Component System (Miniplex) |
| `src/ecs/systems/` | Game systems (AI, Weather, Time) |
| `src/stores/` | Zustand state stores |
| `integration/pending/` | Frozen reference code (DO NOT MODIFY) |

## 🎯 Strata Components (ALWAYS USE)

When implementing visual features, use `@jbcom/strata`:

```typescript
import {
  AdvancedWater,     // Water with caustics, foam
  ProceduralSky,     // Dynamic sky/sun
  Rain, Snow,        // Weather particles
  VolumetricFog,     // Atmospheric effects
  ParticleEmitter,   // Custom particles
  GrassInstances,    // GPU vegetation
  TreeInstances,
  RockInstances,
} from '@jbcom/strata';
```

**Rule: Never recreate what Strata provides.**

## 📝 Code Patterns

### React Three Fiber Component

```typescript
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface PlayerProps {
  position: [number, number, number];
  onMove?: (pos: THREE.Vector3) => void;
}

export function Player({ position, onMove }: PlayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Animation logic
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="brown" />
    </mesh>
  );
}
```

### ECS System

```typescript
import { world } from '../world';
import { Position, Velocity } from '../components';

export function createMovementSystem() {
  const entities = world.with('position', 'velocity');

  return (delta: number) => {
    for (const entity of entities) {
      entity.position.x += entity.velocity.x * delta;
      entity.position.y += entity.velocity.y * delta;
      entity.position.z += entity.velocity.z * delta;
    }
  };
}
```

### Zustand Store

```typescript
import { create } from 'zustand';

interface GameState {
  health: number;
  score: number;
  takeDamage: (amount: number) => void;
  addScore: (points: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  health: 100,
  score: 0,
  takeDamage: (amount) => set((s) => ({ health: Math.max(0, s.health - amount) })),
  addScore: (points) => set((s) => ({ score: s.score + points })),
}));
```

### Testing with Vitest

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from './gameStore';

describe('GameStore', () => {
  it('should reduce health on damage', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.takeDamage(25);
    });
    
    expect(result.current.health).toBe(75);
  });
});
```

## ⚠️ Critical Rules

1. **Mobile-First**: Test touch interactions
2. **Performance**: Avoid allocations in `useFrame`
3. **ECS**: Game logic in systems, not components
4. **Strata**: Use library components, don't recreate
5. **Types**: Full TypeScript, no `any`

## 🔗 Feature Issues

Port features from integration sources by referencing:
- #39-51: Rivers of Reckoning features
- #28-33: Core integration tasks

Comment source file when porting:
```typescript
// Ported from: integration/pending/otter-river-rush/src/components/VirtualJoystick.tsx
```

## 📋 Commit Convention

```
feat(scope): add feature
fix(scope): fix bug
port(source): port from Rivers/Otter
test: add tests
docs: update docs
refactor: code improvement
```

## 🧪 Test Requirements

- Unit tests for stores and utilities
- Integration tests for ECS systems
- E2E tests for critical user flows
- Snapshot tests for UI components

Run before PR:
```bash
pnpm run typecheck && pnpm run lint && pnpm run test
```
