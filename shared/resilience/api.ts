/**
 * Resilient API Client with validation, caching, and fallback support
 */

import { z } from 'zod';
import { guards } from './guards';
import { ErrorHub } from './errorHub';

export interface ResilientOptions<T> {
  endpoint: string;
  schema: z.ZodSchema<T>;
  fallback?: T;
  retries?: number;
  timeout?: number;
  cache?: {
    key: string;
    ttl: number; // milliseconds
  };
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class ResilientAPI {
  private static memoryCache = new Map<string, CacheEntry<unknown>>();
  private static indexedDBName = 'resilient-cache';
  private static indexedDBVersion = 1;
  
  /**
   * Fetch with automatic retry and timeout
   */
  private static async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = 3,
    timeout = 5000
  ): Promise<Response> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          credentials: 'include' // Always include credentials
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) return response;
        
        // Don't retry client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Client error: ${response.status} ${response.statusText}`);
        }
        
        // Retry server errors (5xx) with backoff
        if (attempt === retries - 1) {
          throw new Error(`Server error after ${retries} attempts: ${response.status}`);
        }
        
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
      } catch (error) {
        if (attempt === retries - 1) {
          throw error;
        }
        
        // If aborted due to timeout, retry
        if (error instanceof Error && error.name === 'AbortError') {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error;
      }
    }
    
    throw new Error('Fetch failed after all retries');
  }
  
  /**
   * Main GET method with resilience
   */
  static async get<T>(options: ResilientOptions<T>): Promise<T> {
    const cacheKey = options.cache?.key || options.endpoint;
    
    try {
      // Check memory cache first
      const memoryCached = this.getFromMemoryCache<T>(cacheKey, options.cache?.ttl);
      if (memoryCached) {
        console.log(`[ResilientAPI] Cache hit (memory): ${cacheKey}`);
        return memoryCached;
      }
      
      // Check IndexedDB cache
      const indexedCached = await this.getFromIndexedDB<T>(cacheKey, options.cache?.ttl);
      if (indexedCached) {
        console.log(`[ResilientAPI] Cache hit (IndexedDB): ${cacheKey}`);
        // Update memory cache for faster access
        this.saveToMemoryCache(cacheKey, indexedCached, options.cache?.ttl || 300000);
        return indexedCached;
      }
      
      // Fetch from network
      const response = await this.fetchWithRetry(
        options.endpoint,
        {
          method: options.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          body: options.body ? JSON.stringify(options.body) : undefined
        },
        options.retries || 3,
        options.timeout || 5000
      );
      
      const data = await response.json();
      
      // Validate response
      const validated = options.schema.safeParse(data);
      if (!validated.success) {
        console.error('[ResilientAPI] Validation failed:', validated.error);
        throw new Error(`Validation failed: ${validated.error.message}`);
      }
      
      // Cache successful response
      if (options.cache) {
        await this.saveToCache(cacheKey, validated.data, options.cache.ttl);
      }
      
      return validated.data;
      
    } catch (error) {
      console.error(`[ResilientAPI] Request failed for ${options.endpoint}:`, error);
      
      // Handle error with ErrorHub
      const errorResult = await ErrorHub.handle(error as Error, {
        component: 'ResilientAPI',
        action: 'fetch',
        metadata: { endpoint: options.endpoint }
      });
      
      // Check if we should retry
      if (guards.isObject(errorResult) && errorResult.shouldRetry) {
        return this.get(options); // Retry the request
      }
      
      // Try fallback mechanisms
      return this.handleFailure(error as Error, options);
    }
  }
  
  /**
   * POST method with resilience
   */
  static async post<T>(options: ResilientOptions<T>): Promise<T> {
    return this.get({ ...options, method: 'POST' });
  }
  
  /**
   * PUT method with resilience
   */
  static async put<T>(options: ResilientOptions<T>): Promise<T> {
    return this.get({ ...options, method: 'PUT' });
  }
  
  /**
   * DELETE method with resilience
   */
  static async delete<T>(options: ResilientOptions<T>): Promise<T> {
    return this.get({ ...options, method: 'DELETE' });
  }
  
  /**
   * Handle failures with progressive fallback
   */
  private static async handleFailure<T>(
    error: Error,
    options: ResilientOptions<T>
  ): Promise<T> {
    console.warn('[ResilientAPI] Attempting fallback for:', options.endpoint);
    
    // Level 1: Try stale cache (any age)
    const staleCached = this.getFromMemoryCache<T>(options.cache?.key || options.endpoint);
    if (staleCached) {
      console.log('[ResilientAPI] Using stale memory cache');
      return staleCached;
    }
    
    // Level 2: Try IndexedDB (any age)
    const staleIndexed = await this.getFromIndexedDB<T>(options.cache?.key || options.endpoint);
    if (staleIndexed) {
      console.log('[ResilientAPI] Using stale IndexedDB cache');
      return staleIndexed;
    }
    
    // Level 3: Use provided fallback
    if (options.fallback !== undefined) {
      console.log('[ResilientAPI] Using provided fallback');
      return options.fallback;
    }
    
    // Level 4: Generate minimal fallback from schema
    const minimal = this.generateMinimalFallback<T>(options.schema);
    if (minimal) {
      console.log('[ResilientAPI] Using generated minimal fallback');
      return minimal;
    }
    
    // Last resort: throw the error
    throw error;
  }
  
  /**
   * Get from memory cache
   */
  private static getFromMemoryCache<T>(
    key: string,
    maxAge?: number
  ): T | null {
    const entry = this.memoryCache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    
    // Check if cache is still valid (if maxAge provided)
    if (maxAge !== undefined) {
      const age = Date.now() - entry.timestamp;
      if (age > maxAge) {
        this.memoryCache.delete(key);
        return null;
      }
    }
    
    return entry.data;
  }
  
  /**
   * Save to memory cache
   */
  private static saveToMemoryCache<T>(
    key: string,
    data: T,
    ttl: number
  ): void {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    // Limit cache size (LRU-style)
    if (this.memoryCache.size > 100) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) this.memoryCache.delete(firstKey);
    }
  }
  
  /**
   * Get from IndexedDB
   */
  private static async getFromIndexedDB<T>(
    key: string,
    maxAge?: number
  ): Promise<T | null> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return null;
    }
    
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);
      
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const entry = request.result as CacheEntry<T> | undefined;
          if (!entry) {
            resolve(null);
            return;
          }
          
          // Check age if specified
          if (maxAge !== undefined) {
            const age = Date.now() - entry.timestamp;
            if (age > maxAge) {
              resolve(null);
              return;
            }
          }
          
          resolve(entry.data);
        };
        
        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }
  
  /**
   * Save to both memory and IndexedDB cache
   */
  private static async saveToCache<T>(
    key: string,
    data: T,
    ttl: number
  ): Promise<void> {
    // Save to memory cache
    this.saveToMemoryCache(key, data, ttl);
    
    // Save to IndexedDB
    if (typeof window !== 'undefined' && window.indexedDB) {
      try {
        const db = await this.openIndexedDB();
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        
        store.put({
          key,
          data,
          timestamp: Date.now(),
          ttl
        });
      } catch (error) {
        console.warn('[ResilientAPI] Failed to save to IndexedDB:', error);
      }
    }
  }
  
  /**
   * Open IndexedDB connection
   */
  private static async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.indexedDBName, this.indexedDBVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }
  
  /**
   * Generate minimal fallback from schema
   */
  private static generateMinimalFallback<T>(schema: z.ZodSchema<T>): T | null {
    try {
      // Attempt to get the default from schema
      if ('_def' in schema && 'defaultValue' in (schema as any)._def) {
        return (schema as any)._def.defaultValue();
      }
      
      // Try to create an empty valid object
      const emptyParsed = schema.safeParse({});
      if (emptyParsed.success) {
        return emptyParsed.data;
      }
      
      // For arrays, return empty array
      if (schema instanceof z.ZodArray) {
        return [] as unknown as T;
      }
      
      // For objects, try empty object
      if (schema instanceof z.ZodObject) {
        return {} as T;
      }
      
      return null;
    } catch {
      return null;
    }
  }
  
  /**
   * Clear all caches
   */
  static async clearCache(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();
    
    // Clear IndexedDB
    if (typeof window !== 'undefined' && window.indexedDB) {
      try {
        const db = await this.openIndexedDB();
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        store.clear();
      } catch (error) {
        console.warn('[ResilientAPI] Failed to clear IndexedDB:', error);
      }
    }
  }
  
  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    memoryCacheSize: number;
    memoryCacheKeys: string[];
  } {
    return {
      memoryCacheSize: this.memoryCache.size,
      memoryCacheKeys: Array.from(this.memoryCache.keys())
    };
  }
}