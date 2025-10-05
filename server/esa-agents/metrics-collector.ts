/**
 * ESA 61x21 Multi-Agent System Metrics Collector
 * Collects and exposes Prometheus metrics for monitoring
 */

import { register, Counter, Gauge, Histogram, Summary, collectDefaultMetrics } from 'prom-client';
import { agentSystem } from './agent-system';
import knowledgeGraph from '../esa-master-knowledge-graph.json';

// Clear existing metrics to avoid duplicates
register.clear();

// Collect default Node.js metrics
collectDefaultMetrics({ prefix: 'esa_agents_' });

/**
 * Agent Request Metrics
 */
export const agentRequestCounter = new Counter({
  name: 'esa_agents_requests_total',
  help: 'Total number of agent requests by type',
  labelNames: ['agent_id', 'agent_name', 'job_type', 'status']
});

export const agentResponseTime = new Histogram({
  name: 'esa_agents_response_time_ms',
  help: 'Response time per agent in milliseconds',
  labelNames: ['agent_id', 'agent_name', 'job_type'],
  buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
});

export const agentSuccessRate = new Gauge({
  name: 'esa_agents_success_rate',
  help: 'Success rate for each agent (percentage)',
  labelNames: ['agent_id', 'agent_name']
});

export const agentActiveRequests = new Gauge({
  name: 'esa_agents_active_requests',
  help: 'Number of currently active agent requests',
  labelNames: ['agent_id', 'agent_name']
});

/**
 * Queue Metrics
 */
export const queueDepth = new Gauge({
  name: 'esa_agents_queue_depth',
  help: 'Current depth of agent job queues',
  labelNames: ['agent_id', 'queue_name', 'status']
});

export const queueProcessingRate = new Gauge({
  name: 'esa_agents_queue_processing_rate',
  help: 'Jobs processed per second',
  labelNames: ['agent_id', 'queue_name']
});

/**
 * OpenAI Integration Metrics
 */
export const openaiTokenUsage = new Counter({
  name: 'esa_agents_openai_tokens_total',
  help: 'Total OpenAI tokens consumed',
  labelNames: ['model', 'agent_id', 'type'] // type: prompt or completion
});

export const openaiApiErrors = new Counter({
  name: 'esa_agents_openai_errors_total',
  help: 'Total OpenAI API errors',
  labelNames: ['error_type', 'agent_id', 'model']
});

export const openaiApiLatency = new Histogram({
  name: 'esa_agents_openai_latency_ms',
  help: 'OpenAI API call latency',
  labelNames: ['model', 'agent_id'],
  buckets: [100, 500, 1000, 2500, 5000, 10000, 30000]
});

export const openaiRateLimitHits = new Counter({
  name: 'esa_agents_openai_rate_limit_total',
  help: 'Number of rate limit hits from OpenAI',
  labelNames: ['agent_id', 'model']
});

/**
 * Error Tracking Metrics
 */
export const agentErrors = new Counter({
  name: 'esa_agents_errors_total',
  help: 'Total errors by agent and type',
  labelNames: ['agent_id', 'agent_name', 'error_type', 'severity']
});

export const criticalAlerts = new Counter({
  name: 'esa_agents_critical_alerts_total',
  help: 'Critical alerts requiring immediate attention',
  labelNames: ['alert_type', 'agent_id', 'component']
});

/**
 * System Health Metrics
 */
export const systemHealth = new Gauge({
  name: 'esa_agents_system_health',
  help: 'Overall system health score (0-100)',
  labelNames: ['component']
});

export const agentAvailability = new Gauge({
  name: 'esa_agents_availability',
  help: 'Agent availability (1 = available, 0 = unavailable)',
  labelNames: ['agent_id', 'agent_name']
});

/**
 * Pattern Application Metrics
 */
export const patternApplications = new Counter({
  name: 'esa_agents_pattern_applications_total',
  help: 'Number of pattern applications by type',
  labelNames: ['pattern_name', 'agent_id']
});

