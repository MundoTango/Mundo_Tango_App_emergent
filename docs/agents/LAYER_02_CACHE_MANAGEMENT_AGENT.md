# Layer 02: Cache Management Agent
**Division:** Foundation Layer  
**Category:** Performance Infrastructure  
**Complexity:** Medium  
**Dependencies:** Redis (planned), React Query (client-side)  
**Version:** 1.0 | **Last Updated:** October 19, 2025

## Agent Identity

**Role:** Cache Strategy & Performance Optimization  
**Responsibility:** Reduce database load through intelligent caching, manage cache invalidation, optimize query performance

**Key Files:**
- `server/services/cache.ts` - Server-side cache (planned)
- `client/src/lib/queryClient.ts` - React Query client cache (97 references)

---

## Architecture

### **Multi-Layer Caching**

```
┌─────────────────────────────────────┐
│  Layer 1: Browser Cache (Static)   │ ← HTML/CSS/JS/Images
├─────────────────────────────────────┤
│  Layer 2: React Query (Client)     │ ← API responses, user data
├─────────────────────────────────────┤
│  Layer 3: Redis (Server) *planned  │ ← Database query results
├─────────────────────────────────────┤
│  Layer 4: PostgreSQL (Database)    │ ← Source of truth
└─────────────────────────────────────┘
```

---

## Client-Side Caching (React Query)

### **Pattern 1: Query Caching**

```typescript
// client/src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Usage: Automatic caching
function PostList() {
  const { data: posts } = useQuery({
    queryKey: ['/api/posts'],
    // Results cached for 5 minutes
  });

  return <div>{posts?.map(post => <PostCard key={post.id} post={post} />)}</div>;
}
```

---

### **Pattern 2: Cache Invalidation**

```typescript
import { queryClient } from '@lib/queryClient';

// After creating post
const createPostMutation = useMutation({
  mutationFn: (data) => apiRequest('/api/posts', { method: 'POST', body: data }),
  onSuccess: () => {
    // Invalidate all post-related queries
    queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    
    // Also invalidate user profile (post count changed)
    queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
  },
});
```

---

### **Pattern 3: Optimistic Updates**

```typescript
const likePostMutation = useMutation({
  mutationFn: (postId: number) =>
    apiRequest(`/api/posts/${postId}/like`, { method: 'POST' }),
  
  onMutate: async (postId) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['/api/posts', postId] });

    // Snapshot previous value
    const previousPost = queryClient.getQueryData(['/api/posts', postId]);

    // Optimistically update
    queryClient.setQueryData(['/api/posts', postId], (old: any) => ({
      ...old,
      likeCount: old.likeCount + 1,
      isLiked: true,
    }));

    return { previousPost };
  },

  onError: (err, postId, context) => {
    // Rollback on error
    queryClient.setQueryData(['/api/posts', postId], context?.previousPost);
  },

  onSettled: (data, error, postId) => {
    // Refetch after mutation
    queryClient.invalidateQueries({ queryKey: ['/api/posts', postId] });
  },
});
```

---

### **Pattern 4: Hierarchical Cache Keys**

```typescript
// ✅ GOOD: Hierarchical keys allow granular invalidation
const queryKey = ['/api/posts', postId];                    // Single post
const queryKey = ['/api/posts', { userId: 1 }];             // User's posts
const queryKey = ['/api/posts', { tag: 'tango' }];          // Tagged posts

// Invalidate specific subset
queryClient.invalidateQueries({ queryKey: ['/api/posts', postId] });

// Invalidate all posts
queryClient.invalidateQueries({ queryKey: ['/api/posts'] });

// ❌ BAD: Flat keys make invalidation difficult
const queryKey = [`/api/posts/${postId}`];  // Can't invalidate all posts easily
```

---

## Server-Side Caching (Planned - Redis)

### **Pattern 1: Redis Setup**

```typescript
// server/services/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // 5 minutes
): Promise<T> {
  // Check cache
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const fresh = await fetcher();

  // Store in cache
  await redis.set(key, JSON.stringify(fresh), 'EX', ttl);

  return fresh;
}

// Usage
app.get('/api/posts/:id', authMiddleware, async (req, res) => {
  const postId = parseInt(req.params.id);

  const post = await getCached(
    `post:${postId}`,
    () => db.query.posts.findFirst({ where: eq(posts.id, postId) }),
    300 // Cache for 5 minutes
  );

  res.json(apiSuccess({ data: post }));
});
```

