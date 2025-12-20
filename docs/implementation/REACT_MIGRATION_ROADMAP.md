# React Three Fiber Migration Roadmap

**Created**: 2025-10-26  
**Status**: Planning Phase  
**Target**: Complete by Phase 2 of Production Migration Plan

## Overview

This document outlines the step-by-step migration of Otter River Rush from vanilla TypeScript + Canvas2D to React + Three.js using React Three Fiber (R3F). The migration will modernize the architecture while maintaining all current features and improving performance with WebGL rendering.

---

## Why React Three Fiber?

### Benefits
- **Declarative Rendering**: Components instead of imperative draw calls
- **WebGL Performance**: Hardware-accelerated 3D rendering
- **Modern React**: Hooks, context, and state management
- **Ecosystem**: Large community, many helper libraries (@react-three/drei)
- **TypeScript Support**: Excellent type definitions
- **Developer Experience**: Better debugging, hot reload, component reuse

### Tradeoffs
- **Learning Curve**: Team needs to learn R3F and Three.js
- **Bundle Size**: Slightly larger (Three.js ~150KB gzipped)
- **Initial Effort**: Significant refactor required
- **Complexity**: More abstractions to understand

### Decision
✅ **Proceed with Migration** - Benefits outweigh costs for long-term maintainability

---

## Current Architecture

### Vanilla Canvas2D Stack
```
index.html (UI)
  └── src/main.ts (Entry)
      └── Game.ts (Main Class)
          ├── Renderer.ts (Canvas2D)
          ├── UIRenderer.ts (HUD)
          ├── BackgroundGenerator.ts
          ├── Otter.ts (Player Entity)
          ├── Rock.ts (Obstacle Entity)
          ├── Coin.ts (Collectible)
          ├── ProceduralGenerator.ts
          ├── AudioManager.ts
          ├── InputHandler.ts
          └── Various Managers (Score, Save, Achievement)
```

### Pain Points
- **Imperative Rendering**: Manual canvas draw calls
- **State Management**: Scattered across Game.ts and entities
- **Testing**: Hard to test rendering logic
- **Code Organization**: Single Game class handles too much
- **Performance**: Canvas2D has limits for complex graphics

---

## Target Architecture

### React Three Fiber Stack
```
index.html
  └── src/main-react.tsx (Entry)
      └── App.tsx (Root Component)
          ├── GameCanvas.tsx (R3F Canvas)
          │   ├── Scene.tsx (3D Scene)
          │   │   ├── Background.tsx (Mesh/Shaders)
          │   │   ├── Otter.tsx (3D Model/Sprite)
          │   │   ├── Rock.tsx (3D Model/Sprite)
          │   │   ├── Coin.tsx (Sprite)
          │   │   ├── Gem.tsx (Sprite)
          │   │   └── Effects.tsx (Post-processing)
          │   └── Lighting.tsx
          ├── HUD.tsx (UI Overlay)
          │   ├── Score.tsx
          │   ├── Hearts.tsx
          │   ├── PowerUps.tsx
          │   └── MiniMap.tsx
          ├── MainMenu.tsx (DaisyUI)
          ├── GameOver.tsx (DaisyUI)
          ├── Settings.tsx (DaisyUI)
          └── Leaderboard.tsx (DaisyUI)

State Management:
  └── stores/
      ├── useGameStore.ts (Zustand)
      ├── usePlayerStore.ts
      ├── useSettingsStore.ts
      └── useAchievementStore.ts
```

### Improvements
- **Component-Based**: Modular, reusable components
- **Declarative**: React manages rendering
- **Centralized State**: Zustand for global state
- **Better Testing**: Test components in isolation
- **Performance**: WebGL > Canvas2D for many sprites
- **Modern DX**: React DevTools, better debugging

---

## Migration Phases

### Phase 1: Setup & Foundation (Week 1)

#### 1.1 Install Dependencies
```bash
npm install react@^19 react-dom@^19
npm install @react-three/fiber@^9 @react-three/drei@^10 three@^0.180
npm install zustand@^5
npm install -D @types/react @types/react-dom @types/three
```

✅ **Already Complete** - Dependencies installed in package.json

#### 1.2 Configure Build
- ✅ Update `vite.config.ts` for React
- ✅ Add JSX/TSX support
- ✅ Configure Fast Refresh

**Action**: Verify Vite config:
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // ... existing config
});
```

#### 1.3 Create Entry Point
- ✅ Create `src/main-react.tsx` (already exists)
- Switch `index.html` to load `main-react.tsx`
- Keep `main.ts` for gradual migration

#### 1.4 Setup State Management
```typescript
// src/stores/useGameStore.ts
import { create } from 'zustand';

