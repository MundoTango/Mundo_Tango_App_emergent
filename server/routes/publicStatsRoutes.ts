import { Router } from 'express';
import { db } from '../db';
import { users, events, groups } from '@shared/schema';
import { sql, isNotNull } from 'drizzle-orm';

const router = Router();

/**
 * J1 - Public Stats API for Landing Page
 * Returns platform statistics for visitor landing page
 */
router.get('/api/stats/public', async (req, res) => {
  try {
    console.log('📊 J1 - Fetching public platform statistics');
    
    // Get total users count
    const userResult = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(users);
    const userCount = userResult[0]?.count || 0;
    
    // Get total events count
    const eventResult = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(events);
    const eventCount = eventResult[0]?.count || 0;
    
    // Get unique cities count (from groups)
    const cityResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT city)::int` })
      .from(groups)
      .where(isNotNull(groups.city));
    const cityCount = cityResult[0]?.count || 0;
    
    // Get unique countries count (from groups)
    const countryResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT country)::int` })
      .from(groups)
      .where(isNotNull(groups.country));
    const countryCount = countryResult[0]?.count || 0;
    
    const stats = {
      users: userCount,
      events: eventCount,
      cities: cityCount,
      countries: countryCount
    };
    
    console.log('✅ J1 - Public stats:', stats);
    
    res.json(stats);
    
  } catch (error) {
    console.error('❌ J1 - Error fetching public stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch public statistics',
      users: 0,
      events: 0,
      cities: 0,
      countries: 0
    });
  }
});

export default router;
