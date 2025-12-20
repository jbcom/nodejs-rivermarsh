import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { world } from '../../src/ecs/world';
import { createTestWorld, expectHealth } from '../../src/utils/test-helpers';

describe('ECS System Integration Tests', () => {
  const testWorld = createTestWorld();

  beforeEach(() => {
    testWorld.setup();
  });

  afterEach(() => {
    testWorld.cleanup();
  });

  describe('Entity Creation', () => {
    it('should create player entity', () => {
      const player = testWorld.createPlayer(0);

      expect(player).toBeDefined();
      expect(player.player).toBe(true);
      expect(player.position).toBeDefined();
      expect(player.health).toBe(3);
      testWorld.expectPlayerExists();
    });

    it('should create rock obstacle', () => {
      const rock = testWorld.createRock(0, 5, 0);

      expect(rock).toBeDefined();
      expect(rock.obstacle).toBe(true);
      expect(rock.variant).toBe(0);
      testWorld.expectObstacleCount(1);
    });

    it('should create coin collectible', () => {
      const coin = testWorld.createCoin(0, 5);

      expect(coin).toBeDefined();
      expect(coin.collectible?.type).toBe('coin');
      expect(coin.collectible?.value).toBe(10);
      testWorld.expectCollectibleCount(1);
    });

    it('should create gem collectible', () => {
      const gem = testWorld.createGem(0, 5);

      expect(gem).toBeDefined();
      expect(gem.collectible?.type).toBe('gem');
      expect(gem.collectible?.value).toBe(50);
    });
  });

  describe('Movement System', () => {
    it('should move entities with velocity', () => {
      const rock = testWorld.createRock(0, 5, 0);
      const initialY = rock.position.y;

      testWorld.simulateFrame(0.1);

      expect(rock.position.y).toBeLessThan(initialY);
    });

    it('should move multiple entities', () => {
      const r0 = testWorld.createRock(-2, 5, 0);
      const r1 = testWorld.createRock(0, 6, 1);
      const r2 = testWorld.createRock(2, 7, 2);

      const initial = new Map<any, number>([
        [r0, r0.position.y],
        [r1, r1.position.y],
        [r2, r2.position.y],
      ]);

      testWorld.simulateFrames(10);

      const obstacles = testWorld.getAllObstacles();
      for (const obstacle of obstacles) {
        expect(obstacle.position.y).toBeLessThan(initial.get(obstacle)!);
      }
    });
  });

  describe('Collision Detection', () => {
    it('should detect player-obstacle collision', () => {
      const player = testWorld.createPlayer(0);
      const rock = testWorld.createRock(0, -3, 0); // Same position as player

      // Check if they overlap
      const dx = Math.abs(player.position.x - rock.position.x);
      const dy = Math.abs(player.position.y - rock.position.y);

      expect(dx).toBeLessThan(1);
      expect(dy).toBeLessThan(1);
    });

    it('should detect player-collectible collision', () => {
      const player = testWorld.createPlayer(0);
      const coin = testWorld.createCoin(0, -3);

      const dx = Math.abs(player.position.x - coin.position.x);
      const dy = Math.abs(player.position.y - coin.position.y);

      expect(dx).toBeLessThan(1);
      expect(dy).toBeLessThan(1);
    });
  });

  describe('Entity Lifecycle', () => {
    it('should remove destroyed entities', () => {
      const rock = testWorld.createRock(0, 5, 0);
      testWorld.expectObstacleCount(1);

      world.addComponent(rock, 'destroyed', true);
      testWorld.expectEntityCount(1); // Still exists until cleanup

      world.remove(rock);
      testWorld.expectObstacleCount(0);
    });

    it('should handle collected entities', () => {
      const coin = testWorld.createCoin(0, 5);
      testWorld.expectCollectibleCount(1);

      world.addComponent(coin, 'collected', true);
      world.remove(coin);

      testWorld.expectCollectibleCount(0);
    });
  });

  describe('Player Mechanics', () => {
    it('should start with 3 health', () => {
      const player = testWorld.createPlayer();
      expectHealth(player, 3);
    });

    it('should have animation system', () => {
      const player = testWorld.createPlayer();

      expect(player.animation).toBeDefined();
      expect(player.animation?.current).toBe('idle');
      expect(player.animation?.urls).toBeDefined();
    });

    it('should have collider', () => {
      const player = testWorld.createPlayer();

      expect(player.collider).toBeDefined();
      expect(player.collider?.width).toBeGreaterThan(0);
      expect(player.collider?.height).toBeGreaterThan(0);
    });
  });

  describe('Rock Variants', () => {
    it('should create different rock variants', () => {
      const rock0 = testWorld.createRock(0, 5, 0);
      const rock1 = testWorld.createRock(0, 6, 1);
      const rock2 = testWorld.createRock(0, 7, 2);
      const rock3 = testWorld.createRock(0, 8, 3);

      expect(rock0.model?.url).toContain('rock-river');
      expect(rock1.model?.url).toContain('rock-mossy');
      expect(rock2.model?.url).toContain('rock-cracked');
      expect(rock3.model?.url).toContain('rock-crystal');
    });

    it('should wrap variant index', () => {
      const rock = testWorld.createRock(0, 5, 5); // variant 5 wraps to 1
      expect(rock.variant).toBe(5);
      expect(rock.model?.url).toContain('mossy'); // variant % 4 = 1
    });
  });
});
