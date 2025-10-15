/**
 * USER CONTEXT SERVICE - Mr Blue Intelligence Layer
 * 
 * MB.MD Architecture:
 * - Aggregates ALL user data for contextual AI conversations
 * - Friends, events, connections, memories
 * - Enables Mr Blue to answer: "who are my friends?", "events today?", etc.
 * 
 * Performance: <500ms context loading
 */

import { db } from '../db';
import { users, friends, events, eventRsvps, posts } from '../../shared/schema';
import { eq, and, or, gte, desc, sql } from 'drizzle-orm';

export interface UserContext {
  profile: {
    id: number;
    name: string;
    email: string;
    city?: string;
    occupation?: string;
    tangoRoles?: string[];
  };
  friends: Array<{
    id: number;
    name: string;
    city?: string;
    occupation?: string;
    closenessScore?: number;
    isteacher?: boolean;
  }>;
  events: {
    attended: Array<{
      id: number;
      title: string;
      date: string;
      location?: string;
    }>;
    upcoming: Array<{
      id: number;
      title: string;
      date: string;
      location?: string;
    }>;
  };
  memories: {
    count: number;
    recent: Array<{
      id: number;
      content: string;
      createdAt: string;
    }>;
  };
  connections: {
    teachers: Array<{
      id: number;
      name: string;
      city?: string;
      occupation?: string;
    }>;
    byCity: Map<string, number>;
  };
}

export class UserContextService {
  /**
   * Aggregate complete user context for AI conversations
   */
  async getUserContext(userId: number): Promise<UserContext> {
    const startTime = Date.now();
    console.log(`🧠 [UserContext] Aggregating context for user ${userId}`);

    try {
      // Execute all queries in parallel for performance
      const [
        userProfile,
        userFriends,
        attendedEvents,
        upcomingEvents,
        userMemories
      ] = await Promise.all([
        this.getUserProfile(userId),
        this.getUserFriends(userId),
        this.getAttendedEvents(userId),
        this.getUpcomingEvents(userId),
        this.getUserMemories(userId)
      ]);

      // Process connections data
      const teachers = userFriends.filter(f => f.isteacher);
      const byCity = new Map<string, number>();
      userFriends.forEach(friend => {
        if (friend.city) {
          byCity.set(friend.city, (byCity.get(friend.city) || 0) + 1);
        }
      });

      const context: UserContext = {
        profile: userProfile,
        friends: userFriends,
        events: {
          attended: attendedEvents,
          upcoming: upcomingEvents
        },
        memories: {
          count: userMemories.length,
          recent: userMemories.slice(0, 5)
        },
        connections: {
          teachers,
          byCity
        }
      };

      const duration = Date.now() - startTime;
      console.log(`✅ [UserContext] Context aggregated in ${duration}ms:`, {
        friends: userFriends.length,
        eventsAttended: attendedEvents.length,
        eventsUpcoming: upcomingEvents.length,
        memories: userMemories.length,
        teachers: teachers.length,
        cities: byCity.size
      });

      return context;

    } catch (error) {
      console.error('❌ [UserContext] Error aggregating context:', error);
      throw error;
    }
  }

  /**
   * Get user profile data
   */
  private async getUserProfile(userId: number) {
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        city: users.city,
        occupation: users.occupation,
        tangoRoles: users.tangoRoles
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user.length) {
      throw new Error(`User ${userId} not found`);
    }

    return user[0];
  }

  /**
   * Get user's friends with details
   */
  private async getUserFriends(userId: number) {
    const friendsList = await db
      .select({
        id: users.id,
        name: users.name,
        city: users.city,
        occupation: users.occupation,
        isteacher: users.isteacher,
        closenessScore: friends.closenessScore
      })
      .from(friends)
      .innerJoin(users, eq(users.id, friends.friendId))
      .where(
        and(
          eq(friends.userId, userId),
          eq(friends.status, 'accepted')
        )
      )
      .orderBy(desc(friends.closenessScore));

    return friendsList;
  }

  /**
   * Get events user attended (past events)
   */
  private async getAttendedEvents(userId: number) {
    const now = new Date();
    
    const attended = await db
      .select({
        id: events.id,
        title: events.title,
        date: events.date,
        location: events.location
      })
      .from(events)
      .innerJoin(eventRsvps, eq(eventRsvps.eventId, events.id))
      .where(
        and(
          eq(eventRsvps.userId, userId),
          eq(eventRsvps.status, 'going'),
          sql`${events.startDate} < ${now}`
        )
      )
      .orderBy(desc(events.startDate))
      .limit(20);

    return attended.map(e => ({
      id: e.id,
      title: e.title,
      date: e.date || '',
      location: e.location || undefined
    }));
  }

  /**
   * Get upcoming events user is attending
   */
  private async getUpcomingEvents(userId: number) {
    const now = new Date();
    
    const upcoming = await db
      .select({
        id: events.id,
        title: events.title,
        date: events.date,
        location: events.location
      })
      .from(events)
      .innerJoin(eventRsvps, eq(eventRsvps.eventId, events.id))
      .where(
        and(
          eq(eventRsvps.userId, userId),
          eq(eventRsvps.status, 'going'),
          gte(events.startDate, now)
        )
      )
      .orderBy(events.startDate)
      .limit(20);

    return upcoming.map(e => ({
      id: e.id,
      title: e.title,
      date: e.date || '',
      location: e.location || undefined
    }));
  }

  /**
   * Get user's memories/posts
   */
  private async getUserMemories(userId: number) {
    const memories = await db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt
      })
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(10);

    return memories.map(m => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt?.toISOString() || ''
    }));
  }

  /**
   * Search users by criteria (for complex queries)
   */
  async searchUsers(criteria: {
    occupation?: string;
    city?: string;
    isTeacher?: boolean;
    tangoRole?: string;
  }): Promise<any[]> {
    let query = db.select({
      id: users.id,
      name: users.name,
      city: users.city,
      occupation: users.occupation,
      isteacher: users.isteacher,
      tangoRoles: users.tangoRoles
    }).from(users);

    const conditions: any[] = [];

    if (criteria.occupation) {
      conditions.push(sql`LOWER(${users.occupation}) LIKE LOWER(${'%' + criteria.occupation + '%'})`);
    }

    if (criteria.city) {
      conditions.push(eq(users.city, criteria.city));
    }

    if (criteria.isTeacher !== undefined) {
      conditions.push(eq(users.isteacher, criteria.isTeacher));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query.limit(50);
    return results;
  }
}

export const userContextService = new UserContextService();
