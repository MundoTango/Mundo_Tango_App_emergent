# ESA Layer 7: State Management Agent 📊

## Overview
Layer 7 manages application state across client and server, including global state, server state caching, and state synchronization using React Query and Context API.

## Core Responsibilities

### 1. Server State Management
- API response caching
- Query invalidation
- Optimistic updates
- Background refetching
- Infinite queries

### 2. Client State Management
- Global application state
- Component state orchestration
- State persistence
- State hydration
- State debugging

### 3. State Synchronization
- Real-time state updates
- Cross-tab synchronization
- Offline state management
- Conflict resolution
- State migrations

## Open Source Packages

```json
{
  "@tanstack/react-query": "^5.17.9",
  "@reduxjs/toolkit": "^2.0.1",
  "react-redux": "^9.0.4",
  "zustand": "^4.4.7"
}
```

## Integration Points

- **Layer 8 (Client Framework)**: React integration
- **Layer 11 (Real-time)**: WebSocket state updates
- **Layer 14 (Caching)**: Cache coordination
- **Layer 47 (Mobile)**: State persistence
- **Layer 53 (i18n)**: Language preference state

## Implementation Example

```typescript
// React Query Configuration
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: 2,
      onError: (error) => {
        console.error('Mutation error:', error);
      }
    }
  }
});

// Custom query hook with caching
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 10 * 60 * 1000,
    select: (data) => ({
      ...data,
      displayName: data.name || data.email
    })
  });
}

// Optimistic update example
export function useUpdateUser() {
  return useMutation({
    mutationFn: updateUser,
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: ['user', newUser.id] });
      
      const previousUser = queryClient.getQueryData(['user', newUser.id]);
      
      queryClient.setQueryData(['user', newUser.id], newUser);
      
      return { previousUser };
    },
    onError: (err, newUser, context) => {
      queryClient.setQueryData(['user', newUser.id], context?.previousUser);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    }
  });
}
```

## Zustand Global State

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  // State
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Notification[];
  user: User | null;
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  setUser: (user: User | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'light',
      sidebarOpen: true,
      notifications: [],
      user: null,
      
      // Actions
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      addNotification: (notification) => 
        set((state) => ({ 
          notifications: [...state.notifications, notification] 
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),
      setUser: (user) => set({ user })
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        theme: state.theme,
        sidebarOpen: state.sidebarOpen 
      })
    }
  )
);
```

## Context API Patterns

```typescript
// Auth Context
import { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check for existing session
    checkAuth().then(setUser).finally(() => setIsLoading(false));
  }, []);
  
  const login = async (credentials: LoginCredentials) => {
    const user = await authService.login(credentials);
    setUser(user);
  };
  
  const logout = () => {
    authService.logout();
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

## Infinite Queries

```typescript
// Infinite scroll implementation
export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) => fetchPosts({ page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    select: (data) => ({
      pages: data.pages.flatMap(page => page.posts),
      pageParams: data.pageParams
    })
  });
}

// Usage in component
function PostList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfinitePosts();
  
  return (
    <InfiniteScroll
      dataLength={data?.pages.length ?? 0}
      next={fetchNextPage}
      hasMore={hasNextPage ?? false}
      loader={<Spinner />}
    >
      {data?.pages.map(post => <PostCard key={post.id} post={post} />)}
    </InfiniteScroll>
  );
}
```

## Real-time State Updates

```typescript
// WebSocket integration with React Query
export function useRealtimeQuery<T>(queryKey: QueryKey, eventName: string) {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  
  useEffect(() => {
    if (!socket) return;
    
    const handleUpdate = (data: T) => {
      queryClient.setQueryData(queryKey, data);
    };
    
    socket.on(eventName, handleUpdate);
    
    return () => {
      socket.off(eventName, handleUpdate);
    };
  }, [socket, queryKey, eventName]);
}

// Usage
function LiveDashboard() {
  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard
  });
  
  useRealtimeQuery(['dashboard'], 'dashboard:update');
  
  return <Dashboard data={data} />;
}
```

## State Persistence

```typescript
// Persist React Query cache
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'REACT_QUERY_CACHE'
});

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  buster: process.env.REACT_APP_VERSION
});
```

## State DevTools

```typescript
// Development tools setup
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

// Zustand DevTools
import { devtools } from 'zustand/middleware';

const useStore = create<AppState>()(
  devtools(
    (set) => ({
      // ... state and actions
    }),
    { name: 'AppStore' }
  )
);
```

## Performance Patterns

| Pattern | Description |
|---------|------------|
| Query Deduplication | Automatic request deduplication |
| Stale-While-Revalidate | Serve cached data while fetching |
| Prefetching | Preload data before navigation |
| Optimistic Updates | Update UI before server confirms |
| Selective Rehydration | Persist only critical state |

## State Migration

```typescript
// Handle state structure changes
const migrations = {
  0: (state: any) => ({
    ...state,
    version: 1
  }),
  1: (state: any) => ({
    ...state,
    theme: state.darkMode ? 'dark' : 'light',
    version: 2
  })
};

export const migrateState = (persistedState: any) => {
  let state = persistedState;
  const currentVersion = state.version || 0;
  const latestVersion = Object.keys(migrations).length;
  
  for (let v = currentVersion; v < latestVersion; v++) {
    state = migrations[v](state);
  }
  
  return state;
};
```

## Testing

```typescript
// Testing React Query hooks
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('useUser', () => {
  it('should fetch user data', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
    
    const { result } = renderHook(() => useUser('123'), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data?.id).toBe('123');
  });
});
```

## Next Steps

- [ ] Implement state time-travel debugging
- [ ] Add state compression for large datasets
- [ ] Enhanced offline support
- [ ] State analytics and monitoring

---

**Status**: 🟢 Operational
**Dependencies**: React Query, Zustand, Redux Toolkit
**Owner**: Frontend Team
**Last Updated**: September 2025