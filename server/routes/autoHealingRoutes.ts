/**
 * TRACK 2: AUTO-HEALING ROUTES
 * ServiceHealthMonitor integration for autonomous system healing
 */

import { Router } from 'express';
import { requireAdmin } from '../middleware/secureAuth';
import { serviceHealthMonitor } from '../services/ServiceHealthMonitor';

export const autoHealingRouter = Router();

/**
 * GET /api/health/monitor
 * Get health status of all monitored services
 */
autoHealingRouter.get('/monitor', requireAdmin, async (req, res) => {
  try {
    const allHealth = serviceHealthMonitor.getAllHealthStatus();
    
    res.json({
      services: allHealth,
      summary: {
        total: allHealth.length,
        healthy: allHealth.filter(s => s.status === 'healthy').length,
        degraded: allHealth.filter(s => s.status === 'degraded').length,
        unhealthy: allHealth.filter(s => s.status === 'unhealthy').length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Health Monitor] Error:', error);
    res.status(500).json({
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/health/heal
 * Trigger auto-healing for a specific service
 */
autoHealingRouter.post('/heal', requireAdmin, async (req, res) => {
  try {
    const { serviceName } = req.body;

    console.log('🔧 [Auto-Heal] Triggering healing for:', serviceName);

    const result = await serviceHealthMonitor.heal(serviceName);

    res.json({
      service: serviceName,
      healed: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Auto-Heal] Error:', error);
    res.status(500).json({
      error: 'Healing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/health/history/:serviceName
 * Get health history for a service
 */
autoHealingRouter.get('/history/:serviceName', requireAdmin, async (req, res) => {
  try {
    const { serviceName } = req.params;
    const history = serviceHealthMonitor.getHealthHistory(serviceName);

    res.json({
      service: serviceName,
      history,
      count: history.length
    });

  } catch (error) {
    console.error('❌ [Health History] Error:', error);
    res.status(500).json({
      error: 'History retrieval failed'
    });
  }
});

export default autoHealingRouter;
