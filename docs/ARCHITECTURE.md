# Otter River Rush - React Three Fiber Architecture

**Document Type:** 🔒 Frozen Technical Specification  
**Version:** 2.1.0  
**Last Updated:** 2025-10-28  
**Status:** LOCKED - Technical Foundation Document

---

## 🎯 Architecture Vision

**A modern React-first architecture using React Three Fiber (R3F) with GLB 3D models for all game entities, providing superior visual quality and performance.**

### Core Architectural Principles
1. **React All The Way:** Use React components for UI, game logic, and 3D rendering
2. **3D First:** Leverage Three.js/WebGL for rich visuals and smooth animations
3. **Performance:** 60 FPS non-negotiable across mobile and desktop
4. **Component Composition:** React's declarative nature for game state and rendering
5. **Modern Tooling:** TypeScript + Vite + R3F ecosystem

---

## 🔄 v2.1.0 (Minor) Updates

- Enforced GLB-only entity rendering via generic `EntityRenderer`.
- Added fixed-timestep accumulator across ECS systems (deterministic updates).
- Switched to `PerspectiveCamera`; integrated ProceduralSky and Terrain.
- Implemented GLB animation mixing for otter/actors.
- Mobile-first inputs: swipe via touch/pointer/mouse; Playwright mobile profiles added.
- E2E stabilized to use baseURL/preview and non-interactive reporters.

---

## 📐 High-Level System Architecture

### The Big Picture
```
┌─────────────────────────────────────────────────────────────┐
│                        PLAYER                               │
│                          ↓                                  │
│              ┌──────────────────────┐                      │
│              │   React Component    │                       │
│              │   Input Handlers     │                       │
│              └──────────┬───────────┘                       │
│                         ↓                                   │
│              ┌──────────────────────┐                      │
│              │   Zustand State      │                       │
│              │   Game Store         │                       │
│              └──────────┬───────────┘                       │
│                         ↓                                   │
│    ┌────────────────────────────────────────┐              │
│    │     React Three Fiber Canvas           │              │
│    │                                        │              │
│    │  ┌──────────┐  ┌──────────┐  ┌─────┐ │              │
│    │  │  Otter   │  │  Rocks   │  │ Gems│ │              │
│    │  │ (GLB)    │  │  (GLB)   │  │(GLB)│ │              │
│    │  └──────────┘  └──────────┘  └─────┘ │              │
│    │                                        │              │
│    │  ┌──────────────────────────┐         │              │
│    │  │   Environment             │         │              │
│    │  │   (Ambient Textures)      │         │              │
│    │  └──────────────────────────┘         │              │
│    │                                        │              │
│    │  ┌──────────────────────────┐         │              │
│    │  │   Post-Processing         │         │              │
│    │  │   (Bloom, Effects)        │         │              │
│    │  └──────────────────────────┘         │              │
│    └────────────────────────────────────────┘              │
│                         ↓                                   │
│              ┌──────────────────────┐                      │
│              │   React UI Overlay   │                       │
│              │   (HUD, Menus)       │                       │
│              └──────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Technology Stack

### Core Technologies
- **React 19**: Component-based architecture
- **React Three Fiber 9**: Declarative Three.js rendering
- **Three.js**: 3D rendering engine (WebGL)
- **Zustand**: Lightweight state management
- **TypeScript**: Type safety
- **Vite**: Fast build tooling

### R3F Ecosystem
- **@react-three/drei**: Essential helpers (OrbitControls, useGLTF, etc.)
- **@react-three/postprocessing**: Visual effects (bloom, depth of field)
- **@react-three/rapier**: Physics engine (optional)
- **use-gesture**: Touch and mouse interactions

### Asset Pipeline
- **Blender**: 3D modeling and animation
- **GLB Format**: Compressed 3D models with animations
- **glTF-Transform**: Optimization and compression
- **DRACO**: Mesh compression
- **KTX2**: Texture compression

---

## 🎮 Game Loop Architecture

### React Three Fiber useFrame Hook
```typescript
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { useGameStore } from '@/store/gameStore'

