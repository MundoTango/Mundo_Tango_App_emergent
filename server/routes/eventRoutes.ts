/**
 * Mundo Tango - Event Routes
 * MB.MD TRACK B (S3): Events API - Week 2
 * 
 * Endpoints:
 * - GET /api/events - Get all events (with filters)
 * - GET /api/events/:id - Get event details
 * - POST /api/events - Create new event
 * - PATCH /api/events/:id - Update event
 * - DELETE /api/events/:id - Delete event
 * - POST /api/events/:id/rsvp - RSVP to event
 * - GET /api/events/:id/attendees - Get event attendees
 */

import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { events, eventRsvps as eventAttendees, users } from '../../shared/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';
import { success, successWithPagination, parsePagination } from '../utils/apiResponse';
import { AuthenticationError, ValidationError, NotFoundError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/events
 * Get all events with optional filters
 */
router.get('/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, pageSize, offset } = parsePagination(req.query);
    const { upcoming, city, eventType } = req.query;
    
    // Build filter conditions
    const conditions = [];
    
    if (upcoming === 'true') {
      conditions.push(gte(events.startDate, new Date()));
    }
    
    if (city) {
      conditions.push(eq(events.city, city as string));
    }
    
    if (eventType) {
      conditions.push(eq(events.eventType, eventType as string));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get events with pagination
    const [eventsList, [{ count: totalCount }]] = await Promise.all([
      db.select()
        .from(events)
        .where(whereClause)
        .orderBy(desc(events.startDate))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(events)
        .where(whereClause)
    ]);
    
    res.json(successWithPagination(eventsList, page, pageSize, Number(totalCount)));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/events/:id
 * Get event details by ID
 */
router.get('/events/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = parseInt(req.params.id);
    
    if (isNaN(eventId)) {
      throw new ValidationError('Invalid event ID');
    }
    
    const [event] = await db.select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);
    
    if (!event) {
      throw new NotFoundError('Event not found');
    }
    
    // Get attendee count
    const [{ count: attendeeCount }] = await db.select({ 
      count: sql<number>`count(*)` 
    })
      .from(eventAttendees)
      .where(eq(eventAttendees.eventId, eventId));
    
    res.json(success({ ...event, attendeeCount }, 'Event fetched successfully'));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/events
 * Create new event (authenticated)
 */
router.post('/events', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.replitId, userId)).limit(1);
    
    if (!user[0] || !user[0].isActive) {
      throw new AuthenticationError('User not found or inactive');
    }
    
    const { title, description, startDate, endDate, city, venue, eventType, maxAttendees, price } = req.body;
    
    // Validation
    if (!title || title.trim().length === 0) {
      throw new ValidationError('Event title is required');
    }
    
    if (!startDate) {
      throw new ValidationError('Event start date is required');
    }
    
    // Create event
    const newEvent = await db.insert(events).values({
      userId: user[0].id,
      title: title.trim(),
      description: description || '',
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      city: city || null,
      venue: venue || null,
      eventType: eventType || 'milonga',
      maxAttendees: maxAttendees || null,
      price: price || null,
    }).returning();
    
    res.json(success(newEvent[0], 'Event created successfully'));
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/events/:id
 * Update event (authenticated, organizer only)
 */
router.patch('/events/:id', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.replitId, userId)).limit(1);
    const eventId = parseInt(req.params.id);
    
    if (!user[0] || !user[0].isActive) {
      throw new AuthenticationError('User not found or inactive');
    }
    
    if (isNaN(eventId)) {
      throw new ValidationError('Invalid event ID');
    }
    
    // Check if event exists and user is organizer
    const [event] = await db.select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);
    
    if (!event) {
      throw new NotFoundError('Event not found');
    }
    
    if (event.userId !== user[0].id) {
      throw new AuthenticationError('Only the organizer can update this event');
    }
    
    // Update allowed fields
    const allowedUpdates: any = {
      updatedAt: new Date()
    };
    
    const { title, description, startDate, endDate, city, venue, eventType, maxAttendees, price } = req.body;
    
    if (title !== undefined) allowedUpdates.title = title;
    if (description !== undefined) allowedUpdates.description = description;
    if (startDate !== undefined) allowedUpdates.startDate = new Date(startDate);
    if (endDate !== undefined) allowedUpdates.endDate = endDate ? new Date(endDate) : null;
    if (city !== undefined) allowedUpdates.city = city;
    if (venue !== undefined) allowedUpdates.venue = venue;
    if (eventType !== undefined) allowedUpdates.eventType = eventType;
    if (maxAttendees !== undefined) allowedUpdates.maxAttendees = maxAttendees;
    if (price !== undefined) allowedUpdates.price = price;
    
    const updated = await db.update(events)
      .set(allowedUpdates)
      .where(eq(events.id, eventId))
      .returning();
    
    res.json(success(updated[0], 'Event updated successfully'));
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/events/:id
 * Delete event (authenticated, organizer only)
 */
