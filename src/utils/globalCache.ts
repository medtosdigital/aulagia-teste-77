
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class GlobalCache {
  private cache = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanup();
  }

  set<T>(key: string, data: T, ttl: number = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    console.log(`Cache set: ${key}`);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      console.log(`Cache miss: ${key}`);
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      console.log(`Cache expired: ${key}`);
      return null;
    }

    console.log(`Cache hit: ${key}`);
    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`Cache deleted: ${key}`);
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    console.log('Cache cleared completely');
  }

  clearByPattern(pattern: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    );
    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`Cache cleared for pattern: ${pattern}`);
  }

  private startCleanup(): void {
    // Limpeza automática a cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 300000);
  }

  private cleanup(): void {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`Cache cleanup: ${deletedCount} expired entries removed`);
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const globalCache = new GlobalCache();

// Hook para usar o cache global
export const useGlobalCache = () => {
  return {
    set: globalCache.set.bind(globalCache),
    get: globalCache.get.bind(globalCache),
    has: globalCache.has.bind(globalCache),
    delete: globalCache.delete.bind(globalCache),
    clear: globalCache.clear.bind(globalCache),
    clearByPattern: globalCache.clearByPattern.bind(globalCache),
    getStats: globalCache.getStats.bind(globalCache)
  };
};
