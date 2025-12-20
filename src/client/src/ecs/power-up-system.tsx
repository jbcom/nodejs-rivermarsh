import { useFrame } from '@react-three/fiber';
import type { With } from 'miniplex';
import { useGameStore } from '../hooks/useGameStore';
import { type Entity, queries, spawn, world } from './world';

export function PowerUpSystem() {
  const { status } = useGameStore();

  // Spawn power-ups
  useFrame((state) => {
    if (status !== 'playing') return;

    const time = state.clock.elapsedTime;

    // Spawn power-up every 15 seconds
    if (Math.floor(time / 15) > Math.floor((time - 0.016) / 15)) {
      const lanes = [-2, 0, 2];
      const lane = lanes[Math.floor(Math.random() * 3)];
      const powerUpTypes: Array<
        'shield' | 'magnet' | 'ghost' | 'multiplier' | 'slow_motion'
      > = ['shield', 'magnet', 'ghost', 'multiplier', 'slow_motion'];
      const type =
        powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

      world.add({
        powerUp: { type, duration: 5000 },
        position: { x: lane, y: 8, z: 0.2 },
        velocity: { x: 0, y: -5, z: 0 },
        collider: { width: 0.5, height: 0.5, depth: 0.5 },
      });
    }
  });

  // Handle power-up collection
  useFrame(() => {
    if (status !== 'playing') return;

    const [player] = queries.player.entities;
    if (!player || !player.collider) return;

    for (const powerUp of queries.powerUps) {
      if (powerUp.collider) {
        const playerWithCollider = player as CollidableEntity;
        const powerUpWithCollider = powerUp as CollidableEntity;
        if (checkAABB(playerWithCollider, powerUpWithCollider)) {
          activatePowerUp(player, powerUp.powerUp!.type);
          world.addComponent(powerUp, 'collected', true);

          // Spawn particles
          for (let i = 0; i < 16; i++) {
            spawn.particle(powerUp.position.x, powerUp.position.y, '#fbbf24');
          }
        }
      }
    }
  });

  // Deactivate expired power-ups
  useFrame(() => {
    const now = Date.now();
    const [player] = queries.player.entities;

    if (player && player.powerUpEndTime && now > player.powerUpEndTime) {
      // Deactivate power-up
      player.powerUpEndTime = undefined;
      if (player.powerUpType === 'ghost') {
        world.removeComponent(player, 'ghost');
      }
      player.powerUpType = undefined;
    }
  });

  return null;
}

type CollidableEntity = With<Entity, 'position' | 'collider'>;

function checkAABB(a: CollidableEntity, b: CollidableEntity): boolean {
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

function activatePowerUp(
  player: With<Entity, 'player'>,
  type: Entity['powerUp'] extends { type: infer T } ? T : string
) {
  const { activatePowerUp: storeActivatePowerUp } = useGameStore.getState();

  switch (type) {
    case 'shield': {
      world.addComponent(player, 'invincible', true);
      player.powerUpType = 'shield';
      player.powerUpEndTime = Date.now() + 5000;
      break;
    }
    case 'ghost': {
      world.addComponent(player, 'ghost', true);
      player.powerUpType = 'ghost';
      player.powerUpEndTime = Date.now() + 5000;
      break;
    }
    case 'magnet': {
      // Magnet handled in spawner
      player.magnetActive = true;
      player.magnetEndTime = Date.now() + 8000;
      break;
    }
    case 'multiplier': {
      storeActivatePowerUp('multiplier', 10000);
      break;
    }
    case 'slow_motion': {
      // Slow down obstacles - track which entities were slowed to avoid race condition
      const slowedEntities = new Set<Entity>();
      for (const entity of queries.moving) {
        if (entity.obstacle || entity.collectible) {
          if (entity.velocity) {
            entity.velocity.y *= 0.5;
            slowedEntities.add(entity);
          }
        }
      }
      setTimeout(() => {
        // Only restore velocity for entities that were originally slowed
        for (const entity of slowedEntities) {
          if (entity.velocity) {
            entity.velocity.y /= 0.5;
          }
        }
        slowedEntities.clear();
      }, 5000);
      break;
    }
  }
}
