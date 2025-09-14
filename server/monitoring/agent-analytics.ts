/**
 * ESA LIFE CEO 61x21 - Agent Analytics System
 * Phase 14: Agent Performance & Usage Analytics
 * 
 * Tracks all 61 layers and 16 Life CEO agents
 */

import { db } from '../db';
import { eq, desc, sql, and, gte } from 'drizzle-orm';
import {
  agentRequestDuration,
  agentRequestTotal,
  agentTokenUsage,
  agentActiveRequests,
  agentLayerHealth,
} from './prometheus-metrics';

export interface AgentAnalytics {
  agentId: string;
  layer: number;
  timestamp: Date;
  responseTime: number;
  tokensUsed: number;
  success: boolean;
  error?: string;
  userId?: string;
  sessionId?: string;
  operation?: string;
  metadata?: Record<string, any>;
}

export interface AgentPerformanceMetrics {
  agentId: string;
  layer: number;
  avgResponseTime: number;
  totalRequests: number;
  successRate: number;
  totalTokens: number;
  avgTokensPerRequest: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  topErrors: Array<{ error: string; count: number }>;
}

export interface AgentUsagePattern {
  agentId: string;
  hourlyUsage: Array<{ hour: number; count: number }>;
  dailyUsage: Array<{ day: string; count: number }>;
  userSegments: Array<{ segment: string; count: number }>;
  commonOperations: Array<{ operation: string; count: number }>;
  interactionFlows: Array<{ from: string; to: string; count: number }>;
}

export class AgentAnalyticsTracker {
  private analyticsBuffer: AgentAnalytics[] = [];
  private flushInterval: NodeJS.Timeout;
  private performanceCache = new Map<string, AgentPerformanceMetrics>();
  
