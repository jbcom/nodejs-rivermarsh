/**
 * Biome Ambience - Ambient soundscapes per biome
 * 
 * Uses Web Audio API to synthesize ambient sounds for each biome.
 */

type BiomeType = 'marsh' | 'forest' | 'desert' | 'tundra' | 'savanna' | 'mountain' | 'scrubland'

interface BiomeAmbienceState {
    initialized: boolean
    context: AudioContext | null
    oscillators: Map<BiomeType, OscillatorNode[]>
    gains: Map<BiomeType, GainNode>
    masterGain: GainNode | null
}

const state: BiomeAmbienceState = {
    initialized: false,
    context: null,
    oscillators: new Map(),
    gains: new Map(),
    masterGain: null,
}

// Biome sound configurations (frequencies and types for ambient synthesis)
const BIOME_CONFIGS: Record<BiomeType, { frequencies: number[]; types: OscillatorType[] }> = {
    marsh: { frequencies: [120, 180, 240], types: ['sine', 'triangle', 'sine'] },
    forest: { frequencies: [200, 300, 400], types: ['sine', 'sine', 'triangle'] },
    desert: { frequencies: [80, 160], types: ['sine', 'sine'] },
    tundra: { frequencies: [100, 150, 200], types: ['sine', 'triangle', 'sine'] },
    savanna: { frequencies: [150, 220, 330], types: ['sine', 'sine', 'triangle'] },
    mountain: { frequencies: [60, 120, 180], types: ['sine', 'triangle', 'sine'] },
    scrubland: { frequencies: [140, 210, 280], types: ['sine', 'sine', 'sine'] },
}

/**
 * Initialize the biome ambience system
 */
export async function initBiomeAmbience(): Promise<void> {
    if (state.initialized) return
    
    try {
        state.context = new AudioContext()
        state.masterGain = state.context.createGain()
        state.masterGain.gain.value = 0.1
        state.masterGain.connect(state.context.destination)
        
        // Create oscillators and gains for each biome
        const biomes: BiomeType[] = ['marsh', 'forest', 'desert', 'tundra', 'savanna', 'mountain', 'scrubland']
        
        for (const biome of biomes) {
            const config = BIOME_CONFIGS[biome]
            const biomeGain = state.context.createGain()
            biomeGain.gain.value = 0
            if (state.masterGain) {
                biomeGain.connect(state.masterGain)
            }
            state.gains.set(biome, biomeGain)
            
            const oscillators: OscillatorNode[] = []
            config.frequencies.forEach((freq, i) => {
                if (!state.context) return
                const osc = state.context.createOscillator()
                osc.type = config.types[i] || 'sine'
                osc.frequency.value = freq
                osc.connect(biomeGain)
                osc.start()
                oscillators.push(osc)
            })
            state.oscillators.set(biome, oscillators)
        }
        
        state.initialized = true
    } catch (error) {
        console.warn('Biome ambience initialization failed:', error)
    }
}

/**
 * Dispose biome ambience resources
 */
export function disposeBiomeAmbience(): void {
    state.oscillators.forEach((oscs) => {
        oscs.forEach((osc) => {
            try { osc.stop() } catch { /* ignore */ }
        })
    })
    state.oscillators.clear()
    state.gains.clear()
    
    if (state.context) {
        state.context.close()
        state.context = null
    }
    
    state.masterGain = null
    state.initialized = false
}

/**
 * Get the biome ambience controller
 */
export function getBiomeAmbience(): BiomeAmbienceController | null {
    if (!state.initialized || !state.context) return null
    return controller
}

/**
 * Set volume for a specific biome
 */
function setVolume(biome: BiomeType, volume: number): void {
    const gain = state.gains.get(biome)
    if (gain && state.context) {
        gain.gain.setTargetAtTime(volume * 0.3, state.context.currentTime, 0.5)
    }
}

/**
 * Get current volume for a biome
 */
function getVolume(biome: BiomeType): number {
    const gain = state.gains.get(biome)
    return gain?.gain.value || 0
}

const controller = {
    setVolume,
    getVolume,
}

export type BiomeAmbienceController = typeof controller
