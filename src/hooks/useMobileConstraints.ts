/**
 * Mobile-First Constraints Hook
 * Handles orientation, safe areas, foldables, lifecycle
 */

import { useCallback, useEffect, useState } from 'react';

export interface MobileConstraints {
  // Device info
  orientation: 'portrait' | 'landscape';
  isPhone: boolean;
  isTablet: boolean;
  isFoldable: boolean;

  // Safe areas (in pixels)
  safeAreas: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  // Display
  viewportWidth: number;
  viewportHeight: number;
  pixelRatio: number;
  hasNotch: boolean;

  // Capabilities
  hasHaptics: boolean;
  isMobile: boolean;
}

const getSafeAreaInset = (
  side: 'top' | 'bottom' | 'left' | 'right'
): number => {
  if (typeof window === 'undefined') return 0;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(`--safe-area-inset-${side}`)
    .trim();
  return value ? parseFloat(value) : 0;
};

const detectNotch = (): boolean => {
  // Check if safe-area-inset-top is supported and > 0
  const topInset = getSafeAreaInset('top');
  return topInset > 20; // iPhone X+ has ~44px top inset
};

const detectDeviceType = (): { isPhone: boolean; isTablet: boolean } => {
  if (typeof window === 'undefined') return { isPhone: false, isTablet: false };
  const width = window.innerWidth;
  const height = window.innerHeight;
  const minDimension = Math.min(width, height);

  // Tablet: min dimension >= 600px
  const isTablet = minDimension >= 600;
  // Phone: everything else mobile
  const isPhone =
    !isTablet && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  return { isPhone, isTablet };
};

const detectFoldable = (): boolean => {
  // Check for Window Segments API (foldables)
  return typeof window !== 'undefined' && 'getWindowSegments' in window;
};

export function useMobileConstraints(): MobileConstraints {
  const [constraints, setConstraints] = useState<MobileConstraints>(() => {
    const { isPhone, isTablet } = detectDeviceType();
    const orientation =
      typeof window !== 'undefined' && window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';

    return {
      orientation,
      isPhone,
      isTablet,
      isFoldable: detectFoldable(),
      safeAreas: {
        top: getSafeAreaInset('top'),
        bottom: getSafeAreaInset('bottom'),
        left: getSafeAreaInset('left'),
        right: getSafeAreaInset('right'),
      },
      viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
      viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
      pixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1, // Cap at 2x for performance
      hasNotch: detectNotch(),
      hasHaptics: typeof navigator !== 'undefined' && 'vibrate' in navigator,
      isMobile: isPhone || isTablet,
    };
  });

  const updateConstraints = useCallback(() => {
    const { isPhone, isTablet } = detectDeviceType();
    const orientation =
      window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';

    setConstraints({
      orientation,
      isPhone,
      isTablet,
      isFoldable: detectFoldable(),
      safeAreas: {
        top: getSafeAreaInset('top'),
        bottom: getSafeAreaInset('bottom'),
        left: getSafeAreaInset('left'),
        right: getSafeAreaInset('right'),
      },
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      hasNotch: detectNotch(),
      hasHaptics: 'vibrate' in navigator,
      isMobile: isPhone || isTablet,
    });
  }, []);

  // Handle orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      updateConstraints();

      // Lock orientation if supported
      if (screen.orientation && 'lock' in screen.orientation) {
        const { isPhone } = detectDeviceType();
        const lockTo = isPhone ? 'portrait' : 'landscape';
        // Screen orientation lock may fail on unsupported browsers - safe to ignore
        (screen.orientation.lock as (orientation: string) => Promise<void>)(
          lockTo
        ).catch(() => undefined);
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', updateConstraints);

    // Try to lock orientation on mount
    handleOrientationChange();

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', updateConstraints);
    };
  }, [updateConstraints]);

  // Handle app lifecycle
  useEffect(() => {
    // In Rivermarsh, we might not want to pause the game automatically on blur
    // but we can listen for visibility changes if needed.
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App backgrounded
        // useGameStore.getState().setPaused(true); // if paused existed
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return constraints;
}

/**
 * Haptic feedback helper
 */
export function hapticFeedback(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

export const HAPTIC_PATTERNS = {
  jump: 10,
  dodge: [5, 20, 5] as number[],
  collect: 15,
  hit: [50, 50, 50] as number[],
  gameOver: [100, 100, 200] as number[],
};
