# API Reference - Otter River Rush

## Table of Contents
- [ECS World API](#ecs-world-api)
- [Game Store API](#game-store-api)
- [Utility Functions](#utility-functions)
- [Hooks API](#hooks-api)
- [Component Props](#component-props)
- [Type Definitions](#type-definitions)

## ECS World API

### World Instance
```typescript
import { world } from './ecs/world';
```

#### Methods

##### `world.add(entity: Partial<Entity>): Entity`
Add a new entity to the world.

```typescript
const otter = world.add({
  player: true,
  position: { x: 0, y: 0, z: 0 },
  health: 3
});
```

##### `world.remove(entity: Entity): void`
Remove an entity from the world.

```typescript
world.remove(otter);
```

##### `world.with(...components: string[]): Query`
Create a query for entities with specific components.

```typescript
const movingEntities = world.with('position', 'velocity');
```

### Predefined Queries

```typescript
import { queries } from './ecs/world';
```

#### Available Queries

- `queries.player` - Player entities
- `queries.obstacles` - Obstacle entities
- `queries.collectibles` - All collectibles
- `queries.coins` - Coin entities
- `queries.gems` - Gem entities
- `queries.powerUps` - Power-up entities
- `queries.particles` - Particle entities
- `queries.moving` - Entities with velocity
- `queries.collidable` - Entities with colliders
- `queries.collected` - Collected entities
- `queries.destroyed` - Destroyed entities
- `queries.renderable` - Entities with Three.js objects

### Spawn Helpers

```typescript
import { spawn } from './ecs/world';
```

#### `spawn.otter(lane: -1 | 0 | 1): Entity`
Spawn the player otter.

```typescript
const player = spawn.otter(0); // Center lane
```

#### `spawn.rock(x: number, y: number, variant?: number): Entity`
Spawn a rock obstacle.

```typescript
const rock = spawn.rock(0, 10, 0); // Standard rock
const mossyRock = spawn.rock(2, 10, 1); // Mossy variant
```

#### `spawn.coin(x: number, y: number): Entity`
Spawn a coin collectible.

```typescript
const coin = spawn.coin(0, 10);
```

#### `spawn.gem(x: number, y: number, color?: 'red'): Entity`
Spawn a gem collectible.

```typescript
const gem = spawn.gem(-2, 15, 'red');
```

#### `spawn.particle(x: number, y: number, color: string): Entity`
Spawn a particle effect.

```typescript
const particle = spawn.particle(0, 0, '#ff0000');
```

## Game Store API

```typescript
import { useGameStore } from './hooks/useGameStore';
```

### State

```typescript
interface GameState {
  status: 'menu' | 'playing' | 'paused' | 'game_over';
  mode: 'classic' | 'time_trial' | 'zen' | 'daily_challenge';
  score: number;
  distance: number;
  coins: number;
  gems: number;
  combo: number;
  lives: number;
  powerUps: PowerUpState;
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  highScore: number;
}
```

### Actions

#### `startGame(mode: GameMode): void`
Start a new game with the specified mode.

```typescript
const { startGame } = useGameStore();
startGame('classic');
```

#### `pauseGame(): void`
Pause the current game.

```typescript
const { pauseGame } = useGameStore();
pauseGame();
```

#### `resumeGame(): void`
Resume a paused game.

```typescript
const { resumeGame } = useGameStore();
resumeGame();
```

#### `endGame(): void`
End the current game and transition to game over screen.

```typescript
const { endGame } = useGameStore();
endGame();
```

#### `returnToMenu(): void`
Return to the main menu and reset game state.

```typescript
const { returnToMenu } = useGameStore();
returnToMenu();
```

#### `updateScore(points: number): void`
Add points to the current score.

```typescript
const { updateScore } = useGameStore();
updateScore(100);
```

#### `updateDistance(meters: number): void`
Add distance to the current distance traveled.

```typescript
const { updateDistance } = useGameStore();
updateDistance(10);
```

#### `collectCoin(value: number): void`
Collect a coin and update score/coins.

```typescript
const { collectCoin } = useGameStore();
collectCoin(10);
```

#### `collectGem(value: number): void`
Collect a gem and update score/gems.

```typescript
const { collectGem } = useGameStore();
collectGem(50);
```

#### `incrementCombo(): void`
Increase the combo counter.

```typescript
const { incrementCombo } = useGameStore();
incrementCombo();
```

#### `resetCombo(): void`
Reset the combo counter to zero.

```typescript
const { resetCombo } = useGameStore();
resetCombo();
```

#### `loseLife(): void`
Decrease lives by one. Ends game if lives reach zero.

```typescript
const { loseLife } = useGameStore();
loseLife();
```

#### `activatePowerUp(type: PowerUpType, duration?: number): void`
Activate a power-up.

```typescript
const { activatePowerUp } = useGameStore();
activatePowerUp('shield', 5000); // 5 seconds
```

#### `deactivatePowerUp(type: PowerUpType): void`
Deactivate a power-up.

```typescript
const { deactivatePowerUp } = useGameStore();
deactivatePowerUp('shield');
```

#### `updateSettings(settings: Partial<SettingsState>): void`
Update game settings.

```typescript
const { updateSettings } = useGameStore();
updateSettings({
  soundEnabled: false,
  volume: 0.5
});
```

#### `reset(): void`
Reset all game state to initial values.

```typescript
const { reset } = useGameStore();
reset();
```

## Utility Functions

### Math Helpers

```typescript
import {
  lerp,
  clamp,
  distance,
  easeInOut,
  smoothstep
} from './utils/math-helpers';
```

#### `lerp(start: number, end: number, t: number): number`
Linear interpolation between two values.

```typescript
const value = lerp(0, 100, 0.5); // 50
```

#### `clamp(value: number, min: number, max: number): number`
Clamp a value between min and max.

```typescript
const clamped = clamp(150, 0, 100); // 100
```

#### `distance(p1: Vector, p2: Vector): number`
Calculate distance between two points.

```typescript
const dist = distance({ x: 0, y: 0 }, { x: 3, y: 4 }); // 5
```

#### `easeInOut(t: number): number`
Ease in-out interpolation (0 to 1).

```typescript
const eased = easeInOut(0.5); // Smooth curve
```

#### `smoothstep(edge0: number, edge1: number, x: number): number`
Smooth Hermite interpolation.

```typescript
const smooth = smoothstep(0, 1, 0.5);
```

### Collision Helpers

```typescript
import {
  checkAABBCollision,
  checkSphereCollision,
  SpatialGrid,
  QuadTree
} from './utils/collision-helpers';
```

#### `checkAABBCollision(a: AABB, b: AABB): boolean`
Check axis-aligned bounding box collision.

```typescript
const collision = checkAABBCollision(
  { min: { x: 0, y: 0 }, max: { x: 1, y: 1 } },
  { min: { x: 0.5, y: 0.5 }, max: { x: 1.5, y: 1.5 } }
); // true
```

#### `checkSphereCollision(a: Sphere, b: Sphere): boolean`
Check sphere collision.

```typescript
const collision = checkSphereCollision(
  { position: { x: 0, y: 0 }, radius: 1 },
  { position: { x: 1.5, y: 0 }, radius: 1 }
); // true
```

#### `SpatialGrid<T>`
Spatial partitioning grid for efficient collision detection.

```typescript
const grid = new SpatialGrid<Entity>(10); // Cell size = 10
grid.insert({ x: 5, y: 5 }, entity);
const nearby = grid.query({ x: 5, y: 5 }, 10);
```

#### `QuadTree<T>`
QuadTree for spatial indexing.

```typescript
const tree = new QuadTree<Entity>({ x: 0, y: 0, width: 100, height: 100 });
tree.insert({ x: 50, y: 50 }, entity);
const found = tree.query({ x: 45, y: 45, width: 10, height: 10 });
```

### Entity Helpers

```typescript
import {
  findNearestEntity,
  getEntitiesInRadius,
  teleportEntity,
  setVelocity
} from './utils/entity-helpers';
```

#### `findNearestEntity(position: Vector, entities: Entity[]): Entity | null`
Find the closest entity to a position.

```typescript
const nearest = findNearestEntity({ x: 0, y: 0 }, entities);
```

#### `getEntitiesInRadius(position: Vector, radius: number, entities: Entity[]): Entity[]`
Get all entities within a radius.

```typescript
const nearby = getEntitiesInRadius({ x: 0, y: 0 }, 5, entities);
```

#### `teleportEntity(entity: Entity, position: Vector): void`
Instantly move an entity to a position.

```typescript
teleportEntity(player, { x: 10, y: 5, z: 0 });
```

#### `setVelocity(entity: Entity, velocity: Vector): void`
Set an entity's velocity.

```typescript
setVelocity(player, { x: 0, y: 5, z: 0 });
```

### Animation Helpers

```typescript
import {
  setAnimation,
  playOneShot,
  queueAnimations,
  crossfadeAnimation
} from './utils/animation-helpers';
```

#### `setAnimation(entity: Entity, animation: string): void`
Set an entity's current animation.

```typescript
setAnimation(player, 'run');
```

#### `playOneShot(entity: Entity, animation: string, onComplete?: () => void): void`
Play an animation once and return to previous.

```typescript
playOneShot(player, 'jump', () => {
  console.log('Jump complete!');
});
```

#### `queueAnimations(entity: Entity, animations: string[]): void`
Queue multiple animations to play in sequence.

```typescript
queueAnimations(player, ['jump', 'land', 'idle']);
```

#### `crossfadeAnimation(entity: Entity, animation: string, duration: number): void`
Smoothly transition to a new animation.

```typescript
crossfadeAnimation(player, 'run', 0.3);
```

## Hooks API

### useGameStore

```typescript
const { score, distance, startGame } = useGameStore();
```

Returns the entire game store with state and actions.

### useEntityQuery

```typescript
const players = useEntityQuery(queries.player);
```

React hook for querying entities with automatic updates.

### useAnimationMixer

```typescript
const mixer = useAnimationMixer(modelRef);
```

Manage Three.js animation mixer for a model.

### useKeyboardShortcuts

```typescript
useKeyboardShortcuts([
  { key: 's', ctrl: true, handler: handleSave },
  { key: 'Escape', handler: handleEscape }
]);
```

Register keyboard shortcuts with modifiers.

### useLocalStorage

```typescript
const [value, setValue, removeValue] = useLocalStorage('key', defaultValue);
```

Persist state to localStorage with React state.

### useInterval

```typescript
useInterval(() => {
  console.log('Tick');
}, 1000);
```

Set up an interval with automatic cleanup.

### useDebounce

```typescript
const debouncedValue = useDebounce(value, 500);
```

Debounce a value with specified delay.

### useThrottle

```typescript
const throttledFn = useThrottle(expensiveFn, 100);
```

Throttle a function call.

### useWindowSize

```typescript
const { width, height } = useWindowSize();
```

Track window size with React state.

### useViewport

```typescript
const { isMobile, isTablet, isDesktop } = useViewport();
```

Get responsive viewport information.

## Component Props

### GameCanvas

```typescript
interface GameCanvasProps {
  showStats?: boolean; // Show performance stats
}
```

### EntityRenderer

No props - automatically renders all entities from ECS world.

### Visual Effects

#### VictoryFireworks
```typescript
interface VictoryFireworksProps {
  active: boolean;
  intensity?: number; // 1-3
}
```

#### ConfettiExplosion
```typescript
interface ConfettiExplosionProps {
  position: [number, number, number];
  count?: number;
  spread?: number;
  onComplete?: () => void;
}
```

#### StarBurst
```typescript
