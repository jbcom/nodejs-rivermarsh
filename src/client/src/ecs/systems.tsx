/**
 * Game Systems using Miniplex ECS
 * Movement, collision, spawning, cleanup
 */

import { useFrame } from '@react-three/fiber';
import { With } from 'miniplex';
import { useRef } from 'react';
import { getLaneX, PHYSICS, VISUAL } from '../config/visual-constants';
import { useGameStore } from '../hooks/useGameStore';
import { audio } from '../utils/audio';
import { type Entity, queries, spawn, world } from './world';

// Define queries at module level
const movingEntities = queries.moving;
const destroyedEntities = queries.destroyed;
const collectedEntities = queries.collected;
const playerEntities = queries.player;
const obstacleEntities = queries.obstacles;
const collectibleEntities = queries.collectibles;
const particleEntities = queries.particles;

/**
 * Movement System - Move all entities with velocity
 */
export function MovementSystem() {
  const accumulatorMs = useRef(0);
  const fixedStepMs = 1000 / 60;

  useFrame((_, dt) => {
    accumulatorMs.current += dt * 1000;
    while (accumulatorMs.current >= fixedStepMs) {
      const step = fixedStepMs / 1000;
      for (const entity of movingEntities) {
        entity.position.x += entity.velocity!.x * step;
        entity.position.y += entity.velocity!.y * step;
        entity.position.z += entity.velocity!.z * step;
      }
      accumulatorMs.current -= fixedStepMs;
    }
  });
  return null;
}

/**
 * Cleanup System - Remove entities that are off-screen or destroyed
 */
export function CleanupSystem() {
  useFrame(() => {
    // Remove destroyed entities
    for (const entity of destroyedEntities) {
      world.remove(entity);
    }

    // Remove entities that scrolled off bottom
    for (const entity of movingEntities) {
      if (entity.position.y < VISUAL.positions.despawnY) {
        world.remove(entity);
      }
    }

    // Remove collected entities
    for (const entity of collectedEntities) {
      world.remove(entity);
    }
  });
  return null;
}

/**
 * Collision System - Check for collisions and handle them
 */
export function CollisionSystem() {
  const status = useGameStore((state) => state.status);

  useFrame(() => {
    if (status !== 'playing') return;

    const [player] = playerEntities.entities;
    if (!player || !player.collider) return;

    // Check obstacle collisions
    for (const obstacle of obstacleEntities) {
      if (player.collider && obstacle.collider) {
        const playerWithCollider = player as With<
          Entity,
          'position' | 'collider'
        >;
        const obstacleWithCollider = obstacle as With<
          Entity,
          'position' | 'collider'
        >;
        if (checkCollision(playerWithCollider, obstacleWithCollider)) {
          handleObstacleHit(player, obstacle);
        }
      }
    }

    // Check enemy collisions
    const enemies = queries.enemies || [];
    for (const enemy of enemies) {
      if (player.collider && enemy.collider) {
        const playerWithCollider = player as With<
          Entity,
          'position' | 'collider'
        >;
        const enemyWithCollider = enemy as With<
          Entity,
          'position' | 'collider'
        >;
        if (checkCollision(playerWithCollider, enemyWithCollider)) {
          handleEnemyHit(player, enemy);
        }
      }
    }

    // Check collectible collisions
    for (const collectible of collectibleEntities) {
      if (player.collider && collectible.collider) {
        const playerWithCollider = player as With<
          Entity,
          'position' | 'collider'
        >;
        const collectibleWithCollider = collectible as With<
          Entity,
          'position' | 'collider'
        >;
        if (checkCollision(playerWithCollider, collectibleWithCollider)) {
          handleCollect(player, collectible);
        }
      }
    }
  });
  return null;
}

/**
 * Spawner System - Spawn obstacles and collectibles
 */
export function SpawnerSystem() {
  const status = useGameStore((state) => state.status);
  const lastObstacleSpawn = useRef(0);
  const lastCollectibleSpawn = useRef(0);
  const accumulatorMs = useRef(0);
  const fixedStepMs = 1000 / 60;

  // Add safety delay after start before spawning obstacles
  // This prevents immediate death if game starts during lag spike or load
  // Uses null for semantic clarity (null = not started, number = started at timestamp)
  const startTimeRef = useRef<number | null>(null);

  useFrame((_, dt) => {
    const now = performance.now();

    if (status !== 'playing') {
      startTimeRef.current = null;
      return;
    }

    // Initialize start time when game starts
    if (startTimeRef.current === null) {
      startTimeRef.current = now;
      // Reset spawn timers so we don't spawn immediately
      lastObstacleSpawn.current = now;
      lastCollectibleSpawn.current = now;
    }

    // Grace period where NO obstacles spawn - critical for mobile loading
    if (now - startTimeRef.current < PHYSICS.spawnGracePeriodMs) {
      return;
    }

    accumulatorMs.current += dt * 1000;
    while (accumulatorMs.current >= fixedStepMs) {
      if (
        now - lastObstacleSpawn.current >
        PHYSICS.spawnInterval.obstacles * 1000
      ) {
        const laneIndex = Math.floor(Math.random() * 3) as -1 | 0 | 1;
        const lane = getLaneX(laneIndex);
        const variant = Math.floor(Math.random() * 4);
        spawn.rock(lane, VISUAL.positions.spawnY, variant);
        lastObstacleSpawn.current = now;
      }
      if (
        now - lastCollectibleSpawn.current >
        PHYSICS.spawnInterval.collectibles * 1000
      ) {
        const laneIndex = Math.floor(Math.random() * 3) as -1 | 0 | 1;
        const lane = getLaneX(laneIndex);
        if (Math.random() > 0.7) {
          spawn.gem(lane, VISUAL.positions.spawnY);
        } else {
          spawn.coin(lane, VISUAL.positions.spawnY);
        }
        lastCollectibleSpawn.current = now;
      }
      accumulatorMs.current -= fixedStepMs;
    }
  });
  return null;
}

