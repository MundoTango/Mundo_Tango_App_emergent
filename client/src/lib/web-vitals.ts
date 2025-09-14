/**
 * ESA LIFE CEO 61x21 - Web Vitals Monitoring
 * Phase 14: Performance & User Experience Metrics
 * 
 * Tracks Core Web Vitals and user-centric performance metrics
 */

import { onCLS, onFCP, onFID, onLCP, onTTFB, onINP, Metric } from 'web-vitals';
import { webVitals } from '../../../server/monitoring/prometheus-metrics';

export interface WebVitalsData {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  inp?: number; // Interaction to Next Paint
  timestamp: number;
  url: string;
  userAgent: string;
  connection?: string;
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

class WebVitalsTracker {
  private metrics: Partial<WebVitalsData> = {};
  private reportEndpoint = '/api/metrics/web-vitals';
  private buffer: WebVitalsData[] = [];
  private flushTimer?: NodeJS.Timeout;
  private isInitialized = false;
  
  /**
   * Initialize Web Vitals tracking
   */
  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    
    // Core Web Vitals
    onLCP((metric) => this.handleMetric('lcp', metric));
    onFID((metric) => this.handleMetric('fid', metric));
    onCLS((metric) => this.handleMetric('cls', metric));
    
    // Additional metrics
    onFCP((metric) => this.handleMetric('fcp', metric));
    onTTFB((metric) => this.handleMetric('ttfb', metric));
    onINP((metric) => this.handleMetric('inp', metric));
    
    // Device information
    this.collectDeviceInfo();
    
    // Report on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.flush();
        }
      });
      
      window.addEventListener('pagehide', () => {
        this.flush();
      });
    }
    
    console.log('📊 Web Vitals tracking initialized');
  }
  
  /**
   * Handle individual metric
   */
  private handleMetric(name: keyof WebVitalsData, metric: Metric) {
    // Store metric value
    this.metrics[name] = metric.value as any;
    
    // Log to console in development
    if (import.meta.env.DEV) {
      const rating = metric.rating || 'none';
      const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
      console.log(`${emoji} ${name.toUpperCase()}: ${metric.value.toFixed(2)}ms (${rating})`);
    }
    
    // Check if we have all core metrics
    if (this.hasAllCoreMetrics()) {
      this.reportMetrics();
    }
  }
  
  /**
   * Collect device information
   */
  private collectDeviceInfo() {
    if (typeof window === 'undefined') return;
    
    const nav = navigator as any;
    
    // Connection information
    if (nav.connection) {
      this.metrics.connection = nav.connection.effectiveType;
    }
    
    // Device memory (Chrome only)
    if (nav.deviceMemory) {
      this.metrics.deviceMemory = nav.deviceMemory;
    }
    
    // Hardware concurrency (number of CPU cores)
    if (nav.hardwareConcurrency) {
      this.metrics.hardwareConcurrency = nav.hardwareConcurrency;
    }
  }
  
  /**
   * Check if all core metrics are collected
   */
  private hasAllCoreMetrics(): boolean {
    return !!(this.metrics.lcp && this.metrics.fid && this.metrics.cls);
  }
  
  /**
   * Report metrics to backend
   */
  private reportMetrics() {
    const data: WebVitalsData = {
      ...this.metrics,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    } as WebVitalsData;
    
    // Add to buffer
    this.buffer.push(data);
    
    // Schedule flush
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), 5000);
    }
  }
  
  /**
   * Flush metrics buffer to backend
   */
  private async flush() {
    if (this.buffer.length === 0) return;
    
    const toSend = [...this.buffer];
    this.buffer = [];
    
    try {
      // Use sendBeacon for reliability on page unload
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(toSend)], {
          type: 'application/json',
        });
        navigator.sendBeacon(this.reportEndpoint, blob);
      } else {
        // Fallback to fetch
        await fetch(this.reportEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toSend),
          keepalive: true,
        });
      }
    } catch (error) {
      console.error('Failed to report Web Vitals:', error);
    }
    
    // Clear timer
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = undefined;
    }
  }
  
  /**
   * Get current metrics snapshot
   */
  getSnapshot(): Partial<WebVitalsData> {
    return { ...this.metrics };
  }
  
  /**
   * Manually trigger a report
   */
  report() {
    if (this.hasAllCoreMetrics()) {
      this.reportMetrics();
    }
  }
}

// Global instance
export const webVitalsTracker = new WebVitalsTracker();

/**
 * Performance observer for custom metrics
 */
export class PerformanceTracker {
  private marks = new Map<string, number>();
  private measures = new Map<string, number>();
  
  /**
   * Mark a point in time
   */
  mark(name: string) {
    if (typeof performance === 'undefined') return;
    
    performance.mark(name);
    this.marks.set(name, performance.now());
  }
  
