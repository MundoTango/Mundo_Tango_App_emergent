import express from 'express';
import { z } from 'zod';
import { db } from '../db';
import { events, eventRsvps, recurringEvents, users, eventParticipants } from '../../shared/schema';
import { eq, and, gte, desc, like, or, sql } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import { getWebSocketService } from '../services/websocketService';
import { storage } from '../storage';
import jwt from 'jsonwebtoken';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "mundo-tango-secret-key";

// Optional auth middleware - doesn't require authentication but adds user if available
const optionalAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // Development bypass
    if (process.env.NODE_ENV === 'development' || process.env.AUTH_BYPASS === 'true') {
      const defaultUser = await storage.getUser(7);
      if (defaultUser) {
        (req as any).user = {
          id: defaultUser.id,
          email: defaultUser.email,
          username: defaultUser.username,
          name: defaultUser.name,
        };
      }
      return next();
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      // No token - continue without user
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const user = await storage.getUser(decoded.userId);

    if (user && user.id) {
      (req as any).user = {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      };
    }

    next();
  } catch (error) {
    // Auth failed - continue without user
    next();
  }
};

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
  status: z.enum(['going', 'interested', 'maybe', 'not_going']).nullable()
});

// Create event
router.post('/api/events', authMiddleware, async (req, res) => {
  try {
    const validatedData = createEventSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { recurringPattern, ...eventData } = validatedData;
    const [newEvent] = await db.insert(events).values({
      ...eventData,
      userId: userId, // Required field
      organizerId: userId, // Also set organizerId for compatibility
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

    // Send notification to all users about new event
    const wsService = getWebSocketService();
    if (wsService) {
      // Use sendNotification method to notify about the new event
      // Since there's no broadcastToRoom, we'll skip the broadcast for now
      // This would need to be implemented in WebSocketService if needed
      console.log('Event created:', newEvent.id);
    }

    res.json({ success: true, data: newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({ success: false, error: 'Failed to create event' });
  }
});

// Get events feed with filters
router.get('/api/events/feed', optionalAuth, async (req, res) => {
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
    const userId = (req as any).user?.id; // Optional user ID from session
    
    // Build where conditions
    const whereConditions = [];
    whereConditions.push(eq(events.visibility, visibility as any));
    
    if (startDate) {
      whereConditions.push(gte(events.startDate, new Date(startDate as string)));
    }

    let query = db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        startDate: events.startDate,
        endDate: events.endDate,
        location: events.location,
        city: events.city,
        eventType: events.eventType,
        organizerId: events.organizerId, // Use organizerId field that exists
        userId: events.userId, // Also include userId
        groupId: events.groupId,
        maxAttendees: events.maxAttendees,
        currentAttendees: events.currentAttendees,
        imageUrl: events.imageUrl,
        tags: events.tags,
        visibility: events.visibility,
        isFeatured: events.isFeatured,
        createdAt: events.createdAt,
        organizer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImage: users.profileImage
        }
      })
      .from(events)
      .leftJoin(users, eq(events.userId, users.id)) // Join on userId
      .where(and(...whereConditions))
      .orderBy(desc(events.startDate))
      .limit(parseInt(limit as string))
      .offset(offset);

    const eventsData = await query;

    // Filter search results in memory for now (Drizzle limitation)
    let filteredEvents = eventsData;
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredEvents = eventsData.filter(event => 
        event.title.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower)
      );
    }

    // Get RSVP counts and user's RSVP status for each event
    const eventsWithRsvps = await Promise.all(
      filteredEvents.map(async (event) => {
        const rsvpCounts = await db
          .select({
            status: eventRsvps.status,
            userId: eventRsvps.userId,
            count: eventRsvps.id
          })
          .from(eventRsvps)
          .where(eq(eventRsvps.eventId, event.id));

        const goingCount = rsvpCounts.filter(r => r.status === 'going').length;
        const interestedCount = rsvpCounts.filter(r => r.status === 'interested').length;
        const maybeCount = rsvpCounts.filter(r => r.status === 'maybe').length;

        // Find user's RSVP status if they're logged in
        const userRsvp = userId ? rsvpCounts.find(r => r.userId === userId) : null;

        return {
          ...event,
          current_attendees: goingCount,
          rsvpCounts: {
            going: goingCount,
            interested: interestedCount,
            maybe: maybeCount,
            total: rsvpCounts.length
          },
          userRsvpStatus: userRsvp?.status || null
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
      .where(and(eq(eventRsvps.eventId, parseInt(eventId)), eq(eventRsvps.userId, userId)))
      .limit(1);

    let rsvp = null;
    
    // If status is null, remove the RSVP (toggle off)
    if (validatedData.status === null) {
      if (existingRsvp.length > 0) {
        await db
          .delete(eventRsvps)
          .where(eq(eventRsvps.id, existingRsvp[0].id));
      }
      // Return null to indicate RSVP was removed
      return res.json({ success: true, data: { status: null } });
    }

    // Otherwise, create or update RSVP
    if (existingRsvp.length > 0) {
      // Update existing RSVP - only update status field that exists in schema
      [rsvp] = await db
        .update(eventRsvps)
        .set({ status: validatedData.status, updatedAt: new Date() })
        .where(eq(eventRsvps.id, existingRsvp[0].id))
        .returning();
    } else {
      // Create new RSVP - only include fields that exist in schema
      [rsvp] = await db
        .insert(eventRsvps)
        .values({
          eventId: parseInt(eventId),
          userId,
          status: validatedData.status
        })
        .returning();
    }

    // Notify about RSVP change
    const wsService = getWebSocketService();
    if (wsService) {
      // Use sendNotification to notify the event organizer
      // We'd need the event organizer's ID for this
      console.log('RSVP updated for event:', eventId);
    }

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
          gte(sql`${endOfMonth}`, events.startDate),
          eq(events.visibility, 'public' as any)
        )
      )
      .orderBy(events.startDate);

    res.json({ success: true, data: calendarEvents });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch calendar data' });
  }
});

