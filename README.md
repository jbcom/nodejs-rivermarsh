# 🌊 Rivermarsh

> **A mobile-first 3D exploration game** where you play as an otter navigating wetland ecosystems. Built with React Three Fiber, `@jbcom/strata`, and Capacitor.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## 🎮 Playable Demo & Showcase

[**Launch Playable WebGL Demo**](https://jbcom.github.io/rivermarsh)

### 📸 Gameplay Showcase

| World Exploration | Dynamic Weather | Racing Mode |
|-------------------|-----------------|-------------|
| ![Exploration Placeholder](https://via.placeholder.com/400x225?text=Procedural+Biomes) | ![Weather Placeholder](https://via.placeholder.com/400x225?text=Rain+and+Snow+Effects) | ![Racing Placeholder](https://via.placeholder.com/400x225?text=River+Racing+Mini-game) |

### 🎞️ Core Gameplay Loop
![Gameplay GIF](https://via.placeholder.com/800x450?text=Core+Gameplay+Loop+-+Explore,+Survive,+Collect)

## ✨ Features

- 🗺️ **Procedural Worlds** - Infinite wetland biomes generated with OpenSimplex noise
- 🌧️ **Dynamic Weather** - Rain, snow, fog, and day/night cycles
- ⚔️ **RPG Combat** - Spells, enemies, boss battles, and leveling
- 🏃 **Racing Mode** - River racing mini-game with obstacles
- 📱 **Mobile-First** - Touch controls, gyroscope camera, responsive UI
- 🎮 **Cross-Platform** - Web, iOS, Android via Capacitor

## 📚 Library & Examples

The project includes a set of examples demonstrating the integration of `@jbcom/strata`:

- [**Basic Strata Example**](./examples/BasicStrata.tsx) - Atmospheric setup (Sky, Water, Fog)
- [**Weather System Example**](./examples/WeatherSystem.tsx) - Dynamic particle effects

To view these in the game, click the **EXAMPLES** button in the top-right corner of the HUD.

### API Documentation
API documentation is generated using TypeDoc:
```bash
pnpm run docs # Generates to docs/api
```

## 🎯 Current Status: Integration Phase

This repository unifies **three game projects** into one best-in-class experience:

| Source | Status | Features |
|--------|--------|----------|
| Rivermarsh (core) | ✅ Active | Exploration, biomes, NPC interactions |
| Rivers of Reckoning | 🧊 Archived | Combat, quests, leveling, spells |
| Otter River Rush | 🧊 Frozen | Racing, leaderboards, mobile controls |

See [Epic Issue #26](https://github.com/arcade-cabinet/rivermarsh/issues/26) for the full integration roadmap.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Rendering** | `@jbcom/strata` (procedural terrain, water, weather, particles) |
| **3D Framework** | React Three Fiber + drei |
| **Physics** | `@react-three/rapier` |
| **ECS** | Miniplex |
| **State** | Zustand |
| **Mobile** | Capacitor (iOS/Android) |
| **AI** | Yuka (behavior trees) |
| **Audio** | Tone.js |
| **Testing** | Vitest + Playwright |

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Run tests
pnpm run test
pnpm run test:e2e
```

## 📱 Mobile Development

```bash
# Android
pnpm run cap:sync:android
pnpm run cap:open:android

# iOS
pnpm run cap:sync:ios
pnpm run cap:open:ios
```

## 📁 Project Structure

```
src/
├── components/          # React/R3F components
│   ├── game/           # Game UI, NPCs
│   ├── mobile/         # Touch controls
│   └── ui/             # HUD, menus
├── ecs/                # Entity Component System
│   ├── systems/        # AI, Weather, Time, Biome
│   └── data/           # Biomes, species, resources
├── stores/             # Zustand state
└── utils/              # Audio, save, pools

integration/pending/     # Reference code (read-only)
├── rivers-of-reckoning/ # RPG mechanics source
└── otter-river-rush/    # Racing game source
```

## 🤖 AI Agent Support

This project is configured for multiple AI development assistants:

| Agent | Config Location |
|-------|-----------------|
| Claude | `CLAUDE.md` |
| Copilot | `.github/copilot-instructions.md` |
| Cursor | `.cursor/rules/*.mdc` |

See `AGENTS.md` for detailed instructions.

## 🚢 Deployment

### Render (Recommended)

The project includes a `render.yaml` Blueprint for one-click deployment:

1. Fork this repository
2. Connect to Render
3. Create new Blueprint from `render.yaml`
4. Deploy!

Preview environments are automatically created for PRs.

### Manual Build

```bash
pnpm run build
# Deploy contents of dist/ to any static host
```

## 📝 Contributing

1. Check existing issues and Epic #26
2. Create a feature branch
3. Follow conventional commits (`feat:`, `fix:`, `port:`)
4. Submit PR with tests

## 📄 License

MIT

---

*Built with 🦦 by [jbcom](https://github.com/jbcom)*
