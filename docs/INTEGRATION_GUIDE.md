# Integration Guide - Otter River Rush

Complete guide for integrating all systems and components.

## Architecture Overview

```
React Three Fiber (3D Rendering)
    ↓
Miniplex ECS (Entity Management)
    ↓
Zustand (Global State)
    ↓
Game Systems (Logic)
    ↓
Components (Presentation)
```

## ECS Integration

### Entity Component System with Miniplex-+ng, string> };
  // ... more components
};

export const world = new World<Entity>();
export const ECS = createReactAPI(world);
```

**Queries:**
```typescript
export const queries = {
  player: world.with('player', 'position', 'model'),
  obstacles: world.with('obstacle', 'position', 'collider'),
  collectibles: world.with('collectible', 'position'),
  moving: world.with('position', 'velocity'),
};
```

**Spawn Helpers:**
```typescript
export const spawn = {
  otter: (lane: -1 | 0 | 1 = 0) => world.add({
    player: true,
    position: { x: lane * 2, y: -3, z: 0 },
    model: { url: '/models/otter-rusty.glb', scale: 0.5 },
    animation: {
      current: 'idle',
      urls: {
        idle: '/models/otter-rusty.glb',
        walk: '/models/otter-rusty-walk.glb',
        run: '/models/otter-rusty-run.glb',
        // ... 8 more animations
      },
    },
    health: 3,
  }),
  
  rock: (x: number, y: number, variant: number) => world.add({
    obstacle: true,
    position: { x, y, z: 0 },
    velocity: { x: 0, y: -5, z: 0 },
    model: { 
      url: [
        '/models/rock-river.glb',
        '/models/rock-mossy.glb',
        '/models/rock-cracked.glb',
        '/models/rock-crystal.glb',
      ][variant % 4],
      scale: 0.8,
    },
    collider: { width: 0.8, height: 0.8, depth: 0.8 },
    variant,
  }),
};
```

## System Integration

### 1. Movement System

```typescript
// src/ecs/systems.tsx
export function MovementSystem() {
  useFrame((_, dt) => {
    for (const entity of queries.moving) {
      entity.position.x += entity.velocity!.x * dt;
      entity.position.y += entity.velocity!.y * dt;
      entity.position.z += entity.velocity!.z * dt;
    }
  });
  return null;
}
```

### 2. Collision System

```typescript
export function CollisionSystem() {
  const { status } = useGameStore();
  
  useFrame(() => {
    if (status !== 'playing') return;
    
    const [player] = queries.player.entities;
    if (!player) return;
    
    for (const obstacle of queries.obstacles) {
      if (checkCollision(player, obstacle)) {
        handleCollision(player, obstacle);
      }
    }
  });
  return null;
}
```

### 3. Spawner System

```typescript
export function SpawnerSystem() {
  const { status } = useGameStore();
  
  useFrame((state) => {
    if (status !== 'playing') return;
    
    const time = state.clock.elapsedTime;
    
    // Spawn obstacle every 2 seconds
    if (Math.floor(time * 0.5) > Math.floor((time - 0.016) * 0.5)) {
      const lane = LANES[Math.floor(Math.random() * 3)];
      const variant = Math.floor(Math.random() * 4);
      spawn.rock(lane, 8, variant);
    }
  });
  return null;
}
```

### 4. Score System

```typescript
export function ScoreSystem() {
  useFrame((_, dt) => {
    const { status, updateScore, updateDistance } = useGameStore.getState();
    if (status !== 'playing') return;
    
    updateScore(Math.floor(dt * 10));
    updateDistance(dt * 5);
  });
  return null;
}
```

## Component Integration

### Entity Renderer

```typescript
// src/components/game/EntityRenderer.tsx
import { useGLTF } from '@react-three/drei';
import { ECS, queries } from '../../ecs/world';

