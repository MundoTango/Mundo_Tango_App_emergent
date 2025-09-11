/**
 * ESA LIFE CEO 61×21 - High-Performance Cache Utility
 * Simple in-memory cache with TTL for API response optimization
 */

interface CacheItem {
  data: any;
  expiry: number;
}

class PerformanceCache {
  private cache: Map<string, CacheItem> = new Map();
  private defaultTTL: number = 300000; // 5 minutes default
  
  /**
   * Set cache with TTL in milliseconds
   */
  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
    
    // Automatic cleanup after TTL expires
    setTimeout(() => this.delete(key), ttl);
  }
  
  /**
   * Get cached data if not expired
   */
  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  /**
   * Delete cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Invalidate cache entries matching pattern
   */
  invalidatePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.delete(key);
      }
    });
  }
  
  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Cache instances with different TTLs
export const apiCache = new PerformanceCache();

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  USER_PROFILE: 5 * 60 * 1000,    // 5 minutes
  USER_POSTS: 2 * 60 * 1000,      // 2 minutes
  USER_STATS: 3 * 60 * 1000,      // 3 minutes
  USER_SETTINGS: 10 * 60 * 1000,  // 10 minutes
  STATIC_DATA: 60 * 60 * 1000,    // 1 hour
};

// Cache key generators
export const cacheKeys = {
  userProfile: (userId: string | number) => `user:profile:${userId}`,
  userPosts: (userId: string | number) => `user:posts:${userId}`,
  userStats: (userId: string | number) => `user:stats:${userId}`,
  userSettings: (userId: string | number) => `user:settings:${userId}`,
  guestProfile: (userId: string | number) => `user:guest:${userId}`,
};

// Cache middleware for Express
export const cacheMiddleware = (keyGenerator: (req: any) => string, ttl: number) => {
  return (req: any, res: any, next: any) => {
    const key = keyGenerator(req);
    const cached = apiCache.get(key);
    
    if (cached) {
      // Add cache hit header for monitoring
      res.set('X-Cache', 'HIT');
      res.set('Cache-Control', `private, max-age=${Math.floor(ttl / 1000)}`);
      return res.json(cached);
    }
    
    // Store original send method
    const originalSend = res.json.bind(res);
    
    // Override json method to cache successful responses
    res.json = (body: any) => {
      if (res.statusCode === 200 && body) {
        apiCache.set(key, body, ttl);
        res.set('X-Cache', 'MISS');
        res.set('Cache-Control', `private, max-age=${Math.floor(ttl / 1000)}`);
      }
      return originalSend(body);
    };
    
    next();
  };
};

// Performance monitoring
let cacheHits = 0;
let cacheMisses = 0;

setInterval(() => {
  const stats = apiCache.getStats();
  const hitRate = cacheHits > 0 ? (cacheHits / (cacheHits + cacheMisses) * 100).toFixed(2) : 0;
  
  if (stats.size > 0) {
    console.log(`[ESA Cache] Hit Rate: ${hitRate}% | Entries: ${stats.size} | Hits: ${cacheHits} | Misses: ${cacheMisses}`);
  }
  
  // Reset counters every 5 minutes
  if (cacheHits + cacheMisses > 1000) {
    cacheHits = 0;
    cacheMisses = 0;
  }
}, 30000); // Log every 30 seconds

// Export cache hit tracking
export const trackCacheHit = () => cacheHits++;
export const trackCacheMiss = () => cacheMisses++;