/**
 * MB.MD TRACK 15: Life CEO Routes
 */

import { Router } from 'express';
import { storage } from '../storage';
import { setUserContext } from '../middleware/tenantMiddleware';
import { getUserId } from '../utils/authHelper';

const router = Router();

router.get('/life-ceo/conversations', setUserContext, async (req: any, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
  const conversations = await storage.getLifeCEOConversations(Number(userId));
  res.json({ success: true, data: conversations });
});

router.post('/life-ceo/conversations', setUserContext, async (req: any, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
  const conversation = await storage.createLifeCEOConversation(Number(userId), req.body);
  res.json({ success: true, data: conversation });
});

router.get('/life-ceo/projects', setUserContext, async (req: any, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
  const projects = await storage.getLifeCEOProjects(Number(userId));
  res.json({ success: true, data: projects });
});

router.post('/life-ceo/projects', setUserContext, async (req: any, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
  const project = await storage.createLifeCEOProject(Number(userId), req.body);
  res.json({ success: true, data: project });
});

export default router;
