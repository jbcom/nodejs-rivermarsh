# CLAUDE.md - Rivermarsh

> Claude Code guidance for the unified Rivermarsh game project.

## 🎯 Current Focus: Integration Phase

We are **unifying three game codebases** into Rivermarsh:

| Source | Status | Key Features to Port |
|--------|--------|---------------------|
| Rivers of Reckoning | 🧊 Archived | Combat, quests, leveling, spells |
| Otter River Rush | 🧊 Frozen | Racing, mobile controls, leaderboards |

**Reference code lives in `integration/pending/` - read-only, do not modify.**

## 🚀 Quick Commands

```bash
pnpm install        # Install dependencies
pnpm run dev        # Dev server at localhost:5173
pnpm run build      # Production build to dist/
pnpm run test       # Vitest unit tests
pnpm run test:e2e   # Playwright E2E tests
pnpm run typecheck  # TypeScript validation
```

## 📁 Key Directories

| Path | Purpose |
|------|---------|
| `src/` | Active development - components, ECS, stores |
| `src/ecs/` | Entity Component System with Miniplex |
| `src/components/` | React Three Fiber + Strata components |
| `src/stores/` | Zustand state management |
| `integration/pending/` | Frozen source repos (reference only) |
| `.cursor/rules/` | Cursor IDE rules |

## 🎮 Architecture

### Rendering Stack
```
@jbcom/strata (procedural terrain, water, weather, particles)
    └── @react-three/fiber (declarative Three.js)
        └── three.js (WebGL)
```

### Game Logic Stack
```
Zustand (global state: game mode, player, inventory)
    └── Miniplex ECS (entities, components, systems)
        └── Yuka (AI behavior trees)
```

### Mobile Stack
```
Capacitor (native bridge)
    └── Virtual Joysticks (nipplejs)
    └── Gyroscope Camera
```

## ✅ Strata Integration Complete

The following `@jbcom/strata` components are active:

- `AdvancedWater` - Caustics, foam, depth coloring
- `ProceduralSky` - Dynamic sun position, day/night
- `Rain`, `Snow` - Weather particle systems
- `VolumetricFog` - Atmospheric effects
- `ParticleEmitter` - Fireflies, spell effects
- `GrassInstances`, `TreeInstances`, `RockInstances` - GPU vegetation
- `sdTerrain`, `marchingCubes` - Procedural terrain

**Rule: Never recreate what Strata provides.**

## 📋 Feature Issues to Implement

From Python/Pyxel codebase (documented):
- #39-44: Shop, Boss Battle, Enemy Effects, Achievements, Difficulty, Events
- #45-51: Quests, Dungeons, Particles, Feature Toggles, Animated Tiles, Spells, Enemies

From integration tracker:
- #28: Combat system
- #29: Leveling/progression
- #30: River racing mini-game
- #31: Day/night + weather unification
- #32: Mobile touch controls
- #33: UI consolidation

## 🔧 When Making Changes

1. **Check existing Strata components first** - don't reinvent
2. **Follow ECS patterns** in `src/ecs/` for game logic
3. **Use Zustand stores** for UI state
4. **Test mobile viewport** - game is mobile-first
5. **Update tests** for new features

## 📝 Commit Format

```
feat(scope): add feature description
fix(scope): fix bug description
port(source): port feature from Rivers/Otter
docs: update documentation
refactor: code improvement without behavior change
```

## ⚠️ Critical Rules

1. **integration/pending/** is READ-ONLY reference
2. **Always use Strata** - never duplicate its functionality
3. **Mobile-first** - test on touch devices
4. **No blocking operations** - keep frame rates high
5. **Document ports** - comment source in integration/

## 🔗 Resources

- Epic #26: Full integration roadmap
- AGENTS.md: Multi-agent instructions
- render.yaml: Deployment configuration
- .cursor/rules/: Cursor-specific guidance
