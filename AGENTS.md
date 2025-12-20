# Agent Instructions for Rivermarsh

## 🌊 Project Overview

Rivermarsh is a **mobile-first 3D exploration game** where you play as an otter navigating wetland ecosystems. Built with React Three Fiber, `@jbcom/strata`, and Capacitor.

### Current Status: Integration Phase

This repository is the **target for unifying three games** into one best-in-class experience:

| Source | Status | Location |
|--------|--------|----------|
| **Rivermarsh** (core) | Active | `src/` |
| **Rivers of Reckoning** | Frozen @ v1.0.0 | `integration/pending/rivers-of-reckoning/` |
| **Otter River Rush** | Frozen @ v1.0.0 | `integration/pending/otter-river-rush/` |

See **Epic Issue #26** for the full integration roadmap.

## 🎮 Integration Priorities

### From Rivers of Reckoning
- [ ] Combat system with damage indicators
- [ ] Enemy AI with pathfinding
- [ ] Leveling and progression
- [ ] Day/night cycle integration
- [ ] Weather effects (already using Strata)

### From Otter River Rush
- [ ] River racing mini-game mode
- [ ] Obstacle avoidance mechanics
- [ ] Score/leaderboard system
- [ ] Swimming physics refinements

## 🛠️ Development Commands

```bash
# Install dependencies
pnpm install

# Development server
pnpm run dev

# Build for production
pnpm run build

# Run tests
pnpm run test

# Android
pnpm run cap:sync:android
pnpm run cap:open:android
```

## 📁 Architecture

```
src/                          # Main application (active development)
├── components/               # React/R3F components (uses @jbcom/strata)
├── ecs/                      # Entity Component System (Miniplex)
├── stores/                   # Zustand state management
└── ...

integration/pending/          # Frozen source repos for porting
├── rivers-of-reckoning/      # RPG mechanics, combat, leveling
└── otter-river-rush/         # Racing mini-game, mobile controls
```

## 🎯 Key Technologies

| Layer | Technology |
|-------|------------|
| Rendering | `@jbcom/strata` (procedural terrain, water, weather, particles) |
| Physics | `@react-three/rapier` |
| ECS | Miniplex |
| State | Zustand |
| Mobile | Capacitor |
| UI | React Three Fiber + drei |

## ✅ Strata Integration Complete

The following Strata components are now in use:
- `AdvancedWater` - Caustics, foam, depth coloring
- `ProceduralSky` - Dynamic sun position
- `Rain`, `Snow` - Weather particles
- `VolumetricFog` - Atmospheric effects
- `ParticleEmitter` - Fireflies and effects
- `GrassInstances`, `TreeInstances`, `RockInstances` - GPU vegetation
- `sdTerrain`, `marchingCubes` - Procedural terrain

## 📝 Commit Convention

Use conventional commits:
- `feat:` New features
- `fix:` Bug fixes  
- `docs:` Documentation
- `refactor:` Code changes without behavior change
- `port:` Porting code from integration sources

## ⚠️ Important Notes

1. **Don't modify `integration/pending/`** - These are frozen snapshots for reference
2. **Port, don't copy** - Adapt code to use Strata APIs
3. **Mobile-first** - All features must work on touch devices
4. **Test on device** - Use Capacitor to test on real mobile hardware

## 🔗 Related Issues

- **#26** - Epic: Unify Rivers of Reckoning and Otter River Rush
- **#2** - Strata integration ✅ (Complete)
- **#1** - Agentic-crew integration
