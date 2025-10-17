// ESA LIFE CEO 61x21 - LAYER 4 & 58: Replit OAuth API Client
// No CSRF needed with Replit OAuth - uses session cookies

interface ApiOptions extends RequestInit {
  // LAYER 4 Fix: Auth state handling for public routes
  requireAuth?: boolean;
}

class ApiClient {
  private baseUrl = '';
  private defaultOptions: RequestInit = {
    credentials: 'include', // Always include cookies for Replit OAuth session
  };

  // Generic request method with auth-aware error handling
  private async request<T = any>(
    url: string,
    options: ApiOptions = {}
  ): Promise<T> {
    const { requireAuth = false, ...fetchOptions } = options;
    
    // LAYER 4 Fix: Simple header setup - no CSRF needed
    const headers = new Headers(fetchOptions.headers);

    // Ensure JSON content type for non-FormData bodies
    if (!(fetchOptions.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      ...this.defaultOptions,
      ...fetchOptions,
      headers,
    });

    // Handle non-2xx responses
    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use status text
      }

      throw new Error(errorMessage);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    return response.json();
  }

  // GET request
  async get<T = any>(url: string, options: ApiOptions = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'GET',
    });
  }

  // POST request
  async post<T = any>(
    url: string,
    data?: any,
    options: ApiOptions = {}
  ): Promise<T> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body,
    });
  }

  // PUT request
  async put<T = any>(
    url: string,
    data?: any,
    options: ApiOptions = {}
  ): Promise<T> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body,
    });
  }

  // PATCH request
  async patch<T = any>(
    url: string,
    data?: any,
    options: ApiOptions = {}
  ): Promise<T> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body,
    });
  }

  // DELETE request
  async delete<T = any>(url: string, options: ApiOptions = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'DELETE',
    });
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Export convenience methods
export const apiGet = apiClient.get.bind(apiClient);
export const apiPost = apiClient.post.bind(apiClient);
export const apiPut = apiClient.put.bind(apiClient);
export const apiPatch = apiClient.patch.bind(apiClient);
export const apiDelete = apiClient.delete.bind(apiClient);

// Export the client instance for advanced usage
export default apiClient;

// LAYER 58 Fix: Simplified API request helper - no CSRF needed
export function createApiRequest() {
  return {
    get: <T = any>(url: string, options?: ApiOptions) =>
      apiGet<T>(url, options),
    
    post: <T = any>(url: string, data?: any, options?: ApiOptions) =>
      apiPost<T>(url, data, options),
    
    put: <T = any>(url: string, data?: any, options?: ApiOptions) =>
      apiPut<T>(url, data, options),
    
    patch: <T = any>(url: string, data?: any, options?: ApiOptions) =>
      apiPatch<T>(url, data, options),
    
    delete: <T = any>(url: string, options?: ApiOptions) =>
      apiDelete<T>(url, options),
  };
}