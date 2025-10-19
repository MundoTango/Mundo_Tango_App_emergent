import { Router } from 'express';
import { success } from '../utils/apiResponse';

const router = Router();

// Customer journey tracking routes
router.get('/api/journey/state', async (req, res, next) => {
  try {
    res.json(success({
      state: 'J1', // New user journey state
      lastUpdate: new Date()
    }));
  } catch (error) {
    next(error);
  }
});

router.post('/api/journey/transition', async (req, res, next) => {
  try {
    const { newState } = req.body;
    res.json(success({
      success: true,
      state: newState,
      transitionedAt: new Date()
    }));
  } catch (error) {
    next(error);
  }
});

export default router;
