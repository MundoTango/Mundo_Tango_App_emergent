/**
 * ESA LIFE CEO Layer 14 - Intelligent Caching Service
 * Redis primary cache with automatic in-memory fallback
 */

import Redis from 'ioredis';
import NodeCache from 'node-cache';

/**
 * Cache statistics tracking
 */
interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
}

/**
 * Cache service implementation with Redis primary and memory fallback
 */
class CacheService {
  private redisClient: Redis | null = null;
  private memoryCache: NodeCache;
  private useRedis: boolean = false;
  private stats: { hits: number; misses: number } = { hits: 0, misses: 0 };
  private defaultTTL: number = 3600; // 1 hour default TTL

  constructor() {
    // Initialize in-memory cache as fallback
    this.memoryCache = new NodeCache({
      stdTTL: this.defaultTTL,
      checkperiod: 600, // Check for expired keys every 10 minutes
      deleteOnExpire: true,
      useClones: false // Don't clone objects for performance
    });

    // Initialize Redis if enabled
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection with graceful fallback
   */
  private async initializeRedis(): Promise<void> {
    const enableRedis = process.env.ENABLE_REDIS === 'true';
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    if (!enableRedis) {
      console.log('🔧 ESA Layer 14: Redis disabled by configuration, using in-memory cache only');
      return;
    }

    try {
      console.log('🔄 ESA Layer 14: Attempting to connect to Redis...');
      
      this.redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => {
          if (times > 3) {
            console.log('⚠️  ESA Layer 14: Redis connection failed after 3 retries, falling back to memory cache');
            this.useRedis = false;
            return null; // Stop retrying
          }
          return Math.min(times * 100, 2000); // Exponential backoff
        },
        lazyConnect: false,
        enableOfflineQueue: false,
        connectTimeout: 5000,
        commandTimeout: 2000
      });

      // Handle Redis events
      this.redisClient.on('connect', () => {
        console.log('✅ ESA Layer 14: Redis connected successfully');
        this.useRedis = true;
      });

      this.redisClient.on('error', (err: Error) => {
        console.error('❌ ESA Layer 14: Redis error:', err.message);
        this.useRedis = false;
      });

      this.redisClient.on('close', () => {
        console.log('⚠️  ESA Layer 14: Redis connection closed, falling back to memory cache');
        this.useRedis = false;
      });

      // Test Redis connection
      await this.redisClient.ping();
      this.useRedis = true;
      console.log('✅ ESA Layer 14: Redis is primary cache, memory cache as fallback');

    } catch (error: any) {
      console.error('⚠️  ESA Layer 14: Redis initialization failed:', error.message);
      console.log('📦 ESA Layer 14: Using in-memory cache only');
      this.useRedis = false;
      
      // Clean up failed Redis connection
      if (this.redisClient) {
        this.redisClient.disconnect();
        this.redisClient = null;
      }
    }
  }

  /**
   * Get value from cache (Redis first, then memory)
   */
  async get<T = any>(key: string): Promise<T | null> {
    const cacheKey = this.formatKey(key);
    
    try {
      // Try Redis first if available
      if (this.useRedis && this.redisClient) {
        const value = await this.redisClient.get(cacheKey);
        if (value !== null) {
          this.stats.hits++;
          try {
            return JSON.parse(value);
          } catch {
            return value as T;
          }
        }
      }

      // Fallback to memory cache
      const memValue = this.memoryCache.get<T>(cacheKey);
      if (memValue !== undefined) {
        this.stats.hits++;
        
        // Sync to Redis if it's back online
        if (this.useRedis && this.redisClient) {
          const ttl = this.memoryCache.getTtl(cacheKey);
          if (ttl) {
            const remainingTTL = Math.floor((ttl - Date.now()) / 1000);
            if (remainingTTL > 0) {
              await this.setRedisOnly(cacheKey, memValue, remainingTTL);
            }
          }
        }
        
        return memValue;
      }

      this.stats.misses++;
      return null;

    } catch (error: any) {
      console.error(`❌ ESA Layer 14: Cache get error for key ${cacheKey}:`, error.message);
      
      // If Redis fails, try memory cache
      const memValue = this.memoryCache.get<T>(cacheKey);
      if (memValue !== undefined) {
        this.stats.hits++;
        return memValue;
      }
      
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set value in cache (both Redis and memory)
   */
  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    const cacheKey = this.formatKey(key);
    const ttlSeconds = ttl || this.defaultTTL;
    
    try {
      // Store in memory cache first (instant availability)
      this.memoryCache.set(cacheKey, value, ttlSeconds);
      
      // Then store in Redis if available
      if (this.useRedis && this.redisClient) {
        const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
        await this.redisClient.setex(cacheKey, ttlSeconds, serialized);
      }
      
    } catch (error: any) {
      console.error(`❌ ESA Layer 14: Cache set error for key ${cacheKey}:`, error.message);
      // Ensure it's at least in memory cache
      this.memoryCache.set(cacheKey, value, ttlSeconds);
    }
  }

  /**
   * Delete value from cache (both Redis and memory)
   */
  async delete(key: string): Promise<void> {
    const cacheKey = this.formatKey(key);
    
    try {
      // Delete from memory cache
      this.memoryCache.del(cacheKey);
      
      // Delete from Redis if available
      if (this.useRedis && this.redisClient) {
        await this.redisClient.del(cacheKey);
      }
      
    } catch (error: any) {
      console.error(`❌ ESA Layer 14: Cache delete error for key ${cacheKey}:`, error.message);
      // Ensure it's at least deleted from memory
      this.memoryCache.del(cacheKey);
    }
  }

  /**
   * Clear all cached data
   */
  async flush(): Promise<void> {
    try {
      // Clear memory cache
      this.memoryCache.flushAll();
      
      // Clear Redis if available (only keys with our prefix)
      if (this.useRedis && this.redisClient) {
        const keys = await this.redisClient.keys('app:*');
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      }
      
      console.log('🧹 ESA Layer 14: Cache flushed successfully');
      
    } catch (error: any) {
      console.error('❌ ESA Layer 14: Cache flush error:', error.message);
      // Ensure memory cache is cleared at least
      this.memoryCache.flushAll();
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    const cacheKey = this.formatKey(key);
    
    try {
      // Check Redis first if available
      if (this.useRedis && this.redisClient) {
        const exists = await this.redisClient.exists(cacheKey);
        if (exists > 0) return true;
      }
      
      // Check memory cache
      return this.memoryCache.has(cacheKey);
      
    } catch (error: any) {
      console.error(`❌ ESA Layer 14: Cache exists error for key ${cacheKey}:`, error.message);
      // Fallback to memory cache check
      return this.memoryCache.has(cacheKey);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  /**
   * Get cache status information
   */
  getStatus(): { redis: boolean; memory: boolean; stats: CacheStats } {
    return {
      redis: this.useRedis,
      memory: true, // Always available
      stats: this.getStats()
    };
  }

  /**
   * Format cache key with consistent naming
   */
  private formatKey(key: string): string {
    // If key already has app: prefix, return as is
    if (key.startsWith('app:')) {
      return key;
    }
    // Otherwise add app: prefix
    return `app:${key}`;
  }

  /**
   * Helper to set value in Redis only (for syncing)
   */
  private async setRedisOnly(key: string, value: any, ttl: number): Promise<void> {
    if (!this.useRedis || !this.redisClient) return;
    
    try {
      const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
      await this.redisClient.setex(key, ttl, serialized);
    } catch (error: any) {
      // Silent fail for sync operations
      console.debug(`ESA Layer 14: Redis sync failed for ${key}:`, error.message);
    }
  }

  /**
   * Batch get operation for multiple keys
   */
  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    const formattedKeys = keys.map(k => this.formatKey(k));
    const results: (T | null)[] = [];
    
    try {
      // Try Redis first if available
      if (this.useRedis && this.redisClient) {
        const values = await this.redisClient.mget(...formattedKeys);
        
        for (let i = 0; i < values.length; i++) {
          if (values[i] !== null) {
            try {
              results.push(JSON.parse(values[i] as string));
              this.stats.hits++;
            } catch {
              results.push(values[i] as T);
              this.stats.hits++;
            }
          } else {
            // Try memory cache for missing Redis values
            const memValue = this.memoryCache.get<T>(formattedKeys[i]);
            if (memValue !== undefined) {
              results.push(memValue);
              this.stats.hits++;
            } else {
              results.push(null);
              this.stats.misses++;
            }
          }
        }
      } else {
        // Use memory cache only
        for (const key of formattedKeys) {
          const value = this.memoryCache.get<T>(key);
          if (value !== undefined) {
            results.push(value);
            this.stats.hits++;
          } else {
            results.push(null);
            this.stats.misses++;
          }
        }
      }
      
      return results;
      
    } catch (error: any) {
      console.error('❌ ESA Layer 14: Batch get error:', error.message);
      
      // Fallback to memory cache for all keys
      for (const key of formattedKeys) {
        const value = this.memoryCache.get<T>(key);
        if (value !== undefined) {
          results.push(value);
          this.stats.hits++;
        } else {
          results.push(null);
          this.stats.misses++;
        }
      }
      
      return results;
    }
  }

  /**
   * Batch set operation for multiple key-value pairs
   */
  async mset(items: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    try {
      // Set in memory cache first
      for (const item of items) {
        const cacheKey = this.formatKey(item.key);
        const ttl = item.ttl || this.defaultTTL;
        this.memoryCache.set(cacheKey, item.value, ttl);
      }
      
      // Then set in Redis if available
      if (this.useRedis && this.redisClient) {
        const pipeline = this.redisClient.pipeline();
        
        for (const item of items) {
          const cacheKey = this.formatKey(item.key);
          const ttl = item.ttl || this.defaultTTL;
          const serialized = typeof item.value === 'object' 
            ? JSON.stringify(item.value) 
            : String(item.value);
          
          pipeline.setex(cacheKey, ttl, serialized);
        }
        
        await pipeline.exec();
      }
      
    } catch (error: any) {
      console.error('❌ ESA Layer 14: Batch set error:', error.message);
      // Data is at least in memory cache
    }
  }

  /**
   * Close connections gracefully
   */
  async close(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.redisClient = null;
      this.useRedis = false;
    }
    
    this.memoryCache.close();
    console.log('👋 ESA Layer 14: Cache service closed');
  }
}

// Export singleton instance
export const cacheService = new CacheService();
export default cacheService;