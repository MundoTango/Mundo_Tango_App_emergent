// ESA LIFE CEO 61x21 - Toolbar API Routes
// Layer 2: API Structure Agent - Implementing missing toolbar functionality

import { Router } from 'express';
import { db } from '../db';
import { users, notifications, chatMessages, chatRooms, chatRoomUsers, posts, events, groups, favorites } from '../../shared/schema';
import { eq, and, ilike, or, desc, sql, count } from 'drizzle-orm';
import { setUserContext } from '../middleware/tenantMiddleware';
import { z } from 'zod';

const router = Router();

// ESA Layer 16: Notification System Agent
// GET /api/notifications/count - Get unread notification count for user
router.get('/api/notifications/count', setUserContext, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.json({ count: 0 });
    }

    // Get count of unread notifications
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );

    const notificationCount = result[0]?.count || 0;

    res.json({ 
      success: true,
      count: Number(notificationCount)
    });
  } catch (error: any) {
    console.error('Error fetching notification count:', error);
    res.json({ count: 0 });
  }
});

// ESA Layer 25: Messaging System Agent  
// GET /api/messages/unread-count - Get unread message count for user
router.get('/api/messages/unread-count', setUserContext, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.json({ count: 0 });
    }

    // Get user's slug for chat room queries
    const userResult = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userResult.length) {
      return res.json({ count: 0 });
    }

    const userSlug = userResult[0].username;

    // Get total unread messages across all chat rooms for this user
    const result = await db
      .select({ 
        totalUnread: sql<number>`SUM(${chatRoomUsers.unreadMessageCount})` 
      })
      .from(chatRoomUsers)
      .where(eq(chatRoomUsers.userSlug, userSlug));

    const messageCount = result[0]?.totalUnread || 0;

    res.json({ 
      success: true,
      count: Number(messageCount)
    });
  } catch (error: any) {
    console.error('Error fetching message count:', error);
    res.json({ count: 0 });
  }
});

// ESA Layer 15: Search & Discovery Agent
// GET /api/user/global-search - Global search across platform
router.get('/api/user/global-search', setUserContext, async (req: any, res) => {
  try {
    const query = req.query.q?.toString() || '';
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    
    if (!query || query.length < 2) {
      return res.json({ 
        success: true,
        data: {
          users: [],
          posts: [],
          events: [],
          groups: []
        }
      });
    }

    const searchPattern = `%${query}%`;

    // Search users
    const usersResult = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage,
        bio: users.bio
      })
      .from(users)
      .where(
        or(
          ilike(users.name, searchPattern),
          ilike(users.username, searchPattern),
          ilike(users.bio, searchPattern)
        )
      )
      .limit(limit);

    // Search posts
    const postsResult = await db
      .select({
        id: posts.id,
        content: posts.content,
        userId: posts.userId,
        createdAt: posts.createdAt
      })
      .from(posts)
      .where(ilike(posts.content, searchPattern))
      .orderBy(desc(posts.createdAt))
      .limit(limit);

    // Search events
    const eventsResult = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        startDate: events.startDate,
        location: events.location
      })
      .from(events)
      .where(
        or(
          ilike(events.title, searchPattern),
          ilike(events.description, searchPattern),
          ilike(events.location, searchPattern)
        )
      )
      .orderBy(desc(events.startDate))
      .limit(limit);

    // Search groups
    const groupsResult = await db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        type: groups.type,
        memberCount: groups.memberCount
      })
      .from(groups)
      .where(
        or(
          ilike(groups.name, searchPattern),
          ilike(groups.description, searchPattern)
        )
      )
      .orderBy(desc(groups.memberCount))
      .limit(limit);

    res.json({
      success: true,
      data: {
        users: usersResult,
        posts: postsResult,
        events: eventsResult,
        groups: groupsResult
      }
    });
  } catch (error: any) {
    console.error('Error in global search:', error);
    res.status(500).json({ 
      success: false,
      message: 'Search failed',
      data: {
        users: [],
        posts: [],
        events: [],
        groups: []
      }
    });
  }
});

