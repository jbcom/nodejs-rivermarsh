# Tech Context - Otter River Rush

> **Note**: This file serves as a Table of Contents for technology-related documentation. For detailed setup and configuration, see the linked documents.

## Technology Stack

### Core Technologies

#### Language & Runtime
- **TypeScript 5.5+** - Type-safe JavaScript with strict mode
  - Strict null checks enabled
  - No implicit any
  - Strict function types
  - Path mapping (`@/`, `@game/`, etc.)

#### Build System
- **Vite 5.4+** - Next generation frontend build tool
  - Lightning fast HMR
  - Optimized production builds
  - Plugin ecosystem (PWA, compression)
  - Bundle analysis built-in

#### Rendering
- **React Three Fiber (Three.js/WebGL)** - Declarative 3D rendering
  - GLB models with animations (useGLTF/useAnimations)
  - ProceduralSky, Terrain, post-processing
  - Fixed-timestep ECS systems

### Development Tools

#### Code Quality
- **ESLint 9** - Linting with TypeScript support
  - Flat config format (`eslint.config.js`)
  - Strict rules enabled
  - Zero warnings policy
  
- **Prettier 3** - Code formatting
  - Single quotes, semicolons
  - 2-space indentation
  - Auto-format on save

#### Testing
- **Vitest 4** - Unit & Integration testing framework
  - Fast parallel execution
  - TypeScript native
  - Coverage reporting (80%+ target)
  - Watch mode for development
  - **NEW**: `test:integration` script for core game logic tests
  
- **Playwright 1.47** - E2E testing
  - Multi-browser testing
  - Visual regression tests
  - Mobile device emulation (Pixel/iPhone/iPad)
  - Accessibility testing
  - Uses preview server or BASE_URL for stability

#### CI/CD
- **GitHub Actions** - Automated workflows  
  **CRITICAL ARCHITECTURE CORRECTION (2025-10-27)**:
  - ✅ Integration tests BEFORE platform branching (test game logic first!)
  - ✅ Three separate platform flows: Web, Mobile, Desktop
  - ✅ E2E tests against DEPLOYED GitHub Pages URL (not local artifacts)
  - ✅ No redundant testing of wrappers (Capacitor/Electron just package tested code)
  
  **Workflow Structure**:
  - `integration.yml` - Core game logic testing (lint, type, unit, integration)
  - `web.yml` - Web build → Deploy to Pages → E2E test deployed URL
  - `mobile.yml` - Mobile/Capacitor build after integration pass
  - `desktop.yml` - Desktop/Electron build after integration pass
  - `release.yml` - Semantic versioning orchestration

### Runtime Dependencies

#### Audio
- **Howler.js 2.2** - Web audio library
  - Cross-browser audio support
  - Sprite support
  - Spatial audio
  - HTML5 Audio / Web Audio API fallback

#### PWA
- **Vite Plugin PWA** - Progressive Web App support
  - Service worker generation
  - Offline caching
  - App manifest
  - Install prompts

#### Utilities
- **R3F helpers**: drei/postprocessing
- **Storage**: localStorage (no external library)
- **State**: Zustand

### Build Configuration

See detailed configuration in:
- [`tsconfig.json`](../../tsconfig.json) - TypeScript configuration
- [`vite.config.ts`](../../vite.config.ts) - Build configuration
- [`vitest.config.ts`](../../vitest.config.ts) - Test configuration
- [`playwright.config.ts`](../../playwright.config.ts) - E2E tests

## Development Setup

### Prerequisites
```bash
Node.js >= 22.0.0
npm >= 10.0.0
Java 17 (for Android builds)
```

### Docker Environment (Recommended)
```bash
# Quick start with pre-configured environment
.cursor/docker.sh build    # First time setup (~5-10 min)
.cursor/docker.sh dev       # Start development shell

# Inside container - all dependencies ready:
npm run dev                 # Vite dev server
npm run build-android       # Build APK
npm test                    # Run tests
```

**Benefits:**
- Matches CI environment exactly (Node 22, Java 17, Gradle 9.1.0)
- No version conflicts or "works on my machine" issues
- Complete Android SDK pre-installed
- ~3GB image with all tools ready

**See:** `.cursor/README.md` for complete Docker documentation

### Manual Installation
```bash
# Prerequisites
Node.js 22+, Java 17, Android SDK (for mobile)

# Clone repository
git clone https://github.com/jbcom/otter-river-rush.git
cd otter-river-rush

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Commands
```bash
# Development
npm run dev           # Start dev server (HMR enabled)
npm run build         # Production build
npm run preview       # Preview production build

# Testing
npm test              # Run unit tests (watch mode)
npm run test:run      # Run unit tests (once)
npm run test:e2e      # Run E2E tests
npm run test:coverage # Generate coverage report

