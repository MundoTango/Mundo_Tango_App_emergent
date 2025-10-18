/**
 * Mundo Tango ESA LIFE CEO - Response Time Logging Middleware
 * Phase 11 Task 5.4: Track request duration for performance monitoring
 */

import { Request, Response, NextFunction } from 'express';

// Performance thresholds
const SLOW_REQUEST_THRESHOLD = 500; // 500ms
const VERY_SLOW_REQUEST_THRESHOLD = 2000; // 2 seconds

/**
 * Middleware to log request response time
 * Tracks slow endpoints for performance optimization
 */
export const responseTimeLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Capture the original end method
  const originalEnd = res.end;

  // Override res.end to calculate duration
  res.end = function (this: Response, ...args: any[]): Response {
    const duration = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    
    // Determine performance level
    let performanceIcon = '✅';
    let performanceLabel = 'FAST';
    
    if (duration >= VERY_SLOW_REQUEST_THRESHOLD) {
      performanceIcon = '🐌';
      performanceLabel = 'VERY SLOW';
    } else if (duration >= SLOW_REQUEST_THRESHOLD) {
      performanceIcon = '⚠️';
      performanceLabel = 'SLOW';
    }

    // Log request with duration
    const logMessage = `[${timestamp}] ${performanceIcon} ${req.method} ${req.path} - ${duration}ms ${performanceLabel}`;
    
    if (duration >= VERY_SLOW_REQUEST_THRESHOLD) {
      console.error(logMessage);
    } else if (duration >= SLOW_REQUEST_THRESHOLD) {
      console.warn(logMessage);
    } else {
      // Only log in development or if explicitly enabled
      if (process.env.NODE_ENV === 'development' || process.env.LOG_RESPONSE_TIME === 'true') {
        console.log(logMessage);
      }
    }

    // Try to add X-Response-Time header only if headers haven't been sent
    if (!res.headersSent) {
      try {
        res.setHeader('X-Response-Time', `${duration}ms`);
      } catch (error) {
        // Silently fail if headers already sent (common with compression/streaming)
      }
    }

    // Call the original end method
    return originalEnd.apply(this, args);
  };

  next();
};

/**
 * Get performance statistics summary
 * Could be extended to track metrics over time
 */
export class PerformanceMonitor {
  private static requests: Array<{ path: string; duration: number; timestamp: Date }> = [];
  private static readonly MAX_HISTORY = 1000;

  static record(path: string, duration: number) {
    this.requests.push({ path, duration, timestamp: new Date() });
    
    // Keep only last MAX_HISTORY requests
    if (this.requests.length > this.MAX_HISTORY) {
      this.requests.shift();
    }
  }

  static getSummary() {
    if (this.requests.length === 0) {
      return { totalRequests: 0, averageDuration: 0, slowestRequests: [] };
    }

    const totalDuration = this.requests.reduce((sum, req) => sum + req.duration, 0);
    const averageDuration = totalDuration / this.requests.length;

    const slowestRequests = [...this.requests]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map(req => ({
        path: req.path,
        duration: `${req.duration}ms`,
        timestamp: req.timestamp.toISOString(),
      }));

    return {
      totalRequests: this.requests.length,
      averageDuration: Math.round(averageDuration),
      slowestRequests,
    };
  }

  static getSlowEndpoints(threshold: number = SLOW_REQUEST_THRESHOLD) {
    const slowRequests = this.requests.filter(req => req.duration >= threshold);
    
    // Group by path
    const grouped = slowRequests.reduce((acc, req) => {
      if (!acc[req.path]) {
        acc[req.path] = { count: 0, totalDuration: 0, maxDuration: 0 };
      }
      acc[req.path].count++;
      acc[req.path].totalDuration += req.duration;
      acc[req.path].maxDuration = Math.max(acc[req.path].maxDuration, req.duration);
      return acc;
    }, {} as Record<string, { count: number; totalDuration: number; maxDuration: number }>);

    return Object.entries(grouped)
      .map(([path, stats]) => ({
        path,
        slowRequestCount: stats.count,
        averageDuration: Math.round(stats.totalDuration / stats.count),
        maxDuration: stats.maxDuration,
      }))
      .sort((a, b) => b.slowRequestCount - a.slowRequestCount);
  }
}
