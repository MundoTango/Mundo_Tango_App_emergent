/**
 * ESA LIFE CEO 61x21 - Prometheus Metrics Collection
 * Phase 14: Infrastructure Monitoring
 * 
 * Comprehensive metrics for all 61 layers and system components
 */

import { Registry, Counter, Histogram, Gauge, Summary } from 'prom-client';
import { Request, Response, NextFunction } from 'express';

// Create a custom registry for ESA metrics
export const esaRegistry = new Registry();
esaRegistry.setDefaultLabels({
  app: 'esa-life-ceo',
  framework: '61x21',
  phase: '14',
});

// ========== HTTP Metrics ==========
export const httpRequestDuration = new Histogram({
  name: 'esa_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'layer'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [esaRegistry],
});

export const httpRequestTotal = new Counter({
  name: 'esa_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [esaRegistry],
});

export const httpActiveRequests = new Gauge({
  name: 'esa_http_active_requests',
  help: 'Number of active HTTP requests',
  registers: [esaRegistry],
});

// ========== Database Metrics ==========
export const dbQueryDuration = new Histogram({
  name: 'esa_db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table', 'success'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [esaRegistry],
});

export const dbConnectionPool = new Gauge({
  name: 'esa_db_connection_pool_size',
  help: 'Database connection pool metrics',
  labelNames: ['state'], // active, idle, waiting
  registers: [esaRegistry],
});

export const dbTransactionTotal = new Counter({
  name: 'esa_db_transactions_total',
  help: 'Total number of database transactions',
  labelNames: ['status'], // committed, rolled_back
  registers: [esaRegistry],
});

// ========== Agent Metrics (61 Layers) ==========
export const agentRequestDuration = new Histogram({
  name: 'esa_agent_request_duration_seconds',
  help: 'Duration of agent requests in seconds',
  labelNames: ['agent_id', 'layer', 'operation'],
  buckets: [0.5, 1, 2, 5, 10, 30],
  registers: [esaRegistry],
});

export const agentRequestTotal = new Counter({
  name: 'esa_agent_requests_total',
  help: 'Total number of agent requests',
  labelNames: ['agent_id', 'layer', 'status'],
  registers: [esaRegistry],
});

export const agentTokenUsage = new Counter({
  name: 'esa_agent_token_usage_total',
  help: 'Total token usage by agents',
  labelNames: ['agent_id', 'layer', 'model'],
  registers: [esaRegistry],
});

export const agentActiveRequests = new Gauge({
  name: 'esa_agent_active_requests',
  help: 'Number of active agent requests',
  labelNames: ['agent_id', 'layer'],
  registers: [esaRegistry],
});

export const agentLayerHealth = new Gauge({
  name: 'esa_agent_layer_health',
  help: 'Health status of each agent layer (0=down, 1=up)',
  labelNames: ['layer', 'agent_type'],
  registers: [esaRegistry],
});

// ========== Memory & Performance Metrics ==========
export const memoryUsage = new Gauge({
  name: 'esa_memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['type'], // heap_used, heap_total, rss, external
  registers: [esaRegistry],
});

export const cpuUsage = new Gauge({
  name: 'esa_cpu_usage_percentage',
  help: 'CPU usage percentage',
  labelNames: ['type'], // user, system
  registers: [esaRegistry],
});

export const eventLoopLag = new Gauge({
  name: 'esa_event_loop_lag_milliseconds',
  help: 'Event loop lag in milliseconds',
  registers: [esaRegistry],
});

export const gcDuration = new Summary({
  name: 'esa_gc_duration_seconds',
  help: 'Garbage collection duration in seconds',
  labelNames: ['type'],
  registers: [esaRegistry],
});

// ========== Business Metrics ==========
export const userActivity = new Counter({
  name: 'esa_user_activity_total',
  help: 'User activity metrics',
  labelNames: ['action', 'role'], // login, post, event, message
  registers: [esaRegistry],
});

export const contentCreated = new Counter({
  name: 'esa_content_created_total',
  help: 'Content creation metrics',
  labelNames: ['type'], // post, event, group, memory
  registers: [esaRegistry],
});

export const realtimeConnections = new Gauge({
  name: 'esa_realtime_connections',
  help: 'Number of active WebSocket connections',
  labelNames: ['namespace'],
  registers: [esaRegistry],
});

export const cacheMetrics = new Gauge({
  name: 'esa_cache_metrics',
  help: 'Cache performance metrics',
  labelNames: ['operation', 'cache_name'], // hit, miss, set, delete
  registers: [esaRegistry],
});

// ========== Web Vitals Metrics ==========
export const webVitals = new Histogram({
  name: 'esa_web_vitals_seconds',
  help: 'Web Vitals metrics',
  labelNames: ['metric'], // lcp, fid, cls, ttfb, fcp
  buckets: [0.1, 0.25, 0.5, 1, 2.5, 4],
  registers: [esaRegistry],
});

// ========== Alert Metrics ==========
export const alertsTriggered = new Counter({
  name: 'esa_alerts_triggered_total',
  help: 'Total number of alerts triggered',
  labelNames: ['severity', 'category'],
  registers: [esaRegistry],
});

