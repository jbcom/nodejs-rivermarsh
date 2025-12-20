import { useEffect } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { HAPTIC_PATTERNS, hapticFeedback } from '../hooks/useMobileConstraints';
import { audio } from '../utils/audio';
import { queries } from './world';

const LANES = [-2, 0, 2];

export function TouchInputSystem() {
  const { status } = useGameStore();

  useEffect(() => {
    if (status !== 'playing') return;

    let startX = 0;
    let startY = 0;
    const swipeThreshold = 50;

    function applySwipe(deltaX: number, deltaY: number) {
      const [player] = queries.player.entities;
      if (!player) return;

      // Horizontal swipe
      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > swipeThreshold
      ) {
        const currentLane = player.lane || 0;

        if (deltaX > 0 && currentLane < 1) {
          // Swipe right
          player.lane = (currentLane + 1) as -1 | 0 | 1;
          player.position.x = LANES[player.lane + 1];

          // Haptic + audio feedback
          hapticFeedback(HAPTIC_PATTERNS.dodge);
          audio.dodge();

          if (player.animation) {
            player.animation.current = 'dodge-right';
            setTimeout(() => {
              if (player.animation) player.animation.current = 'walk';
            }, 300);
          }
        } else if (deltaX < 0 && currentLane > -1) {
          // Swipe left
          player.lane = (currentLane - 1) as -1 | 0 | 1;
          player.position.x = LANES[player.lane + 1];

          // Haptic + audio feedback
          hapticFeedback(HAPTIC_PATTERNS.dodge);
          audio.dodge();

          if (player.animation) {
            player.animation.current = 'dodge-left';
            setTimeout(() => {
              if (player.animation) player.animation.current = 'walk';
            }, 300);
          }
        }
      }

      // Vertical swipe up (jump)
      if (deltaY < -swipeThreshold && Math.abs(deltaY) > Math.abs(deltaX)) {
        // Haptic + audio feedback for jump
        hapticFeedback(HAPTIC_PATTERNS.jump);
        audio.jump();

        if (player.animation) {
          player.animation.current = 'jump';
          setTimeout(() => {
            if (player.animation) player.animation.current = 'walk';
          }, 400);
        }
      }
    }

    function handleTouchStart(e: TouchEvent) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
    function handleTouchEnd(e: TouchEvent) {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      applySwipe(endX - startX, endY - startY);
    }

    // Pointer (unified) events for broader device support (mouse, pen)
    function handlePointerDown(e: PointerEvent) {
      startX = e.clientX;
      startY = e.clientY;
    }
    function handlePointerUp(e: PointerEvent) {
      const endX = e.clientX;
      const endY = e.clientY;
      applySwipe(endX - startX, endY - startY);
    }

    // Mouse fallback for environments without touch/pointer events
    function handleMouseDown(e: MouseEvent) {
      startX = e.clientX;
      startY = e.clientY;
    }
    function handleMouseUp(e: MouseEvent) {
      const endX = e.clientX;
      const endY = e.clientY;
      applySwipe(endX - startX, endY - startY);
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, {
      passive: true,
    });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [status]);

  return null;
}
