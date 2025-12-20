# Integration Strategy for Epic #26

This document outlines the integration strategy for unifying Rivers of Reckoning and Otter River Rush into the Rivermarsh codebase.

## 🎯 Integration Goals (from Epic #26)

1. **Unified Strata Foundation**: All rendering uses `@jbcom/strata` ✅ Complete
2. **Combat System**: Port RPG combat from Rivers of Reckoning
3. **Racing Mini-Game**: Port river racing from Otter River Rush
4. **Mobile-First**: Touch controls, responsive UI
5. **Procedural Everything**: Terrain, weather, enemies, items

## 📋 Open PR Status Matrix

### ✅ Ready to Merge (Approved, No AI Blockers)

| PR | Title | User Approval | AI Status | Build | Merge Order |
|----|-------|---------------|-----------|-------|-------------|
| - | *None currently ready* | - | - | - | - |

### ⏸️ Awaiting Resolution

| PR | Title | User Approval | AI Status | Build | Blocker |
|----|-------|---------------|-----------|-------|---------|
| #9 | Update docs and Render config | ✅ jbdevprimary | ✅ Claude approved | ❌ FAILURE | Merge conflict, needs rebase |
| #23 | GPU Instancing optimization | ✅ jbdevprimary | ❌ Claude: CHANGES_REQUESTED | ❌ FAILURE | AI feedback unaddressed, merge conflict |
| #4 | Rivermarsh Beta - Pre-kiro systems | - | ⚠️ Reviews failed/cancelled | ❌ FAILURE | Build failure, needs AI review |

### 🤖 Awaiting AI Review

| PR | Title | Notes |
|----|-------|-------|
| #4 | Rivermarsh Beta | OpenRouter failed, Claude/Codex cancelled - retry after build fix |

### 📦 Dependabot (Low Priority)

| PR | Title | Status |
|----|-------|--------|
| #34 | Bump three and @types/three | Build failing |
| #35 | Bump js-yaml | Build failing |
| #19 | Bump @capacitor/cli 8.0.0 | Build failing |
| #20 | Bump vite 7.0.2 | Build failing |
| #21 | Bump @vitejs/plugin-react 5.1.2 | Build failing |
| #22 | Bump @capacitor/core 8.0.0 | Build failing |

## 🔄 Merge Priority Order

### 🚨 Phase 0: Fix Main Branch Build (BLOCKER)

**BEFORE ANY OTHER PR CAN BE MERGED:**

The main branch has critical build failures that must be fixed first.

---

## 📋 PR #4 Assessment (feat/rivermarsh-beta)

### What PR #4 Adds (Good)
- ✅ `src/components/mobile/VirtualJoysticks.tsx` - nipplejs touch controls
- ✅ `src/components/mobile/MobileActionButtons.tsx` - Touch action buttons
- ✅ `src/components/mobile/GyroscopeCamera.tsx` - Device orientation camera
- ✅ `src/components/game/GameUI.tsx` - Full game UI overlay
- ✅ `src/components/game/OtterNPC.tsx` - NPC system with AI behaviors
- ✅ `src/stores/useRivermarsh.ts` - Complete game state store
- ✅ `src/stores/useControlsStore.ts` - Input state management
- ✅ Updated `src/App.tsx` with mobile detection and new components

### Issues in PR #4 (Must Fix)
1. **❌ dist/ files committed** - Build artifacts in repo (78+ files)
2. **❌ Missing type annotations** - `useRivermarsh.ts` has 60+ implicit `any` types
3. **❌ Does NOT fix main branch issues** - Still missing core files

### Issues Inherited from Main Branch (Must Fix First)

#### Missing Files (Referenced but don't exist)
| File | Referenced By |
|------|---------------|
| `src/components/VolumetricEffects.tsx` | `App.tsx` |
| `src/shaders/fur.ts` | `Player.tsx` |
| `src/utils/audioManager.ts` | `Player.tsx`, `AudioSystem.tsx` |
| `src/utils/biomeAmbience.ts` | `AudioSystem.tsx` |
| `src/utils/environmentalAudio.ts` | `AudioSystem.tsx` |
| `src/utils/adaptiveQuality.ts` | `GameSystems.tsx` |
| `src/utils/memoryMonitor.ts` | `GameSystems.tsx` |

