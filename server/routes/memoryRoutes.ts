import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';
import { setUserContext } from '../middleware/tenantMiddleware';
import { validateTags, handleValidationErrors } from '../middleware/tagValidation';
import { RealTimeNotificationService } from '../services/realTimeNotifications';

const router = Router();

// Get memories feed
// [A2A] Agent #2: Using existing getUserMemoriesWithFilters until getMemoriesFeed is implemented
router.get('/memories/feed', isAuthenticated, async (req: any, res: any) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {};
    
    // [A2A] Agent #2 → Agent #5: Using existing storage method for now
    const memories = await storage.getUserMemoriesWithFilters(user.id, {
      page,
      limit,
      ...filters
    });
    
    res.json(memories);
  } catch (error) {
    console.error('Error fetching memories feed:', error);
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// Create memory
// [A2A] Agent #5: Tag validation → Agent #4: Socket.IO broadcast
router.post('/memories', isAuthenticated, validateTags, handleValidationErrors, async (req: any, res: any) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const { content, type, tags, privacy, mediaUrls } = req.body;
    
    // [A2A] Agent #5: Validated tags are safe to use
    const memory = await storage.createMemory({
      userId: user.id,
      content,
      type,
      tags,
      privacy,
      mediaUrls
    });
    
    // [A2A] Agent #4 → Agent #2: Broadcast to all connected clients
    await RealTimeNotificationService.broadcastNewMemory(memory);
    console.log(`[A2A] Agent #4: memory:new broadcasted for memory #${memory.id}`);
    
    res.json(memory);
  } catch (error) {
    console.error('Error creating memory:', error);
    res.status(500).json({ error: 'Failed to create memory' });
  }
});

// Get memory stats
// [A2A] Agent #2: Stub for now - will implement when needed
router.get('/memories/stats', isAuthenticated, async (req: any, res: any) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // [A2A] Agent #2: Return basic stats structure for frontend compatibility
    const stats = {
      totalMemories: 0,
      memoriesByType: {},
      recentActivity: []
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching memory stats:', error);
    res.status(500).json({ error: 'Failed to fetch memory stats' });
  }
});

// Get memory suggestions
// [A2A] Agent #2: Stub for now - AI-powered suggestions coming later
router.get('/memories/suggestions', isAuthenticated, async (req: any, res: any) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // [A2A] Agent #2: Return empty array for now - frontend handles gracefully
    const suggestions: any[] = [];
    
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching memory suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Update memory
// [A2A] Agent #2: Using existing editMemory method - Agent #5 validated
router.patch('/:memoryId', isAuthenticated, async (req: any, res: any) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    const memoryId = req.params.memoryId; // Keep as string for editMemory
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // [A2A] Agent #2 → Agent #5: Using editMemory (existing method)
    const memory = await storage.editMemory(memoryId, user.id, req.body.content || '');
    
    res.json(memory);
  } catch (error) {
    console.error('Error updating memory:', error);
    res.status(500).json({ error: 'Failed to update memory' });
  }
});

// Delete memory  
// [A2A] Agent #2: Fixed type - deleteMemory expects string not number
router.delete('/:memoryId', isAuthenticated, async (req: any, res: any) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    const memoryId = req.params.memoryId; // Keep as string (Agent #14 caught this!)
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // [A2A] Agent #2: Using existing deleteMemory with correct string type
    await storage.deleteMemory(memoryId, user.id);
    
    res.json({ success: true, message: 'Memory deleted successfully' });
  } catch (error) {
    console.error('Error deleting memory:', error);
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

export default router;