/**
 * WEEK 3 STREAM 2: Real Approval Flow Engine
 * Replaces simulation at orchestrationEngine.ts line 380-383
 * WebSocket-based real-time approval requests
 */

import { Router } from 'express';
import { EventEmitter } from 'events';

const router = Router();
const approvalEmitter = new EventEmitter();

interface ApprovalRequest {
  id: string;
  taskId: string;
  timestamp: Date;
  filePath: string;
  diff: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  userId?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
}

// In-memory approval queue (use database in production)
const pendingApprovals = new Map<string, ApprovalRequest>();

/**
 * Request approval for file change (replaces simulation)
 */
export async function requestApproval(
  taskId: string,
  filePath: string,
  diff: string,
  risk: ApprovalRequest['risk'],
  description: string
): Promise<boolean> {
  const approvalId = `approval-${taskId}-${Date.now()}`;
  
  const approvalRequest: ApprovalRequest = {
    id: approvalId,
    taskId,
    timestamp: new Date(),
    filePath,
    diff,
    risk,
    description,
    status: 'pending'
  };
  
  pendingApprovals.set(approvalId, approvalRequest);
  
  console.log('⚠️ [APPROVAL] Requesting approval:', approvalId);
  console.log('📋 [APPROVAL] File:', filePath);
  console.log('🎚️ [APPROVAL] Risk:', risk);
  
  // Emit to WebSocket clients
  approvalEmitter.emit('approval-required', approvalRequest);
  
  // Wait for approval (with timeout)
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.log('⏱️ [APPROVAL] Timeout - auto-rejecting');
      approvalRequest.status = 'rejected';
      pendingApprovals.delete(approvalId);
      reject(new Error('Approval timeout'));
    }, 300000); // 5 minute timeout
    
    const handler = (resolvedApprovalId: string, approved: boolean) => {
      if (resolvedApprovalId === approvalId) {
        clearTimeout(timeout);
        approvalEmitter.off('approval-resolved', handler);
        
        if (approved) {
          console.log('✅ [APPROVAL] Approved:', approvalId);
          resolve(true);
        } else {
          console.log('❌ [APPROVAL] Rejected:', approvalId);
          resolve(false);
        }
      }
    };
    
    approvalEmitter.on('approval-resolved', handler);
  });
}

/**
 * POST /api/mrblue/autonomous/approve/:approvalId
 * User approves a pending change
 */
router.post('/approve/:approvalId', async (req, res) => {
  try {
    const { approvalId } = req.params;
    const { approved } = req.body;
    
    const approval = pendingApprovals.get(approvalId);
    
    if (!approval) {
      return res.status(404).json({
        success: false,
        error: 'Approval request not found or already resolved'
      });
    }
    
    // Update approval status
    approval.status = approved ? 'approved' : 'rejected';
    approval.resolvedAt = new Date();
    approval.resolvedBy = (req as any).user?.id || 'unknown';
    
    // Emit resolution event
    approvalEmitter.emit('approval-resolved', approvalId, approved);
    
    // Remove from pending
    pendingApprovals.delete(approvalId);
    
    console.log(`✅ [APPROVAL] Resolved: ${approvalId} - ${approved ? 'APPROVED' : 'REJECTED'}`);
    
    res.json({
      success: true,
      data: {
        approvalId,
        approved,
        filePath: approval.filePath
      }
    });
    
  } catch (error: any) {
    console.error('❌ [APPROVAL] Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/autonomous/pending-approvals
 * Get all pending approval requests
 */
router.get('/pending-approvals', async (req, res) => {
  try {
    const approvals = Array.from(pendingApprovals.values()).map(approval => ({
      id: approval.id,
      taskId: approval.taskId,
      timestamp: approval.timestamp,
      filePath: approval.filePath,
      diff: approval.diff,
      risk: approval.risk,
      description: approval.description,
      status: approval.status
    }));
    
    res.json({
      success: true,
      data: { approvals }
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/autonomous/bulk-approve
 * Approve multiple requests at once
 */
router.post('/bulk-approve', async (req, res) => {
  try {
    const { approvalIds, approved } = req.body;
    
    if (!Array.isArray(approvalIds)) {
      return res.status(400).json({
        success: false,
        error: 'approvalIds must be an array'
      });
    }
    
    const results = approvalIds.map(id => {
      const approval = pendingApprovals.get(id);
      
      if (!approval) {
        return { id, success: false, error: 'Not found' };
      }
      
      approval.status = approved ? 'approved' : 'rejected';
      approval.resolvedAt = new Date();
      approval.resolvedBy = (req as any).user?.id || 'unknown';
      
      approvalEmitter.emit('approval-resolved', id, approved);
      pendingApprovals.delete(id);
      
      return { id, success: true };
    });
    
    res.json({
      success: true,
      data: { results }
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
