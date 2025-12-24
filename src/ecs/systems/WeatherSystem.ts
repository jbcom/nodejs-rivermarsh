import { WeatherType } from '../components';
import { world } from '../world';
import { WEATHER } from '@/constants/game';

const WEATHER_CONFIG = {
    clear: {
        intensity: 0,
        visibilityMod: 1.0,
        windSpeedMult: 1.0,
        movementSpeedMult: 1.0,
        fogDensity: 0,
    },
    rain: {
        intensity: 0.7,
        visibilityMod: 0.8,
        windSpeedMult: 1.5,
        movementSpeedMult: 1.0,
        fogDensity: 0.02,
    },
    fog: {
        intensity: 0.5,
        visibilityMod: 0.5,
        windSpeedMult: 0.5,
        movementSpeedMult: 1.0,
        fogDensity: 0.08,
    },
    snow: {
        intensity: 0.6,
        visibilityMod: 0.7,
        windSpeedMult: 1.2,
        movementSpeedMult: 0.85,
        fogDensity: 0.03,
    },
    storm: {
        intensity: 1.0,
        visibilityMod: 0.5,
        windSpeedMult: 4.0,
        movementSpeedMult: 0.9,
        fogDensity: 0.05,
    },
    sandstorm: {
        intensity: 0.9,
        visibilityMod: 0.3,
        windSpeedMult: 5.0,
        movementSpeedMult: 0.8,
        fogDensity: 0.1,
    },
} as const;

const TRANSITION_DURATION = 30; // seconds

function getRandomWeather(): WeatherType {
    const choices: [WeatherType, number][] = [
        ['clear', WEATHER.CLEAR_WEIGHT],
        ['rain', WEATHER.RAIN_WEIGHT],
        ['fog', WEATHER.FOG_WEIGHT],
        ['snow', WEATHER.SNOW_WEIGHT],
        ['storm', WEATHER.STORM_WEIGHT],
    ];

    const total = choices.reduce((sum, [, weight]) => sum + weight, 0);
    const r = Math.random() * total;
    let cumulative = 0;

    for (const [weather, weight] of choices) {
        cumulative += weight;
        if (r <= cumulative) return weather;
    }

    return 'clear';
}

export function WeatherSystem(delta: number) {
    for (const { weather } of world.with('weather')) {
        const now = Date.now();
        const elapsedMinutes = (now - weather.startTime) / 60000;

        // Check if we need to transition to new weather
        if (elapsedMinutes > weather.durationMinutes && !weather.nextWeather) {
            weather.nextWeather = getRandomWeather();
            weather.transitionProgress = 0;
        }

        // Handle weather transition
        if (weather.nextWeather) {
            weather.transitionProgress += delta / TRANSITION_DURATION;

            if (weather.transitionProgress >= 1.0) {
                // Transition complete
                weather.current = weather.nextWeather;
                weather.nextWeather = null;
                weather.transitionProgress = 0;
                weather.startTime = now;
                weather.durationMinutes = WEATHER.MIN_DURATION + Math.random() * WEATHER.MAX_ADDITIONAL_DURATION;
                
                // Apply new weather properties immediately
                const config = WEATHER_CONFIG[weather.current];
                weather.intensity = config.intensity;
                weather.visibilityMod = config.visibilityMod;
                weather.windSpeed = 2 * config.windSpeedMult;
                weather.fogDensity = config.fogDensity;
            } else {
                // Interpolate weather properties during transition
                const currentConfig = WEATHER_CONFIG[weather.current];
                const nextConfig = WEATHER_CONFIG[weather.nextWeather];
                const t = weather.transitionProgress;

                weather.intensity = currentConfig.intensity * (1 - t) + nextConfig.intensity * t;
                weather.visibilityMod = currentConfig.visibilityMod * (1 - t) + nextConfig.visibilityMod * t;
                weather.windSpeed = 2 * (currentConfig.windSpeedMult * (1 - t) + nextConfig.windSpeedMult * t);
                weather.fogDensity = currentConfig.fogDensity * (1 - t) + nextConfig.fogDensity * t;
            }
        } else {
            // Apply current weather properties
            const config = WEATHER_CONFIG[weather.current];
            weather.intensity = config.intensity;
            weather.visibilityMod = config.visibilityMod;
            weather.windSpeed = 2 * config.windSpeedMult;
            weather.fogDensity = config.fogDensity;
        }

        // Clamp visibility to [0, 1]
        weather.visibilityMod = Math.max(0, Math.min(1, weather.visibilityMod));
    }
}

export function getWeatherMovementMultiplier(): number {
    for (const { weather } of world.with('weather')) {
        const config = WEATHER_CONFIG[weather.current];
        return config.movementSpeedMult;
    }
    return 1.0;
}
