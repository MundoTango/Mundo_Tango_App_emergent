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

// MB.MD TRACK 14: Additional missing misc routes
router.get('/chat/messages', setUserContext, async (req: any, res) => {
  const roomId = parseInt(req.query.roomId as string);
  const messages = await storage.getChatMessages(roomId);
  res.json({ success: true, data: messages });
});

router.get('/chat/security-test-room/message', setUserContext, async (req: any, res) => {
  const message = await storage.getChatSecurityTestMessage();
  res.json({ success: true, data: message });
});

router.get('/error-reports', setUserContext, async (req: any, res) => {
  const reports = await storage.getErrorReports();
  res.json({ success: true, data: reports });
});

router.get('/esa/chat', setUserContext, async (req: any, res) => {
  const chat = await storage.getESAChat();
  res.json({ success: true, data: chat });
});

router.get('/event/:eventId/feedback', setUserContext, async (req: any, res) => {
  const eventId = parseInt(req.params.eventId);
  const feedback = await storage.getEventFeedback(eventId);
  res.json({ success: true, data: feedback });
});

router.get('/events/sidebar', setUserContext, async (req: any, res) => {
  const events = await storage.getSidebarEvents();
  res.json({ success: true, data: events });
});

router.get('/evolution/metrics/latest', setUserContext, async (req: any, res) => {
  const metrics = await storage.getEvolutionMetricsLatest();
  res.json({ success: true, data: metrics });
});

router.post('/search', setUserContext, async (req: any, res) => {
  const { query } = req.body;
  const results = await storage.searchContent(query);
  res.json({ success: true, data: results });
});

router.get('/search', setUserContext, async (req: any, res) => {
  const query = req.query.q as string;
  const results = await storage.searchContent(query || '');
  res.json({ success: true, data: results });
});

router.get('/friend/send-friend-request', setUserContext, async (req: any, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
  const targetUserId = parseInt(req.query.targetUserId as string);
  const request = await storage.sendFriendRequest(Number(userId), targetUserId);
  res.json({ success: true, data: request });
});

router.get('/groups/create', setUserContext, async (req: any, res) => {
  res.json({ success: true, message: 'Use POST to create group' });
});

router.post('/posts/enhance-content', setUserContext, async (req: any, res) => {
  const { content } = req.body;
  const enhanced = await storage.enhancePostContent(content);
  res.json({ success: true, data: enhanced });
});

router.get('/posts/enhance-content', setUserContext, async (req: any, res) => {
  const content = req.query.content as string;
  const enhanced = await storage.enhancePostContent(content || '');
  res.json({ success: true, data: enhanced });
});

router.get('/posts/direct', setUserContext, async (req: any, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
  const posts = await storage.getDirectPosts(Number(userId));
  res.json({ success: true, data: posts });
});

router.post('/posts/direct', setUserContext, async (req: any, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
  const post = await storage.createPost(Number(userId), req.body);
  res.json({ success: true, data: post });
});

// MB.MD TRACK 16: Notification and event endpoints
router.get('/notifications/mark-all-read', setUserContext, async (req: any, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
  await storage.markAllNotificationsRead(Number(userId));
  res.json({ success: true, message: 'All notifications marked as read' });
});

router.put('/notifications/mark-all-read', setUserContext, async (req: any, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
  await storage.markAllNotificationsRead(Number(userId));
  res.json({ success: true, message: 'All notifications marked as read' });
});

router.get('/events/invite-participant', setUserContext, async (req: any, res) => {
  res.json({ success: true, message: 'Use POST to invite participant' });
});

router.post('/events/invite-participant', setUserContext, async (req: any, res) => {
  const { eventId, userId } = req.body;
  const result = await storage.inviteEventParticipant(eventId, userId);
  res.json({ success: true, data: result });
});

router.get('/host-homes', setUserContext, async (req: any, res) => {
  const homes = await storage.getHostHomes(req.query);
  res.json({ success: true, data: homes });
});

router.post('/host-homes', setUserContext, async (req: any, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
  const home = await storage.uploadHostHomePhotos(req.body);
  res.json({ success: true, data: home });
});

router.post('/upload/host-home-photos', setUserContext, async (req: any, res) => {
  const result = await storage.uploadHostHomePhotos(req.body);
  res.json({ success: true, data: result });
});

router.get('/home/pricing', setUserContext, async (req: any, res) => {
  const pricing = await storage.getHomePricing();
  res.json({ success: true, data: pricing });
});

router.post('/user/settings', setUserContext, async (req: any, res) => {
  res.json({ success: true, message: 'Use GET for settings (PUT to update)' });
});

router.post('/user/profile', setUserContext, async (req: any, res) => {
  res.json({ success: true, message: 'Use PUT to update profile' });
});

router.get('/upload/chunk', setUserContext, async (req: any, res) => {
  res.json({ success: true, message: 'Use POST to upload chunks' });
});

router.get('/upload', setUserContext, async (req: any, res) => {
  res.json({ success: true, message: 'Use POST to upload files' });
});

export default router;
