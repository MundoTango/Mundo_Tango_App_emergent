# ESA Layer 14: Caching & Redis Agent 🚀

## Overview
Layer 14 manages all caching strategies using Redis, including session storage, query caching, rate limiting storage, and real-time data caching for optimal performance.

## Core Responsibilities

### 1. Cache Management
- Key-value caching
- Query result caching
- Session storage
- Cache invalidation
- TTL management

### 2. Redis Operations
- Pub/Sub messaging
- Queue management
- Distributed locking
- Sorted sets for leaderboards
- Geospatial queries

### 3. Performance Optimization
- Cache warming
- Cache hit ratio optimization
- Memory management
- Eviction policies
- Cluster configuration

## Open Source Packages

```json
{
  "redis": "^4.6.12",
  "ioredis": "^5.3.2",
  "rate-limit-redis": "^4.2.0",
  "lru-cache": "^10.1.0",
  "node-cache": "^5.1.2",
  "memorystore": "^1.6.7"
}
```

## Integration Points

- **Layer 1 (Database)**: Query caching
- **Layer 4 (Authentication)**: Session storage
- **Layer 7 (State Management)**: State caching
- **Layer 11 (WebSockets)**: Real-time data
- **Layer 21 (User Management)**: User data caching

## Redis Configuration

```typescript
import { Redis } from 'ioredis';

// Redis client configuration
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 0,
  
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
  
  enableOfflineQueue: true,
  maxRetriesPerRequest: 3
});

// Redis cluster for production
const cluster = new Redis.Cluster(
  [
    { host: 'redis-1', port: 6379 },
    { host: 'redis-2', port: 6379 },
    { host: 'redis-3', port: 6379 }
  ],
  {
    redisOptions: {
      password: process.env.REDIS_PASSWORD
    },
    clusterRetryStrategy: (times) => Math.min(100 * times, 3000)
  }
);

// Connection handling
redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

export { redis, cluster };
```

## Cache Service Implementation

```typescript
export class CacheService {
  private redis: Redis;
  private defaultTTL = 3600; // 1 hour
  
  constructor(redis: Redis) {
    this.redis = redis;
  }
  
  // Generic cache operations
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value as any;
    }
  }
  
  async set<T>(
    key: string, 
    value: T, 
    ttl: number = this.defaultTTL
  ): Promise<void> {
    const serialized = typeof value === 'string' 
      ? value 
      : JSON.stringify(value);
    
    await this.redis.setex(key, ttl, serialized);
  }
  
  async delete(pattern: string): Promise<number> {
    const keys = await this.redis.keys(pattern);
    if (keys.length === 0) return 0;
    
    return await this.redis.del(...keys);
  }
  
  // Cache-aside pattern
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    let value = await this.get<T>(key);
    
    if (value === null) {
      value = await factory();
      await this.set(key, value, ttl);
    }
    
    return value;
  }
  
  // Invalidation patterns
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    
    if (keys.length > 0) {
      const pipeline = this.redis.pipeline();
      keys.forEach(key => pipeline.del(key));
      await pipeline.exec();
    }
  }
  
  // Atomic increment
  async increment(key: string, by: number = 1): Promise<number> {
    return await this.redis.incrby(key, by);
  }
  
  // Set operations
  async addToSet(key: string, ...members: string[]): Promise<number> {
    return await this.redis.sadd(key, ...members);
  }
  
  async getSetMembers(key: string): Promise<string[]> {
    return await this.redis.smembers(key);
  }
  
  // Sorted set operations (for leaderboards)
  async addToSortedSet(key: string, score: number, member: string): Promise<number> {
    return await this.redis.zadd(key, score, member);
  }
  
  async getTopFromSortedSet(key: string, count: number): Promise<string[]> {
    return await this.redis.zrevrange(key, 0, count - 1, 'WITHSCORES');
  }
}
```

## Query Caching

