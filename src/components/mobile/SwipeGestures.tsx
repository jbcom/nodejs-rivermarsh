import { useEffect } from 'react';
import { useControlsStore } from '@/stores/useControlsStore';
import { useMobileConstraints, hapticFeedback, HAPTIC_PATTERNS } from '@/hooks/useMobileConstraints';

export function SwipeGestures() {
  const { setAction, setMovement, resetMovement } = useControlsStore();
  const constraints = useMobileConstraints();

  useEffect(() => {
    if (!constraints.isMobile) return;

    let startX = 0;
    let startY = 0;
    const swipeThreshold = 50;
    const dashDuration = 200; // ms

    const handleTouchStart = (e: TouchEvent) => {
      // Only single touch for swipes
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length !== 1) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (Math.max(absX, absY) > swipeThreshold) {
        if (absY > absX) {
          // Vertical swipe
          if (deltaY < 0) {
            // Swipe Up: Jump
            setAction('jump', true);
            hapticFeedback(HAPTIC_PATTERNS.jump);
            setTimeout(() => setAction('jump', false), 100);
          }
        } else {
          // Horizontal swipe: Dash
          const direction = deltaX > 0 ? 1 : -1;
          setAction('dash', true);
          setMovement(direction, 0); // Burst in horizontal direction
          hapticFeedback(HAPTIC_PATTERNS.dodge);
          
          setTimeout(() => {
            setAction('dash', false);
            resetMovement();
          }, dashDuration);
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [constraints.isMobile, setAction, setMovement, resetMovement]);

  return null;
}
