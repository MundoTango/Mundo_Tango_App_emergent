/**
 * Journey Agent API Routes
 * MB.MD Phase 4: Deployment - Oct 19, 2025
 * 
 * RESTful API endpoints for Journey Agents J1-J5
 * All endpoints require authentication
 */

import { Router } from 'express';
import { z } from 'zod';
import * as journeyService from '../services/journeyService';

const router = Router();

// Note: Auth middleware will be added when registering this router in routes.ts

// ============ JOURNEY PROGRESS ============

/**
 * START JOURNEY
 * POST /api/journeys/start
 * Body: { journeyId: string }
 */
router.post('/start', async (req, res, next) => {
  try {
    const schema = z.object({
      journeyId: z.enum(['J1', 'J2', 'J3', 'J4', 'J5'])
    });

    const { journeyId } = schema.parse(req.body);
    const userId = req.user!.id;

    const progress = await journeyService.startJourney(userId, journeyId);

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET JOURNEY PROGRESS
 * GET /api/journeys/progress
 * Query: ?journeyId=J1 (optional, returns current active journey if omitted)
 */
router.get('/progress', async (req, res, next) => {
  try {
    // SECURITY: Use authenticated user ID only
    const userId = req.user!.id;
    const journeyId = req.query.journeyId as string | undefined;

    // Validate journeyId if provided
    if (journeyId) {
      z.enum(['J1', 'J2', 'J3', 'J4', 'J5']).parse(journeyId);
    }

    const progress = await journeyService.getJourneyProgress(userId, journeyId as any);

    if (!progress) {
      return res.json({
        success: true,
        data: null,
        message: 'No active journey found'
      });
    }

    // Calculate percentage
    const percentage = Array.isArray(progress.completedSteps)
      ? Math.round((progress.completedSteps.length / progress.totalSteps) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        ...progress,
        percentage
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * COMPLETE STEP
 * PUT /api/journeys/complete/:step
 * Body: { metadata?: Record<string, unknown> }
 */
router.put('/complete/:step', async (req, res, next) => {
  try {
    // SECURITY: Use authenticated user ID only
    const userId = req.user!.id;
    
    // Validate step parameter
    const stepSchema = z.number().int().positive();
    const step = stepSchema.parse(parseInt(req.params.step));
    
    // Validate metadata
    const bodySchema = z.object({
      metadata: z.record(z.unknown()).optional()
    });
    const { metadata = {} } = bodySchema.parse(req.body);

    const progress = await journeyService.completeStep(userId, step, metadata);

    // Check if journey complete
    if (progress.completedAt) {
      // Trigger completion celebration
      await journeyService.triggerJourneyComplete(userId, progress.journeyId as any);
    }

    const nextStep = step + 1 <= progress.totalSteps ? step + 1 : null;

    res.json({
      success: true,
      data: progress,
      nextStep,
      isComplete: !!progress.completedAt
    });
  } catch (error) {
    next(error);
  }
});

/**
 * SKIP STEP
 * PUT /api/journeys/skip/:step
 */
router.put('/skip/:step', async (req, res, next) => {
  try {
    // SECURITY: Use authenticated user ID only
    const userId = req.user!.id;
    
    // Validate step parameter
    const stepSchema = z.number().int().positive();
    const step = stepSchema.parse(parseInt(req.params.step));

    const progress = await journeyService.skipStep(userId, step);

    res.json({
      success: true,
      data: progress,
      nextStep: step + 1
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET NEXT SUGGESTED ACTION
 * GET /api/journeys/next
 */
router.get('/next', async (req, res, next) => {
  try {
    // SECURITY: Use authenticated user ID only
    const userId = req.user!.id;

    const suggestion = await journeyService.getNextAction(userId);

    res.json({
      success: true,
      data: suggestion
    });
  } catch (error) {
    next(error);
  }
});

// ============ ACHIEVEMENTS ============

/**
 * GET USER ACHIEVEMENTS
 * GET /api/journeys/achievements
 */
router.get('/achievements', async (req, res, next) => {
  try {
    // SECURITY: Use authenticated user ID only
    const userId = req.user!.id;

    const achievements = await journeyService.getUserAchievements(userId);

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    next(error);
  }
});

/**
 * AWARD ACHIEVEMENT
 * POST /api/journeys/achievements
 * Body: { achievementId: string, journeyId?: string }
 */
router.post('/achievements', async (req, res, next) => {
  try {
    // SECURITY: Use authenticated user ID only
    const userId = req.user!.id;
    
    const schema = z.object({
      achievementId: z.string(),
      journeyId: z.enum(['J1', 'J2', 'J3', 'J4', 'J5']).optional()
    });

    const { achievementId, journeyId } = schema.parse(req.body);

    const achievement = await journeyService.awardAchievement(userId, achievementId, journeyId);

    res.json({
      success: true,
      data: achievement
    });
  } catch (error) {
    next(error);
  }
});

// ============ FEATURE UNLOCKS ============

/**
 * CHECK FEATURE ACCESS
 * GET /api/journeys/features/:featureId
 */
router.get('/features/:featureId', async (req, res, next) => {
  try {
    // SECURITY: Use authenticated user ID only
    const userId = req.user!.id;
    const featureId = z.string().parse(req.params.featureId);

    const hasAccess = await journeyService.hasFeatureAccess(userId, featureId);

    res.json({
      success: true,
      hasAccess
    });
  } catch (error) {
    next(error);
  }
});

/**
 * UNLOCK FEATURE
 * POST /api/journeys/features/:featureId/unlock
 */
router.post('/features/:featureId/unlock', async (req, res, next) => {
  try {
    // SECURITY: Use authenticated user ID only
    const userId = req.user!.id;
    const featureId = z.string().parse(req.params.featureId);

    const unlock = await journeyService.unlockFeature(userId, featureId);

    res.json({
      success: true,
      data: unlock
    });
  } catch (error) {
    next(error);
  }
});

// ============ ANALYTICS (ADMIN ONLY) ============

/**
 * GET JOURNEY ANALYTICS
 * GET /api/journeys/analytics
 * Query: ?journeyId=J1&period=7d
 */
router.get('/analytics', async (req, res, next) => {
  try {
    // SECURITY: Check proper admin role flag (not string matching)
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Admin access required' 
      });
    }

    const journeyId = req.query.journeyId as string | undefined;
    const period = (req.query.period as string) || '7d';

    // Validate journeyId if provided
    if (journeyId) {
      z.enum(['J1', 'J2', 'J3', 'J4', 'J5']).parse(journeyId);
    }

    const analytics = await journeyService.getJourneyAnalytics(journeyId as any, period);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
});

export default router;
