/**
 * Performance utilities for map operations
 * Implements Requirements: 3.2 - Performance optimization during map interactions
 */

/**
 * Debounce function to limit the frequency of function calls
 * Useful for optimizing label updates during rapid map interactions
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * Throttle function to limit function execution to at most once per specified interval
 * Useful for optimizing performance during continuous map interactions
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Performance monitoring utility for tracking operation durations
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  private measurements: Map<string, number[]> = new Map();

  /**
   * Start timing an operation
   */
  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  /**
   * End timing an operation and record the duration
   */
  measure(name: string): number {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`Performance mark '${name}' not found`);
      return 0;
    }

    const duration = performance.now() - startTime;
    
    // Store measurement
    const measurements = this.measurements.get(name) || [];
    measurements.push(duration);
    this.measurements.set(name, measurements);
    
    // Clean up mark
    this.marks.delete(name);
    
    return duration;
  }

  /**
   * Get performance statistics for an operation
   */
  getStats(name: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    total: number;
  } | null {
    const measurements = this.measurements.get(name);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const total = measurements.reduce((sum, duration) => sum + duration, 0);
    const average = total / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return {
      count: measurements.length,
      average,
      min,
      max,
      total
    };
  }

  /**
   * Clear all measurements for an operation
   */
  clear(name?: string): void {
    if (name) {
      this.measurements.delete(name);
      this.marks.delete(name);
    } else {
      this.measurements.clear();
      this.marks.clear();
    }
  }

  /**
   * Get all performance statistics
   */
  getAllStats(): Record<string, ReturnType<PerformanceMonitor['getStats']>> {
    const stats: Record<string, ReturnType<PerformanceMonitor['getStats']>> = {};
    
    this.measurements.forEach((_, name) => {
      stats[name] = this.getStats(name);
    });
    
    return stats;
  }
}

/**
 * Memory usage monitoring utility
 */
export class MemoryMonitor {
  private snapshots: Array<{
    timestamp: number;
    usage: NodeJS.MemoryUsage;
    label?: string;
  }> = [];

  /**
   * Take a memory usage snapshot
   */
  snapshot(label?: string): NodeJS.MemoryUsage {
    const usage = process.memoryUsage();
    
    this.snapshots.push({
      timestamp: Date.now(),
      usage,
      label
    });

    return usage;
  }

  /**
   * Get memory usage difference between two snapshots
   */
  getDifference(fromIndex: number, toIndex: number): {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  } {
    if (fromIndex >= this.snapshots.length || toIndex >= this.snapshots.length) {
      throw new Error('Invalid snapshot indices');
    }

    const from = this.snapshots[fromIndex].usage;
    const to = this.snapshots[toIndex].usage;

    return {
      heapUsed: to.heapUsed - from.heapUsed,
      heapTotal: to.heapTotal - from.heapTotal,
      external: to.external - from.external,
      rss: to.rss - from.rss
    };
  }

  /**
   * Get the latest memory usage snapshot
   */
  getLatest(): typeof this.snapshots[0] | null {
    return this.snapshots.length > 0 ? this.snapshots[this.snapshots.length - 1] : null;
  }

  /**
   * Clear all snapshots
   */
  clear(): void {
    this.snapshots = [];
  }

  /**
   * Get memory usage trend over time
   */
  getTrend(): Array<{
    timestamp: number;
    heapUsedMB: number;
    label?: string;
  }> {
    return this.snapshots.map(snapshot => ({
      timestamp: snapshot.timestamp,
      heapUsedMB: Math.round(snapshot.usage.heapUsed / 1024 / 1024 * 100) / 100,
      label: snapshot.label
    }));
  }
}

/**
 * Batch operation utility for optimizing multiple map operations
 */
export class BatchProcessor<T> {
  private queue: T[] = [];
  private processor: (items: T[]) => void;
  private batchSize: number;
  private timeout: NodeJS.Timeout | null = null;
  private flushDelay: number;

  constructor(
    processor: (items: T[]) => void,
    batchSize: number = 10,
    flushDelay: number = 100
  ) {
    this.processor = processor;
    this.batchSize = batchSize;
    this.flushDelay = flushDelay;
  }

  /**
   * Add an item to the batch queue
   */
  add(item: T): void {
    this.queue.push(item);

    // Process immediately if batch size is reached
    if (this.queue.length >= this.batchSize) {
      this.flush();
      return;
    }

    // Schedule delayed processing
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    
    this.timeout = setTimeout(() => {
      this.flush();
    }, this.flushDelay);
  }

  /**
   * Process all queued items immediately
   */
  flush(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.queue.length === 0) {
      return;
    }

    const items = [...this.queue];
    this.queue = [];
    
    try {
      this.processor(items);
    } catch (error) {
      console.error('Batch processing error:', error);
    }
  }

  /**
   * Get the current queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Clear the queue without processing
   */
  clear(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.queue = [];
  }
}

/**
 * Resource pool for managing expensive objects
 */
export class ResourcePool<T> {
  private available: T[] = [];
  private inUse: Set<T> = new Set();
  private factory: () => T;
  private destroyer?: (item: T) => void;
  private maxSize: number;

  constructor(
    factory: () => T,
    maxSize: number = 10,
    destroyer?: (item: T) => void
  ) {
    this.factory = factory;
    this.maxSize = maxSize;
    this.destroyer = destroyer;
  }

  /**
   * Acquire a resource from the pool
   */
  acquire(): T {
    let resource: T;

    if (this.available.length > 0) {
      resource = this.available.pop()!;
    } else {
      resource = this.factory();
    }

    this.inUse.add(resource);
    return resource;
  }

  /**
   * Release a resource back to the pool
   */
  release(resource: T): void {
    if (!this.inUse.has(resource)) {
      console.warn('Attempting to release resource not in use');
      return;
    }

    this.inUse.delete(resource);

    if (this.available.length < this.maxSize) {
      this.available.push(resource);
    } else if (this.destroyer) {
      this.destroyer(resource);
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    available: number;
    inUse: number;
    total: number;
  } {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size
    };
  }

  /**
   * Clear the pool and destroy all resources
   */
  clear(): void {
    if (this.destroyer) {
      this.available.forEach(this.destroyer);
      this.inUse.forEach(this.destroyer);
    }
    
    this.available = [];
    this.inUse.clear();
  }
}

/**
 * Lazy initialization utility for expensive operations
 */
export class LazyInitializer<T> {
  private value: T | undefined;
  private initializer: () => T;
  private initialized = false;

  constructor(initializer: () => T) {
    this.initializer = initializer;
  }

  /**
   * Get the value, initializing if necessary
   */
  get(): T {
    if (!this.initialized) {
      this.value = this.initializer();
      this.initialized = true;
    }
    return this.value!;
  }

  /**
   * Check if the value has been initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Reset the initializer
   */
  reset(): void {
    this.value = undefined;
    this.initialized = false;
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Global memory monitor instance
 */
export const memoryMonitor = new MemoryMonitor();