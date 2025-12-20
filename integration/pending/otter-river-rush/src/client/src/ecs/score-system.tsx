import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../hooks/useGameStore';
import { queries } from './world';

const playerEntities = queries.player;

export function ScoreSystem() {
  const status = useGameStore((state) => state.status);
  const updateScore = useGameStore((state) => state.updateScore);
  const updateDistance = useGameStore((state) => state.updateDistance);
  const combo = useGameStore((state) => state.combo);

  useFrame((_, dt) => {
    if (status !== 'playing') return;

    const [player] = playerEntities.entities;
    if (!player) return;

    // Award points for distance traveled
    const distancePoints = Math.floor(dt * 10);
    updateScore(distancePoints);
    updateDistance(dt * 5);

    // Combo multiplier bonus
    if (combo > 0) {
      updateScore(Math.floor(distancePoints * combo * 0.1));
    }
  });

  return null;
}