  /**
   * Measure between two marks
   */
  measure(name: string, startMark: string, endMark?: string) {
    if (typeof performance === 'undefined') return 0;
    
    try {
      if (endMark) {
        performance.measure(name, startMark, endMark);
      } else {
        performance.measure(name, startMark);
      }
      
      const entries = performance.getEntriesByName(name, 'measure');
      if (entries.length > 0) {
        const duration = entries[entries.length - 1].duration;
        this.measures.set(name, duration);
        
        // Log in development
        if (import.meta.env.DEV) {
          console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
        }
        
        return duration;
      }
    } catch (error) {
      console.error('Performance measurement error:', error);
    }
    
    return 0;
  }
  
  /**
   * Get all measures
   */
  getMeasures(): Record<string, number> {
    return Object.fromEntries(this.measures);
  }
  
  /**
   * Clear all marks and measures
   */
  clear() {
    this.marks.clear();
    this.measures.clear();
    if (typeof performance !== 'undefined') {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
}

// Global performance tracker
export const performanceTracker = new PerformanceTracker();

/**
 * Resource timing analyzer
 */
export function analyzeResourceTiming() {
  if (typeof performance === 'undefined' || !performance.getEntriesByType) {
    return null;
  }
  
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  const analysis = {
    totalResources: resources.length,
    totalSize: 0,
    totalDuration: 0,
    byType: {} as Record<string, { count: number; size: number; duration: number }>,
    slowest: [] as Array<{ name: string; duration: number; size: number }>,
    largest: [] as Array<{ name: string; duration: number; size: number }>,
  };
  
  resources.forEach(resource => {
    const type = getResourceType(resource.name);
    const size = resource.transferSize || 0;
    const duration = resource.duration;
    
    analysis.totalSize += size;
    analysis.totalDuration += duration;
    
    if (!analysis.byType[type]) {
      analysis.byType[type] = { count: 0, size: 0, duration: 0 };
    }
    
    analysis.byType[type].count++;
    analysis.byType[type].size += size;
    analysis.byType[type].duration += duration;
    
    // Track slowest resources
    if (analysis.slowest.length < 10) {
      analysis.slowest.push({ name: resource.name, duration, size });
      analysis.slowest.sort((a, b) => b.duration - a.duration);
    } else if (duration > analysis.slowest[9].duration) {
      analysis.slowest[9] = { name: resource.name, duration, size };
      analysis.slowest.sort((a, b) => b.duration - a.duration);
    }
    
    // Track largest resources
    if (analysis.largest.length < 10) {
      analysis.largest.push({ name: resource.name, duration, size });
      analysis.largest.sort((a, b) => b.size - a.size);
    } else if (size > analysis.largest[9].size) {
      analysis.largest[9] = { name: resource.name, duration, size };
      analysis.largest.sort((a, b) => b.size - a.size);
    }
  });
  
  return analysis;
}

/**
 * Get resource type from URL
 */
function getResourceType(url: string): string {
  const extension = url.split('.').pop()?.toLowerCase() || '';
  
  if (['js', 'mjs'].includes(extension)) return 'script';
  if (['css'].includes(extension)) return 'stylesheet';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'].includes(extension)) return 'image';
  if (['woff', 'woff2', 'ttf', 'otf'].includes(extension)) return 'font';
  if (['mp4', 'webm', 'ogg'].includes(extension)) return 'video';
  if (['mp3', 'wav'].includes(extension)) return 'audio';
  if (['json'].includes(extension)) return 'json';
  
  if (url.includes('/api/')) return 'api';
  
  return 'other';
}

/**
 * Initialize all performance monitoring
 */
export function initPerformanceMonitoring() {
  // Initialize Web Vitals
  webVitalsTracker.init();
  
  // Log initial page load performance
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          console.log('📈 Page Load Performance:');
          console.log(`  DNS: ${(navigation.domainLookupEnd - navigation.domainLookupStart).toFixed(2)}ms`);
          console.log(`  TCP: ${(navigation.connectEnd - navigation.connectStart).toFixed(2)}ms`);
          console.log(`  Request: ${(navigation.responseStart - navigation.requestStart).toFixed(2)}ms`);
          console.log(`  Response: ${(navigation.responseEnd - navigation.responseStart).toFixed(2)}ms`);
          console.log(`  DOM Processing: ${(navigation.domComplete - navigation.domInteractive).toFixed(2)}ms`);
          console.log(`  Total Load: ${navigation.loadEventEnd.toFixed(2)}ms`);
        }
        
        // Analyze resources
        const resourceAnalysis = analyzeResourceTiming();
        if (resourceAnalysis && import.meta.env.DEV) {
          console.log('📦 Resource Analysis:', resourceAnalysis);
        }
      }, 1000); // Wait for all resources to load
    });
  }
}

export default {
  webVitalsTracker,
  performanceTracker,
  analyzeResourceTiming,
  initPerformanceMonitoring,
};