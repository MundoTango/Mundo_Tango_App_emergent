/**
 * Mundo Tango ESA LIFE CEO - Memory Routes  
 * Phase 11 Parallel: Updated with direct DB calls and error handling
 */

import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { posts, users, insertPostSchema } from '../../shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';
import { success, successWithPagination, parsePagination } from '../utils/apiResponse';
import { AuthenticationError, ValidationError, NotFoundError } from '../middleware/errorHandler';
import { z } from 'zod';

const router = Router();

// Get memories feed (Phase 11: Direct DB query with pagination)
router.get('/memories/feed', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.replitId, userId)).limit(1);
    
    if (!user[0] || !user[0].isActive) {
      throw new AuthenticationError('User not found or inactive');
    }
    
    const { page, pageSize, offset } = parsePagination(req.query);
    
    // Get user's memories (posts)
    const [memories, [{ count: totalCount }]] = await Promise.all([
      db.select()
        .from(posts)
        .where(eq(posts.userId, user[0].id))
        .orderBy(desc(posts.createdAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(eq(posts.userId, user[0].id))
    ]);
    
    res.json(successWithPagination(memories, page, pageSize, Number(totalCount)));
  } catch (error) {
    next(error);
  }
});

// Create memory (Phase 11: Direct DB insert with validation)
router.post('/memories', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.replitId, userId)).limit(1);
    
    if (!user[0] || !user[0].isActive) {
      throw new AuthenticationError('User not found or inactive');
    }
    
    const { content, postType, hashtags, visibility, mediaEmbeds } = req.body;
    
    if (!content || content.trim().length === 0) {
      throw new ValidationError('Memory content is required');
    }
    
    const newMemory = await db.insert(posts).values({
      userId: user[0].id,
      content: content.trim(),
      postType: postType || 'memory',
      hashtags: hashtags || [],
      visibility: visibility || 'public',
      mediaEmbeds: mediaEmbeds || []
    }).returning();
    
    res.json(success(newMemory[0], 'Memory created successfully'));
  } catch (error) {
    next(error);
  }
});

// Get memory stats (Phase 11: Direct DB aggregation)
router.get('/memories/stats', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.replitId, userId)).limit(1);
    
    if (!user[0] || !user[0].isActive) {
      throw new AuthenticationError('User not found or inactive');
    }
    
    const [stats] = await db.select({
      totalMemories: sql<number>`count(*)`,
      totalLikes: sql<number>`coalesce(sum(${posts.likes}), 0)`,
      totalComments: sql<number>`coalesce(sum(${posts.comments}), 0)`
    })
      .from(posts)
      .where(eq(posts.userId, user[0].id));
    
    res.json(success(stats, 'Memory stats fetched successfully'));
  } catch (error) {
    next(error);
  }
});

// Get memory suggestions (Phase 11: Recent memories as suggestions)
router.get('/memories/suggestions', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.replitId, userId)).limit(1);
    
    if (!user[0] || !user[0].isActive) {
      throw new AuthenticationError('User not found or inactive');
    }
    
    // Return recent public memories as suggestions
    const suggestions = await db.select()
      .from(posts)
      .where(eq(posts.visibility, 'public'))
      .orderBy(desc(posts.createdAt))
      .limit(10);
    
    res.json(success(suggestions, 'Memory suggestions fetched successfully'));
  } catch (error) {
    next(error);
  }
});

// Update schema: partial of insert schema for validation
const updatePostSchema = insertPostSchema.partial().omit({ userId: true });

// Update memory (Phase 11: Validated update with explicit field mapping)
router.patch('/memories/:memoryId', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.replitId, userId)).limit(1);
    const memoryId = parseInt(req.params.memoryId);
    
    if (!user[0] || !user[0].isActive) {
      throw new AuthenticationError('User not found or inactive');
    }
    
    if (isNaN(memoryId)) {
      throw new ValidationError('Invalid memory ID');
    }
    
    // Validate request body with Zod before processing
    const validationResult = updatePostSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError(`Invalid update data: ${validationResult.error.message}`);
    }
    
    const validatedData = validationResult.data;
    
    // Explicitly map only validated fields
    const allowedUpdates: any = {
      updatedAt: new Date()
    };
    
    if (validatedData.content !== undefined) allowedUpdates.content = validatedData.content;
    if (validatedData.postType !== undefined) allowedUpdates.postType = validatedData.postType;
    if (validatedData.hashtags !== undefined) allowedUpdates.hashtags = validatedData.hashtags;
    if (validatedData.visibility !== undefined) allowedUpdates.visibility = validatedData.visibility;
    if (validatedData.mediaEmbeds !== undefined) allowedUpdates.mediaEmbeds = validatedData.mediaEmbeds;
    if (validatedData.location !== undefined) allowedUpdates.location = validatedData.location;
    
    const updated = await db.update(posts)
      .set(allowedUpdates)
      .where(and(
        eq(posts.id, memoryId),
        eq(posts.userId, user[0].id)
      ))
      .returning();
    
    if (updated.length === 0) {
      throw new NotFoundError('Memory not found or you do not have permission to update it');
    }
    
    res.json(success(updated[0], 'Memory updated successfully'));
  } catch (error) {
    next(error);
  }
});

// Delete memory (Phase 11: Direct DB delete with validation)
router.delete('/memories/:memoryId', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.replitId, userId)).limit(1);
    const memoryId = parseInt(req.params.memoryId);
    
    if (!user[0] || !user[0].isActive) {
      throw new AuthenticationError('User not found or inactive');
    }
    
    if (isNaN(memoryId)) {
      throw new ValidationError('Invalid memory ID');
    }
    
    const deleted = await db.delete(posts)
      .where(and(
        eq(posts.id, memoryId),
        eq(posts.userId, user[0].id)
      ))
      .returning();
    
    if (deleted.length === 0) {
      throw new NotFoundError('Memory not found or you do not have permission to delete it');
    }
    
    res.json(success({ id: memoryId }, 'Memory deleted successfully'));
  } catch (error) {
    next(error);
  }
});

export default router;
