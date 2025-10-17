/**
 * ESA LIFE CEO 61x21 - Performance Monitoring Hook (Phase 12)
 * Real-time performance monitoring and optimization
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { performanceMonitor, PerformanceMonitor } from '@/lib/performance-utils';

interface PerformanceMetrics {
  pageLoadTime: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
  inp: number | null;
  memoryUsage: number | null;
  bundleSize: number | null;
}

interface PerformanceReport {
  metrics: PerformanceMetrics;
  score: number;
  recommendations: string[];
  timestamp: string;
}

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: null,
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    inp: null,
    memoryUsage: null,
    bundleSize: null
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const observerRef = useRef<any>(null);

  useEffect(() => {
    if (!isMonitoring) return;

    // Subscribe to performance metrics
    const unsubscribe = performanceMonitor.subscribe((webVitals) => {
      setMetrics(prev => ({
        ...prev,
        lcp: webVitals.lcp,
        fid: webVitals.fid,
        cls: webVitals.cls,
        fcp: webVitals.fcp,
        ttfb: webVitals.ttfb,
        inp: webVitals.inp
      }));
    });

    // Monitor page load time
    if (window.performance && window.performance.timing) {
      const { loadEventEnd, navigationStart } = window.performance.timing;
      if (loadEventEnd && navigationStart) {
        setMetrics(prev => ({
          ...prev,
          pageLoadTime: loadEventEnd - navigationStart
        }));
      }
    }

    // Monitor memory usage
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memoryInfo.usedJSHeapSize / 1048576 // Convert to MB
      }));
    }

    // Monitor resource loading
    observerRef.current = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          // Track resource loading times
          console.debug('[Performance]', entry.name, entry.duration);
        }
      }
    });

    try {
      observerRef.current.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.debug('Resource observer not supported');
    }

    return () => {
      unsubscribe();
      observerRef.current?.disconnect();
    };
  }, [isMonitoring]);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const generateReport = useCallback((): PerformanceReport => {
    const scores = {
      lcp: metrics.lcp ? (metrics.lcp < 2500 ? 100 : metrics.lcp < 4000 ? 75 : 50) : 0,
      fid: metrics.fid ? (metrics.fid < 100 ? 100 : metrics.fid < 300 ? 75 : 50) : 0,
      cls: metrics.cls ? (metrics.cls < 0.1 ? 100 : metrics.cls < 0.25 ? 75 : 50) : 0,
      fcp: metrics.fcp ? (metrics.fcp < 1800 ? 100 : metrics.fcp < 3000 ? 75 : 50) : 0,
      ttfb: metrics.ttfb ? (metrics.ttfb < 800 ? 100 : metrics.ttfb < 1800 ? 75 : 50) : 0
    };

    const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;

    const recommendations: string[] = [];

    if (metrics.lcp && metrics.lcp > 2500) {
      recommendations.push('Optimize Largest Contentful Paint (LCP) - target < 2.5s');
    }
    if (metrics.fid && metrics.fid > 100) {
      recommendations.push('Improve First Input Delay (FID) - target < 100ms');
    }
    if (metrics.cls && metrics.cls > 0.1) {
      recommendations.push('Reduce Cumulative Layout Shift (CLS) - target < 0.1');
    }
    if (metrics.fcp && metrics.fcp > 1800) {
      recommendations.push('Speed up First Contentful Paint (FCP) - target < 1.8s');
    }
    if (metrics.ttfb && metrics.ttfb > 800) {
      recommendations.push('Reduce Time to First Byte (TTFB) - target < 800ms');
    }
    if (metrics.memoryUsage && metrics.memoryUsage > 50) {
      recommendations.push('Optimize memory usage - currently using ' + metrics.memoryUsage.toFixed(2) + 'MB');
    }

    return {
      metrics,
      score: overallScore,
      recommendations,
      timestamp: new Date().toISOString()
    };
  }, [metrics]);

  const reportToAnalytics = useCallback(() => {
    performanceMonitor.reportToAnalytics();
  }, []);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    generateReport,
    reportToAnalytics
  };
}

// Auto-start monitoring in production
export function useAutoPerformanceMonitoring() {
  const { startMonitoring, reportToAnalytics } = usePerformanceMonitoring();

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      startMonitoring();
      
      // Report metrics after page load
      window.addEventListener('load', () => {
        setTimeout(() => {
          reportToAnalytics();
        }, 5000); // Wait 5 seconds after load
      });
    }
  }, [startMonitoring, reportToAnalytics]);
}