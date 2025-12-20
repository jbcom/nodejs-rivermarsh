# System Patterns - Otter River Rush

**Version**: 2.1.0  
**Last Updated**: 2025-10-28  
**Status**: Mobile-First Architecture

---

## 🎯 Architectural Philosophy

**Mobile-First**: This is a **mobile game** first. Desktop/web are secondary deployment targets.

**Core Principles:**
1. React Three Fiber for 3D rendering (not Canvas 2D)
2. Miniplex ECS for entity management
3. GLB models with animations (not sprites)
4. Touch gestures primary input (not keyboard)
5. Safe areas, orientation lock, haptics (mobile UX)

---

## 🏗️ Architecture Patterns

### Entity Component System (Miniplex)

**Pattern**: Data-oriented design with component composition

```typescript
// Entity definition
interface Entity {
  // Core components
  position: { x: number; y: number; z: number };
  velocity?: { x: number; y: number; z: number };
  model?: { url: string; scale: number };
  animation?: {
    current: string;
    urls: Record<string, string>;
  };
  collider?: { width: number; height: number; depth: number };
  
  // Tags
  player?: true;
  obstacle?: true;
  collectible?: { type: string; value: number };
  particle?: { color: string; lifetime: number; size: number };
  
  // State
  health?: number;
  lane?: -1 | 0 | 1;
  ghost?: boolean;
  invincible?: boolean;
}

// Queries
const queries = {
  player: world.with('player', 'position', 'model'),
  obstacles: world.with('obstacle', 'position', 'collider'),
  collectibles: world.with('collectible', 'position'),
  moving: world.with('position', 'velocity'),
};

// Systems update queries
function MovementSystem() {
  for (const entity of queries.moving) {
    entity.position.x += entity.velocity.x * dt;
    entity.position.y += entity.velocity.y * dt;
  }
}
```

**Benefits:**
- Composition over inheritance
- Data locality (cache-friendly)
- Easy to add/remove components
- Systems iterate efficiently over queries

---

### Fixed-Timestep Game Loop

**Pattern**: Accumulator pattern for deterministic physics

```typescript
const FIXED_TIMESTEP = 1 / 60; // 60 FPS
const MAX_SUBSTEPS = 10;
const accumulatedTime = useRef(0);

useFrame((state, dt) => {
  accumulatedTime.current += dt;
  let numSubsteps = 0;

  while (accumulatedTime.current >= FIXED_TIMESTEP && numSubsteps < MAX_SUBSTEPS) {
    // Update game logic with fixed timestep
    updatePhysics(FIXED_TIMESTEP);
    updateCollisions(FIXED_TIMESTEP);
    updateEntities(FIXED_TIMESTEP);
    
    accumulatedTime.current -= FIXED_TIMESTEP;
    numSubsteps++;
  }
});
```

**Benefits:**
- Frame-rate independent physics
- Deterministic gameplay (reproducible runs)
- Consistent difficulty across devices
- Prevents spiral of death

---

### State Management (Zustand)

**Pattern**: Centralized state with selectors

```typescript
const useGameStore = create<GameState>((set, get) => ({
  status: 'menu',
  score: 0,
  distance: 0,
  
  startGame: (mode) => set({ status: 'playing', mode, score: 0 }),
  pauseGame: () => set({ status: 'paused' }),
  endGame: () => set((state) => ({
    status: 'game_over',
    highScore: Math.max(state.score, state.highScore),
  })),
}));

// Components use selectors for optimal re-renders
function HUD() {
  const score = useGameStore(state => state.score); // Only re-renders when score changes
  return <div>{score}</div>;
}
```

**Benefits:**
- Simple API (no reducers/actions)
- Automatic re-renders
- Devtools integration
- TypeScript friendly

---

### Mobile-First Constraints

**Pattern**: Responsive hooks for device adaptation

```typescript
const useMobileConstraints = () => {
  const [constraints, setConstraints] = useState({
    orientation: 'portrait',
    isPhone: detectPhone(),
    isTablet: detectTablet(),
    safeAreas: { top, bottom, left, right },
    hasNotch: detectNotch(),
    hasHaptics: 'vibrate' in navigator,
  });
  
  // Auto-update on orientation change
  useEffect(() => {
    window.addEventListener('orientationchange', updateConstraints);
    return () => window.removeEventListener('orientationchange', updateConstraints);
  }, []);
  
  // Auto-pause on background
  useEffect(() => {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pauseGame();
    });
  }, []);
  
  return constraints;
};

// Usage
function GameCanvas() {
  const constraints = useMobileConstraints();
  return (
    <Canvas dpr={constraints.pixelRatio} gl={{ antialias: !constraints.isMobile }}>
      <PerspectiveCamera fov={constraints.isPhone ? 60 : 50} />
    </Canvas>
  );
}
```