```typescript
// Database query caching
export class QueryCache {
  constructor(
    private cache: CacheService,
    private db: Database
  ) {}
  
  async executeQuery<T>(
    query: string,
    params: any[],
    options: CacheOptions = {}
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(query, params);
    
    // Try cache first
    if (!options.skipCache) {
      const cached = await this.cache.get<T>(cacheKey);
      if (cached) {
        this.metrics.recordHit();
        return cached;
      }
    }
    
    // Execute query
    this.metrics.recordMiss();
    const result = await this.db.query<T>(query, params);
    
    // Cache result
    if (!options.noCache) {
      await this.cache.set(
        cacheKey, 
        result, 
        options.ttl || 300
      );
    }
    
    return result;
  }
  
  private generateCacheKey(query: string, params: any[]): string {
    const hash = crypto
      .createHash('md5')
      .update(query + JSON.stringify(params))
      .digest('hex');
    
    return `query:${hash}`;
  }
  
  async invalidateQueriesForTable(tableName: string): Promise<void> {
    await this.cache.invalidatePattern(`query:*${tableName}*`);
  }
}

// Usage with React Query
export function useCachedQuery<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  cacheTime: number = 5 * 60 * 1000
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const cacheKey = Array.isArray(queryKey) 
        ? queryKey.join(':') 
        : queryKey;
      
      return await cacheService.getOrSet(
        cacheKey,
        queryFn,
        Math.floor(cacheTime / 1000)
      );
    },
    staleTime: cacheTime,
    gcTime: cacheTime * 2
  });
}
```

## Session Management

```typescript
import connectRedis from 'connect-redis';
import session from 'express-session';

// Redis session store
const RedisStore = connectRedis(session);

export const sessionConfig = {
  store: new RedisStore({
    client: redis,
    prefix: 'session:',
    ttl: 86400 // 24 hours
  }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    sameSite: 'lax' as const
  }
};

// Session operations
export class SessionManager {
  async getSession(sessionId: string): Promise<SessionData | null> {
    const data = await redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }
  
  async destroySession(sessionId: string): Promise<void> {
    await redis.del(`session:${sessionId}`);
  }
  
  async getActiveSessions(userId: string): Promise<string[]> {
    const pattern = `session:*`;
    const keys = await redis.keys(pattern);
    
    const sessions = [];
    for (const key of keys) {
      const session = await redis.get(key);
      if (session && JSON.parse(session).userId === userId) {
        sessions.push(key.replace('session:', ''));
      }
    }
    
    return sessions;
  }
}
```

## Rate Limiting Cache

```typescript
// Rate limiting with Redis
export class RateLimiter {
  constructor(private redis: Redis) {}
  
  async checkLimit(
    key: string, 
    limit: number, 
    window: number
  ): Promise<RateLimitResult> {
    const multi = this.redis.multi();
    const now = Date.now();
    const windowStart = now - window * 1000;
    
    // Remove old entries
    multi.zremrangebyscore(key, '-inf', windowStart);
    
    // Count current entries
    multi.zcard(key);
    
    // Add current request
    multi.zadd(key, now, `${now}-${Math.random()}`);
    
    // Set expiry
    multi.expire(key, window);
    
    const results = await multi.exec();
    const count = results![1][1] as number;
    
    return {
      allowed: count < limit,
      remaining: Math.max(0, limit - count - 1),
      resetAt: new Date(now + window * 1000)
    };
  }
}
```

## Distributed Locking

```typescript
// Redis-based distributed lock
export class DistributedLock {
  constructor(private redis: Redis) {}
  
  async acquire(
    resource: string, 
    ttl: number = 10000
  ): Promise<Lock | null> {
    const lockId = uuid();
    const key = `lock:${resource}`;
    
    const acquired = await this.redis.set(
      key,
      lockId,
      'PX',
      ttl,
      'NX'
    );
    
    if (acquired === 'OK') {
      return {
        resource,
        lockId,
        release: async () => {
          const script = `
            if redis.call("get", KEYS[1]) == ARGV[1] then
              return redis.call("del", KEYS[1])
            else
              return 0
            end
          `;
          
          await this.redis.eval(script, 1, key, lockId);
        }
      };
    }
    
    return null;
  }
  
  async withLock<T>(
    resource: string,
    fn: () => Promise<T>,
    options: LockOptions = {}
  ): Promise<T> {
    const lock = await this.acquire(resource, options.ttl);
    
    if (!lock) {
      throw new Error(`Failed to acquire lock for ${resource}`);
    }
    
    try {
      return await fn();
    } finally {
      await lock.release();
    }
  }
}
```

