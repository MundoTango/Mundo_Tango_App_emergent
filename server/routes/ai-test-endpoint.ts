/**
 * MB.MD TRACK A: Diagnostic Test Endpoint
 * Simplified test endpoint to isolate Mr Blue issues
 */

import express from 'express';
import { optionalAuth } from '../middleware/secureAuth';

const router = express.Router();

router.post('/test-simple', optionalAuth, async (req, res) => {
  try {
    console.log('🔵 [TRACK A TEST] Test endpoint hit');
    console.log('🔵 [TRACK A TEST] Body:', JSON.stringify(req.body, null, 2));
    console.log('🔵 [TRACK A TEST] User:', req.user?.id);
    
    res.json({
      success: true,
      message: 'Test endpoint working',
      receivedBody: req.body,
      user: req.user?.id
    });
  } catch (error) {
    console.error('🔴 [TRACK A TEST] Error:', error);
    res.status(500).json({ error: 'Test failed' });
  }
});

export default router;
