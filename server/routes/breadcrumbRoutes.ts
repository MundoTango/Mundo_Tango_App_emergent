/**
 * Breadcrumb Tracking Routes
 * MB.MD Option A - Recursive Testing System
 * 
 * Endpoints for tracking user interactions (clicks, hovers, navigation)
 */

import express, { Request, Response } from 'express';
import { breadcrumbTracker, type BreadcrumbEvent } from '../services/breadcrumbTracker';
import { optionalAuth } from '../middleware/auth';

const router = express.Router();

/**
 * POST /api/breadcrumbs/track
 * Track a user interaction
 */
router.post('/track', optionalAuth, async (req: Request, res: Response) => {
  try {
    const event: BreadcrumbEvent = {
      userId: req.user?.id,
      sessionId: req.body.sessionId || req.sessionID,
      actionType: req.body.actionType,
      targetElement: req.body.targetElement,
      targetUrl: req.body.targetUrl,
      currentPage: req.body.currentPage,
      elementText: req.body.elementText,
      metadata: req.body.metadata,
    };

    await breadcrumbTracker.track(event);

    res.json({ success: true });

  } catch (error) {
    console.error('[Breadcrumb API] Error:', error);
    // Don't fail requests just because tracking failed
    res.json({ success: false, error: 'Tracking failed' });
  }
});

/**
 * GET /api/breadcrumbs/history/:userId
 * Get breadcrumb history for a user
 */
router.get('/history/:userId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const targetUserId = parseInt(req.params.userId);

    // Users can only see their own history (unless admin)
    if (req.user?.id !== targetUserId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const history = await breadcrumbTracker.getUserHistory(targetUserId);

    res.json({ history });

  } catch (error) {
    console.error('[Breadcrumb API] Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/**
 * GET /api/breadcrumbs/patterns/:page
 * Get usage patterns for a page
 */
router.get('/patterns/:page', optionalAuth, async (req: Request, res: Response) => {
  try {
    const page = decodeURIComponent(req.params.page);
    const patterns = await breadcrumbTracker.getPagePatterns(page);

    res.json(patterns);

  } catch (error) {
    console.error('[Breadcrumb API] Error fetching patterns:', error);
    res.status(500).json({ error: 'Failed to fetch patterns' });
  }
});

// Ping endpoint for testing route registration
router.get('/ping', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Breadcrumb routes registered successfully' });
});

export default router;
