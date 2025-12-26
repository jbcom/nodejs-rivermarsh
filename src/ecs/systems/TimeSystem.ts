import { LIGHTING, TIME } from '@/constants/game';
import type { TimePhase } from '../components';
import { world } from '../world';

function getPhaseFromHour(hour: number): TimePhase {
    const h = hour % 24;
    if (h >= TIME.DAWN_START && h < TIME.DAWN_END) {
        return 'dawn';
    }
    if (h >= TIME.DAWN_END && h < TIME.DAY_END) {
        return 'day';
    }
    if (h >= TIME.DAY_END && h < TIME.DUSK_END) {
        return 'dusk';
    }
    return 'night';
}

/**
 * Linear interpolation between two values
 */
function lerp(start: number, end: number, t: number): number {
    return start * (1 - t) + end * t;
}

/**
 * Smoothly transitions between values based on hour and phase
 */
function calculateTimeValue(
    hour: number,
    phase: TimePhase,
    config: Record<TimePhase, number>
): number {
    const h = hour % 24;

    // Define transition points (1 hour before/after phase changes)
    const transitionDuration = 1.0;

    if (phase === 'dawn') {
        if (h < TIME.DAWN_START + transitionDuration) {
            const t = (h - TIME.DAWN_START) / transitionDuration;
            return lerp(config.night, config.dawn, t);
        }
        return config.dawn;
    }

    if (phase === 'day') {
        if (h < TIME.DAWN_END + transitionDuration) {
            const t = (h - TIME.DAWN_END) / transitionDuration;
            return lerp(config.dawn, config.day, t);
        }
        return config.day;
    }

    if (phase === 'dusk') {
        if (h < TIME.DAY_END + transitionDuration) {
            const t = (h - TIME.DAY_END) / transitionDuration;
            return lerp(config.day, config.dusk, t);
        }
        return config.dusk;
    }

    // Night
    if (h >= TIME.DUSK_END && h < TIME.DUSK_END + transitionDuration) {
        const t = (h - TIME.DUSK_END) / transitionDuration;
        return lerp(config.dusk, config.night, t);
    }

    if (h >= TIME.DAWN_START - transitionDuration && h < TIME.DAWN_START) {
        const t = (h - (TIME.DAWN_START - transitionDuration)) / transitionDuration;
        return lerp(config.night, config.dawn, t);
    }

    return config.night;
}

export function TimeSystem(delta: number) {
    for (const { time } of world.with('time')) {
        // Advance time
        // TIME_SCALE is game seconds per real second
        const gameSecondsPassed = delta * time.timeScale;
        const gameHoursPassed = gameSecondsPassed / 3600;

        const nextHour = time.hour + gameHoursPassed;
        if (nextHour >= 24) {
            time.dayCount += 1;
        }
        time.hour = nextHour % 24;
        time.phase = getPhaseFromHour(time.hour);

        // Update sun properties
        // 6am = 0, 12pm = 90, 6pm = 180 (simplified for ProceduralSky elevation)
        // We'll calculate a continuous angle for smoother sun movement
        const dayProgress = (time.hour - 6) / 12; // 0 at 6am, 1 at 6pm
        time.sunAngle = dayProgress * 180;

        // Intensity and Lighting transitions
        time.sunIntensity = calculateTimeValue(time.hour, time.phase, LIGHTING.SUN_INTENSITY);
        time.ambientLight = calculateTimeValue(time.hour, time.phase, LIGHTING.AMBIENT_INTENSITY);
        time.fogDensity = calculateTimeValue(time.hour, time.phase, LIGHTING.FOG_DENSITY);
    }
}
