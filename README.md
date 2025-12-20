# 🦦 Otter River Rush

**A mobile-first 3D endless runner game built with React Three Fiber**

[![CI](https://github.com/jbcom/otter-river-rush/actions/workflows/mobile-primary.yml/badge.svg)](https://github.com/jbcom/otter-river-rush/actions/workflows/mobile-primary.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🎮 Play Now

**📱 Android**: [Download APK](https://github.com/jbcom/otter-river-rush/actions) → Artifacts → `app-debug-apk`  
**🌐 Web (PWA)**: [jbcom.github.io/otter-river-rush](https://jbcom.github.io/otter-river-rush/)  
**🖥️ Desktop**: [Download from Releases](https://github.com/jbcom/otter-river-rush/releases)

---

## 🌟 Features

### Mobile-First Design
- 📱 **Touch Controls** - Swipe to dodge, tap to jump
- 🔄 **Orientation Lock** - Portrait for phones, landscape for tablets
- 📲 **Safe Areas** - Notch and status bar awareness
- 📳 **Haptic Feedback** - Vibration on every action
- 🔋 **Performance** - 60 FPS on phones, optimized for battery
- 📴 **Offline Play** - PWA with service worker
- 🎯 **Responsive** - Adapts to phones, tablets, foldables

### AAA Graphics
- 🎨 **Volumetric Clouds** - Realistic 3-layer atmospheric rendering
- 🏔️ **PBR Terrain** - Photorealistic ground with AmbientCG textures
- 🦦 **11 Animations** - Walk, run, jump, dodge, collect, hit, death, victory
- 🌍 **4 Biomes** - Forest, mountain, canyon, rapids with unique visuals
- ✨ **Post-Processing** - Bloom, vignette, depth of field
- 🎬 **Smooth Animations** - Crossfade transitions, state-driven clips

### Gameplay
- 🏃 **Endless Runner** - Infinite procedural generation
- 🎯 **Progressive Difficulty** - Speed increases with distance
- 💎 **Collectibles** - Coins, gems, power-ups
- 🛡️ **Power-Ups** - Shield, ghost, magnet, multiplier, slow-motion
- 🏆 **Achievements** - 20+ unlockable achievements
- 📊 **Leaderboards** - Local high scores with stats
- 🎲 **4 Game Modes** - Classic, Time Trial, Zen, Daily Challenge

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 22+**
- **pnpm 10+**
- **Java 21** (for Android builds)

### Installation
```bash
# Clone repository
git clone https://github.com/jbcom/otter-river-rush.git
cd otter-river-rush

# Install dependencies
pnpm install

# Start development server
pnpm dev
# → http://localhost:5173
```

### Build for Production
```bash
# Web bundle
pnpm build

# Android APK
pnpm exec cap sync android
cd android && ./gradlew assembleDebug

# Desktop app
pnpm exec electron-builder --dir
```

---

## 🎯 Tech Stack

### Core
- **React 19** - UI framework
- **React Three Fiber 9** - Declarative Three.js
- **Three.js 0.180** - WebGL 3D engine
- **Miniplex 2** - Entity Component System
- **Zustand 5** - State management

### Graphics
- **@takram/three-clouds** - Volumetric clouds
- **@react-three/drei** - R3F helpers (useGLTF, useAnimations, PerspectiveCamera)
- **@react-three/postprocessing** - Effects (Bloom, Vignette)
- **AmbientCG** - PBR textures (grass, rock, sand)

### Mobile
- **Capacitor 7** - Android/iOS wrapper
- **PWA** - Offline support, install prompts
- **Safe Areas** - env(safe-area-inset-*)
- **Haptics** - Vibration API

### Development
- **TypeScript 5.5** - Type safety
- **Vite 7** - Build tool
- **Vitest 4** - Unit testing
- **Playwright 1.47** - E2E testing
- **Tailwind CSS 4** - Styling
- **pnpm** - Package manager

### Assets
- **Meshy AI** - Text-to-3D model generation
- **18 GLB models** - Characters, obstacles, collectibles (91 MB)
- **11 animations** - Full otter animation set
- **4 PBR texture sets** - AmbientCG (grass, rock, sand, river)

---

## 📁 Project Structure

```
otter-river-rush/
├── src/
│   ├── client/                    # Game runtime
│   │   ├── public/
│   │   │   ├── models/            # 18 GLB files + animations
│   │   │   ├── textures/          # AmbientCG PBR textures
│   │   │   ├── sprites/           # Legacy (unused)
│   │   │   └── hud/               # UI assets
│   │   ├── src/
│   │   │   ├── components/        # React components
│   │   │   │   ├── game/          # GameCanvas, Sky, Terrain, EntityRenderer
│   │   │   │   └── ui/            # HUD, Menu, GameOver
│   │   │   ├── ecs/               # Miniplex systems
│   │   │   │   ├── systems.tsx    # Core ECS systems
│   │   │   │   ├── world.ts       # Entity definitions
│   │   │   │   └── *-system.tsx   # Individual systems
│   │   │   ├── hooks/             # Custom hooks
│   │   │   │   ├── useMobileConstraints.ts
│   │   │   │   ├── usePBRMaterial.ts
│   │   │   │   └── useGameStore.ts
│   │   │   ├── utils/             # Utilities
│   │   │   │   ├── ambientcg.ts   # Texture helpers
│   │   │   │   ├── model-manifest.ts
│   │   │   │   └── debug-tools.ts
│   │   │   └── config/            # Constants
│   │   └── tests/
│   │       ├── e2e/               # Playwright tests
│   │       └── integration/       # ECS tests
│   └── dev-tools/                 # Asset generation
│       └── src/
│           ├── meshy/             # Meshy API integration
│           ├── generators/        # Model generators
│           ├── pipelines/         # Asset pipeline
│           └── scripts/           # Utility scripts
├── android/                       # Capacitor Android project
├── wrappers/electron/             # Electron wrapper
├── docs/                          # Documentation
│   ├── ARCHITECTURE.md            # v2.1.0 - R3F architecture
│   ├── MOBILE_FIRST_DESIGN.md     # Mobile-first spec
│   ├── MOBILE_FIRST_STATUS.md     # Transformation summary
│   └── memory-bank/               # Project context
└── .github/workflows/             # CI/CD
    └── mobile-primary.yml         # THE main workflow
```

---

## 🎮 Game Systems

### Entity Component System (Miniplex)
**10 Core Systems:**
- **Movement** - Fixed-timestep physics (60 FPS)
- **Collision** - AABB detection with spatial grid
- **Spawner** - Procedural entity generation
- **Cleanup** - Off-screen entity removal
- **Score** - Points, distance, combo tracking
- **Difficulty** - Progressive speed scaling
- **Biome** - 4 biomes with visual transitions
- **Power-Up** - Shield, ghost, magnet, multiplier
- **Animation** - GLB clip playback with crossfade
- **Input** - Keyboard + touch + pointer events

**Supporting Systems:**
- Achievement, Combo, Magnet, NearMiss, Shield, Weather, Quest, Leaderboard, Enemy, Camera

### All 11 Otter Animations
✅ Idle, Walk, Run, Jump  
✅ Dodge-Left, Dodge-Right  
✅ Collect, Hit, Death  
✅ Victory, Happy

---

## 🎨 Graphics Pipeline

### Volumetric Sky (ser-plonk inspired)
```typescript
<VolumetricSky coverage={0.4} qualityPreset="medium">
  <CloudLayer channel='r' altitude={750} shadow />   // Low cumulus
  <CloudLayer channel='g' altitude={1500} shadow />  // Mid layer
  <CloudLayer channel='b' altitude={5000} />          // High cirrus
</VolumetricSky>
```

### PBR Terrain (AmbientCG textures)
```typescript
const material = usePBRMaterial({
  color: 'textures/Grass001/Grass001_1K_Color.jpg',
  normal: 'textures/Grass001/Grass001_1K_NormalGL.jpg',
  roughness: 'textures/Grass001/Grass001_1K_Roughness.jpg',
  ao: 'textures/Grass001/Grass001_1K_AmbientOcclusion.jpg',
  repeat: [16, 16],
});
```

**Biome-Specific Materials:**
- Forest → Grass (Grass001)
- Mountain → Granite (Rock024)
- Canyon → Sand (Ground037)
- Rapids → River Rocks (Rock022)

---

## 🧪 Testing

### Test Coverage
- **96/97 E2E Tests Passing** (99% success rate)
- **All Devices**: Desktop, Mobile Chrome, Mobile Safari, iPad
- **Complete Flow**: Menu → Play → Dodge → Collect → Die → Restart → Menu

### Test Types
1. **Unit Tests** - Component logic, utilities
2. **Integration Tests** - ECS systems, game logic
3. **E2E Tests** - Full game flow with Playwright
4. **Mobile Tests** - Gesture validation, device profiles
5. **AI Tests** - Anthropic Computer Use (autonomous gameplay)
6. **Visual Tests** - Screenshot regression

### Run Tests
```bash
# Unit + integration
pnpm --filter client test

# E2E (all devices)
pnpm --filter client test:e2e

# E2E (chromium only, fast)
pnpm --filter client test:e2e --project=chromium

# Mobile gestures
pnpm --filter client test:e2e tests/e2e/mobile-gestures.spec.ts

# AI playthrough (requires ANTHROPIC_API_KEY)
ANTHROPIC_API_KEY=xxx pnpm --filter client test:e2e tests/e2e/anthropic-computer-use.spec.ts
```

---

## 📱 Mobile Development

### Install on Android Device
```bash
# Build APK
pnpm build
pnpm exec cap sync android
cd android && ./gradlew assembleDebug

# Install via ADB
adb connect YOUR_DEVICE_IP:PORT
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### iOS Build
```bash
pnpm exec cap sync ios
pnpm exec cap open ios
# Build in Xcode
```

### Test Mobile Features
- [ ] Swipe left/right (haptic feedback)
- [ ] Swipe up (jump with haptic)
- [ ] Portrait orientation lock
- [ ] Safe areas (no content under notch)
- [ ] Background app (auto-pause)
- [ ] Volumetric clouds
- [ ] PBR terrain textures
- [ ] All animations play

---

## 🛠️ Development Commands

### Essential
```bash
pnpm dev                      # Dev server (HMR)
pnpm build                    # Production build
pnpm preview                  # Preview build
pnpm test                     # Unit tests (watch)
pnpm test:e2e                 # E2E tests
pnpm type-check               # TypeScript
pnpm lint                     # ESLint
```

### Asset Generation (requires API keys)
```bash
export MESHY_API_KEY=xxx
export ANTHROPIC_API_KEY=xxx
export OPENAI_API_KEY=xxx

pnpm generate:models          # 3D models via Meshy
pnpm generate:animations      # Otter animations
pnpm --filter dev-tools tsx src/scripts/download-ambientcg-textures.ts
```

### Platform Builds
```bash
# Android
pnpm exec cap sync android
cd android && ./gradlew assembleRelease

# iOS
pnpm exec cap sync ios
pnpm exec cap open ios

# Desktop
pnpm exec electron-builder --mac dmg
pnpm exec electron-builder --win nsis
pnpm exec electron-builder --linux AppImage
```

---

## 🏗️ Architecture

### High-Level Overview
```
┌─────────────────────────────────────────────────────┐
│                  Mobile-First Game                  │
├─────────────────────────────────────────────────────┤
│  Touch Input → State → ECS → R3F → WebGL          │
└─────────────────────────────────────────────────────┘

React App (Zustand State)
    ↓
GameCanvas (React Three Fiber)
    ↓
  ┌─────────────────────────────────────┐
  │ PerspectiveCamera (60° FOV phones)  │
  │ VolumetricSky (biome-aware clouds)  │
  │ Terrain (PBR heightmap)             │
  │ EntityRenderer (GLB models)         │
  │   ├─ Otter (11 animations)          │
  │   ├─ Rocks (4 variants)             │
  │   ├─ Coins, Gems                    │
  │   └─ Particles                      │
  │ Post-Processing (Bloom, Vignette)   │
  └─────────────────────────────────────┘
    ↓
ECS Systems (Fixed 60 FPS)
    ├─ Movement, Collision, Spawner
    ├─ Score, Difficulty, Biome
    ├─ Animation, Camera, Input
    └─ PowerUp, Achievement, Audio
```

### Technology Choices

| Aspect | Technology | Why |
|--------|-----------|-----|
| **Rendering** | React Three Fiber | Declarative 3D, React integration |
| **3D Engine** | Three.js | Industry standard WebGL |
| **ECS** | Miniplex | Performance, data-oriented design |
| **State** | Zustand | Simple, fast, TypeScript-friendly |
| **Models** | GLB (Meshy AI) | 3D with animations, professional quality |
| **Textures** | AmbientCG PBR | Photorealistic, free CC0 |
| **Sky** | @takram/three-clouds | Volumetric realism |
| **Mobile** | Capacitor 7 | Native features, app store ready |
| **Build** | Vite 7 | Fast HMR, optimized production |
| **Tests** | Vitest + Playwright | Fast, comprehensive |

---

## 📊 Performance

### Bundle Size
- **Web**: 1.54 MB (421 KB gzip, 329 KB brotli)
- **Android**: 96 MB (includes WebView, 3D models, textures)
- **PWA Cache**: 79 entries (42 MB) for offline play

### Runtime Performance
- **Desktop**: 60-120 FPS (Chromium, Firefox, Safari)
- **Tablets**: 60 FPS (iPad, Galaxy Tab)
- **Phones**: 30-60 FPS (iPhone 12+, Pixel 5+)
- **Memory**: 60-80 MB during gameplay

### Optimizations
- Fixed-timestep game loop (deterministic)
- Mobile LOD (64×64 terrain on phones, 128×128 tablets)
- Antialiasing disabled on mobile
- Pixel ratio capped at 2x
- Cloud quality presets (low/medium/high)
- Object pooling (implicit via ECS)
- Texture caching (automatic)

---

## 🎨 Assets

### 3D Models (Meshy AI Generated)
**18 GLB Files (91 MB):**
- **Otter**: 1 base model + 10 animation GLBs
- **Rocks**: 4 variants (river, mossy, cracked, crystal)
- **Collectibles**: Gold coin, red gem
- **Total**: Professional rigged and animated 3D models

### Textures (AmbientCG)
**4 PBR Sets (30 MB):**
- Grass001 - Forest biome ground
- Rock024 - Mountain biome terrain
- Rock022 - River rock obstacles
- Ground037 - Canyon/desert sand

**Each set includes:**
- BaseColor (diffuse)
- NormalGL (bump mapping)
- Roughness (surface property)
- AmbientOcclusion (depth/shadows)
- Displacement (height detail)

---

## 🧪 Testing & Quality

### Automated Testing
```bash
# Full test suite
pnpm test                              # Unit tests
pnpm --filter client test:e2e          # E2E all devices
pnpm --filter client test:e2e --project=chromium  # Fast E2E

# CI/CD
# → mobile-primary.yml runs on every push
# → Builds web → E2E → Android APK → Deploy Pages
```

### Test Results
- ✅ **96/97 E2E Passing** (99% success)
- ✅ **All Devices** (Desktop, Phone, Tablet)
- ✅ **Complete Flow** (Menu → Play → Die → Restart)
- ✅ **Mobile Gestures** (Swipe validation)
- ✅ **AI Playthrough** (Anthropic Computer Use)

---

## 📱 Mobile-First Features

### Device Support
- ✅ **Phones** (iPhone 12+, Pixel 5+, Galaxy S21+)
- ✅ **Tablets** (iPad 10"+, Galaxy Tab S8+)
- ✅ **Foldables** (Pixel Fold, Galaxy Z Fold)
- ✅ **Notches** (Dynamic Island, status bar awareness)

### Mobile UX
- **Orientation**: Portrait lock (phones), landscape (tablets)
- **Safe Areas**: Content respects notch and status bar
- **Haptics**: Vibration on dodge, jump, collect, hit, death
- **Lifecycle**: Auto-pause on background, proper resume
- **Gestures**: Swipe left/right/up, tap to pause
- **PWA**: Fullscreen mode, offline play, install prompt

---

## 🚀 CI/CD Pipeline

### Primary Workflow (`mobile-primary.yml`)
**Runs on every push to main:**

```
Build Web Bundle
    ↓
Run E2E Tests (Chromium, fast)
    ↓
Build Android APK (debug + release)
    ↓
Deploy to GitHub Pages (web preview)
```

**Artifacts:**
- `app-debug-apk` - Debug APK (30 days)
- `app-release-apk` - Release APK (90 days)
- `web-dist` - Web bundle (7 days)

### Best-in-Class GHA Actions Used
- `gradle/actions/setup-gradle@v4` - Gradle caching
- `r0adkll/sign-android-release@v1` - APK signing
- `r0adkll/upload-google-play@v1` - Play Store upload
- `cycjimmy/semantic-release-action@v4` - Semantic versioning
- `actions/configure-pages@v5` - Pages deployment
- `codecov/codecov-action@v5` - Coverage reporting

### Semantic Versioning
Commits follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` → Minor version bump
- `fix:` → Patch version bump
- `BREAKING CHANGE:` → Major version bump

---

## 📚 Documentation

### Essential Docs
- **[MOBILE_FIRST_DESIGN.md](/docs/MOBILE_FIRST_DESIGN.md)** - Mobile-first specification
- **[ARCHITECTURE.md](/docs/ARCHITECTURE.md)** - v2.1.0 R3F architecture
- **[QUICKSTART.md](/QUICKSTART.md)** - Development guide
- **[CONTRIBUTING.md](/CONTRIBUTING.md)** - Contribution guidelines

### Memory Bank
- **[activeContext.md](/docs/memory-bank/activeContext.md)** - Current session
- **[systemPatterns.md](/docs/memory-bank/systemPatterns.md)** - Architecture patterns
- **[techContext.md](/docs/memory-bank/techContext.md)** - Tech stack
- **[progress.md](/docs/memory-bank/progress.md)** - Development progress

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Make changes
4. Run tests (`pnpm test && pnpm test:e2e`)
5. Commit with conventional commits (`feat: add amazing feature`)
6. Push and create PR

**All PRs must:**
- ✅ Pass E2E tests
- ✅ Pass type-check
- ✅ Pass linting
- ✅ Include tests for new features
- ✅ Update documentation

---

## 📄 License

MIT License - See [LICENSE](LICENSE)

---

## 🙏 Credits

### Technologies
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - Declarative Three.js
- [Miniplex](https://miniplex.hmans.co/) - ECS for React
- [Meshy AI](https://meshy.ai/) - Text-to-3D generation
- [AmbientCG](https://ambientcg.com/) - CC0 PBR textures
- [@takram/three-clouds](https://github.com/takram-design-engineering/three-clouds) - Volumetric clouds
- [Capacitor](https://capacitorjs.com/) - Mobile app framework

### Inspiration
- **ser-plonk** - Sky and terrain rendering patterns
- Temple Run, Subway Surfers - Endless runner mechanics
- Alto's Adventure - Visual style and biome system

---

**Built with 🦦 by [@jbcom](https://github.com/jbcom)**

**Status**: ✅ Production Ready | 📱 Mobile-First | 🎮 96/97 Tests Passing