**Benefits:**
- Centralized device detection
- Automatic lifecycle management
- Safe area awareness
- Performance optimizations

---

### PBR Material Loading (AmbientCG)

**Pattern**: Declarative texture loading with caching

```typescript
// Get texture paths
const paths = getLocalTexturePaths('Grass001', '1K', 'jpg');

// Load PBR material (cached automatically)
const material = usePBRMaterial({
  color: paths.baseColor,
  normal: paths.normal,
  roughness: paths.roughness,
  ao: paths.ao,
  repeat: [16, 16],
  normalScale: 0.5,
});

// Use in mesh
<mesh material={material} />
```

**Benefits:**
- Realistic materials (color, normal, roughness, AO)
- Automatic texture caching
- Proper color space handling
- Biome-aware switching

---

### Procedural Generation

**Pattern**: Seed-based deterministic generation with biomes

```typescript
// Biome system
const biomes = [
  { name: 'forest', fogColor: '#a8dadc', ambient: 0.6 },
  { name: 'mountain', fogColor: '#90a3b5', ambient: 0.5 },
  { name: 'canyon', fogColor: '#f4a261', ambient: 0.7 },
  { name: 'rapids', fogColor: '#457b9d', ambient: 0.4 },
];

// Cycle biomes every 1000m
const biome = biomes[Math.floor(distance / 1000) % biomes.length];

// Spawn entities with biome-specific variants
const rockVariants = getModelVariantsSync('rock'); // From models-manifest.json
const rockUrl = rockVariants[variant % rockVariants.length];
```

**Benefits:**
- Infinite content
- Deterministic from seed
- Visual variety
- Performance (no duplication)

---

### Animation System

**Pattern**: State-driven animation with GLB clips

```typescript
function AnimatedModel({ baseUrl, animationUrl }) {
  const groupRef = useRef<Group>(null);
  const base = useGLTF(baseUrl);
  const anim = animationUrl ? useGLTF(animationUrl) : null;
  const { actions } = useAnimations(anim?.animations || [], groupRef);

  useEffect(() => {
    // Play animation clip
    const action = actions[Object.keys(actions)[0]];
    action?.reset().fadeIn(0.5).play();
    
    return () => action?.fadeOut(0.5).stop();
  }, [actions, animationUrl]);

  return (
    <group ref={groupRef}>
      <primitive object={(anim?.scene ?? base.scene).clone()} />
    </group>
  );
}

// Entity controls animation
entity.animation.current = 'dodge-left';
// → EntityRenderer loads dodge-left.glb and plays clip
```

**Benefits:**
- Smooth transitions (fadeIn/fadeOut)
- State-driven (entity.animation.current)
- Separate animation GLBs (flexible)
- Automatic cleanup

---

### Haptic Feedback

**Pattern**: Native vibration API with preset patterns

```typescript
const HAPTIC_PATTERNS = {
  jump: 10,
  dodge: [5, 20, 5],
  collect: 15,
  hit: [50, 50, 50],
  gameOver: [100, 100, 200],
};

function hapticFeedback(pattern: number | number[]) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

// Usage
hapticFeedback(HAPTIC_PATTERNS.dodge);
```

**Benefits:**
- Mobile-first tactile feedback
- Pattern-based (reusable)
- Progressive enhancement (fallback gracefully)
- Low latency (synchronous)

---

## 🎮 Game Loop Flow

```
┌─────────────────────────────────────┐
│ useFrame (React Three Fiber)        │
│   delta time (seconds)              │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Fixed-Timestep Accumulator          │
│   accumulatedTime += dt             │
│   while (accumulatedTime >= 1/60)   │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ ECS Systems (60 FPS fixed)          │
│   MovementSystem                    │
│   CollisionSystem                   │
│   SpawnerSystem                     │
│   ScoreSystem                       │
│   DifficultySystem                  │
│   BiomeSystem                       │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Entity Updates                      │
│   Position, Animation, Health       │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Cleanup System                      │
│   Remove off-screen entities        │
│   Object pooling                    │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ React Three Fiber Render            │
│   EntityRenderer (GLB models)       │
│   Sky, Terrain, Effects             │
└─────────────────────────────────────┘
```

