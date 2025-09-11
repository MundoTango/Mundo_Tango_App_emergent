import { Router, Request, Response } from 'express';
import { db } from '../db';
import { 
  events, 
  eventRsvps, 
  eventWaitlist, 
  eventCheckIns, 
  users,
  eventAdmins 
} from '../../shared/schema';
import { eq, and, sql, desc, count, inArray } from 'drizzle-orm';
import { getUserId } from '../utils/authHelper';
import { io } from '../socket';
import { SOCKET_EVENTS } from '../../shared/socketEvents';
import type { 
  CreateEventRequest,
  RSVPRequest,
  WaitlistRequest,
  CheckInRequest,
  ApiResponse,
  EventAnalytics
} from '../../shared/apiTypes';

const router = Router();

// Get upcoming events with enhanced filtering
router.get('/api/events/upcoming', async (req: Request, res: Response) => {
  try {
    const { 
      limit = 20, 
      offset = 0, 
      eventType, 
      level, 
      city, 
      startDate, 
      endDate,
      hasWaitlist,
      allowCheckIn
    } = req.query;

    let query = db.select({
      id: events.id,
      title: events.title,
      description: events.description,
      imageUrl: events.imageUrl,
      location: events.location,
      startDate: events.startDate,
      endDate: events.endDate,
      maxAttendees: events.maxAttendees,
      currentAttendees: events.currentAttendees,
      eventType: events.eventType,
      level: events.level,
      price: events.price,
      currency: events.currency,
      isPublic: events.isPublic,
      userId: events.userId,
      createdAt: events.createdAt,
      // Join user info
      organizer: {
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage
      }
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .where(eq(events.isPublic, true))
    .orderBy(desc(events.startDate))
    .limit(Number(limit))
    .offset(Number(offset));

    // Add filters
    const conditions = [eq(events.isPublic, true)];
    
    if (eventType) {
      conditions.push(eq(events.eventType, eventType as string));
    }
    
    if (level) {
      conditions.push(eq(events.level, level as string));
    }

    if (city) {
      conditions.push(eq(events.city, city as string));
    }

    if (startDate) {
      conditions.push(sql`${events.startDate} >= ${new Date(startDate as string)}`);
    }

    if (endDate) {
      conditions.push(sql`${events.startDate} <= ${new Date(endDate as string)}`);
    }

    const eventsList = await query;

    // Add waitlist and check-in info for each event
    const eventsWithExtras = await Promise.all(eventsList.map(async (event) => {
      // Get waitlist count
      const [waitlistCount] = await db
        .select({ count: count() })
        .from(eventWaitlist)
        .where(eq(eventWaitlist.eventId, event.id));

      // Get RSVP counts
      const rsvpCounts = await db
        .select({
          status: eventRsvps.status,
          count: count()
        })
        .from(eventRsvps)
        .where(eq(eventRsvps.eventId, event.id))
        .groupBy(eventRsvps.status);

      return {
        ...event,
        waitlistCount: waitlistCount.count,
        rsvpBreakdown: rsvpCounts.reduce((acc, { status, count }) => {
          acc[status] = count;
          return acc;
        }, {} as Record<string, number>)
      };
    }));

    const response: ApiResponse = {
      success: true,
      data: eventsWithExtras
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch events'
    });
  }
});

// Enhanced RSVP endpoint with waitlist support
router.post('/api/events/:eventId/rsvp', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const eventId = parseInt(req.params.eventId);
    const { status }: RSVPRequest = req.body;

    // Get event details
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // Check if event is at capacity and user is trying to RSVP as "going"
    const isAtCapacity = event.maxAttendees && event.currentAttendees >= event.maxAttendees;
    
    if (status === 'going' && isAtCapacity) {
      // Add to waitlist instead
      const [existingWaitlist] = await db
        .select()
        .from(eventWaitlist)
        .where(and(
          eq(eventWaitlist.eventId, eventId),
          eq(eventWaitlist.userId, userId)
        ))
        .limit(1);

      if (!existingWaitlist) {
        // Get current waitlist position
        const [{ count: waitlistCount }] = await db
          .select({ count: count() })
          .from(eventWaitlist)
          .where(eq(eventWaitlist.eventId, eventId));

        await db.insert(eventWaitlist).values({
          eventId,
          userId,
          position: waitlistCount + 1,
          joinedAt: new Date().toISOString(),
          notificationsSent: false
        });

        // Emit socket event
        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        io.to(`event:${eventId}`).emit(SOCKET_EVENTS.EVENT_WAITLIST, {
          eventId,
          userId,
          username: user?.name || 'Unknown',
          action: 'joined',
          waitlistPosition: waitlistCount + 1
        });

        return res.json({
          success: true,
          data: { 
            addedToWaitlist: true, 
            position: waitlistCount + 1 
          }
        });
      }

      return res.json({
        success: true,
        data: { alreadyOnWaitlist: true }
      });
    }

    // Handle normal RSVP
    const existingRsvp = await db
      .select()
      .from(eventRsvps)
      .where(and(
        eq(eventRsvps.eventId, eventId),
        eq(eventRsvps.userId, userId)
      ))
      .limit(1);

    if (existingRsvp.length > 0) {
      // Update existing RSVP
      await db
        .update(eventRsvps)
        .set({ status, updatedAt: new Date() })
        .where(and(
          eq(eventRsvps.eventId, eventId),
          eq(eventRsvps.userId, userId)
        ));
    } else {
      // Create new RSVP
      await db.insert(eventRsvps).values({
        eventId,
        userId,
        status,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Update event attendee count if status is 'going'
    if (status === 'going') {
      await db
        .update(events)
        .set({ 
          currentAttendees: sql`${events.currentAttendees} + 1` 
        })
        .where(eq(events.id, eventId));
    }

    // Get user info for socket event
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    // Emit socket event
    io.to(`event:${eventId}`).emit(SOCKET_EVENTS.EVENT_RSVP, {
      eventId,
      userId,
      username: user?.name || 'Unknown',
      status,
      profileImage: user?.profileImage
    });

    res.json({ success: true, data: { status } });
  } catch (error: any) {
    console.error('Error handling RSVP:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update RSVP'
    });
  }
});

// Waitlist management
router.post('/api/events/:eventId/waitlist', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const eventId = parseInt(req.params.eventId);
    const { action }: WaitlistRequest = req.body;

    if (action === 'join') {
      // Check if already on waitlist
      const [existing] = await db
        .select()
        .from(eventWaitlist)
        .where(and(
          eq(eventWaitlist.eventId, eventId),
          eq(eventWaitlist.userId, userId)
        ))
        .limit(1);

      if (existing) {
        return res.json({ success: true, data: { alreadyOnWaitlist: true } });
      }

      // Get current waitlist count for position
      const [{ count: waitlistCount }] = await db
        .select({ count: count() })
        .from(eventWaitlist)
        .where(eq(eventWaitlist.eventId, eventId));

      await db.insert(eventWaitlist).values({
        eventId,
        userId,
        position: waitlistCount + 1,
        joinedAt: new Date().toISOString(),
        notificationsSent: false
      });

      // Emit socket event
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      io.to(`event:${eventId}`).emit(SOCKET_EVENTS.EVENT_WAITLIST, {
        eventId,
        userId,
        username: user?.name || 'Unknown',
        action: 'joined',
        waitlistPosition: waitlistCount + 1
      });

      res.json({ 
        success: true, 
        data: { position: waitlistCount + 1 } 
      });
    } else if (action === 'leave') {
      await db
        .delete(eventWaitlist)
        .where(and(
          eq(eventWaitlist.eventId, eventId),
          eq(eventWaitlist.userId, userId)
        ));

      // Emit socket event
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      io.to(`event:${eventId}`).emit(SOCKET_EVENTS.EVENT_WAITLIST, {
        eventId,
        userId,
        username: user?.name || 'Unknown',
        action: 'left'
      });

      res.json({ success: true, data: { leftWaitlist: true } });
    }
  } catch (error: any) {
    console.error('Error managing waitlist:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to manage waitlist'
    });
  }
});