export function ObstaclesRenderer() {
  return (
    <ECS.Entities in={queries.obstacles}>
      {(entity) => {
        const { scene } = useGLTF(entity.model!.url);
        return (
          <ECS.Entity entity={entity}>
            <ECS.Component name="three">
              <primitive 
                object={scene.clone()}
                position={[entity.position.x, entity.position.y, entity.position.z]}
                scale={entity.model!.scale || 1}
              />
            </ECS.Component>
          </ECS.Entity>
        );
      }}
    </ECS.Entities>
  );
}
```

### Player Renderer with Animations

```typescript
export function PlayerRenderer() {
  return (
    <ECS.Entities in={queries.player}>
      {(entity) => {
        const animationUrl = entity.animation?.urls[entity.animation.current];
        const { scene } = useGLTF(animationUrl || entity.model!.url);
        
        return (
          <ECS.Entity entity={entity}>
            <ECS.Component name="three">
              <group position={[entity.position.x, entity.position.y, entity.position.z]}>
                <primitive object={scene.clone()} scale={entity.model!.scale} />
              </group>
            </ECS.Component>
          </ECS.Entity>
        );
      }}
    </ECS.Entities>
  );
}
```

## State Management

### Zustand Store

```typescript
// src/hooks/useGameStore.ts
import create from 'zustand';

interface GameState {
  status: 'menu' | 'playing' | 'paused' | 'game_over';
  score: number;
  distance: number;
  coins: number;
  gems: number;
  combo: number;
  
  startGame: (mode: GameMode) => void;
  pauseGame: () => void;
  endGame: () => void;
  updateScore: (points: number) => void;
  collectCoin: (value: number) => void;
  // ... more actions
}

export const useGameStore = create<GameState>((set) => ({
  status: 'menu',
  score: 0,
  // ... initial state
  
  startGame: (mode) => set({ status: 'playing', score: 0, /* reset */ }),
  updateScore: (points) => set((state) => ({ score: state.score + points })),
  // ... more actions
}));
```

## Input Integration

### Keyboard + Touch

```typescript
// src/ecs/input-system.tsx
export function InputSystem() {
  const { status } = useGameStore();
  
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const [player] = queries.player.entities;
      if (!player) return;
      
      if (e.key === 'ArrowLeft') {
        // Move left
      }
      if (e.key === 'ArrowRight') {
        // Move right
      }
      if (e.key === ' ') {
        // Jump
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);
  
  return null;
}
```

### Touch Input

```typescript
// src/ecs/touch-input-system.tsx
export function TouchInputSystem() {
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    
    function handleTouchStart(e: TouchEvent) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
    
    function handleTouchEnd(e: TouchEvent) {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      
      if (Math.abs(deltaX) > 50) {
        // Swipe left/right
      }
      if (deltaY < -50) {
        // Swipe up (jump)
      }
    }
    
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    // ... cleanup
  }, []);
  
  return null;
}
```

## Animation Integration

### Animation Mixer

```typescript
// src/hooks/useAnimationMixer.ts
export function useAnimationMixer(
  modelUrl: string,
  animationUrls: Record<string, string>,
  currentAnimation: string
) {
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Map<string, THREE.AnimationAction>>(new Map());
  
  const { scene, animations } = useGLTF(modelUrl);
  
  useEffect(() => {
    if (!scene) return;
    const mixer = new THREE.AnimationMixer(scene);
    mixerRef.current = mixer;
    
    // Load animations
    for (const clip of animations) {
      const action = mixer.clipAction(clip);
      actionsRef.current.set(clip.name, action);
    }
    
    return () => mixer.stopAllAction();
  }, [scene, animations]);
  
  // Switch animations
  useEffect(() => {
    const action = actionsRef.current.get(currentAnimation);
    if (action) {
      action.reset().fadeIn(0.3).play();
    }
  }, [currentAnimation]);
  
  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });
  
  return { mixer: mixerRef.current, actions: actionsRef.current };
}
```

## Asset Loading

### Preload All Models

```typescript
// src/components/game/EntityRenderer.tsx
import { useGLTF } from '@react-three/drei';

// Preload at module level
useGLTF.preload('/models/otter-rusty.glb');
useGLTF.preload('/models/otter-rusty-walk.glb');
useGLTF.preload('/models/otter-rusty-run.glb');
// ... all 18 models
```

### Loading Screen

```typescript
// src/hooks/useAssetPreloader.tsx
export function useAssetPreloader() {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const assets = [...models, ...animations];
    let loadedCount = 0;
    
    assets.forEach(async (url) => {
      await useGLTF.preload(url);
      loadedCount++;
      setProgress((loadedCount / assets.length) * 100);
    });
    
    setLoaded(true);
  }, []);
  
  return { loaded, progress };
}
```

## Collision System

### AABB Collision Detection

```typescript
// src/utils/collision-helpers.ts
export function checkAABBCollision(a: AABB, b: AABB): boolean {
  return (
    a.minX < b.maxX &&
    a.maxX > b.minX &&
    a.minY < b.maxY &&
    a.maxY > b.minY
  );
}

