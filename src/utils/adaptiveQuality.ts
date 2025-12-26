/**
 * Adaptive Quality Manager
 *
 * Dynamically adjusts rendering quality based on frame rate
 * to maintain smooth gameplay on various devices.
 */

export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

interface QualitySettings {
    // Rendering
    shadowMapSize: number;
    shadowEnabled: boolean;
    antialias: boolean;
    pixelRatio: number;

    // Vegetation
    grassCount: number;
    treeCount: number;
    rockCount: number;

    // Effects
    enableFog: boolean;
    enableParticles: boolean;
    particleCount: number;
    particleMultiplier: number;

    // Draw distance
    viewDistance: number;
    terrainResolution: number;
}

const QUALITY_PRESETS: Record<QualityLevel, QualitySettings> = {
    low: {
        shadowMapSize: 512,
        shadowEnabled: false,
        antialias: false,
        pixelRatio: 0.75,
        grassCount: 2000,
        treeCount: 100,
        rockCount: 50,
        enableFog: false,
        enableParticles: false,
        particleCount: 20,
        particleMultiplier: 0.25,
        viewDistance: 2,
        terrainResolution: 16,
    },
    medium: {
        shadowMapSize: 1024,
        shadowEnabled: true,
        antialias: false,
        pixelRatio: 1,
        grassCount: 6000,
        treeCount: 300,
        rockCount: 125,
        enableFog: true,
        enableParticles: true,
        particleCount: 40,
        particleMultiplier: 0.5,
        viewDistance: 3,
        terrainResolution: 24,
    },
    high: {
        shadowMapSize: 2048,
        shadowEnabled: true,
        antialias: true,
        pixelRatio: 1,
        grassCount: 12000,
        treeCount: 600,
        rockCount: 250,
        enableFog: true,
        enableParticles: true,
        particleCount: 80,
        particleMultiplier: 0.75,
        viewDistance: 4,
        terrainResolution: 32,
    },
    ultra: {
        shadowMapSize: 4096,
        shadowEnabled: true,
        antialias: true,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        grassCount: 20000,
        treeCount: 1000,
        rockCount: 400,
        enableFog: true,
        enableParticles: true,
        particleCount: 150,
        particleMultiplier: 1.0,
        viewDistance: 5,
        terrainResolution: 48,
    },
};

interface AdaptiveQualityState {
    currentLevel: QualityLevel;
    targetLevel: QualityLevel;
    frameHistory: number[];
    lastAdjustTime: number;
    listeners: Set<(settings: QualitySettings) => void>;
    settings: QualitySettings;
}

const state: AdaptiveQualityState = {
    currentLevel: 'medium',
    targetLevel: 'medium',
    frameHistory: [],
    lastAdjustTime: 0,
    listeners: new Set(),
    settings: { ...QUALITY_PRESETS.medium },
};

const FPS_HISTORY_SIZE = 60;
const ADJUST_COOLDOWN_MS = 3000;
const FPS_LOW_THRESHOLD = 25;
const FPS_HIGH_THRESHOLD = 55;

/**
 * Initialize adaptive quality with a starting level
 */
export function initAdaptiveQuality(initialLevel: QualityLevel = 'medium'): void {
    state.currentLevel = initialLevel;
    state.targetLevel = initialLevel;
    state.settings = { ...QUALITY_PRESETS[initialLevel] };
    state.frameHistory = [];
    state.lastAdjustTime = Date.now();
}

/**
 * Get current quality settings
 */
export function getQualitySettings(): QualitySettings {
    return { ...state.settings };
}

/**
 * Get current quality level
 */
export function getQualityLevel(): QualityLevel {
    return state.currentLevel;
}

/**
 * Manually set quality level
 */
export function setQualityLevel(level: QualityLevel): void {
    state.currentLevel = level;
    state.targetLevel = level;
    state.settings = { ...QUALITY_PRESETS[level] };
    notifyListeners();
}

/**
 * Subscribe to quality changes
 */
export function onQualityChange(callback: (settings: QualitySettings) => void): () => void {
    state.listeners.add(callback);
    return () => state.listeners.delete(callback);
}

/**
 * Notify all listeners of quality change
 */
function notifyListeners(): void {
    state.listeners.forEach((cb) => cb(state.settings));
}

/**
 * Update adaptive quality based on current FPS
 * Call this every frame with the delta time
 */
export function updateAdaptiveQuality(deltaMs: number): void {
    const fps = 1000 / Math.max(deltaMs, 1);
    state.frameHistory.push(fps);

    if (state.frameHistory.length > FPS_HISTORY_SIZE) {
        state.frameHistory.shift();
    }

    // Only adjust after cooldown
    const now = Date.now();
    if (now - state.lastAdjustTime < ADJUST_COOLDOWN_MS) {
        return;
    }

    if (state.frameHistory.length < FPS_HISTORY_SIZE / 2) {
        return;
    }

    // Calculate average FPS
    const avgFps = state.frameHistory.reduce((a, b) => a + b, 0) / state.frameHistory.length;

    const levels: QualityLevel[] = ['low', 'medium', 'high', 'ultra'];
    const currentIndex = levels.indexOf(state.currentLevel);

    if (avgFps < FPS_LOW_THRESHOLD && currentIndex > 0) {
        // Decrease quality
        state.targetLevel = levels[currentIndex - 1];
        applyQualityChange();
    } else if (avgFps > FPS_HIGH_THRESHOLD && currentIndex < levels.length - 1) {
        // Increase quality
        state.targetLevel = levels[currentIndex + 1];
        applyQualityChange();
    }
}

// Track if quality changed since last check
let qualityChangedFlag = false;

/**
 * Apply pending quality change
 */
function applyQualityChange(): void {
    if (state.currentLevel === state.targetLevel) {
        return;
    }

    state.currentLevel = state.targetLevel;
    state.settings = { ...QUALITY_PRESETS[state.currentLevel] };
    state.lastAdjustTime = Date.now();
    state.frameHistory = [];
    qualityChangedFlag = true;

    console.log(`[AdaptiveQuality] Switched to ${state.currentLevel} quality`);
    notifyListeners();
}

/**
 * Get available quality levels
 */
export function getQualityLevels(): QualityLevel[] {
    return ['low', 'medium', 'high', 'ultra'];
}

/**
 * Get quality preset for a level
 */
export function getQualityPreset(level: QualityLevel): QualitySettings {
    return { ...QUALITY_PRESETS[level] };
}

// Manager interface expected by GameSystems.tsx and tests
const adaptiveQualityManager = {
    recordFrameTime(frameTimeMs: number): void {
        updateAdaptiveQuality(frameTimeMs);
    },
    updateQuality(): boolean {
        const changed = qualityChangedFlag;
        qualityChangedFlag = false;
        return changed;
    },
    getSettings(): QualitySettings {
        return getQualitySettings();
    },
    getLevel(): QualityLevel {
        return getQualityLevel();
    },
    setLevel(level: QualityLevel): void {
        setQualityLevel(level);
    },
    reset(): void {
        initAdaptiveQuality('medium');
        qualityChangedFlag = false;
    },
};

/**
 * Get the adaptive quality manager instance
 */
export function getAdaptiveQualityManager(): typeof adaptiveQualityManager {
    return adaptiveQualityManager;
}
