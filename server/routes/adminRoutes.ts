import { Router } from 'express';
import { storage } from '../storage';
import { requireAdmin } from '../middleware/roleAuth';
import { db } from '../db';
import { eq, sql, desc, count } from 'drizzle-orm';
import { users, posts, events, groups } from '../../shared/schema';

const router = Router();

// Admin statistics endpoint
router.get('/admin/stats', requireAdmin, async (req, res) => {
  try {
    // Get total counts
    const [userCount] = await db.select({ count: count() }).from(users);
    const [postCount] = await db.select({ count: count() }).from(posts);
    const [eventCount] = await db.select({ count: count() }).from(events);
    const [groupCount] = await db.select({ count: count() }).from(groups);

    // Get recent activity
    const recentUsers = await db.select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(5);

    const recentPosts = await db.select()
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(5);

    res.json({
      stats: {
        totalUsers: userCount.count,
        totalPosts: postCount.count,
        totalEvents: eventCount.count,
        totalGroups: groupCount.count
      },
      recentActivity: {
        users: recentUsers,
        posts: recentPosts
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

// User management
router.get('/admin/users', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const allUsers = await db.select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db.select({ count: count() }).from(users);

    res.json({
      users: allUsers,
      pagination: {
        page,
        limit,
        total: totalCount.count,
        pages: Math.ceil(Number(totalCount.count) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Ban/unban user - TODO: Implement storage methods
router.post('/admin/users/:userId/ban', requireAdmin, async (req, res) => {
  res.status(501).json({ error: 'Ban user feature not yet implemented' });
});

router.post('/admin/users/:userId/unban', requireAdmin, async (req, res) => {
  res.status(501).json({ error: 'Unban user feature not yet implemented' });
});

// Content moderation - TODO: Implement storage methods
router.get('/admin/moderation/pending', requireAdmin, async (req, res) => {
  res.json([]);
});

router.post('/admin/moderation/:contentId/approve', requireAdmin, async (req, res) => {
  res.status(501).json({ error: 'Approve content feature not yet implemented' });
});

router.post('/admin/moderation/:contentId/reject', requireAdmin, async (req, res) => {
  res.status(501).json({ error: 'Reject content feature not yet implemented' });
});

export default router;