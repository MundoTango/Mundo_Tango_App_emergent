import { Router } from 'express';
import { db } from '../db';
import { sql, eq } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';
import { userJourneyProgress, userAchievements, userFeatureUnlocks } from '../../shared/schema';

const router = Router();

/**
 * GET /api/journeys/progress
 * Get user's journey progress across all journeys (J1-J5)
 */
router.get('/progress', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    
    const progress = await db
      .select()
      .from(userJourneyProgress)
      .where(eq(userJourneyProgress.userId, userId));
    
    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Failed to fetch journey progress:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch progress'
    });
  }
});

/**
 * POST /api/journeys/:journeyId/start
 * Start a new journey (J1-J5)
 */
router.post('/:journeyId/start', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { journeyId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    
    // Validate journeyId
    if (!['J1', 'J2', 'J3', 'J4', 'J5'].includes(journeyId)) {
      return res.status(400).json({ success: false, error: 'Invalid journey ID' });
    }
    
    // Get total steps for journey (placeholder - would come from journey config)
    const journeySteps: Record<string, number> = {
      J1: 5, // Welcome Guide
      J2: 7, // Profile Setup
      J3: 4, // Community Connection
      J4: 6, // First Event
      J5: 8, // Advanced Features
    };
    const totalSteps = journeySteps[journeyId] || 5;
    
    // Create journey progress record
    await db.execute(sql`
      INSERT INTO user_journey_progress (user_id, journey_id, total_steps, current_step, completed_steps, skipped_steps, metadata)
      VALUES (${userId}, ${journeyId}, ${totalSteps}, 1, '[]'::jsonb, '[]'::jsonb, '{}'::jsonb)
      ON CONFLICT (user_id, journey_id) DO UPDATE SET
        current_step = 1,
        started_at = NOW(),
        completed_at = NULL
    `);
    
    res.json({
      success: true,
      message: `Journey ${journeyId} started`,
      totalSteps
    });
  } catch (error) {
    console.error('Failed to start journey:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start journey'
    });
  }
});

/**
 * POST /api/journeys/:journeyId/step/:stepNumber
 * Complete a step in a journey
 */
router.post('/:journeyId/step/:stepNumber', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { journeyId, stepNumber } = req.params;
    const { skipped } = req.body;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    
    const step = parseInt(stepNumber);
    
    await db.execute(sql`
      UPDATE user_journey_progress
      SET 
        current_step = ${step + 1},
        completed_steps = CASE 
          WHEN ${skipped} THEN completed_steps 
          ELSE jsonb_insert(completed_steps, '{999999}', ${step}::text::jsonb)
        END,
        skipped_steps = CASE 
          WHEN ${skipped} THEN jsonb_insert(skipped_steps, '{999999}', ${step}::text::jsonb)
          ELSE skipped_steps
        END,
        updated_at = NOW()
      WHERE user_id = ${userId} AND journey_id = ${journeyId}
    `);
    
    res.json({
      success: true,
      message: `Step ${step} ${skipped ? 'skipped' : 'completed'}`
    });
  } catch (error) {
    console.error('Failed to update journey step:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update step'
    });
  }
});

/**
 * POST /api/journeys/:journeyId/complete
 * Complete entire journey
 */
router.post('/:journeyId/complete', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { journeyId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    
    await db.execute(sql`
      UPDATE user_journey_progress
      SET 
        completed_at = NOW(),
        updated_at = NOW()
      WHERE user_id = ${userId} AND journey_id = ${journeyId}
    `);
    
    // Award achievement
    const achievementId = `journey-${journeyId.toLowerCase()}-complete`;
    await db.execute(sql`
      INSERT INTO user_achievements (user_id, achievement_id, journey_id)
      VALUES (${userId}, ${achievementId}, ${journeyId})
      ON CONFLICT DO NOTHING
    `);
    
    res.json({
      success: true,
      message: `Journey ${journeyId} completed!`,
      achievementUnlocked: achievementId
    });
  } catch (error) {
    console.error('Failed to complete journey:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete journey'
    });
  }
});

/**
 * GET /api/journeys/achievements
 * Get user's achievements
 */
router.get('/achievements', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    
    const achievements = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));
    
    res.json({
      success: true,
      achievements
    });
  } catch (error) {
    console.error('Failed to fetch achievements:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch achievements'
    });
  }
});

/**
 * GET /api/journeys/features/unlocked
 * Get user's unlocked features
 */
router.get('/features/unlocked', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    
    const features = await db
      .select()
      .from(userFeatureUnlocks)
      .where(eq(userFeatureUnlocks.userId, userId));
    
    res.json({
      success: true,
      features
    });
  } catch (error) {
    console.error('Failed to fetch unlocked features:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch features'
    });
  }
});

export default router;
