import { useFrame } from '@react-three/fiber';
import { ENEMY_DEFINITIONS } from '../game/data/enemy-definitions';
import { useGameStore } from '../hooks/useGameStore';
import { queries, world } from './world';

const enemyEntities = queries.enemies || world.with('enemy');
const playerEntities = queries.player;

export function EnemySystem() {
  const status = useGameStore((state) => state.status);
  const distance = useGameStore((state) => state.distance);
  // Derive difficulty from distance (every 500m increases difficulty)
  const difficulty = Math.max(1, Math.floor(distance / 500) + 1);

  useFrame((state, dt) => {
    if (status !== 'playing') return;

    // Spawn enemies based on distance and difficulty
    const time = state.clock.elapsedTime;
    const spawnRate = 1 / (5 - difficulty * 0.3); // Faster spawning at higher difficulty

    if (Math.floor(time * spawnRate) > Math.floor((time - dt) * spawnRate)) {
      // Select enemy based on difficulty
      const validEnemies = ENEMY_DEFINITIONS.filter(
        (e) => difficulty >= e.spawn.minDifficulty
      );

      if (validEnemies.length > 0) {
        // Weighted random selection
        const totalWeight = validEnemies.reduce(
          (sum, e) => sum + e.spawn.weight,
          0
        );
        let random = Math.random() * totalWeight;

        for (const enemyDef of validEnemies) {
          random -= enemyDef.spawn.weight;
          if (random <= 0) {
            // Spawn this enemy
            const lanes = [-1, 0, 1] as const;
            const lane = lanes[Math.floor(Math.random() * lanes.length)];
            spawnEnemy(enemyDef.id, lane);
            break;
          }
        }
      }
    }

    // Update enemy AI
    const [player] = playerEntities.entities;
    if (player) {
      for (const enemy of enemyEntities) {
        // Simple AI: Move toward player lane one step at a time
        if (enemy.ai && enemy.lane !== undefined && player.lane !== undefined) {
          if (enemy.lane < player.lane) {
            const next = (enemy.lane + 1) as -1 | 0 | 1;
            enemy.lane = next;
          } else if (enemy.lane > player.lane) {
            const next = (enemy.lane - 1) as -1 | 0 | 1;
            enemy.lane = next;
          }
          enemy.position.x = enemy.lane * 2;
        }
      }
    }
  });

  return null;
}

function spawnEnemy(enemyId: string, lane: -1 | 0 | 1) {
  const definition = ENEMY_DEFINITIONS.find((e) => e.id === enemyId);
  if (!definition) return;

  world.add({
    enemy: true,
    position: { x: lane * 2, y: 8, z: 0 },
    velocity: { x: 0, y: -definition.stats.speed, z: 0 },
    lane,
    health: definition.stats.health,
    collider: { width: 1.0, height: 1.0, depth: 1.0 },
    ai: {
      type: enemyId,
      aggression: definition.stats.aggression,
      lastAction: 0,
    },
    model: {
      url: `/otter-river-rush/models/enemy-${enemyId}.glb`, // Would need models
      scale: definition.visual.size,
    },
  });
}