// Get event details (with optional auth to get user's RSVP status)
router.get('/api/events/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const [event] = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        startDate: events.startDate,
        endDate: events.endDate,
        location: events.location,
        organizerId: events.organizerId, // Use organizerId field that exists
        userId: events.userId, // Also include userId
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
          profileImage: users.profileImage
        }
      })
      .from(events)
      .leftJoin(users, eq(events.userId, users.id)) // Join on userId
      .where(eq(events.id, parseInt(id)))
      .limit(1);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // Get RSVPs - only select fields that exist in schema
    const rsvps = await db
      .select({
        id: eventRsvps.id,
        status: eventRsvps.status,
        createdAt: eventRsvps.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImage: users.profileImage
        }
      })
      .from(eventRsvps)
      .leftJoin(users, eq(eventRsvps.userId, users.id))
      .where(eq(eventRsvps.eventId, parseInt(id)));

    // Get current user's RSVP status if authenticated
    let userStatus = null;
    if (userId) {
      const [userRsvp] = await db
        .select({ status: eventRsvps.status })
        .from(eventRsvps)
        .where(and(eq(eventRsvps.eventId, parseInt(id)), eq(eventRsvps.userId, userId)))
        .limit(1);
      
      userStatus = userRsvp?.status || null;
    }

    res.json({
      success: true,
      data: {
        ...event,
        rsvps,
        userStatus,
        currentAttendees: rsvps.filter(r => r.status === 'going').length
      }
    });
  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch event details' });
  }
});

