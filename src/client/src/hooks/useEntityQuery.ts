import type { With } from 'miniplex';
import { useEntities } from 'miniplex-react';
import { useMemo } from 'react';
import { type Entity, queries, world } from '../ecs/world';

export function usePlayer() {
  const players = useEntities(queries.player);
  return players[0] || null;
}

export function useObstacles() {
  return useEntities(queries.obstacles);
}

export function useCollectibles() {
  return useEntities(queries.collectibles);
}

export function useCoins() {
  return useEntities(queries.coins);
}

export function useGems() {
  return useEntities(queries.gems);
}

export function usePowerUps() {
  return useEntities(queries.powerUps);
}

export function useParticles() {
  return useEntities(queries.particles);
}

export function useEntitiesNear(x: number, y: number, radius: number) {
  const allEntities = Array.from(world.entities);

  return useMemo(() => {
    return allEntities.filter((entity) => {
      const dx = entity.position.x - x;
      const dy = entity.position.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist <= radius;
    });
  }, [allEntities.length, x, y, radius]);
}

export function useEntityCount() {
  return {
    total: world.entities.length,
    obstacles: queries.obstacles.entities.length,
    collectibles: queries.collectibles.entities.length,
    particles: queries.particles.entities.length,
  };
}

export function useNearestObstacle(fromX: number, fromY: number) {
  const obstacles = useObstacles();

  return useMemo(() => {
    let nearest: Entity | null = null;
    let minDist = Infinity;

    for (const obstacle of obstacles) {
      const dx = obstacle.position.x - fromX;
      const dy = obstacle.position.y - fromY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minDist) {
        minDist = dist;
        nearest = obstacle;
      }
    }

    return nearest;
  }, [obstacles, fromX, fromY]);
}

export function useEntitiesInFront(y: number) {
  const allEntities = Array.from(world.entities);

  return useMemo(() => {
    return allEntities.filter((entity) => entity.position.y > y);
  }, [allEntities.length, y]);
}

export function usePlayerLane() {
  const player = usePlayer();
  return player?.lane || 0;
}

export function usePlayerHealth() {
  const player = usePlayer();
  return player?.health || 0;
}

export function useIsPlayerInvincible() {
  const player = usePlayer();
  return player?.invincible || player?.ghost || false;
}