interface GameState {
  state: 'menu' | 'playing' | 'paused' | 'gameover';
  score: number;
  distance: number;
  coins: number;
  gems: number;
  lives: number;
  // ... methods
}

export const useGameStore = create<GameState>((set) => ({
  state: 'menu',
  score: 0,
  // ... initial state
  
  startGame: () => set({ state: 'playing' }),
  pauseGame: () => set({ state: 'paused' }),
  // ... actions
}));
```

### Phase 2: Core Game Loop (Week 2-3)

#### 2.1 Create GameCanvas Component
```tsx
// src/components/game/GameCanvas.tsx
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';

export function GameCanvas() {
  return (
    <Canvas
      orthographic
      camera={{ zoom: 1, position: [0, 0, 100] }}
    >
      <ambientLight intensity={0.5} />
      <Scene />
    </Canvas>
  );
}
```

#### 2.2 Migrate Entities to Components

**Otter Component**:
```tsx
// src/components/game/Otter.tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sprite } from '@react-three/drei';

export function Otter() {
  const ref = useRef<THREE.Sprite>(null);
  const { lane, lives } = usePlayerStore();
  
  useFrame((state, delta) => {
    // Update position based on lane
    if (ref.current) {
      ref.current.position.x = getLaneX(lane);
    }
  });
  
  return (
    <Sprite
      ref={ref}
      position={[0, 0, 0]}
      scale={[60, 60, 1]}
    >
      <spriteMaterial map={otterTexture} />
    </Sprite>
  );
}
```

**Rock Component**:
```tsx
// src/components/game/Rock.tsx
interface RockProps {
  id: string;
  position: [number, number, number];
  variant: number;
  onCollision: () => void;
}