/**
 * Fixed Timestep Game Loop (React Three Fiber Pattern)
 * Implements deterministic physics with 60 FPS target
 */
export function GameLoop() {
  const gameState = useGameStore((state) => state.gameState)
  const updateGame = useGameStore((state) => state.updateGame)
  
  const accumulatedTime = useRef(0)
  const lastTime = useRef(0)
  const FIXED_TIMESTEP = 1000 / 60 // 16.67ms for 60 FPS
  
  useFrame((state, delta) => {
    if (gameState !== 'PLAYING') return
    
    // delta is in seconds, convert to ms
    const deltaMs = delta * 1000
    accumulatedTime.current += deltaMs
    
    // Fixed timestep updates
    while (accumulatedTime.current >= FIXED_TIMESTEP) {
      updateGame(FIXED_TIMESTEP / 1000) // Pass delta in seconds
      accumulatedTime.current -= FIXED_TIMESTEP
    }
  })
  
  return null // This is just a logic component
}
```

**Why Fixed Timestep:**
- Deterministic physics across all devices
- Consistent gameplay feel
- Reproducible runs (important for testing and speedrunning)
- Frame-rate independent logic

---

## 🦦 Entity Architecture: React Components with GLB Models

### Otter Component (Player)
```typescript
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useGameStore } from '@/store/gameStore'
import * as THREE from 'three'

interface OtterProps {
  position?: [number, number, number]
}

export function Otter({ position = [0, 0, 0] }: OtterProps) {
  const group = useRef<THREE.Group>(null)
  
  // Load GLB model with animations
  const { scene, animations } = useGLTF('/models/otter.glb')
  const { actions, mixer } = useAnimations(animations, group)
  
  // Access game state
  const currentLane = useGameStore((state) => state.player.lane)
  const isInvincible = useGameStore((state) => state.player.isInvincible)
  const hasShield = useGameStore((state) => state.player.hasShield)
  
  // Lane positions
  const LANE_POSITIONS = {
    0: -1.5, // Left
    1: 0,    // Center
    2: 1.5   // Right
  }
  
  // Lane transition state
  const targetX = useRef(LANE_POSITIONS[currentLane])
  const currentX = useRef(LANE_POSITIONS[currentLane])
  
  // Play animation
  useEffect(() => {
    actions['Swim']?.play()
  }, [actions])
  
  // Update position each frame (smooth lane transition)
  useFrame((state, delta) => {
    if (!group.current) return
    
    // Smooth lane transition
    targetX.current = LANE_POSITIONS[currentLane]
    const lerpFactor = 1 - Math.pow(0.001, delta)
    currentX.current = THREE.MathUtils.lerp(
      currentX.current,
      targetX.current,
      lerpFactor
    )
    
    group.current.position.x = currentX.current
    group.current.position.y = position[1]
    group.current.position.z = position[2]
    
    // Tilt during lane change
    const tiltAmount = (targetX.current - currentX.current) * 0.3
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      tiltAmount,
      lerpFactor
    )
    
    // Bob animation
    group.current.position.y += Math.sin(state.clock.elapsedTime * 3) * 0.02
  })
  
  return (
    <group ref={group} position={position}>
      <primitive object={scene} />
      
      {/* Shield visual effect */}
      {hasShield && (
        <mesh>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial
            color="#60a5fa"
            transparent
            opacity={0.3}
            emissive="#3b82f6"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
      
      {/* Invincibility visual (tutorial zone) */}
      {isInvincible && (
        <mesh>
          <sphereGeometry args={[0.9, 16, 16]} />
          <meshStandardMaterial
            color="#fbbf24"
            transparent
            opacity={0.2}
            emissive="#f59e0b"
            emissiveIntensity={0.3}
          />
        </mesh>
      )}
    </group>
  )
}
```

### Rock Component (Obstacle)
```typescript
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useGameStore } from '@/store/gameStore'
import * as THREE from 'three'

