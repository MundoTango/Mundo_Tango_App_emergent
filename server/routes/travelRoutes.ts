import { Router } from 'express';
import { storage } from '../storage';
import { setUserContext } from '../middleware/tenantMiddleware';
import { getUserId } from '../utils/authHelper';
import { z } from 'zod';

const router = Router();

const travelPlanSchema = z.object({
  destination: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string().optional(),
  budget: z.number().optional(),
});

// Create travel plan
router.post('/travel-plans', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const validatedData = travelPlanSchema.parse(req.body);
    const plan = await storage.createTravelPlan(Number(userId), validatedData);
    res.json({ success: true, data: plan });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating travel plan:', error);
    res.status(500).json({ error: 'Failed to create travel plan' });
  }
});

// Get travel plans
router.get('/travel-plans', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const plans = await storage.getUserTravelPlans(Number(userId));
    res.json({ success: true, data: plans });
  } catch (error: any) {
    console.error('Error fetching travel plans:', error);
    res.status(500).json({ error: 'Failed to fetch travel plans' });
  }
});

// Get specific travel plan
router.get('/travel-plans/:id', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const planId = parseInt(req.params.id);
    const plan = await storage.getTravelPlan(planId, Number(userId));
    res.json({ success: true, data: plan });
  } catch (error: any) {
    console.error('Error fetching travel plan:', error);
    res.status(500).json({ error: 'Failed to fetch travel plan' });
  }
});

// Update travel plan
router.put('/travel-plans/:id', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const planId = parseInt(req.params.id);
    const validatedData = travelPlanSchema.partial().parse(req.body);
    const plan = await storage.updateTravelPlan(planId, Number(userId), validatedData);
    res.json({ success: true, data: plan });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating travel plan:', error);
    res.status(500).json({ error: 'Failed to update travel plan' });
  }
});

export default router;
