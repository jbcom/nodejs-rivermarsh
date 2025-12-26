import { World } from 'miniplex';
import { LIGHTING, TIME } from '@/constants/game';
import type { Entity } from './components';

// Create the global world instance
export const world = new World<Entity>();

// Create the singleton world entity for global state (Time, Weather, Biome)
export const globalEntity = world.add({
    isWorld: true,
    time: {
        hour: TIME.STARTING_HOUR,
        phase: 'day',
        dayCount: 1,
        sunIntensity: LIGHTING.SUN_INTENSITY.day,
        sunAngle: ((TIME.STARTING_HOUR - 6) / 12) * 180,
        ambientLight: LIGHTING.AMBIENT_INTENSITY.day,
        fogDensity: LIGHTING.FOG_DENSITY.day,
        timeScale: TIME.TIME_SCALE,
    },
    weather: {
        current: 'clear',
        intensity: 0,
        transitionProgress: 0,
        nextWeather: null,
        windSpeed: 2,
        windDirection: [1, 0],
        visibilityMod: 1.0,
        fogDensity: 0,
        startTime: Date.now(),
        durationMinutes: 60,
    },
    biome: {
        current: 'marsh',
        transitionProgress: 0,
    },
    difficulty: {
        level: 'normal',
        spawnRateMultiplier: 1.0,
        damageMultiplier: 1.0,
        healthMultiplier: 1.0,
        experienceMultiplier: 1.0,
    },
    worldEvents: {
        activeEvents: [],
        nextEventTime: Date.now() + 300000, // 5 minutes
        eventDuration: 120000, // 2 minutes
        lastEventTime: Date.now(),
    },
});

// Helper to get the global entity (if we need to access it safely, though export is fine)
export const getGlobalState = () => globalEntity;
