/**
 * STREAM 2: Guardrails - Approval Queue API Routes
 * 
 * Endpoints for human-in-the-loop approval workflow
 */

import { Router, type Request, type Response } from 'express';
import { approvalQueue } from '../services/approvalQueue';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import { logger } from '../lib/logger';

const router = Router();

/**
 * GET /api/approvals/pending
 * Get all pending approval requests (super admin only)
 */
router.get('/pending', requireAuth, requireRole({ roles: ['super_admin'] }), (req: Request, res: Response) => {
  try {
    const pending = approvalQueue.getPendingRequests();
    res.json({
      success: true,
      requests: pending,
      count: pending.length,
    });
  } catch (error) {
    logger.error({ error }, '[Approval API] Failed to get pending requests');
    res.status(500).json({ error: 'Failed to get pending requests' });
  }
});

/**
 * GET /api/approvals/:requestId
 * Get specific approval request
 */
router.get('/:requestId', requireAuth, requireRole({ roles: ['super_admin'] }), (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const request = approvalQueue.getRequest(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({
      success: true,
      request,
    });
  } catch (error) {
    logger.error({ error }, '[Approval API] Failed to get request');
    res.status(500).json({ error: 'Failed to get request' });
  }
});

/**
 * POST /api/approvals/:requestId/approve
 * Approve an approval request
 */
router.post('/:requestId/approve', requireAuth, requireRole({ roles: ['super_admin'] }), async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const userId = (req.user as any).id;

    const request = await approvalQueue.approve(requestId, userId);

    if (!request) {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }

    res.json({
      success: true,
      request,
      message: 'Request approved',
    });
  } catch (error) {
    logger.error({ error }, '[Approval API] Failed to approve request');
    res.status(500).json({ error: 'Failed to approve request' });
  }
});

/**
 * POST /api/approvals/:requestId/reject
 * Reject an approval request
 */
router.post('/:requestId/reject', requireAuth, requireRole({ roles: ['super_admin'] }), async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const userId = (req.user as any).id;
    const { reason } = req.body;

    const request = await approvalQueue.reject(requestId, userId, reason);

    if (!request) {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }

    res.json({
      success: true,
      request,
      message: 'Request rejected',
    });
  } catch (error) {
    logger.error({ error }, '[Approval API] Failed to reject request');
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

/**
 * POST /api/approvals/create
 * Create new approval request (for testing)
 */
router.post('/create', requireAuth, requireRole({ roles: ['super_admin'] }), async (req: Request, res: Response) => {
  try {
    const { type, operation, context, riskLevel } = req.body;
    const userId = (req.user as any).id;

    if (!type || !operation) {
      return res.status(400).json({ error: 'Type and operation are required' });
    }

    const request = await approvalQueue.createRequest(
      type,
      operation,
      context || {},
      userId,
      riskLevel || 'medium'
    );

    res.json({
      success: true,
      request,
    });
  } catch (error) {
    logger.error({ error }, '[Approval API] Failed to create request');
    res.status(500).json({ error: 'Failed to create request' });
  }
});

export default router;
