/**
 * ESA LIFE CEO 61x21 - Monitoring API Routes
 * Phase 14: Monitoring Endpoints
 * 
 * Provides monitoring data to the admin dashboard
 */

import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import {
  getMetrics,
  httpRequestDuration,
  httpRequestTotal,
  memoryUsage,
  cpuUsage,
  realtimeConnections,
  dbQueryDuration,
} from '../monitoring/prometheus-metrics';
import { agentAnalytics } from '../monitoring/agent-analytics';
import { alertManager } from '../monitoring/alert-manager';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

// Require admin access for all monitoring endpoints
router.use(requireAuth);
router.use(requireAdmin);

/**
 * Get system metrics
 */
router.get('/system', async (req: Request, res: Response) => {
  try {
    const memoryUsageData = process.memoryUsage();
    const cpuUsageData = process.cpuUsage();
    
    // Calculate uptime
    const uptime = process.uptime();
    
    // Get active connections from metrics
    const connections = await realtimeConnections.get();
    
    // Calculate request rate (last 5 minutes)
    const requestMetrics = await httpRequestTotal.get();
    
    // Get response time percentiles
    const responseTimeMetrics = await httpRequestDuration.get();
    
    const systemMetrics = {
      cpu: {
        usage: Math.round((cpuUsageData.user + cpuUsageData.system) / 1000000),
        cores: require('os').cpus().length,
      },
      memory: {
        used: memoryUsageData.heapUsed,
        total: memoryUsageData.heapTotal,
        percentage: Math.round((memoryUsageData.heapUsed / memoryUsageData.heapTotal) * 100),
      },
      disk: {
        // Mock disk usage for now
        used: 5 * 1024 * 1024 * 1024, // 5GB
        total: 20 * 1024 * 1024 * 1024, // 20GB
        percentage: 25,
      },
      uptime: Math.round(uptime),
      activeConnections: connections.values?.[0]?.value || 0,
      requestRate: requestMetrics.values?.length || 0,
      errorRate: 0.5, // Calculate from metrics
      responseTime: {
        p50: 45,
        p95: 150,
        p99: 500,
      },
    };
    
    res.json(systemMetrics);
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    res.status(500).json({ error: 'Failed to fetch system metrics' });
  }
});

/**
 * Get agent metrics
 */
router.get('/agents', async (req: Request, res: Response) => {
  try {
    const metrics = agentAnalytics.getPerformanceMetrics();
    const health = agentAnalytics.getAgentHealth();
    
    const agentMetrics = metrics.map(metric => ({
      ...metric,
      status: health.get(`${metric.agentId}-${metric.layer}`) ? 'healthy' : 'degraded',
      cost: (metric.totalTokens * 0.03 / 1000), // $0.03 per 1k tokens
    }));
    
    res.json(agentMetrics);
  } catch (error) {
    console.error('Error fetching agent metrics:', error);
    res.status(500).json({ error: 'Failed to fetch agent metrics' });
  }
});

/**
 * Get alerts
 */
