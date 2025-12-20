# Project Brief - Otter River Rush

**Last Updated:** 2025-10-27  
**Status:** 🔒 FROZEN Foundation Document  
**Aligns With:** DESIGN.md, BRAND_IDENTITY.md, ARCHITECTURE.md

---

## 🎯 Project Mission

**Build a joyful, accessible endless runner that proves browser games can be performant, beautiful, and ethical—without exploitation or compromise.**

---

## 📋 Project Identity

### What We're Building
**Otter River Rush:** A browser-based endless runner featuring Rusty the Otter navigating a rushing river, collecting treasures, avoiding obstacles, and discovering biomes—all while bringing joy to players across devices.

### Core Technology
- **Platform:** Web (PWA-enabled)
- **Language:** TypeScript (strict mode)
- **Rendering:** HTML5 Canvas 2D
- **Architecture:** Entity Component System
- **Distribution:** GitHub Pages (static hosting)
- **License:** MIT (open source)

---

## 🎯 Project Goals

### Primary Objectives (Must Achieve)
1. **Create Flow:** Game induces flow state within 2 minutes
2. **60 FPS Everywhere:** Maintains performance on all target devices
3. **Accessibility:** WCAG 2.1 AA compliant, multiple input methods
4. **Ethical Design:** Zero dark patterns, no monetization manipulation
5. **Open Source Excellence:** Demonstrates best practices for learning

### Secondary Objectives (Nice to Have)
6. **Educational Value:** Becomes reference for game development
7. **Community Growth:** Active contributors and players
8. **Cross-Platform:** Works seamlessly across devices
9. **Offline-First:** Full gameplay without internet
10. **Performance Benchmark:** 95+ Lighthouse score

---

## 👥 Target Audiences

### Players (Primary Users)
1. **Commuters:** Quick 2-5 minute sessions (mobile-first)
2. **Achievement Hunters:** Complete challenges, track progress (desktop + mobile)
3. **Relaxation Seekers:** Zen mode, stress relief (tablet + desktop)
4. **Competitive Players:** Speedrunning, optimization (desktop primary)
5. **Families:** Parent-child bonding, appropriate content (tablets)

### Developers (Secondary Users)
1. **Students:** Learning game development patterns
2. **Contributors:** Open source community
3. **Educators:** Using as teaching example
4. **Portfolio Builders:** Reference for hiring

---

## ✅ Success Criteria

### Launch Criteria (Must Complete Before V1.0)
- [x] Core gameplay loop is fun (playtesting validates)
- [x] 60 FPS maintained on target devices
- [ ] Accessibility: WCAG AA compliance verified
- [ ] All game modes functional (Classic, Time Trial, Zen)
- [ ] Achievement system complete (50+ achievements)
- [ ] Save/load system reliable
- [ ] Audio system polished (SFX + music)
- [ ] Zero critical bugs
- [ ] Documentation complete
- [ ] Test coverage 80%+

### Post-Launch Success Metrics
- **Engagement:** 40%+ return within 24 hours
- **Retention:** 30%+ still playing after 7 days
- **Performance:** 60 FPS 99%+ of gameplay
- **Accessibility:** Zero blocking accessibility issues
- **Community:** Active GitHub stars, forks, contributions
- **Technical:** Lighthouse 95+ across all categories

---

## 🚀 Core Features (Frozen Scope)

### Must-Have (P0)
1. **Lane-Based Endless Runner:** 3-lane vertical scrolling
2. **Controls:** Touch swipe, keyboard (arrows/WASD), mouse clicks
3. **Obstacles:** Procedurally generated, fair, learnable patterns
4. **Collectibles:** Coins, gems with visual/audio feedback
5. **Scoring:** Points, distance, combo system
6. **Game Loop:** Menu → Play → Game Over → Restart (< 2s)

### Should-Have (P1)
7. **Achievements:** 50+ goals across categories
8. **Power-Ups:** Shield, Magnet, Slow-Mo, Ghost, Multiplier
9. **Biomes:** 4 distinct environments (Forest, Mountain, Canyon, Rapids)
10. **Game Modes:** Classic, Time Trial, Zen, Daily Challenge
11. **Progression:** Save/load, personal bests, statistics
12. **Audio:** Spatial SFX, adaptive music, ambient sounds

### Nice-to-Have (P2)
13. **Unlockables:** Rusty skins, river themes
14. **Polish:** Particle effects, screen shake, animations
15. **Accessibility:** Colorblind modes, high contrast, reduced motion
16. **Statistics:** Dashboard with detailed stats

---

## 🚫 Out of Scope (Explicitly NOT Building)

### V1.0 Exclusions
- ❌ Multiplayer (real-time or asynchronous)
- ❌ Global leaderboards (requires backend)
- ❌ User accounts / social login
- ❌ Backend services / APIs
- ❌ Native mobile apps (PWA is sufficient)
- ❌ WebGL / 3D graphics
- ❌ Monetization (ads, IAP, premium)
- ❌ Analytics / tracking
- ❌ Modding support
- ❌ Level editor

