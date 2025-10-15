/**
 * Phase 8 - Track A2: Redis Caching Layer
 * Centralized caching service with TTL strategy
 */

import Redis from 'ioredis';

export interface CacheConfig {
  ttl: number;  // Time to live in seconds
  namespace: string;
}

export class RedisCache {
  private redis: Redis | null;
  private inMemoryCache: Map<string, { value: any; expires: number }>;
  private enabled: boolean;

  constructor(redisUrl?: string) {
    this.inMemoryCache = new Map();
    this.enabled = true;

    if (redisUrl) {
      try {
        this.redis = new Redis(redisUrl);
        this.redis.on('error', (err) => {
          console.error('Redis cache error:', err.message);
          console.warn('Falling back to in-memory cache');
          this.redis = null;
        });
        console.log('✅ Redis cache connected');
      } catch (error) {
        console.warn('Redis unavailable - using in-memory cache');
        this.redis = null;
      }
    } else {
      console.log('📝 Using in-memory cache (Redis URL not configured)');
      this.redis = null;
    }

    // Cleanup expired in-memory entries every 60 seconds
    setInterval(() => this.cleanupInMemory(), 60 * 1000);
  }

  /**
   * Get value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.enabled) return null;

    try {
      if (this.redis && this.redis.status === 'ready') {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        return this.getInMemory(key);
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, ttl: number): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      const serialized = JSON.stringify(value);

      if (this.redis && this.redis.status === 'ready') {
        await this.redis.set(key, serialized, 'EX', ttl);
        return true;
      } else {
        this.setInMemory(key, value, ttl);
        return true;
      }
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<boolean> {
    try {
      if (this.redis && this.redis.status === 'ready') {
        await this.redis.del(key);
      } else {
        this.inMemoryCache.delete(key);
      }
      return true;
    } catch (error) {
      console.error('Cache del error:', error);
      return false;
    }
  }

  /**
   * Delete all keys matching pattern
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      if (this.redis && this.redis.status === 'ready') {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
        return keys.length;
      } else {
        let count = 0;
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        for (const key of this.inMemoryCache.keys()) {
          if (regex.test(key)) {
            this.inMemoryCache.delete(key);
            count++;
          }
        }
        return count;
      }
    } catch (error) {
      console.error('Cache delPattern error:', error);
      return 0;
    }
  }

  /**
   * Get or set with function
   */
  async getOrSet<T = any>(
    key: string,
    ttl: number,
    fn: () => Promise<T>
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fn();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      if (this.redis && this.redis.status === 'ready') {
        const result = await this.redis.exists(key);
        return result === 1;
      } else {
        const entry = this.inMemoryCache.get(key);
        if (!entry) return false;
        if (Date.now() > entry.expires) {
          this.inMemoryCache.delete(key);
          return false;
        }
        return true;
      }
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      if (this.redis && this.redis.status === 'ready') {
        await this.redis.flushdb();
      } else {
        this.inMemoryCache.clear();
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Enable/disable cache
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  private getInMemory<T = any>(key: string): T | null {
    const entry = this.inMemoryCache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
      this.inMemoryCache.delete(key);
      return null;
    }

    return entry.value;
  }

  private setInMemory(key: string, value: any, ttl: number): void {
    this.inMemoryCache.set(key, {
      value,
      expires: Date.now() + (ttl * 1000)
    });
  }

  private cleanupInMemory(): void {
    const now = Date.now();
    for (const [key, entry] of this.inMemoryCache.entries()) {
      if (now > entry.expires) {
        this.inMemoryCache.delete(key);
      }
    }
  }

  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

// Singleton instance
export const cache = new RedisCache(process.env.REDIS_URL);

export default cache;