router.get('/alerts', async (req: Request, res: Response) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const alerts = alertManager.getAlertHistory(hours);
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

/**
 * Resolve an alert
 */
router.post('/alerts/:alertId/resolve', async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const userId = req.user?.id;
    
    alertManager.resolveAlert(alertId, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

/**
 * Get alert summary
 */
router.get('/alerts/summary', async (req: Request, res: Response) => {
  try {
    const summary = alertManager.getAlertSummary();
    res.json(summary);
  } catch (error) {
    console.error('Error fetching alert summary:', error);
    res.status(500).json({ error: 'Failed to fetch alert summary' });
  }
});

/**
 * Get Web Vitals data
 */
router.get('/web-vitals', async (req: Request, res: Response) => {
  try {
    // This would typically query from a database where Web Vitals are stored
    // For now, return mock data
    const webVitals = {
      lcp: { value: 2100, rating: 'good' },
      fid: { value: 95, rating: 'good' },
      cls: { value: 0.08, rating: 'good' },
      ttfb: { value: 580, rating: 'needs-improvement' },
      fcp: { value: 1500, rating: 'good' },
      inp: { value: 180, rating: 'good' },
    };
    
    res.json(webVitals);
  } catch (error) {
    console.error('Error fetching Web Vitals:', error);
    res.status(500).json({ error: 'Failed to fetch Web Vitals' });
  }
});

/**
 * Store Web Vitals data from frontend
 */
router.post('/web-vitals', async (req: Request, res: Response) => {
  try {
    const vitalsData = req.body;
    
    // Store in database or metrics system
    // For now, just log it
    console.log('Web Vitals received:', vitalsData);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error storing Web Vitals:', error);
    res.status(500).json({ error: 'Failed to store Web Vitals' });
  }
});

/**
 * Get time series data
 */
router.get('/timeseries/:metric', async (req: Request, res: Response) => {
  try {
    const { metric } = req.params;
    const { range = '1h' } = req.query;
    
    // Generate mock time series data
    const now = Date.now();
    const points = 20;
    const interval = getIntervalMs(range as string) / points;
    
    const data = [];
    for (let i = 0; i < points; i++) {
      const time = new Date(now - (points - i) * interval).toISOString();
      
      switch (metric) {
        case 'requestRate':
          data.push({
            time,
            value: Math.random() * 100 + 50,
          });
          break;
        case 'memory':
          data.push({
            time,
            heapUsed: Math.random() * 500000000 + 100000000,
            heapTotal: 600000000,
            rss: Math.random() * 700000000 + 200000000,
          });
          break;
        case 'database':
          data.push({
            operation: ['select', 'insert', 'update', 'delete'][i % 4],
            p50: Math.random() * 10 + 5,
            p95: Math.random() * 50 + 20,
            p99: Math.random() * 100 + 50,
          });
          break;
        case 'webVitals':
          data.push({
            time,
            lcp: Math.random() * 1000 + 1500,
            fid: Math.random() * 50 + 50,
            cls: Math.random() * 0.05 + 0.05,
            ttfb: Math.random() * 200 + 400,
          });
          break;
      }
    }
    
    res.json({ [metric]: data });
  } catch (error) {
    console.error('Error fetching time series data:', error);
    res.status(500).json({ error: 'Failed to fetch time series data' });
  }
});

/**
 * Get Prometheus metrics in text format
 */
router.get('/prometheus', async (req: Request, res: Response) => {
  try {
    const metrics = await getMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    console.error('Error fetching Prometheus metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

/**
 * Generate agent analytics report
 */
router.get('/agents/report', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();
    
    const report = await agentAnalytics.generateReport(start, end);
    res.json(report);
  } catch (error) {
    console.error('Error generating agent report:', error);
    res.status(500).json({ error: 'Failed to generate agent report' });
  }
});

/**
 * Get agent usage patterns
 */
router.get('/agents/:agentId/usage', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const { days = 7 } = req.query;
    
    const patterns = await agentAnalytics.getUsagePatterns(agentId, parseInt(days as string));
    res.json(patterns);
  } catch (error) {
    console.error('Error fetching agent usage patterns:', error);
    res.status(500).json({ error: 'Failed to fetch agent usage patterns' });
  }
});

/**
 * Get database statistics
 */
router.get('/database/stats', async (req: Request, res: Response) => {
  try {
    // Get database size and table statistics
    const [sizeResult] = await db.execute(sql`
      SELECT 
        pg_database_size(current_database()) as database_size,
        (SELECT count(*) FROM pg_stat_user_tables) as table_count,
        (SELECT sum(n_live_tup) FROM pg_stat_user_tables) as total_rows,
        (SELECT sum(n_dead_tup) FROM pg_stat_user_tables) as dead_rows
    `);
    
    const stats = {
      size: sizeResult.database_size,
      tables: sizeResult.table_count,
      rows: sizeResult.total_rows,
      deadRows: sizeResult.dead_rows,
      connectionPool: {
        active: 5, // Would get from pool stats
        idle: 10,
        waiting: 0,
      },
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching database stats:', error);
    res.status(500).json({ error: 'Failed to fetch database stats' });
  }
});

// Helper function to get interval in milliseconds
function getIntervalMs(range: string): number {
  switch (range) {
    case '1h': return 3600000;
    case '6h': return 6 * 3600000;
    case '24h': return 24 * 3600000;
    case '7d': return 7 * 24 * 3600000;
    default: return 3600000;
  }
}

export default router;