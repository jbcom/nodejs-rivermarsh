export class ObjectPool<T> {
  private available: T[] = [];
  private inUse = new Set<T>();
  private factory: () => T;
  private reset: (obj: T) => void;

  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    initialSize: number = 10
  ) {
    this.factory = factory;
    this.reset = reset;

    for (let i = 0; i < initialSize; i++) {
      this.available.push(factory());
    }
  }

  acquire(): T {
    let obj = this.available.pop();

    if (!obj) {
      obj = this.factory();
    }

    this.inUse.add(obj);
    return obj;
  }

  release(obj: T): void {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.reset(obj);
      this.available.push(obj);
    }
  }

  releaseAll(): void {
    for (const obj of this.inUse) {
      this.reset(obj);
      this.available.push(obj);
    }
    this.inUse.clear();
  }

  get size(): number {
    return this.available.length + this.inUse.size;
  }

  get activeCount(): number {
    return this.inUse.size;
  }
}

export class BatchRenderer<T = unknown> {
  private batches: Map<string, T[]> = new Map();

  add(key: string, item: T): void {
    if (!this.batches.has(key)) {
      this.batches.set(key, []);
    }
    this.batches.get(key)!.push(item);
  }

  get(key: string): T[] {
    return this.batches.get(key) || [];
  }

  clear(): void {
    this.batches.clear();
  }

  forEach(callback: (key: string, items: T[]) => void): void {
    for (const [key, items] of this.batches) {
      callback(key, items);
    }
  }
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export class FrameRateController {
  private interval: number;
  private lastTime: number = 0;
  private accumulator: number = 0;

  constructor(targetFPS: number = 60) {
    this.interval = 1000 / targetFPS;
  }

  shouldUpdate(currentTime: number): boolean {
    const delta = currentTime - this.lastTime;
    this.accumulator += delta;

    if (this.accumulator >= this.interval) {
      this.lastTime = currentTime;
      this.accumulator -= this.interval;
      return true;
    }

    return false;
  }

  reset(): void {
    this.lastTime = 0;
    this.accumulator = 0;
  }
}

export function createMemoizedGetter<T>(
  getter: () => T,
  ttl: number = 1000
): () => T {
  let cachedValue: T | null = null;
  let lastUpdate = 0;

  return () => {
    const now = Date.now();
    if (cachedValue === null || now - lastUpdate > ttl) {
      cachedValue = getter();
      lastUpdate = now;
    }
    return cachedValue;
  };
}

export interface QuadTreeEntity {
  position: { x: number; y: number };
  collider: { width: number; height: number };
}

export class QuadTree<T extends QuadTreeEntity = QuadTreeEntity> {
  private maxObjects: number = 10;
  private maxLevels: number = 5;
  private level: number;
  private bounds: { x: number; y: number; width: number; height: number };
  private objects: T[] = [];
  private nodes: QuadTree<T>[] = [];

  constructor(
    level: number,
    bounds: { x: number; y: number; width: number; height: number }
  ) {
    this.level = level;
    this.bounds = bounds;
  }

  clear(): void {
    this.objects = [];
    for (const node of this.nodes) {
      node.clear();
    }
    this.nodes = [];
  }

  split(): void {
    const subWidth = this.bounds.width / 2;
    const subHeight = this.bounds.height / 2;
    const x = this.bounds.x;
    const y = this.bounds.y;

    this.nodes[0] = new QuadTree<T>(this.level + 1, {
      x: x + subWidth,
      y: y,
      width: subWidth,
      height: subHeight,
    });

    this.nodes[1] = new QuadTree<T>(this.level + 1, {
      x: x,
      y: y,
      width: subWidth,
      height: subHeight,
    });

    this.nodes[2] = new QuadTree<T>(this.level + 1, {
      x: x,
      y: y + subHeight,
      width: subWidth,
      height: subHeight,
    });

    this.nodes[3] = new QuadTree<T>(this.level + 1, {
      x: x + subWidth,
      y: y + subHeight,
      width: subWidth,
      height: subHeight,
    });
  }

  getIndex(entity: T): number {
    let index = -1;
    const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
    const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

    const topQuadrant =
      entity.position.y < horizontalMidpoint &&
      entity.position.y + entity.collider.height < horizontalMidpoint;
    const bottomQuadrant = entity.position.y > horizontalMidpoint;

    if (
      entity.position.x < verticalMidpoint &&
      entity.position.x + entity.collider.width < verticalMidpoint
    ) {
      if (topQuadrant) {
        index = 1;
      } else if (bottomQuadrant) {
        index = 2;
      }
    } else if (entity.position.x > verticalMidpoint) {
      if (topQuadrant) {
        index = 0;
      } else if (bottomQuadrant) {
        index = 3;
      }
    }

    return index;
  }

  insert(entity: T): void {
    if (this.nodes.length > 0) {
      const index = this.getIndex(entity);

      if (index !== -1) {
        this.nodes[index].insert(entity);
        return;
      }
    }

    this.objects.push(entity);

    if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
      if (this.nodes.length === 0) {
        this.split();
      }

      let i = 0;
      while (i < this.objects.length) {
        const index = this.getIndex(this.objects[i]);
        if (index !== -1) {
          this.nodes[index].insert(this.objects.splice(i, 1)[0]);
        } else {
          i++;
        }
      }
    }
  }

  retrieve(entity: T): T[] {
    const index = this.getIndex(entity);
    let returnObjects = [...this.objects];

    if (this.nodes.length > 0) {
      if (index !== -1) {
        returnObjects = returnObjects.concat(
          this.nodes[index].retrieve(entity)
        );
      } else {
        for (const node of this.nodes) {
          returnObjects = returnObjects.concat(node.retrieve(entity));
        }
      }
    }

    return returnObjects;
  }
}

export function measurePerformance(name: string, fn: () => void): number {
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;

  if (duration > 16) {
    console.warn(
      `⚠️ ${name} took ${duration.toFixed(2)}ms (> 16ms frame budget)`
    );
  }

  return duration;
}

export class PerformanceTracker {
  private samples: Map<string, number[]> = new Map();
  private maxSamples: number = 60;

  record(name: string, duration: number): void {
    if (!this.samples.has(name)) {
      this.samples.set(name, []);
    }

    const samples = this.samples.get(name)!;
    samples.push(duration);

    if (samples.length > this.maxSamples) {
      samples.shift();
    }
  }

  getAverage(name: string): number {
    const samples = this.samples.get(name);
    if (!samples || samples.length === 0) return 0;

    const sum = samples.reduce((a, b) => a + b, 0);
    return sum / samples.length;
  }

  getMax(name: string): number {
    const samples = this.samples.get(name);
    if (!samples || samples.length === 0) return 0;
    return Math.max(...samples);
  }

  getStats(name: string) {
    return {
      average: this.getAverage(name),
      max: this.getMax(name),
      samples: this.samples.get(name)?.length || 0,
    };
  }

  clear(): void {
    this.samples.clear();
  }
}