// ESA Layer 16: Notification System Agent
// GET /api/notifications - Get user's notifications with pagination
router.get('/api/notifications', setUserContext, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required'
      });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const unreadOnly = req.query.unread === 'true';

    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .$dynamic();

    if (unreadOnly) {
      query = query.where(eq(notifications.isRead, false));
    }

    const result = await query
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/api/notifications/:id/read', setUserContext, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const notificationId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required'
      });
    }

    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      )
      .returning();

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: updated
    });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put('/api/notifications/mark-all-read', setUserContext, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required'
      });
    }

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/api/notifications/:id', setUserContext, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const notificationId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required'
      });
    }

    const [deleted] = await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      )
      .returning();

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

// ESA Layer 21: User Management Agent - Favorites System
// GET /api/favorites - Get user's favorites
router.get('/api/favorites', setUserContext, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required'
      });
    }

    const itemType = req.query.type?.toString();
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    let query = db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .$dynamic();

    if (itemType) {
      query = query.where(eq(favorites.itemType, itemType));
    }

    const result = await query
      .orderBy(desc(favorites.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch favorites'
    });
  }
});

// POST /api/favorites - Add item to favorites
const addFavoriteSchema = z.object({
  itemType: z.enum(['post', 'event', 'user', 'group', 'memory']),
  itemId: z.number().int().positive(),
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional()
});

router.post('/api/favorites', setUserContext, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required'
      });
    }

    const validation = addFavoriteSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors
      });
    }

    const { itemType, itemId, title, description, imageUrl, metadata } = validation.data;

    // Check if already favorited
    const existing = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.itemType, itemType),
          eq(favorites.itemId, itemId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Item already in favorites'
      });
    }

    // Add to favorites
    const [newFavorite] = await db
      .insert(favorites)
      .values({
        userId,
        itemType,
        itemId,
        title,
        description,
        imageUrl,
        metadata: metadata || {}
      })
      .returning();

    res.json({
      success: true,
      data: newFavorite
    });
  } catch (error: any) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add favorite'
    });
  }
});

// DELETE /api/favorites/:itemId - Remove from favorites
router.delete('/api/favorites/:itemId', setUserContext, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const itemId = parseInt(req.params.itemId);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required'
      });
    }

    if (!itemId || isNaN(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID'
      });
    }

    const itemType = req.query.type?.toString();
    
    if (!itemType) {
      return res.status(400).json({
        success: false,
        message: 'Item type is required'
      });
    }

    // Remove from favorites
    const result = await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.itemType, itemType),
          eq(favorites.itemId, itemId)
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    res.json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error: any) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to remove favorite'
    });
  }
});

// POST /api/favorites/bulk - Add or remove multiple favorites
router.post('/api/favorites/bulk', setUserContext, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required'
      });
    }

    const { action, items } = req.body;
    
    if (!action || !['add', 'remove'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "add" or "remove"'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }

    if (action === 'remove') {
      // Remove multiple favorites
      for (const item of items) {
        await db
          .delete(favorites)
          .where(
            and(
              eq(favorites.userId, userId),
              eq(favorites.itemType, item.itemType),
              eq(favorites.itemId, item.itemId)
            )
          );
      }
    } else {
      // Add multiple favorites
      const newFavorites = items.map(item => ({
        userId,
        itemType: item.itemType,
        itemId: item.itemId,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        metadata: item.metadata || {}
      }));

      // Insert only non-existing favorites
      for (const fav of newFavorites) {
        const existing = await db
          .select()
          .from(favorites)
          .where(
            and(
              eq(favorites.userId, userId),
              eq(favorites.itemType, fav.itemType),
              eq(favorites.itemId, fav.itemId)
            )
          )
          .limit(1);

        if (existing.length === 0) {
          await db.insert(favorites).values(fav);
        }
      }
    }

    res.json({
      success: true,
      message: `Successfully ${action === 'add' ? 'added' : 'removed'} favorites`
    });
  } catch (error: any) {
    console.error('Error in bulk favorites operation:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update favorites'
    });
  }
});

export default router;