export function getAABB(entity: Entity): AABB {
  return {
    minX: entity.position.x - entity.collider.width / 2,
    maxX: entity.position.x + entity.collider.width / 2,
    minY: entity.position.y - entity.collider.height / 2,
    maxY: entity.position.y + entity.collider.height / 2,
  };
}
```

### Spatial Partitioning

```typescript
export class QuadTree {
  insert(entity: Entity): void {
    // Insert into appropriate quadrant
  }
  
  retrieve(entity: Entity): Entity[] {
    // Get nearby entities
  }
}

// Use in collision system
const quadTree = new QuadTree(0, { x: 0, y: 0, width: 20, height: 30 });
quadTree.clear();

for (const entity of queries.collidable) {
  quadTree.insert(entity);
}

const nearby = quadTree.retrieve(player);
```

## Power-Up System

### Power-Up Types

```typescript
export const POWER_UPS = {
  SHIELD: {
    id: 'shield',
    duration: 5000,
    effect: (player) => {
      world.addComponent(player, 'invincible', true);
    },
  },
  GHOST: {
    id: 'ghost',
    duration: 5000,
    effect: (player) => {
      world.addComponent(player, 'ghost', true);
    },
  },
  MAGNET: {
    id: 'magnet',
    duration: 8000,
    radius: 3,
    effect: (player) => {
      // Attract nearby collectibles
    },
  },
  MULTIPLIER: {
    id: 'multiplier',
    duration: 10000,
    value: 2,
    effect: (player) => {
      useGameStore.getState().activatePowerUp('multiplier', 10000);
    },
  },
  SLOW_MOTION: {
    id: 'slow_motion',
    duration: 5000,
    factor: 0.5,
    effect: () => {
      // Slow down all entities
      for (const entity of queries.moving) {
        if (entity.velocity) {
          entity.velocity.y *= 0.5;
        }
      }
    },
  },
};
```

## Biome System

### Biome Definitions

```typescript
const BIOMES = [
  {
    name: 'Forest Stream',
    waterColor: '#1e40af',
    fogColor: '#0f172a',
    ambient: 0.9,
    obstacles: ['rock', 'log'],
  },
  {
    name: 'Mountain Rapids',
    waterColor: '#0c4a6e',
    fogColor: '#1e3a8a',
    ambient: 1.0,
    obstacles: ['rock', 'boulder'],
  },
  {
    name: 'Canyon River',
    waterColor: '#78350f',
    fogColor: '#451a03',
    ambient: 0.8,
    obstacles: ['rock', 'debris'],
  },
  {
    name: 'Crystal Falls',
    waterColor: '#701a75',
    fogColor: '#3b0764',
    ambient: 1.1,
    obstacles: ['crystal', 'rock'],
  },
];
```

### Biome Transitions

```typescript
export function BiomeSystem() {
  const [currentBiome, setCurrentBiome] = useState(0);
  const { distance } = useGameStore();
  
  useFrame(() => {
    const newBiome = Math.floor(distance / 500) % BIOMES.length;
    if (newBiome !== currentBiome) {
      setCurrentBiome(newBiome);
      // Trigger transition effects
    }
  });
  
  return null;
}
```

## Achievement System

### Achievement Definitions

```typescript
const ACHIEVEMENTS = {
  FIRST_COIN: {
    id: 'first_coin',
    name: 'First Treasure',
    description: 'Collect your first coin',
    check: (stats) => stats.coins >= 1,
  },
  DISTANCE_1000: {
    id: 'distance_1000',
    name: 'Thousand Meter Club',
    description: 'Travel 1000 meters',
    check: (stats) => stats.distance >= 1000,
  },
  COMBO_10: {
    id: 'combo_10',
    name: 'Combo Master',
    description: 'Achieve a 10x combo',
    check: (stats) => stats.combo >= 10,
  },
  // ... 17 more
};
```

### Achievement Checking

```typescript
export function AchievementSystem() {
  const unlocked = useRef(new Set<string>());
  
  useEffect(() => {
    const check = () => {
      const stats = useGameStore.getState();
      
      for (const achievement of Object.values(ACHIEVEMENTS)) {
        if (!unlocked.current.has(achievement.id) && achievement.check(stats)) {
          unlocked.current.add(achievement.id);
          showAchievementPopup(achievement);
        }
      }
    };
    
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return null;
}
```

## Visual Effects

### Post-Processing

```typescript
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

export function VisualEffects() {
  return (
    <EffectComposer>
      <Bloom intensity={0.5} luminanceThreshold={0.9} />
      <Vignette offset={0.3} darkness={0.5} />
    </EffectComposer>
  );
}
```

### Particle System

```typescript
export function ParticleSystem() {
  useFrame((_, dt) => {
    for (const particle of queries.particles) {
      particle.particle!.lifetime -= dt * 1000;
      
      if (particle.particle!.lifetime <= 0) {
        world.addComponent(particle, 'destroyed', true);
      }
    }
  });
  return null;
}
```

## Camera System

### Follow + Shake

```typescript
export function CameraSystem() {
  const { camera } = useThree();
  const shake = useRef({ intensity: 0, decay: 0.9 });
  
  useFrame(() => {
    const [player] = queries.player.entities;
    
    if (player) {
      // Follow player
      const targetY = player.position.y + 3;
      camera.position.y += (targetY - camera.position.y) * 0.1;
    }
    
    // Camera shake
    if (shake.current.intensity > 0.01) {
      camera.position.x += (Math.random() - 0.5) * shake.current.intensity;
      camera.position.y += (Math.random() - 0.5) * shake.current.intensity;
      shake.current.intensity *= shake.current.decay;
    }
  });
  
  // Expose shake trigger
  (window as any).__cameraShake = (intensity: number) => {
    shake.current.intensity = intensity;
  };
  
  return null;
}
```

## Audio Integration

### Audio Manager

```typescript
class AudioManager {
  private sounds = new Map<string, HTMLAudioElement>();
  
  loadSound(name: string, url: string) {
    const audio = new Audio(url);
    audio.preload = 'auto';
    this.sounds.set(name, audio);
  }
  
  playSound(name: string, volume = 0.5) {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.currentTime = 0;
      sound.volume = volume;
      sound.play().catch(() => {});
    }
  }
}

const audioManager = new AudioManager();
```

### Event-Driven Sound

```typescript
// Listen to entity events
queries.collected.onEntityAdded.subscribe((entity) => {
  if (entity.collectible?.type === 'coin') {
    audioManager.playSound('collect', 0.3);
  }
});

queries.destroyed.onEntityAdded.subscribe((entity) => {
  if (entity.obstacle) {
    audioManager.playSound('hit', 0.5);
  }
});
```

## Performance Optimization

### Object Pooling

```typescript
class ObjectPool<T> {
  private available: T[] = [];
  private inUse = new Set<T>();
  
  acquire(): T {
    return this.available.pop() || this.factory();
  }
  
  release(obj: T): void {
    this.inUse.delete(obj);
    this.reset(obj);
    this.available.push(obj);
  }
}

// Use for particles
const particlePool = new ObjectPool(
  () => spawn.particle(0, 0, '#fff'),
  (p) => {
    p.position.x = 0;
    p.position.y = 0;
    p.particle!.lifetime = 1000;
  },
  50
);
```

### Spatial Partitioning

```typescript
const spatialGrid = createSpatialGrid(2);

// Each frame
clearGrid(spatialGrid);
for (const entity of queries.collidable) {
  insertIntoGrid(spatialGrid, entity, entity.position.x, entity.position.y);
}

// Collision detection
const nearby = getNearbyEntities(spatialGrid, player.position.x, player.position.y);
for (const entity of nearby) {
  if (checkCollision(player, entity)) {
    handleCollision(player, entity);
  }
}
```

## Testing Integration

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { createTestWorld } from '../utils/test-helpers';

describe('Player Movement', () => {
  const testWorld = createTestWorld();
  
  beforeEach(() => testWorld.setup());
  afterEach(() => testWorld.cleanup());
  
  it('should move player between lanes', () => {
    const player = testWorld.createPlayer(0);
    
    player.lane = 1;
    player.position.x = 2;
    
    expect(player.position.x).toBe(2);
    testWorld.expectPosition(player, 2, -3);
  });
});
```

### Integration Tests

```typescript
describe('Collision System', () => {
  it('should detect player-obstacle collision', () => {
    const player = testWorld.createPlayer(0);
    const rock = testWorld.createRock(0, -3, 0);
    
    const aabb1 = getAABB(player);
    const aabb2 = getAABB(rock);
    
    expect(checkAABBCollision(aabb1, aabb2)).toBe(true);
  });
});
```

## Debugging

### Debug Tools

```typescript
// Available at window.debug
window.debug.logAllEntities();
window.debug.logEntityCounts();
window.debug.godMode(true);
window.debug.teleportPlayer(0, 0);
window.debug.triggerAnimation('jump');
window.debug.spawnTestEntities();
window.debug.freezeGame();
```

### Performance Monitoring

```typescript
const tracker = new PerformanceTracker();

useFrame((_, dt) => {
  const duration = measurePerformance('collision', () => {
    // Collision detection code
  });
  tracker.record('collision', duration);
});

// View stats
console.log(tracker.getStats('collision'));
```

## State Persistence

### Auto-Save

```typescript
export function usePersistence() {
  useEffect(() => {
    const interval = setInterval(() => {
      const state = useGameStore.getState();
      StorageManager.save({
        highScore: state.highScore,
        totalGamesPlayed: state.totalGamesPlayed,
      });
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
}
```

## Scene Composition

### Complete Scene

```typescript
export function GameCanvas() {
  return (
    <Canvas>
      <Camera />
      <Lighting />
      
      <Suspense fallback={null}>
        <Skybox />
        <River />
        <LaneMarkers />
        <fog />
        
        <EntityRenderer />
        
        <GameSystems />
        <InputSystem />
        <TouchInputSystem />
        <CameraSystem />
        <ScoreSystem />
        <PowerUpSystem />
        <BiomeSystem />
        <DifficultySystem />
        <AchievementSystem />
      </Suspense>
      
      <VisualEffects />
      <Stats />
    </Canvas>
  );
}
```

## UI Overlay

### HUD

```typescript
export function GameHUD() {
  const { score, distance, coins, gems, combo } = useGameStore();
  const player = usePlayer();
  const biome = useBiome();
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="top-4 left-4">
        <div className="text-4xl">{score.toLocaleString()}</div>
        <div className="text-xl">{Math.floor(distance)}m</div>
        {combo > 0 && <div className="text-2xl">{combo}x COMBO!</div>}
      </div>
      
      <div className="top-4 right-4">
        <div>💰 {coins}</div>
        <div>💎 {gems}</div>
      </div>
      
      <div className="bottom-4 left-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={i < player.health ? '' : 'opacity-20'}>
            ❤️
          </div>
        ))}
      </div>
      
      <div className="bottom-4 center">
        {biome.name}
      </div>
    </div>
  );
}
```

## Best Practices

### 1. Use Queries Efficiently
- Create queries once at module level
- Reuse queries instead of creating new ones
- Use `with()` and `without()` for filtering

### 2. Minimize Component Re-renders
- Use `useEntities()` only when you need reactive updates
- Access `.entities` property for static access
- Memoize expensive calculations

### 3. Pool Frequently Created Objects
- Use `ObjectPool` for particles
- Pool temporary objects
- Reuse instead of create/destroy

### 4. Optimize Collision Detection
- Use spatial partitioning (QuadTree, Grid)
- Only check nearby entities
- Early exit on broad phase

### 5. Batch Similar Operations
- Group renders by material/geometry
- Batch state updates
- Minimize system calls

## Troubleshooting

### Models Not Loading
- Check asset URLs in `game-constants.ts`
- Verify GLB files exist in `public/models/`
- Check browser console for 404 errors
- Use `useGLTF.preload()` for critical assets

### Low FPS
- Check entity count (window.debug.logEntityCounts())
- Monitor performance (window.debug.getPerformanceStats())
- Reduce particle count
- Use LOD for distant objects

### Collision Issues
- Visualize colliders (enable debug mode)
- Check AABB calculations
- Verify entity positions
- Test collision helpers in isolation

### Animation Problems
- Check animation URLs are correct
- Verify mixer is updating
- Check animation names match
- Test with single animation first

---

**Happy Building! 🎮**
