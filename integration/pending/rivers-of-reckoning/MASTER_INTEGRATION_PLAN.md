# Master Integration Plan: Unified Rivermarsh Gaming Experience

> **Three repositories → One best-in-class game**

## 🎯 Vision

Consolidate three jbcom game repositories into a single, unified **Rivermarsh** experience:

| Repository | Role | Status |
|------------|------|--------|
| **nodejs-rivermarsh** | Core game (otter exploration) | Foundation |
| **nodejs-rivers-of-reckoning** | RPG mechanics + Strata integration | Integration Branch |
| **nodejs-otter-river-rush** | River racing mini-game | Integration Branch |

**End Result**: A modular game with exploration, combat, progression, AND a racing mini-game.

---

## 📊 Current State Assessment

### nodejs-rivermarsh (Foundation)
- ✅ ECS (Miniplex) architecture
- ✅ Physics (Rapier)
- ✅ AI (Yuka) 
- ✅ 7 biomes, 28 species
- ✅ SDF terrain with caves
- ✅ Touch controls (nipplejs)
- ⏳ Issue #2: Strata integration (OPEN)
- ⏳ PR #4: Pre-kiro migration (OPEN)

### nodejs-rivers-of-reckoning (This repo)
- ✅ Strata integration validated
- ✅ Combat system implemented
- ✅ XP/leveling system
- ✅ Game identity document
- ✅ Centralized constants
- ⏳ PR #25: Full migration (THIS PR)

### nodejs-otter-river-rush
- ✅ Complete endless runner
- ✅ 11 otter animations
- ✅ 4 biomes with PBR textures
- ✅ Mobile-first (Capacitor)
- ✅ 96/97 E2E tests passing
- ⏳ PR #20: Production readiness (OPEN)
  - ⚠️ AI feedback needs resolution
  - ⚠️ Strata dependency misplacement
  - ⚠️ Grace period magic numbers

---

## 🔄 Phase 1: Resolve All Open PRs

### 1.1 nodejs-rivers-of-reckoning PR #25
**Status**: Ready for final review

**Completed**:
- ✅ TypeScript promoted to root
- ✅ Strata integration working
- ✅ Combat/XP systems implemented
- ✅ Constants centralized
- ✅ Event system (no window globals)
- ✅ 17 E2E tests
- ✅ GAME_IDENTITY.md created
- ✅ All lint/typecheck/build passing

**Action**: Merge when approved

---

### 1.2 nodejs-otter-river-rush PR #20
**Status**: Needs AI feedback resolution

**Claude's feedback to address**:

1. **Dependency misplacement** (Critical)
   ```diff
   # Move @jbcom/strata from root to client package
   - // package.json (root)
   + // src/client/package.json
   "dependencies": {
     "@jbcom/strata": "^1.4.7"
   }
   ```

2. **Grace period magic number** (Medium)
   ```typescript
   // src/client/src/config/physics.ts
   export const PHYSICS = {
     gracePeriodMs: 1500,  // Extract magic number
     // ...
   }
   ```

3. **startTimeRef initialization** (Low)
   ```typescript
   // Use null instead of 0 for semantic clarity
   const startTimeRef = useRef<number | null>(null)
   ```

4. **Commented code cleanup** (Low)
   - Remove `InjectionTarget` interface comment

**Action**: Address feedback, push fix commit

---

### 1.3 nodejs-rivermarsh PR #4 (Pre-kiro migration)
**Status**: Blocked by Issues #1 and #2

**Dependencies**:
- Blocked by Issue #2 (Strata integration) 
- Blocked by Issue #1 (agentic-crew)

**Action**: Can unblock #2 with our Strata knowledge!

---

## 🔄 Phase 2: Freeze Integration Branches

After all PRs merged to main:

### 2.1 Freeze repositories
```bash
# Create freeze tags
gh release create v1.0.0-freeze --repo jbcom/nodejs-rivers-of-reckoning \
  --title "Frozen for Rivermarsh integration" \
  --notes "This codebase is now frozen. All future development in nodejs-rivermarsh."

gh release create v1.0.0-freeze --repo jbcom/nodejs-otter-river-rush \
  --title "Frozen for Rivermarsh integration" \
  --notes "This codebase is now frozen. All future development in nodejs-rivermarsh."
```

### 2.2 Make repositories private
```bash
gh repo edit jbcom/nodejs-rivers-of-reckoning --visibility private
gh repo edit jbcom/nodejs-otter-river-rush --visibility private
```

### 2.3 Remove from jbcom.github.io
- Update documentation site to remove these repos
- Redirect to unified Rivermarsh

---

## 🔄 Phase 3: Add as Subtrees to Rivermarsh

### 3.1 Create integration directory
```bash
cd nodejs-rivermarsh
mkdir -p integration/pending
```

### 3.2 Add subtrees
```bash
# Add rivers-of-reckoning as subtree
git subtree add --prefix=integration/pending/rivers-of-reckoning \
  https://github.com/jbcom/nodejs-rivers-of-reckoning.git main --squash

# Add otter-river-rush as subtree
git subtree add --prefix=integration/pending/otter-river-rush \
  https://github.com/jbcom/nodejs-otter-river-rush.git main --squash
```

