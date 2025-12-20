import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../hooks/useGameStore';
import { queries } from './world';

export function DifficultySystem() {
  const { status } = useGameStore();

  useFrame((state, dt) => {
    if (status !== 'playing') return;

    const distance = useGameStore.getState().distance;

    // Increase speed based on distance (every 100m = +10% speed)
    const baseSpeed = 5;
    const speedMultiplier = 1 + Math.floor(distance / 100) * 0.1;
    const currentSpeed = Math.min(baseSpeed * speedMultiplier, baseSpeed * 2); // Cap at 2x

    // Update all moving entities
    for (const entity of queries.moving) {
      if (entity.obstacle || entity.collectible) {
        if (entity.velocity) {
          entity.velocity.y = -currentSpeed;
        }
      }
    }
  });

  return null;
}
