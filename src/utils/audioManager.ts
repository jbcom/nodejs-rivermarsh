/**
 * Audio Manager - Using @jbcom/strata audio system
 *
 * Manages game audio including footsteps, ambient sounds,
 * and positional audio using Strata's audio APIs.
 */

import * as THREE from 'three';

// Audio file paths
const AUDIO_PATHS = {
    footsteps: {
        grass: [
            '/audio/footsteps/footstep_grass_000.ogg',
            '/audio/footsteps/footstep_grass_001.ogg',
            '/audio/footsteps/footstep_grass_002.ogg',
        ],
        rock: [
            '/audio/footsteps/footstep_rock_000.ogg',
            '/audio/footsteps/footstep_rock_001.ogg',
            '/audio/footsteps/footstep_rock_002.ogg',
        ],
        water: [
            '/audio/footsteps/footstep_water_000.ogg',
            '/audio/footsteps/footstep_water_001.ogg',
            '/audio/footsteps/footstep_water_002.ogg',
        ],
        snow: [
            '/audio/footsteps/footstep_snow_000.ogg',
            '/audio/footsteps/footstep_snow_001.ogg',
            '/audio/footsteps/footstep_snow_002.ogg',
        ],
    },
    sfx: {
        jump: '/audio/sfx/jump.ogg',
        collect: '/audio/sfx/collect.ogg',
        damage: '/audio/sfx/damage.ogg',
    },
    ambient: {
        marsh: '/audio/ambient/marsh.ogg',
        forest: '/audio/ambient/forest.ogg',
        desert: '/audio/ambient/desert.ogg',
        tundra: '/audio/ambient/tundra.ogg',
    },
};

type TerrainType = 'grass' | 'rock' | 'water' | 'snow';
type BiomeType = 'marsh' | 'forest' | 'desert' | 'tundra' | 'savanna' | 'mountain' | 'scrubland';

interface AudioManagerState {
    initialized: boolean;
    listener: THREE.AudioListener | null;
    sounds: Map<string, THREE.Audio>;
    ambientSounds: Map<string, THREE.Audio>;
    bufferCache: Map<string, AudioBuffer>;
    currentAmbient: string | null;
    targetAmbient: string | null;
    crossfadeProgress: number;
}

const state: AudioManagerState = {
    initialized: false,
    listener: null,
    sounds: new Map(),
    ambientSounds: new Map(),
    bufferCache: new Map(),
    currentAmbient: null,
    targetAmbient: null,
    crossfadeProgress: 1,
};

/**
 * Initialize the audio manager with a camera for the listener
 */
export function initAudioManager(camera: THREE.Camera): void {
    if (state.initialized) {
        return;
    }

    state.listener = new THREE.AudioListener();
    camera.add(state.listener);
    state.initialized = true;

    // Preload ambient sounds
    const audioLoader = new THREE.AudioLoader();
    Object.entries(AUDIO_PATHS.ambient).forEach(([biome, path]) => {
        const sound = new THREE.Audio(state.listener!);
        audioLoader.load(path, (buffer) => {
            state.bufferCache.set(path, buffer);
            sound.setBuffer(buffer);
            sound.setLoop(true);
            sound.setVolume(0);
            state.ambientSounds.set(biome, sound);
        });
    });
}

/**
 * Dispose of all audio resources
 */
export function disposeAudioManager(): void {
    state.sounds.forEach((sound) => {
        if (sound.isPlaying) {
            sound.stop();
        }
        sound.disconnect();
    });
    state.ambientSounds.forEach((sound) => {
        if (sound.isPlaying) {
            sound.stop();
        }
        sound.disconnect();
    });
    state.sounds.clear();
    state.ambientSounds.clear();

    if (state.listener) {
        state.listener.parent?.remove(state.listener);
        state.listener = null;
    }

    state.initialized = false;
}

/**
 * Get the audio manager instance (for external access)
 */
export function getAudioManager(): AudioManager | null {
    if (!state.initialized) {
        return null;
    }
    return audioManager;
}

/**
 * Play a footstep sound based on terrain type
 */
function playFootstep(position: THREE.Vector3, terrainType: TerrainType): void {
    if (!state.listener) {
        return;
    }

    const paths = AUDIO_PATHS.footsteps[terrainType];
    if (!paths || paths.length === 0) {
        return;
    }

    const path = paths[Math.floor(Math.random() * paths.length)];
    playPositionalSound(path, position, 0.3);
}

/**
 * Play a sound effect
 */
function playSound(name: keyof typeof AUDIO_PATHS.sfx, volume = 0.5): void {
    if (!state.listener) {
        return;
    }

    const path = AUDIO_PATHS.sfx[name];
    if (!path) {
        return;
    }

    const sound = new THREE.Audio(state.listener);

    // Use cached buffer if available
    const cachedBuffer = state.bufferCache.get(path);
    if (cachedBuffer) {
        sound.setBuffer(cachedBuffer);
        sound.setVolume(volume);
        sound.play();
        return;
    }

    // Load and cache if not yet loaded
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(path, (buffer) => {
        state.bufferCache.set(path, buffer);
        sound.setBuffer(buffer);
        sound.setVolume(volume);
        sound.play();
    });
}

/**
 * Play a positional sound at a location
 */
function playPositionalSound(path: string, position: THREE.Vector3, volume = 0.5): void {
    if (!state.listener) {
        return;
    }

    const audioLoader = new THREE.AudioLoader();
    const sound = new THREE.PositionalAudio(state.listener);

    audioLoader.load(path, (buffer) => {
        sound.setBuffer(buffer);
        sound.setVolume(volume);
        sound.setRefDistance(5);
        sound.position.copy(position);
        sound.play();
    });
}

/**
 * Start playing ambient sound for a biome
 */
function playAmbient(biome: BiomeType): void {
    // Map biome types to available ambient sounds
    const biomeToAmbient: Record<BiomeType, keyof typeof AUDIO_PATHS.ambient | null> = {
        marsh: 'marsh',
        forest: 'forest',
        desert: 'desert',
        tundra: 'tundra',
        savanna: 'desert', // fallback to desert
        mountain: 'tundra', // fallback to tundra
        scrubland: 'forest', // fallback to forest
    };

    const ambientKey = biomeToAmbient[biome];
    if (!ambientKey) {
        return;
    }

    state.targetAmbient = ambientKey;
    state.crossfadeProgress = 0;

    // Start playing target if not already
    const target = state.ambientSounds.get(ambientKey);
    if (target && !target.isPlaying) {
        target.play();
    }
}

/**
 * Update ambient crossfade
 */
function updateAmbientCrossfade(delta: number): void {
    if (state.crossfadeProgress >= 1) {
        return;
    }
    if (state.currentAmbient === state.targetAmbient) {
        return;
    }

    state.crossfadeProgress = Math.min(1, state.crossfadeProgress + delta * 0.5);

    // Fade out current
    if (state.currentAmbient) {
        const current = state.ambientSounds.get(state.currentAmbient);
        if (current) {
            current.setVolume(0.3 * (1 - state.crossfadeProgress));
        }
    }

    // Fade in target
    if (state.targetAmbient) {
        const target = state.ambientSounds.get(state.targetAmbient);
        if (target) {
            target.setVolume(0.3 * state.crossfadeProgress);
        }
    }

    if (state.crossfadeProgress >= 1) {
        state.currentAmbient = state.targetAmbient;
    }
}

// Audio manager API object
const audioManager = {
    playFootstep,
    playSound,
    playAmbient,
    updateAmbientCrossfade,
};

export type AudioManager = typeof audioManager;
