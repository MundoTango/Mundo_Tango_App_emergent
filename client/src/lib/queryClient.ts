import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

// MB.MD FIX: Clear ALL React Query caches to prevent queryFn errors
if (typeof window !== 'undefined') {
  try {
    window.localStorage.removeItem('MUNDO_TANGO_QUERY_CACHE');
    window.localStorage.removeItem('MUNDO_TANGO_QUERY_CACHE_V2');
    console.log('✅ Cleared stale React Query caches');
  } catch (e) {
    console.warn('[Cache Clear] Failed:', e);
  }
}

// Store CSRF token
let csrfToken: string | null = null;

// Fetch CSRF token
async function fetchCsrfToken() {
  try {
    // ESA Framework Layer 3: Use correct security endpoint
    const response = await fetch('/api/security/csrf-token', {
      credentials: 'include'
    });
    if (response.ok) {
      // Safely parse JSON - catch parse errors
      try {
        const data = await response.json();
        csrfToken = data.csrfToken;
      } catch (parseError) {
        console.warn('CSRF endpoint returned non-JSON response (expected during development)');
      }
    } else {
      // CSRF endpoint not available - silent fail (not critical for app to load)
      console.warn('CSRF token endpoint not available (expected during development)');
    }
  } catch (error) {
    // Silent fail - don't block app loading
    console.warn('CSRF token fetch failed (non-critical)');
  }
}

// Initialize CSRF token on app start (non-blocking, don't await)
fetchCsrfToken().catch(() => {
  // Prevent uncaught promise rejection from breaking React render
});

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  options?: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  }
): Promise<Response> {
  const method = options?.method || 'GET';
  const headers: Record<string, string> = options?.headers || {};
  
  // Add CSRF token for state-changing requests
  if (method !== 'GET' && method !== 'HEAD' && csrfToken) {
    headers['x-csrf-token'] = csrfToken;
  }
  
  let body: any = undefined;
  
  if (options?.body) {
    if (options.body instanceof FormData) {
      // Don't set Content-Type for FormData - let browser set it with boundary
      body = options.body;
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(options.body);
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
    credentials: "include", // This ensures session cookies are sent with the request
  });

  // If we get a 403 with CSRF error, try refreshing the token
  if (res.status === 403) {
    const text = await res.text();
    if (text.includes('Invalid CSRF token')) {
      await fetchCsrfToken();
      // Retry the request with new token
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
        const retryRes = await fetch(url, {
          method,
          headers,
          body,
          credentials: "include",
        });
        await throwIfResNotOk(retryRes);
        return retryRes;
      }
    }
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const [url, params] = queryKey;
    
    let fetchUrl = url as string;
    if (params && typeof params === 'object') {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fetchUrl = `${fetchUrl}?${queryString}`;
      }
    }
    
    const res = await fetch(fetchUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: "include", // Session cookies for authentication
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // Phase 14: 5 minutes - use cached data before refetching
      gcTime: 30 * 60 * 1000, // ESA Layer 14: Keep cache for 30min to prevent premature garbage collection
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Phase 14 Batch 4: localStorage persistence DISABLED
// MB.MD FIX: persistQueryClient rehydrates queries WITHOUT the default queryFn,
// causing "No queryFn" errors. Disabling persistence until we implement proper
// query dehydration/rehydration with queryFn preservation.
// 
// if (typeof window !== 'undefined') {
//   const persister = createSyncStoragePersister({
//     storage: window.localStorage,
//     key: 'MUNDO_TANGO_QUERY_CACHE_V2',
//   });
//   persistQueryClient({
//     queryClient,
//     persister,
//     maxAge: 1000 * 60 * 60 * 24,
//     dehydrateOptions: {
//       shouldDehydrateQuery: (query) => query.state.status === 'success',
//     },
//   });
// }
