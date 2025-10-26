/**
 * AGENT #142 (Multi-Model): Autonomous File Editing API Routes
 * 
 * Endpoints for autonomous code editing with YOLO mode
 * Research: docs/research/AUTONOMOUS_CODING_RESEARCH.md
 */

import { Router, type Request, type Response } from 'express';
import { autonomousEditor, type FileEdit } from '../services/autonomousFileEditor';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import { logger } from '../lib/logger';

const router = Router();

/**
 * GET /api/autonomous/config
 * Get current autonomous editor configuration
 */
router.get('/config', requireAuth, requireRole({ roles: ['super_admin'] }), (req: Request, res: Response) => {
  try {
    const config = autonomousEditor.getConfig();
    res.json({ success: true, config });
  } catch (error) {
    logger.error({ error }, '[Autonomous API] Failed to get config');
    res.status(500).json({ error: 'Failed to get configuration' });
  }
});

/**
 * POST /api/autonomous/yolo-mode
 * Toggle YOLO mode (super admin only)
 */
router.post('/yolo-mode', requireAuth, requireRole({ roles: ['super_admin'] }), (req: Request, res: Response) => {
  try {
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled must be a boolean' });
    }

    autonomousEditor.setYoloMode(enabled);
    
    res.json({ 
      success: true, 
      yoloMode: enabled,
      message: `YOLO mode ${enabled ? 'ENABLED' : 'DISABLED'}` 
    });
  } catch (error) {
    logger.error({ error }, '[Autonomous API] Failed to toggle YOLO mode');
    res.status(500).json({ error: 'Failed to toggle YOLO mode' });
  }
});

/**
 * POST /api/autonomous/edit
 * Apply single file edit
 */
router.post('/edit', requireAuth, requireRole({ roles: ['super_admin'] }), async (req: Request, res: Response) => {
  try {
    const edit: FileEdit = req.body;
    
    // Validate edit structure
    if (!edit.filePath || !edit.operation || !edit.reason) {
      return res.status(400).json({ error: 'Invalid edit structure: filePath, operation, and reason required' });
    }

    const result = await autonomousEditor.applyEdit(edit);
    
    res.json({ success: result.success, result });
  } catch (error) {
    logger.error({ error }, '[Autonomous API] Failed to apply edit');
    res.status(500).json({ error: 'Failed to apply edit' });
  }
});

/**
 * POST /api/autonomous/batch-edit
 * Apply multiple file edits in batch
 */
router.post('/batch-edit', requireAuth, requireRole({ roles: ['super_admin'] }), async (req: Request, res: Response) => {
  try {
    const { edits }: { edits: FileEdit[] } = req.body;
    
    if (!Array.isArray(edits) || edits.length === 0) {
      return res.status(400).json({ error: 'edits must be a non-empty array' });
    }

    const results = await autonomousEditor.applyEdits(edits);
    
    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    };

    res.json({ 
      success: summary.failed === 0, 
      summary,
      results 
    });
  } catch (error) {
    logger.error({ error }, '[Autonomous API] Failed to apply batch edits');
    res.status(500).json({ error: 'Failed to apply batch edits' });
  }
});

/**
 * GET /api/autonomous/queue
 * Get pending edits queue
 */
router.get('/queue', requireAuth, requireRole({ roles: ['super_admin'] }), (req: Request, res: Response) => {
  try {
    const pendingEdits = autonomousEditor.getPendingEdits();
    res.json({ success: true, pendingEdits, count: pendingEdits.length });
  } catch (error) {
    logger.error({ error }, '[Autonomous API] Failed to get queue');
    res.status(500).json({ error: 'Failed to get pending edits' });
  }
});

/**
 * DELETE /api/autonomous/queue
 * Clear pending edits queue
 */
router.delete('/queue', requireAuth, requireRole({ roles: ['super_admin'] }), (req: Request, res: Response) => {
  try {
    autonomousEditor.clearQueue();
    res.json({ success: true, message: 'Queue cleared' });
  } catch (error) {
    logger.error({ error }, '[Autonomous API] Failed to clear queue');
    res.status(500).json({ error: 'Failed to clear queue' });
  }
});

export default router;
