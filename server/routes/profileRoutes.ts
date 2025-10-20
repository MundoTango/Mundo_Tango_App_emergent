/**
 * Mundo Tango - Profile Routes
 * MB.MD TRACK B (S3): Profiles API - Week 3
 * 
 * Endpoints:
 * - GET /api/profile - Get current user profile
 * - GET /api/profiles/:userId - Get user profile by ID
 * - PATCH /api/profile - Update current user profile
 * - POST /api/profile/privacy - Update privacy settings
 * - POST /api/profile/:userId/follow - Follow/unfollow user
 * - GET /api/profile/:userId/followers - Get followers list
 * - GET /api/profile/:userId/following - Get following list
 */

import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users, follows } from '../../shared/schema';
import { eq, desc, and, sql, or } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';
import { success, successWithPagination, parsePagination } from '../utils/apiResponse';
import { AuthenticationError, ValidationError, NotFoundError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/profile
 * Get current authenticated user's profile
 */
router.get('/profile', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const [user] = await db.select()
      .from(users)
      .where(eq(users.replitId, userId))
      .limit(1);
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    
    // Remove sensitive fields
    const { password, apiToken, deviceToken, ...profile } = user;
    
    res.json(success(profile, 'Profile fetched successfully'));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/profiles/:userId
 * Get public profile by user ID
 */
router.get('/profiles/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      throw new ValidationError('Invalid user ID');
    }
    
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Return only public fields
    const publicProfile = {
      id: user.id,
      name: user.name,
      username: user.username,
      profileImage: user.profileImage,
      backgroundImage: user.backgroundImage,
      bio: user.bio,
      city: user.city,
      country: user.country,
      tangoRoles: user.tangoRoles,
      leaderLevel: user.leaderLevel,
      followerLevel: user.followerLevel,
      yearsOfDancing: user.yearsOfDancing,
      createdAt: user.createdAt,
    };
    
    res.json(success(publicProfile, 'Profile fetched successfully'));
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/profile
 * Update current user's profile
 */
router.patch('/profile', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const replitId = req.user.claims.sub;
    const [user] = await db.select()
      .from(users)
      .where(eq(users.replitId, replitId))
      .limit(1);
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    
    // Allowed fields for update
    const allowedUpdates: any = {
      updatedAt: new Date()
    };
    
    const {
      name, bio, profileImage, backgroundImage,
      city, country, state, languages,
      tangoRoles, leaderLevel, followerLevel,
      yearsOfDancing, occupation, facebookUrl
    } = req.body;
    
    if (name !== undefined) allowedUpdates.name = name;
    if (bio !== undefined) allowedUpdates.bio = bio;
    if (profileImage !== undefined) allowedUpdates.profileImage = profileImage;
    if (backgroundImage !== undefined) allowedUpdates.backgroundImage = backgroundImage;
    if (city !== undefined) allowedUpdates.city = city;
    if (country !== undefined) allowedUpdates.country = country;
    if (state !== undefined) allowedUpdates.state = state;
    if (languages !== undefined) allowedUpdates.languages = languages;
    if (tangoRoles !== undefined) allowedUpdates.tangoRoles = tangoRoles;
    if (leaderLevel !== undefined) allowedUpdates.leaderLevel = leaderLevel;
    if (followerLevel !== undefined) allowedUpdates.followerLevel = followerLevel;
    if (yearsOfDancing !== undefined) allowedUpdates.yearsOfDancing = yearsOfDancing;
    if (occupation !== undefined) allowedUpdates.occupation = occupation;
    if (facebookUrl !== undefined) allowedUpdates.facebookUrl = facebookUrl;
    
    const [updated] = await db.update(users)
      .set(allowedUpdates)
      .where(eq(users.id, user.id))
      .returning();
    
    const { password, apiToken, deviceToken, ...profile } = updated;
    
    res.json(success(profile, 'Profile updated successfully'));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/profile/:userId/follow
 * Follow or unfollow a user
 */
router.post('/profile/:userId/follow', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const replitId = req.user.claims.sub;
    const [currentUser] = await db.select()
      .from(users)
      .where(eq(users.replitId, replitId))
      .limit(1);
    
    if (!currentUser) {
      throw new AuthenticationError('User not found');
    }
    
    const targetUserId = parseInt(req.params.userId);
    
    if (isNaN(targetUserId)) {
      throw new ValidationError('Invalid user ID');
    }
    
    if (currentUser.id === targetUserId) {
      throw new ValidationError('Cannot follow yourself');
    }
    
    // Check if target user exists
    const [targetUser] = await db.select()
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);
    
    if (!targetUser) {
      throw new NotFoundError('User to follow not found');
    }
    
    // Check if already following
    const [existing] = await db.select()
      .from(follows)
      .where(and(
        eq(follows.followerId, currentUser.id),
        eq(follows.followingId, targetUserId)
      ))
      .limit(1);
    
    let action = '';
    if (existing) {
      // Unfollow
      await db.delete(follows)
        .where(eq(follows.id, existing.id));
      action = 'unfollowed';
    } else {
      // Follow
      await db.insert(follows)
        .values({
          followerId: currentUser.id,
          followingId: targetUserId,
        });
      action = 'followed';
    }
    
    res.json(success({ action, userId: targetUserId }, `User ${action} successfully`));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/profile/:userId/followers
 * Get list of users who follow this user
 */
router.get('/profile/:userId/followers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.userId);
    const { page, pageSize, offset } = parsePagination(req.query);
    
    if (isNaN(userId)) {
      throw new ValidationError('Invalid user ID');
    }
    
    // Get followers with user details
    const [followers, [{ count: totalCount }]] = await Promise.all([
      db.select({
        id: follows.id,
        followedAt: follows.createdAt,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
        }
      })
        .from(follows)
        .innerJoin(users, eq(follows.followerId, users.id))
        .where(eq(follows.followingId, userId))
        .orderBy(desc(follows.createdAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(follows)
        .where(eq(follows.followingId, userId))
    ]);
    
    res.json(successWithPagination(followers, page, pageSize, Number(totalCount)));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/profile/:userId/following
 * Get list of users this user follows
 */
router.get('/profile/:userId/following', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.userId);
    const { page, pageSize, offset } = parsePagination(req.query);
    
    if (isNaN(userId)) {
      throw new ValidationError('Invalid user ID');
    }
    
    // Get following with user details
    const [following, [{ count: totalCount }]] = await Promise.all([
      db.select({
        id: follows.id,
        followedAt: follows.createdAt,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
        }
      })
        .from(follows)
        .innerJoin(users, eq(follows.followingId, users.id))
        .where(eq(follows.followerId, userId))
        .orderBy(desc(follows.createdAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(follows)
        .where(eq(follows.followerId, userId))
    ]);
    
    res.json(successWithPagination(following, page, pageSize, Number(totalCount)));
  } catch (error) {
    next(error);
  }
});

export default router;