# Code Quality
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint errors
npm run format        # Format with Prettier
npm run type-check    # TypeScript validation
npm run verify        # Run all checks (lint + type + test + build)

# Cross-Platform ✨ NEW
npm run electron:dev         # Desktop dev mode with hot reload
npm run electron:build       # Build desktop app
npm run electron:build:all   # Build for all desktop platforms
npm run cap:sync             # Sync web build to mobile
npm run cap:android          # Open in Android Studio
npm run cap:ios              # Open in Xcode
npm run cap:build:android    # Build Android APK
npm run cap:build:ios        # Build iOS IPA
npm run mobile:build         # Shortcut for Android build
npm run desktop:build        # Shortcut for desktop build
```

## Technical Constraints

### Browser Support
- **Modern browsers only**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **No IE11 support**: Uses ES2020+ features
- **Mobile**: iOS 14+, Android Chrome 90+

### Performance Requirements
- **60 FPS**: Must maintain on target devices
- **Bundle size**: < 2MB total
- **Load time**: < 2s first contentful paint
- **Memory**: < 50MB during gameplay

### Platform Constraints
- **Client-side only**: No server/backend
- **localStorage**: Max 5-10MB storage
- **WebGL required**: Three.js via R3F
- **Static hosting**: GitHub Pages compatible

## Dependencies

### Production Dependencies
```json
{
  "howler": "^2.2.4",
  "yuka": "^0.7.8"
}
```

### Development Dependencies
See [`package.json`](../../package.json) for complete list:
- TypeScript ecosystem
- Vite and plugins (including PWA, compression)
- Testing frameworks (Vitest, Playwright)
- Linting and formatting tools (ESLint, Prettier)
- **Tailwind CSS + PostCSS** ✨ NEW
- **DaisyUI component library** ✨ NEW
- **Capacitor (mobile)** ✨ NEW
- **Electron + electron-builder (desktop)** ✨ NEW
- **concurrently, wait-on** (dev utilities) ✨ NEW

### Dependency Management
- **Renovate**: Automated dependency updates
  - Configuration: [`renovate.json`](../../renovate.json)
  - Group updates by type
  - Auto-merge non-major updates
  - Weekly schedule

## Tool Usage Patterns

### TypeScript Patterns
```typescript
// Strict mode enforces these patterns
const value: string | null = getValue();

// Type guards
if (value !== null) {
  console.log(value.toUpperCase());
}

// No implicit any
function process(data: unknown): void {
  if (typeof data === 'string') {
    // data is narrowed to string here
  }
}
```

### Testing Patterns
```typescript
// Unit test example
import { describe, it, expect, beforeEach } from 'vitest';

describe('ScoreManager', () => {
  let manager: ScoreManager;
  
  beforeEach(() => {
    manager = new ScoreManager();
  });
  
  it('should track score correctly', () => {
    manager.collectCoin();
    expect(manager.getStats().score).toBe(10);
  });
});
```

### Build Optimization
- **Code splitting**: Vite automatic chunking
- **Tree shaking**: Unused code eliminated
- **Compression**: Gzip + Brotli enabled
- **Asset optimization**: Images optimized, sprites packed

## Development Workflow

### Local Development
1. Create feature branch from `main`
2. Make changes with HMR feedback
3. Write/update tests
4. Run `npm run verify` before commit
5. Create pull request

### CI/CD Flow (CORRECTED ARCHITECTURE - 2025-10-27)
```
Push to main
    ↓
INTEGRATION TESTS (integration.yml)
    ├── Lint (ESLint)
    ├── Type Check (tsc)
    ├── Unit Tests (Vitest)
    └── Integration Tests (Core game logic BEFORE platform branching!)
    ↓
┌───────────┬──────────────┬──────────────┐
│    WEB    │   MOBILE     │   DESKTOP    │
├───────────┼──────────────┼──────────────┤
│ Build web │ Build web    │ Build web    │
│     ↓     │     ↓        │     ↓        │
│  Deploy   │ Capacitor    │ Electron     │
│     ↓     │     ↓        │     ↓        │
│ E2E test  │ Build APK    │ Build exes   │
│ DEPLOYED  │     ↓        │     ↓        │
│    URL    │ Manual test  │ Manual test  │
└─────┬─────┴──────────────┴──────────────┘
      ↓
  RELEASE
  (semantic versioning)