interface RockProps {
  id: string
  lane: number
  initialZ: number
  variant?: number
}

export function Rock({ id, lane, initialZ, variant = 0 }: RockProps) {
  const group = useRef<THREE.Group>(null)
  
  // Load rock model (with 3 variants)
  const { scene } = useGLTF(`/models/rock-${variant % 3}.glb`)
  
  // Game state
  const scrollSpeed = useGameStore((state) => state.scrollSpeed)
  const checkCollision = useGameStore((state) => state.checkCollision)
  const recordNearMiss = useGameStore((state) => state.recordNearMiss)
  
  // Track near-miss
  const nearMissRecorded = useRef(false)
  
  // Lane positions
  const LANE_X = [-1.5, 0, 1.5]
  const position = useMemo(() => {
    return [LANE_X[lane], 0, initialZ] as [number, number, number]
  }, [lane, initialZ])
  
  // Random rotation for variety
  const rotation = useMemo(() => {
    return [0, Math.random() * Math.PI * 2, 0] as [number, number, number]
  }, [])
  
  useFrame((state, delta) => {
    if (!group.current) return
    
    // Move rock toward camera (scrolling effect)
    group.current.position.z += scrollSpeed * delta
    
    // Check collision
    const distance = checkCollision(id, group.current.position)
    
    // Near-miss detection (50 unit threshold)
    if (distance < 0.5 && distance > 0.2 && !nearMissRecorded.current) {
      nearMissRecorded.current = true
      recordNearMiss()
    }
    
    // Remove if off-screen
    if (group.current.position.z > 5) {
      // Signal to object pool to release this rock
      useGameStore.getState().releaseObstacle(id)
    }
  })
  
  return (
    <group ref={group} position={position} rotation={rotation}>
      <primitive object={scene} />
    </group>
  )
}
```

### Collectible Components (Coins, Gems)
```typescript
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useGameStore } from '@/store/gameStore'
import * as THREE from 'three'

interface CoinProps {
  id: string
  position: [number, number, number]
}

export function Coin({ id, position }: CoinProps) {
  const group = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/models/coin.glb')
  
  const scrollSpeed = useGameStore((state) => state.scrollSpeed)
  const collectCoin = useGameStore((state) => state.collectCoin)
  const playerPosition = useGameStore((state) => state.player.position)
  
  useFrame((state, delta) => {
    if (!group.current) return
    
    // Scroll movement
    group.current.position.z += scrollSpeed * delta
    
    // Spin animation
    group.current.rotation.y += delta * 3
    
    // Bob animation
    group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1
    
    // Collection check
    const distance = group.current.position.distanceTo(
      new THREE.Vector3(...playerPosition)
    )
    
    if (distance < 0.4) {
      collectCoin(id)
    }
    
    // Remove if off-screen
    if (group.current.position.z > 5) {
      useGameStore.getState().releaseCoin(id)
    }
  })
  
  return (
    <group ref={group} position={position}>
      <primitive object={scene} scale={0.3} />
      <pointLight color="#fbbf24" intensity={0.5} distance={2} />
    </group>
  )
}
```

---

## 🎨 Environment & Background Architecture

### Ambient Environment (Textured Backgrounds)
```typescript
import { useTexture } from '@react-three/drei'
import { useGameStore } from '@/store/gameStore'

export function Environment() {
  const biome = useGameStore((state) => state.currentBiome)
  
  // Load biome-specific textures
  const bgTexture = useTexture(`/textures/background-${biome}.jpg`)
  const waterTexture = useTexture(`/textures/water-${biome}.jpg`)
  
  return (
    <>
      {/* Sky background (sphere) */}
      <mesh>
        <sphereGeometry args={[50, 32, 32]} />
        <meshBasicMaterial map={bgTexture} side={THREE.BackSide} />
      </mesh>
      
      {/* Water plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[20, 100]} />
        <meshStandardMaterial
          map={waterTexture}
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      
      {/* Ambient lighting based on biome */}
      <BiomeLighting biome={biome} />
    </>
  )
}