---

## 🎨 Rendering Pipeline

```
┌─────────────────────────────────────┐
│ GameCanvas (R3F)                    │
│   PerspectiveCamera                 │
│   Lights (ambient + directional)    │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Environment                         │
│   VolumetricSky (3-layer clouds)    │
│   Terrain (PBR heightmap)           │
│   River (animated water)            │
│   Fog                               │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ EntityRenderer                      │
│   Player (otter with animations)    │
│   Obstacles (rocks, variants)       │
│   Collectibles (coins, gems)        │
│   Particles (effects)               │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Post-Processing                     │
│   Bloom (glow effects)              │
│   Vignette (focus)                  │
└─────────────────────────────────────┘
```

---

## 📱 Mobile-First Patterns

### Safe Area Handling
```typescript
// CSS
:root {
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
}

// React
const topOffset = `max(1rem, ${constraints.safeAreas.top}px)`;
<div style={{ top: topOffset }}>Score</div>
```

### Orientation Locking
```typescript
useEffect(() => {
  if (screen.orientation && 'lock' in screen.orientation) {
    const lockTo = isPhone ? 'portrait' : 'landscape';
    screen.orientation.lock(lockTo).catch(console.log);
  }
}, [isPhone]);
```

### Touch Gestures
```typescript
function applySwipe(deltaX: number, deltaY: number) {
  if (Math.abs(deltaX) > swipeThreshold) {
    // Lane change
    player.lane += deltaX > 0 ? 1 : -1;
    hapticFeedback(HAPTIC_PATTERNS.dodge);
  }
  if (deltaY < -swipeThreshold) {
    // Jump
    player.animation.current = 'jump';
    hapticFeedback(HAPTIC_PATTERNS.jump);
  }
}
```

---

## 🧪 Testing Patterns

### E2E Tests (Playwright)
```typescript
test('complete game flow', async ({ page }) => {
  await page.goto('/');
  await page.click('#classicButton');
  await page.waitForTimeout(5000); // Play
  await page.keyboard.press('Escape'); // Pause
  // Verify state transitions
});
```

### Mobile Device Testing
```typescript
test.use({
  viewport: { width: 390, height: 844 }, // iPhone
  hasTouch: true,
  isMobile: true,
});

test('swipe gestures', async ({ page }) => {
  await page.mouse.move(200, 600);
  await page.mouse.down();
  await page.mouse.move(360, 600, { steps: 5 }); // Swipe right
  await page.mouse.up();
});
```

### AI-Driven Testing (Anthropic Computer Use)
```typescript
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  messages,
  tools: [{ type: 'computer_20241022', name: 'computer' }],
});

// Claude controls browser and plays game
```

---

## 🎨 Asset Management Patterns

### GLB Model Loading
```typescript
// Static models
const { scene } = useGLTF('/models/rock-river.glb');

// Animated models
const { scene, animations } = useGLTF('/models/otter-rusty-walk.glb');
const { actions } = useAnimations(animations, groupRef);
actions['Walk']?.play();
```

### Dynamic Variant Loading
```typescript
// models-manifest.json
{
  "rock": [
    "/models/rock-river.glb",
    "/models/rock-mossy.glb",
    "/models/rock-cracked.glb",
    "/models/rock-crystal.glb"
  ]
}

// Runtime selection
const variants = getModelVariantsSync('rock');
const url = pickRandom(variants, seed);
```

### PBR Texture Loading
```typescript
const paths = getLocalTexturePaths('Grass001', '1K', 'jpg');
const material = usePBRMaterial({
  color: paths.baseColor,
  normal: paths.normal,
  roughness: paths.roughness,
  ao: paths.ao,
  repeat: [16, 16],
});
```

---

## 🚀 Performance Patterns

### Mobile Optimization
```typescript
// Reduce quality on mobile
const detail = constraints.isPhone ? 64 : 128; // Terrain resolution
const qualityPreset = constraints.isPhone ? 'low' : 'high'; // Cloud quality
const dpr = Math.min(window.devicePixelRatio, 2); // Cap pixel ratio

// Disable expensive features
gl={{ antialias: !constraints.isMobile }}
```