### Future Phases (Maybe)
- Online leaderboards (with consent, privacy-first)
- Ghost racing (replay against friends)
- Community challenges
- User-generated patterns
- Boss encounters
- Additional biomes

---

## 📐 Technical Requirements

### Performance (Non-Negotiable)
- **Frame Rate:** 60 FPS maintained 99%+ of gameplay
- **Load Time:** < 2s first contentful paint
- **Bundle Size:** < 2MB total (< 500KB gzipped)
- **Memory:** < 50MB during active gameplay
- **Battery:** < 10% drain per 30 minutes (mobile)

### Quality Gates (Must Pass)
- ✅ Zero TypeScript errors (strict mode)
- ✅ Zero ESLint warnings
- ✅ 80%+ test coverage (unit + integration)
- ✅ All E2E tests passing
- ✅ Lighthouse score 95+ (all categories)
- ✅ WCAG 2.1 AA compliance verified
- ✅ Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

### Browser Support
- **Modern browsers only:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **No IE11:** Uses ES2020+ features
- **Mobile:** iOS 14+, Android Chrome 90+
- **Progressive Enhancement:** Core game works, extras enhance

---

## 🗓️ Project Timeline

### Phase 1: Foundation (COMPLETE)
**Duration:** Initial setup  
**Deliverables:**
- [x] TypeScript configuration (strict mode)
- [x] Build system (Vite)
- [x] Testing infrastructure (Vitest, Playwright)
- [x] CI/CD pipeline (GitHub Actions)
- [x] Project documentation

### Phase 2: Core Gameplay (CURRENT - IN PROGRESS)
**Duration:** Core loop development  
**Deliverables:**
- [ ] Game loop (60 FPS fixed timestep)
- [ ] Entity Component System
- [ ] Input system (touch, keyboard, mouse)
- [ ] Basic obstacles and collectibles
- [ ] Collision detection
- [ ] Score system
- [ ] Game states (menu, playing, game over)

### Phase 3: Engagement Systems (NEXT)
**Duration:** Retention features  
**Deliverables:**
- [ ] Achievement system (50+ achievements)
- [ ] Power-up system (5 types)
- [ ] Biome system (4 biomes)
- [ ] Procedural generator (pattern-based)
- [ ] Save/load system (localStorage)
- [ ] Game modes (Classic, Time Trial, Zen, Daily)

### Phase 4: Polish & Launch (FINAL)
**Duration:** Quality and launch  
**Deliverables:**
- [ ] Audio system (SFX + music)
- [ ] Particle effects
- [ ] Animation juice
- [ ] Accessibility features
- [ ] Performance optimization
- [ ] Full documentation
- [ ] V1.0 Launch

### Phase 5: Post-Launch (ONGOING)
**Duration:** Continuous improvement  
**Deliverables:**
- [ ] Community feedback integration
- [ ] Bug fixes
- [ ] Performance improvements
- [ ] Additional content (biomes, achievements)
- [ ] Educational content (tutorials, case studies)

---

## 🛠️ Technology Stack (Frozen)

### Core Technologies
```
Language:     TypeScript 5.5+
Build:        Vite 7.1+
Rendering:    Canvas 2D (native)
Audio:        Howler.js 2.2
State:        Zustand 5.0 (if needed, prefer vanilla)
Styling:      Tailwind CSS 4 (UI only)
```

### Development Tools
```
Testing:      Vitest 4.0, Playwright 1.47
Linting:      ESLint 9, Prettier 3
CI/CD:        GitHub Actions
Hosting:      GitHub Pages
Monitoring:   Lighthouse CI
```

### Why These Choices?
- **TypeScript:** Type safety, better DX, catch errors early
- **Vite:** Fast builds, HMR, modern tooling
- **Canvas 2D:** Sufficient performance, better compatibility
- **Howler.js:** Best-in-class web audio library
- **No Framework:** Vanilla JS/TS for performance and learning value

---

## 🎨 Design Principles (Frozen)

### Gameplay Design
1. **Easy to Learn:** Intuitive in 30 seconds
2. **Hard to Master:** Skill ceiling for experts
3. **Constant Feedback:** Every action has response
4. **Fair Challenge:** Difficult but never cheap
5. **Rewarding Progression:** Frequent small wins

### Technical Design
1. **Performance First:** 60 FPS is non-negotiable
2. **Type Safety:** Strict TypeScript, no `any`
3. **Testability:** All systems designed for testing
4. **Maintainability:** Clear code, good docs
5. **Accessibility:** WCAG compliance from start

### UX Design
1. **Instant Gratification:** Playable in < 2s
2. **No Barriers:** Free, no registration, no downloads
3. **Respect Privacy:** No tracking, no data collection
4. **Inclusive:** Accessible to all abilities
5. **Offline-First:** Works anywhere, anytime

