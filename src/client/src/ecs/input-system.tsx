import { useEffect } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { queries } from './world';

const LANES = [-2, 0, 2];
const playerEntities = queries.player;

export function InputSystem() {
  const status = useGameStore((state) => state.status);

  useEffect(() => {
    if (status !== 'playing') return;

    function handleKeyDown(e: KeyboardEvent) {
      const [player] = playerEntities.entities;
      if (!player) return;

      const currentLane = player.lane || 0;

      if (
        (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') &&
        currentLane > -1
      ) {
        player.lane = (currentLane - 1) as -1 | 0 | 1;
        player.position.x = LANES[player.lane + 1];
      }

      if (
        (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') &&
        currentLane < 1
      ) {
        player.lane = (currentLane + 1) as -1 | 0 | 1;
        player.position.x = LANES[player.lane + 1];
      }

      if (
        e.key === ' ' ||
        e.key === 'ArrowUp' ||
        e.key === 'w' ||
        e.key === 'W'
      ) {
        if (player.animation) {
          player.animation.current = 'jump';
          setTimeout(() => {
            if (player.animation) player.animation.current = 'walk';
          }, 400);
        }
      }

      if (e.key === 'Escape') {
        useGameStore.getState().pauseGame();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  return null;
}
