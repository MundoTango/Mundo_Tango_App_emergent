/**
 * STREAM 3: Terminal Security - Audit Log API Routes
 * 
 * Endpoints for viewing command execution audit trail
 */

import { Router, type Request, type Response } from 'express';
import { commandAuditor } from '../services/commandAuditor';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import { logger } from '../lib/logger';

const router = Router();

/**
 * GET /api/audit/commands
 * Get recent command executions
 */
router.get('/commands', requireAuth, requireRole({ roles: ['super_admin'] }), (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;

    const audits = commandAuditor.getRecentAudits(limit, userId);

    res.json({
      success: true,
      audits,
      count: audits.length,
    });
  } catch (error) {
    logger.error({ error }, '[Audit API] Failed to get command audits');
    res.status(500).json({ error: 'Failed to get command audits' });
  }
});

/**
 * GET /api/audit/commands/:auditId
 * Get specific audit entry
 */
router.get('/commands/:auditId', requireAuth, requireRole({ roles: ['super_admin'] }), (req: Request, res: Response) => {
  try {
    const { auditId } = req.params;
    const audit = commandAuditor.getAudit(auditId);

    if (!audit) {
      return res.status(404).json({ error: 'Audit entry not found' });
    }

    res.json({
      success: true,
      audit,
    });
  } catch (error) {
    logger.error({ error }, '[Audit API] Failed to get audit entry');
    res.status(500).json({ error: 'Failed to get audit entry' });
  }
});

/**
 * GET /api/audit/failed
 * Get failed command executions
 */
router.get('/failed', requireAuth, requireRole({ roles: ['super_admin'] }), (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const failed = commandAuditor.getFailedCommands(limit);

    res.json({
      success: true,
      failed,
      count: failed.length,
    });
  } catch (error) {
    logger.error({ error }, '[Audit API] Failed to get failed commands');
    res.status(500).json({ error: 'Failed to get failed commands' });
  }
});

/**
 * GET /api/audit/high-risk
 * Get high-risk command executions
 */
router.get('/high-risk', requireAuth, requireRole({ roles: ['super_admin'] }), (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const highRisk = commandAuditor.getHighRiskCommands(limit);

    res.json({
      success: true,
      highRisk,
      count: highRisk.length,
    });
  } catch (error) {
    logger.error({ error }, '[Audit API] Failed to get high-risk commands');
    res.status(500).json({ error: 'Failed to get high-risk commands' });
  }
});

/**
 * GET /api/audit/stats
 * Get command execution statistics
 */
router.get('/stats', requireAuth, requireRole({ roles: ['super_admin'] }), (req: Request, res: Response) => {
  try {
    const stats = commandAuditor.getStats();

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    logger.error({ error }, '[Audit API] Failed to get stats');
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

export default router;
