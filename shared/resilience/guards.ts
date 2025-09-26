/**
 * Type Guards and Safe Accessors for Platform Resilience
 * Provides defensive programming utilities to prevent runtime errors
 */

// Type guards for safe type checking
export const guards = {
  isString: (val: unknown): val is string => 
    typeof val === 'string',
  
  isNumber: (val: unknown): val is number => 
    typeof val === 'number' && !isNaN(val),
  
  isArray: <T = unknown>(val: unknown): val is T[] => 
    Array.isArray(val),
  
  isObject: (val: unknown): val is Record<string, unknown> => 
    val !== null && typeof val === 'object' && !Array.isArray(val),
  
  hasProperty: <K extends string>(
    obj: unknown,
    key: K
  ): obj is Record<K, unknown> => 
    guards.isObject(obj) && key in obj,
  
  isNull: (val: unknown): val is null => 
    val === null,
  
  isUndefined: (val: unknown): val is undefined => 
    val === undefined,
  
  isNullish: (val: unknown): val is null | undefined => 
    val === null || val === undefined,
  
  isFunction: (val: unknown): val is Function => 
    typeof val === 'function',
  
  isBoolean: (val: unknown): val is boolean => 
    typeof val === 'boolean'
};

// Safe accessors that never throw
export const safe = {
  string: (val: unknown, fallback = ''): string => 
    guards.isString(val) ? val : fallback,
  
  number: (val: unknown, fallback = 0): number => 
    guards.isNumber(val) ? val : fallback,
  
  array: <T = unknown>(val: unknown, fallback: T[] = []): T[] => 
    guards.isArray<T>(val) ? val : fallback,
  
  object: <T extends object = object>(val: unknown, fallback: T): T => 
    guards.isObject(val) ? (val as T) : fallback,
  
  boolean: (val: unknown, fallback = false): boolean => 
    guards.isBoolean(val) ? val : fallback,
  
  property: <T = unknown>(obj: unknown, path: string, fallback: T): T => {
    if (!guards.isObject(obj)) return fallback;
    
    const keys = path.split('.');
    let current: any = obj;
    
    for (const key of keys) {
      if (!guards.hasProperty(current, key)) return fallback;
      current = current[key];
      if (guards.isNullish(current)) return fallback;
    }
    
    return current as T;
  },
  
  // Safe function call
  call: <T = unknown>(
    fn: unknown, 
    args: unknown[] = [], 
    fallback: T | null = null
  ): T | null => {
    if (!guards.isFunction(fn)) return fallback;
    try {
      return fn(...args) as T;
    } catch {
      return fallback;
    }
  }
};

// Safe URL processing utilities
export const safeUrl = {
  parse: (url: unknown): URL | null => {
    if (!guards.isString(url)) return null;
    try {
      return new URL(url);
    } catch {
      // Try with base URL for relative paths
      try {
        return new URL(url, window.location.origin);
      } catch {
        return null;
      }
    }
  },
  
  isValid: (url: unknown): boolean => {
    return safeUrl.parse(url) !== null;
  },
  
  isYouTube: (url: unknown): boolean => {
    if (!guards.isString(url)) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('youtube.com') || 
           lowerUrl.includes('youtu.be');
  },
  
  isVimeo: (url: unknown): boolean => {
    if (!guards.isString(url)) return false;
    return url.toLowerCase().includes('vimeo.com');
  },
  
  extractYouTubeId: (url: unknown): string | null => {
    if (!guards.isString(url)) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  },
  
  extractVimeoId: (url: unknown): string | null => {
    if (!guards.isString(url)) return null;
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  },
  
  getVideoType: (url: unknown): 'youtube' | 'vimeo' | 'direct' | null => {
    if (!guards.isString(url)) return null;
    if (safeUrl.isYouTube(url)) return 'youtube';
    if (safeUrl.isVimeo(url)) return 'vimeo';
    if (url.match(/\.(mp4|webm|ogg)$/i)) return 'direct';
    return null;
  }
};

// Safe array operations
export const safeArray = {
  first: <T>(arr: unknown, fallback?: T): T | undefined => {
    const safeArr = safe.array<T>(arr);
    return safeArr[0] ?? fallback;
  },
  
  last: <T>(arr: unknown, fallback?: T): T | undefined => {
    const safeArr = safe.array<T>(arr);
    return safeArr[safeArr.length - 1] ?? fallback;
  },
  
  at: <T>(arr: unknown, index: number, fallback?: T): T | undefined => {
    const safeArr = safe.array<T>(arr);
    return safeArr[index] ?? fallback;
  },
  
  map: <T, R>(
    arr: unknown, 
    fn: (item: T, index: number) => R,
    fallback: R[] = []
  ): R[] => {
    const safeArr = safe.array<T>(arr);
    try {
      return safeArr.map(fn);
    } catch {
      return fallback;
    }
  },
  
  filter: <T>(
    arr: unknown,
    fn: (item: T, index: number) => boolean,
    fallback: T[] = []
  ): T[] => {
    const safeArr = safe.array<T>(arr);
    try {
      return safeArr.filter(fn);
    } catch {
      return fallback;
    }
  }
};

// Safe date operations
export const safeDate = {
  parse: (date: unknown): Date | null => {
    if (date instanceof Date) return date;
    if (guards.isString(date) || guards.isNumber(date)) {
      try {
        const parsed = new Date(date);
        return isNaN(parsed.getTime()) ? null : parsed;
      } catch {
        return null;
      }
    }
    return null;
  },
  
  format: (date: unknown, fallback = ''): string => {
    const parsed = safeDate.parse(date);
    return parsed ? parsed.toISOString() : fallback;
  },
  
  isValid: (date: unknown): boolean => {
    return safeDate.parse(date) !== null;
  }
};

// Safe JSON operations
export const safeJson = {
  parse: <T = unknown>(json: unknown, fallback: T | null = null): T | null => {
    if (!guards.isString(json)) return fallback;
    try {
      return JSON.parse(json) as T;
    } catch {
      return fallback;
    }
  },
  
  stringify: (obj: unknown, fallback = '{}'): string => {
    try {
      return JSON.stringify(obj);
    } catch {
      return fallback;
    }
  }
};