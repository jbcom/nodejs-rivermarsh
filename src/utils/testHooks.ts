/**
 * Test Hooks for E2E Testing
 *
 * Exposes game state to the window object for Playwright to access.
 * Only active in development/test builds.
 */

import type * as THREE from 'three';
import { useEngineStore, useRPGStore } from '@/stores';

declare global {
    interface Window {
        __ENGINE_STORE__: typeof useEngineStore;
        __RPG_STORE__: typeof useRPGStore;
        __PLAYER_REF__: THREE.Object3D | null;
        __GAME_READY__: boolean;
        __JS_ERRORS__: string[];
    }
}

/**
 * Initialize test hooks
 * Call this once when the game initializes
 */
export function initTestHooks() {
    if (typeof window === 'undefined') {
        return;
    }

    // Expose Zustand stores
    window.__ENGINE_STORE__ = useEngineStore;
    window.__RPG_STORE__ = useRPGStore;

    // Initialize player ref (will be set by Player component)
    window.__PLAYER_REF__ = null;

    // Game ready flag
    window.__GAME_READY__ = false;

    // Capture JavaScript errors
    window.__JS_ERRORS__ = [];
    window.addEventListener('error', (e) => {
        window.__JS_ERRORS__.push(e.message);
    });
    window.addEventListener('unhandledrejection', (e) => {
        window.__JS_ERRORS__.push(e.reason?.message || String(e.reason));
    });
}

/**
 * Set the player reference for position tracking
 */
export function setPlayerRef(ref: THREE.Object3D | null) {
    if (typeof window !== 'undefined') {
        window.__PLAYER_REF__ = ref;
    }
}

/**
 * Mark game as ready for testing
 */
export function setGameReady(ready: boolean) {
    if (typeof window !== 'undefined') {
        window.__GAME_READY__ = ready;
    }
}
