export class ObjectPool<T> {
  private pool: T[] = [];
  private active: Set<T> = new Set();
  private factory: () => T;
  private reset: (obj: T) => void;

  constructor(factory: () => T, reset: (obj: T) => void, initialSize = 20) {
    this.factory = factory;
    this.reset = reset;
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  acquire(): T {
    let obj: T;
    if (this.pool.length > 0) {
      obj = this.pool.pop()!;
    } else {
      obj = this.factory();
    }
    this.active.add(obj);
    return obj;
  }

  release(obj: T): void {
    if (this.active.has(obj)) {
      this.active.delete(obj);
      this.reset(obj);
      this.pool.push(obj);
    }
  }

  releaseAll(): void {
    this.active.forEach((obj) => {
      this.reset(obj);
      this.pool.push(obj);
    });
    this.active.clear();
  }

  getActive(): T[] {
    return Array.from(this.active);
  }

  getPoolSize(): number {
    return this.pool.length;
  }

  getActiveCount(): number {
    return this.active.size;
  }
}
