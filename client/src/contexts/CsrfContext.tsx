// ESA LIFE CEO 61x21 - CSRF Token Management Context
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CsrfContextType {
  csrfToken: string | null;
  refreshToken: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const CsrfContext = createContext<CsrfContextType | undefined>(undefined);

export function CsrfProvider({ children }: { children: ReactNode }) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCsrfToken = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/security/csrf-token', {
        method: 'GET',
        credentials: 'include', // Important: include cookies for session
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.token) {
        setCsrfToken(data.token);
        console.log('✅ CSRF token fetched successfully');
      } else {
        throw new Error('No CSRF token in response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch CSRF token';
      console.error('❌ CSRF token fetch error:', errorMessage);
      setError(errorMessage);
      // Don't throw - allow app to continue with null token
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch token on mount
  useEffect(() => {
    fetchCsrfToken();
  }, []);

  // Refresh token method for manual refresh
  const refreshToken = async () => {
    await fetchCsrfToken();
  };

  return (
    <CsrfContext.Provider value={{ csrfToken, refreshToken, isLoading, error }}>
      {children}
    </CsrfContext.Provider>
  );
}

// Hook to use CSRF token
export function useCsrfToken() {
  const context = useContext(CsrfContext);
  if (context === undefined) {
    throw new Error('useCsrfToken must be used within a CsrfProvider');
  }
  return context;
}

// Helper function to get CSRF headers
export function getCsrfHeaders(token: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['x-csrf-token'] = token;
  }
  
  return headers;
}

// Default export for convenience
export default CsrfContext;