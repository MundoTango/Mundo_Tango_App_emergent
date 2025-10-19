# Mundo Tango React Query V5 State Management Guide
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Library:** TanStack React Query V5  
**References:** 1,304 codebase instances

## Overview

Mundo Tango uses **React Query V5** for server state management, caching, and data synchronization across 97 pages and 467 components. This guide covers actual production patterns used in the ESA LIFE CEO platform.

**Key Features:**
- ✅ Automatic caching & background refetching
- ✅ Optimistic updates for instant UI
- ✅ Default queryFn configured (no repetitive fetch logic)
- ✅ CSRF token handling built-in
- ✅ Persisted cache (localStorage sync)

---

## Configuration

### **Location:** `client/src/lib/queryClient.ts`

```typescript
import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

// Default queryFn (✅ CONFIGURED - see DOCUMENTATION_ERRATA.md for troubleshooting)
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }), // ← AUTO-FETCH from queryKey
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 30 * 60 * 1000,        // 30 minutes (formerly cacheTime)
      retry: false,
    },
  },
});

// Helper for fetching (with CSRF token)
export const getQueryFn: <T>(options: { on401: "returnNull" | "throw" }) => 
  QueryFunction<T> = (options) => async ({ queryKey }) => {
    const url = queryKey[0] as string;
    
    if (!url.startsWith('/api/')) {
      throw new Error('Query keys must start with /api/');
    }

    const res = await apiRequest(url);
    
    if (res.status === 401) {
      if (options.on401 === "returnNull") return null as T;
      throw new Error('Unauthorized');
    }

    return await res.json();
};

// Persist cache to localStorage
const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

persistQueryClient({
  queryClient,
  persister,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
});
```

**How Default QueryFn Works:**
1. Query key must be API endpoint: `queryKey: ['/api/users/123']`
2. Automatically fetches from that URL
3. Includes CSRF token for security
4. Returns JSON response

---

## Query Patterns

### **Pattern 1: Basic Data Fetching**

```typescript
import { useQuery } from '@tanstack/react-query';
import type { User } from '@shared/schema';

function UserProfile({ userId }: { userId: number }) {
  const { data, isLoading, error } = useQuery<User>({
    queryKey: ['/api/users', userId],  // ← Auto-fetches from /api/users/${userId}
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.bio}</p>
    </div>
  );
}
```

**Key Points:**
- ✅ No `queryFn` needed (uses default from queryClient)
- ✅ Type-safe with generic `<User>`
- ✅ Auto-refetches when `userId` changes
- ✅ Cached for 5 minutes (`staleTime`)

---

### **Pattern 2: List Queries with Pagination**

```typescript
import { useQuery } from '@tanstack/react-query';
import type { Post } from '@shared/schema';

interface PostsResponse {
  data: Post[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function PostList() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PostsResponse>({
    queryKey: ['/api/posts', { page, limit: 20 }], // ← Query params auto-appended
  });

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {data?.data.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
      
      <Pagination
        currentPage={page}
        totalPages={data?.meta.totalPages || 1}
        onPageChange={setPage}
      />
    </div>
  );
}
```

**Query Key Best Practices:**
```typescript
// ✅ GOOD: Hierarchical array segments
queryKey: ['/api/posts', userId]          // Cache per user
queryKey: ['/api/posts', { page, limit }] // Cache per page

// ❌ BAD: String interpolation (cache invalidation breaks)
queryKey: [`/api/posts/${userId}`]        // Can't invalidate all user posts
queryKey: [`/api/posts?page=${page}`]     // Cache duplication
```

---

### **Pattern 3: Dependent Queries**

```typescript
function PostDetail({ postId }: { postId: number }) {
  // First query: Get post
  const { data: post } = useQuery<Post>({
    queryKey: ['/api/posts', postId],
  });

  // Second query: Get author (depends on post data)
  const { data: author } = useQuery<User>({
    queryKey: ['/api/users', post?.userId],
    enabled: !!post?.userId, // ← Only fetch when post loaded
  });

  return (
    <div>
      <h1>{post?.title}</h1>
      <p>By {author?.name}</p>
    </div>
  );
}
```

---

### **Pattern 4: Mutations (Create/Update/Delete)**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@lib/queryClient';

function CreatePostForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newPost: InsertPost) => {
      const res = await apiRequest('/api/posts', {
        method: 'POST',
        body: newPost,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      // Invalidate posts cache to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      
      // Show success toast
      toast.success('Post created!');
    },
    onError: (error) => {
      toast.error('Failed to create post');
    },
  });

  const handleSubmit = (formData: InsertPost) => {
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button 
        type="submit" 
        disabled={mutation.isPending}
        data-testid="button-create-post"
      >
        {mutation.isPending ? 'Creating...' : 'Create Post'}
      </Button>
    </form>
  );
}
```

**Mutation Pattern:**
1. `mutationFn`: API call logic
2. `onSuccess`: Invalidate cache, show toast
3. `onError`: Handle errors
4. `isPending`: Show loading state

---

### **Pattern 5: Optimistic Updates**

```typescript
function LikeButton({ postId }: { postId: number }) {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(`/api/posts/${postId}/like`, {
        method: 'POST',
      });
      return await res.json();
    },
    
    // Optimistic update (instant UI feedback)
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/posts', postId] });
      
      // Snapshot previous value
      const previousPost = queryClient.getQueryData(['/api/posts', postId]);
      
      // Optimistically update cache
      queryClient.setQueryData(['/api/posts', postId], (old: any) => ({
        ...old,
        likeCount: old.likeCount + 1,
        isLiked: true,
      }));
      
      return { previousPost };
    },
    
    // Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(['/api/posts', postId], context?.previousPost);
      toast.error('Failed to like post');
    },
    
    // Refetch to sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts', postId] });
    },
  });

  return (
    <Button onClick={() => likeMutation.mutate()}>
      Like {/* UI updates instantly, then syncs with server */}
    </Button>
  );
}
```

---

## Cache Management

### **Pattern 6: Manual Cache Invalidation**

```typescript
import { useQueryClient } from '@tanstack/react-query';

function SomeComponent() {
  const queryClient = useQueryClient();

  // Invalidate specific query
  const refreshUser = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
  };

  // Invalidate all users
  const refreshAllUsers = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/users'] });
  };

  // Invalidate everything
  const refreshAll = () => {
    queryClient.invalidateQueries();
  };

  // Manually set cache data
  const updateUserCache = (user: User) => {
    queryClient.setQueryData(['/api/users', user.id], user);
  };
}
```

---

### **Pattern 7: Prefetching Data**

```typescript
function PostList() {
  const queryClient = useQueryClient();

  const { data: posts } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
  });

  // Prefetch post details on hover
  const handleMouseEnter = (postId: number) => {
    queryClient.prefetchQuery({
      queryKey: ['/api/posts', postId],
    });
  };

  return (
    <div>
      {posts?.map(post => (
        <div
          key={post.id}
          onMouseEnter={() => handleMouseEnter(post.id)}
        >
          <Link to={`/posts/${post.id}`}>{post.title}</Link>
        </div>
      ))}
    </div>
  );
}
```

---

## Common Pitfalls & Solutions

### **❌ ISSUE: "No queryFn was passed" Error**

**Cause:** Query not using default queryFn from queryClient

```typescript
// ❌ WRONG: Overriding default queryFn
const { data } = useQuery({
  queryKey: ['/api/posts'],
  queryFn: undefined, // ← Breaks default!
});

// ❌ WRONG: Using different QueryClient instance
import { QueryClient } from '@tanstack/react-query';
const localClient = new QueryClient(); // ← No default queryFn!

const { data } = useQuery({
  queryKey: ['/api/posts'],
}, localClient);

// ✅ CORRECT: Use default queryFn
const { data } = useQuery({
  queryKey: ['/api/posts'], // ← Auto-fetches
});

// ✅ CORRECT: Custom queryFn when needed
const { data } = useQuery({
  queryKey: ['/api/custom'],
  queryFn: async () => {
    // Custom fetch logic
    return await customFetch();
  },
});
```

**See:** `docs/DOCUMENTATION_ERRATA.md` for detailed troubleshooting

---

### **❌ ISSUE: Stale data not refetching**

**Cause:** `staleTime` too long or `refetchOnWindowFocus` disabled

```typescript
// Current config: 5 minutes staleTime
staleTime: 5 * 60 * 1000,

