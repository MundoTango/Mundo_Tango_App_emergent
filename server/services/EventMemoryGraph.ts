/**
 * TRACK 1 (Legacy Task): EventMemoryGraph - "Track who met where"
 * Agent #73 - Social Memory Intelligence
 * 
 * Enables queries: "Who did I meet at event X?"
 * Links: Events → Attendees → Photos → Conversations
 */

import { db } from '../db';
import { eventRsvps, users, events, posts } from '../../shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

interface EventMemory {
  eventId: number;
  eventTitle: string;
  eventDate: string;
  attendees: Array<{
    id: number;
    name: string;
    city?: string;
    occupation?: string;
    isTeacher: boolean;
    connectionStrength?: number; // How many times met
  }>;
  sharedMemories: Array<{
    postId: number;
    userId: number;
    userName: string;
    content: string;
    createdAt: string;
  }>;
}

export class EventMemoryGraph {
  /**
   * Get complete memory graph for an event
   */
  async getEventMemory(eventId: number, userId: number): Promise<EventMemory | null> {
    try {
      console.log(`🧠 [EventMemory] Building memory graph for event ${eventId}, user ${userId}`);

      // Get event details
      const eventData = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      if (!eventData.length) {
        console.warn(`⚠️ [EventMemory] Event ${eventId} not found`);
        return null;
      }

      const event = eventData[0];

      // Get all attendees
      const attendeeRsvps = await db
        .select({
          userId: eventRsvps.userId,
          userName: users.name,
          userCity: users.city,
          userOccupation: users.occupation,
          userIsTeacher: users.isteacher
        })
        .from(eventRsvps)
        .innerJoin(users, eq(users.id, eventRsvps.userId))
        .where(
          and(
            eq(eventRsvps.eventId, eventId),
            eq(eventRsvps.status, 'going')
          )
        );

      // Calculate connection strength (how many times met each person)
      const attendees = await Promise.all(
        attendeeRsvps.map(async (attendee) => {
          const connectionStrength = await this.calculateConnectionStrength(
            userId,
            attendee.userId
          );

          return {
            id: attendee.userId,
            name: attendee.userName,
            city: attendee.userCity || undefined,
            occupation: attendee.userOccupation || undefined,
            isTeacher: attendee.userIsTeacher || false,
            connectionStrength
          };
        })
      );

      // Get shared memories (posts from this event)
      const sharedMemories = await db
        .select({
          postId: posts.id,
          userId: posts.userId,
          userName: users.name,
          content: posts.content,
          createdAt: posts.createdAt
        })
        .from(posts)
        .innerJoin(users, eq(users.id, posts.userId))
        .where(eq(posts.eventId, eventId))
        .limit(50);

      const memory: EventMemory = {
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date || '',
        attendees,
        sharedMemories: sharedMemories.map(m => ({
          postId: m.postId,
          userId: m.userId,
          userName: m.userName,
          content: m.content,
          createdAt: m.createdAt?.toISOString() || ''
        }))
      };

      console.log(`✅ [EventMemory] Memory graph complete: ${attendees.length} attendees, ${sharedMemories.length} memories`);
      return memory;

    } catch (error) {
      console.error(`❌ [EventMemory] Failed to build memory graph:`, error);
      return null;
    }
  }

  /**
   * Calculate connection strength between two users
   */
  private async calculateConnectionStrength(userId1: number, userId2: number): Promise<number> {
    try {
      // Find events both attended
      const user1Events = await db
        .select({ eventId: eventRsvps.eventId })
        .from(eventRsvps)
        .where(
          and(
            eq(eventRsvps.userId, userId1),
            eq(eventRsvps.status, 'going')
          )
        );

      const eventIds = user1Events.map(e => e.eventId);
      
      if (eventIds.length === 0) return 0;

      const sharedEvents = await db
        .select({ eventId: eventRsvps.eventId })
        .from(eventRsvps)
        .where(
          and(
            eq(eventRsvps.userId, userId2),
            eq(eventRsvps.status, 'going'),
            inArray(eventRsvps.eventId, eventIds)
          )
        );

      return sharedEvents.length;

    } catch (error) {
      console.error('❌ [EventMemory] Connection strength calculation failed:', error);
      return 0;
    }
  }

  /**
   * Query: "Who did I meet at event X that is a teacher?"
   */
  async findAttendeesAtEvent(
    eventId: number,
    criteria: {
      isTeacher?: boolean;
      occupation?: string;
      city?: string;
    }
  ): Promise<any[]> {
    try {
      let query = db
        .select({
          userId: users.id,
          userName: users.name,
          userCity: users.city,
          userOccupation: users.occupation,
          userIsTeacher: users.isteacher
        })
        .from(eventRsvps)
        .innerJoin(users, eq(users.id, eventRsvps.userId))
        .where(
          and(
            eq(eventRsvps.eventId, eventId),
            eq(eventRsvps.status, 'going')
          )
        );

      const results = await query;

      // Filter by criteria
      return results.filter(user => {
        if (criteria.isTeacher !== undefined && user.userIsTeacher !== criteria.isTeacher) return false;
        if (criteria.city && user.userCity !== criteria.city) return false;
        if (criteria.occupation && !user.userOccupation?.toLowerCase().includes(criteria.occupation.toLowerCase())) return false;
        return true;
      });

    } catch (error) {
      console.error('❌ [EventMemory] Query failed:', error);
      return [];
    }
  }
}

export const eventMemoryGraph = new EventMemoryGraph();
