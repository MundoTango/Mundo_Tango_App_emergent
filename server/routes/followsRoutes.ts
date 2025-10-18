/**
 * Mundo Tango ESA LIFE CEO - Follows API Routes
 * Phase 11 Parallel: Updated with standardized error handling
 */

import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { follows, users } from '../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getUserId } from '../utils/authHelper';
import { success, successWithPagination, parsePagination } from '../utils/apiResponse';
import { AuthenticationError, ValidationError, ConflictError } from '../middleware/errorHandler';

const router = Router();

// Get user's followers (Phase 11: Updated with pagination and error handling)
router.get('/api/follows/followers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      throw new AuthenticationError();
    }
    
    const { page, pageSize, offset } = parsePagination(req.query);
    
    const [followersList, [{ count }]] = await Promise.all([
      db.select({
        id: follows.id,
        followerId: follows.followerId,
        followingId: follows.followingId,
        createdAt: follows.createdAt,
        user: users
      })
        .from(follows)
        .leftJoin(users, eq(follows.followerId, users.id))
        .where(eq(follows.followingId, userId))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(follows)
        .where(eq(follows.followingId, userId))
    ]);
    
    res.json(successWithPagination(followersList, page, pageSize, Number(count)));
  } catch (error) {
    next(error);
  }
});

// Get who user is following (Phase 11: Updated with pagination and error handling)
router.get('/api/follows/following', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      throw new AuthenticationError();
    }
    
    const { page, pageSize, offset } = parsePagination(req.query);
    
    const [followingList, [{ count }]] = await Promise.all([
      db.select({
        id: follows.id,
        followerId: follows.followerId,
        followingId: follows.followingId,
        createdAt: follows.createdAt,
        user: users
      })
        .from(follows)
        .leftJoin(users, eq(follows.followingId, users.id))
        .where(eq(follows.followerId, userId))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(follows)
        .where(eq(follows.followerId, userId))
    ]);
    
    res.json(successWithPagination(followingList, page, pageSize, Number(count)));
  } catch (error) {
    next(error);
  }
});

// Get all follows (Phase 11: Updated with error handling)
router.get('/api/follows', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      throw new AuthenticationError();
    }
    
    const [followersList, followingList] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(follows)
        .where(eq(follows.followingId, userId)),
      db.select({ count: sql<number>`count(*)` })
        .from(follows)
        .where(eq(follows.followerId, userId))
    ]);
    
    res.json(success({
      followersCount: Number(followersList[0]?.count || 0),
      followingCount: Number(followingList[0]?.count || 0)
    }, 'Follow counts fetched successfully'));
  } catch (error) {
    next(error);
  }
});

// Follow a user (Phase 11: Updated with validation and error handling)
router.post('/api/follows/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const followerId = getUserId(req);
    const followingId = parseInt(req.params.userId);
    
    if (!followerId) {
      throw new AuthenticationError();
    }
    
    if (isNaN(followingId)) {
      throw new ValidationError('Invalid user ID');
    }
    
    if (followerId === followingId) {
      throw new ValidationError('You cannot follow yourself');
    }
    
    // Check if already following
    const existing = await db.select()
      .from(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      ))
      .limit(1);
    
    if (existing.length > 0) {
      throw new ConflictError('You are already following this user');
    }
    
    const newFollow = await db
      .insert(follows)
      .values({
        followerId,
        followingId
      })
      .returning();
    
    res.json(success(newFollow[0], 'Successfully followed user'));
  } catch (error) {
    next(error);
  }
});

// Unfollow a user (Phase 11: Updated with validation and error handling)
router.delete('/api/follows/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const followerId = getUserId(req);
    const followingId = parseInt(req.params.userId);
    
    if (!followerId) {
      throw new AuthenticationError();
    }
    
    if (isNaN(followingId)) {
      throw new ValidationError('Invalid user ID');
    }
    
    const result = await db
      .delete(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      ))
      .returning();
    
    if (result.length === 0) {
      throw new ValidationError('You are not following this user');
    }
    
    res.json(success({ id: followingId }, 'Successfully unfollowed user'));
  } catch (error) {
    next(error);
  }
});

export default router;
