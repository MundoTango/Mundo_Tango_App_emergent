import { Router } from 'express';
import { storage } from '../storage';
import { setUserContext } from '../middleware/tenantMiddleware';
import { getUserId } from '../utils/authHelper';

const router = Router();

// Get all chat rooms for user
router.get('/chat/rooms', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const rooms = await storage.getChatRooms(Number(userId));
    res.json({ success: true, data: rooms });
  } catch (error: any) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ error: 'Failed to fetch chat rooms' });
  }
});

// Create new chat room
router.post('/chat/rooms', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { participantIds, name } = req.body;
    const room = await storage.createChatRoom(Number(userId), participantIds, name);
    res.json({ success: true, data: room });
  } catch (error: any) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ error: 'Failed to create chat room' });
  }
});

// Get specific chat room
router.get('/chat/rooms/:id', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const roomId = parseInt(req.params.id);
    const room = await storage.getChatRoom(roomId, Number(userId));
    res.json({ success: true, data: room });
  } catch (error: any) {
    console.error('Error fetching chat room:', error);
    res.status(500).json({ error: 'Failed to fetch chat room' });
  }
});

// Send message to room
router.post('/chat/rooms/:id/messages', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const roomId = parseInt(req.params.id);
    const { content } = req.body;
    const message = await storage.sendChatMessage(roomId, Number(userId), content);
    res.json({ success: true, data: message });
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
