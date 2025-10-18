import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { events, eventAdmins, eventRsvps, users } from '../../shared/schema';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { getUserId } from '../utils/authHelper';
import { RRule, Frequency } from 'rrule';
import { emailService } from '../services/emailService';
import { success, successWithPagination, parsePagination } from '../utils/apiResponse';
import { AuthenticationError, ValidationError, NotFoundError } from '../middleware/errorHandler';
import { z } from 'zod';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// Validation schemas
const createRecurringEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().max(5000, 'Description too long').optional(),
  location: z.string().min(1, 'Location is required').max(500, 'Location too long'),
  startDate: z.string().datetime('Invalid start date'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  recurrenceType: z.enum(['daily', 'weekly', 'biweekly', 'monthly'], {
    errorMap: () => ({ message: 'Invalid recurrence type' })
  }),
  recurrenceEndDate: z.string().datetime('Invalid recurrence end date'),
  eventType: z.string().max(50, 'Event type too long'),
  maxAttendees: z.number().int().positive().optional(),
  price: z.number().nonnegative().optional(),
  isEventPage: z.boolean().optional(),
  allowEventPagePosts: z.boolean().optional(),
  eventPageAdmins: z.array(z.number().int().positive()).optional()
});

// Get all events (Phase 11: Updated with standardized response)
router.get('/api/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, pageSize, offset } = parsePagination(req.query);
    
    const [allEvents, [{ count }]] = await Promise.all([
      db.select().from(events).limit(pageSize).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(events)
    ]);
    
    res.json(successWithPagination(allEvents, page, pageSize, Number(count)));
  } catch (error) {
    next(error); // Pass to global error handler
  }
});

// Create recurring events (Phase 11: Updated with Zod validation and auth)
router.post('/api/events/recurring', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    // Security: Validate request body with Zod
    const validated = createRecurringEventSchema.parse(req.body);
    
    // Security: Get userId from authenticated context only
    const replitId = req.user.claims.sub;
    const userResult = await db.select().from(users).where(eq(users.replitId, replitId)).limit(1);
    if (!userResult[0]) throw new AuthenticationError('User not found');
    const userId = userResult[0].id;

    const {
      title,
      description,
      location,
      startDate,
      startTime,
      endTime,
      recurrenceType,
      recurrenceEndDate,
      eventType,
      maxAttendees,
      price,
      isEventPage,
      allowEventPagePosts,
      eventPageAdmins
    } = validated;

    // Create RRule based on recurrence type
    let freq: Frequency;
    let interval = 1;
    
    switch (recurrenceType) {
      case 'daily':
        freq = Frequency.DAILY;
        break;
      case 'weekly':
        freq = Frequency.WEEKLY;
        break;
      case 'biweekly':
        freq = Frequency.WEEKLY;
        interval = 2;
        break;
      case 'monthly':
        freq = Frequency.MONTHLY;
        break;
      default:
        throw new ValidationError('Invalid recurrence type. Must be: daily, weekly, biweekly, or monthly');
    }

    const rule = new RRule({
      freq,
      interval,
      dtstart: new Date(startDate),
      until: new Date(recurrenceEndDate)
    });

    const dates = rule.all();
    const createdEvents = [];

    // Create each event instance
    for (const date of dates) {
      const eventStart = new Date(date);
      const [hours, minutes] = startTime.split(':');
      eventStart.setHours(parseInt(hours), parseInt(minutes));

      const eventEnd = new Date(date);
      const [endHours, endMinutes] = endTime.split(':');
      eventEnd.setHours(parseInt(endHours), parseInt(endMinutes));

      const [event] = await db.insert(events).values({
        title,
        description,
        location,
        startDate: eventStart,
        endDate: eventEnd,
        eventType,
        maxAttendees,
        price,
        userId,
        hasEventPage: isEventPage || false,
        allowEventPagePosts: allowEventPagePosts || false,
        currentAttendees: 0,
        country: userResult[0].country || null,
        city: userResult[0].city || null
      }).returning();

      // Add event owner as admin
      await db.insert(eventAdmins).values({
        eventId: event.id,
        userId: Number(userId),
        role: 'owner',
        permissions: {
          canEditEvent: true,
          canDeleteEvent: true,
          canManageAdmins: true,
          canModerateContent: true,
          canSendNotifications: true
        }
      });

      // Add additional admins if specified
      if (eventPageAdmins && eventPageAdmins.length > 0) {
        for (const adminUserId of eventPageAdmins) {
          await db.insert(eventAdmins).values({
            eventId: event.id,
            userId: adminUserId,
            role: 'admin',
            permissions: {
              canEditEvent: true,
              canDeleteEvent: false,
              canManageAdmins: false,
              canModerateContent: true,
              canSendNotifications: true
            }
          });

          // Send delegation email
          const adminUser = await db.select().from(users).where(eq(users.id, adminUserId)).limit(1);
          if (adminUser[0]) {
            await emailService.sendEventDelegationInvite(event, adminUser[0], 'admin');
          }
        }
      }

      createdEvents.push(event);
    }

    res.json(success({
      eventsCreated: createdEvents.length,
      events: createdEvents 
    }, `Successfully created ${createdEvents.length} recurring events`));
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError(error.errors[0].message));
    } else {
      next(error);
    }
  }
});

