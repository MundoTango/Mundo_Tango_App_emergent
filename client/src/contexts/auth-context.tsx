import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and validate user
    // In development, also try auth bypass endpoint
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // ESA Framework Layer 4: Fetch authenticated user from server
      const authResponse = await fetch('/api/auth/user', {
        credentials: 'include'
      });
      
      if (authResponse.ok) {
        const userData = await authResponse.json();
        if (userData && userData.id) {
          setUser(userData);
          console.log('🔑 ESA Auto-login: Pierre Dubois (admin@mundotango.life) authenticated');
          console.log('User authenticated via auth bypass:', userData);
          setIsLoading(false);
          return;
        }
      }

      // Otherwise check for token
      const token = localStorage.getItem('auth_token');
      if (token) {
        await validateToken(token);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setIsLoading(false);
    }
  };

  const validateToken = async (token: string) => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
        console.log('User authenticated:', data.data.user);
      } else {
        console.log('Token validation failed, removing token');
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('auth_token', data.data.api_token);
    setUser(data.data.user);
  };

  const register = async (userData: any) => {
    const response = await fetch('/api/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    localStorage.setItem('auth_token', data.data.api_token);
    setUser(data.data.user);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