---

### **Pattern 2: Cache Invalidation**

```typescript
export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// After creating post
app.post('/api/posts', authMiddleware, async (req, res) => {
  const [post] = await db.insert(posts).values(req.body).returning();

  // Invalidate post list cache
  await invalidateCache('posts:list:*');

  res.json(apiSuccess({ data: post }));
});

// After updating post
app.patch('/api/posts/:id', authMiddleware, async (req, res) => {
  const postId = parseInt(req.params.id);

  await db.update(posts).set(req.body).where(eq(posts.id, postId));

  // Invalidate specific post cache
  await invalidateCache(`post:${postId}`);

  res.json(apiSuccess({ message: 'Post updated' }));
});
```

---

## Cache Strategies

### **1. Time-Based Expiration (TTL)**

```typescript
// Short TTL for frequently changing data
await redis.set('trending:posts', JSON.stringify(posts), 'EX', 60); // 1 minute

// Long TTL for rarely changing data
await redis.set('user:settings', JSON.stringify(settings), 'EX', 3600); // 1 hour

// Very long TTL for static data
await redis.set('city:list', JSON.stringify(cities), 'EX', 86400); // 24 hours
```

---

### **2. Cache-Aside Pattern**

```typescript
async function getUser(userId: number): Promise<User> {
  // 1. Try cache first
  const cached = await redis.get(`user:${userId}`);
  if (cached) return JSON.parse(cached);

  // 2. Fetch from database
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  // 3. Store in cache
  await redis.set(`user:${userId}`, JSON.stringify(user), 'EX', 300);

  return user;
}
```

---

### **3. Write-Through Cache**

```typescript
async function updateUser(userId: number, data: any): Promise<User> {
  // 1. Update database
  const [user] = await db.update(users)
    .set(data)
    .where(eq(users.id, userId))
    .returning();

  // 2. Update cache immediately
  await redis.set(`user:${userId}`, JSON.stringify(user), 'EX', 300);

  return user;
}
```

---

## Performance Metrics

### **Cache Hit Rate**

```typescript
let cacheHits = 0;
let cacheMisses = 0;

export async function getCachedWithMetrics<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key);

  if (cached) {
    cacheHits++;
    console.log(`Cache hit rate: ${(cacheHits / (cacheHits + cacheMisses)) * 100}%`);
    return JSON.parse(cached);
  }

  cacheMisses++;
  const fresh = await fetcher();
  await redis.set(key, JSON.stringify(fresh), 'EX', 300);

  return fresh;
}
```

**Target:** >80% cache hit rate for production

---

## Best Practices

### **✅ DO:**
- Cache expensive queries (joins, aggregations)
- Use appropriate TTLs for different data types
- Invalidate cache after mutations
- Monitor cache hit rates
- Use hierarchical cache keys

### **❌ DON'T:**
- Cache user-specific sensitive data (passwords, tokens)
- Use cache for real-time data (live chat messages)
- Forget to handle cache misses
- Cache everything blindly
- Use very long TTLs for frequently changing data

---

## Testing

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Cache Management Agent', () => {
  beforeEach(async () => {
    await redis.flushdb(); // Clear cache
  });

  it('caches query results', async () => {
    const key = 'test:user:1';
    const user = { id: 1, name: 'Test' };

    // First call: Cache miss
    const result1 = await getCached(key, async () => user);
    expect(result1).toEqual(user);

    // Second call: Cache hit
    const result2 = await getCached(key, async () => {
      throw new Error('Should not be called');
    });
    expect(result2).toEqual(user);
  });

  it('invalidates cache', async () => {
    await redis.set('post:1', JSON.stringify({ id: 1 }));
    await invalidateCache('post:*');

    const cached = await redis.get('post:1');
    expect(cached).toBeNull();
  });
});
```

---

## Related Agents

- **Layer 01: Database Connection** - Source of truth
- **Layer 47: Feed Ranking** - Heavy caching user
- **Layer 48: Recommendation Engine** - ML model caching

**Next:** Read `docs/MT_REACT_QUERY_V5_GUIDE.md` for client-side caching patterns
