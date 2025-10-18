/**
 * Mundo Tango ESA LIFE CEO - Comments API Routes
 * Phase 11 Parallel: Updated with standardized error handling
 */

import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { postComments, users } from '../../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { getUserId } from '../utils/authHelper';
import { success, successWithPagination, parsePagination } from '../utils/apiResponse';
import { AuthenticationError, ValidationError, NotFoundError, ForbiddenError } from '../middleware/errorHandler';

const router = Router();

// Get comments for a post (Phase 11: Updated with pagination and error handling)
router.get('/api/posts/:postId/comments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = parseInt(req.params.postId);
    
    if (isNaN(postId)) {
      throw new ValidationError('Invalid post ID');
    }
    
    const { page, pageSize, offset } = parsePagination(req.query);
    
    const [commentsList, [{ count }]] = await Promise.all([
      db.select({
        comment: postComments,
        user: users
      })
        .from(postComments)
        .leftJoin(users, eq(postComments.userId, users.id))
        .where(eq(postComments.postId, postId))
        .orderBy(desc(postComments.createdAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(postComments)
        .where(eq(postComments.postId, postId))
    ]);
    
    res.json(successWithPagination(commentsList, page, pageSize, Number(count)));
  } catch (error) {
    next(error);
  }
});

// Get all comments (Phase 11: Updated with pagination and error handling)
router.get('/api/comments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { postId } = req.query;
    const { page, pageSize, offset } = parsePagination(req.query);
    
    let whereCondition = undefined;
    if (postId) {
      const postIdNum = parseInt(postId as string);
      if (isNaN(postIdNum)) {
        throw new ValidationError('Invalid post ID');
      }
      whereCondition = eq(postComments.postId, postIdNum);
    }
    
    const [commentsList, [{ count }]] = await Promise.all([
      db.select({
        comment: postComments,
        user: users
      })
        .from(postComments)
        .leftJoin(users, eq(postComments.userId, users.id))
        .where(whereCondition)
        .orderBy(desc(postComments.createdAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(postComments)
        .where(whereCondition)
    ]);
    
    res.json(successWithPagination(commentsList, page, pageSize, Number(count)));
  } catch (error) {
    next(error);
  }
});

// Create a comment (Phase 11: Updated with validation and error handling)
router.post('/api/posts/:postId/comments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const postId = parseInt(req.params.postId);
    const { content, parentId, mentions, gifUrl, imageUrl } = req.body;
    
    if (!userId) {
      throw new AuthenticationError();
    }
    
    if (isNaN(postId)) {
      throw new ValidationError('Invalid post ID');
    }
    
    if (!content || content.trim().length === 0) {
      throw new ValidationError('Comment content is required');
    }
    
    if (content.length > 1000) {
      throw new ValidationError('Comment content must be less than 1000 characters');
    }
    
    const newComment = await db
      .insert(postComments)
      .values({
        postId,
        userId,
        content: content.trim(),
        parentId,
        mentions: mentions || [],
        gifUrl,
        imageUrl
      })
      .returning();
    
    res.json(success(newComment[0], 'Comment created successfully'));
  } catch (error) {
    next(error);
  }
});

// Update a comment (Phase 11: Updated with validation and error handling)
router.put('/api/comments/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const commentId = parseInt(req.params.id);
    const { content } = req.body;
    
    if (!userId) {
      throw new AuthenticationError();
    }
    
    if (isNaN(commentId)) {
      throw new ValidationError('Invalid comment ID');
    }
    
    if (!content || content.trim().length === 0) {
      throw new ValidationError('Comment content is required');
    }
    
    if (content.length > 1000) {
      throw new ValidationError('Comment content must be less than 1000 characters');
    }
    
    const updated = await db
      .update(postComments)
      .set({ 
        content: content.trim(),
        isEdited: true,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(postComments.id, commentId),
          eq(postComments.userId, userId)
        )
      )
      .returning();
    
    if (updated.length === 0) {
      throw new NotFoundError('Comment not found or you do not have permission to edit it');
    }
    
    res.json(success(updated[0], 'Comment updated successfully'));
  } catch (error) {
    next(error);
  }
});

// Delete a comment (Phase 11: Updated with error handling)
router.delete('/api/comments/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const commentId = parseInt(req.params.id);
    
    if (!userId) {
      throw new AuthenticationError();
    }
    
    if (isNaN(commentId)) {
      throw new ValidationError('Invalid comment ID');
    }
    
    const deleted = await db
      .delete(postComments)
      .where(
        and(
          eq(postComments.id, commentId),
          eq(postComments.userId, userId)
        )
      )
      .returning();
    
    if (deleted.length === 0) {
      throw new NotFoundError('Comment not found or you do not have permission to delete it');
    }
    
    res.json(success({ id: commentId }, 'Comment deleted successfully'));
  } catch (error) {
    next(error);
  }
});

export default router;
