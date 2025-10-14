/**
 * AI Monitoring & Metrics Routes
 * Phase 5: Expose Phase 4 features via REST API
 */

import { Router, Request, Response } from 'express';
import { getSemanticCache } from '../utils/semantic-cache';
import { getCostAttributionService } from '../utils/cost-attribution';
import { getBaselineTracker } from '../utils/drift-detection';
import { getBlackboard } from '../utils/agent-blackboard';

const router = Router();

/**
 * GET /api/ai/cache/stats
 * Returns semantic cache statistics
 */
router.get('/cache/stats', async (req: Request, res: Response) => {
  try {
    const cache = getSemanticCache();
    const stats = cache.getStats();

    res.json({
      success: true,
      data: {
        ...stats,
        hit_rate_percentage: (stats.hit_rate * 100).toFixed(1),
        status: stats.total_queries > 0 ? 'active' : 'initializing'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ai/finops/summary
 * Returns FinOps cost summary
 */
router.get('/finops/summary', async (req: Request, res: Response) => {
  try {
    const costService = getCostAttributionService();
    const summary = costService.getFinOpsSummary();

    res.json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ai/finops/user/:userId
 * Returns cost attribution for specific user
 */
router.get('/finops/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const days = parseInt(req.query.days as string) || 30;

    const costService = getCostAttributionService();
    const attribution = costService.getUserCostAttribution(userId, days);

    res.json({
      success: true,
      data: attribution
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ai/drift/status
 * Returns drift detection status
 */
router.get('/drift/status', async (req: Request, res: Response) => {
  try {
    const tracker = getBaselineTracker();
    
    // Example: Check drift for complexity scores
    // In production, this would check actual feature distributions
    const features = ['complexity_score', 'token_count', 'response_quality'];
    const driftStatus = features.map(feature => ({
      feature,
      has_baseline: tracker.hasBaseline(feature),
      status: 'monitoring'
    }));

    res.json({
      success: true,
      data: {
        features: driftStatus,
        monitoring_active: driftStatus.some(f => f.has_baseline)
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ai/agents/blackboard
 * Returns agent blackboard state
 */
router.get('/agents/blackboard', async (req: Request, res: Response) => {
  try {
    const blackboard = getBlackboard();
    const stats = blackboard.getStats();
    const state = blackboard.getState();

    res.json({
      success: true,
      data: {
        stats,
        current_status: state.status,
        agent_states: state.agents,
        recent_messages: state.messages.slice(-10) // Last 10 messages
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ai/performance/overview
 * Returns combined performance overview
 */
router.get('/performance/overview', async (req: Request, res: Response) => {
  try {
    const cache = getSemanticCache();
    const cacheStats = cache.getStats();
    
    const costService = getCostAttributionService();
    const forecast = costService.getCostForecast();
    const alerts = costService.getBudgetAlerts();

    res.json({
      success: true,
      data: {
        cache: {
          hit_rate: (cacheStats.hit_rate * 100).toFixed(1) + '%',
          total_queries: cacheStats.total_queries,
          cost_saved: cacheStats.total_cost_saved.toFixed(4)
        },
        cost_forecast: {
          daily_rate: forecast.current_daily_rate.toFixed(2),
          monthly_projection: forecast.projected_monthly_cost.toFixed(2),
          trend: forecast.trend
        },
        alerts: alerts.length,
        status: alerts.some(a => a.alert_type === 'exceeded') ? 'critical' : 
                alerts.some(a => a.alert_type === 'critical') ? 'warning' : 'healthy'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
