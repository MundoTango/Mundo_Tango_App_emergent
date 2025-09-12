// ESA LIFE CEO 61x21 - Global API Client with CSRF Support
import { getCsrfHeaders } from '@/contexts/CsrfContext';

interface ApiOptions extends RequestInit {
  skipCsrf?: boolean;
  csrfToken?: string | null;
}

class ApiClient {
  private baseUrl = '';
  private defaultOptions: RequestInit = {
    credentials: 'include', // Always include cookies for session
  };

  // Generic request method
  private async request<T = any>(
    url: string,
    options: ApiOptions = {}
  ): Promise<T> {
    const { skipCsrf = false, csrfToken, ...fetchOptions } = options;
    
    // Merge headers with CSRF token if not skipped
    const headers = new Headers(fetchOptions.headers);
    
    // Add CSRF token if available and not skipped
    if (!skipCsrf && csrfToken) {
      headers.set('x-csrf-token', csrfToken);
    }

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

// Helper function to create API request with CSRF token
export function createApiRequest(csrfToken: string | null) {
  return {
    get: <T = any>(url: string, options?: Omit<ApiOptions, 'csrfToken'>) =>
      apiGet<T>(url, { ...options, csrfToken }),
    
    post: <T = any>(url: string, data?: any, options?: Omit<ApiOptions, 'csrfToken'>) =>
      apiPost<T>(url, data, { ...options, csrfToken }),
    
    put: <T = any>(url: string, data?: any, options?: Omit<ApiOptions, 'csrfToken'>) =>
      apiPut<T>(url, data, { ...options, csrfToken }),
    
    patch: <T = any>(url: string, data?: any, options?: Omit<ApiOptions, 'csrfToken'>) =>
      apiPatch<T>(url, data, { ...options, csrfToken }),
    
    delete: <T = any>(url: string, options?: Omit<ApiOptions, 'csrfToken'>) =>
      apiDelete<T>(url, { ...options, csrfToken }),
  };
}