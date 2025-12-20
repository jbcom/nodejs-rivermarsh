import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type Entity, queries, spawn, world } from '../ecs/world';

export class TestWorld {
  private entities: Entity[] = [];

  setup() {
    world.clear();
    this.entities = [];
  }

  cleanup() {
    world.clear();
    this.entities = [];
  }

  createPlayer(lane: -1 | 0 | 1 = 0): Entity {
    const entity = spawn.otter(lane);
    this.entities.push(entity);
    return entity;
  }

  createRock(x: number, y: number, variant: number = 0): Entity {
    const entity = spawn.rock(x, y, variant);
    this.entities.push(entity);
    return entity;
  }

  createCoin(x: number, y: number): Entity {
    const entity = spawn.coin(x, y);
    this.entities.push(entity);
    return entity;
  }

  createGem(x: number, y: number): Entity {
    const entity = spawn.gem(x, y);
    this.entities.push(entity);
    return entity;
  }

  expectEntityCount(count: number) {
    expect(world.entities.length).toBe(count);
  }

  expectPlayerExists() {
    expect(queries.player.entities.length).toBe(1);
  }

  expectObstacleCount(count: number) {
    expect(queries.obstacles.entities.length).toBe(count);
  }

  expectCollectibleCount(count: number) {
    expect(queries.collectibles.entities.length).toBe(count);
  }

  getPlayer(): Entity | null {
    return queries.player.entities[0] || null;
  }

  getAllObstacles(): Entity[] {
    return Array.from(queries.obstacles.entities);
  }

  getAllCollectibles(): Entity[] {
    return Array.from(queries.collectibles.entities);
  }

  simulateFrame(deltaTime: number = 0.016) {
    // Simulate one frame of game logic
    for (const entity of queries.moving) {
      if (entity.velocity) {
        entity.position.x += entity.velocity.x * deltaTime;
        entity.position.y += entity.velocity.y * deltaTime;
        entity.position.z += entity.velocity.z * deltaTime;
      }
    }
  }

  simulateFrames(count: number, deltaTime: number = 0.016) {
    for (let i = 0; i < count; i++) {
      this.simulateFrame(deltaTime);
    }
  }
}

export function createTestWorld(): TestWorld {
  return new TestWorld();
}

export function mockGameStore() {
  return {
    status: 'playing' as const,
    score: 0,
    distance: 0,
    coins: 0,
    gems: 0,
    combo: 0,
    lives: 3,
    powerUps: {
      shield: false,
      speedBoost: 0,
      multiplier: 1,
      magnet: 0,
      ghost: 0,
      slowMotion: 0,
    },
  };
}

export function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

export async function waitFrames(count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    await waitForNextFrame();
  }
}

export function expectPosition(
  entity: Entity,
  x: number,
  y: number,
  tolerance: number = 0.1
) {
  expect(Math.abs(entity.position.x - x)).toBeLessThan(tolerance);
  expect(Math.abs(entity.position.y - y)).toBeLessThan(tolerance);
}

export function expectVelocity(
  entity: Entity,
  x: number,
  y: number,
  tolerance: number = 0.1
) {
  if (!entity.velocity) {
    throw new Error('Entity has no velocity component');
  }
  expect(Math.abs(entity.velocity.x - x)).toBeLessThan(tolerance);
  expect(Math.abs(entity.velocity.y - y)).toBeLessThan(tolerance);
}

export function expectHealth(entity: Entity, health: number) {
  expect(entity.health).toBe(health);
}

export function expectDestroyed(entity: Entity) {
  expect(entity.destroyed).toBe(true);
}

export function expectCollected(entity: Entity) {
  expect(entity.collected).toBe(true);
}
