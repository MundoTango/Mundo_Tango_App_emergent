/**
 * Visual Editor Confirmation Routes
 * MB.MD Option A - Recursive Testing System
 * 
 * Endpoints for Visual Editor learning confirmation flow
 */

import express, { Request, Response } from 'express';
import { visualEditorLoop, type VisualEditChange } from '../services/visualEditorLoop';
import { requireAuth } from '../middleware/auth';
import { isSuperAdmin } from '../utils/accessControl';
import type { AuthenticatedUser } from '../middleware/auth';

const router = express.Router();

/**
 * POST /api/visual-editor/confirm
 * Confirm visual edits and trigger component learning
 */
router.post('/confirm', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Only super admins can use Visual Editor
    if (!isSuperAdmin(req.user!)) {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    const { changes } = req.body as { changes: VisualEditChange[] };

    if (!changes || !Array.isArray(changes)) {
      return res.status(400).json({ error: 'Changes array required' });
    }

    console.log(`[Visual Editor API] Processing ${changes.length} changes from admin ${userId}`);

    // Trigger autonomous learning loop
    const result = await visualEditorLoop.handleVisualEdit(changes, userId);

    res.json({
      success: result.success,
      message: `Great! ${result.learnedCount}/${changes.length} components learned from your changes.`,
      learnedCount: result.learnedCount,
      totalChanges: changes.length,
      errors: result.errors,
    });

  } catch (error) {
    console.error('[Visual Editor API] Error:', error);
    res.status(500).json({ error: 'Failed to process visual edits' });
  }
});

/**
 * GET /api/visual-editor/learning-status/:componentId
 * Get learning status for a component
 */
router.get('/learning-status/:componentId', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isSuperAdmin(req.user!)) {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    const { componentId } = req.params;
    const history = await visualEditorLoop.getComponentHistory(componentId);

    res.json({
      componentId,
      totalChanges: history.length,
      history: history.slice(0, 10), // Last 10 changes
    });

  } catch (error) {
    console.error('[Visual Editor API] Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch component history' });
  }
});

/**
 * GET /api/visual-editor/stats
 * Get overall learning statistics
 */
router.get('/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isSuperAdmin(req.user!)) {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    const stats = await visualEditorLoop.getLearningStats();

    res.json(stats);

  } catch (error) {
    console.error('[Visual Editor API] Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch learning stats' });
  }
});

export default router;
