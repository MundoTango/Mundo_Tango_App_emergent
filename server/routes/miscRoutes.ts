import { Router } from 'express';
import { storage } from '../storage';
import { setUserContext } from '../middleware/tenantMiddleware';
import { getUserId } from '../utils/authHelper';
import { z } from 'zod';

const router = Router();

// Get roles for community
router.get('/roles/community', setUserContext, async (req: any, res) => {
  try {
    const roles = await storage.getCommunityRoles();
    res.json({ success: true, data: roles });
  } catch (error: any) {
    console.error('Error fetching community roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Onboarding (redirects to team onboard)
router.post('/onboarding', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Forward to team onboard endpoint
    const result = await storage.onboardUser(Number(userId), req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error onboarding user:', error);
    res.status(500).json({ error: 'Failed to onboard user' });
  }
});

// Send friend request
router.post('/friend/send-friend-request', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { targetUserId } = req.body;
    const request = await storage.sendFriendRequest(Number(userId), targetUserId);
    res.json({ success: true, data: request });
  } catch (error: any) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

// Create enhanced post
router.post('/posts/enhanced', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const post = await storage.createEnhancedPost(Number(userId), req.body);
    res.json({ success: true, data: post });
  } catch (error: any) {
    console.error('Error creating enhanced post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Create group
router.post('/groups/create', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const group = await storage.createGroup(Number(userId), req.body);
    res.json({ success: true, data: group });
  } catch (error: any) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Accept code of conduct
router.post('/code-of-conduct/accept', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    await storage.acceptCodeOfConduct(Number(userId));
    res.json({ success: true, message: 'Code of conduct accepted' });
  } catch (error: any) {
    console.error('Error accepting code of conduct:', error);
    res.status(500).json({ error: 'Failed to accept code of conduct' });
  }
});

// Get Notion filters
router.get('/notion/filters', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const filters = await storage.getNotionFilters(Number(userId));
    res.json({ success: true, data: filters });
  } catch (error: any) {
    console.error('Error fetching Notion filters:', error);
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
});

export default router;