#### Strata API Mismatches
| File | Issue | Fix |
|------|-------|-----|
| `SDFTerrain.tsx:18` | `@jbcom/strata/core` | Use `@jbcom/strata` |
| `World.tsx:12` | `VolumetricFog` | Use `VolumetricFogMesh` |
| `World.tsx:88,92` | `windStrength` prop | Use `wind` as `Vector3` |
| `World.tsx:177` | `waterColor`, `deepWaterColor` | Use `color`, `deepColor` |
| `World.tsx:285` | `sunElevation`, `sunAzimuth` | Use `timeOfDay` object |
| `Water.tsx:20` | `waterColor` | Use `color` |
| `GPUInstancing.tsx:58` | `windStrength` | Remove or use Strata API |

#### BiomeData Type Issues
| File | Issue |
|------|-------|
| `SDFTerrain.tsx:26-32` | BiomeData `center` uses `{x, y}` but Strata expects `Vector2` |
| `GPUInstancing.tsx:24-30` | Same issue |

#### ECS Component Issues
| File | Issue |
|------|-------|
| `World.tsx:74-75` | `weather.type` doesn't exist on `WeatherComponent` |

---

### Required Fix Order

1. **Create missing util files** with proper Strata API integration:
   - Use `useAudioManager` from Strata for audio
   - Use `AmbientAudio`, `WeatherAudio` components
   - Implement quality/memory managers

2. **Create missing component files**:
   - `VolumetricEffects.tsx` - wrapper using Strata's VolumetricEffects
   - `src/shaders/fur.ts` - actual fur shader implementation

3. **Fix Strata API usage** in existing files

4. **Fix BiomeData types** to use proper Vector2

5. **Then PR #4 can be rebased** and have its issues fixed:
   - Remove dist/ from tracking
   - Add proper types to useRivermarsh.ts

---

### Phase 1: Documentation & Infrastructure (Foundation)

2. **#9 - Update docs and Render config**
   - **Status**: Approved by user + AI, has merge conflict
   - **Action**: Rebase against main (after fix), verify build passes
   - **Priority**: HIGH - Unblocks deployment configuration

### Phase 2: Performance Optimizations

3. **#23 - GPU Instancing optimization**
   - **Status**: User approved, but Claude requested changes
   - **AI Feedback Outstanding**:
     - ❌ Material mutation bug (Line 196)
     - ❌ Inefficient effect dependencies (Line 245)
     - ❌ Missing shader validation (Line 210)
     - ❌ Unused materialRef (Lines 156, 243)
   - **Action**: Address all Claude feedback, rebase, then re-request review
   - **Priority**: MEDIUM - Performance improvement but not blocking features

### Phase 3: Feature Ports

