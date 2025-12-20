import type { With } from 'miniplex';
import { type Entity, world } from '../ecs/world';
import { randomInt } from './math-helpers';

export function findNearestEntity<_T extends keyof Entity>(
  fromX: number,
  fromY: number,
  entities: Iterable<Entity>,
  maxDistance: number = Infinity
): Entity | null {
  let nearest: Entity | null = null;
  let nearestDist = maxDistance;

  for (const entity of entities) {
    const dx = entity.position.x - fromX;
    const dy = entity.position.y - fromY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < nearestDist) {
      nearest = entity;
      nearestDist = dist;
    }
  }

  return nearest;
}

export function getEntitiesInRadius(
  centerX: number,
  centerY: number,
  radius: number,
  entities: Iterable<Entity>
): Entity[] {
  const result: Entity[] = [];
  const radiusSq = radius * radius;

  for (const entity of entities) {
    const dx = entity.position.x - centerX;
    const dy = entity.position.y - centerY;
    const distSq = dx * dx + dy * dy;

    if (distSq <= radiusSq) {
      result.push(entity);
    }
  }

  return result;
}

export function countEntitiesOfType(
  entities: Iterable<Entity>,
  predicate: (entity: Entity) => boolean
): number {
  let count = 0;
  for (const entity of entities) {
    if (predicate(entity)) count++;
  }
  return count;
}

export function teleportEntity(
  entity: With<Entity, 'position'>,
  x: number,
  y: number,
  z: number = entity.position.z
) {
  entity.position.x = x;
  entity.position.y = y;
  entity.position.z = z;
}

export function setVelocity(
  entity: With<Entity, 'velocity'>,
  x: number,
  y: number,
  z: number = 0
) {
  entity.velocity!.x = x;
  entity.velocity!.y = y;
  entity.velocity!.z = z;
}

export function addVelocity(
  entity: With<Entity, 'velocity'>,
  x: number,
  y: number,
  z: number = 0
) {
  entity.velocity!.x += x;
  entity.velocity!.y += y;
  entity.velocity!.z += z;
}

export function scaleVelocity(entity: With<Entity, 'velocity'>, scale: number) {
  entity.velocity!.x *= scale;
  entity.velocity!.y *= scale;
  entity.velocity!.z *= scale;
}

export function stopEntity(entity: With<Entity, 'velocity'>) {
  entity.velocity!.x = 0;
  entity.velocity!.y = 0;
  entity.velocity!.z = 0;
}

export function isOffScreen(
  entity: With<Entity, 'position'>,
  minY: number = -10,
  maxY: number = 10
): boolean {
  return entity.position.y < minY || entity.position.y > maxY;
}

export function isInBounds(
  entity: With<Entity, 'position'>,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
): boolean {
  return (
    entity.position.x >= minX &&
    entity.position.x <= maxX &&
    entity.position.y >= minY &&
    entity.position.y <= maxY
  );
}

export function rotateEntityTowards(
  entity: With<Entity, 'position'>,
  targetX: number,
  targetY: number
): number {
  const dx = targetX - entity.position.x;
  const dy = targetY - entity.position.y;
  return Math.atan2(dy, dx);
}

export function moveTowards(
  entity: With<Entity, 'position' | 'velocity'>,
  targetX: number,
  targetY: number,
  speed: number
) {
  const dx = targetX - entity.position.x;
  const dy = targetY - entity.position.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 0) {
    entity.velocity!.x = (dx / dist) * speed;
    entity.velocity!.y = (dy / dist) * speed;
  }
}

export function randomSpawnPosition(
  lanes: number[] = [-2, 0, 2],
  y: number = 8
): { x: number; y: number; z: number } {
  const x = lanes[randomInt(0, lanes.length - 1)];
  return { x, y, z: 0 };
}

export function getEntitySpeed(entity: With<Entity, 'velocity'>): number {
  const vx = entity.velocity!.x;
  const vy = entity.velocity!.y;
  const vz = entity.velocity!.z || 0;
  return Math.sqrt(vx * vx + vy * vy + vz * vz);
}

export function dampenVelocity(
  entity: With<Entity, 'velocity'>,
  damping: number = 0.9
) {
  entity.velocity!.x *= damping;
  entity.velocity!.y *= damping;
  entity.velocity!.z *= damping;
}

export function bounceOffWalls(
  entity: With<Entity, 'position' | 'velocity'>,
  minX: number = -6,
  maxX: number = 6
) {
  if (entity.position.x < minX) {
    entity.position.x = minX;
    entity.velocity!.x *= -1;
  }
  if (entity.position.x > maxX) {
    entity.position.x = maxX;
    entity.velocity!.x *= -1;
  }
}
