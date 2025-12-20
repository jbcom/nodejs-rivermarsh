/**
 * Seeded pseudo-random number generator
 * Uses Mulberry32 algorithm for deterministic random numbers
 */

export class Random {
  private seed: number;

  constructor(seed?: number) {
    this.seed = seed ?? Math.floor(Math.random() * 2147483647);
  }

  /**
   * Get the current seed
   */
  public getSeed(): number {
    return this.seed;
  }

  /**
   * Set a new seed
   */
  public setSeed(seed: number): void {
    this.seed = seed;
  }

  /**
   * Generate next random number [0, 1)
   */
  public next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Random number in range [min, max]
   */
  public range(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Random integer in range [min, max]
   */
  public int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  /**
   * Random boolean with given probability
   */
  public boolean(probability = 0.5): boolean {
    return this.next() < probability;
  }

  /**
   * Choose random item from array
   */
  public choice<T>(array: T[]): T {
    return array[this.int(0, array.length - 1)];
  }

  /**
   * Shuffle array (Fisher-Yates)
   */
  public shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Weighted random choice
   */
  public weightedChoice<T>(items: T[], weights: number[]): T {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = this.next() * totalWeight;

    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }

    return items[items.length - 1];
  }

  /**
   * Random point in circle
   */
  public inCircle(radius: number): { x: number; y: number } {
    const angle = this.range(0, Math.PI * 2);
    const r = Math.sqrt(this.next()) * radius;
    return {
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
    };
  }

  /**
   * Random point on circle
   */
  public onCircle(radius: number): { x: number; y: number } {
    const angle = this.range(0, Math.PI * 2);
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  }

  /**
   * Perlin-like noise (simplified)
   */
  public noise(x: number, y: number = 0): number {
    const seed1 = Math.floor(x);
    const seed2 = Math.floor(y);

    const originalSeed = this.seed;
    this.seed = seed1 * 374761393 + seed2 * 668265263;

    const n1 = this.next();
    this.seed = (seed1 + 1) * 374761393 + seed2 * 668265263;
    const n2 = this.next();
    this.seed = seed1 * 374761393 + (seed2 + 1) * 668265263;
    const n3 = this.next();
    this.seed = (seed1 + 1) * 374761393 + (seed2 + 1) * 668265263;
    const n4 = this.next();

    this.seed = originalSeed;

    const fx = x - seed1;
    const fy = y - seed2;

    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);

    const i1 = n1 * (1 - sx) + n2 * sx;
    const i2 = n3 * (1 - sx) + n4 * sx;

    return i1 * (1 - sy) + i2 * sy;
  }
}