function BiomeLighting({ biome }: { biome: string }) {
  const lightConfig = {
    forest: { ambient: '#a8dadc', directional: '#f1faee' },
    mountain: { ambient: '#90a3b5', directional: '#e8f4f8' },
    canyon: { ambient: '#f4a261', directional: '#e76f51' },
    rapids: { ambient: '#457b9d', directional: '#1d3557' }
  }
  
  const config = lightConfig[biome] || lightConfig.forest
  
  return (
    <>
      <ambientLight color={config.ambient} intensity={0.6} />
      <directionalLight
        color={config.directional}
        intensity={1}
        position={[10, 10, 5]}
        castShadow
      />
    </>
  )
}
```

---

## 🎮 State Management: Zustand Store

```typescript
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface Player {
  lane: number // 0, 1, 2
  position: [number, number, number]
  isInvincible: boolean
  hasShield: boolean
  activePowerUps: PowerUp[]
}

interface GameState {
  // Game state
  gameState: 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER'
  score: number
  distance: number
  coins: number
  gems: number
  combo: number
  comboTimer: number
  
  // Player
  player: Player
  
  // World
  scrollSpeed: number
  currentBiome: string
  difficulty: number
  
  // Entities
  obstacles: Obstacle[]
  collectibles: Collectible[]
  particles: Particle[]
  
  // Actions
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  gameOver: () => void
  updateGame: (delta: number) => void
  switchLane: (direction: 'left' | 'right') => void
  checkCollision: (id: string, position: THREE.Vector3) => number
  collectCoin: (id: string) => void
  collectGem: (id: string) => void
  recordNearMiss: () => void
  activatePowerUp: (type: PowerUpType) => void
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    gameState: 'MENU',
    score: 0,
    distance: 0,
    coins: 0,
    gems: 0,
    combo: 0,
    comboTimer: 0,
    
    player: {
      lane: 1,
      position: [0, 0, 2],
      isInvincible: false,
      hasShield: false,
      activePowerUps: []
    },
    
    scrollSpeed: 3,
    currentBiome: 'forest',
    difficulty: 0,
    
    obstacles: [],
    collectibles: [],
    particles: [],
    
    // Actions
    startGame: () => {
      set({
        gameState: 'PLAYING',
        score: 0,
        distance: 0,
        coins: 0,
        gems: 0,
        combo: 0,
        player: {
          lane: 1,
          position: [0, 0, 2],
          isInvincible: true, // Tutorial zone: first 30 seconds
          hasShield: false,
          activePowerUps: []
        }
      })
      
      // End tutorial invincibility after 30 seconds
      setTimeout(() => {
        set((state) => ({
          player: { ...state.player, isInvincible: false }
        }))
      }, 30000)
    },
    
    pauseGame: () => set({ gameState: 'PAUSED' }),
    resumeGame: () => set({ gameState: 'PLAYING' }),
    gameOver: () => set({ gameState: 'GAME_OVER' }),
    
    updateGame: (delta: number) => {
      const state = get()
      
      // Update distance
      const newDistance = state.distance + (state.scrollSpeed * delta)
      
      // Update combo timer
      let newComboTimer = state.comboTimer - (delta * 1000)
      let newCombo = state.combo
      if (newComboTimer <= 0) {
        newCombo = 0
        newComboTimer = 0
      }
      
      // Update difficulty
      const newDifficulty = Math.floor(newDistance / 500) // Increase every 500m
      
      // Change biome every 1000m
      const biomes = ['forest', 'mountain', 'canyon', 'rapids']
      const newBiome = biomes[Math.floor(newDistance / 1000) % biomes.length]
      
      set({
        distance: newDistance,
        combo: newCombo,
        comboTimer: newComboTimer,
        difficulty: newDifficulty,
        currentBiome: newBiome,
        scrollSpeed: 3 + (newDifficulty * 0.3) // Increase speed with difficulty
      })
    },
    
