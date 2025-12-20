import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../hooks/useGameStore';
import { queries, spawn } from './world';

export function NearMissSystem() {
  const { status } = useGameStore();

  useFrame(() => {
    if (status !== 'playing') return;

    const [player] = queries.player.entities;
    if (!player) return;

    const NEAR_MISS_DISTANCE = 0.5;
    const BONUS_POINTS = 5;

    for (const obstacle of queries.obstacles) {
      const dx = Math.abs(player.position.x - obstacle.position.x);
      const dy = Math.abs(player.position.y - obstacle.position.y);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < NEAR_MISS_DISTANCE && !obstacle.nearMissRecorded) {
        // Award near-miss bonus
        useGameStore.getState().updateScore(BONUS_POINTS);
        useGameStore.getState().incrementCombo();

        obstacle.nearMissRecorded = true;

        // Spawn particles
        for (let i = 0; i < 6; i++) {
          spawn.particle(obstacle.position.x, obstacle.position.y, '#ffff00');
        }
      }
    }
  });

  return null;
}
