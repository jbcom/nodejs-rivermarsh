# Agent Instructions for Rivermarsh

> **Best-in-class mobile-first 3D exploration game** built with React Three Fiber, `@jbcom/strata`, and Capacitor.

## 🌊 Project Vision

Rivermarsh is the **unified codebase** combining three game projects into one immersive experience:

| Source Repository | Status | Purpose |
|-------------------|--------|---------|
| **Rivermarsh** (this repo) | ✅ Active | Core exploration gameplay |
| **Rivers of Reckoning** | 🧊 Archived | RPG combat, leveling, quests |
| **Otter River Rush** | 🧊 Frozen | Racing mini-game, mobile controls |

### Core Gameplay Loop

1. **Explore** procedurally generated wetland biomes
2. **Survive** through weather, enemies, and environmental hazards
3. **Progress** by leveling up, collecting items, and completing quests
4. **Compete** in river racing challenges for high scores

## 📋 Integration Status

### Phase 1: Foundation ✅ Complete
- [x] Strata integration (PR #24)
- [x] Integration subtrees added (PR #25, #52)
- [x] Source repos frozen
- [x] Feature documentation (Issues #39-51)

### Phase 2: Feature Porting 🔄 In Progress
From **Rivers of Reckoning** (documented in issues):
- [ ] #39 - Shop System
- [ ] #40 - Boss Battle System
- [ ] #41 - Enemy Effects System
- [ ] #42 - Achievement System
- [ ] #43 - Difficulty Levels
- [ ] #44 - World Events System
- [ ] #45 - Dynamic Quest System
- [ ] #46 - Procedural Dungeon Generator
- [ ] #47 - Particle System with Spell Effects
- [ ] #48 - Modular Feature Toggle System
- [ ] #49 - Animated Tiles
- [ ] #50 - Spell/Mana System
- [ ] #51 - Extended Enemy Types

From **Otter River Rush**:
- [ ] #30 - River racing mini-game
- [ ] #32 - Mobile touch controls
- [ ] #33 - UI component consolidation

### Phase 3: Unification 📋 Planned
- [ ] Merge ECS systems from all sources
- [ ] Unified state management
- [ ] Single game mode selector
- [ ] Consolidated asset pipeline

### Phase 4: Polish 🎨 Future
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Mobile haptics
- [ ] Sound design refinement

## 🛠️ Development

### Quick Start

```bash
pnpm install        # Install dependencies
pnpm run dev        # Start dev server (http://localhost:5173)
pnpm run build      # Production build
pnpm run test       # Run unit tests
pnpm run test:e2e   # Run Playwright E2E tests
```

### Mobile Development

```bash
pnpm run cap:sync:android    # Sync to Android
pnpm run cap:open:android    # Open in Android Studio
pnpm run cap:sync:ios        # Sync to iOS
pnpm run cap:open:ios        # Open in Xcode
```

### Code Quality

```bash
pnpm run lint       # ESLint
pnpm run typecheck  # TypeScript check
pnpm run test       # Vitest
```

## 📁 Architecture

```
src/
├── components/          # React/R3F components
│   ├── game/           # Game-specific UI (GameUI, OtterNPC)
│   ├── mobile/         # Touch controls (VirtualJoysticks, GyroscopeCamera)
│   └── ui/             # HUD, menus, overlays
├── ecs/                # Entity Component System
│   ├── components.ts   # ECS component definitions
│   ├── systems/        # Game systems (AI, Weather, Time, Biome)
│   └── data/           # Static data (biomes, species, resources)
├── stores/             # Zustand state management
│   ├── gameStore.ts    # Main game state
│   └── useControlsStore.ts # Input state
├── shaders/            # Custom GLSL shaders
└── utils/              # Utilities (audio, save, pools)

integration/pending/     # Frozen source repos
├── rivers-of-reckoning/ # TypeScript/Strata RPG codebase
└── otter-river-rush/    # Racing mini-game source

.crewai/                # CrewAI agent configurations
.kiro/                  # Kiro agent specifications
.cursor/                # Cursor IDE rules
```

## 🎯 Key Technologies

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Rendering** | `@jbcom/strata` | Procedural terrain, water, weather, vegetation |
| **3D Framework** | React Three Fiber | Declarative Three.js |
| **Physics** | `@react-three/rapier` | Rigid body simulation |
| **ECS** | Miniplex | Entity management |
| **State** | Zustand | Reactive state |
| **Mobile** | Capacitor | Native iOS/Android |
| **AI** | Yuka | NPC behavior trees |
| **Testing** | Vitest + Playwright | Unit + E2E |

## 🎨 Strata Components in Use

| Component | Usage |
|-----------|-------|
| `AdvancedWater` | Rivers, lakes with caustics and foam |
| `ProceduralSky` | Dynamic sun, day/night cycle |
| `Rain`, `Snow` | Weather particle systems |
| `VolumetricFog` | Atmospheric depth |
| `ParticleEmitter` | Fireflies, spell effects |
| `GrassInstances` | GPU-instanced vegetation |
| `TreeInstances` | Procedural forests |
| `RockInstances` | Terrain details |
| `sdTerrain` | SDF-based terrain |

## 📝 Commit Convention

```
feat:     New feature
fix:      Bug fix
docs:     Documentation
refactor: Code restructure
port:     Code from integration sources
test:     Test additions
chore:    Build/tooling changes
```

## 🤖 Agent-Specific Instructions

### Claude
- **Role**: Architecture, complex refactoring, cross-file changes
- **Files**: `CLAUDE.md`, `.cursor/rules/*.mdc`
- **Focus**: Strata integration, ECS patterns, performance

### Copilot
- **Role**: Feature implementation, targeted fixes
- **Files**: `.github/copilot-instructions.md`
- **Focus**: Component development, test writing

### Cursor
- **Role**: IDE-integrated development
- **Files**: `.cursor/rules/*.mdc`
- **Focus**: Real-time assistance, quick fixes

### CrewAI
- **Role**: Multi-agent collaboration
- **Config**: `.crewai/manifest.yaml`
- **Crews**: Asset pipeline, creature design, gameplay design

### Kiro
- **Role**: Specification-driven development
- **Config**: `.kiro/steering/*.md`
- **Focus**: Quality standards, mobile-first design

## 🚀 Deployment

### Render (Production)
- **URL**: Configured via `render.yaml`
- **Type**: Static site
- **Build**: `pnpm install && pnpm run build`
- **Publish**: `./dist`

### Preview Environments
- Automatic previews for PRs via Render
- Each PR gets its own deployment

## ⚠️ Critical Rules

1. **DO NOT** modify `integration/pending/` - reference only
2. **ALWAYS** use `@jbcom/strata` components, never recreate
3. **NEVER** break mobile responsiveness
4. **TEST** on both desktop and mobile viewports
5. **DOCUMENT** ported features in issue comments

## 🔗 Key Resources

- [Epic Issue #26](https://github.com/arcade-cabinet/rivermarsh/issues/26) - Integration roadmap
- [Strata Documentation](https://github.com/jbcom/strata)
- [Render Blueprint Spec](https://render.com/docs/blueprint-spec)

---

*Last updated: December 2024 - Integration Phase*
