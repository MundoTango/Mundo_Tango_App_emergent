/**
 * Journey Testing Routes
 * MB.MD Option A - Recursive Testing System
 * 
 * Endpoints for recursive journey testing (J1-J5 agents test all pages)
 */

import express, { Request, Response } from 'express';
import { autoFixOrchestrator } from '../services/autoFixOrchestrator';
import { requireAuth } from '../middleware/auth';
import { isSuperAdmin } from '../utils/accessControl';
import type { AuthenticatedUser } from '../middleware/auth';

const router = express.Router();

/**
 * POST /api/journey/:id/test
 * Trigger recursive testing for a journey
 */
router.post('/:id/test', requireAuth, async (req: Request, res: Response) => {
  try {
    // Only admins can trigger manual tests
    if (!isSuperAdmin(req.user!)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const journeyId = req.params.id; // 'J1', 'J2', etc.

    console.log(`[Journey Test API] Starting recursive test for ${journeyId}`);

    // Coordinate with AutoFix Orchestrator to test journey
    const result = await autoFixOrchestrator.coordinateJourneyTest(journeyId);

    res.json({
      journeyId,
      status: result.overallStatus,
      steps: result.steps,
      summary: {
        total: result.steps.length,
        passed: result.steps.filter(s => s.status === 'passed').length,
        failed: result.steps.filter(s => s.status === 'failed').length,
      },
    });

  } catch (error) {
    console.error('[Journey Test API] Error:', error);
    res.status(500).json({ error: 'Failed to run journey test' });
  }
});

/**
 * GET /api/journey/:id/results
 * Get latest test results for a journey
 */
router.get('/:id/results', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isSuperAdmin(req.user!)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const journeyId = req.params.id;

    // In production, query database for latest test results
    // For now, return mock data
    res.json({
      journeyId,
      lastRun: new Date().toISOString(),
      status: 'partial',
      steps: [
        { step: 1, name: 'Welcome', status: 'passed' },
        { step: 2, name: 'Platform Tour', status: 'passed' },
        { step: 3, name: 'Set Preferences', status: 'failed', errors: ['Profile API not connected'] },
      ],
    });

  } catch (error) {
    console.error('[Journey Test API] Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch test results' });
  }
});

/**
 * POST /api/journey/test-all
 * Trigger recursive testing for ALL journeys (J1-J5)
 */
router.post('/test-all', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isSuperAdmin(req.user!)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    console.log('[Journey Test API] Starting recursive test for ALL journeys');

    const journeys = ['J1', 'J2', 'J3', 'J4', 'J5'];
    const results = [];

    for (const journeyId of journeys) {
      const result = await autoFixOrchestrator.coordinateJourneyTest(journeyId);
      results.push({
        journeyId,
        status: result.overallStatus,
        passedSteps: result.steps.filter(s => s.status === 'passed').length,
        totalSteps: result.steps.length,
      });
    }

    const overallStatus = results.every(r => r.status === 'passed') ? 'passed' :
                          results.every(r => r.status === 'failed') ? 'failed' : 'partial';

    res.json({
      status: overallStatus,
      journeys: results,
      summary: {
        total: results.length,
        passed: results.filter(r => r.status === 'passed').length,
        failed: results.filter(r => r.status === 'failed').length,
        partial: results.filter(r => r.status === 'partial').length,
      },
    });

  } catch (error) {
    console.error('[Journey Test API] Error:', error);
    res.status(500).json({ error: 'Failed to run all journey tests' });
  }
});

export default router;
