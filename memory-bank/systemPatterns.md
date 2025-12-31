# System Patterns

## Architecture Overview
Rivermarsh uses a hybrid approach combining a reactive State Store (Zustand) and an Entity Component System (Miniplex).

### 1. State Store (Zustand)
- **Source of Truth for Persistent Data**: Stats (Health, Mana, XP), Inventory, Active Quests, Settings.
- **Location**: `src/stores/gameStore.ts`.
- **UI Reactivity**: Components use specific selectors to subscribe to only the data they need.

### 2. ECS (Miniplex)
- **Source of Truth for Frame-by-Frame Data**: World positions, AI state, Physics, Time/Weather.
- **Location**: `src/ecs/`.
- **Systems**: Run every frame in `src/systems/GameSystems.tsx`.

## Communication Patterns
- **Store to ECS**: `PlayerSyncSystem` reads player position from Store and updates ECS Transform.
- **ECS to Store**: Systems call Store actions (e.g. `damageNPC` calls `addGold` in Store).
- **Event Bus**: `combatEvents.ts` uses a pub/sub pattern for decoupled combat effects (particles, damage numbers).

## UI Patterns
- **HUD**: Performance-optimized HTML/CSS overlay for stats.
- **Mobile Controls**: `VirtualJoysticks` (nipplejs) and `MobileActionButtons`.
- **LOD**: Drei's `Detailed` component and manual distance-based scaling in `World.tsx`.

## Data Patterns
- **Persistence**: Zustand `persist` middleware saves the state to `localStorage`.
- **Biomes**: Centralized biome definitions in `src/ecs/data/biomes.ts` and `src/components/SDFTerrain.tsx`.