// Check-in system
router.post('/api/events/:eventId/checkin', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const eventId = parseInt(req.params.eventId);
    const { role, notes }: CheckInRequest = req.body;

    // Check if user is authorized (event owner, admin, or self check-in)
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // Check if already checked in
    const [existing] = await db
      .select()
      .from(eventCheckIns)
      .where(and(
        eq(eventCheckIns.eventId, eventId),
        eq(eventCheckIns.userId, userId)
      ))
      .limit(1);

    if (existing) {
      return res.json({ 
        success: true, 
        data: { alreadyCheckedIn: true, checkInTime: existing.checkInTime } 
      });
    }

    // Create check-in record
    const checkInTime = new Date().toISOString();
    await db.insert(eventCheckIns).values({
      eventId,
      userId,
      checkInTime,
      role: role || null,
      notes: notes || null
    });

    // Get user info for socket event
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    // Emit socket event
    io.to(`event:${eventId}`).emit(SOCKET_EVENTS.EVENT_CHECKIN, {
      eventId,
      userId,
      username: user?.name || 'Unknown',
      checkInTime,
      role
    });

    res.json({ 
      success: true, 
      data: { checkInTime, role } 
    });
  } catch (error: any) {
    console.error('Error handling check-in:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check in'
    });
  }
});

// Get event analytics (for organizers)
router.get('/api/events/:eventId/analytics', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const eventId = parseInt(req.params.eventId);

    // Verify user is event owner or admin
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const isOwner = event.userId === userId;
    const [adminRecord] = await db
      .select()
      .from(eventAdmins)
      .where(and(
        eq(eventAdmins.eventId, eventId),
        eq(eventAdmins.userId, userId)
      ))
      .limit(1);

    if (!isOwner && !adminRecord) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Get RSVP breakdown
    const rsvpBreakdown = await db
      .select({
        status: eventRsvps.status,
        count: count()
      })
      .from(eventRsvps)
      .where(eq(eventRsvps.eventId, eventId))
      .groupBy(eventRsvps.status);

    // Get waitlist count
    const [waitlistResult] = await db
      .select({ count: count() })
      .from(eventWaitlist)
      .where(eq(eventWaitlist.eventId, eventId));

    // Get check-in count
    const [checkInResult] = await db
      .select({ count: count() })
      .from(eventCheckIns)
      .where(eq(eventCheckIns.eventId, eventId));

    const analytics: EventAnalytics = {
      eventId,
      totalViews: 0, // TODO: Implement view tracking
      rsvpBreakdown: rsvpBreakdown.reduce((acc, { status, count }) => {
        acc[status] = count;
        return acc;
      }, { going: 0, interested: 0, maybe: 0, notGoing: 0 }),
      waitlistCount: waitlistResult.count,
      checkInCount: checkInResult.count,
      noShowCount: 0, // TODO: Calculate no-shows
      popularTimes: [], // TODO: Implement time tracking
      attendanceRate: 0, // TODO: Calculate attendance rate
      conversionRate: 0 // TODO: Calculate conversion rate
    };

    res.json({ success: true, data: analytics });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch analytics'
    });
  }
});

export default router;