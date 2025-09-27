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

// ESA Layer 53: Internationalization Agent - Language Management APIs
// GET /api/languages/supported - Get all supported languages
router.get('/api/languages/supported', async (req, res) => {
  try {
    // Return the full list of 73 supported languages from i18n config
    const supportedLanguages = [
      { code: 'en', name: 'English', nativeName: 'English', country: 'US', isActive: true },
      { code: 'es', name: 'Spanish', nativeName: 'Español', country: 'ES', isActive: true },
      { code: 'es-ar', name: 'Spanish (Argentina)', nativeName: 'Español (Argentina)', country: 'AR', isActive: true, isLunfardo: true },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português', country: 'PT', isActive: true },
      { code: 'pt-br', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', country: 'BR', isActive: true },
      { code: 'fr', name: 'French', nativeName: 'Français', country: 'FR', isActive: true },
      { code: 'de', name: 'German', nativeName: 'Deutsch', country: 'DE', isActive: true },
      { code: 'it', name: 'Italian', nativeName: 'Italiano', country: 'IT', isActive: true },
      { code: 'ru', name: 'Russian', nativeName: 'Русский', country: 'RU', isActive: true },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', country: 'JP', isActive: true },
      { code: 'ko', name: 'Korean', nativeName: '한국어', country: 'KR', isActive: true },
      { code: 'zh', name: 'Chinese', nativeName: '中文', country: 'CN', isActive: true },
      { code: 'zh-tw', name: 'Chinese (Traditional)', nativeName: '繁體中文', country: 'TW', isActive: true },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', country: 'SA', isActive: true },
      { code: 'he', name: 'Hebrew', nativeName: 'עברית', country: 'IL', isActive: true },
      { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', country: 'TR', isActive: true },
      { code: 'pl', name: 'Polish', nativeName: 'Polski', country: 'PL', isActive: true },
      { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', country: 'NL', isActive: true },
      { code: 'sv', name: 'Swedish', nativeName: 'Svenska', country: 'SE', isActive: true },
      { code: 'no', name: 'Norwegian', nativeName: 'Norsk', country: 'NO', isActive: true },
      { code: 'da', name: 'Danish', nativeName: 'Dansk', country: 'DK', isActive: true },
      { code: 'fi', name: 'Finnish', nativeName: 'Suomi', country: 'FI', isActive: true },
      { code: 'cs', name: 'Czech', nativeName: 'Čeština', country: 'CZ', isActive: true },
      { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', country: 'HU', isActive: true },
      { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', country: 'GR', isActive: true },
      { code: 'ro', name: 'Romanian', nativeName: 'Română', country: 'RO', isActive: true },
      { code: 'bg', name: 'Bulgarian', nativeName: 'Български', country: 'BG', isActive: true },
      { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', country: 'UA', isActive: true },
      { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', country: 'HR', isActive: true },
      { code: 'sr', name: 'Serbian', nativeName: 'Српски', country: 'RS', isActive: true },
      { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', country: 'SK', isActive: true },
      { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', country: 'SI', isActive: true },
      { code: 'et', name: 'Estonian', nativeName: 'Eesti', country: 'EE', isActive: true },
      { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', country: 'LV', isActive: true },
      { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', country: 'LT', isActive: true },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', country: 'IN', isActive: true },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', country: 'BD', isActive: true },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', country: 'IN', isActive: true },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', country: 'IN', isActive: true },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी', country: 'IN', isActive: true },
      { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', country: 'IN', isActive: true },
      { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', country: 'IN', isActive: true },
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', country: 'IN', isActive: true },
      { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', country: 'IN', isActive: true },
      { code: 'ur', name: 'Urdu', nativeName: 'اردو', country: 'PK', isActive: true },
      { code: 'fa', name: 'Persian', nativeName: 'فارسی', country: 'IR', isActive: true },
      { code: 'th', name: 'Thai', nativeName: 'ไทย', country: 'TH', isActive: true },
      { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', country: 'VN', isActive: true },
      { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', country: 'ID', isActive: true },
      { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', country: 'MY', isActive: true },
      { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', country: 'PH', isActive: true },
      { code: 'fil', name: 'Filipino', nativeName: 'Filipino', country: 'PH', isActive: true },
      { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', country: 'ZA', isActive: true },
      { code: 'sq', name: 'Albanian', nativeName: 'Shqip', country: 'AL', isActive: true },
      { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', country: 'ET', isActive: true },
      { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն', country: 'AM', isActive: true },
      { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan', country: 'AZ', isActive: true },
      { code: 'eu', name: 'Basque', nativeName: 'Euskera', country: 'ES', isActive: true },
      { code: 'be', name: 'Belarusian', nativeName: 'Беларуская', country: 'BY', isActive: true },
      { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski', country: 'BA', isActive: true },
      { code: 'my', name: 'Burmese', nativeName: 'မြန်မာဘာသာ', country: 'MM', isActive: true },
      { code: 'km', name: 'Cambodian', nativeName: 'ភាសាខ្មែរ', country: 'KH', isActive: true },
      { code: 'ca', name: 'Catalan', nativeName: 'Català', country: 'ES', isActive: true },
      { code: 'gl', name: 'Galician', nativeName: 'Galego', country: 'ES', isActive: true },
      { code: 'ka', name: 'Georgian', nativeName: 'ქართული', country: 'GE', isActive: true },
      { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', country: 'IS', isActive: true },
      { code: 'ga', name: 'Irish', nativeName: 'Gaeilge', country: 'IE', isActive: true },
      { code: 'mk', name: 'Macedonian', nativeName: 'Македонски', country: 'MK', isActive: true },
      { code: 'mt', name: 'Maltese', nativeName: 'Malti', country: 'MT', isActive: true },
      { code: 'mn', name: 'Mongolian', nativeName: 'Монгол', country: 'MN', isActive: true },
      { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', country: 'NP', isActive: true },
      { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', country: 'LK', isActive: true },
      { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', country: 'KE', isActive: true }
    ];

    res.json(supportedLanguages);
  } catch (error: any) {
    console.error('Error fetching supported languages:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch supported languages'
    });
  }
});

// GET /api/languages/preferences - Get user language preferences
router.get('/api/languages/preferences', setUserContext, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    // Get user's language preferences from database
    const userResult = await db
      .select({ 
        id: users.id,
        languages: users.languages 
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userResult.length) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const userLanguages = userResult[0].languages || ['en'];

    // Return preferences in the format LanguageSelector expects
    res.json({
      id: userId,
      userId: userId,
      primaryLanguage: userLanguages[0] || 'en',
      additionalLanguages: userLanguages,
      preferredContentLanguages: userLanguages,
      autoTranslate: true,
      showOriginalContent: false,
      translationQualityThreshold: 0.7
    });
  } catch (error: any) {
    console.error('Error fetching language preferences:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch language preferences'
    });
  }
});

// PUT /api/languages/preferences - Update user language preferences
router.put('/api/languages/preferences', setUserContext, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    const { primaryLanguage, additionalLanguages } = req.body;

    // Update user's languages in database
    await db
      .update(users)
      .set({ 
        languages: additionalLanguages || [primaryLanguage] 
      })
      .where(eq(users.id, userId));

    res.json({
      success: true,
      message: 'Language preferences updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating language preferences:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update language preferences'
    });
  }
});

// GET /api/translations/:lng/:ns - Get translations for a language and namespace
router.get('/api/translations/:lng/:ns', async (req, res) => {
  try {
    const { lng, ns } = req.params;
    
    // For now, return basic translations
    // This should be expanded to load from database or translation files
    const translations: any = {
      en: {
        common: {
          welcome: 'Welcome',
          login: 'Login',
          logout: 'Logout',
          profile: 'Profile',
          settings: 'Settings',
          language: 'Language',
          popular: 'Popular',
          preferred: 'Preferred'
        },
        settings: {
          languageChanged: 'Language Changed',
          languageChangedDesc: 'Interface language set to {{language}}',
          chooseLanguage: 'Choose Language',
          selectLanguage: 'Select Language',
          allLanguages: 'All Languages'
        },
        errors: {
          languageChangeFailed: 'Failed to change language',
          tryAgain: 'Please try again'
        }
      },
      es: {
        common: {
          welcome: 'Bienvenido',
          login: 'Iniciar sesión',
          logout: 'Cerrar sesión',
          profile: 'Perfil',
          settings: 'Configuración',
          language: 'Idioma',
          popular: 'Popular',
          preferred: 'Preferido'
        },
        settings: {
          languageChanged: 'Idioma Cambiado',
          languageChangedDesc: 'Idioma de interfaz establecido en {{language}}',
          chooseLanguage: 'Elegir Idioma',
          selectLanguage: 'Seleccionar Idioma',
          allLanguages: 'Todos los Idiomas'
        },
        errors: {
          languageChangeFailed: 'Error al cambiar idioma',
          tryAgain: 'Por favor intenta de nuevo'
        }
      },
      fr: {
        common: {
          welcome: 'Bienvenue',
          login: 'Connexion',
          logout: 'Déconnexion',
          profile: 'Profil',
          settings: 'Paramètres',
          language: 'Langue',
          popular: 'Populaire',
          preferred: 'Préféré'
        },
        settings: {
          languageChanged: 'Langue Changée',
          languageChangedDesc: 'Langue d\'interface définie sur {{language}}',
          chooseLanguage: 'Choisir la Langue',
          selectLanguage: 'Sélectionner la Langue',
          allLanguages: 'Toutes les Langues'
        },
        errors: {
          languageChangeFailed: 'Échec du changement de langue',
          tryAgain: 'Veuillez réessayer'
        }
      }
    };

    const languageTranslations = translations[lng] || translations.en;
    const namespaceTranslations = languageTranslations[ns] || {};

    res.json(namespaceTranslations);
  } catch (error: any) {
    console.error('Error fetching translations:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch translations'
    });
  }
});

// POST /api/languages/analytics - Track language change analytics
router.post('/api/languages/analytics', setUserContext, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const { action, languageCode, metadata } = req.body;

    // Log language change for analytics (can be expanded to save to analytics table)
    console.log('[Language Analytics]', {
      userId,
      action,
      languageCode,
      metadata,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Analytics tracked successfully'
    });
  } catch (error: any) {
    console.error('Error tracking language analytics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to track analytics'
    });
  }
});

// PUT /api/user/language-preference - Update user language preference (legacy endpoint)
router.put('/api/user/language-preference', setUserContext, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    const { languageCode } = req.body;

    // Update user's primary language
    const currentUser = await db
      .select({ languages: users.languages })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const currentLanguages = currentUser[0]?.languages || [];
    const updatedLanguages = [languageCode, ...currentLanguages.filter(l => l !== languageCode)];

    await db
      .update(users)
      .set({ 
        languages: updatedLanguages 
      })
      .where(eq(users.id, userId));

    res.json({
      success: true,
      message: 'Language preference updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating language preference:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update language preference'
    });
  }
});

export default router;