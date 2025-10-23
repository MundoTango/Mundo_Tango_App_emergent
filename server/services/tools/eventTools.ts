/**
 * EVENT TOOLS - Tango-Specific Event Management
 * MB.MD SIMULTANEOUS - Agent #7: Tools Expansion Specialist
 * 
 * 5 Tools for AI to manage Mundo Tango events:
 * 1. create_event - Create new tango event
 * 2. search_events - Search events by criteria
 * 3. rsvp_event - RSVP to an event
 * 4. get_event_details - Get full event information
 * 5. update_event - Modify existing event
 * 
 * Created: October 23, 2025
 */

import { db } from '../../db';
import { events, eventRsvps } from '../../../shared/schema';
import { eq, and, gte, lte, ilike, or } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Tool schemas for Claude function calling
 */
export const eventToolSchemas = {
  create_event: {
    name: 'create_event',
    description: 'Create a new tango event (milonga, practica, workshop, or festival)',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'Event title' },
        description: { type: 'string', description: 'Event description' },
        eventType: { 
          type: 'string', 
          enum: ['milonga', 'practica', 'workshop', 'festival', 'concert', 'social'],
          description: 'Type of tango event'
        },
        startDate: { type: 'string', description: 'Start time (ISO 8601)' },
        endDate: { type: 'string', description: 'End time (ISO 8601)' },
        location: { type: 'string', description: 'Event location/venue' },
        city: { type: 'string', description: 'City name' },
        price: { type: 'number', description: 'Entry price (optional)' },
        capacity: { type: 'number', description: 'Maximum attendees (optional)' }
      },
      required: ['title', 'eventType', 'startDate', 'location', 'city']
    }
  },

  search_events: {
    name: 'search_events',
    description: 'Search for tango events by type, city, date range, or keywords',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search keywords (optional)' },
        city: { type: 'string', description: 'Filter by city (optional)' },
        eventType: { type: 'string', description: 'Filter by event type (optional)' },
        startDate: { type: 'string', description: 'Start of date range (ISO 8601, optional)' },
        endDate: { type: 'string', description: 'End of date range (ISO 8601, optional)' },
        limit: { type: 'number', description: 'Max results (default: 20)' }
      }
    }
  },

  rsvp_event: {
    name: 'rsvp_event',
    description: 'RSVP to a tango event',
    input_schema: {
      type: 'object' as const,
      properties: {
        eventId: { type: 'number', description: 'Event ID' },
        userId: { type: 'number', description: 'User ID' },
        status: { 
          type: 'string',
          enum: ['going', 'maybe', 'not_going'],
          description: 'RSVP status'
        }
      },
      required: ['eventId', 'userId', 'status']
    }
  },

  get_event_details: {
    name: 'get_event_details',
    description: 'Get full details of a specific tango event',
    input_schema: {
      type: 'object' as const,
      properties: {
        eventId: { type: 'number', description: 'Event ID' }
      },
      required: ['eventId']
    }
  },

  update_event: {
    name: 'update_event',
    description: 'Update an existing tango event',
    input_schema: {
      type: 'object' as const,
      properties: {
        eventId: { type: 'number', description: 'Event ID' },
        updates: {
          type: 'object' as const,
          description: 'Fields to update',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            startDate: { type: 'string' },
            endDate: { type: 'string' },
            location: { type: 'string' },
            price: { type: 'number' }
          }
        }
      },
      required: ['eventId', 'updates']
    }
  }
};

/**
 * Tool implementations
 */
export const eventTools = {
  create_event: async (params: any) => {
    try {
      const [event] = await db.insert(events).values({
        title: params.title,
        description: params.description || '',
        eventType: params.eventType,
        startDate: new Date(params.startDate),
        endDate: params.endDate ? new Date(params.endDate) : null,
        location: params.location,
        city: params.city,
        price: params.price || null,
        capacity: params.capacity || null,
        organizerId: params.organizerId || 1, // TODO: Get from context
        visibility: 'public',
        status: 'published'
      }).returning();

      return {
        success: true,
        event,
        message: `Created event: ${event.title}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create event'
      };
    }
  },

  search_events: async (params: any) => {
    try {
      let query = db.select().from(events);

      const conditions = [];

      // Filter by city
      if (params.city) {
        conditions.push(eq(events.city, params.city));
      }

      // Filter by event type
      if (params.eventType) {
        conditions.push(eq(events.eventType, params.eventType));
      }

      // Filter by date range
      if (params.startDate) {
        conditions.push(gte(events.startDate, new Date(params.startDate)));
      }
      if (params.endDate) {
        conditions.push(lte(events.startDate, new Date(params.endDate)));
      }

      // Search by keywords
      if (params.query) {
        conditions.push(
          or(
            ilike(events.title, `%${params.query}%`),
            ilike(events.description, `%${params.query}%`)
          )
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const results = await query.limit(params.limit || 20);

      return {
        success: true,
        events: results,
        count: results.length
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search events'
      };
    }
  },

  rsvp_event: async (params: any) => {
    try {
      // Check if RSVP already exists
      const existing = await db.select()
        .from(eventRsvps)
        .where(
          and(
            eq(eventRsvps.eventId, params.eventId),
            eq(eventRsvps.userId, params.userId)
          )
        );

      if (existing.length > 0) {
        // Update existing RSVP
        await db.update(eventRsvps)
          .set({ status: params.status })
          .where(eq(eventRsvps.id, existing[0].id));

        return {
          success: true,
          message: `Updated RSVP to "${params.status}"`
        };
      } else {
        // Create new RSVP
        await db.insert(eventRsvps).values({
          eventId: params.eventId,
          userId: params.userId,
          status: params.status
        });

        return {
          success: true,
          message: `RSVP'd "${params.status}" to event`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to RSVP'
      };
    }
  },

  get_event_details: async (params: any) => {
    try {
      const [event] = await db.select()
        .from(events)
        .where(eq(events.id, params.eventId));

      if (!event) {
        return {
          success: false,
          error: 'Event not found'
        };
      }

      // Get RSVP count
      const rsvps = await db.select()
        .from(eventRsvps)
        .where(eq(eventRsvps.eventId, params.eventId));

      return {
        success: true,
        event,
        rsvpCount: rsvps.length,
        goingCount: rsvps.filter(r => r.status === 'going').length
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get event details'
      };
    }
  },

  update_event: async (params: any) => {
    try {
      const [updated] = await db.update(events)
        .set(params.updates)
        .where(eq(events.id, params.eventId))
        .returning();

      if (!updated) {
        return {
          success: false,
          error: 'Event not found'
        };
      }

      return {
        success: true,
        event: updated,
        message: 'Event updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update event'
      };
    }
  }
};
