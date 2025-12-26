import { useEffect } from 'react';
import {
    HAPTIC_PATTERNS,
    hapticFeedback,
    useMobileConstraints,
} from '@/hooks/useMobileConstraints';
import { useControlsStore } from '@/stores/controlsStore';

export function SwipeGestures() {
    const { setAction, setMovement, resetMovement } = useControlsStore();
    const constraints = useMobileConstraints();

    useEffect(() => {
        if (!constraints.isMobile) {
            return;
        }

        let startX = 0;
        let startY = 0;
        let startTime = 0;
        const swipeThreshold = 50;
        const swipeTimeThreshold = 300; // ms
        const dashDuration = 200; // ms
        const timeouts = new Set<ReturnType<typeof setTimeout>>();

        const handleTouchStart = (e: TouchEvent) => {
            // Only single touch for swipes (unless we want to support swiping while moving)
            // If we want to support swiping while moving, we need to track multiple touches.
            // For now, let's just make sure we don't start a swipe on the joystick side.
            const touch = e.touches[0];
            if (touch.clientX < window.innerWidth / 2) {
                return;
            }

            startX = touch.clientX;
            startY = touch.clientY;
            startTime = Date.now();
        };

        const handleTouchEnd = (e: TouchEvent) => {
            // Find the touch that ended
            const touch = Array.from(e.changedTouches).find(
                (t) => Math.abs(t.clientX - startX) < 100 && Math.abs(t.clientY - startY) < 100
            );
            if (!touch || !startTime) {
                return;
            }

            const deltaTime = Date.now() - startTime;
            startTime = 0; // Reset
            if (deltaTime > swipeTimeThreshold) {
                return;
            }

            const endX = touch.clientX;
            const endY = touch.clientY;

            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);

            // Check both distance and time threshold to prevent false triggers from joystick movement
            if (Math.max(absX, absY) > swipeThreshold) {
                if (absY > absX) {
                    // Vertical swipe
                    if (deltaY < 0) {
                        // Swipe Up: Jump
                        setAction('jump', true);
                        hapticFeedback(HAPTIC_PATTERNS.jump);
                        const t = setTimeout(() => setAction('jump', false), 100);
                        timeouts.add(t);
                    }
                } else {
                    // Horizontal swipe: Dash
                    const direction = deltaX > 0 ? 1 : -1;

                    setAction('dash', true);
                    setMovement(direction, 0);
                    hapticFeedback(HAPTIC_PATTERNS.dodge);

                    const t = setTimeout(() => {
                        setAction('dash', false);
                        // Only reset if joystick is not active
                        if (!useControlsStore.getState().isJoystickActive) {
                            resetMovement();
                        }
                    }, dashDuration);
                    timeouts.add(t);
                }
            }
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
            timeouts.forEach((t) => clearTimeout(t));
            timeouts.clear();
        };
    }, [constraints.isMobile, setAction, setMovement, resetMovement]);

    return null;
}
