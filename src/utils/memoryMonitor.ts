/**
 * Memory Monitor
 *
 * Monitors memory usage and provides warnings/callbacks
 * when memory pressure is detected. Useful for mobile devices.
 */

interface MemoryInfo {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
}

interface MemoryMonitorState {
    initialized: boolean;
    intervalId: ReturnType<typeof setInterval> | null;
    listeners: Set<(info: MemorySnapshot) => void>;
    warningListeners: Set<(level: MemoryWarningLevel) => void>;
    history: MemorySnapshot[];
    lastWarningLevel: MemoryWarningLevel;
}

export interface MemorySnapshot {
    timestamp: number;
    usedMB: number;
    totalMB: number;
    limitMB: number;
    usagePercent: number;
}

export type MemoryWarningLevel = 'normal' | 'warning' | 'critical';

const state: MemoryMonitorState = {
    initialized: false,
    intervalId: null,
    listeners: new Set(),
    warningListeners: new Set(),
    history: [],
    lastWarningLevel: 'normal',
};

const HISTORY_SIZE = 60;
const WARNING_THRESHOLD = 0.7; // 70% heap usage
const CRITICAL_THRESHOLD = 0.9; // 90% heap usage

/**
 * Check if performance.memory is available
 */
function hasMemoryAPI(): boolean {
    return !!(performance as unknown as { memory?: MemoryInfo }).memory;
}

/**
 * Get current memory info
 */
function getMemoryInfo(): MemoryInfo | null {
    if (!hasMemoryAPI()) {
        return null;
    }
    return (performance as unknown as { memory: MemoryInfo }).memory;
}

/**
 * Initialize memory monitoring
 */
export function initMemoryMonitor(pollIntervalMs = 1000): void {
    if (state.initialized) {
        return;
    }

    if (!hasMemoryAPI()) {
        console.warn('[MemoryMonitor] Performance.memory not available');
        state.initialized = true;
        return;
    }

    state.intervalId = setInterval(() => {
        const info = getMemoryInfo();
        if (!info) {
            return;
        }

        const snapshot: MemorySnapshot = {
            timestamp: Date.now(),
            usedMB: info.usedJSHeapSize / (1024 * 1024),
            totalMB: info.totalJSHeapSize / (1024 * 1024),
            limitMB: info.jsHeapSizeLimit / (1024 * 1024),
            usagePercent: info.usedJSHeapSize / info.jsHeapSizeLimit,
        };

        state.history.push(snapshot);
        if (state.history.length > HISTORY_SIZE) {
            state.history.shift();
        }

        // Notify listeners
        state.listeners.forEach((cb) => cb(snapshot));

        // Check for warnings
        checkWarningLevel(snapshot);
    }, pollIntervalMs);

    state.initialized = true;
}

/**
 * Check and emit warning level changes
 */
function checkWarningLevel(snapshot: MemorySnapshot): void {
    let level: MemoryWarningLevel = 'normal';

    if (snapshot.usagePercent >= CRITICAL_THRESHOLD) {
        level = 'critical';
    } else if (snapshot.usagePercent >= WARNING_THRESHOLD) {
        level = 'warning';
    }

    if (level !== state.lastWarningLevel) {
        state.lastWarningLevel = level;
        state.warningListeners.forEach((cb) => cb(level));

        if (level === 'critical') {
            console.warn(
                '[MemoryMonitor] CRITICAL: Memory usage at',
                `${(snapshot.usagePercent * 100).toFixed(1)}%`
            );
        } else if (level === 'warning') {
            console.warn(
                '[MemoryMonitor] WARNING: Memory usage at',
                `${(snapshot.usagePercent * 100).toFixed(1)}%`
            );
        }
    }
}

/**
 * Dispose memory monitor
 */
export function disposeMemoryMonitor(): void {
    if (state.intervalId) {
        clearInterval(state.intervalId);
        state.intervalId = null;
    }
    state.listeners.clear();
    state.warningListeners.clear();
    state.history = [];
    state.initialized = false;
}

/**
 * Get current memory snapshot
 */
export function getCurrentMemory(): MemorySnapshot | null {
    const info = getMemoryInfo();
    if (!info) {
        return null;
    }

    return {
        timestamp: Date.now(),
        usedMB: info.usedJSHeapSize / (1024 * 1024),
        totalMB: info.totalJSHeapSize / (1024 * 1024),
        limitMB: info.jsHeapSizeLimit / (1024 * 1024),
        usagePercent: info.usedJSHeapSize / info.jsHeapSizeLimit,
    };
}

/**
 * Get memory history
 */
export function getMemoryHistory(): MemorySnapshot[] {
    return [...state.history];
}

/**
 * Subscribe to memory updates
 */
export function onMemoryUpdate(callback: (info: MemorySnapshot) => void): () => void {
    state.listeners.add(callback);
    return () => state.listeners.delete(callback);
}

/**
 * Subscribe to warning level changes
 */
export function onMemoryWarning(callback: (level: MemoryWarningLevel) => void): () => void {
    state.warningListeners.add(callback);
    return () => state.warningListeners.delete(callback);
}

/**
 * Get current warning level
 */
export function getWarningLevel(): MemoryWarningLevel {
    return state.lastWarningLevel;
}

/**
 * Force garbage collection (if available)
 * Note: This only works in dev mode with --expose-gc flag
 */
export function forceGC(): boolean {
    const globalWithGC = globalThis as unknown as { gc?: () => void };
    if (typeof globalWithGC.gc === 'function') {
        globalWithGC.gc();
        return true;
    }
    return false;
}

// Monitor interface expected by GameSystems.tsx
const memoryMonitor = {
    checkAndCleanup(): boolean {
        const current = getCurrentMemory();
        if (!current) {
            return false;
        }

        // Trigger cleanup if memory is high
        if (current.usagePercent > CRITICAL_THRESHOLD) {
            return forceGC();
        }
        return false;
    },
    getCurrentUsage(): MemorySnapshot | null {
        return getCurrentMemory();
    },
    getHistory(): MemorySnapshot[] {
        return getMemoryHistory();
    },
    getWarningLevel(): MemoryWarningLevel {
        return state.lastWarningLevel;
    },
};

/**
 * Get the memory monitor instance
 */
export function getMemoryMonitor(): typeof memoryMonitor {
    return memoryMonitor;
}
