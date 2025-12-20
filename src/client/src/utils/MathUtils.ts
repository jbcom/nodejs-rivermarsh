/**
 * Mathematical utility functions
 */

import type { Vector2D } from '@/types/Game.types';

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Map a value from one range to another
 */
export function map(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Normalize a value to 0-1 range
 */
export function normalize(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

/**
 * Easing functions
 */
export const easing = {
  linear: (t: number): number => t,

  easeInQuad: (t: number): number => t * t,
  easeOutQuad: (t: number): number => t * (2 - t),
  easeInOutQuad: (t: number): number =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  easeInCubic: (t: number): number => t * t * t,
  easeOutCubic: (t: number): number => --t * t * t + 1,
  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  easeInExpo: (t: number): number => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  easeOutExpo: (t: number): number => (t === 1 ? 1 : -Math.pow(2, -10 * t) + 1),

  easeInElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
        ? 1
        : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },

  easeOutBounce: (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
};

/**
 * Distance between two points
 */
export function distance(a: Vector2D, b: Vector2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Distance squared (faster, no sqrt)
 */
export function distanceSquared(a: Vector2D, b: Vector2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return dx * dx + dy * dy;
}

/**
 * Angle between two points in radians
 */
export function angle(from: Vector2D, to: Vector2D): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

/**
 * Angle in degrees
 */
export function angleDegrees(from: Vector2D, to: Vector2D): number {
  return (angle(from, to) * 180) / Math.PI;
}

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Normalize an angle to 0-2PI
 */
export function normalizeAngle(angle: number): number {
  let normalized = angle % (2 * Math.PI);
  if (normalized < 0) {
    normalized += 2 * Math.PI;
  }
  return normalized;
}

/**
 * Vector operations
 */
export const vec2 = {
  create: (x = 0, y = 0): Vector2D => ({ x, y }),

  add: (a: Vector2D, b: Vector2D): Vector2D => ({
    x: a.x + b.x,
    y: a.y + b.y,
  }),

  subtract: (a: Vector2D, b: Vector2D): Vector2D => ({
    x: a.x - b.x,
    y: a.y - b.y,
  }),

  multiply: (v: Vector2D, scalar: number): Vector2D => ({
    x: v.x * scalar,
    y: v.y * scalar,
  }),

  divide: (v: Vector2D, scalar: number): Vector2D => ({
    x: v.x / scalar,
    y: v.y / scalar,
  }),

  magnitude: (v: Vector2D): number => Math.sqrt(v.x * v.x + v.y * v.y),

  magnitudeSquared: (v: Vector2D): number => v.x * v.x + v.y * v.y,

  normalize: (v: Vector2D): Vector2D => {
    const mag = vec2.magnitude(v);
    return mag > 0 ? vec2.divide(v, mag) : vec2.create(0, 0);
  },

  dot: (a: Vector2D, b: Vector2D): number => a.x * b.x + a.y * b.y,

  lerp: (a: Vector2D, b: Vector2D, t: number): Vector2D => ({
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
  }),

  rotate: (v: Vector2D, angle: number): Vector2D => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: v.x * cos - v.y * sin,
      y: v.x * sin + v.y * cos,
    };
  },
};

/**
 * Random number in range [min, max]
 */
export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Random integer in range [min, max]
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1));
}

/**
 * Choose random item from array
 */
export function randomChoice<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

/**
 * Weighted random choice
 */
export function weightedChoice<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
}

/**
 * Check if value is approximately equal (within epsilon)
 */
export function approximately(a: number, b: number, epsilon = 0.0001): boolean {
  return Math.abs(a - b) < epsilon;
}

/**
 * Smoothstep interpolation
 */
export function smoothstep(min: number, max: number, value: number): number {
  const x = clamp((value - min) / (max - min), 0, 1);
  return x * x * (3 - 2 * x);
}

/**
 * Smootherstep interpolation
 */
export function smootherstep(min: number, max: number, value: number): number {
  const x = clamp((value - min) / (max - min), 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
}
