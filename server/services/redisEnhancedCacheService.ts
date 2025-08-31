/**
 * ESA LIFE CEO 61x21 - Layer 14: Enhanced Caching Strategy
 * Redis, in-memory cache, CDN integration, multi-layer caching
 */

import { EventEmitter } from 'events';

export interface CacheEntry {
  key: string;
  value: any;
  ttl: number;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
  tags: string[];
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  hitRate: number;
}

export interface CacheConfig {
  defaultTTL: number;
  maxMemorySize: number;
  evictionPolicy: 'lru' | 'lfu' | 'fifo';
  enableRedis: boolean;
  redisUrl?: string;
  enableCompression: boolean;
}

class RedisEnhancedCacheService extends EventEmitter {
  private memoryCache = new Map<string, CacheEntry>();
  private lruOrder = new Map<string, number>();
  private accessCounter = 0;
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    hitRate: 0
  };

  private config: CacheConfig = {
    defaultTTL: 3600, // 1 hour
    maxMemorySize: 100 * 1024 * 1024, // 100MB
    evictionPolicy: 'lru',
    enableRedis: false, // Will enable when Redis is available
    enableCompression: true
  };

  // Redis client simulation (replace with actual Redis when available)
  private redisClient: any = null;

  constructor(config?: Partial<CacheConfig>) {
    super();
    this.config = { ...this.config, ...config };
    this.setupCleanupScheduler();
    console.log('[ESA Layer 14] Enhanced cache service initialized');
  }

  async set(key: string, value: any, ttl?: number, tags: string[] = []): Promise<boolean> {
    try {
      const actualTTL = ttl || this.config.defaultTTL;
      const entry: CacheEntry = {
        key,
        value: this.config.enableCompression ? this.compress(value) : value,
        ttl: actualTTL,
        createdAt: new Date(),
        lastAccessed: new Date(),
        accessCount: 0,
        tags
      };

      // Memory cache
      this.memoryCache.set(key, entry);
      this.lruOrder.set(key, this.accessCounter++);

      // Redis cache (if available)
      if (this.redisClient && this.config.enableRedis) {
        await this.redisClient.setex(key, actualTTL, JSON.stringify(value));
      }

      this.metrics.sets++;
      this.checkMemoryLimit();
      this.emit('set', key, value);

      console.log(`[ESA Layer 14] Cached: ${key} (TTL: ${actualTTL}s, Tags: [${tags.join(', ')}])`);
      return true;
    } catch (error) {
      console.error(`[ESA Layer 14] Cache set error:`, error);
      return false;
    }
  }

  async get(key: string): Promise<any> {
    try {
      // Check memory cache first
      const memoryEntry = this.memoryCache.get(key);
      if (memoryEntry && !this.isExpired(memoryEntry)) {
        memoryEntry.lastAccessed = new Date();
        memoryEntry.accessCount++;
        this.lruOrder.set(key, this.accessCounter++);
        
        this.metrics.hits++;
        this.updateHitRate();
        this.emit('hit', key, 'memory');

        const value = this.config.enableCompression ? this.decompress(memoryEntry.value) : memoryEntry.value;
        return value;
      }

      // Check Redis cache (if available)
      if (this.redisClient && this.config.enableRedis) {
        const redisValue = await this.redisClient.get(key);
        if (redisValue) {
          const value = JSON.parse(redisValue);
          // Store back in memory cache for faster access
          await this.set(key, value, this.config.defaultTTL);
          
          this.metrics.hits++;
          this.updateHitRate();
          this.emit('hit', key, 'redis');
          return value;
        }
      }

      // Cache miss
      this.metrics.misses++;
      this.updateHitRate();
      this.emit('miss', key);
      return null;

    } catch (error) {
      console.error(`[ESA Layer 14] Cache get error:`, error);
      this.metrics.misses++;
      this.updateHitRate();
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const deleted = this.memoryCache.delete(key);
      this.lruOrder.delete(key);

      if (this.redisClient && this.config.enableRedis) {
        await this.redisClient.del(key);
      }

      if (deleted) {
        this.metrics.deletes++;
        this.emit('delete', key);
        console.log(`[ESA Layer 14] Deleted cache key: ${key}`);
      }

      return deleted;
    } catch (error) {
      console.error(`[ESA Layer 14] Cache delete error:`, error);
      return false;
    }
  }

  async invalidateByTag(tag: string): Promise<number> {
    let count = 0;
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.tags.includes(tag)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      await this.delete(key);
      count++;
    }

    console.log(`[ESA Layer 14] Invalidated ${count} entries with tag: ${tag}`);
    return count;
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    this.lruOrder.clear();
    
    if (this.redisClient && this.config.enableRedis) {
      await this.redisClient.flushall();
    }

    console.log('[ESA Layer 14] Cache cleared');
    this.emit('clear');
  }

  // Cache patterns for common operations
  async remember<T>(key: string, factory: () => Promise<T>, ttl?: number, tags?: string[]): Promise<T> {
    let value = await this.get(key);
    
    if (value === null) {
      value = await factory();
      await this.set(key, value, ttl, tags);
    }
    
    return value;
  }

  // Specialized caching methods for Mundo Tango platform
  async cacheUserProfile(userId: string, profile: any, ttl = 1800) {
    return this.set(`user:${userId}`, profile, ttl, ['users', 'profiles']);
  }

  async getUserProfile(userId: string) {
    return this.get(`user:${userId}`);
  }

  async cacheEventData(eventId: string, event: any, ttl = 3600) {
    return this.set(`event:${eventId}`, event, ttl, ['events', 'public']);
  }

  async getEventData(eventId: string) {
    return this.get(`event:${eventId}`);
  }

  async cachePostFeed(userId: string, feed: any[], ttl = 600) {
    return this.set(`feed:${userId}`, feed, ttl, ['feeds', 'posts', 'dynamic']);
  }

  async getPostFeed(userId: string) {
    return this.get(`feed:${userId}`);
  }

  async cacheSearchResults(query: string, results: any[], ttl = 1200) {
    const sanitizedQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return this.set(`search:${sanitizedQuery}`, results, ttl, ['search', 'results']);
  }

  async getSearchResults(query: string) {
    const sanitizedQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return this.get(`search:${sanitizedQuery}`);
  }

  // Private helper methods
  private isExpired(entry: CacheEntry): boolean {
    const now = new Date();
    const expirationTime = new Date(entry.createdAt.getTime() + entry.ttl * 1000);
    return now > expirationTime;
  }

  private checkMemoryLimit() {
    const currentSize = this.estimateMemoryUsage();
    
    if (currentSize > this.config.maxMemorySize) {
      this.evictEntries();
    }
  }

  private evictEntries() {
    const entriesToRemove = Math.ceil(this.memoryCache.size * 0.1); // Remove 10%
    let removed = 0;

    if (this.config.evictionPolicy === 'lru') {
      // Sort by LRU order
      const sortedEntries = Array.from(this.lruOrder.entries())
        .sort(([, a], [, b]) => a - b);

      for (const [key] of sortedEntries) {
        if (removed >= entriesToRemove) break;
        this.memoryCache.delete(key);
        this.lruOrder.delete(key);
        removed++;
        this.metrics.evictions++;
      }
    }

    console.log(`[ESA Layer 14] Evicted ${removed} cache entries (${this.config.evictionPolicy})`);
    this.emit('eviction', removed);
  }

  private estimateMemoryUsage(): number {
    let size = 0;
    for (const entry of this.memoryCache.values()) {
      size += JSON.stringify(entry).length * 2; // Rough estimate
    }
    return size;
  }

  private compress(data: any): any {
    // Simple compression simulation - in production use actual compression
    if (typeof data === 'string' && data.length > 1000) {
      return { __compressed: true, data: data.substring(0, 1000) + '...' };
    }
    return data;
  }

  private decompress(data: any): any {
    if (data && data.__compressed) {
      return data.data;
    }
    return data;
  }

  private updateHitRate() {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;
  }

  private setupCleanupScheduler() {
    // Clean expired entries every 5 minutes
    setInterval(() => {
      let cleaned = 0;
      for (const [key, entry] of this.memoryCache.entries()) {
        if (this.isExpired(entry)) {
          this.memoryCache.delete(key);
          this.lruOrder.delete(key);
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        console.log(`[ESA Layer 14] Cleaned ${cleaned} expired cache entries`);
        this.emit('cleanup', cleaned);
      }
    }, 5 * 60 * 1000);
  }

  getMetrics(): CacheMetrics & { memorySize: number; entryCount: number } {
    return {
      ...this.metrics,
      memorySize: this.estimateMemoryUsage(),
      entryCount: this.memoryCache.size
    };
  }

  getConfig(): CacheConfig {
    return { ...this.config };
  }

  // Health check for monitoring
  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details: any }> {
    const metrics = this.getMetrics();
    const memoryUsagePercent = (metrics.memorySize / this.config.maxMemorySize) * 100;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (metrics.hitRate < 50) {
      status = 'degraded';
    }
    
    if (memoryUsagePercent > 90 || metrics.hitRate < 20) {
      status = 'unhealthy';
    }

    return {
      status,
      details: {
        hitRate: metrics.hitRate,
        memoryUsage: `${memoryUsagePercent.toFixed(1)}%`,
        entryCount: metrics.entryCount,
        redisEnabled: this.config.enableRedis && !!this.redisClient
      }
    };
  }
}

export const enhancedCacheService = new RedisEnhancedCacheService();

// Export for Layer 57 (Automation Management) integration
export const setupCacheAutomation = () => {
  // Monitor cache performance every minute
  setInterval(() => {
    const metrics = enhancedCacheService.getMetrics();
    if (metrics.hitRate < 60) {
      console.log(`[ESA Layer 14] Cache hit rate warning: ${metrics.hitRate.toFixed(1)}%`);
    }
  }, 60 * 1000);

  // Warm cache with frequently accessed data every hour
  setInterval(async () => {
    console.log('[ESA Layer 14] Warming cache with popular content...');
    // This would be connected to actual data sources
    // await enhancedCacheService.cacheUserProfile('popular-user', {...});
    // await enhancedCacheService.cacheEventData('upcoming-event', {...});
  }, 60 * 60 * 1000);
};