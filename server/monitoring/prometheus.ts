/**
 * Phase 8 - Track A3: Prometheus Monitoring
 * Custom metrics for agent intelligence system
 */

import promClient from 'prom-client';

// Create a Registry
export const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// ============================================================================
// Agent Intelligence Metrics
// ============================================================================

// Auto-Fix Metrics
export const agentFixesTotal = new promClient.Counter({
  name: 'agent_fixes_total',
  help: 'Total number of auto-fixes attempted',
  labelNames: ['agent_id', 'strategy', 'success']
});

export const agentFixDuration = new promClient.Histogram({
  name: 'agent_fix_duration_ms',
  help: 'Auto-fix execution time in milliseconds',
  labelNames: ['agent_id', 'strategy'],
  buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
});

export const agentFixConfidence = new promClient.Gauge({
  name: 'agent_fix_confidence',
  help: 'ML confidence score for auto-fixes',
  labelNames: ['agent_id']
});

// Collaboration Metrics
export const agentCollaborationSuccess = new promClient.Counter({
  name: 'agent_collaboration_success_total',
  help: 'Total successful agent collaborations',
  labelNames: ['collaboration_type', 'leader_agent']
});

export const agentVotesTotal = new promClient.Counter({
  name: 'agent_votes_total',
  help: 'Total votes cast in collaborations',
  labelNames: ['voter_id', 'vote']
});

export const agentCollaborationDuration = new promClient.Histogram({
  name: 'agent_collaboration_duration_seconds',
  help: 'Time to complete collaboration in seconds',
  labelNames: ['collaboration_type'],
  buckets: [10, 30, 60, 180, 300, 600, 1800, 3600]
});

// Learning Pattern Metrics
export const agentLearningPatterns = new promClient.Gauge({
  name: 'agent_learning_patterns_total',
  help: 'Total number of learning patterns discovered',
  labelNames: ['domain', 'discovered_by']
});

export const mlConfidenceScore = new promClient.Histogram({
  name: 'ml_confidence_score',
  help: 'ML model confidence scores',
  buckets: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
});

// ============================================================================
// API Performance Metrics
// ============================================================================

export const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [10, 25, 50, 100, 250, 500, 1000, 2500, 5000]
});

export const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Cache Metrics
export const cacheHits = new promClient.Counter({
  name: 'cache_hits_total',
  help: 'Total cache hits',
  labelNames: ['cache_key_prefix']
});

export const cacheMisses = new promClient.Counter({
  name: 'cache_misses_total',
  help: 'Total cache misses',
  labelNames: ['cache_key_prefix']
});

export const cacheOperationDuration = new promClient.Histogram({
  name: 'cache_operation_duration_ms',
  help: 'Cache operation duration in milliseconds',
  labelNames: ['operation'],
  buckets: [1, 5, 10, 25, 50, 100]
});

// Database Metrics
export const dbQueryDuration = new promClient.Histogram({
  name: 'db_query_duration_ms',
  help: 'Database query duration in milliseconds',
  labelNames: ['query_type', 'table'],
  buckets: [10, 25, 50, 100, 250, 500, 1000, 2500]
});

export const dbConnectionsActive = new promClient.Gauge({
  name: 'db_connections_active',
  help: 'Number of active database connections'
});

// ============================================================================
// System Health Metrics
// ============================================================================

export const systemHealth = new promClient.Gauge({
  name: 'system_health_status',
  help: 'Overall system health (1 = healthy, 0 = unhealthy)',
  labelNames: ['component']
});

export const agentActiveCount = new promClient.Gauge({
  name: 'agent_active_count',
  help: 'Number of active agents',
  labelNames: ['agent_type']
});

// Register all metrics
register.registerMetric(agentFixesTotal);
register.registerMetric(agentFixDuration);
register.registerMetric(agentFixConfidence);
register.registerMetric(agentCollaborationSuccess);
register.registerMetric(agentVotesTotal);
register.registerMetric(agentCollaborationDuration);
register.registerMetric(agentLearningPatterns);
register.registerMetric(mlConfidenceScore);
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(cacheHits);
register.registerMetric(cacheMisses);
register.registerMetric(cacheOperationDuration);
register.registerMetric(dbQueryDuration);
register.registerMetric(dbConnectionsActive);
register.registerMetric(systemHealth);
register.registerMetric(agentActiveCount);

// Export metrics endpoint handler
export async function metricsHandler() {
  return register.metrics();
}

export default {
  register,
  metricsHandler,
  // Metrics
  agentFixesTotal,
  agentFixDuration,
  agentFixConfidence,
  agentCollaborationSuccess,
  agentVotesTotal,
  agentCollaborationDuration,
  agentLearningPatterns,
  mlConfidenceScore,
  httpRequestDuration,
  httpRequestsTotal,
  cacheHits,
  cacheMisses,
  cacheOperationDuration,
  dbQueryDuration,
  dbConnectionsActive,
  systemHealth,
  agentActiveCount
};
