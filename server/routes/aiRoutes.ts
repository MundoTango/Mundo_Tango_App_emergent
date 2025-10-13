/**
 * MB.MD TRACK 13: AI System Routes
 */

import { Router } from 'express';
import { storage } from '../storage';
import { setUserContext } from '../middleware/tenantMiddleware';
import { getUserId } from '../utils/authHelper';

const router = Router();

router.get('/ai/agents', setUserContext, async (req: any, res) => {
  const agents = await storage.getAIAgents();
  res.json({ success: true, data: agents });
});

router.post('/ai/chat', setUserContext, async (req: any, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
  const result = await storage.postAIChat(req.body);
  res.json({ success: true, data: result });
});

router.get('/ai/metrics', setUserContext, async (req: any, res) => {
  const metrics = await storage.getAIMetrics();
  res.json({ success: true, data: metrics });
});

router.get('/ai/mrblue/chat', setUserContext, async (req: any, res) => {
  const chat = await storage.getMrBlueChat();
  res.json({ success: true, data: chat });
});

router.get('/ai/process', setUserContext, async (req: any, res) => {
  const process = await storage.getAIProcess();
  res.json({ success: true, data: process });
});

router.get('/ai/recommendations', setUserContext, async (req: any, res) => {
  const recommendations = await storage.getAIRecommendations();
  res.json({ success: true, data: recommendations });
});

router.post('/ai-intelligence/conversation', setUserContext, async (req: any, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
  const result = await storage.postAIIntelligenceConversation(req.body);
  res.json({ success: true, data: result });
});

export default router;
