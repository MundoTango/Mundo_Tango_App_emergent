/**
 * Extended AI Analytics API - Additional endpoints for advanced metrics
 * Agent #117 (Meta-Orchestrator)
 */

import { Router } from 'express';
import { aiPerformanceMonitor } from '../utils/ai-performance-monitor';

const router = Router();

/**
 * GET /api/ai/analytics/time-series
 * Returns time-series cost data for charting
 */
router.get('/time-series', (req, res) => {
  try {
    const intervalMinutes = parseInt(req.query.interval as string) || 60;
    const timeSeries = aiPerformanceMonitor.getTimeSeries(intervalMinutes);

    // Format for frontend
    const formatted = timeSeries.map(point => ({
      timestamp: point.timestamp,
      date: new Date(point.timestamp).toISOString(),
      actualCost: point.cost,
      baselineCost: point.queries * 0.025, // Baseline = always using Claude
      savings: (point.queries * 0.025) - point.cost,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('[AI Analytics] Time-series error:', error);
    res.status(500).json({
      error: 'Failed to fetch time-series data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/ai/analytics/model-comparison
 * Returns detailed model comparison stats
 */
router.get('/model-comparison', (req, res) => {
  try {
    const comparison = aiPerformanceMonitor.getModelComparison();
    res.json(comparison);
  } catch (error) {
    console.error('[AI Analytics] Model comparison error:', error);
    res.status(500).json({
      error: 'Failed to fetch model comparison',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/ai/analytics/summary
 * Returns comprehensive analytics summary
 */
router.get('/summary', (req, res) => {
  try {
    const metrics = aiPerformanceMonitor.getMetrics();
    const comparison = aiPerformanceMonitor.getModelComparison();
    const timeSeries = aiPerformanceMonitor.getTimeSeries(60);

    res.json({
      overview: {
        totalQueries: metrics.totalQueries,
        totalCost: metrics.totalCost,
        totalSavings: metrics.totalCostSaved,
        averageLatency: metrics.averageLatency,
        successRate: metrics.successRate,
      },
      modelUsage: metrics.modelUsage,
      complexityDistribution: metrics.complexityDistribution,
      modelComparison: comparison,
      recentActivity: {
        lastHour: metrics.lastHour.length,
        lastDay: metrics.lastDay.length,
      },
      trends: timeSeries.slice(-24), // Last 24 data points
    });
  } catch (error) {
    console.error('[AI Analytics] Summary error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics summary',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/ai/analytics/complexity
 * Returns query complexity distribution
 */
router.get('/complexity', (req, res) => {
  try {
    const metrics = aiPerformanceMonitor.getMetrics();
    
    const total = Object.values(metrics.complexityDistribution).reduce((sum, count) => sum + count, 0);
    
    const distribution = Object.entries(metrics.complexityDistribution).map(([complexity, count]) => ({
      complexity,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }));

    res.json({
      distribution,
      total,
    });
  } catch (error) {
    console.error('[AI Analytics] Complexity error:', error);
    res.status(500).json({
      error: 'Failed to fetch complexity distribution',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/ai/analytics/clear
 * Clear all analytics data (admin only)
 */
router.post('/clear', (req, res) => {
  try {
    // TODO: Add admin authorization check
    aiPerformanceMonitor.clear();
    
    res.json({
      success: true,
      message: 'All analytics data cleared',
    });
  } catch (error) {
    console.error('[AI Analytics] Clear error:', error);
    res.status(500).json({
      error: 'Failed to clear analytics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
