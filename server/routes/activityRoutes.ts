import { Router } from 'express';
import { storage } from '../storage';
import { setUserContext } from '../middleware/tenantMiddleware';
import { getUserId } from '../utils/authHelper';
import { z } from 'zod';

const router = Router();

const activitySchema = z.object({
  type: z.string(),
  description: z.string(),
  duration: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

// Create daily activity
router.post('/daily-activities', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const validatedData = activitySchema.parse(req.body);
    const activity = await storage.createDailyActivity(Number(userId), validatedData);
    res.json({ success: true, data: activity });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Get daily activities
router.get('/daily-activities', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const activities = await storage.getDailyActivities(Number(userId));
    res.json({ success: true, data: activities });
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

export default router;
