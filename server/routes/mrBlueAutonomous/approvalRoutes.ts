import { Router } from 'express';
import { db } from '../../db.js';
import { sql } from 'drizzle-orm';

const router = Router();

// In-memory pending approvals (would be better in database for production)
const pendingApprovals = new Map<string, {
  action: string;
  impact: 'low' | 'medium' | 'high';
  preview: string;
  files: string[];
  timestamp: string;
  userId: number;
}>();

/**
 * POST /api/mrblue/request-approval
 * Request user approval for destructive operation
 */
router.post('/request-approval', async (req, res) => {
  try {
    const { action, impact = 'medium', preview, files = [] } = req.body;

    if (!action || typeof action !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'action is required and must be a string'
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  [MR BLUE - APPROVAL REQUEST]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 Action:', action);
    console.log('⚡ Impact:', impact);
    console.log('📁 Files affected:', files.length);

    const approvalId = `approval-${Date.now()}`;
    const userId = (req.user as any)?.id || 1;

    // Store approval request
    pendingApprovals.set(approvalId, {
      action,
      impact,
      preview: preview || '',
      files,
      timestamp: new Date().toISOString(),
      userId
    });

    console.log('✅ Approval requested:', approvalId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    res.json({
      success: true,
      data: {
        approvalId,
        action,
        impact,
        preview,
        files,
        message: 'Waiting for user approval'
      }
    });

  } catch (error: any) {
    console.error('❌ [APPROVAL REQUEST ERROR]:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/approve/:approvalId
 * Approve or reject an action
 */
router.post('/approve/:approvalId', async (req, res) => {
  try {
    const { approvalId } = req.params;
    const { approved, reason } = req.body;

    const approval = pendingApprovals.get(approvalId);
    
    if (!approval) {
      return res.status(404).json({
        success: false,
        error: 'Approval request not found'
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(approved ? '✅ [MR BLUE - APPROVED]' : '❌ [MR BLUE - REJECTED]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 Approval ID:', approvalId);
    console.log('🔧 Action:', approval.action);
    console.log('💭 Reason:', reason || 'none');

    // Remove from pending
    pendingApprovals.delete(approvalId);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    res.json({
      success: true,
      data: {
        approvalId,
        approved,
        action: approval.action,
        reason: reason || undefined
      }
    });

  } catch (error: any) {
    console.error('❌ [APPROVAL ERROR]:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/pending-approvals
 * Get all pending approval requests
 */
router.get('/pending-approvals', async (req, res) => {
  try {
    const userId = (req.user as any)?.id || 1;

    const userApprovals = Array.from(pendingApprovals.entries())
      .filter(([_, approval]) => approval.userId === userId)
      .map(([id, approval]) => ({
        approvalId: id,
        ...approval
      }));

    console.log('📋 [MR BLUE - PENDING APPROVALS]:', userApprovals.length);

    res.json({
      success: true,
      data: userApprovals
    });

  } catch (error: any) {
    console.error('❌ [PENDING APPROVALS ERROR]:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