  constructor() {
    // Flush analytics buffer every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushAnalytics();
    }, 30000);
  }
  
  /**
   * Track an agent request
   */
  async trackAgentRequest(analytics: AgentAnalytics) {
    // Update Prometheus metrics immediately
    const labels = {
      agent_id: analytics.agentId,
      layer: analytics.layer.toString(),
      operation: analytics.operation || 'unknown',
      status: analytics.success ? 'success' : 'failure',
    };
    
    // Track duration
    agentRequestDuration.observe(
      { ...labels, operation: analytics.operation || 'unknown' },
      analytics.responseTime / 1000
    );
    
    // Track total requests
    agentRequestTotal.inc(labels);
    
    // Track token usage
    if (analytics.tokensUsed > 0) {
      agentTokenUsage.inc(
        { ...labels, model: 'gpt-4' },
        analytics.tokensUsed
      );
    }
    
    // Buffer for batch storage
    this.analyticsBuffer.push(analytics);
    
    // Flush if buffer is large
    if (this.analyticsBuffer.length >= 100) {
      await this.flushAnalytics();
    }
  }
  
  /**
   * Track active agent request
   */
  trackActiveRequest(agentId: string, layer: number, isStart: boolean) {
    const labels = { agent_id: agentId, layer: layer.toString() };
    
    if (isStart) {
      agentActiveRequests.inc(labels);
    } else {
      agentActiveRequests.dec(labels);
    }
  }
  
  /**
   * Update agent layer health
   */
  updateLayerHealth(layer: number, agentType: string, isHealthy: boolean) {
    agentLayerHealth.set(
      { layer: layer.toString(), agent_type: agentType },
      isHealthy ? 1 : 0
    );
  }
  
  /**
   * Flush analytics buffer to database
   */
  private async flushAnalytics() {
    if (this.analyticsBuffer.length === 0) return;
    
    const toFlush = [...this.analyticsBuffer];
    this.analyticsBuffer = [];
    
    try {
      // Store in database (if agent_analytics table exists)
      // await db.insert(agentAnalytics).values(toFlush);
      
      // Update performance cache
      this.updatePerformanceCache(toFlush);
      
      console.log(`📊 Flushed ${toFlush.length} agent analytics records`);
    } catch (error) {
      console.error('Failed to flush agent analytics:', error);
      // Re-add to buffer for retry
      this.analyticsBuffer.unshift(...toFlush);
    }
  }
  
  /**
   * Update performance metrics cache
   */
  private updatePerformanceCache(analytics: AgentAnalytics[]) {
    const agentMetrics = new Map<string, AgentAnalytics[]>();
    
    // Group by agent
    analytics.forEach(record => {
      const key = `${record.agentId}-${record.layer}`;
      if (!agentMetrics.has(key)) {
        agentMetrics.set(key, []);
      }
      agentMetrics.get(key)!.push(record);
    });
    
    // Calculate metrics for each agent
    agentMetrics.forEach((records, key) => {
      const [agentId, layer] = key.split('-');
      
      const responseTimes = records.map(r => r.responseTime).sort((a, b) => a - b);
      const successCount = records.filter(r => r.success).length;
      const totalTokens = records.reduce((sum, r) => sum + (r.tokensUsed || 0), 0);
      
      const metrics: AgentPerformanceMetrics = {
        agentId,
        layer: parseInt(layer),
        avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
        totalRequests: records.length,
        successRate: (successCount / records.length) * 100,
        totalTokens,
        avgTokensPerRequest: totalTokens / records.length,
        p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)] || 0,
        p99ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.99)] || 0,
        errorRate: ((records.length - successCount) / records.length) * 100,
        topErrors: this.getTopErrors(records),
      };
      
      this.performanceCache.set(key, metrics);
    });
  }
  
  /**
   * Get top errors for an agent
   */
  private getTopErrors(records: AgentAnalytics[]): Array<{ error: string; count: number }> {
    const errorCounts = new Map<string, number>();
    
    records
      .filter(r => !r.success && r.error)
      .forEach(r => {
        const error = r.error!;
        errorCounts.set(error, (errorCounts.get(error) || 0) + 1);
      });
    
    return Array.from(errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
  
  /**
   * Get agent performance metrics
   */
  getPerformanceMetrics(agentId?: string, layer?: number): AgentPerformanceMetrics[] {
    if (agentId && layer !== undefined) {
      const key = `${agentId}-${layer}`;
      const metrics = this.performanceCache.get(key);
      return metrics ? [metrics] : [];
    }
    
    return Array.from(this.performanceCache.values())
      .filter(m => (!agentId || m.agentId === agentId) && (layer === undefined || m.layer === layer));
  }
  
  /**
   * Get agent usage patterns
   */
  async getUsagePatterns(agentId: string, days: number = 7): Promise<AgentUsagePattern> {
    // This would typically query from database
    // For now, return mock data structure
    return {
      agentId,
      hourlyUsage: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: Math.floor(Math.random() * 100),
      })),
      dailyUsage: Array.from({ length: days }, (_, i) => ({
        day: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 500),
      })),
      userSegments: [
        { segment: 'free', count: 150 },
        { segment: 'premium', count: 80 },
        { segment: 'enterprise', count: 20 },
      ],
      commonOperations: [
        { operation: 'query', count: 120 },
        { operation: 'generate', count: 80 },
        { operation: 'analyze', count: 50 },
      ],
      interactionFlows: [
        { from: 'health-advisor', to: 'fitness-trainer', count: 45 },
        { from: 'career-coach', to: 'education-mentor', count: 38 },
        { from: 'financial-advisor', to: 'life-strategist', count: 32 },
      ],
    };
  }
  
  /**
   * Get agent health status
   */
  getAgentHealth(): Map<string, boolean> {
    const health = new Map<string, boolean>();
    
    // Check each agent's recent performance
    this.performanceCache.forEach((metrics, key) => {
      const isHealthy = 
        metrics.successRate > 90 &&
        metrics.avgResponseTime < 5000 &&
        metrics.errorRate < 10;
      
      health.set(key, isHealthy);
    });
    
    return health;
  }
  
  /**
   * Generate agent analytics report
   */
  async generateReport(startDate: Date, endDate: Date): Promise<{
    summary: {
      totalRequests: number;
      totalTokens: number;
      avgResponseTime: number;
      successRate: number;
    };
    topAgents: Array<{ agentId: string; requests: number }>;
    layerPerformance: Array<{ layer: number; avgResponseTime: number }>;
    costAnalysis: {
      totalCost: number;
      costPerAgent: Array<{ agentId: string; cost: number }>;
    };
  }> {
    const allMetrics = Array.from(this.performanceCache.values());
    
    const totalRequests = allMetrics.reduce((sum, m) => sum + m.totalRequests, 0);
    const totalTokens = allMetrics.reduce((sum, m) => sum + m.totalTokens, 0);
    const avgResponseTime = allMetrics.reduce((sum, m) => sum + m.avgResponseTime, 0) / allMetrics.length;
    const successRate = allMetrics.reduce((sum, m) => sum + m.successRate, 0) / allMetrics.length;
    
    // Top agents by request volume
    const topAgents = allMetrics
      .sort((a, b) => b.totalRequests - a.totalRequests)
      .slice(0, 10)
      .map(m => ({ agentId: m.agentId, requests: m.totalRequests }));
    
    // Layer performance
    const layerMap = new Map<number, number[]>();
    allMetrics.forEach(m => {
      if (!layerMap.has(m.layer)) {
        layerMap.set(m.layer, []);
      }
      layerMap.get(m.layer)!.push(m.avgResponseTime);
    });
    
    const layerPerformance = Array.from(layerMap.entries())
      .map(([layer, times]) => ({
        layer,
        avgResponseTime: times.reduce((a, b) => a + b, 0) / times.length,
      }))
      .sort((a, b) => a.layer - b.layer);
    
    // Cost analysis (assuming $0.03 per 1K tokens for GPT-4)
    const tokenCost = 0.03 / 1000;
    const totalCost = totalTokens * tokenCost;
    
    const costPerAgent = allMetrics
      .map(m => ({
        agentId: m.agentId,
        cost: m.totalTokens * tokenCost,
      }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10);
    
    return {
      summary: {
        totalRequests,
        totalTokens,
        avgResponseTime,
        successRate,
      },
      topAgents,
      layerPerformance,
      costAnalysis: {
        totalCost,
        costPerAgent,
      },
    };
  }
  
  /**
   * Cleanup on shutdown
   */
  destroy() {
    clearInterval(this.flushInterval);
    this.flushAnalytics();
  }
}

// Global instance
export const agentAnalytics = new AgentAnalyticsTracker();

// Helper function to track agent requests
export async function trackAgentPerformance(
  agentId: string,
  layer: number,
  operation: string,
  fn: () => Promise<any>
): Promise<any> {
  const startTime = Date.now();
  const sessionId = Math.random().toString(36).substring(7);
  
  // Track active request
  agentAnalytics.trackActiveRequest(agentId, layer, true);
  
  try {
    const result = await fn();
    
    // Track successful request
    await agentAnalytics.trackAgentRequest({
      agentId,
      layer,
      timestamp: new Date(),
      responseTime: Date.now() - startTime,
      tokensUsed: result?.tokensUsed || 0,
      success: true,
      operation,
      sessionId,
      metadata: result?.metadata,
    });
    
    return result;
  } catch (error) {
    // Track failed request
    await agentAnalytics.trackAgentRequest({
      agentId,
      layer,
      timestamp: new Date(),
      responseTime: Date.now() - startTime,
      tokensUsed: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      operation,
      sessionId,
    });
    
    throw error;
  } finally {
    // Track request completion
    agentAnalytics.trackActiveRequest(agentId, layer, false);
  }
}

export default agentAnalytics;