// ========== Middleware for HTTP metrics ==========
export function prometheusMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  // Track active requests
  httpActiveRequests.inc();
  
  // Clean up route for labeling
  const route = req.route?.path || req.path || 'unknown';
  const method = req.method;
  
  // Track response
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const status = res.statusCode.toString();
    
    // Update metrics
    httpRequestDuration.observe(
      { method, route, status_code: status, layer: 'http' },
      duration
    );
    
    httpRequestTotal.inc({ method, route, status_code: status });
    httpActiveRequests.dec();
  });
  
  next();
}

// ========== System metrics collector ==========
export function collectSystemMetrics() {
  setInterval(() => {
    const mem = process.memoryUsage();
    
    // Memory metrics
    memoryUsage.set({ type: 'heap_used' }, mem.heapUsed);
    memoryUsage.set({ type: 'heap_total' }, mem.heapTotal);
    memoryUsage.set({ type: 'rss' }, mem.rss);
    memoryUsage.set({ type: 'external' }, mem.external);
    
    // CPU metrics
    const cpuUsageData = process.cpuUsage();
    cpuUsage.set({ type: 'user' }, cpuUsageData.user / 1000000);
    cpuUsage.set({ type: 'system' }, cpuUsageData.system / 1000000);
    
    // Event loop metrics
    const lag = process.hrtime();
    setImmediate(() => {
      const delay = process.hrtime(lag);
      const delayMs = delay[0] * 1000 + delay[1] / 1000000;
      eventLoopLag.set(delayMs);
    });
  }, 10000); // Collect every 10 seconds
}

// ========== Agent layer health monitoring ==========
export function updateAgentLayerHealth(layer: number, agentType: string, isHealthy: boolean) {
  agentLayerHealth.set(
    { layer: layer.toString(), agent_type: agentType },
    isHealthy ? 1 : 0
  );
}

// ========== Initialize all 61 layer health metrics ==========
export function initializeLayerHealthMetrics() {
  const layers = [
    { layer: 1, type: 'database' },
    { layer: 2, type: 'authentication' },
    { layer: 3, type: 'api' },
    { layer: 4, type: 'websocket' },
    { layer: 5, type: 'frontend' },
    { layer: 6, type: 'mobile' },
    { layer: 7, type: 'analytics' },
    { layer: 8, type: 'monitoring' },
    { layer: 9, type: 'security' },
    { layer: 10, type: 'performance' },
    { layer: 11, type: 'testing' },
    { layer: 12, type: 'documentation' },
    { layer: 13, type: 'deployment' },
    { layer: 14, type: 'backup' },
    { layer: 15, type: 'scaling' },
    { layer: 16, type: 'life-ceo-health' },
    { layer: 17, type: 'life-ceo-career' },
    { layer: 18, type: 'life-ceo-finance' },
    { layer: 19, type: 'life-ceo-relationship' },
    { layer: 20, type: 'life-ceo-education' },
    { layer: 21, type: 'life-ceo-productivity' },
    { layer: 22, type: 'life-ceo-mindfulness' },
    { layer: 23, type: 'life-ceo-creative' },
    { layer: 24, type: 'life-ceo-travel' },
    { layer: 25, type: 'life-ceo-home' },
    { layer: 26, type: 'life-ceo-nutrition' },
    { layer: 27, type: 'life-ceo-fitness' },
    { layer: 28, type: 'life-ceo-sleep' },
    { layer: 29, type: 'life-ceo-habits' },
    { layer: 30, type: 'life-ceo-emergency' },
    { layer: 31, type: 'life-ceo-strategy' },
    { layer: 32, type: 'semantic-memory' },
    { layer: 33, type: 'context-management' },
    { layer: 34, type: 'response-generation' },
    { layer: 35, type: 'agent-management' },
    { layer: 36, type: 'decision-engine' },
    { layer: 37, type: 'intent-recognition' },
    { layer: 38, type: 'knowledge-graph' },
    { layer: 39, type: 'learning-system' },
    { layer: 40, type: 'personalization' },
    { layer: 41, type: 'recommendation' },
    { layer: 42, type: 'prediction' },
    { layer: 43, type: 'optimization' },
    { layer: 44, type: 'orchestration' },
    { layer: 45, type: 'workflow' },
    { layer: 46, type: 'integration' },
    { layer: 47, type: 'event-processing' },
    { layer: 48, type: 'monitoring-agent' },
    { layer: 49, type: 'logging' },
    { layer: 50, type: 'alerting' },
    { layer: 51, type: 'n8n-automation' },
    { layer: 52, type: 'docker' },
    { layer: 53, type: 'testsprite' },
    { layer: 54, type: 'version-control' },
    { layer: 55, type: 'module-guardian' },
    { layer: 56, type: 'workaround-wiki' },
    { layer: 57, type: 'automation-management' },
    { layer: 58, type: 'third-party' },
    { layer: 59, type: 'open-source' },
    { layer: 60, type: 'github' },
    { layer: 61, type: 'supabase' },
  ];
  
  layers.forEach(({ layer, type }) => {
    updateAgentLayerHealth(layer, type, true); // Initialize all as healthy
  });
}

// ========== Export metrics endpoint ==========
export async function getMetrics(): Promise<string> {
  return esaRegistry.metrics();
}

// Initialize system metrics collection
collectSystemMetrics();
initializeLayerHealthMetrics();

export default {
  esaRegistry,
  prometheusMiddleware,
  collectSystemMetrics,
  updateAgentLayerHealth,
  getMetrics,
};