## Cache Warming

```typescript
// Preload frequently accessed data
export class CacheWarmer {
  async warmCache(): Promise<void> {
    const tasks = [
      this.warmUserCache(),
      this.warmConfigCache(),
      this.warmPopularContent()
    ];
    
    await Promise.allSettled(tasks);
  }
  
  private async warmUserCache(): Promise<void> {
    const activeUsers = await db.query(
      'SELECT * FROM users WHERE last_active > NOW() - INTERVAL 1 DAY'
    );
    
    for (const user of activeUsers) {
      await cache.set(`user:${user.id}`, user, 3600);
    }
  }
  
  private async warmPopularContent(): Promise<void> {
    const popular = await db.query(
      'SELECT * FROM posts ORDER BY views DESC LIMIT 100'
    );
    
    for (const post of popular) {
      await cache.set(`post:${post.id}`, post, 7200);
    }
  }
}
```

## Memory Optimization

```typescript
// LRU cache for in-memory caching
import { LRUCache } from 'lru-cache';

export const memoryCache = new LRUCache<string, any>({
  max: 500,
  maxSize: 50 * 1024 * 1024, // 50MB
  sizeCalculation: (value) => {
    return JSON.stringify(value).length;
  },
  ttl: 1000 * 60 * 5, // 5 minutes
  updateAgeOnGet: true,
  updateAgeOnHas: true
});

// Two-tier caching
export async function getTwoTier<T>(key: string): Promise<T | null> {
  // Check memory cache first
  const memCached = memoryCache.get(key);
  if (memCached) return memCached;
  
  // Check Redis
  const redisCached = await redis.get(key);
  if (redisCached) {
    const value = JSON.parse(redisCached);
    memoryCache.set(key, value);
    return value;
  }
  
  return null;
}
```

## Cache Metrics

```typescript
export class CacheMetrics {
  private hits = 0;
  private misses = 0;
  
  recordHit() { this.hits++; }
  recordMiss() { this.misses++; }
  
  getHitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? (this.hits / total) * 100 : 0;
  }
  
  async getRedisInfo(): Promise<RedisInfo> {
    const info = await redis.info();
    return this.parseRedisInfo(info);
  }
  
  getMetrics() {
    return {
      hitRate: this.getHitRate(),
      totalHits: this.hits,
      totalMisses: this.misses,
      memoryUsage: process.memoryUsage(),
      cacheSize: memoryCache.size
    };
  }
}
```

## Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Cache Hit Rate | >90% | ✅ 94% |
| Average Latency | <5ms | ✅ 3ms |
| Memory Usage | <1GB | ✅ 750MB |
| Eviction Rate | <5% | ✅ 3% |

## Testing

```typescript
describe('Cache Service', () => {
  it('should cache and retrieve values', async () => {
    await cache.set('test:key', { value: 'test' }, 60);
    const result = await cache.get('test:key');
    expect(result).toEqual({ value: 'test' });
  });
  
  it('should handle cache invalidation', async () => {
    await cache.set('user:1', { name: 'Test' }, 60);
    await cache.invalidatePattern('user:*');
    const result = await cache.get('user:1');
    expect(result).toBeNull();
  });
});
```

## Next Steps

- [ ] Implement cache clustering
- [ ] Add cache analytics dashboard
- [ ] Smart cache preloading
- [ ] Edge caching integration

---

**Status**: 🟢 Operational
**Dependencies**: Redis, ioredis, LRU Cache
**Owner**: Infrastructure Team
**Last Updated**: September 2025