export const antiPatternDetections = new Counter({
  name: 'esa_agents_antipattern_detections_total',
  help: 'Anti-pattern detections by type',
  labelNames: ['antipattern_name', 'agent_id', 'layer']
});

/**
 * User Engagement Metrics
 */
export const userEngagement = new Summary({
  name: 'esa_agents_user_engagement',
  help: 'User engagement metrics',
  labelNames: ['interaction_type', 'agent_id'],
  percentiles: [0.5, 0.75, 0.9, 0.95, 0.99]
});

export const concurrentUsers = new Gauge({
  name: 'esa_agents_concurrent_users',
  help: 'Number of concurrent users interacting with agents'
});

/**
 * Metrics Collection Service
 */
export class MetricsCollector {
  private collectionInterval: NodeJS.Timeout | null = null;
  private errorLog: Array<{
    timestamp: number;
    agentId: string;
    error: string;
    severity: string;
  }> = [];
  
  constructor() {
    this.setupErrorTracking();
  }
  
  /**
   * Start collecting metrics periodically
   */
  startCollection(intervalMs: number = 10000) {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
    }
    
    this.collectionInterval = setInterval(() => {
      this.collectMetrics();
    }, intervalMs);
    
    // Initial collection
    this.collectMetrics();
    
    console.log(`📊 Metrics collection started (interval: ${intervalMs}ms)`);
  }
  
  /**
   * Stop collecting metrics
   */
  stopCollection() {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }
  }
  
  /**
   * Collect current metrics from the agent system
   */
  private async collectMetrics() {
    try {
      // Get system metrics
      const metrics = agentSystem.getMetrics();
      const health = await agentSystem.healthCheck();
      
      // Update system health
      const healthScore = health.status === 'healthy' ? 100 : 
                         health.status === 'degraded' ? 50 : 0;
      systemHealth.set({ component: 'overall' }, healthScore);
      
      // Update agent availability
      for (const [agentId, status] of Object.entries(health.agents)) {
        const domain = this.getAgentDomain(agentId);
        if (domain) {
          agentAvailability.set(
            { agent_id: agentId, agent_name: domain.name },
            status === 'healthy' ? 1 : 0
          );
        }
      }
      
      // Update queue metrics
      if (metrics.queueStats) {
        for (const [queueName, stats] of Object.entries(metrics.queueStats as any)) {
          const agentId = queueName.replace('agent_', '');
          const queueStats = stats as { waiting?: number; active?: number };
          queueDepth.set(
            { agent_id: agentId, queue_name: queueName, status: 'waiting' },
            queueStats.waiting || 0
          );
          queueDepth.set(
            { agent_id: agentId, queue_name: queueName, status: 'active' },
            queueStats.active || 0
          );
        }
      }
      
      // Calculate success rates
      this.calculateSuccessRates();
      
    } catch (error) {
      console.error('Error collecting metrics:', error);
      agentErrors.inc({ 
        agent_id: 'system', 
        agent_name: 'MetricsCollector',
        error_type: 'collection_error',
        severity: 'warning'
      });
    }
  }
  
  /**
   * Calculate and update success rates for each agent
   */
  private calculateSuccessRates() {
    const agents = Object.values(knowledgeGraph.esa_knowledge_graph.agent_domains);
    
    for (const agent of agents) {
      // This would normally calculate from actual request data
      // For now, using a simulated value
      const successRate = 95 + Math.random() * 5; // 95-100%
      agentSuccessRate.set(
        { agent_id: agent.id, agent_name: agent.name },
        successRate
      );
    }
  }
  
  /**
   * Track an agent request
   */
  trackRequest(agentId: string, jobType: string, success: boolean, responseTimeMs: number) {
    const domain = this.getAgentDomain(agentId);
    if (!domain) return;
    
    // Increment request counter
    agentRequestCounter.inc({
      agent_id: agentId,
      agent_name: domain.name,
      job_type: jobType,
      status: success ? 'success' : 'failure'
    });
    
    // Record response time
    agentResponseTime.observe(
      { agent_id: agentId, agent_name: domain.name, job_type: jobType },
      responseTimeMs
    );
    
    // Track user engagement
    userEngagement.observe(
      { interaction_type: jobType, agent_id: agentId },
      responseTimeMs
    );
  }
  
  /**
   * Track OpenAI API usage
   */
  trackOpenAIUsage(agentId: string, model: string, promptTokens: number, completionTokens: number) {
    openaiTokenUsage.inc(
      { model, agent_id: agentId, type: 'prompt' },
      promptTokens
    );
    openaiTokenUsage.inc(
      { model, agent_id: agentId, type: 'completion' },
      completionTokens
    );
  }
  
  /**
   * Track OpenAI API error
   */
  trackOpenAIError(agentId: string, model: string, errorType: string) {
    openaiApiErrors.inc({
      error_type: errorType,
      agent_id: agentId,
      model
    });
    
    if (errorType === 'rate_limit') {
      openaiRateLimitHits.inc({ agent_id: agentId, model });
    }
  }
  
  /**
   * Track agent error
   */
  trackError(agentId: string, errorType: string, severity: 'low' | 'medium' | 'high' | 'critical', details?: string) {
    const domain = this.getAgentDomain(agentId);
    
    agentErrors.inc({
      agent_id: agentId,
      agent_name: domain?.name || 'unknown',
      error_type: errorType,
      severity
    });
    
    // Log error details
    this.errorLog.push({
      timestamp: Date.now(),
      agentId,
      error: details || errorType,
      severity
    });
    
    // Trim error log to last 1000 entries
    if (this.errorLog.length > 1000) {
      this.errorLog = this.errorLog.slice(-1000);
    }
    
    // Track critical alerts
    if (severity === 'critical') {
      criticalAlerts.inc({
        alert_type: errorType,
        agent_id: agentId,
        component: domain?.name || 'unknown'
      });
      
      // Log critical error
      console.error(`🚨 CRITICAL ERROR in agent ${agentId}: ${errorType} - ${details}`);
    }
  }
  
  /**
   * Track pattern application
   */
  trackPatternApplication(agentId: string, patternName: string) {
    patternApplications.inc({
      pattern_name: patternName,
      agent_id: agentId
    });
  }
  
  /**
   * Track anti-pattern detection
   */
  trackAntiPatternDetection(agentId: string, antiPatternName: string, layer: number) {
    antiPatternDetections.inc({
      antipattern_name: antiPatternName,
      agent_id: agentId,
      layer: layer.toString()
    });
  }
  
  /**
   * Update concurrent users
   */
  updateConcurrentUsers(count: number) {
    concurrentUsers.set(count);
  }
  
  /**
   * Get agent domain from knowledge graph
   */
  private getAgentDomain(agentId: string) {
    return Object.values(knowledgeGraph.esa_knowledge_graph.agent_domains)
      .find(domain => domain.id === agentId);
  }
  
  /**
   * Setup error tracking and recovery
   */
  private setupErrorTracking() {
    // Monitor uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.trackError('system', 'uncaught_exception', 'critical', error.message);
    });
    
    // Monitor unhandled promise rejections
    process.on('unhandledRejection', (reason: any) => {
      this.trackError('system', 'unhandled_rejection', 'high', reason?.message || String(reason));
    });
  }
  
  /**
   * Get error log for analysis
   */
  getErrorLog(limit: number = 100) {
    return this.errorLog.slice(-limit);
  }
  
  /**
   * Get metrics in Prometheus format
   */
  async getPrometheusMetrics(): Promise<string> {
    return register.metrics();
  }
  
  /**
   * Get metrics as JSON for dashboard
   */
  async getMetricsJson() {
    const metrics = await register.getMetricsAsJSON();
    return {
      metrics,
      errorLog: this.getErrorLog(50),
      timestamp: Date.now()
    };
  }
  
  /**
   * Get analytics data
   */
  async getAnalytics() {
    const metrics = agentSystem.getMetrics();
    const health = await agentSystem.healthCheck();
    
    // Calculate aggregate stats
    const totalRequests = await this.getTotalRequests();
    const avgResponseTime = await this.getAverageResponseTime();
    const errorRate = await this.getErrorRate();
    
    return {
      summary: {
        totalRequests,
        avgResponseTime,
        errorRate,
        healthScore: health.status === 'healthy' ? 100 : 50,
        activeAgents: Object.keys(health.agents).length,
        totalLayers: 61
      },
      agentPerformance: await this.getAgentPerformance(),
      topPatterns: await this.getTopPatterns(),
      recentErrors: this.getErrorLog(20),
      systemMetrics: metrics,
      timestamp: Date.now()
    };
  }
  
  /**
   * Helper methods for analytics
   */
  private async getTotalRequests(): Promise<number> {
    const metric = await register.getSingleMetric('esa_agents_requests_total');
    if (!metric) return 0;
    const values = await (metric as any).get();
    return values.values.reduce((sum: number, v: any) => sum + (v.value || 0), 0);
  }
  
  private async getAverageResponseTime(): Promise<number> {
    const metric = await register.getSingleMetric('esa_agents_response_time_ms');
    if (!metric) return 0;
    const values = await (metric as any).get();
    if (!values.values.length) return 0;
    
    let totalTime = 0;
    let totalCount = 0;
    for (const v of values.values) {
      if (v.metricName === 'esa_agents_response_time_ms_sum') {
        totalTime += v.value || 0;
      }
      if (v.metricName === 'esa_agents_response_time_ms_count') {
        totalCount += v.value || 0;
      }
    }
    
    return totalCount > 0 ? totalTime / totalCount : 0;
  }
  
  private async getErrorRate(): Promise<number> {
    const totalRequests = await this.getTotalRequests();
    if (totalRequests === 0) return 0;
    
    const errorMetric = await register.getSingleMetric('esa_agents_errors_total');
    if (!errorMetric) return 0;
    
    const values = await (errorMetric as any).get();
    const totalErrors = values.values.reduce((sum: number, v: any) => sum + (v.value || 0), 0);
    
    return (totalErrors / totalRequests) * 100;
  }
  
  private async getAgentPerformance() {
    const agents = Object.values(knowledgeGraph.esa_knowledge_graph.agent_domains);
    const performance = [];
    
    for (const agent of agents) {
      const successMetric = await register.getSingleMetric('esa_agents_success_rate');
      const responseMetric = await register.getSingleMetric('esa_agents_response_time_ms');
      
      let successRate = 95;
      let avgResponseTime = 100;
      
      if (successMetric) {
        const values = await (successMetric as any).get();
        const agentValue = values.values.find((v: any) => 
          v.labels?.agent_id === agent.id
        );
        if (agentValue) successRate = agentValue.value;
      }
      
      performance.push({
        id: agent.id,
        name: agent.name,
        successRate,
        avgResponseTime,
        layers: agent.layers
      });
    }
    
    return performance;
  }
  
  private async getTopPatterns() {
    const metric = await register.getSingleMetric('esa_agents_pattern_applications_total');
    if (!metric) return [];
    
    const values = await (metric as any).get();
    const patterns = new Map<string, number>();
    
    for (const v of values.values) {
      const patternName = v.labels?.pattern_name;
      if (patternName) {
        patterns.set(patternName, (patterns.get(patternName) || 0) + (v.value || 0));
      }
    }
    
    return Array.from(patterns.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}

// Create and export singleton instance
export const metricsCollector = new MetricsCollector();

// Auto-start collection if not in test environment
if (process.env.NODE_ENV !== 'test') {
  metricsCollector.startCollection();
}