// Solution: Override per-query
const { data } = useQuery({
  queryKey: ['/api/realtime-data'],
  staleTime: 0, // Always refetch
  refetchInterval: 1000, // Poll every second
});
```

---

### **❌ ISSUE: Cache not invalidating after mutation**

**Cause:** Missing `invalidateQueries` call

```typescript
// ❌ WRONG: No cache invalidation
const mutation = useMutation({
  mutationFn: createPost,
  onSuccess: () => {
    toast.success('Created!');
    // Cache still shows old data!
  },
});

// ✅ CORRECT: Invalidate cache
const mutation = useMutation({
  mutationFn: createPost,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    toast.success('Created!');
  },
});
```

---

## Testing Patterns

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

describe('useQuery', () => {
  it('should fetch user data', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    const wrapper = ({ children }: any) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(
      () => useQuery({ queryKey: ['/api/users/1'] }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveProperty('name');
  });
});
```

---

## Performance Optimization

### **1. Reduce Unnecessary Refetches**

```typescript
// ✅ GOOD: Disable refetch for static data
const { data } = useQuery({
  queryKey: ['/api/countries'],
  staleTime: Infinity, // Never refetch (static data)
});

// ✅ GOOD: Conditional refetch
const { data } = useQuery({
  queryKey: ['/api/notifications'],
  refetchInterval: isTabActive ? 30000 : false, // Only poll when tab active
});
```

---

### **2. Selective Cache Updates**

```typescript
// ❌ BAD: Invalidate entire list
queryClient.invalidateQueries({ queryKey: ['/api/posts'] });

// ✅ BETTER: Update single item in cache
queryClient.setQueryData(['/api/posts', postId], updatedPost);
queryClient.setQueryData(['/api/posts'], (old: Post[]) => 
  old.map(p => p.id === postId ? updatedPost : p)
);
```

---

### **3. Request Deduplication**

React Query automatically deduplicates identical requests:

```typescript
// Both components request same data simultaneously
function ComponentA() {
  const { data } = useQuery({ queryKey: ['/api/user'] });
}

function ComponentB() {
  const { data } = useQuery({ queryKey: ['/api/user'] });
}

// ✅ Only 1 network request made, shared between components
```

---

## Agent Usage Examples

### **Mr Blue AI Streaming Chat**

```typescript
function MrBlueChat() {
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest('/api/mrblue/chat', {
        method: 'POST',
        body: { content },
      });
      
      // Handle streaming response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        setMessages(prev => [...prev.slice(0, -1), {
          ...prev[prev.length - 1],
          content: prev[prev.length - 1].content + chunk,
        }]);
      }
    },
  });

  return (
    <div>
      {messages.map(msg => <div key={msg.id}>{msg.content}</div>)}
      <input onSubmit={(e) => sendMessage.mutate(e.target.value)} />
    </div>
  );
}
```

### **Life CEO Agent Dashboard**

```typescript
function LifeCEODashboard() {
  // Query all 16 Life CEO domains
  const { data: financeData } = useQuery({ queryKey: ['/api/lifeceo/finance'] });
  const { data: healthData } = useQuery({ queryKey: ['/api/lifeceo/health'] });
  const { data: careerData } = useQuery({ queryKey: ['/api/lifeceo/career'] });
  // ... 13 more domains

  // All queries run in parallel, cached independently
  return (
    <div>
      <FinanceWidget data={financeData} />
      <HealthWidget data={healthData} />
      <CareerWidget data={careerData} />
    </div>
  );
}
```

---

## Debugging Tools

### **React Query DevTools**

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**Features:**
- View all queries & their state
- Inspect cache data
- Manually invalidate/refetch
- See query timings

---

## Next Steps

1. Read `docs/DOCUMENTATION_ERRATA.md` for React Query troubleshooting
2. See `docs/MT_API_CONVENTIONS.md` for API endpoint patterns
3. Review `client/src/lib/queryClient.ts` for complete configuration

**Related Files:**
- `client/src/lib/queryClient.ts` - QueryClient setup
- `client/src/hooks/use-*.tsx` - Custom React Query hooks
- `docs/DOCUMENTATION_ERRATA.md` - Common issues & fixes
