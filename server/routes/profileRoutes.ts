import { Router } from 'express';
import { storage } from '../storage';
import { setUserContext } from '../middleware/tenantMiddleware';
import { getUserId } from '../utils/authHelper';

const router = Router();

// Get guest profiles
router.get('/guest-profiles', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const guestProfiles = await storage.getGuestProfiles();
    res.json({ success: true, data: guestProfiles });
  } catch (error: any) {
    console.error('Error fetching guest profiles:', error);
    res.status(500).json({ error: 'Failed to fetch guest profiles' });
  }
});

// Get user resume
router.get('/resume', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const resume = await storage.getUserResume(Number(userId));
    res.json({ success: true, data: resume });
  } catch (error: any) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

export default router;