// Get user's event invitations
router.get('/api/users/me/event-invitations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const status = req.query.status as string;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Build the where condition based on status
    const whereCondition = status && status !== 'all' 
      ? and(
          eq(eventParticipants.userId, userId),
          eq(eventParticipants.status, status)
        )
      : eq(eventParticipants.userId, userId);

    const invitations = await db
      .select({
        id: eventParticipants.id,
        eventId: eventParticipants.eventId,
        userId: eventParticipants.userId,
        role: eventParticipants.role,
        status: eventParticipants.status,
        invitedBy: eventParticipants.invitedBy,
        invitedAt: eventParticipants.invitedAt,
        eventTitle: events.title,
        eventStartDate: events.startDate,
        eventLocation: events.location,
        inviterName: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, ${users.name})`,
      })
      .from(eventParticipants)
      .leftJoin(events, eq(eventParticipants.eventId, events.id))
      .leftJoin(users, eq(eventParticipants.invitedBy, users.id))
      .where(whereCondition)
      .orderBy(desc(eventParticipants.invitedAt));
    
    res.json({ success: true, data: invitations });
  } catch (error) {
    console.error('Error fetching user invitations:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch invitations' });
  }
});

// Get user's events (for sending invitations)
router.get('/api/users/me/events', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const userEvents = await db
      .select({
        id: events.id,
        title: events.title,
        startDate: events.startDate,
        location: events.location,
      })
      .from(events)
      .where(eq(events.userId, userId))
      .orderBy(desc(events.startDate));
    
    res.json({ success: true, data: userEvents });
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch events' });
  }
});

// Send invitation to participant
router.post('/api/events/invite-participant', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { username, eventId, role, message } = req.body;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Find user by username
    const [invitedUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    if (!invitedUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if user owns the event
    const [event] = await db
      .select({ id: events.id, userId: events.userId })
      .from(events)
      .where(eq(events.id, parseInt(eventId)))
      .limit(1);
    
    if (!event || event.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to send invitations for this event' });
    }

    // Check if invitation already exists
    const existing = await db
      .select({ id: eventParticipants.id })
      .from(eventParticipants)
      .where(and(
        eq(eventParticipants.eventId, parseInt(eventId)),
        eq(eventParticipants.userId, invitedUser.id),
        eq(eventParticipants.role, role)
      ))
      .limit(1);
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'Invitation already sent' });
    }

    // Create invitation
    const [invitation] = await db.insert(eventParticipants).values({
      eventId: parseInt(eventId),
      userId: invitedUser.id,
      role,
      status: 'pending',
      invitedBy: userId,
      invitedAt: new Date(),
    }).returning();
    
    res.json({ success: true, data: invitation });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ success: false, error: 'Failed to send invitation' });
  }
});

// Update invitation status
router.put('/api/event-participants/:id/status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const participantId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    // Check if invitation belongs to the user
    const [invitation] = await db
      .select({ id: eventParticipants.id, userId: eventParticipants.userId })
      .from(eventParticipants)
      .where(eq(eventParticipants.id, participantId))
      .limit(1);
    
    if (!invitation || invitation.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this invitation' });
    }

    // Update invitation status
    const [updated] = await db
      .update(eventParticipants)
      .set({
        status,
        respondedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(eventParticipants.id, participantId))
      .returning();
    
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating invitation status:', error);
    res.status(500).json({ success: false, error: 'Failed to update invitation' });
  }
});

// Get event posts with participant filtering
router.get('/api/events/:id/posts', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { filter = 'all', page = '1', limit = '20' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Import posts table
    const { posts } = await import('../../shared/schema');

    if (filter === 'participants') {
      // Get posts by event participants (organizers, musicians, performers, etc.)
      const participantPosts = await db
        .select({
          id: posts.id,
          userId: posts.userId,
          eventId: posts.eventId,
          content: posts.content,
          imageUrl: posts.imageUrl,
          videoUrl: posts.videoUrl,
          mediaEmbeds: posts.mediaEmbeds,
          mentions: posts.mentions,
          location: posts.location,
          visibility: posts.visibility,
          likesCount: posts.likesCount,
          commentsCount: posts.commentsCount,
          createdAt: posts.createdAt,
          user: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImage: users.profileImage
          },
          participantRole: eventParticipants.role
        })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .innerJoin(eventParticipants, and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, posts.userId),
          eq(eventParticipants.status, 'accepted' as any)
        ))
        .where(
          or(
            eq(posts.eventId, eventId),
            sql`${posts.content} LIKE ${'%event:' + eventId + '%'}`
          )
        )
        .orderBy(desc(posts.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      return res.json({ success: true, data: participantPosts });
    } else if (filter === 'guests') {
      // Get posts by non-participants (guests who mentioned event or RSVPed)
      const guestPosts = await db
        .select({
          id: posts.id,
          userId: posts.userId,
          eventId: posts.eventId,
          content: posts.content,
          imageUrl: posts.imageUrl,
          videoUrl: posts.videoUrl,
          mediaEmbeds: posts.mediaEmbeds,
          mentions: posts.mentions,
          location: posts.location,
          visibility: posts.visibility,
          likesCount: posts.likesCount,
          commentsCount: posts.commentsCount,
          createdAt: posts.createdAt,
          user: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImage: users.profileImage
          }
        })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .where(
          and(
            or(
              eq(posts.eventId, eventId),
              sql`${posts.content} LIKE ${'%event:' + eventId + '%'}`
            ),
            // Exclude participants
            sql`NOT EXISTS (
              SELECT 1 FROM ${eventParticipants} 
              WHERE ${eventParticipants.eventId} = ${eventId} 
              AND ${eventParticipants.userId} = ${posts.userId}
              AND ${eventParticipants.status} = 'accepted'
            )`
          )
        )
        .orderBy(desc(posts.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      return res.json({ success: true, data: guestPosts });
    } else {
      // Get all posts related to the event (both participants and guests)
      const allPosts = await db
        .select({
          id: posts.id,
          userId: posts.userId,
          eventId: posts.eventId,
          content: posts.content,
          imageUrl: posts.imageUrl,
          videoUrl: posts.videoUrl,
          mediaEmbeds: posts.mediaEmbeds,
          mentions: posts.mentions,
          location: posts.location,
          visibility: posts.visibility,
          likesCount: posts.likesCount,
          commentsCount: posts.commentsCount,
          createdAt: posts.createdAt,
          user: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImage: users.profileImage
          }
        })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .where(
          or(
            eq(posts.eventId, eventId),
            sql`${posts.content} LIKE ${'%event:' + eventId + '%'}`
          )
        )
        .orderBy(desc(posts.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      return res.json({ success: true, data: allPosts });
    }
  } catch (error) {
    console.error('Error fetching event posts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch event posts' });
  }
});

export default router;