    switchLane: (direction: 'left' | 'right') => {
      set((state) => {
        const currentLane = state.player.lane
        const newLane = direction === 'left'
          ? Math.max(0, currentLane - 1)
          : Math.min(2, currentLane + 1)
        
        if (newLane === currentLane) return state
        
        return {
          player: { ...state.player, lane: newLane }
        }
      })
    },
    
    checkCollision: (id: string, position: THREE.Vector3) => {
      const state = get()
      const playerPos = new THREE.Vector3(...state.player.position)
      return playerPos.distanceTo(position)
    },
    
    collectCoin: (id: string) => {
      set((state) => ({
        coins: state.coins + 1,
        score: state.score + (10 * (Math.floor(state.combo / 10) + 1)),
        combo: state.combo + 1,
        comboTimer: 2000 // 2 second window
      }))
    },
    
    collectGem: (id: string) => {
      set((state) => ({
        gems: state.gems + 1,
        score: state.score + (50 * (Math.floor(state.combo / 10) + 1)),
        combo: state.combo + 1,
        comboTimer: 2000
      }))
    },
    
    recordNearMiss: () => {
      set((state) => ({
        score: state.score + (5 * (Math.floor(state.combo / 10) + 1)),
        combo: state.combo + 1,
        comboTimer: 2000
      }))
    },
    
    activatePowerUp: (type: PowerUpType) => {
      // Implement power-up logic
    }
  }))
)
```

---

## 🎨 Rendering Architecture: React Three Fiber Canvas

### Main Game Canvas
```typescript
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Suspense } from 'react'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

export function GameCanvas() {
  return (
    <Canvas
      shadows
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      }}
      dpr={[1, 2]} // Pixel ratio: min 1, max 2 for performance
    >
      {/* Camera setup */}
      <PerspectiveCamera
        makeDefault
        position={[0, 3, 5]}
        fov={50}
      />
      
      {/* Suspense for async model loading */}
      <Suspense fallback={<LoadingFallback />}>
        {/* Game loop */}
        <GameLoop />
        
        {/* Environment */}
        <Environment />
        
        {/* Game entities */}
        <GameEntities />
        
        {/* Post-processing effects */}
        <EffectComposer>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}

function GameEntities() {
  const obstacles = useGameStore((state) => state.obstacles)
  const collectibles = useGameStore((state) => state.collectibles)
  
  return (
    <>
      <Otter position={[0, 0, 2]} />
      
      {obstacles.map((obstacle) => (
        <Rock
          key={obstacle.id}
          id={obstacle.id}
          lane={obstacle.lane}
          initialZ={obstacle.z}
          variant={obstacle.variant}
        />
      ))}
      
      {collectibles.map((collectible) => (
        collectible.type === 'coin' ? (
          <Coin key={collectible.id} id={collectible.id} position={collectible.position} />
        ) : (
          <Gem key={collectible.id} id={collectible.id} position={collectible.position} />
        )
      ))}
    </>
  )
}
```

---

## 📱 UI Architecture: React Overlays

### HUD Component
```typescript
import { useGameStore } from '@/store/gameStore'

