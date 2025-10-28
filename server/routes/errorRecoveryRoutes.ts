/**
 * Error Recovery & Circuit Breaker API Routes
 * MB.MD SIMULTANEOUS Stream 2: Error Recovery Infrastructure
 * Monitoring and management of error recovery systems
 * Created: October 28, 2025
 */

import { Router, Request, Response } from 'express';
import { fallbackStrategy } from '../services/errorRecovery/FallbackStrategy';

const router = Router();

/**
 * GET /api/error-recovery/circuit-breakers
 * Get status of all circuit breakers
 */
router.get('/circuit-breakers', async (req: Request, res: Response) => {
  try {
    const stats = fallbackStrategy.getCircuitBreakerStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('[ErrorRecoveryAPI] Failed to get circuit breaker stats:', error);
    res.status(500).json({ error: 'Failed to fetch circuit breaker stats' });
  }
});

/**
 * POST /api/error-recovery/circuit-breakers/reset
 * Reset all circuit breakers (admin only)
 */
router.post('/circuit-breakers/reset', async (req: Request, res: Response) => {
  try {
    // TODO: Add admin role check
    if (!req.user || (req.user as any).role !== 'super_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    fallbackStrategy.resetAllCircuitBreakers();
    res.json({ success: true, message: 'All circuit breakers reset' });
  } catch (error) {
    console.error('[ErrorRecoveryAPI] Failed to reset circuit breakers:', error);
    res.status(500).json({ error: 'Failed to reset circuit breakers' });
  }
});

/**
 * GET /api/error-recovery/fallback-chain
 * Get the fallback model chain
 */
router.get('/fallback-chain', async (req: Request, res: Response) => {
  try {
    const tier = (req.query.tier as 'premium' | 'cheap' | 'free') || 'free';
    const chain = fallbackStrategy.getFallbackChain(tier);
    res.json({ success: true, data: chain });
  } catch (error) {
    console.error('[ErrorRecoveryAPI] Failed to get fallback chain:', error);
    res.status(500).json({ error: 'Failed to fetch fallback chain' });
  }
});

export default router;
