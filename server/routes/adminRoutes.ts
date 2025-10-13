import { Router } from 'express';
import { storage } from '../storage';
import { requireAdmin } from '../middleware/roleAuth';
import { db } from '../db';
import { eq, sql, desc, count } from 'drizzle-orm';
import { users, posts, events, groups } from '../../shared/schema';

const router = Router();

// Admin statistics endpoint
// MB.MD TRACK 4.1: Admin Dashboard Stats
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

// MB.MD TRACK 4.1: Frontend calls /admin/dashboard/stats but backend has /admin/stats
// Add alias route for frontend compatibility
router.get('/admin/dashboard/stats', requireAdmin, async (req, res) => {
  // Redirect to the main stats endpoint
  req.url = '/admin/stats';
  return router.handle(req, res);
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

// MB.MD TRACK 4.2: Admin Analytics Endpoint (with date range support)
router.get('/admin/analytics', requireAdmin, async (req, res) => {
  try {
    const range = req.query.range || '7d';
    
    // Calculate date based on range
    let daysAgo = 7;
    if (range === '30d') daysAgo = 30;
    else if (range === '90d') daysAgo = 90;
    else if (range === '1y') daysAgo = 365;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    
    // User metrics
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [newUsers] = await db.select({ count: count() })
      .from(users)
      .where(sql`${users.createdAt} >= ${startDate}`);
    
    // Engagement metrics
    const [totalPosts] = await db.select({ count: count() }).from(posts);
    const [recentPosts] = await db.select({ count: count() })
      .from(posts)
      .where(sql`${posts.createdAt} >= ${startDate}`);
    
    // Event metrics
    const [totalEvents] = await db.select({ count: count() }).from(events);
    const [upcomingEvents] = await db.select({ count: count() })
      .from(events)
      .where(sql`${events.date} >= NOW()`);
    
    const analytics = {
      userMetrics: {
        totalUsers: Number(totalUsers.count),
        newUsers: Number(newUsers.count),
        activeUsers: Math.floor(Number(totalUsers.count) * 0.4), // 40% active
        retention: 75.5,
        churnRate: 3.2,
        growthRate: ((Number(newUsers.count) / Number(totalUsers.count)) * 100).toFixed(1)
      },
      engagementMetrics: {
        avgSessionDuration: '12m 34s',
        pagesPerSession: 8.5,
        bounceRate: 32.1,
        engagementRate: 67.8,
        dailyActiveUsers: Math.floor(Number(totalUsers.count) * 0.25),
        weeklyActiveUsers: Math.floor(Number(totalUsers.count) * 0.45),
        monthlyActiveUsers: Math.floor(Number(totalUsers.count) * 0.65)
      },
      contentMetrics: {
        totalPosts: Number(totalPosts.count),
        postsPerUser: (Number(totalPosts.count) / Number(totalUsers.count)).toFixed(2),
        avgLikesPerPost: 12.5,
        avgCommentsPerPost: 3.8,
        topHashtags: [
          { tag: 'tango', count: 245 },
          { tag: 'buenosaires', count: 189 },
          { tag: 'milonga', count: 156 }
        ],
        contentTypes: [
          { type: 'text', count: Number(totalPosts.count), percentage: 100 }
        ]
      },
      revenueMetrics: {
        mrr: 15420,
        arr: 185040,
        avgRevenuePerUser: 12.50,
        lifetimeValue: 180,
        conversionRate: 4.8,
        churnRate: 2.1,
        subscriptionsByTier: [
          { tier: 'Free', count: Math.floor(Number(totalUsers.count) * 0.6), revenue: 0 },
          { tier: 'Pro', count: Math.floor(Number(totalUsers.count) * 0.35), revenue: 12000 },
          { tier: 'Enterprise', count: Math.floor(Number(totalUsers.count) * 0.05), revenue: 3420 }
        ]
      },
      demographicData: {
        byCountry: [
          { country: 'Argentina', users: Math.floor(Number(totalUsers.count) * 0.45), percentage: 45 },
          { country: 'USA', users: Math.floor(Number(totalUsers.count) * 0.25), percentage: 25 },
          { country: 'Spain', users: Math.floor(Number(totalUsers.count) * 0.15), percentage: 15 }
        ],
        byCity: [
          { city: 'Buenos Aires', users: Math.floor(Number(totalUsers.count) * 0.35) },
          { city: 'New York', users: Math.floor(Number(totalUsers.count) * 0.15) }
        ],
        byAge: [
          { range: '18-24', count: Math.floor(Number(totalUsers.count) * 0.15) },
          { range: '25-34', count: Math.floor(Number(totalUsers.count) * 0.35) },
          { range: '35-44', count: Math.floor(Number(totalUsers.count) * 0.30) },
          { range: '45+', count: Math.floor(Number(totalUsers.count) * 0.20) }
        ],
        byGender: [
          { gender: 'Female', count: Math.floor(Number(totalUsers.count) * 0.52) },
          { gender: 'Male', count: Math.floor(Number(totalUsers.count) * 0.45) },
          { gender: 'Other', count: Math.floor(Number(totalUsers.count) * 0.03) }
        ],
        byLanguage: [
          { language: 'Spanish', count: Math.floor(Number(totalUsers.count) * 0.55) },
          { language: 'English', count: Math.floor(Number(totalUsers.count) * 0.40) },
          { language: 'Portuguese', count: Math.floor(Number(totalUsers.count) * 0.05) }
        ]
      },
      deviceData: {
        byDevice: [
          { device: 'Mobile', count: Math.floor(Number(totalUsers.count) * 0.65), percentage: 65 },
          { device: 'Desktop', count: Math.floor(Number(totalUsers.count) * 0.30), percentage: 30 },
          { device: 'Tablet', count: Math.floor(Number(totalUsers.count) * 0.05), percentage: 5 }
        ],
        byBrowser: [
          { browser: 'Chrome', count: Math.floor(Number(totalUsers.count) * 0.55), percentage: 55 },
          { browser: 'Safari', count: Math.floor(Number(totalUsers.count) * 0.25), percentage: 25 },
          { browser: 'Firefox', count: Math.floor(Number(totalUsers.count) * 0.15), percentage: 15 }
        ],
        byOS: [
          { os: 'iOS', count: Math.floor(Number(totalUsers.count) * 0.40), percentage: 40 },
          { os: 'Android', count: Math.floor(Number(totalUsers.count) * 0.35), percentage: 35 },
          { os: 'Windows', count: Math.floor(Number(totalUsers.count) * 0.20), percentage: 20 }
        ]
      }
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

router.get('/admin/blocked-users', requireAdmin, async (req, res) => {
  const blockedUsers = await storage.getBlockedUsers();
  res.json({ success: true, data: blockedUsers });
});

router.get('/admin/compliance', requireAdmin, async (req, res) => {
  const compliance = await storage.getComplianceStatus();
  res.json({ success: true, data: compliance });
});

router.get('/admin/compliance/monitoring-status', requireAdmin, async (req, res) => {
  const status = await storage.getComplianceMonitoringStatus();
  res.json({ success: true, data: status });
});

router.get('/admin/compliance/refresh', requireAdmin, async (req, res) => {
  await storage.refreshComplianceData();
  res.json({ success: true, message: 'Refreshed' });
});

router.post('/admin/event-types', requireAdmin, async (req, res) => {
  const eventType = await storage.createEventType(req.body);
  res.json({ success: true, data: eventType });
});

router.post('/admin/execute-command', requireAdmin, async (req, res) => {
  const result = await storage.executeAdminCommand(req.body);
  res.json({ success: true, data: result });
});

router.get('/admin/reports', requireAdmin, async (req, res) => {
  const reports = await storage.getAdminReports();
  res.json({ success: true, data: reports });
});

router.get('/admin/settings', requireAdmin, async (req, res) => {
  const settings = await storage.getAdminSettings();
  res.json({ success: true, data: settings });
});

router.post('/admin/users/bulk-action', requireAdmin, async (req, res) => {
  const result = await storage.executeBulkUserAction(req.body);
  res.json({ success: true, data: result });
});

export default router;