export function HUD() {
  const score = useGameStore((state) => state.score)
  const distance = useGameStore((state) => state.distance)
  const coins = useGameStore((state) => state.coins)
  const combo = useGameStore((state) => state.combo)
  
  return (
    <div className="fixed top-0 left-0 right-0 p-4 text-white pointer-events-none">
      <div className="flex justify-between items-start">
        {/* Score */}
        <div className="text-3xl font-bold">
          {Math.floor(score).toLocaleString()}
        </div>
        
        {/* Distance */}
        <div className="text-xl">
          {Math.floor(distance)}m
        </div>
        
        {/* Coins */}
        <div className="flex items-center gap-2">
          <img src="/icons/coin.png" className="w-6 h-6" />
          <span className="text-xl">{coins}</span>
        </div>
      </div>
      
      {/* Combo indicator */}
      {combo > 0 && (
        <div className="mt-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            COMBO x{combo}
          </div>
          {combo >= 10 && (
            <div className="text-sm text-yellow-300">
              2x MULTIPLIER!
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

---

## 📦 GLB Asset Pipeline

### Asset Creation Workflow
```
1. 3D Modeling (Blender)
   ├─ Model creation (low-poly, game-optimized)
   ├─ UV unwrapping
   ├─ Texture painting
   └─ Animation rigging

2. Export to GLB
   ├─ Blender GLB exporter
   ├─ Settings: Draco compression enabled
   └─ Include animations

3. Optimization (gltf-transform)
   ├─ Mesh simplification
   ├─ Texture compression (KTX2)
   ├─ Remove unused data
   └─ Target: <200KB per model

4. Testing
   ├─ Load in gltf.report for analysis
   ├─ Test in R3F with useGLTF
   └─ Performance check (60 FPS target)
```

### GLB Model Requirements
- **Otter**: 150-200 KB, swim animation, 1024x1024 texture
- **Rocks**: 3 variants, 50-80 KB each, no animation
- **Coins**: 30-50 KB, simple geometry, emissive material
- **Gems**: 40-60 KB, 2 variants (blue, red), emissive
- **Power-ups**: 50-70 KB each, idle float animation

### Texture Requirements
- **Backgrounds**: 2048x2048 JPG, 4 biomes, ambient scrolling
- **Water**: 1024x1024 with normal map, tiling, animated
- **All models**: 1024x1024 max, PBR materials

---

## 🎵 Audio Architecture

(Same as previous - Howler.js with sprite system)

---

## 💾 Data Persistence

(Same as previous - Deep merge save system with StorageManager)

---

## 🧪 Testing Architecture

### R3F Component Testing
```typescript
import { render } from '@testing-library/react'
import { Canvas } from '@react-three/fiber'
import { Otter } from './Otter'

describe('Otter Component', () => {
  it('should render without crashing', () => {
    render(
      <Canvas>
        <Otter position={[0, 0, 0]} />
      </Canvas>
    )
  })
  
  it('should respond to lane changes', () => {
    const { result } = renderHook(() => useGameStore())
    
    act(() => {
      result.current.switchLane('right')
    })
    
    expect(result.current.player.lane).toBe(2)
  })
})
```

---

## 📊 Performance Targets

- **FPS**: 60 FPS minimum on mobile, 120 FPS on desktop
- **Model Budget**: Max 50 models on screen simultaneously
- **Texture Memory**: < 100 MB total
- **JavaScript Bundle**: < 500 KB gzipped
- **Initial Load**: < 3 seconds on 4G
- **GLB Load Time**: < 1 second per model

---

## ✅ Architecture Checklist

- [x] React Three Fiber as rendering foundation
- [x] GLB models for all foreground assets
- [x] Ambient textures for background
- [x] Zustand for state management
- [x] Fixed timestep game loop in useFrame
- [x] Component-based entity architecture
- [x] Near-miss detection (50 unit threshold)
- [x] Tutorial zone invincibility (30s)
- [x] Combo system (2s window)
- [x] Deep merge save system

---

## 🔒 Document Status

**This architecture is FROZEN as of version 2.0.0**

**Major Change from v1.0.0:** Complete migration from Canvas 2D to React Three Fiber with GLB models

**Last Review:** 2025-10-27  
**Next Review:** After React Three Fiber implementation

---

**Core Principle:** React + Three.js provides superior visual quality, better performance through WebGL, and a more maintainable codebase through React's component model.
