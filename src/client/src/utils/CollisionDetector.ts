/**
 * Collision detection utilities
 */

import type { Bounds, Collider, Vector2D } from '@/types/Game.types';

/**
 * Check AABB collision
 */
export function checkAABB(a: Bounds, b: Bounds): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Check circle collision
 */
export function checkCircle(
  a: Vector2D,
  radiusA: number,
  b: Vector2D,
  radiusB: number
): boolean {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < radiusA + radiusB;
}

/**
 * Check circle-AABB collision
 */
export function checkCircleAABB(
  circle: Vector2D,
  radius: number,
  box: Bounds
): boolean {
  const closestX = Math.max(box.x, Math.min(circle.x, box.x + box.width));
  const closestY = Math.max(box.y, Math.min(circle.y, box.y + box.height));

  const dx = circle.x - closestX;
  const dy = circle.y - closestY;

  return dx * dx + dy * dy < radius * radius;
}

/**
 * Check point in circle
 */
export function pointInCircle(
  point: Vector2D,
  circle: Vector2D,
  radius: number
): boolean {
  const dx = point.x - circle.x;
  const dy = point.y - circle.y;
  return dx * dx + dy * dy <= radius * radius;
}

/**
 * Check point in AABB
 */
export function pointInAABB(point: Vector2D, box: Bounds): boolean {
  return (
    point.x >= box.x &&
    point.x <= box.x + box.width &&
    point.y >= box.y &&
    point.y <= box.y + box.height
  );
}

/**
 * Get collision normal (simplified)
 */
export function getCollisionNormal(a: Vector2D, b: Vector2D): Vector2D {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) {
    return { x: 0, y: -1 };
  }

  return {
    x: dx / distance,
    y: dy / distance,
  };
}

/**
 * Check collision between two colliders
 */
export function checkColliders(
  posA: Vector2D,
  colliderA: Collider,
  posB: Vector2D,
  colliderB: Collider
): boolean {
  const centerA = {
    x: posA.x + colliderA.offset.x,
    y: posA.y + colliderA.offset.y,
  };
  const centerB = {
    x: posB.x + colliderB.offset.x,
    y: posB.y + colliderB.offset.y,
  };

  if (colliderA.type === 'circle' && colliderB.type === 'circle') {
    return checkCircle(
      centerA,
      colliderA.radius ?? 0,
      centerB,
      colliderB.radius!
    );
  }

  if (colliderA.type === 'rectangle' && colliderB.type === 'rectangle') {
    return checkAABB(
      {
        x: centerA.x - colliderA.width! / 2,
        y: centerA.y - colliderA.height! / 2,
        width: colliderA.width!,
        height: colliderA.height!,
      },
      {
        x: centerB.x - colliderB.width! / 2,
        y: centerB.y - colliderB.height! / 2,
        width: colliderB.width!,
        height: colliderB.height!,
      }
    );
  }

  // Mixed circle and rectangle
  if (colliderA.type === 'circle' && colliderB.type === 'rectangle') {
    return checkCircleAABB(centerA, colliderA.radius!, {
      x: centerB.x - colliderB.width! / 2,
      y: centerB.y - colliderB.height! / 2,
      width: colliderB.width!,
      height: colliderB.height!,
    });
  }

  if (colliderA.type === 'rectangle' && colliderB.type === 'circle') {
    return checkCircleAABB(centerB, colliderB.radius!, {
      x: centerA.x - colliderA.width! / 2,
      y: centerA.y - colliderA.height! / 2,
      width: colliderA.width!,
      height: colliderA.height!,
    });
  }

  return false;
}

/**
 * Spatial grid for broad-phase collision detection
 */
export class SpatialGrid<T> {
  private cellSize: number;
  private grid: Map<string, Set<{ item: T; bounds: Bounds }>>;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  /**
   * Clear the grid
   */
  public clear(): void {
    this.grid.clear();
  }

  /**
   * Insert item into grid
   */
  public insert(item: T, bounds: Bounds): void {
    const cells = this.getCells(bounds);
    cells.forEach((cell) => {
      if (!this.grid.has(cell)) {
        this.grid.set(cell, new Set());
      }
      this.grid.get(cell)!.add({ item, bounds });
    });
  }

  /**
   * Query items in region
   */
  public query(bounds: Bounds): T[] {
    const cells = this.getCells(bounds);
    const results = new Set<T>();

    cells.forEach((cell) => {
      const cellItems = this.grid.get(cell);
      if (cellItems) {
        cellItems.forEach(({ item, bounds: itemBounds }) => {
          if (checkAABB(bounds, itemBounds)) {
            results.add(item);
          }
        });
      }
    });

    return Array.from(results);
  }

  /**
   * Get cell keys for bounds
   */
  private getCells(bounds: Bounds): string[] {
    const cells: string[] = [];
    const startX = Math.floor(bounds.x / this.cellSize);
    const startY = Math.floor(bounds.y / this.cellSize);
    const endX = Math.floor((bounds.x + bounds.width) / this.cellSize);
    const endY = Math.floor((bounds.y + bounds.height) / this.cellSize);

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        cells.push(`${x},${y}`);
      }
    }

    return cells;
  }
}
