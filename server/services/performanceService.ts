/**
 * Performance Service
 * MB.MD Track 5: Performance Infrastructure
 * Implements: Monitoring, optimization, caching strategies
 */

export interface PerformanceMetrics {
  timestamp: number;
  url: string;
  method: string;
  duration: number;
  statusCode: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpu: number;
}

export interface CacheEntry {
  key: string;
  value: any;
  ttl: number;
  createdAt: number;
}

class PerformanceService {
  private metrics: PerformanceMetrics[] = [];
  private cache: Map<string, CacheEntry> = new Map();
  private readonly MAX_METRICS = 10000;
  private readonly CLEANUP_INTERVAL = 60000; // 1 minute

  constructor() {
    // Periodic cache cleanup
    setInterval(() => this.cleanupCache(), this.CLEANUP_INTERVAL);
  }

  /**
   * Record performance metric
   */
  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(timeWindow: number = 300000): { // 5 minutes default
    avgResponseTime: number;
    p50: number;
    p95: number;
    p99: number;
    requestsPerMinute: number;
    errorRate: number;
    slowestEndpoints: Array<{ url: string; avgDuration: number }>;
  } {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < timeWindow);
    
    if (recentMetrics.length === 0) {
      return {
        avgResponseTime: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        requestsPerMinute: 0,
        errorRate: 0,
        slowestEndpoints: [],
      };
    }

    // Sort by duration
    const sorted = [...recentMetrics].sort((a, b) => a.duration - b.duration);
    
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length;
    const p50 = sorted[Math.floor(sorted.length * 0.5)]?.duration || 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)]?.duration || 0;
    const p99 = sorted[Math.floor(sorted.length * 0.99)]?.duration || 0;
    
    const requestsPerMinute = (recentMetrics.length / (timeWindow / 60000));
    const errors = recentMetrics.filter(m => m.statusCode >= 400).length;
    const errorRate = (errors / recentMetrics.length) * 100;

    // Calculate slowest endpoints
    const endpointStats = new Map<string, { total: number; count: number }>();
    recentMetrics.forEach(m => {
      const stats = endpointStats.get(m.url) || { total: 0, count: 0 };
      stats.total += m.duration;
      stats.count += 1;
      endpointStats.set(m.url, stats);
    });

    const slowestEndpoints = Array.from(endpointStats.entries())
      .map(([url, stats]) => ({
        url,
        avgDuration: stats.total / stats.count,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10);

    return {
      avgResponseTime,
      p50,
      p95,
      p99,
      requestsPerMinute,
      errorRate,
      slowestEndpoints,
    };
  }

  /**
   * Cache data with TTL
   */
  setCache(key: string, value: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      key,
      value,
      ttl,
      createdAt: Date.now(),
    });
  }

  /**
   * Get cached data
   */
  getCache(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.createdAt > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  /**
   * Clear cache by pattern
   */
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = new RegExp(pattern);
    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache) {
      if (now - entry.createdAt > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Performance: Cleaned ${cleaned} expired cache entries`);
    }
  }

  /**
   * Get memory usage
   */
  getMemoryUsage(): {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    heapUsedPercentage: number;
  } {
    const mem = process.memoryUsage();
    
    return {
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
      external: Math.round(mem.external / 1024 / 1024),
      rss: Math.round(mem.rss / 1024 / 1024),
      heapUsedPercentage: (mem.heapUsed / mem.heapTotal) * 100,
    };
  }

  /**
   * Trigger garbage collection if available
   */
  triggerGC(): void {
    if (global.gc) {
      global.gc();
      console.log('🧹 Manual garbage collection triggered');
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  } {
    // This is a simplified version - in production, track hits/misses
    return {
      size: this.cache.size,
      hits: 0,
      misses: 0,
      hitRate: 0,
    };
  }

  /**
   * Check if endpoint needs optimization
   */
  needsOptimization(url: string): {
    needsOptimization: boolean;
    reason: string;
    suggestions: string[];
  } {
    const endpointMetrics = this.metrics.filter(m => m.url === url);
    
    if (endpointMetrics.length < 10) {
      return {
        needsOptimization: false,
        reason: 'Insufficient data',
        suggestions: [],
      };
    }

    const avgDuration = endpointMetrics.reduce((sum, m) => sum + m.duration, 0) / endpointMetrics.length;
    
    const suggestions: string[] = [];
    let needsOptimization = false;

    if (avgDuration > 1000) {
      needsOptimization = true;
      suggestions.push('Response time > 1s - consider caching');
      suggestions.push('Add database indexes');
      suggestions.push('Optimize query complexity');
    }

    if (avgDuration > 500) {
      suggestions.push('Consider pagination for large datasets');
    }

    return {
      needsOptimization,
      reason: needsOptimization ? `Avg response time: ${avgDuration}ms` : 'Performance acceptable',
      suggestions,
    };
  }
}

// Export singleton instance
export const performanceService = new PerformanceService();
