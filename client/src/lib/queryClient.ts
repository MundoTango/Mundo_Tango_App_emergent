import { QueryClient, QueryFunction } from "@tanstack/react-query";

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
      const data = await response.json();
      csrfToken = data.csrfToken;
    }
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
}

// Initialize CSRF token on app start
fetchCsrfToken();

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
      staleTime: 0, // Allow immediate updates after mutations (Sept 30, 2025 fix)
      gcTime: 30 * 60 * 1000, // ESA Layer 14: Keep cache for 30min to prevent premature garbage collection
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
