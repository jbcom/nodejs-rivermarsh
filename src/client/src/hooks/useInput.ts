import { useCallback, useEffect } from 'react';
import { useGameStore } from './useGameStore';

/**
 * useInput Hook - Keyboard and touch input handling for React
 * Provides game controls and pause functionality
 */

type Direction = 'left' | 'right';

interface UseInputOptions {
  onMove?: (direction: Direction) => void;
  onPause?: () => void;
  enabled?: boolean;
}

export function useInput({
  onMove,
  onPause,
  enabled = true,
}: UseInputOptions = {}): { status: string } {
  const { status, pauseGame, resumeGame } = useGameStore();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Prevent default for game keys
      if (
        ['ArrowLeft', 'ArrowRight', 'a', 'd', 'Escape', ' '].includes(event.key)
      ) {
        event.preventDefault();
      }

      // Movement keys
      if (status === 'playing') {
        if (
          event.key === 'ArrowLeft' ||
          event.key === 'a' ||
          event.key === 'A'
        ) {
          onMove?.('left');
        } else if (
          event.key === 'ArrowRight' ||
          event.key === 'd' ||
          event.key === 'D'
        ) {
          onMove?.('right');
        }
      }

      // Pause toggle
      if (event.key === 'Escape') {
        if (status === 'playing') {
          pauseGame();
          onPause?.();
        } else if (status === 'paused') {
          resumeGame();
        }
      }

      // Start game from menu
      if (event.key === ' ' && status === 'menu') {
        useGameStore.getState().startGame('classic');
      }
    },
    [enabled, status, onMove, onPause, pauseGame, resumeGame]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);

  return { status };
}

/**
 * useTouchInput Hook - Touch/swipe input for mobile
 */
export function useTouchInput(onMove?: (direction: Direction) => void): void {
  const { status } = useGameStore();

  useEffect(() => {
    if (status !== 'playing') return;

    let touchStartX = 0;
    let touchStartY = 0;
    const minSwipeDistance = 50; // pixels

    const handleTouchStart = (e: TouchEvent): void => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent): void => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Only register as swipe if horizontal movement > vertical
      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > minSwipeDistance
      ) {
        if (deltaX > 0) {
          onMove?.('right');
        } else {
          onMove?.('left');
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [status, onMove]);
}
