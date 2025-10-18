/**
 * J1 - First-Time Visitor Journey
 * Public Stats API for visitor landing page
 * 
 * Endpoint: GET /api/stats/public
 * Returns: Community statistics (users, events, cities, countries)
 */

import express from 'express';
import { db } from '../db';
import { users, events } from '../../shared/schema';
import { sql, count } from 'drizzle-orm';

const router = express.Router();

/**
 * GET /api/stats/public
 * Public statistics for visitor landing page
 * No authentication required
 */
router.get('/public', async (req, res) => {
  try {
    // Count total users
    const [userCount] = await db
      .select({ count: count() })
      .from(users);

    // Count total events
    const [eventCount] = await db
      .select({ count: count() })
      .from(events);

    // Count unique cities (from users table)
    const [cityCount] = await db
      .select({ 
        count: sql<number>`COUNT(DISTINCT ${users.city})`.as('count')
      })
      .from(users)
      .where(sql`${users.city} IS NOT NULL AND ${users.city} != ''`);

    // Count unique countries (from users table)
    const [countryCount] = await db
      .select({ 
        count: sql<number>`COUNT(DISTINCT ${users.country})`.as('count')
      })
      .from(users)
      .where(sql`${users.country} IS NOT NULL AND ${users.country} != ''`);

    res.json({
      success: true,
      data: {
        totalUsers: userCount?.count || 0,
        totalEvents: eventCount?.count || 0,
        totalCities: cityCount?.count || 0,
        totalCountries: countryCount?.count || 0,
      }
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

export default router;
