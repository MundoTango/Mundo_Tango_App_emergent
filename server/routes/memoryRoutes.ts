/**
 * Mundo Tango ESA LIFE CEO - Memory Routes
 * Phase 11 Parallel: Updated with standardized error handling
 */

import { Router, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';
import { setUserContext } from '../middleware/tenantMiddleware';
import { success, successWithPagination, parsePagination } from '../utils/apiResponse';
import { AuthenticationError, ValidationError, NotFoundError } from '../middleware/errorHandler';

const router = Router();

// Get memories feed (Phase 11: Updated with pagination and error handling)
router.get('/memories/feed', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    
    const { page, pageSize } = parsePagination(req.query);
    const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {};
    
    const memories = await storage.getMemoriesFeed(user.id, {
      page,
      limit: pageSize,
      filters
    });
    
    res.json(success(memories, 'Memories feed fetched successfully'));
  } catch (error) {
    next(error);
  }
});

// Create memory (Phase 11: Updated with validation and error handling)
router.post('/memories', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    
    const { content, type, tags, privacy, mediaUrls } = req.body;
    
    if (!content || content.trim().length === 0) {
      throw new ValidationError('Memory content is required');
    }
    
    const memory = await storage.createMemory({
      userId: user.id,
      content,
      type,
      tags,
      privacy,
      mediaUrls
    });
    
    res.json(success(memory, 'Memory created successfully'));
  } catch (error) {
    next(error);
  }
});

// Get memory stats (Phase 11: Updated with error handling)
router.get('/memories/stats', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    
    const stats = await storage.getMemoryStats(user.id);
    
    res.json(success(stats, 'Memory stats fetched successfully'));
  } catch (error) {
    next(error);
  }
});

// Get memory suggestions (Phase 11: Updated with error handling)
router.get('/memories/suggestions', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    
    const suggestions = await storage.getMemorySuggestions(user.id);
    
    res.json(success(suggestions, 'Memory suggestions fetched successfully'));
  } catch (error) {
    next(error);
  }
});

// Update memory (Phase 11: Updated with validation and error handling)
router.patch('/memories/:memoryId', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    const memoryId = parseInt(req.params.memoryId);
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    
    if (isNaN(memoryId)) {
      throw new ValidationError('Invalid memory ID');
    }
    
    const memory = await storage.updateMemory(memoryId, user.id, req.body);
    
    if (!memory) {
      throw new NotFoundError('Memory not found or you do not have permission to update it');
    }
    
    res.json(success(memory, 'Memory updated successfully'));
  } catch (error) {
    next(error);
  }
});

// Delete memory (Phase 11: Updated with error handling)
router.delete('/memories/:memoryId', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    const memoryId = parseInt(req.params.memoryId);
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    
    if (isNaN(memoryId)) {
      throw new ValidationError('Invalid memory ID');
    }
    
    await storage.deleteMemory(memoryId, user.id);
    
    res.json(success({ id: memoryId }, 'Memory deleted successfully'));
  } catch (error) {
    next(error);
  }
});

export default router;