// Get event admins
router.get('/api/events/:eventId/admins', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const eventId = parseInt(req.params.eventId);

    // Check if user is event owner
    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event[0] || event[0].userId !== userId) {
      return res.status(403).json({ error: 'Only event owners can view admins' });
    }

    const admins = await db.select({
      id: eventAdmins.id,
      userId: eventAdmins.userId,
      eventId: eventAdmins.eventId,
      role: eventAdmins.role,
      permissions: eventAdmins.permissions,
      addedAt: eventAdmins.addedAt,
      user: {
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage
      }
    })
    .from(eventAdmins)
    .innerJoin(users, eq(users.id, eventAdmins.userId))
    .where(eq(eventAdmins.eventId, eventId));

    res.json(admins);
  } catch (error: any) {
    console.error('Error fetching event admins:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add event admin
router.post('/api/events/:eventId/admins', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const eventId = parseInt(req.params.eventId);
    const { userId: newAdminId, role } = req.body;

    // Check if user is event owner
    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event[0] || event[0].userId !== userId) {
      return res.status(403).json({ error: 'Only event owners can add admins' });
    }

    // Check if admin already exists
    const existingAdmin = await db.select()
      .from(eventAdmins)
      .where(and(
        eq(eventAdmins.eventId, eventId),
        eq(eventAdmins.userId, newAdminId)
      ))
      .limit(1);

    if (existingAdmin[0]) {
      return res.status(400).json({ error: 'User is already an admin for this event' });
    }

    // Add new admin
    const permissions = role === 'admin' ? {
      canEditEvent: true,
      canDeleteEvent: false,
      canManageAdmins: false,
      canModerateContent: true,
      canSendNotifications: true
    } : {
      canEditEvent: false,
      canDeleteEvent: false,
      canManageAdmins: false,
      canModerateContent: true,
      canSendNotifications: false
    };

    const [newAdmin] = await db.insert(eventAdmins).values({
      eventId,
      userId: newAdminId,
      role,
      permissions
    }).returning();

    // Send delegation email
    const adminUser = await db.select().from(users).where(eq(users.id, newAdminId)).limit(1);
    if (adminUser[0]) {
      await emailService.sendEventDelegationInvite(event[0], adminUser[0], role);
    }

    res.json({ success: true, admin: newAdmin });
  } catch (error: any) {
    console.error('Error adding event admin:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove event admin
router.delete('/api/events/:eventId/admins/:adminId', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const eventId = parseInt(req.params.eventId);
    const adminId = parseInt(req.params.adminId);

    // Check if user is event owner
    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event[0] || event[0].userId !== userId) {
      return res.status(403).json({ error: 'Only event owners can remove admins' });
    }

    // Cannot remove owner
    const admin = await db.select().from(eventAdmins).where(eq(eventAdmins.id, adminId)).limit(1);
    if (!admin[0] || admin[0].role === 'owner') {
      return res.status(400).json({ error: 'Cannot remove event owner' });
    }

    await db.delete(eventAdmins).where(eq(eventAdmins.id, adminId));

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error removing event admin:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update admin permissions
router.put('/api/events/:eventId/admins/:adminId/permissions', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const eventId = parseInt(req.params.eventId);
    const adminId = parseInt(req.params.adminId);
    const { permissions } = req.body;

    // Check if user is event owner
    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event[0] || event[0].userId !== userId) {
      return res.status(403).json({ error: 'Only event owners can update permissions' });
    }

    // Cannot update owner permissions
    const admin = await db.select().from(eventAdmins).where(eq(eventAdmins.id, adminId)).limit(1);
    if (!admin[0] || admin[0].role === 'owner') {
      return res.status(400).json({ error: 'Cannot modify owner permissions' });
    }

    await db.update(eventAdmins)
      .set({ permissions })
      .where(eq(eventAdmins.id, adminId));

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating admin permissions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's events
router.get('/api/events/my-events', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const myEvents = await db.select()
      .from(events)
      .where(eq(events.userId, Number(userId)));

    res.json(myEvents);
  } catch (error: any) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;