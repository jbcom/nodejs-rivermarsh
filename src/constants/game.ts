/**
 * Game Constants - Rivermarsh
 *
 * Unified configuration for all game mechanics.
 * Ported from Rivers of Reckoning and optimized for Rivermarsh.
 */

// =============================================================================
// PLAYER CONSTANTS
// =============================================================================

export const PLAYER = {
    // Stats
    INITIAL_HEALTH: 100,
    INITIAL_STAMINA: 100,
    HEALTH_PER_LEVEL: 10,
    DAMAGE_PER_LEVEL: 2,
    BASE_DAMAGE: 10,
} as const;

// =============================================================================
// PROGRESSION CONSTANTS
// =============================================================================

export const LEVELING = {
    BASE_XP_REQUIRED: 100,
    XP_MULTIPLIER: 1.5, // Exponential growth
    MAX_LEVEL: 50, // Soft cap to prevent extreme grind
    PREY_XP: 20,
    PREDATOR_XP: 50,
    BOSS_XP: 500,
} as const;

// =============================================================================
// TIME CONSTANTS
// =============================================================================

export const TIME = {
    // Day phases (hours)
    DAWN_START: 5,
    DAWN_END: 7,
    DAY_END: 18,
    DUSK_END: 20,

    // Time progression
    TIME_SCALE: 60.0, // Game seconds per real second (1 real hour = 1 real minute)
    STARTING_HOUR: 8.0,
} as const;

// =============================================================================
// WEATHER CONSTANTS
// =============================================================================

export const WEATHER = {
    // Duration (minutes)
    MIN_DURATION: 5,
    MAX_ADDITIONAL_DURATION: 15,

    // Probabilities (weights for random selection)
    CLEAR_WEIGHT: 0.5,
    RAIN_WEIGHT: 0.2,
    FOG_WEIGHT: 0.15,
    SNOW_WEIGHT: 0.1,
    STORM_WEIGHT: 0.05,
} as const;

// =============================================================================
// LIGHTING CONSTANTS (New for Strata integration)
// =============================================================================

export const LIGHTING = {
    SUN_INTENSITY: {
        dawn: 0.6,
        day: 1.2,
        dusk: 0.8,
        night: 0.1,
    },
    AMBIENT_INTENSITY: {
        dawn: 0.5,
        day: 0.8,
        dusk: 0.5,
        night: 0.2,
    },
    FOG_DENSITY: {
        dawn: 0.04,
        day: 0.02,
        dusk: 0.03,
        night: 0.015,
    },
} as const;
