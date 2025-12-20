/**
 * Miniplex ECS World for Otter River Rush
 * Entity Component System for managing game entities
 */

import { World } from 'miniplex';
import createReactAPI from 'miniplex-react';
import type { Object3D } from 'three';
import { ASSET_URLS } from '../config/game-constants';
import {
  getLaneX,
  getModelScale,
  PHYSICS,
  VISUAL,
} from '../config/visual-constants';
import {
  getModelVariantsSync,
  loadModelsManifest,
} from '../utils/model-manifest';

/**
 * Entity type definition
 * All game entities (Otter, Rocks, Coins, Gems) use this schema
 */
export type Entity = {
  // Core components
  position: { x: number; y: number; z: number };
  velocity?: { x: number; y: number; z: number };

  // Three.js rendering
  model?: {
    url: string;
    scale?: number;
  };
  three?: Object3D;

  // Animation
  animation?: {
    current: string; // 'idle', 'walk', 'run', 'jump', 'collect', 'hit', 'death'
    urls: Record<string, string>;
  };

  // Physics
  collider?: {
    width: number;
    height: number;
    depth: number;
  };

  // Game behavior
  scrollSpeed?: number;
  lane?: -1 | 0 | 1; // Left, Center, Right

  // Entity types (tags)
  player?: true;
  obstacle?: true;
  enemy?: true;
  ai?: {
    type: string;
    aggression: number;
    lastAction: number;
  };
  collectible?: {
    type: 'coin' | 'gem';
    value: number;
  };
  powerUp?: {
    type: 'shield' | 'magnet' | 'ghost' | 'multiplier' | 'slow_motion';
    duration?: number;
  };

  // State
  health?: number;
  invincible?: true;
  ghost?: true;
  collected?: true;
  destroyed?: true;

  // Power-up tracking
  powerUpType?: 'shield' | 'ghost' | 'magnet' | 'multiplier' | 'slow_motion';
  powerUpEndTime?: number;
  magnetActive?: boolean;
  magnetEndTime?: number;

  // Near-miss tracking
  nearMissRecorded?: boolean;

  // Visual effects
  particle?: {
    color: string;
    lifetime: number;
    size: number;
  };

  // Metadata
  id?: string;
  variant?: number; // For multiple rock types
};

/**
 * Create the Miniplex world
 */
export const world = new World<Entity>();

/**
 * Create and export React bindings
 * Use ECS.Entity, ECS.Component, ECS.Entities in components
 */
export const ECS = createReactAPI(world);

/**
 * Predefined queries for common entity sets
 * Reuse these instead of creating new queries
 */
export const queries = {
  // Player
  player: world.with('player', 'position', 'model'),

  // Enemies
  enemies: world.with('enemy', 'position', 'collider'),

  // Obstacles
  obstacles: world.with('obstacle', 'position', 'collider'),

  // Collectibles
  collectibles: world.with('collectible', 'position'),
  coins: world
    .with('collectible', 'position')
    .where((e) => e.collectible?.type === 'coin'),
  gems: world
    .with('collectible', 'position')
    .where((e) => e.collectible?.type === 'gem'),

  // Power-ups
  powerUps: world.with('powerUp', 'position'),

  // Visual effects
  particles: world.with('particle', 'position', 'velocity'),

  // Physics
  moving: world.with('position', 'velocity'),
  collidable: world.with('position', 'collider'),

  // Lifecycle
  collected: world.with('collected'),
  destroyed: world.with('destroyed'),

  // Rendering
  renderable: world.with('position', 'three'),
};

/**
 * Reset the world - clear all entities
 */
export function resetWorld(): void {
  // Clear all entities from the world
  for (const entity of world.entities) {
    world.remove(entity);
  }
}

/**
 * Helper functions for spawning entities
 */
export const spawn = {
  otter: (lane: -1 | 0 | 1 = 0) =>
    world.add({
      player: true,
      position: {
        x: getLaneX(lane),
        y: VISUAL.positions.player,
        z: VISUAL.layers.player,
      },
      velocity: { x: 0, y: 0, z: 0 },
      lane,
      model: {
        url: ASSET_URLS.MODELS.OTTER,
        scale: getModelScale('otter'),
      },
      animation: {
        current: 'idle',
        urls: {
          idle: ASSET_URLS.ANIMATIONS.OTTER_IDLE,
          walk: ASSET_URLS.ANIMATIONS.OTTER_WALK,
          run: ASSET_URLS.ANIMATIONS.OTTER_RUN,
          jump: ASSET_URLS.ANIMATIONS.OTTER_JUMP,
          collect: ASSET_URLS.ANIMATIONS.OTTER_COLLECT,
          hit: ASSET_URLS.ANIMATIONS.OTTER_HIT,
          death: ASSET_URLS.ANIMATIONS.OTTER_DEATH,
          victory: ASSET_URLS.ANIMATIONS.OTTER_VICTORY,
          happy: ASSET_URLS.ANIMATIONS.OTTER_HAPPY,
          dodgeLeft: ASSET_URLS.ANIMATIONS.OTTER_DODGE_LEFT,
          dodgeRight: ASSET_URLS.ANIMATIONS.OTTER_DODGE_RIGHT,
        },
      },
      collider: { width: 0.8, height: 1.2, depth: 0.8 },
      health: 3,
    }),

  rock: (x: number, y: number, variant: number = 0) => {
    const manifestVariants = getModelVariantsSync('rock');
    const fallback = [
      ASSET_URLS.MODELS.ROCK_RIVER,
      ASSET_URLS.MODELS.ROCK_MOSSY,
      ASSET_URLS.MODELS.ROCK_CRACKED,
      ASSET_URLS.MODELS.ROCK_CRYSTAL,
    ];
    const selectedUrl =
      manifestVariants[variant % Math.max(manifestVariants.length, 1)] ||
      fallback[variant % fallback.length];
    return world.add({
      obstacle: true,
      position: { x, y, z: VISUAL.layers.obstacles },
      velocity: { x: 0, y: -PHYSICS.scrollSpeed, z: 0 },
      model: {
        url: selectedUrl,
        scale: getModelScale('rock'),
      },
      collider: { width: 1.2, height: 1.2, depth: 1.2 },
      variant,
    });
  },

  coin: (x: number, y: number) =>
    world.add({
      collectible: { type: 'coin', value: 10 },
      position: { x, y, z: VISUAL.layers.collectibles },
      velocity: { x: 0, y: -PHYSICS.scrollSpeed, z: 0 },
      model: {
        url: ASSET_URLS.MODELS.COIN,
        scale: getModelScale('coin'),
      },
      collider: { width: 0.6, height: 0.6, depth: 0.6 },
    }),

  gem: (x: number, y: number, color: 'red' = 'red') =>
    world.add({
      collectible: { type: 'gem', value: 50 },
      position: { x, y, z: VISUAL.layers.collectibles },
      velocity: { x: 0, y: -PHYSICS.scrollSpeed, z: 0 },
      model: {
        url: ASSET_URLS.MODELS.GEM_RED,
        scale: getModelScale('gem'),
      },
      collider: { width: 0.8, height: 0.8, depth: 0.8 },
    }),

  particle: (x: number, y: number, color: string) =>
    world.add({
      particle: {
        color,
        lifetime: 1000,
        size: getModelScale('particle') * 100,
      },
      position: { x, y, z: VISUAL.layers.particles },
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: 0,
      },
    }),
};

// Lazy-load models manifest at runtime for dynamic variants
// Manifest loading is optional, fallback URLs are used if it fails
loadModelsManifest().catch(() => undefined);