### Object Pooling (Implicit via ECS)
```typescript
// Entities auto-cleanup when off-screen
for (const entity of queries.moving) {
  if (entity.position.y < VISUAL.positions.despawnY) {
    world.remove(entity); // Returns to pool
  }
}
```

### Lazy Loading
```typescript
// Models loaded on-demand
useGLTF.preload(ASSET_URLS.ANIMATIONS.OTTER_IDLE);

// Textures loaded via Suspense
<Suspense fallback={null}>
  <TerrainWithPBR />
</Suspense>
```

---

## 🔄 Data Flow Patterns

### Input → State → Systems → Render

```
User Input (Touch/Keyboard)
    ↓
InputSystem / TouchInputSystem
    ↓
ECS Entity Updates (player.lane, player.animation)
    ↓
Game State Updates (useGameStore)
    ↓
ECS Systems (Movement, Collision, Spawning)
    ↓
EntityRenderer (React Three Fiber)
    ↓
WebGL Render (60 FPS)
```

### Lifecycle Flow

```
App Mount
    ↓
useMobileConstraints (detect device, lock orientation)
    ↓
Menu Screen (status: 'menu')
    ↓
User clicks "Start"
    ↓
startGame() → status: 'playing'
    ↓
spawn.otter(0) → Player entity created
    ↓
Game Loop (useFrame + systems)
    ↓
User backgrounds app
    ↓
Auto-pause (visibilitychange listener)
    ↓
User returns
    ↓
Resume prompt (manual resume)
```

---

## 📐 Architecture Decisions

### Why React Three Fiber?
- **Decision**: R3F over raw Three.js or Canvas 2D
- **Rationale**: Declarative 3D, React integration, ecosystem (drei, postprocessing)
- **Trade-off**: Larger bundle (+270 KB) but cleaner code

### Why Miniplex ECS?
- **Decision**: ECS over object-oriented entities
- **Rationale**: Performance, flexibility, data-oriented design
- **Trade-off**: Learning curve but scales better

### Why GLB over Sprites?
- **Decision**: 3D models with animations over 2D sprites
- **Rationale**: Professional quality, realistic lighting, depth
- **Trade-off**: Larger assets but AAA visuals

### Why Mobile-First?
- **Decision**: Phones/tablets as primary platform
- **Rationale**: Larger audience, touch-first, app store distribution
- **Trade-off**: Desktop UX secondary but game is better on mobile

### Why AmbientCG Textures?
- **Decision**: PBR textures over procedural/flat colors
- **Rationale**: Photorealistic terrain, free CC0 license, industry standard
- **Trade-off**: Download size but worth the quality

### Why Volumetric Clouds?
- **Decision**: @takram/three-clouds over gradient sky
- **Rationale**: Realistic atmosphere, 3-layer depth, biome-aware
- **Trade-off**: Performance cost (mitigated with mobile presets)

---

## 🎯 Critical Paths

### Game Start Path
1. User taps "Rapid Rush" button
2. `startGame('classic')` called
3. Store updates: `status: 'playing'`
4. `spawn.otter(0)` creates player entity
5. Game loop starts (useFrame)
6. Spawner system begins spawning obstacles

### Collision Path
1. MovementSystem updates positions
2. CollisionSystem checks AABB overlaps
3. Hit detected → `player.health--`
4. If health === 0 → `endGame()`
5. Animation plays: 'hit' or 'death'
6. Haptic feedback: `HAPTIC_PATTERNS.hit`

### Collection Path
1. CollisionSystem detects coin overlap
2. `collectCoin(coinId)` called
3. Score increases: `+10 * comboMultiplier`
4. Coin entity marked `collected`
5. Particle spawned at coin position
6. CleanupSystem removes collected entity
7. Haptic feedback: `HAPTIC_PATTERNS.collect`

---

## 📊 Performance Targets

| Metric | Target | Mobile | Desktop |
|--------|--------|--------|---------|
| FPS | 60 | 30-60 | 60-120 |
| Bundle | < 2 MB | 1.54 MB | 1.54 MB |
| Load Time | < 3s | 2-4s | 1-2s |
| Memory | < 100 MB | 60-80 MB | 50-70 MB |
| Texture Memory | < 50 MB | 30 MB | 50 MB |

---

**Last Updated**: 2025-10-28  
**Architecture**: Mobile-First, React Three Fiber, Miniplex ECS, GLB Models