---

## 🚧 Constraints & Limitations

### Technical Constraints
- **Client-Side Only:** No backend (static hosting)
- **Storage Limit:** localStorage max 5-10MB
- **Canvas 2D:** No WebGL/3D (by design)
- **Static Hosting:** GitHub Pages limitations

### Resource Constraints
- **Zero Budget:** Free tools and assets only
- **Open Source:** Community-driven development
- **Solo/Small Team:** Limited person-hours

### Design Constraints
- **No Monetization:** No revenue model
- **Privacy-First:** No analytics or tracking
- **Browser-Only:** No native apps (PWA only)
- **Modern Browsers:** No legacy support

---

## 📊 Metrics & Monitoring

### Player Metrics (Local Only)
- Sessions played (count)
- High scores (for leaderboard)
- Achievements unlocked (for progression)
- Settings preferences (for UX)

### Technical Metrics (CI/CD)
- Build time
- Bundle size
- Lighthouse scores
- Test coverage
- Error rates (local logging)

### Community Metrics (Public)
- GitHub stars
- GitHub forks
- Contributors
- Issues/PRs
- Discussions engagement

**Note:** No user-level tracking. Privacy is paramount.

---

## 🔒 Privacy & Security

### Privacy Principles
1. **Local-First:** All data on device only
2. **No Tracking:** Zero analytics
3. **No Accounts:** No user identification
4. **User Control:** Can delete all data anytime
5. **Transparent:** Code is open source

### Security Considerations
- **No Backend:** Can't be hacked (no server)
- **No Auth:** No passwords to leak
- **No PII:** No personal data collected
- **Static Assets:** Can't inject malicious code
- **HTTPS:** Enforced by GitHub Pages

---

## 🤝 Contribution Guidelines

### How to Contribute
1. **Fork Repository**
2. **Create Feature Branch**
3. **Make Changes** (follow code style)
4. **Write Tests** (maintain 80%+ coverage)
5. **Run Checks** (`npm run verify`)
6. **Submit PR** (clear description)

### Code Standards
- TypeScript strict mode (no `any`)
- ESLint clean (zero warnings)
- Prettier formatted
- Tests for new features
- Documentation for complex logic

### Areas Needing Help
- Accessibility testing (WCAG validation)
- Cross-browser testing
- Performance optimization
- New achievements/patterns
- Audio asset creation
- Documentation improvements

---

## 📚 Documentation Structure

```
docs/
├── DESIGN.md              (Frozen game design doc)
├── BRAND_IDENTITY.md      (Frozen brand/visual spec)
├── ARCHITECTURE.md        (Frozen technical architecture)
├── memory-bank/
│   ├── projectbrief.md    (This file)
│   ├── productContext.md  (Product vision & roadmap)
│   ├── activeContext.md   (Current work status)
│   ├── progress.md        (Implementation progress)
│   ├── systemPatterns.md  (Code patterns & conventions)
│   └── techContext.md     (Tech stack details)
└── implementation/
    └── (Implementation guides as needed)
```

---

## ✅ Project Health Checklist

A healthy project has:
- [x] Clear vision (documented in DESIGN.md)
- [x] Defined scope (frozen features list)
- [x] Technical foundation (TypeScript, tests, CI/CD)
- [x] Quality standards (type checks, linting, coverage)
- [x] Documentation (comprehensive and up-to-date)
- [ ] Working gameplay (core loop functional)
- [ ] Community engagement (GitHub activity)
- [ ] Accessibility (WCAG compliance)
- [ ] Performance (60 FPS, fast load)
- [ ] Polish (audio, animations, juice)

---

## 🔮 Future Vision

### Post-V1.0 Enhancements
- **V1.1:** Enhanced progression (unlockables, skins)
- **V1.2:** Additional biomes and modes
- **V1.3:** Community features (ghost racing, sharing)
- **V2.0:** Advanced content (boss encounters, seasonal events)

### Long-Term Aspirations
- Become reference implementation for ethical game design
- Used in game development courses
- Active community of contributors
- Ported to other platforms (with consent)
- Case study in browser game performance

---

## 📝 Document Control

**Status:** 🔒 FROZEN (V1.0)  
**Last Updated:** 2025-10-27  
**Next Review:** After V1.0 launch feedback

**Change Process:**
1. Proposal via GitHub issue
2. Community discussion
3. Design/technical review
4. Approval by maintainer
5. Documentation update
6. Version increment

---

## 📞 Project Information

- **Repository:** github.com/jbcom/otter-river-rush
- **License:** MIT (open source)
- **Website:** jbcom.github.io/otter-river-rush
- **Issues:** github.com/jbcom/otter-river-rush/issues
- **Discussions:** github.com/jbcom/otter-river-rush/discussions

---

**Bottom Line:** We're building a joyful, ethical game that respects players and demonstrates technical excellence. Every decision must serve that mission. If it doesn't, it doesn't belong in this project.