/**
 * Animation System - Control otter animations based on state
 */
export function AnimationSystem() {
  const status = useGameStore((state) => state.status);

  useFrame(() => {
    const [player] = playerEntities.entities;
    if (!player || !player.animation) return;

    // Update animation based on game state
    if (status === 'playing') {
      // Check if moving between lanes
      const isMoving = Math.abs(player.velocity!.x) > 0.1;
      player.animation.current = isMoving ? 'run' : 'walk';
    } else if (status === 'game_over') {
      player.animation.current = 'death';
    } else {
      player.animation.current = 'idle';
    }
  });
  return null;
}

/**
 * Particle Decay System - Remove expired particles
 */
export function ParticleSystem() {
  const accumulatorMs = useRef(0);
  const fixedStepMs = 1000 / 60;
  useFrame((_, dt) => {
    accumulatorMs.current += dt * 1000;
    while (accumulatorMs.current >= fixedStepMs) {
      for (const particle of particleEntities) {
        particle.particle!.lifetime -= fixedStepMs;
        if (particle.particle!.lifetime <= 0) {
          world.addComponent(particle, 'destroyed', true);
        }
      }
      accumulatorMs.current -= fixedStepMs;
    }
  });
  return null;
}

/**
 * Helper: Check AABB collision between two entities
 */
function checkCollision(
  a: With<Entity, 'position' | 'collider'>,
  b: With<Entity, 'position' | 'collider'>
): boolean {
  const aBox = {
    minX: a.position.x - a.collider.width / 2,
    maxX: a.position.x + a.collider.width / 2,
    minY: a.position.y - a.collider.height / 2,
    maxY: a.position.y + a.collider.height / 2,
  };

  const bBox = {
    minX: b.position.x - b.collider.width / 2,
    maxX: b.position.x + b.collider.width / 2,
    minY: b.position.y - b.collider.height / 2,
    maxY: b.position.y + b.collider.height / 2,
  };

  return (
    aBox.minX < bBox.maxX &&
    aBox.maxX > bBox.minX &&
    aBox.minY < bBox.maxY &&
    aBox.maxY > bBox.minY
  );
}

/**
 * Handle enemy collision
 */
function handleEnemyHit(
  player: With<Entity, 'player'>,
  enemy: With<Entity, 'enemy'>
) {
  if (player.invincible || player.ghost) return;

  const damage = enemy.ai?.aggression || 1;
  if (player.health) {
    player.health -= damage;

    if (player.animation) {
      player.animation.current = 'hit';
      setTimeout(() => {
        if (player.animation) player.animation.current = 'walk';
      }, 500);
    }

    if (player.health <= 0) {
      useGameStore.getState().endGame();
      if (player.animation) player.animation.current = 'death';
    }
  }

  world.addComponent(enemy, 'destroyed', true);

  for (let i = 0; i < 12; i++) {
    spawn.particle(enemy.position.x, enemy.position.y, '#ff0000');
  }
}

/**
 * Handle obstacle collision
 */
function handleObstacleHit(
  player: With<Entity, 'player'>,
  obstacle: With<Entity, 'obstacle'>
) {
  // Skip if player is invincible or ghost
  if (player.invincible || player.ghost) return;

  // Reduce health
  if (player.health) {
    player.health -= 1;

    // Play hit sound
    audio.hit();

    // Update animation
    if (player.animation) {
      player.animation.current = 'hit';
      setTimeout(() => {
        if (player.animation) player.animation.current = 'walk';
      }, 500);
    }

    // Game over if no health
    if (player.health <= 0) {
      useGameStore.getState().endGame();
      if (player.animation) {
        player.animation.current = 'death';
      }
    }
  }

  // Remove obstacle
  world.addComponent(obstacle, 'destroyed', true);

  // Spawn particles
  for (let i = 0; i < 8; i++) {
    spawn.particle(obstacle.position.x, obstacle.position.y, '#ff6b6b');
  }
}

/**
 * Handle collectible collection
 */
function handleCollect(
  player: With<Entity, 'player'>,
  collectible: With<Entity, 'collectible'>
) {
  const { collectCoin, collectGem, incrementCombo } = useGameStore.getState();

  // Add to score + play sound
  if (collectible.collectible!.type === 'coin') {
    collectCoin(collectible.collectible!.value);
    audio.collectCoin();
  } else {
    collectGem(collectible.collectible!.value);
    audio.collectGem();
  }

  incrementCombo();

  // Play collect animation briefly
  if (player.animation) {
    player.animation.current = 'collect';
    setTimeout(() => {
      if (player.animation) player.animation.current = 'walk';
    }, 300);
  }

  // Mark collected
  world.addComponent(collectible, 'collected', true);

  // Spawn particles
  const color =
    collectible.collectible!.type === 'coin' ? '#ffd700' : '#ff1493';
  for (let i = 0; i < 12; i++) {
    spawn.particle(collectible.position.x, collectible.position.y, color);
  }
}

/**
 * Master Game Systems Component
 */
export function GameSystems() {
  return (
    <>
      <MovementSystem />
      <CollisionSystem />
      <CleanupSystem />
      <SpawnerSystem />
      <AnimationSystem />
      <ParticleSystem />
    </>
  );
}

// Add camera shake on collision
function triggerCameraShake(intensity: number = 0.2) {
  if (window.__cameraShake) {
    window.__cameraShake(intensity);
  }
}

// Call in handleObstacleHit
queries.destroyed.onEntityAdded.subscribe((entity) => {
  if (entity.obstacle) {
    triggerCameraShake(0.3);
  }
});
