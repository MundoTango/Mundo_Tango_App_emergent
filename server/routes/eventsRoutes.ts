
import express from 'express';
import { z } from 'zod';
import { db } from '../db';
import { events, eventRsvps, recurringEvents, users } from '../../shared/schema';
import { eq, and, gte, desc, like, or } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import { socketService } from '../services/socketService';

const router = express.Router();

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  location: z.string().min(1),
  groupId: z.string().uuid().optional(),
  maxAttendees: z.number().positive().optional(),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  visibility: z.enum(['public', 'private', 'group']).default('public'),
  recurringPattern: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    interval: z.number().positive(),
    dayOfWeek: z.string().optional(),
    endDate: z.string().datetime().optional()
  }).optional()
});

const rsvpSchema = z.object({
  status: z.enum(['attending', 'maybe', 'not_attending']),
  guestCount: z.number().min(0).default(0),
  notes: z.string().optional()
});

// Create event
router.post('/api/events', authMiddleware, async (req, res) => {
  try {
    const validatedData = createEventSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const [newEvent] = await db.insert(events).values({
      ...validatedData,
      organizerId: userId,
      startDate: new Date(validatedData.startDate),
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : null
    }).returning();

    // Handle recurring events
    if (validatedData.recurringPattern) {
      await db.insert(recurringEvents).values({
        parentEventId: newEvent.id,
        pattern: validatedData.recurringPattern,
        nextOccurrence: new Date(validatedData.startDate)
      });
    }

    // Broadcast event creation
    socketService.broadcastToRoom('global', 'event:created', {
      event: newEvent,
      organizer: { id: userId }
    });

    res.json({ success: true, data: newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({ success: false, error: 'Failed to create event' });
  }
});

// Get events feed with filters
router.get('/api/events/feed', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '10',
      search,
      location,
      tags,
      startDate,
      endDate,
      visibility = 'public'
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    let query = db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        startDate: events.startDate,
        endDate: events.endDate,
        location: events.location,
        organizerId: events.organizerId,
        groupId: events.groupId,
        maxAttendees: events.maxAttendees,
        imageUrl: events.imageUrl,
        tags: events.tags,
        visibility: events.visibility,
        createdAt: events.createdAt,
        organizer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl
        }
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .where(eq(events.visibility, visibility as string))
      .orderBy(desc(events.startDate))
      .limit(parseInt(limit as string))
      .offset(offset);

    // Add search filters
    if (search) {
      query = query.where(
        or(
          like(events.title, `%${search}%`),
          like(events.description, `%${search}%`)
        )
      );
    }

    if (startDate) {
      query = query.where(gte(events.startDate, new Date(startDate as string)));
    }

    const eventsData = await query;

    // Get RSVP counts for each event
    const eventsWithRsvps = await Promise.all(
      eventsData.map(async (event) => {
        const rsvpCounts = await db
          .select({
            status: eventRsvps.status,
            count: eventRsvps.id
          })
          .from(eventRsvps)
          .where(eq(eventRsvps.eventId, event.id));

        const attendingCount = rsvpCounts.filter(r => r.status === 'attending').length;
        const maybeCount = rsvpCounts.filter(r => r.status === 'maybe').length;

        return {
          ...event,
          rsvpCounts: {
            attending: attendingCount,
            maybe: maybeCount,
            total: rsvpCounts.length
          }
        };
      })
    );

    res.json({ success: true, data: eventsWithRsvps });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch events' });
  }
});

// RSVP to event
router.post('/api/events/:id/rsvp', authMiddleware, async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const userId = req.user?.id;
    const validatedData = rsvpSchema.parse(req.body);

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Check if RSVP already exists
    const existingRsvp = await db
      .select()
      .from(eventRsvps)
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId)))
      .limit(1);

    let rsvp;
    if (existingRsvp.length > 0) {
      // Update existing RSVP
      [rsvp] = await db
        .update(eventRsvps)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(eventRsvps.id, existingRsvp[0].id))
        .returning();
    } else {
      // Create new RSVP
      [rsvp] = await db
        .insert(eventRsvps)
        .values({
          eventId,
          userId,
          ...validatedData
        })
        .returning();
    }

    // Broadcast RSVP change
    socketService.broadcastToRoom(`event:${eventId}`, 'event:rsvp_change', {
      eventId,
      userId,
      status: validatedData.status,
      rsvp
    });

    res.json({ success: true, data: rsvp });
  } catch (error) {
    console.error('Error creating/updating RSVP:', error);
    res.status(400).json({ success: false, error: 'Failed to process RSVP' });
  }
});

// Get calendar view data
router.get('/api/events/calendar', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const startOfMonth = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
    const endOfMonth = new Date(parseInt(year as string), parseInt(month as string), 0);

    const calendarEvents = await db
      .select({
        id: events.id,
        title: events.title,
        startDate: events.startDate,
        endDate: events.endDate,
        location: events.location
      })
      .from(events)
      .where(
        and(
          gte(events.startDate, startOfMonth),
          gte(endOfMonth, events.startDate),
          eq(events.visibility, 'public')
        )
      )
      .orderBy(events.startDate);

    res.json({ success: true, data: calendarEvents });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch calendar data' });
  }
});

// Get event details
router.get('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [event] = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        startDate: events.startDate,
        endDate: events.endDate,
        location: events.location,
        organizerId: events.organizerId,
        groupId: events.groupId,
        maxAttendees: events.maxAttendees,
        imageUrl: events.imageUrl,
        tags: events.tags,
        visibility: events.visibility,
        createdAt: events.createdAt,
        organizer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl
        }
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .where(eq(events.id, id))
      .limit(1);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // Get RSVPs
    const rsvps = await db
      .select({
        id: eventRsvps.id,
        status: eventRsvps.status,
        guestCount: eventRsvps.guestCount,
        notes: eventRsvps.notes,
        createdAt: eventRsvps.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl
        }
      })
      .from(eventRsvps)
      .leftJoin(users, eq(eventRsvps.userId, users.id))
      .where(eq(eventRsvps.eventId, id));

    res.json({
      success: true,
      data: {
        ...event,
        rsvps
      }
    });
  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch event details' });
  }
});

export default router;
