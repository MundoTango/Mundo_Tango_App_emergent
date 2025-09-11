/**
 * ESA LIFE CEO 61×21 - User Stats & Posts API Routes
 * High-performance endpoints with caching
 */

import { Router } from 'express';
import { storage } from '../storage';
import { setUserContext } from '../middleware/tenantMiddleware';
import { getUserId } from '../utils/authHelper';
import { apiCache, cacheKeys, CACHE_TTL, cacheMiddleware } from '../utils/cache';

const router = Router();

// Get user stats with caching
router.get('/user/stats', 
  setUserContext,
  cacheMiddleware(
    (req: any) => cacheKeys.userStats(getUserId(req) || 'anonymous'),
    CACHE_TTL.USER_STATS
  ),
  async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Fetch stats from database
      const [postsCount, followersCount, followingCount, eventsCount] = await Promise.all([
        storage.getUserPostsCount(Number(userId)),
        storage.getFollowersCount(Number(userId)),
        storage.getFollowingCount(Number(userId)),
        storage.getUserEventsCount(Number(userId))
      ]);

      const stats = {
        posts: postsCount || 0,
        followers: followersCount || 0,
        following: followingCount || 0,
        events: eventsCount || 0,
        memories: postsCount || 0, // Memories are posts
        connections: followersCount || 0
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ 
        error: 'Failed to fetch stats',
        message: error.message
      });
    }
  }
);

// Get user posts with caching
router.get('/user/posts',
  setUserContext,
  cacheMiddleware(
    (req: any) => cacheKeys.userPosts(getUserId(req) || 'anonymous'),
    CACHE_TTL.USER_POSTS
  ),
  async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Fetch posts from database with pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const posts = await storage.getUserPosts(Number(userId), limit, offset);

      res.json({
        success: true,
        data: posts || [],
        page,
        limit
      });
    } catch (error: any) {
      console.error('Error fetching user posts:', error);
      res.status(500).json({ 
        error: 'Failed to fetch posts',
        message: error.message
      });
    }
  }
);

// Get posts for a specific user (public endpoint with privacy check)
router.get('/user/:userId/posts',
  setUserContext,
  cacheMiddleware(
    (req: any) => cacheKeys.userPosts(req.params.userId),
    CACHE_TTL.USER_POSTS
  ),
  async (req: any, res) => {
    try {
      const requesterId = getUserId(req);
      const targetUserId = parseInt(req.params.userId);

      // Check if user exists
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check privacy settings
      const userSettings = await storage.getUserSettings(targetUserId);
      const privacySettings = userSettings?.privacy || {};
      
      // If profile is private and not following, return empty
      if (privacySettings.profileVisibility === 'private' && requesterId !== targetUserId) {
        const areFriends = requesterId ? await storage.isFollowing(Number(requesterId), targetUserId) : false;
        if (!areFriends) {
          return res.json({
            success: true,
            data: [],
            message: "This profile is private"
          });
        }
      }

      // Fetch posts
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const posts = await storage.getUserPosts(targetUserId, limit, offset);

      res.json({
        success: true,
        data: posts || [],
        page,
        limit
      });
    } catch (error: any) {
      console.error('Error fetching user posts:', error);
      res.status(500).json({ 
        error: 'Failed to fetch posts',
        message: error.message
      });
    }
  }
);

// Invalidate caches when posts are created/updated
router.post('/posts/invalidate-cache', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Invalidate related caches
    apiCache.delete(cacheKeys.userPosts(userId));
    apiCache.delete(cacheKeys.userStats(userId));

    res.json({ success: true, message: "Cache invalidated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to invalidate cache" });
  }
});

export default router;