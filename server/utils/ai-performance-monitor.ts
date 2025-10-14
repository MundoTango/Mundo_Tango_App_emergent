/**
 * AI Performance Monitor - Agent #117 (Meta-Orchestrator)
 * Tracks real-time performance metrics for Multi-AI orchestration
 */

import { EventEmitter } from 'events';

export interface PerformanceMetric {
  timestamp: number;
  endpoint: string;
  model: string;
  latency: number;
  cost: number;
  complexity: 'low' | 'medium' | 'high';
  success: boolean;
  userId?: number;
}

export interface AggregatedMetrics {
  totalQueries: number;
  totalCost: number;
  totalCostSaved: number;
  averageLatency: number;
  modelUsage: Record<string, number>;
  complexityDistribution: Record<string, number>;
  successRate: number;
  lastHour: PerformanceMetric[];
  lastDay: PerformanceMetric[];
}

class AIPerformanceMonitor extends EventEmitter {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 10000; // Keep last 10k metrics
  private readonly retentionMs = 24 * 60 * 60 * 1000; // 24 hours

  // Model cost per query (approximate)
  private readonly modelCosts = {
    'claude-sonnet-4.5': 0.025,
    'gpt-4o': 0.001,
    'gemini-2.5-pro': 0.0005,
    'gemini-2.5-flash': 0.0001,
  };

  // Baseline cost (if we always used Claude)
  private readonly baselineCost = 0.025;

  constructor() {
    super();
    this.startCleanupInterval();
  }

  /**
   * Record a new query metric
   */
  track(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
    };

    this.metrics.push(fullMetric);
    this.emit('metric', fullMetric);

    // Cleanup old metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log significant events
    if (fullMetric.latency > 5000) {
      this.emit('slow-query', fullMetric);
      console.warn(`[AI Monitor] Slow query detected: ${fullMetric.latency}ms`);
    }

    if (!fullMetric.success) {
      this.emit('error', fullMetric);
      console.error(`[AI Monitor] Query failed: ${fullMetric.endpoint}`);
    }
  }

  /**
   * Get aggregated metrics
   */
  getMetrics(): AggregatedMetrics {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneDayAgo = now - this.retentionMs;

    const lastHour = this.metrics.filter(m => m.timestamp >= oneHourAgo);
    const lastDay = this.metrics.filter(m => m.timestamp >= oneDayAgo);

    const totalQueries = this.metrics.length;
    const successfulQueries = this.metrics.filter(m => m.success);
    const successRate = totalQueries > 0 ? successfulQueries.length / totalQueries : 0;

    // Calculate costs
    const totalCost = this.metrics.reduce((sum, m) => sum + m.cost, 0);
    const totalCostSaved = (totalQueries * this.baselineCost) - totalCost;

    // Average latency
    const averageLatency = this.metrics.length > 0
      ? this.metrics.reduce((sum, m) => sum + m.latency, 0) / this.metrics.length
      : 0;

    // Model usage distribution
    const modelUsage: Record<string, number> = {};
    this.metrics.forEach(m => {
      modelUsage[m.model] = (modelUsage[m.model] || 0) + 1;
    });

    // Complexity distribution
    const complexityDistribution: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
    };
    this.metrics.forEach(m => {
      complexityDistribution[m.complexity]++;
    });

    return {
      totalQueries,
      totalCost,
      totalCostSaved,
      averageLatency: Math.round(averageLatency),
      modelUsage,
      complexityDistribution,
      successRate,
      lastHour,
      lastDay,
    };
  }

  /**
   * Get time-series data for charts
   */
  getTimeSeries(intervalMinutes: number = 60): Array<{
    timestamp: number;
    queries: number;
    cost: number;
    averageLatency: number;
  }> {
    const now = Date.now();
    const intervalMs = intervalMinutes * 60 * 1000;
    const periods = 24; // Last 24 periods

    const timeSeries: Array<{
      timestamp: number;
      queries: number;
      cost: number;
      averageLatency: number;
    }> = [];

    for (let i = periods - 1; i >= 0; i--) {
      const periodEnd = now - (i * intervalMs);
      const periodStart = periodEnd - intervalMs;

      const periodMetrics = this.metrics.filter(
        m => m.timestamp >= periodStart && m.timestamp < periodEnd
      );

      const queries = periodMetrics.length;
      const cost = periodMetrics.reduce((sum, m) => sum + m.cost, 0);
      const averageLatency = queries > 0
        ? Math.round(periodMetrics.reduce((sum, m) => sum + m.latency, 0) / queries)
        : 0;

      timeSeries.push({
        timestamp: periodStart,
        queries,
        cost,
        averageLatency,
      });
    }

    return timeSeries;
  }

  /**
   * Get model comparison stats
   */
  getModelComparison(): Array<{
    model: string;
    queries: number;
    totalCost: number;
    avgCost: number;
    avgLatency: number;
    successRate: number;
  }> {
    const modelStats: Record<string, {
      queries: number;
      totalCost: number;
      totalLatency: number;
      successes: number;
    }> = {};

    this.metrics.forEach(m => {
      if (!modelStats[m.model]) {
        modelStats[m.model] = {
          queries: 0,
          totalCost: 0,
          totalLatency: 0,
          successes: 0,
        };
      }

      modelStats[m.model].queries++;
      modelStats[m.model].totalCost += m.cost;
      modelStats[m.model].totalLatency += m.latency;
      if (m.success) modelStats[m.model].successes++;
    });

    return Object.entries(modelStats).map(([model, stats]) => ({
      model,
      queries: stats.queries,
      totalCost: stats.totalCost,
      avgCost: stats.totalCost / stats.queries,
      avgLatency: Math.round(stats.totalLatency / stats.queries),
      successRate: stats.successes / stats.queries,
    }));
  }

  /**
   * Clear all metrics (admin only)
   */
  clear(): void {
    this.metrics = [];
    this.emit('cleared');
    console.log('[AI Monitor] All metrics cleared');
  }

  /**
   * Cleanup old metrics periodically
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      const cutoff = now - this.retentionMs;
      const beforeCount = this.metrics.length;

      this.metrics = this.metrics.filter(m => m.timestamp >= cutoff);

      const removed = beforeCount - this.metrics.length;
      if (removed > 0) {
        console.log(`[AI Monitor] Cleaned up ${removed} old metrics`);
      }
    }, 60 * 60 * 1000); // Every hour
  }
}

// Singleton instance
export const aiPerformanceMonitor = new AIPerformanceMonitor();

// Middleware helper
export function trackAIPerformance(
  endpoint: string,
  model: string,
  complexity: 'low' | 'medium' | 'high',
  latency: number,
  success: boolean,
  userId?: number
): void {
  const costMap: Record<string, number> = {
    'claude-sonnet-4.5': 0.025,
    'gpt-4o': 0.001,
    'gemini-2.5-pro': 0.0005,
    'gemini-2.5-flash': 0.0001,
  };

  aiPerformanceMonitor.track({
    endpoint,
    model,
    latency,
    cost: costMap[model] || 0.001,
    complexity,
    success,
    userId,
  });
}
