/**
 * ESA LIFE CEO 61x21 - Cache Manager (Phase 12)
 * High-performance caching system with multiple strategies
 */

import NodeCache from 'node-cache';
import { createHash } from 'crypto';

// Cache configuration
const CACHE_CONFIG = {
  DEFAULT_TTL: 300, // 5 minutes
  CHECK_PERIOD: 60, // Check for expired keys every 60 seconds
  MAX_KEYS: 10000,
  USE_CLONES: false // Don't clone objects for better performance
};

// Cache TTL by category (in seconds)
const CACHE_TTL = {
  USER_PROFILE: 600,      // 10 minutes
  PUBLIC_PROFILE: 1800,   // 30 minutes
  EVENTS: 300,            // 5 minutes
  COMMUNITIES: 3600,      // 1 hour
  GROUPS: 1800,           // 30 minutes
  MEMORIES: 120,          // 2 minutes
  AI_RESPONSE: 3600,      // 1 hour
  STATIC_DATA: 86400,     // 24 hours
  SESSION: 1800,          // 30 minutes
  API_RESPONSE: 180       // 3 minutes
};

// Cache instances for different data types
class CacheManager {
  private static instance: CacheManager;
  private caches: Map<string, NodeCache>;
  private stats: Map<string, CacheStats>;

  private constructor() {
    this.caches = new Map();
    this.stats = new Map();
    this.initializeCaches();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private initializeCaches() {
    // Create specialized caches
    const cacheTypes = [
      'user',
      'events',
      'communities',
      'groups',
      'memories',
      'ai',
      'api',
      'static'
    ];

    cacheTypes.forEach(type => {
      this.caches.set(type, new NodeCache({
        stdTTL: CACHE_CONFIG.DEFAULT_TTL,
        checkperiod: CACHE_CONFIG.CHECK_PERIOD,
        useClones: CACHE_CONFIG.USE_CLONES,
        deleteOnExpire: true,
        maxKeys: CACHE_CONFIG.MAX_KEYS
      }));

      this.stats.set(type, {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        hitRate: 0
      });
    });

    // Setup cache statistics collection
    this.setupStatsCollection();
  }

  private setupStatsCollection() {
    // Update hit rates every minute
    setInterval(() => {
      this.stats.forEach((stats, type) => {
        const total = stats.hits + stats.misses;
        stats.hitRate = total > 0 ? (stats.hits / total) * 100 : 0;
      });
    }, 60000);
  }

  // ============= Core Cache Operations =============
  
  get<T>(type: string, key: string): T | undefined {
    const cache = this.caches.get(type);
    if (!cache) return undefined;

    const value = cache.get<T>(key);
    const stats = this.stats.get(type);
    
    if (stats) {
      if (value !== undefined) {
        stats.hits++;
      } else {
        stats.misses++;
      }
    }

    return value;
  }

  set<T>(type: string, key: string, value: T, ttl?: number): boolean {
    const cache = this.caches.get(type);
    if (!cache) return false;

    const success = cache.set(key, value, ttl || CACHE_CONFIG.DEFAULT_TTL);
    
    const stats = this.stats.get(type);
    if (stats && success) {
      stats.sets++;
    }

    return success;
  }

  delete(type: string, key: string): boolean {
    const cache = this.caches.get(type);
    if (!cache) return false;

    const count = cache.del(key);
    
    const stats = this.stats.get(type);
    if (stats && count > 0) {
      stats.deletes++;
    }

    return count > 0;
  }

  flush(type?: string): void {
    if (type) {
      const cache = this.caches.get(type);
      cache?.flushAll();
    } else {
      this.caches.forEach(cache => cache.flushAll());
    }
  }

  // ============= Specialized Cache Methods =============

  async getUserProfile(userId: string): Promise<any | null> {
    const key = `profile:${userId}`;
    return this.get('user', key);
  }

  setUserProfile(userId: string, profile: any): void {
    const key = `profile:${userId}`;
    this.set('user', key, profile, CACHE_TTL.USER_PROFILE);
  }

  async getEvents(filters: any): Promise<any[] | null> {
    const key = this.generateCacheKey('events', filters);
    return this.get('events', key);
  }

  setEvents(filters: any, events: any[]): void {
    const key = this.generateCacheKey('events', filters);
    this.set('events', key, events, CACHE_TTL.EVENTS);
  }

  async getAIResponse(prompt: string, agentId: string): Promise<string | null> {
    const key = `ai:${agentId}:${this.hashString(prompt)}`;
    return this.get('ai', key);
  }

  setAIResponse(prompt: string, agentId: string, response: string): void {
    const key = `ai:${agentId}:${this.hashString(prompt)}`;
    this.set('ai', key, response, CACHE_TTL.AI_RESPONSE);
  }

  // ============= Cache Key Generation =============

  private generateCacheKey(prefix: string, params: any): string {
    const sortedParams = this.sortObject(params);
    const paramString = JSON.stringify(sortedParams);
    const hash = this.hashString(paramString);
    return `${prefix}:${hash}`;
  }

  private sortObject(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Array) return obj.map(item => this.sortObject(item));
    
    const sorted: any = {};
    Object.keys(obj).sort().forEach(key => {
      sorted[key] = this.sortObject(obj[key]);
    });
    return sorted;
  }

