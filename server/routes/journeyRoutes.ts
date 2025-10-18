/**
 * Phase 0 Task 0.5: Journey Orchestration API Routes
 * 
 * Endpoints for customer journey state (J1-J4)
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { detectUserJourney, calculateUserMetrics, getJourneyAgentInfo, getJourneyMilestones, type JourneyState } from '../services/journeyOrchestrationService';
import type { User } from '@db/schema';

const router = Router();

/**
 * GET /api/journey - Get current user's journey state
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = req.user as User | undefined;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Calculate user metrics (TODO: Replace with actual DB queries)
    const metrics = await calculateUserMetrics(user.id);
    
    // Detect journey state
    const journeyState = detectUserJourney(user, metrics);
    
    // Get agent info
    const agentInfo = getJourneyAgentInfo(journeyState);
    
    // Get milestones
    const milestones = getJourneyMilestones(journeyState, metrics);
    
    return res.json({
      journey: journeyState,
      agent: agentInfo,
      milestones,
      metrics,
    });
  } catch (error) {
    console.error('[Journey API] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/journey/:state/info - Get info about a specific journey state
 */
router.get('/:state/info', (req: Request, res: Response) => {
  try {
    const { state } = req.params;
    
    if (!['J1', 'J2', 'J3', 'J4'].includes(state)) {
      return res.status(400).json({ error: 'Invalid journey state' });
    }
    
    const agentInfo = getJourneyAgentInfo(state as JourneyState);
    
    return res.json(agentInfo);
  } catch (error) {
    console.error('[Journey API] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
