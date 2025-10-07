import { Router } from 'express';
import { db } from '../db';
import { events, hostHomes, recommendations, groups, eventRsvps } from '../../shared/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { optionalAuth } from '../middleware/secureAuth';

const router = Router();

// ESA LIFE CEO 61x21 - Layer 8: Community Hub Map Data Endpoint
// Aggregates Events, Housing, and Recommendations with coordinates for unified map display
router.get('/api/community/map-data', optionalAuth, async (req, res) => {
  try {
    const { 
      city, 
      country, 
      groupSlug,
      // Event filters
      eventType,
      startDate,
      endDate,
      hasSpace,
      // Housing filters
      roomType,
      minGuests,
      connectionLevel,
      // Recommendations filters
      cuisine,
      category,
      priceLevel
    } = req.query;

    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    const mapItems: any[] = [];

    // Build event filters
    const eventFilters = [
      sql`LOWER(${events.city}) = LOWER(${city as string})`,
      gte(events.startDate, new Date())
    ];

    if (eventType && eventType !== 'all') {
      eventFilters.push(eq(events.eventType, eventType as string));
    }

    if (startDate) {
      eventFilters.push(gte(events.startDate, new Date(startDate as string)));
    }

    if (endDate) {
      eventFilters.push(lte(events.endDate, new Date(endDate as string)));
    }

    if (hasSpace === 'true') {
      eventFilters.push(sql`${events.maxAttendees} > ${events.currentAttendees}`);
    }

    // Fetch Events with coordinates (ESA Layer 23 - Event Management)
    const eventsData = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        latitude: events.latitude,
        longitude: events.longitude,
        location: events.location,
        address: events.address,
        startDate: events.startDate,
        endDate: events.endDate,
        price: events.price,
        currency: events.currency,
        eventType: events.eventType,
        maxAttendees: events.maxAttendees,
        currentAttendees: events.currentAttendees,
        attendeeCount: sql<number>`(
          SELECT COUNT(*) FROM ${eventRsvps} 
          WHERE ${eventRsvps.eventId} = ${events.id} 
          AND ${eventRsvps.status} = 'going'
        )`.as('attendeeCount'),
      })
      .from(events)
      .where(and(...eventFilters))
      .limit(50);

    eventsData.forEach((event) => {
      if (event.latitude && event.longitude) {
        const lat = parseFloat(event.latitude);
        const lng = parseFloat(event.longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          mapItems.push({
            id: event.id,
            type: 'event',
            title: event.title,
            description: event.description || `Event at ${event.location}`,
            latitude: lat,
            longitude: lng,
            address: event.address || event.location,
            metadata: {
              date: event.startDate,
              price: event.price ? `${event.currency || '$'}${event.price}` : 'Free',
              attendeeCount: event.attendeeCount,
            },
          });
        }
      }
    });

    // Build housing filters
    const housingFilters = [
      sql`LOWER(${hostHomes.city}) = LOWER(${city as string})`,
      eq(hostHomes.isActive, true)
    ];

    if (minGuests && minGuests !== 'all') {
      housingFilters.push(gte(hostHomes.maxGuests, parseInt(minGuests as string)));
    }

    if (connectionLevel && connectionLevel !== 'all') {
      // Filter by whoCanBook connection level
      const levelMap: { [key: string]: string[] } = {
        '1st_degree': ['1st_degree', 'friends_only'],
        '2nd_degree': ['1st_degree', '2nd_degree', 'friends_only'],
        '3rd_degree': ['1st_degree', '2nd_degree', '3rd_degree', 'friends_only']
      };
      const allowedLevels = levelMap[connectionLevel as string] || ['anyone'];
      housingFilters.push(sql`${hostHomes.whoCanBook} IN (${sql.raw(allowedLevels.map(l => `'${l}'`).join(','))}, 'anyone')`);
    }

    // Note: roomType is not in the schema, so we skip that filter for now
    // In the future, this could be added as a new column to hostHomes table

    // Fetch Housing with coordinates (ESA Layer 28 - Marketplace/Booking System)
    const housingData = await db
      .select({
        id: hostHomes.id,
        title: hostHomes.title,
        description: hostHomes.description,
        lat: hostHomes.lat,
        lng: hostHomes.lng,
        city: hostHomes.city,
        address: hostHomes.address,
        pricePerNight: hostHomes.pricePerNight,
        maxGuests: hostHomes.maxGuests,
        whoCanBook: hostHomes.whoCanBook,
      })
      .from(hostHomes)
      .where(and(...housingFilters))
      .limit(50);

    housingData.forEach((home) => {
      if (home.lat && home.lng) {
        mapItems.push({
          id: home.id,
          type: 'housing',
          title: home.title,
          description: home.description || `Home in ${home.city}`,
          latitude: home.lat,
          longitude: home.lng,
          address: home.address || home.city,
          metadata: {
            price: home.pricePerNight ? `$${(home.pricePerNight / 100).toFixed(0)}/night` : 'Contact host',
            whoCanBook: home.whoCanBook,
            maxGuests: home.maxGuests,
          },
        });
      }
    });

    // Build recommendations filters
    const recommendationFilters = [
      sql`LOWER(${recommendations.city}) = LOWER(${city as string})`
    ];

    if (cuisine && cuisine !== 'all') {
      recommendationFilters.push(sql`LOWER(${recommendations.cuisine}) = LOWER(${cuisine as string})`);
    }

    if (category && category !== 'all') {
      recommendationFilters.push(eq(recommendations.type, category as string));
    }

    if (priceLevel && priceLevel !== 'all') {
      recommendationFilters.push(eq(recommendations.priceLevel, priceLevel as string));
    }

    // Fetch Recommendations with coordinates (ESA Layer 27 - Recommendations System)
    const recommendationsData = await db
      .select({
        id: recommendations.id,
        title: recommendations.title,
        description: recommendations.description,
        lat: recommendations.lat,
        lng: recommendations.lng,
        address: recommendations.address,
        type: recommendations.type,
        priceLevel: recommendations.priceLevel,
        cuisine: recommendations.cuisine,
        rating: recommendations.rating,
        googleRating: recommendations.googleRating,
        mtRating: recommendations.mtRating,
      })
      .from(recommendations)
      .where(and(...recommendationFilters))
      .limit(50);

    recommendationsData.forEach((rec) => {
      if (rec.lat && rec.lng) {
        mapItems.push({
          id: rec.id,
          type: 'recommendation',
          title: rec.title,
          description: rec.description || rec.type,
          latitude: rec.lat,
          longitude: rec.lng,
          address: rec.address,
          metadata: {
            category: rec.type,
            priceRange: rec.priceLevel,
            cuisine: rec.cuisine,
            rating: rec.mtRating || rec.rating || rec.googleRating,
          },
        });
      }
    });

    res.json({ data: mapItems, count: mapItems.length });
  } catch (error) {
    console.error('[Community Map Data] Error:', error);
    res.status(500).json({ error: 'Failed to fetch community map data' });
  }
});

export default router;