  private hashString(str: string): string {
    return createHash('sha256').update(str).digest('hex').substring(0, 16);
  }

  // ============= Cache Invalidation =============

  invalidateUserData(userId: string): void {
    const patterns = [
      `profile:${userId}`,
      `posts:${userId}`,
      `friends:${userId}`,
      `groups:${userId}`
    ];

    this.caches.forEach((cache, type) => {
      const keys = cache.keys();
      keys.forEach(key => {
        if (patterns.some(pattern => key.includes(pattern))) {
          cache.del(key);
        }
      });
    });
  }

  invalidateEventData(eventId?: string): void {
    if (eventId) {
      this.caches.get('events')?.del(`event:${eventId}`);
    } else {
      this.flush('events');
    }
  }

  // ============= Cache Warming =============

  async warmCache(type: string, dataLoader: () => Promise<any>): Promise<void> {
    try {
      const data = await dataLoader();
      if (data) {
        // Store the warmed data
        const key = `warm:${type}:${Date.now()}`;
        this.set(type, key, data, CACHE_TTL.STATIC_DATA);
      }
    } catch (error) {
      console.error(`Failed to warm cache for ${type}:`, error);
    }
  }

  // ============= Statistics & Monitoring =============

  getStatistics(): CacheStatistics {
    const overall: CacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0
    };

    const byType: Record<string, CacheStats> = {};
    
    this.stats.forEach((stats, type) => {
      overall.hits += stats.hits;
      overall.misses += stats.misses;
      overall.sets += stats.sets;
      overall.deletes += stats.deletes;
      byType[type] = { ...stats };
    });

    const total = overall.hits + overall.misses;
    overall.hitRate = total > 0 ? (overall.hits / total) * 100 : 0;

    const memory: Record<string, number> = {};
    this.caches.forEach((cache, type) => {
      memory[type] = cache.keys().length;
    });

    return {
      overall,
      byType,
      memory,
      timestamp: new Date().toISOString()
    };
  }

  // ============= TTL Management =============

  updateTTL(type: string, key: string, ttl: number): boolean {
    const cache = this.caches.get(type);
    if (!cache) return false;

    return cache.ttl(key, ttl);
  }

  getTTL(type: string, key: string): number | undefined {
    const cache = this.caches.get(type);
    if (!cache) return undefined;

    return cache.getTtl(key);
  }

  // ============= Batch Operations =============

  async getBatch<T>(type: string, keys: string[]): Promise<Map<string, T>> {
    const cache = this.caches.get(type);
    if (!cache) return new Map();

    const results = new Map<string, T>();
    keys.forEach(key => {
      const value = cache.get<T>(key);
      if (value !== undefined) {
        results.set(key, value);
      }
    });

    return results;
  }

  setBatch<T>(type: string, items: Map<string, T>, ttl?: number): boolean {
    const cache = this.caches.get(type);
    if (!cache) return false;

    let success = true;
    items.forEach((value, key) => {
      if (!cache.set(key, value, ttl || CACHE_CONFIG.DEFAULT_TTL)) {
        success = false;
      }
    });

    return success;
  }

  // ============= Cache Decorators =============

  memoize<T extends (...args: any[]) => any>(
    fn: T,
    type: string,
    ttl?: number
  ): T {
    return ((...args: Parameters<T>) => {
      const key = this.generateCacheKey(fn.name, args);
      const cached = this.get(type, key);
      
      if (cached !== undefined) {
        return cached;
      }

      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result.then(value => {
          this.set(type, key, value, ttl);
          return value;
        });
      }

      this.set(type, key, result, ttl);
      return result;
    }) as T;
  }
}

// ============= Interfaces =============

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}

interface CacheStatistics {
  overall: CacheStats;
  byType: Record<string, CacheStats>;
  memory: Record<string, number>;
  timestamp: string;
}

// ============= Express Middleware =============

export function cacheMiddleware(type: string, ttl?: number) {
  const cache = CacheManager.getInstance();

  return (req: any, res: any, next: any) => {
    // Skip non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = cache['generateCacheKey'](req.originalUrl, req.query);
    const cached = cache.get(type, key);

    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json(cached);
    }

    // Store original send function
    const originalSend = res.json.bind(res);

    // Override json method
    res.json = (data: any) => {
      // Cache successful responses only
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(type, key, data, ttl || CACHE_TTL.API_RESPONSE);
      }
      res.set('X-Cache', 'MISS');
      return originalSend(data);
    };

    next();
  };
}

// ============= ETag Support =============

export function etagMiddleware() {
  return (req: any, res: any, next: any) => {
    const originalSend = res.json.bind(res);

    res.json = (data: any) => {
      const hash = createHash('md5')
        .update(JSON.stringify(data))
        .digest('hex');
      
      const etag = `"${hash}"`;
      res.set('ETag', etag);

      // Check if client has matching ETag
      if (req.get('If-None-Match') === etag) {
        return res.sendStatus(304);
      }

      return originalSend(data);
    };

    next();
  };
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();
export default cacheManager;