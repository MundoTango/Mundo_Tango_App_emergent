/**
 * TRACK 3: PAGE STATE ROUTES
 * PageStateMonitor integration for omniscient platform tracking
 */

import { Router } from 'express';
import { requireAdmin, optionalAuth } from '../middleware/secureAuth';
import { pageStateMonitor } from '../services/PageStateMonitor';

export const pageStateRouter = Router();

/**
 * POST /api/page-states/track
 * Track page state (called from frontend)
 */
pageStateRouter.post('/track', optionalAuth, async (req, res) => {
  try {
    const { url, components, apiCalls, errors } = req.body;
    const userId = req.user?.id;

    pageStateMonitor.recordPageState(url, {
      components: components || [],
      apiCalls: apiCalls || [],
      errors: errors || [],
      userId
    });

    res.json({ tracked: true, url });

  } catch (error) {
    console.error('❌ [Page State Track] Error:', error);
    res.status(500).json({
      error: 'Tracking failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/page-states/dashboard
 * Get page state analytics for admin dashboard
 */
pageStateRouter.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const analytics = {
      totalPages: 0,
      totalComponents: 0,
      totalErrors: 0
      // TODO: Implement getPageAnalytics method
    };

    res.json({
      analytics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Page State Dashboard] Error:', error);
    res.status(500).json({
      error: 'Dashboard retrieval failed'
    });
  }
});

/**
 * GET /api/page-states/errors
 * Get aggregated console errors
 */
pageStateRouter.get('/errors', requireAdmin, async (req, res) => {
  try {
    const errors: any[] = [];
    // TODO: Implement getConsoleErrors method

    res.json({
      errors,
      count: errors.length
    });

  } catch (error) {
    console.error('❌ [Page State Errors] Error:', error);
    res.status(500).json({
      error: 'Error retrieval failed'
    });
  }
});

export default pageStateRouter;
