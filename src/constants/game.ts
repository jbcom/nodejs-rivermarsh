/**
 * Game Constants - Rivermarsh
 * 
 * Centralized configuration for all game mechanics.
 * Ported from Rivers of Reckoning and Otter River Rush.
 */

export const PLAYER = {
  // Stats
  INITIAL_HEALTH: 100,
  INITIAL_STAMINA: 100,
  HEALTH_PER_LEVEL: 10,
  DAMAGE_PER_LEVEL: 2,
  BASE_DAMAGE: 10,
} as const;

export const LEVELING = {
  BASE_XP_REQUIRED: 100,
  XP_MULTIPLIER: 1.5, // Exponential growth
  MAX_LEVEL: 50, // Soft cap to prevent extreme grind
  PREY_XP: 20,
  PREDATOR_XP: 50,
  BOSS_XP: 500,
} as const;