```

**KEY PRINCIPLE**: Test game logic BEFORE platform wrappers, not after!

### Code Quality Gates
- ✅ Zero ESLint errors/warnings
- ✅ Zero TypeScript errors
- ✅ All tests passing
- ✅ 80%+ code coverage
- ✅ Successful production build
- ✅ Lighthouse score 95+

## Environment Configuration

### Development
```bash
NODE_ENV=development
VITE_DEV_SERVER_PORT=5173
```

### Production
```bash
NODE_ENV=production
# No environment variables needed
# All config is compile-time
```

### Environment Files
- No `.env` files used
- All configuration in TypeScript
- Compile-time configuration only

## Deployment

### GitHub Pages
- **Build**: Automatic via GitHub Actions
- **URL**: `https://jbcom.github.io/otter-river-rush/`
- **Trigger**: Push to `main` branch
- **Process**: Build → Deploy → Live in ~2 minutes

### Manual Deployment
```bash
npm run build        # Build for production
# Upload dist/ contents to any static host
```

## Security Considerations

### No Backend
- Client-side only application
- No authentication needed
- No API keys in code
- No sensitive data handling

### Privacy
- No analytics or tracking
- No cookies
- localStorage only for game saves
- No third-party requests (except asset CDNs)

### Content Security
- No user-generated content
- No XSS vectors
- Static assets only
- HTTPS enforced

## Performance Tools

### Development
- **Vite HMR**: Instant feedback on changes
- **Source maps**: Debug original TypeScript
- **Bundle analyzer**: Vite plugin for size analysis

### Testing
- **Vitest UI**: Visual test runner
- **Coverage reports**: HTML coverage viewer
- **Playwright trace**: Visual debugging of E2E tests

### Production
- **Lighthouse CI**: Performance monitoring
- **Bundle analysis**: Size tracking
- **Performance API**: Runtime metrics

## Troubleshooting

### Common Issues

**Build fails with TypeScript errors**
```bash
npm run type-check    # Check what's wrong
# Fix errors in code
```

**Tests fail**
```bash
npm test -- --reporter=verbose
# See detailed error messages
```

**HMR not working**
```bash
# Clear cache and restart
rm -rf node_modules/.vite
npm run dev
```

**E2E tests timeout**
```bash
# Increase timeout in playwright.config.ts
# Or run with --debug flag
npx playwright test --debug
```

## Further Reading

### Internal Documentation
- [Architecture Overview](../architecture/README.md)
- [Implementation Guide](../implementation/README.md)
- [Contributing Guide](../../CONTRIBUTING.md)

### External Resources
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [MDN Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)

## Recent Changes ✨

### 2025-10-27: Docker Environment & CI Optimization
**Major additions**:
- Comprehensive Docker development environment (`.cursor/`)
- Unified CI workflow (`build-platforms.yml`) - builds web once, reuses for all platforms
- Java 17 enforcement with modern Gradle patterns
- Fixed Android Gradle deprecations (property assignment syntax, `plugins.withType`)
- Resolved all PR review comments

**Impact**:
- Developer onboarding: minutes instead of hours
- CI optimization: 5-10 minutes saved per full platform build
- Zero Gradle deprecation warnings
- Perfect local/CI environment parity

### 2025-10-25: Production Infrastructure Overhaul
**Major additions**:
- Tailwind CSS 4.x with custom Otter theme
- DaisyUI 5.x component library
- Capacitor 7.x for mobile apps (Android/iOS)
- Electron 38.x for desktop apps (Win/Mac/Linux)
- electron-builder 26.x for packaging
- ResponsiveCanvas utility for adaptive rendering
- 10+ new npm scripts for cross-platform builds
- 2 new GitHub Actions workflows (mobile, desktop)

**Impact**:
- Now supports 7 platforms (was 1)
- Modern responsive UI framework
- Professional cross-platform deployment
- Automated build workflows

---

**Last Updated**: 2025-10-28  
**Document Type**: TOC (links to detailed tech docs)  
**Update Frequency**: When tech stack changes  
**Latest Update**: Mobile-first transformation complete, volumetric sky + PBR terrain integrated

---

## 🆕 v2.1.0 Updates (2025-10-28)

**Mobile-First Transformation:**
- Added `useMobileConstraints` hook (orientation, safe areas, haptics)
- Integrated `@takram/three-clouds` for volumetric sky
- Added `usePBRMaterial` hook for AmbientCG textures
- Consolidated CI/CD to `mobile-primary.yml` (ONE workflow)
- Best-in-class GHA actions (gradle, signing, Play Store upload)
- Anthropic Computer Use test for AI gameplay

**Graphics Upgrades:**
- Volumetric clouds with 3-layer system (low/mid/high altitude)
- PBR terrain with AmbientCG textures (Grass, Rock, Sand)
- Biome-aware materials and cloud coverage
- Mobile performance presets (low/medium/high)

**Testing:**
- 96/97 E2E passing across all devices
- Mobile gesture validation
- Complete game flow verified
- AI-driven autonomous gameplay test