### 3.3 Directory structure
```
nodejs-rivermarsh/
├── src/                          # Core Rivermarsh game
├── integration/
│   ├── pending/
│   │   ├── rivers-of-reckoning/  # RPG mechanics to integrate
│   │   │   ├── src/
│   │   │   │   ├── components/   # Combat, Player, Enemy
│   │   │   │   ├── constants/    # Game balance
│   │   │   │   ├── events/       # Combat events
│   │   │   │   └── store/        # Game state
│   │   │   ├── GAME_IDENTITY.md
│   │   │   └── STRATA_INTEGRATION_PLAN.md
│   │   └── otter-river-rush/     # Racing mini-game to integrate
│   │       ├── src/client/
│   │       │   ├── ecs/          # Systems to merge
│   │       │   └── components/   # UI, game canvas
│   │       └── docs/
│   └── completed/                # After integration
└── AGENTS.md                     # Updated with integration guide
```

---

## 🔄 Phase 4: Create Issues & Epic in Rivermarsh

### 4.1 Epic Issue
```markdown
# 🎮 EPIC: Unified Gaming Experience

## Vision
Integrate rivers-of-reckoning (RPG) and otter-river-rush (racing) 
into Rivermarsh to create a complete gaming experience.

## Sub-Issues
- [ ] #X: Integrate Strata (from rivers-of-reckoning)
- [ ] #Y: Port combat system (from rivers-of-reckoning)
- [ ] #Z: Port XP/leveling (from rivers-of-reckoning)
- [ ] #A: Port racing mini-game (from otter-river-rush)
- [ ] #B: Unify biome systems
- [ ] #C: Merge ECS systems
- [ ] #D: Combine UI components
- [ ] #E: Add game mode selection

## Integration Order
1. Strata (visual foundation)
2. Combat/XP (gameplay depth)
3. Racing mode (variety)
4. Polish and testing
```

### 4.2 Individual Issues
Create detailed issues for each integration task with acceptance criteria.

---

## 🔄 Phase 5: Update AGENTS.md

```markdown
# AGENTS.md - Rivermarsh

## Integration Context

This repository contains pending integrations from:

### /integration/pending/rivers-of-reckoning
**Source**: Former RPG game with Strata integration
**What to integrate**:
- `src/constants/game.ts` → Centralized game balance
- `src/events/combatEvents.ts` → Clean event system pattern
- `src/components/Combat.tsx` → Attack mechanics
- `src/components/Enemy.tsx` → AI enemy system
- `GAME_IDENTITY.md` → Design documentation

### /integration/pending/otter-river-rush  
**Source**: Endless runner mini-game
**What to integrate**:
- `src/client/src/ecs/systems.tsx` → Runner game systems
- `src/client/src/components/game/` → Racing UI
- Racing mode as selectable game type

## Strata API Reference
See `/integration/pending/rivers-of-reckoning/STRATA_INTEGRATION_PLAN.md`
for validated API usage and migration guide.

## Integration Priority
1. Strata visual layer (Issue #2)
2. Combat system (new issue)
3. Racing mini-game (new issue)
```

---

## 🔄 Phase 6: Jules Task Setup

With everything in place, create a Jules task:

```
TASK: Complete Rivermarsh Integration

CONTEXT:
- integration/pending/ contains two subtrees ready for integration
- Issue #2 (Strata) has a complete migration plan
- Epic issue #X tracks all integration work

GOALS:
1. Complete Strata integration per STRATA_INTEGRATION_PLAN.md
2. Port combat system from rivers-of-reckoning
3. Add XP/leveling progression
4. Integrate racing mini-game as game mode
5. Ensure all tests pass
6. Update documentation

CONSTRAINTS:
- Follow existing Rivermarsh architecture (Miniplex ECS)
- Maintain mobile-first performance
- Keep all existing tests passing
```

---

## 📋 Immediate Action Items

### TODAY (This Session)
1. ✅ Finish resolving PR #25 feedback (this repo)
2. ⏳ Create PR on otter-river-rush to fix Claude's feedback
3. ⏳ Create Strata integration PR on rivermarsh using our knowledge

### NEXT
4. Get all PRs merged to their respective mains
5. Create freeze releases
6. Add subtrees to rivermarsh
7. Create epic and issues
8. Update AGENTS.md
9. Launch Jules task

---

## 🎯 Success Metrics

| Metric | Target |
|--------|--------|
| All PRs merged | ✅ |
| Repos frozen and private | ✅ |
| Subtrees added | ✅ |
| Epic + issues created | ✅ |
| AGENTS.md updated | ✅ |
| Jules task running | ✅ |
| Strata integration complete | Issue #2 closed |
| Combat system ported | New issue closed |
| Racing mode integrated | New issue closed |
| All tests passing | 100% |

---

*This plan consolidates three repos into one unified gaming experience.*