4. **#4 - Rivermarsh Beta (Pre-kiro game systems)**
   - **Status**: Build failing, needs cleanup
   - **Content**: Mobile input, game state, NPC system
   - **Fixes Required**:
     - Remove dist/ from git tracking
     - Add type annotations to useRivermarsh.ts
     - Fix after main branch build is working
   - **Priority**: HIGH - Implements mobile controls (Epic #26 Phase 4)
   - **Aligns with Issues**: #1, #32, #33

### Phase 4: Dependency Updates

5. **Dependabot PRs** - Batch after feature PRs
   - Consider batch merging after main features stabilize
   - Three.js update (#34) may require testing with Strata

## 📝 Integration Rules

### Before Merging Any PR:

1. **Build must pass** - No merging with failed CI
2. **All AI feedback addressed** - CHANGES_REQUESTED must be resolved
3. **User approval** - At least one maintainer approval
4. **No merge conflicts** - Must rebase clean against target

### For Draft PRs:

1. Move to Ready for Review when:
   - Build passes
   - Initial implementation complete
   - Test plan documented
2. Wait for AI reviewer feedback before merging
3. Address all comments before approval

## 🎯 Issue to PR Mapping

| Issue | Title | Priority | Related PRs |
|-------|-------|----------|-------------|
| #26 | EPIC: Unify games | Epic | All |
| #28 | Port combat system | HIGH | *No PR yet* |
| #29 | Port leveling system | MEDIUM | *No PR yet* |
| #30 | Port river racing | HIGH | *No PR yet* |
| #31 | Day/night cycle | MEDIUM | *No PR yet* |
| #32 | Port mobile touch controls | HIGH | #4 (partial) |
| #33 | Consolidate UI/HUD | MEDIUM | #4 (partial) |
| #1 | Audit pre-kiro code | - | #4 |
| #5 | GitHub Pages deployment | MEDIUM | #9 (related) |
| #6 | PWA support | MEDIUM | *No PR yet* |
| #8 | Playable demo | MEDIUM | *No PR yet* |

## 🚨 CRITICAL: Main Branch Build Failures

**The main branch itself is broken** - all PRs will fail CI until this is resolved.

### Root Cause Analysis

Build errors in main branch (as of 2025-12-20):

#### 1. Missing Files (References exist but files don't)

| Missing Module | Referenced In |
|----------------|---------------|
| `@/components/VolumetricEffects` | `src/App.tsx` |
| `@/shaders/fur` | `src/components/Player.tsx` |
| `@/utils/audioManager` | `src/components/Player.tsx`, `src/systems/AudioSystem.tsx` |
| `@/utils/biomeAmbience` | `src/systems/AudioSystem.tsx` |
| `@/utils/environmentalAudio` | `src/systems/AudioSystem.tsx` |
| `@/utils/adaptiveQuality` | `src/systems/GameSystems.tsx` |
| `@/utils/memoryMonitor` | `src/systems/GameSystems.tsx` |

#### 2. Strata API Mismatches

The code references `@jbcom/strata` exports that don't exist:

| Error | File | Issue |
|-------|------|-------|
| `@jbcom/strata/core` | `SDFTerrain.tsx:18` | Subpath not exported - use main export |
| `VolumetricFog` | `World.tsx:12` | Should be `VolumetricFogMesh` |
| `waterColor` prop | `Water.tsx`, `World.tsx` | Doesn't exist on `AdvancedWaterProps` |
| `sunElevation` prop | `World.tsx:285` | Doesn't exist on `ProceduralSkyProps` |
| `windStrength` prop | `World.tsx:88,92` | Doesn't exist on `RainProps`/`SnowProps` |

#### 3. Three.js Type Issues

Vector2 type assignments incorrect - using plain objects `{x, y}` instead of `Vector2` instances.

### Resolution Priority

**BLOCKER** - This must be fixed BEFORE any feature PRs can be merged.

**Options:**
1. **Option A**: Create a fix PR to stub/implement missing modules and fix API calls
2. **Option B**: Revert to last working commit and re-apply changes properly
3. **Option C**: Fix within this integration branch

### Immediate Actions Required

1. Stub or implement missing utility modules
2. Update Strata component usage to match actual API
3. Fix Three.js Vector2 type issues
4. Ensure build passes before merging any feature PRs

---

### AI Review Configuration Issues

PR #4 shows AI review failures:
- OpenRouter Review: FAILURE
- Claude Review: CANCELLED
- Codex Review: CANCELLED

May indicate workflow configuration issues that need resolution.

## 📅 Integration Timeline

| Phase | PRs | Target |
|-------|-----|--------|
| Foundation | #9 | Immediate |
| Performance | #23 (after feedback) | After #9 |
| Features | #4 (after build fix + AI review) | After #23 |
| Dependencies | #34, #35, #19-22 | Batch after features |

## 🔒 Rejected/Deferred

| PR | Reason |
|----|--------|
| #7 | CLOSED - Sync from org-github |
| #36 | CLOSED - AI review workflow fix |

---

## 🎯 Recommended Action Plan

### Immediate (Block Everything Else)

1. **Create PR to fix main branch build** with:
   - Missing util files using Strata APIs
   - Missing VolumetricEffects wrapper
   - Missing fur shader
   - Fixed Strata API usage throughout
   - Fixed BiomeData types
   - Fixed ECS WeatherComponent usage

### After Main Build Fixed

2. **Update PR #4**:
   - Remove dist/ from tracking (already in .gitignore)
   - Add proper TypeScript types to useRivermarsh.ts
   - Rebase against fixed main
   - Request fresh AI review

3. **Update PR #23** (GPU Instancing):
   - Address Claude's 4 critical issues
   - Rebase against main
   - Re-request review

4. **Update PR #9** (Docs/Render):
   - Rebase against main to resolve conflicts
   - Should auto-approve (already approved by user + AI)

### Dependency PRs (Batch Later)

5. Wait for feature PRs to stabilize, then batch merge:
   - #34 (three.js)
   - #35 (js-yaml)
   - #19-22 (Capacitor, Vite updates)

---

*Last updated: 2025-12-20*  
*Integration branch: `integration/epic-26-unified-codebase`*
