/**
 * MODEL MONITORING API ROUTES (Stream G - Oct 22, 2025)
 * Endpoints for checking and auto-updating AI models
 */

import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { autoUpdateDeprecatedModels, checkDeprecatedModels } from '../services/modelAutoUpdater';

const router = Router();

/**
 * GET /api/models/check
 * Check all models for deprecation status
 */
router.get('/check', isAuthenticated, async (req, res) => {
  try {
    const statuses = await checkDeprecatedModels();
    
    const deprecated = statuses.filter(s => s.status === 'deprecated');
    
    res.json({
      success: true,
      totalModels: statuses.length,
      deprecatedCount: deprecated.length,
      models: statuses,
      needsUpdate: deprecated.length > 0
    });
  } catch (error: any) {
    console.error('[Model Monitor] Check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check models',
      details: error.message
    });
  }
});

/**
 * POST /api/models/auto-update
 * Automatically update deprecated model references in codebase
 * Requires super admin
 */
router.post('/auto-update', isAuthenticated, async (req, res) => {
  try {
    // Security: Only authenticated users can trigger auto-update
    if (!req.user) {
      return res.status(403).json({
        success: false,
        error: 'Authentication required'
      });
    }

    console.log('[Model Monitor] Starting auto-update triggered by user ID:', req.user.id);
    
    const result = await autoUpdateDeprecatedModels();
    
    res.json({
      success: true,
      message: `Updated ${result.filesUpdated} files`,
      ...result
    });
  } catch (error: any) {
    console.error('[Model Monitor] Auto-update error:', error);
    res.status(500).json({
      success: false,
      error: 'Auto-update failed',
      details: error.message
    });
  }
});

export default router;
