/**
 * Environmental Audio - Weather and environment sound effects
 *
 * Synthesizes rain, wind, thunder and other environmental sounds
 * using Web Audio API.
 */

interface EnvironmentalAudioState {
    initialized: boolean;
    context: AudioContext | null;
    masterGain: GainNode | null;
    rainNode: AudioBufferSourceNode | null;
    windNode: OscillatorNode | null;
    rainGain: GainNode | null;
    windGain: GainNode | null;
}

const state: EnvironmentalAudioState = {
    initialized: false,
    context: null,
    masterGain: null,
    rainNode: null,
    windNode: null,
    rainGain: null,
    windGain: null,
};

/**
 * Initialize environmental audio system
 */
export async function initEnvironmentalAudio(): Promise<void> {
    if (state.initialized) {
        return;
    }

    try {
        state.context = new AudioContext();
        state.masterGain = state.context.createGain();
        state.masterGain.gain.value = 0.3;
        state.masterGain.connect(state.context.destination);

        // Create gain nodes for rain and wind
        state.rainGain = state.context.createGain();
        state.rainGain.gain.value = 0;
        state.rainGain.connect(state.masterGain);

        state.windGain = state.context.createGain();
        state.windGain.gain.value = 0;
        state.windGain.connect(state.masterGain);

        state.initialized = true;
    } catch (error) {
        console.warn('Environmental audio initialization failed:', error);
    }
}

/**
 * Dispose environmental audio resources
 */
export function disposeEnvironmentalAudio(): void {
    stopRain();
    stopWind();

    if (state.context) {
        state.context.close();
        state.context = null;
    }

    state.masterGain = null;
    state.rainGain = null;
    state.windGain = null;
    state.initialized = false;
}

/**
 * Get environmental audio controller
 */
export function getEnvironmentalAudio(): EnvironmentalAudioController | null {
    if (!state.initialized || !state.context) {
        return null;
    }
    return controller;
}

/**
 * Start rain sound with given intensity
 */
function startRain(intensity: number): void {
    if (!state.context || !state.rainGain) {
        return;
    }

    // Create noise for rain
    if (!state.rainNode) {
        const bufferSize = 2 * state.context.sampleRate;
        const buffer = state.context.createBuffer(1, bufferSize, state.context.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate pink noise for rain
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
        }

        state.rainNode = state.context.createBufferSource();
        state.rainNode.buffer = buffer;
        state.rainNode.loop = true;
        state.rainNode.connect(state.rainGain);
        state.rainNode.start();
    }

    state.rainGain.gain.setTargetAtTime(intensity * 0.4, state.context.currentTime, 0.5);
}

/**
 * Stop rain sound
 */
function stopRain(): void {
    if (state.rainNode) {
        try {
            state.rainNode.stop();
        } catch {
            /* ignore */
        }
        state.rainNode = null;
    }
    if (state.rainGain && state.context) {
        state.rainGain.gain.setTargetAtTime(0, state.context.currentTime, 0.5);
    }
}

/**
 * Start wind sound with given intensity
 */
function startWind(intensity: number): void {
    if (!state.context || !state.windGain) {
        return;
    }

    if (!state.windNode) {
        state.windNode = state.context.createOscillator();
        state.windNode.type = 'sine';
        state.windNode.frequency.value = 80 + Math.random() * 40;

        // Add filter for more natural wind sound
        const filter = state.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;

        state.windNode.connect(filter);
        filter.connect(state.windGain);
        state.windNode.start();
    }

    state.windGain.gain.setTargetAtTime(intensity * 0.2, state.context.currentTime, 0.5);
}

/**
 * Stop wind sound
 */
function stopWind(): void {
    if (state.windNode) {
        try {
            state.windNode.stop();
        } catch {
            /* ignore */
        }
        state.windNode = null;
    }
    if (state.windGain && state.context) {
        state.windGain.gain.setTargetAtTime(0, state.context.currentTime, 0.5);
    }
}

/**
 * Play thunder sound
 */
function playThunder(): void {
    if (!state.context || !state.masterGain) {
        return;
    }

    const osc = state.context.createOscillator();
    const gain = state.context.createGain();

    osc.type = 'sine';
    osc.frequency.value = 40 + Math.random() * 20;

    gain.gain.value = 0.6;
    gain.gain.exponentialRampToValueAtTime(0.01, state.context.currentTime + 2);

    osc.connect(gain);
    gain.connect(state.masterGain);

    osc.start();
    osc.stop(state.context.currentTime + 2);
}

const controller = {
    startRain,
    stopRain,
    startWind,
    stopWind,
    playThunder,
};

export type EnvironmentalAudioController = typeof controller;