export function Rock({ id, position, variant }: RockProps) {
  const texture = useRockTexture(variant);
  
  return (
    <Sprite position={position} scale={[40, 40, 1]}>
      <spriteMaterial map={texture} />
    </Sprite>
  );
}
```

#### 2.3 Implement Scene Component
```tsx
// src/components/game/Scene.tsx
export function Scene() {
  const { obstacles, coins, gems } = useGameStore();
  
  return (
    <>
      <Background />
      <Otter />
      
      {obstacles.map((rock) => (
        <Rock key={rock.id} {...rock} />
      ))}
      
      {coins.map((coin) => (
        <Coin key={coin.id} {...coin} />
      ))}
      
      {gems.map((gem) => (
        <Gem key={gem.id} {...gem} />
      ))}
    </>
  );
}
```

#### 2.4 Collision Detection
```tsx
// Use React Three Fiber's useFrame for collision detection
function useCollisionDetection() {
  const { checkCollision } = useGameStore();
  
  useFrame(() => {
    // Check collisions each frame
    checkCollision();
  });
}
```

### Phase 3: UI Components (Week 3)

#### 3.1 Migrate HUD
```tsx
// src/components/ui/HUD.tsx
export function HUD() {
  const { score, distance, coins, lives } = useGameStore();
  
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="p-4">
        <div className="text-3xl font-bold text-white">
          Score: {score}
        </div>
        <div className="flex gap-2">
          {Array.from({ length: lives }).map((_, i) => (
            <span key={i}>❤️</span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

#### 3.2 Migrate Menus (Already using Tailwind + DaisyUI)
- ✅ MainMenu component
- ✅ GameOver component  
- ✅ Settings component
- ✅ Leaderboard component

Just need to wire them to Zustand stores instead of Game.ts methods.

### Phase 4: Audio & Effects (Week 4)

#### 4.1 Audio Integration
```tsx
// src/hooks/useAudio.ts
export function useAudio() {
  const { soundEnabled, musicEnabled } = useSettingsStore();
  
  const playSound = useCallback((name: string) => {
    if (soundEnabled) {
      audioManager.playSound(name);
    }
  }, [soundEnabled]);
  
  return { playSound };
}
```

#### 4.2 Post-Processing Effects
```tsx
// src/components/game/Effects.tsx
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

export function Effects() {
  const { reducedMotion } = useSettingsStore();
  
  if (reducedMotion) return null;
  
  return (
    <EffectComposer>
      <Bloom intensity={0.5} />
      <Vignette eskil={false} offset={0.1} darkness={0.5} />
    </EffectComposer>
  );
}
```

### Phase 5: Testing & Optimization (Week 5)

#### 5.1 Component Testing
```tsx
// src/components/game/__tests__/Otter.test.tsx
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { Otter } from '../Otter';

describe('Otter', () => {
  it('renders without crashing', () => {
    render(
      <Canvas>
        <Otter />
      </Canvas>
    );
  });
});
```

#### 5.2 Performance Optimization
- Implement `React.memo` for expensive components
- Use `useMemo` for complex calculations
- Implement object pooling with Zustand
- Optimize Three.js materials and geometries

#### 5.3 Bundle Size Analysis
```bash
npm run analyze
```
- Ensure Three.js is tree-shaken properly
- Code-split React components
- Lazy load heavy assets

### Phase 6: Feature Parity (Week 6)

#### 6.1 Verify All Features
- [ ] All 4 game modes working
- [ ] All power-ups functional
- [ ] Achievement system integrated
- [ ] Leaderboard persists
- [ ] Settings apply correctly
- [ ] Mobile touch controls
- [ ] Keyboard controls
- [ ] Audio system working

#### 6.2 Performance Targets
- [ ] 60 FPS on target devices
- [ ] < 3MB bundle size (gzipped)
- [ ] < 3s load time
- [ ] Smooth animations

#### 6.3 Cleanup
- Remove old Canvas2D code
- Update documentation
- Remove `main.ts` entry point
- Update build scripts

---

## Detailed Implementation Guide

### File-by-File Migration

#### Priority 1: Core Game Loop
1. ✅ `src/stores/useGameStore.ts` - Central state
2. `src/components/game/GameCanvas.tsx` - R3F Canvas
3. `src/components/game/Scene.tsx` - Scene container
4. `src/components/game/Otter.tsx` - Player
5. `src/components/game/Rock.tsx` - Obstacles

#### Priority 2: Collectibles & Effects
6. `src/components/game/Coin.tsx`
7. `src/components/game/Gem.tsx`
8. `src/components/game/PowerUp.tsx`
9. `src/components/game/Particle.tsx`
10. `src/components/game/Background.tsx`

#### Priority 3: UI Layer
11. `src/components/ui/HUD.tsx`
12. `src/components/ui/MainMenu.tsx`
13. `src/components/ui/GameOver.tsx`
14. `src/components/ui/PauseMenu.tsx`
15. `src/components/ui/Settings.tsx`

#### Priority 4: Systems
16. `src/hooks/useCollision.ts`
17. `src/hooks/useInput.ts` 
18. `src/hooks/useAudio.ts`
19. `src/hooks/useProceduralGeneration.ts`
20. `src/stores/usePlayerStore.ts`
21. `src/stores/useSettingsStore.ts`

---

## State Management Architecture

### Zustand Stores

#### useGameStore
```typescript
interface GameStore {
  // Game state
  state: GameState;
  mode: GameMode;
  score: number;
  distance: number;
  coins: number;
  gems: number;
  
  // Entities
  obstacles: Rock[];
  collectibles: (Coin | Gem)[];
  powerUps: PowerUp[];
  particles: Particle[];
  
  // Actions
  startGame: (mode: GameMode) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  updateGame: (delta: number) => void;
  
  // Entity management
  addObstacle: (rock: Rock) => void;
  removeObstacle: (id: string) => void;
  collectCoin: (id: string) => void;
  // ... more actions
}
```

#### usePlayerStore
```typescript
interface PlayerStore {
  lane: number;
  lives: number;
  hasShield: boolean;
  isGhost: boolean;
  activePowerUps: PowerUpStatus[];
  
  moveLeft: () => void;
  moveRight: () => void;
  loseLife: () => void;
  addPowerUp: (type: PowerUpType) => void;
}
```

#### useSettingsStore
```typescript
interface SettingsStore {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  difficulty: 'easy' | 'normal' | 'hard';
  particles: 'low' | 'normal' | 'high';
  screenShake: boolean;
  reducedMotion: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}
```

---

## Three.js Concepts

### Orthographic Camera (2D-like)
```typescript
// For 2D game in 3D space
<OrthographicCamera
  makeDefault
  zoom={1}
  position={[0, 0, 100]}
  near={0.1}
  far={1000}
/>
```

### Sprites for 2D Elements
```tsx
<Sprite position={[x, y, 0]} scale={[width, height, 1]}>
  <spriteMaterial map={texture} transparent />
</Sprite>
```

### Textures from Images
```typescript
const texture = useLoader(THREE.TextureLoader, '/sprites/otter.png');
```

### Animation Loop
```typescript
useFrame((state, delta) => {
  // Runs 60 times per second
  // Update game logic here
});
```

---

## Testing Strategy

### Unit Tests (Vitest)
```typescript
// Test game logic
describe('useGameStore', () => {
  it('starts game correctly', () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.startGame('classic'));
    expect(result.current.state).toBe('playing');
  });
});
```

### Component Tests (React Testing Library)
```typescript
// Test React components
import { render, screen } from '@testing-library/react';

describe('HUD', () => {
  it('displays score', () => {
    render(<HUD />);
    expect(screen.getByText(/Score:/)).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)
```typescript
// Test full game flow
test('can play game', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Classic');
  await page.keyboard.press('ArrowRight');
  // ... test gameplay
});
```

---

## Performance Considerations

### Optimization Techniques

1. **Memoization**
   ```tsx
   const Otter = React.memo(({ lane }) => {
     // Only re-render when lane changes
   });
   ```

2. **useMemo for Calculations**
   ```tsx
   const laneX = useMemo(() => calculateLaneX(lane), [lane]);
   ```

3. **Object Pooling**
   ```typescript
   const particlePool = useMemo(() => new ObjectPool(Particle, 100), []);
   ```

4. **Texture Atlases**
   ```typescript
   // Combine sprites into single texture
   const atlas = useLoader(THREE.TextureLoader, '/sprites/atlas.png');
   ```

5. **Frustum Culling**
   ```tsx
   // Three.js automatically culls off-screen objects
   <Sprite frustumCulled={true} />
   ```

6. **LOD (Level of Detail)**
   ```tsx
   // Simplify distant objects
   <LOD>
     <Sprite distance={0} geometry={highDetail} />
     <Sprite distance={100} geometry={lowDetail} />
   </LOD>
   ```

---

## Migration Checklist

### Pre-Migration
- [x] Install React and R3F dependencies
- [x] Setup Tailwind CSS + DaisyUI
- [x] Create responsive canvas foundation
- [x] Plan state management architecture

### Phase 1: Foundation
- [ ] Configure Vite for React
- [ ] Setup Zustand stores
- [ ] Create main App component
- [ ] Setup R3F Canvas

### Phase 2: Core Game
- [ ] Migrate Otter to component
- [ ] Migrate Rock to component
- [ ] Implement collision detection
- [ ] Setup game loop with useFrame
- [ ] Migrate ProceduralGenerator logic

### Phase 3: Collectibles
- [ ] Migrate Coin component
- [ ] Migrate Gem component
- [ ] Migrate PowerUp component
- [ ] Test collection mechanics

### Phase 4: UI
- [ ] Migrate HUD component
- [ ] Wire MainMenu to Zustand
- [ ] Wire GameOver to Zustand
- [ ] Wire Settings to Zustand

### Phase 5: Polish
- [ ] Add particle effects
- [ ] Add post-processing
- [ ] Optimize performance
- [ ] Test on all devices

### Phase 6: Cleanup
- [ ] Remove old Canvas2D code
- [ ] Update documentation
- [ ] Run full test suite
- [ ] Deploy and test

---

## Risk Mitigation

### Known Risks

1. **Performance Regression**
   - Mitigation: Benchmark before/after, optimize aggressively
   - Fallback: Keep Canvas2D version as option

2. **Three.js Learning Curve**
   - Mitigation: Team training, documentation, examples
   - Timeline buffer built in

3. **Mobile Performance**
   - Mitigation: Test early, implement LOD, reduce effects
   - Use lower resolution textures on mobile

4. **Bundle Size Increase**
   - Mitigation: Code splitting, tree shaking, lazy loading
   - Monitor with Lighthouse CI

5. **Breaking Changes**
   - Mitigation: Comprehensive testing, gradual rollout
   - Feature flag to toggle React version

---

## Success Metrics

### Must Achieve
- ✅ All features from Canvas2D version working
- ✅ 60 FPS on target devices
- ✅ No regression in mobile performance
- ✅ < 3MB bundle size (gzipped)
- ✅ All tests passing

### Nice to Have
- Better graphics with WebGL effects
- Improved particle systems
- Smooth 3D transitions
- Enhanced visual polish

---

## Resources

### Documentation
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Docs](https://threejs.org/docs/)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [@react-three/drei Helpers](https://github.com/pmndrs/drei)

### Examples
- [R3F Examples](https://docs.pmnd.rs/react-three-fiber/getting-started/examples)
- [Poimandres Projects](https://pmnd.rs/)

### Community
- [Poimandres Discord](https://discord.gg/poimandres)
- [Three.js Discord](https://discord.gg/threejs)

---

## Timeline Summary

| Phase | Duration | Focus |
|-------|----------|-------|
| 1 | Week 1 | Setup & Foundation |
| 2 | Week 2-3 | Core Game Loop |
| 3 | Week 3 | UI Components |
| 4 | Week 4 | Audio & Effects |
| 5 | Week 5 | Testing & Optimization |
| 6 | Week 6 | Feature Parity & Cleanup |

**Total**: 6 weeks (with buffer)

---

## Next Steps

1. ✅ Complete this planning document
2. Create GitHub issue for migration
3. Setup project board for tracking
4. Begin Phase 1: Foundation setup
5. Weekly progress reviews

---

**Last Updated**: 2025-10-26  
**Status**: Ready to Begin Phase 1  
**Owner**: Development Team
