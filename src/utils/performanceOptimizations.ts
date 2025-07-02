// Utilitários para otimização de performance
export class PerformanceOptimizer {
  private static debounceTimers = new Map<string, number>();
  private static throttleTimers = new Map<string, number>();

  // Debounce para evitar múltiplas consultas rápidas
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number,
    key?: string
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    return (...args: Parameters<T>): Promise<ReturnType<T>> => {
      return new Promise((resolve, reject) => {
        const debounceKey = key || func.name || 'default';
        
        if (this.debounceTimers.has(debounceKey)) {
          clearTimeout(this.debounceTimers.get(debounceKey)!);
        }

        const timer = setTimeout(async () => {
          try {
            const result = await func(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            this.debounceTimers.delete(debounceKey);
          }
        }, delay) as unknown as number;

        this.debounceTimers.set(debounceKey, timer);
      });
    };
  }

  // Throttle para limitar frequência de execução
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number,
    key?: string
  ): (...args: Parameters<T>) => ReturnType<T> | undefined {
    return (...args: Parameters<T>): ReturnType<T> | undefined => {
      const throttleKey = key || func.name || 'default';
      const now = Date.now();
      const lastCall = this.throttleTimers.get(throttleKey) || 0;

      if (now - lastCall >= limit) {
        this.throttleTimers.set(throttleKey, now);
        return func(...args);
      }
      
      return undefined;
    };
  }

  // Cache com TTL (Time To Live)
  static createTTLCache<T>(defaultTTL: number = 60000) {
    const cache = new Map<string, { data: T; expires: number }>();

    return {
      get(key: string): T | null {
        const entry = cache.get(key);
        if (!entry) return null;
        
        if (Date.now() > entry.expires) {
          cache.delete(key);
          return null;
        }
        
        return entry.data;
      },

      set(key: string, data: T, ttl: number = defaultTTL): void {
        cache.set(key, {
          data,
          expires: Date.now() + ttl
        });
      },

      clear(): void {
        cache.clear();
      },

      size(): number {
        return cache.size;
      }
    };
  }

  // Limpeza de cache expirado
  static cleanupExpiredEntries(cache: Map<string, { timestamp: number }>, maxAge: number): void {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        cache.delete(key);
      }
    }
  }

  // Promise com timeout automático
  static withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback?: T): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => {
          if (fallback !== undefined) {
            return fallback;
          }
          reject(new Error(`Operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      })
    ]);
  }

  // Retry com backoff exponencial
  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }
}

// Cache específico para dados de plano
export const planCache = PerformanceOptimizer.createTTLCache<any>(60000);

// Cache para verificações de permissão
export const permissionCache = PerformanceOptimizer.createTTLCache<boolean>(30000);

// Cache para materiais restantes
export const materialsCache = PerformanceOptimizer.createTTLCache<number>(15000);
