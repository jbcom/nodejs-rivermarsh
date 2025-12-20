import type { With } from 'miniplex';
import type { Entity } from '../ecs/world';

export interface AABB {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ?: number;
  maxZ?: number;
}

export function getAABB(entity: With<Entity, 'position' | 'collider'>): AABB {
  return {
    minX: entity.position.x - entity.collider.width / 2,
    maxX: entity.position.x + entity.collider.width / 2,
    minY: entity.position.y - entity.collider.height / 2,
    maxY: entity.position.y + entity.collider.height / 2,
    minZ: entity.position.z - entity.collider.depth / 2,
    maxZ: entity.position.z + entity.collider.depth / 2,
  };
}

export function checkAABBCollision(a: AABB, b: AABB): boolean {
  return (
    a.minX < b.maxX &&
    a.maxX > b.minX &&
    a.minY < b.maxY &&
    a.maxY > b.minY &&
    (!a.minZ || !b.minZ || (a.minZ < b.maxZ! && a.maxZ! > b.minZ))
  );
}

export function checkSphereCollision(
  x1: number,
  y1: number,
  z1: number,
  r1: number,
  x2: number,
  y2: number,
  z2: number,
  r2: number
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dz = z2 - z1;
  const distSq = dx * dx + dy * dy + dz * dz;
  const radiusSum = r1 + r2;
  return distSq < radiusSum * radiusSum;
}

export function checkPointInAABB(
  x: number,
  y: number,
  z: number,
  aabb: AABB
): boolean {
  return (
    x >= aabb.minX &&
    x <= aabb.maxX &&
    y >= aabb.minY &&
    y <= aabb.maxY &&
    (!aabb.minZ || (z >= aabb.minZ && z <= aabb.maxZ))
  );
}

export function getClosestPoint(
  px: number,
  py: number,
  pz: number,
  aabb: AABB
): { x: number; y: number; z: number } {
  return {
    x: Math.max(aabb.minX, Math.min(px, aabb.maxX)),
    y: Math.max(aabb.minY, Math.min(py, aabb.maxY)),
    z: aabb.minZ ? Math.max(aabb.minZ, Math.min(pz, aabb.maxZ!)) : pz,
  };
}

export function checkRayAABBIntersection(
  rayOrigin: { x: number; y: number; z: number },
  rayDir: { x: number; y: number; z: number },
  aabb: AABB
): boolean {
  const tmin = (aabb.minX - rayOrigin.x) / rayDir.x;
  const tmax = (aabb.maxX - rayOrigin.x) / rayDir.x;

  let t0 = Math.min(tmin, tmax);
  let t1 = Math.max(tmin, tmax);

  const tymin = (aabb.minY - rayOrigin.y) / rayDir.y;
  const tymax = (aabb.maxY - rayOrigin.y) / rayDir.y;

  t0 = Math.max(t0, Math.min(tymin, tymax));
  t1 = Math.min(t1, Math.max(tymin, tymax));

  if (aabb.minZ && aabb.maxZ) {
    const tzmin = (aabb.minZ - rayOrigin.z) / rayDir.z;
    const tzmax = (aabb.maxZ - rayOrigin.z) / rayDir.z;

    t0 = Math.max(t0, Math.min(tzmin, tzmax));
    t1 = Math.min(t1, Math.max(tzmin, tzmax));
  }

  return t1 >= t0 && t1 >= 0;
}

export interface SpatialGrid<T = Entity> {
  cellSize: number;
  cells: Map<string, Set<T>>;
}

export function createSpatialGrid<T = Entity>(
  cellSize: number = 2
): SpatialGrid<T> {
  return {
    cellSize,
    cells: new Map(),
  };
}

export function getCellKey(x: number, y: number, cellSize: number): string {
  const cellX = Math.floor(x / cellSize);
  const cellY = Math.floor(y / cellSize);
  return `${cellX},${cellY}`;
}

export function insertIntoGrid<T>(
  grid: SpatialGrid<T>,
  entity: T,
  x: number,
  y: number
) {
  const key = getCellKey(x, y, grid.cellSize);
  if (!grid.cells.has(key)) {
    grid.cells.set(key, new Set());
  }
  grid.cells.get(key)!.add(entity);
}

export function getNearbyEntities<T>(
  grid: SpatialGrid<T>,
  x: number,
  y: number
): Set<T> {
  const nearby = new Set<T>();
  const cellX = Math.floor(x / grid.cellSize);
  const cellY = Math.floor(y / grid.cellSize);

  // Check 3x3 grid around position
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const key = `${cellX + dx},${cellY + dy}`;
      const cell = grid.cells.get(key);
      if (cell) {
        cell.forEach((e) => nearby.add(e));
      }
    }
  }

  return nearby;
}

export function clearGrid<T>(grid: SpatialGrid<T>) {
  grid.cells.clear();
}
