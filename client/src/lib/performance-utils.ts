/**
 * ESA LIFE CEO 61x21 - Performance Utilities (Phase 12)
 * Comprehensive performance optimization utilities
 */

import { useEffect, useRef, useCallback, useState } from 'react';

// ============= Web Vitals Monitoring =============
interface WebVitalsMetrics {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
  inp: number | null; // Interaction to Next Paint
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: WebVitalsMetrics = {
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    inp: null
  };
  private observers: ((metrics: WebVitalsMetrics) => void)[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Observe LCP
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
        this.notifyObservers();
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.debug('LCP observer not supported');
    }

    // Observe FID
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstInput = entries[0] as any;
        this.metrics.fid = firstInput.processingStart - firstInput.startTime;
        this.notifyObservers();
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console.debug('FID observer not supported');
    }

    // Observe CLS
    let clsValue = 0;
    let clsEntries: any[] = [];
    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsEntries.push(entry);
            clsValue += (entry as any).value;
          }
        }
        this.metrics.cls = clsValue;
        this.notifyObservers();
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.debug('CLS observer not supported');
    }

    // Observe Paint timing
    try {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
            this.notifyObservers();
          }
        }
      });
      paintObserver.observe({ type: 'paint', buffered: true });
    } catch (e) {
      console.debug('Paint observer not supported');
    }

    // Calculate TTFB
    if (window.performance && window.performance.timing) {
      const { responseStart, requestStart } = window.performance.timing;
      this.metrics.ttfb = responseStart - requestStart;
    }
  }

  private notifyObservers() {
    this.observers.forEach(callback => callback(this.metrics));
  }

  subscribe(callback: (metrics: WebVitalsMetrics) => void) {
    this.observers.push(callback);
    return () => {
      this.observers = this.observers.filter(cb => cb !== callback);
    };
  }

  getMetrics(): WebVitalsMetrics {
    return { ...this.metrics };
  }

  reportToAnalytics() {
    // Send metrics to analytics service
    if (window.gtag) {
      Object.entries(this.metrics).forEach(([key, value]) => {
        if (value !== null) {
          window.gtag('event', 'web_vitals', {
            event_category: 'Performance',
            event_label: key.toUpperCase(),
            value: Math.round(value)
          });
        }
      });
    }
  }
}

// ============= Debounce & Throttle Utilities =============
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean }
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  const { leading = false, trailing = true } = options || {};

  return function debounced(...args: Parameters<T>) {
    lastArgs = args;
    
    if (timeout) {
      clearTimeout(timeout);
    }

    if (leading && !timeout) {
      func(...args);
    }

    timeout = setTimeout(() => {
      if (trailing && lastArgs) {
        func(...lastArgs);
      }
      timeout = null;
      lastArgs = null;
    }, wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          throttled(...lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

// ============= Lazy Loading Utilities =============
export function useLazyLoad<T extends HTMLElement = HTMLElement>(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return { ref, isIntersecting };
}

// ============= Image Optimization =============
export class ImageOptimizer {
  static generateSrcSet(src: string, sizes: number[] = [320, 640, 960, 1280, 1920]): string {
    return sizes.map(size => {
      const optimizedSrc = src.replace(/\.[^.]+$/, `-${size}w$&`);
      return `${optimizedSrc} ${size}w`;
    }).join(', ');
  }

  static getWebPUrl(src: string): string {
    return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }

  static generatePlaceholder(width: number, height: number): string {
    return `data:image/svg+xml,%3Csvg width='${width}' height='${height}' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23e0f2fe'/%3E%3C/svg%3E`;
  }
}

// ============= Virtual Scrolling Hook =============
interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  buffer?: number;
  overscan?: number;
}

export function useVirtualScroll<T>(
  items: T[],
  options: VirtualScrollOptions
) {
  const { itemHeight, containerHeight, buffer = 5, overscan = 3 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((e.target as HTMLDivElement).scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex
  };
}

// ============= Resource Loading Utilities =============
export class ResourceLoader {
  private static preloadedResources = new Set<string>();

  static preloadImage(src: string): Promise<void> {
    if (this.preloadedResources.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.preloadedResources.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  static preloadImages(srcs: string[]): Promise<void[]> {
    return Promise.all(srcs.map(src => this.preloadImage(src)));
  }

  static prefetchRoute(route: string) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  }

  static preconnect(origin: string) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    document.head.appendChild(link);
  }

  static dnsPrefetch(origin: string) {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = origin;
    document.head.appendChild(link);
  }
}

// ============= Performance Hooks =============
export function usePerformanceObserver(
  callback: (metrics: WebVitalsMetrics) => void
) {
  useEffect(() => {
    const monitor = PerformanceMonitor.getInstance();
    const unsubscribe = monitor.subscribe(callback);
    return unsubscribe;
  }, [callback]);
}

export function usePageLoadTime() {
  const [loadTime, setLoadTime] = useState<number | null>(null);

  useEffect(() => {
    if (window.performance && window.performance.timing) {
      const { loadEventEnd, navigationStart } = window.performance.timing;
      if (loadEventEnd && navigationStart) {
        setLoadTime(loadEventEnd - navigationStart);
      } else {
        // Wait for load event
        window.addEventListener('load', () => {
          const { loadEventEnd, navigationStart } = window.performance.timing;
          setLoadTime(loadEventEnd - navigationStart);
        });
      }
    }
  }, []);

  return loadTime;
}

// ============= Memory Management =============
export class MemoryManager {
  private static caches = new Map<string, Map<string, any>>();
  private static maxCacheSize = 100;

  static createCache(name: string, maxSize = this.maxCacheSize) {
    const cache = new Map<string, any>();
    this.caches.set(name, cache);
    return {
      get: (key: string) => cache.get(key),
      set: (key: string, value: any) => {
        if (cache.size >= maxSize) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
        cache.set(key, value);
      },
      clear: () => cache.clear(),
      delete: (key: string) => cache.delete(key),
      size: () => cache.size
    };
  }

  static clearAllCaches() {
    this.caches.forEach(cache => cache.clear());
  }

  static getCacheStats() {
    const stats: Record<string, number> = {};
    this.caches.forEach((cache, name) => {
      stats[name] = cache.size;
    });
    return stats;
  }
}

// ============= Request Batching =============
export class RequestBatcher<T, R> {
  private batch: T[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private batchSize: number;
  private batchDelay: number;
  private processor: (batch: T[]) => Promise<R[]>;
  private pendingPromises: Array<{
    item: T;
    resolve: (value: R) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(
    processor: (batch: T[]) => Promise<R[]>,
    options: { batchSize?: number; batchDelay?: number } = {}
  ) {
    this.processor = processor;
    this.batchSize = options.batchSize || 10;
    this.batchDelay = options.batchDelay || 50;
  }

  async add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.batch.push(item);
      this.pendingPromises.push({ item, resolve, reject });

      if (this.batch.length >= this.batchSize) {
        this.flush();
      } else if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => this.flush(), this.batchDelay);
      }
    });
  }

  private async flush() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    const currentBatch = [...this.batch];
    const currentPromises = [...this.pendingPromises];
    this.batch = [];
    this.pendingPromises = [];

    try {
      const results = await this.processor(currentBatch);
      currentPromises.forEach((promise, index) => {
        promise.resolve(results[index]);
      });
    } catch (error) {
      currentPromises.forEach(promise => {
        promise.reject(error);
      });
    }
  }
}

// Export default monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();