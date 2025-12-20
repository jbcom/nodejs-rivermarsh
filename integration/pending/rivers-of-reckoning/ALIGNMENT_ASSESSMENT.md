# Alignment Assessment: Rivers of Reckoning ↔ Rivermarsh

> **Should we merge these codebases?**

## Executive Summary

**Recommendation: YES - Merge into Rivermarsh**

Both projects share identical architectural foundations but Rivermarsh is **significantly more mature**. Rather than splitting effort, merging Rivers of Reckoning's concepts INTO Rivermarsh would create a stronger unified game.

---

## Side-by-Side Comparison

| Aspect | Rivers of Reckoning | Rivermarsh |
|--------|---------------------|------------|
| **Theme** | Human explorer in procedural world | Otter in wetland ecosystem |
| **3D Stack** | React Three Fiber | React Three Fiber |
| **State** | Zustand | Zustand |
| **ECS** | None (manual components) | Miniplex (full ECS) |
| **Physics** | None | Rapier (WASM) |
| **AI** | Basic state machine | Yuka (steering, FSM, spatial) |
| **Audio** | Strata (planned) | Tone.js (procedural) |
| **Mobile** | Capacitor | Capacitor |
| **Terrain** | FBM noise (Strata) | SDF + Marching Cubes (caves!) |
| **Vegetation** | Strata instances | Custom GPU instancing |
| **Weather** | Basic rain/snow | Full system (ECS-driven) |
| **Tests** | Playwright E2E | Vitest + Playwright + fast-check |

---

## Where Rivermarsh is Stronger

### 1. **Architecture Maturity**
```
Rivermarsh:
├── src/ecs/           # Full Miniplex ECS
│   ├── components.ts  # Typed components
│   ├── systems/       # 10+ systems
│   │   ├── AISystem.ts
│   │   ├── TimeSystem.ts
│   │   ├── WeatherSystem.ts
│   │   ├── BiomeSystem.ts
│   │   └── SpawnSystem.ts
│   └── data/
│       ├── species.ts # 28+ species definitions
│       └── biomes.ts  # 7 biomes

Rivers of Reckoning:
├── src/
│   ├── store/         # Zustand only
│   ├── components/    # Manual React components
│   └── constants/     # Config values
```

### 2. **Physics**
- **Rivermarsh**: Full Rapier physics with RigidBody, colliders, buoyancy
- **Rivers**: None (basic position updates only)

### 3. **AI System**
- **Rivermarsh**: Yuka with steering behaviors, FSM, cell-space partitioning
- **Rivers**: Basic if/else state machine

### 4. **Terrain**
- **Rivermarsh**: SDF + Marching Cubes = caves, overhangs, complex geology
- **Rivers**: FBM heightmap only (flat terrain)

### 5. **Visual Polish**
- **Rivermarsh**: Custom fur shaders, volumetric fog, underwater caustics
- **Rivers**: Basic procedural sky and vegetation

### 6. **Testing**
- **Rivermarsh**: Unit tests, property tests (fast-check), E2E
- **Rivers**: E2E only

---

## Where Rivers of Reckoning is Stronger

### 1. **Strata Integration**
Rivers uses `@jbcom/strata` which provides:
- `fbm()` - Fractal Brownian Motion
- `GrassInstances`, `TreeInstances`, `RockInstances`
- `ProceduralSky`, `Rain`, `Snow`
- `CinematicEffects` post-processing

**Value**: Could simplify Rivermarsh's custom implementations

### 2. **Game Identity Document**
Rivers has `GAME_IDENTITY.md` defining:
- Core vision and design pillars
- Visual palette
- Progression system (XP, leveling, combat)
- Enemy types and rewards

**Value**: Rivermarsh lacks clear game design documentation

### 3. **Combat System**
Rivers has:
- Attack mechanics (Space/Click)
- Enemy health and damage
- XP/Gold rewards
- Level progression

**Value**: Rivermarsh focuses on survival, not combat

### 4. **Centralized Constants**
Rivers has `src/constants/game.ts` with all magic numbers

**Value**: Easier tuning and modification

---

## Merger Strategy

### Phase 1: Rebrand Rivermarsh → "Rivers of Reckoning"
- **Rename**: `nodejs-rivermarsh` → `nodejs-rivers-of-reckoning`
- **Player**: Otter OR human explorer (selectable character)
- **Theme**: Wetland adventure with roguelike elements

### Phase 2: Integrate Rivers' Systems
1. **Combat System** → New `CombatSystem.ts` in Rivermarsh's ECS
2. **XP/Leveling** → Extend `gameStore.ts` with progression
3. **Constants File** → Port `src/constants/game.ts`
4. **Game Identity** → Merge design docs

### Phase 3: Evaluate Strata
- **Option A**: Use Strata's vegetation/sky/weather instead of custom
- **Option B**: Keep custom implementations (more control)
- **Decision**: Test performance on mobile

### Phase 4: Archive Current Rivers Repo
- Move Python archive
- Redirect to unified repository
- Update all documentation

---

## Migration Mapping

| Rivers of Reckoning | → Rivermarsh Equivalent |
|---------------------|-------------------------|
| `gameStore.ts` | Extend existing `gameStore.ts` |
| `Player.tsx` | Enhance existing `Player.tsx` |
| `Enemy.tsx` | Use existing `NPCs.tsx` + `AISystem.ts` |
| `Combat.tsx` | New `CombatSystem.ts` |
| `constants/game.ts` | New `config/gameBalance.ts` |
| `types/game.ts` | Extend `ecs/components.ts` |
| `events/combatEvents.ts` | Use Miniplex queries |
| Strata vegetation | Evaluate vs GPUInstancing |
| Strata sky/weather | Evaluate vs custom shaders |

---

## Effort Estimate

| Task | Effort |
|------|--------|
| Rename/rebrand repository | 1 hour |
| Port combat system | 4 hours |
| Port XP/leveling | 2 hours |
| Port constants | 1 hour |
| Merge documentation | 2 hours |
| Test integration | 4 hours |
| **Total** | **~14 hours** |

---

## Risks

1. **Strata Dependency**: Rivermarsh doesn't use Strata; may need to choose one approach
2. **Theme Conflict**: Otter vs human explorer - need design decision
3. **Scope Creep**: Combat + ecosystem simulation is ambitious

## Benefits

1. **Single Codebase**: One repo to maintain
2. **Better Architecture**: ECS + physics + AI already built
3. **Mobile-First**: Rivermarsh has touch controls, optimization
4. **Richer World**: 7 biomes, 28 species, SDF terrain
5. **Test Coverage**: Unit + property + E2E tests

---

## Conclusion

**Merge Rivers of Reckoning INTO Rivermarsh.**

Rivermarsh has the superior foundation. Rivers brings combat, progression, and design clarity. Together they create a complete mobile-first 3D roguelike.

### Next Steps

1. Clone Rivermarsh to `/tmp`
2. Create feature branch: `feat/rivers-of-reckoning-merge`
3. Port combat, XP, and constants
4. Update branding and documentation
5. Archive current Rivers repository

---

*Assessment Date: December 20, 2025*
