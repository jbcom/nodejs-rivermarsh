import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../hooks/useGameStore';
import { queries, world } from './world';

export function ShieldEffectSystem() {
  const { status } = useGameStore();

  useFrame(() => {
    if (status !== 'playing') return;

    const [player] = queries.player.entities;
    if (!player || !player.invincible) return;

    // Shield visual effect handled by renderer
    // Just manage expiration here
    const now = Date.now();
    const endTime = player.powerUpEndTime;

    if (endTime && now > endTime) {
      world.removeComponent(player, 'invincible');
      player.powerUpEndTime = undefined;
      player.powerUpType = undefined;
    }
  });

  return null;
}
