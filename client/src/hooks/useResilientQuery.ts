/**
 * Resilient Query Hook with validation, caching, and fallback support
 */

import { useQuery, useMutation, UseQueryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { ResilientAPI } from '@shared/resilience/api';
import { queryClient } from '@/lib/queryClient';
import { guards } from '@shared/resilience/guards';

interface ResilientQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryFn'> {
  endpoint: string;
  schema: z.ZodSchema<T>;
  fallback?: T;
  cacheKey?: string;
  degradedMode?: boolean;
  onValidationError?: (error: z.ZodError) => void;
}

interface ResilientQueryResult<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  isOffline: boolean;
  isDegraded: boolean;
  hasFallback: boolean;
  refetch: () => void;
}

/**
 * Custom hook for resilient data fetching
 */
export function useResilientQuery<T>({
  endpoint,
  schema,
  fallback,
  cacheKey,
  degradedMode = false,
  onValidationError,
  ...queryOptions
}: ResilientQueryOptions<T>): ResilientQueryResult<T> {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const query = useQuery({
    queryKey: [endpoint, cacheKey],
    queryFn: async () => {
      // If offline and we have a fallback, use it immediately
      if (isOffline && fallback) {
        console.log(`[useResilientQuery] Offline mode - using fallback for ${endpoint}`);
        return fallback;
      }
      
      // If in degraded mode, try cache first
      if (degradedMode) {
        const cachedData = queryClient.getQueryData<T>([endpoint, cacheKey]);
        if (cachedData) {
          console.log(`[useResilientQuery] Degraded mode - using cache for ${endpoint}`);
          return cachedData;
        }
      }
      
      // Use resilient API for fetching
      try {
        const data = await ResilientAPI.get({
          endpoint,
          schema,
          fallback,
          cache: cacheKey ? {
            key: cacheKey,
            ttl: 5 * 60 * 1000 // 5 minutes default
          } : undefined
        });
        
        return data;
      } catch (error) {
        // Handle validation errors specially
        if (error instanceof Error && error.message.includes('Validation')) {
          const zodError = error as unknown as z.ZodError;
          onValidationError?.(zodError);
        }
        
        // If we have a fallback and fetch failed, use it
        if (fallback) {
          console.warn(`[useResilientQuery] Using fallback due to error for ${endpoint}:`, error);
          return fallback;
        }
        
        throw error;
      }
    },
    
    // React Query options for resilience
    staleTime: queryOptions.staleTime ?? 30 * 1000, // 30 seconds
    gcTime: queryOptions.gcTime ?? 10 * 60 * 1000, // 10 minutes
    
    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (error instanceof Error && error.message.includes('Validation')) {
        return false;
      }
      // Don't retry on 4xx errors (except 429)
      if (error instanceof Error && error.message.includes('Client error') && !error.message.includes('429')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Keep previous data on error
    keepPreviousData: true,
    
    // Don't refetch on window focus if offline
    refetchOnWindowFocus: !isOffline,
    
    // Don't refetch on reconnect if we have data
    refetchOnReconnect: (query) => !query.state.data,
    
    // Enable query only if not offline without fallback
    enabled: queryOptions.enabled !== false && (!isOffline || !!fallback),
    
    ...queryOptions
  });
  
  // Enhanced return with additional resilience info
  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    isOffline,
    isDegraded: degradedMode || (isOffline && !!query.data),
    hasFallback: !!fallback,
    refetch: query.refetch
  };
}

/**
 * Hook for resilient mutations
 */
export function useResilientMutation<TData = unknown, TVariables = void>({
  mutationFn,
  onSuccess,
  onError,
  ...options
}: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  [key: string]: any;
}) {
  const [isOffline] = useState(!navigator.onLine);
  
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      // Check if offline
      if (isOffline) {
        // Queue mutation for later (could implement with IndexedDB)
        console.warn('[useResilientMutation] Offline - queueing mutation');
        throw new Error('Cannot perform this action while offline');
      }
      
      try {
        const result = await mutationFn(variables);
        return result;
      } catch (error) {
        console.error('[useResilientMutation] Mutation failed:', error);
        throw error;
      }
    },
    
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries();
      onSuccess?.(data, variables);
    },
    
    onError: (error: Error, variables) => {
      console.error('[useResilientMutation] Error:', error);
      onError?.(error, variables);
    },
    
    retry: (failureCount, error) => {
      // Don't retry on client errors
      if (error instanceof Error && error.message.includes('4')) {
        return false;
      }
      return failureCount < 2;
    },
    
    ...options
  });
}

/**
 * Hook for offline cache management
 */
export function useOfflineCache<T>(key: string) {
  const [cachedData, setCachedData] = useState<T | null>(null);
  
  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(`offline-cache-${key}`);
    if (stored) {
      try {
        setCachedData(JSON.parse(stored));
      } catch {
        console.warn(`[useOfflineCache] Failed to parse cache for ${key}`);
      }
    }
  }, [key]);
  
  const save = (data: T) => {
    try {
      localStorage.setItem(`offline-cache-${key}`, JSON.stringify(data));
      setCachedData(data);
    } catch (error) {
      console.error(`[useOfflineCache] Failed to save cache for ${key}:`, error);
    }
  };
  
  const clear = () => {
    localStorage.removeItem(`offline-cache-${key}`);
    setCachedData(null);
  };
  
  return { data: cachedData, save, clear };
}