import { Router } from 'express';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/current', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'User not found', 404);
    }

    const customerJourneyState = req.user?.customerJourneyState || 'J1';
    
    return sendSuccess(res, {
      state: customerJourneyState,
      userId,
      lastUpdate: req.user?.lastJourneyUpdate || new Date(),
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
});

router.post('/update', requireAuth, async (req, res) => {
  try {
    const { state } = req.body;
    if (!state || !['J1', 'J2', 'J3', 'J4'].includes(state)) {
      return sendError(res, 'Invalid journey state', 400);
    }

    return sendSuccess(res, {
      state,
      updated: true,
      timestamp: new Date(),
    }, 'Journey state updated successfully');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
});

export default router;