router.delete('/events/:id', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.replitId, userId)).limit(1);
    const eventId = parseInt(req.params.id);
    
    if (!user[0] || !user[0].isActive) {
      throw new AuthenticationError('User not found or inactive');
    }
    
    if (isNaN(eventId)) {
      throw new ValidationError('Invalid event ID');
    }
    
    // Check if event exists and user is organizer
    const [event] = await db.select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);
    
    if (!event) {
      throw new NotFoundError('Event not found');
    }
    
    if (event.userId !== user[0].id) {
      throw new AuthenticationError('Only the organizer can delete this event');
    }
    
    await db.delete(events).where(eq(events.id, eventId));
    
    res.json(success({ id: eventId }, 'Event deleted successfully'));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/events/:id/rsvp
 * RSVP to event (authenticated)
 */
router.post('/events/:id/rsvp', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.replitId, userId)).limit(1);
    const eventId = parseInt(req.params.id);
    
    if (!user[0] || !user[0].isActive) {
      throw new AuthenticationError('User not found or inactive');
    }
    
    if (isNaN(eventId)) {
      throw new ValidationError('Invalid event ID');
    }
    
    // Check if event exists
    const [event] = await db.select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);
    
    if (!event) {
      throw new NotFoundError('Event not found');
    }
    
    const { status } = req.body; // 'going', 'interested', 'not_going'
    
    if (!status || !['going', 'interested', 'not_going'].includes(status)) {
      throw new ValidationError('Invalid RSVP status. Must be: going, interested, or not_going');
    }
    
    // Check if already RSVP'd
    const [existing] = await db.select()
      .from(eventAttendees)
      .where(and(
        eq(eventAttendees.eventId, eventId),
        eq(eventAttendees.userId, user[0].id)
      ))
      .limit(1);
    
    let rsvp;
    if (existing) {
      // Update existing RSVP
      [rsvp] = await db.update(eventAttendees)
        .set({ status, updatedAt: new Date() })
        .where(eq(eventAttendees.id, existing.id))
        .returning();
    } else {
      // Create new RSVP
      [rsvp] = await db.insert(eventAttendees)
        .values({
          eventId,
          userId: user[0].id,
          status,
        })
        .returning();
    }
    
    res.json(success(rsvp, 'RSVP updated successfully'));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/events/:id/attendees
 * Get event attendees
 */
router.get('/events/:id/attendees', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = parseInt(req.params.id);
    
    if (isNaN(eventId)) {
      throw new ValidationError('Invalid event ID');
    }
    
    // Get attendees with user details
    const attendees = await db.select({
      id: eventAttendees.id,
      status: eventAttendees.status,
      createdAt: eventAttendees.createdAt,
      user: {
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage,
        city: users.city,
        country: users.country,
      }
    })
      .from(eventAttendees)
      .innerJoin(users, eq(eventAttendees.userId, users.id))
      .where(eq(eventAttendees.eventId, eventId))
      .orderBy(desc(eventAttendees.createdAt));
    
    res.json(success(attendees, 'Attendees fetched successfully'));
  } catch (error) {
    next(error);
  }
});

export default router;
