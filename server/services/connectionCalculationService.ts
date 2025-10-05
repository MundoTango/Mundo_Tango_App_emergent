import { db } from '../db';
import { friends, friendshipActivities, posts, events, eventRsvps, guestBookings } from '@shared/schema';
import { eq, and, sql, or, inArray } from 'drizzle-orm';

/**
 * ESA LIFE CEO 61x21 - Layer 24: Social Features
 * Connection Calculation Service
 * 
 * Calculates connection degrees (1st, 2nd, 3rd) using BFS graph traversal
 * Calculates closeness scores (0-100) based on engagement metrics
 */

export interface ConnectionInfo {
  connectionDegree: number | null; // null if no connection
  closenessScore: number;
  mutualFriends: number;
  sharedMemories: number;
  sharedEvents: number;
  lastInteraction: Date | null;
  interactionCount: number;
}

export class ConnectionCalculationService {
  /**
   * Calculate connection degree between two users using BFS
   * Returns degree (1, 2, 3) or null if no connection within 3 degrees
   */
  async calculateConnectionDegree(userId: number, targetUserId: number): Promise<number | null> {
    if (userId === targetUserId) return 0;

    // Use BFS to find shortest path (connection degree)
    const visited = new Set<number>([userId]);
    const queue: { id: number; degree: number }[] = [{ id: userId, degree: 0 }];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.degree >= 3) {
        // Stop at 3rd degree
        break;
      }

      // Get all accepted friends of current user
      const friendships = await db
        .select()
        .from(friends)
        .where(
          and(
            or(
              eq(friends.userId, current.id),
              eq(friends.friendId, current.id)
            ),
            eq(friends.status, 'accepted')
          )
        );

      for (const friendship of friendships) {
        const friendId = friendship.userId === current.id 
          ? friendship.friendId 
          : friendship.userId;

        if (friendId === targetUserId) {
          return current.degree + 1;
        }

        if (!visited.has(friendId)) {
          visited.add(friendId);
          queue.push({ id: friendId, degree: current.degree + 1 });
        }
      }
    }

    return null; // No connection within 3 degrees
  }

  /**
   * Calculate closeness score (0-100) based on engagement metrics
   * Factors:
   * - Recent interactions (temporal decay)
   * - Shared memories (posts with co-tags)
   * - Shared events (attended together)
   * - Direct messages
   * - Reaction frequency
   */
  async calculateClosenessScore(userId: number, friendId: number): Promise<number> {
    // Get friendship record
    const friendship = await db
      .select()
      .from(friends)
      .where(
        or(
          and(eq(friends.userId, userId), eq(friends.friendId, friendId)),
          and(eq(friends.userId, friendId), eq(friends.friendId, userId))
        )
      )
      .limit(1);

    if (friendship.length === 0) {
      return 0; // No friendship
    }

    const friendshipRecord = friendship[0];
    const friendshipId = friendshipRecord.id;

    // Get all activities for this friendship
    const activities = await db
      .select()
      .from(friendshipActivities)
      .where(eq(friendshipActivities.friendshipId, friendshipId));

    // Calculate base score from activity points
    const totalPoints = activities.reduce((sum, activity) => sum + (activity.points || 1), 0);

    // Apply temporal decay (recent activities worth more)
    const now = Date.now();
    const decayedPoints = activities.reduce((sum, activity) => {
      const ageInDays = (now - activity.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      const decayFactor = Math.exp(-ageInDays / 30); // 30-day half-life
      return sum + (activity.points || 1) * decayFactor;
    }, 0);

    // Get truly shared memories: posts where both users interacted or commented
    // For now, use friendship activities as proxy for shared engagement
    // This is more accurate than counting all posts from both users
    const sharedActivityCount = activities.filter(a => 
      ['post_tag', 'comment', 'like', 'event_together'].includes(a.activityType)
    ).length;
    
    const sharedMemories = { length: Math.min(sharedActivityCount, 50) };

    // Get shared events (both RSVPed)
    const userEvents = await db
      .select({ eventId: eventRsvps.eventId })
      .from(eventRsvps)
      .where(
        and(
          eq(eventRsvps.userId, userId),
          inArray(eventRsvps.status, ['going', 'maybe'])
        )
      );

    const friendEvents = await db
      .select({ eventId: eventRsvps.eventId })
      .from(eventRsvps)
      .where(
        and(
          eq(eventRsvps.userId, friendId),
          inArray(eventRsvps.status, ['going', 'maybe'])
        )
      );

    const userEventIds = new Set(userEvents.map(e => e.eventId));
    const sharedEventCount = friendEvents.filter(e => userEventIds.has(e.eventId)).length;

    // Calculate final score (0-100)
    const activityScore = Math.min(50, decayedPoints * 2); // Max 50 points from activities
    const memoryScore = Math.min(25, sharedMemories.length * 5); // Max 25 points from memories
    const eventScore = Math.min(25, sharedEventCount * 5); // Max 25 points from events

    const finalScore = Math.round(activityScore + memoryScore + eventScore);

    return Math.min(100, finalScore);
  }

  /**
   * Get full connection info between two users
   */
  async getConnectionInfo(userId: number, targetUserId: number): Promise<ConnectionInfo> {
    const [degree, closenessScore] = await Promise.all([
      this.calculateConnectionDegree(userId, targetUserId),
      this.calculateClosenessScore(userId, targetUserId)
    ]);

    // Get mutual friends
    const userFriends = await this.getFriendIds(userId);
    const targetFriends = await this.getFriendIds(targetUserId);
    const mutualFriends = userFriends.filter(id => targetFriends.includes(id)).length;

    // Get truly shared memories from friendship activities
    const friendship = await db
      .select()
      .from(friends)
      .where(
        or(
          and(eq(friends.userId, userId), eq(friends.friendId, targetUserId)),
          and(eq(friends.userId, targetUserId), eq(friends.friendId, userId))
        )
      )
      .limit(1);

    let sharedMemoryCount = 0;
    if (friendship.length > 0) {
      const activities = await db
        .select()
        .from(friendshipActivities)
        .where(eq(friendshipActivities.friendshipId, friendship[0].id));
      
      // Count activities that represent shared experiences
      sharedMemoryCount = activities.filter(a => 
        ['post_tag', 'comment', 'like', 'event_together', 'message'].includes(a.activityType)
      ).length;
    }

    const sharedMemories = { length: sharedMemoryCount };

    // Get shared events
    const userEvents = await db
      .select({ eventId: eventRsvps.eventId })
      .from(eventRsvps)
      .where(eq(eventRsvps.userId, userId));

    const targetEvents = await db
      .select({ eventId: eventRsvps.eventId })
      .from(eventRsvps)
      .where(eq(eventRsvps.userId, targetUserId));

    const userEventIds = new Set(userEvents.map(e => e.eventId));
    const sharedEvents = targetEvents.filter(e => userEventIds.has(e.eventId)).length;

    // Get interaction stats from friendship record (reuse from above)
    const friendshipRecord = friendship.length > 0 ? friendship[0] : null;

    const interactionCount = friendshipRecord?.interactionCount || 0;
    const lastInteraction = friendshipRecord?.lastInteractionAt || null;

    return {
      connectionDegree: degree,
      closenessScore,
      mutualFriends,
      sharedMemories: sharedMemories.length,
      sharedEvents,
      lastInteraction,
      interactionCount
    };
  }

  /**
   * Check if a user can book a property based on connection restrictions
   */
  async canUserBook(userId: number, hostId: number, whoCanBook: string, minimumClosenessScore: number): Promise<{ canBook: boolean; reason?: string; connectionInfo: ConnectionInfo }> {
    const connectionInfo = await this.getConnectionInfo(userId, hostId);

    // Host cannot book their own property
    if (userId === hostId) {
      return {
        canBook: false,
        reason: 'You cannot book your own property.',
        connectionInfo
      };
    }

    // Check based on whoCanBook setting
    switch (whoCanBook) {
      case 'anyone':
        return { canBook: true, connectionInfo };

      case 'friends_only':
        // Requires exactly 1st degree connection (direct friends)
        if (connectionInfo.connectionDegree !== 1) {
          return {
            canBook: false,
            reason: 'This property is only available to direct friends (1st degree connections). Send a friend request to the host first.',
            connectionInfo
          };
        }
        return { canBook: true, connectionInfo };

      case '1st_degree':
        if (connectionInfo.connectionDegree !== 1) {
          return {
            canBook: false,
            reason: 'This property is only available to 1st degree connections (direct friends).',
            connectionInfo
          };
        }
        return { canBook: true, connectionInfo };

      case '2nd_degree':
        if (!connectionInfo.connectionDegree || connectionInfo.connectionDegree > 2) {
          return {
            canBook: false,
            reason: 'This property is only available to 1st and 2nd degree connections (friends and friends-of-friends).',
            connectionInfo
          };
        }
        return { canBook: true, connectionInfo };

      case '3rd_degree':
        if (!connectionInfo.connectionDegree || connectionInfo.connectionDegree > 3) {
          return {
            canBook: false,
            reason: 'This property is only available to connected users within 3 degrees.',
            connectionInfo
          };
        }
        return { canBook: true, connectionInfo };

      case 'custom_closeness':
        if (connectionInfo.closenessScore < minimumClosenessScore) {
          return {
            canBook: false,
            reason: `This property requires a closeness score of at least ${minimumClosenessScore}. Your current score is ${connectionInfo.closenessScore}. Build a stronger connection through shared experiences!`,
            connectionInfo
          };
        }
        return { canBook: true, connectionInfo };

      default:
        return { canBook: true, connectionInfo };
    }
  }

  /**
   * Helper: Get all friend IDs for a user
   */
  private async getFriendIds(userId: number): Promise<number[]> {
    const friendships = await db
      .select()
      .from(friends)
      .where(
        and(
          or(
            eq(friends.userId, userId),
            eq(friends.friendId, userId)
          ),
          eq(friends.status, 'accepted')
        )
      );

    return friendships.map(f => 
      f.userId === userId ? f.friendId : f.userId
    );
  }

  /**
   * Update connection degree and closeness score in friends table
   */
  async updateConnectionMetrics(userId: number, friendId: number): Promise<void> {
    const [degree, closenessScore] = await Promise.all([
      this.calculateConnectionDegree(userId, friendId),
      this.calculateClosenessScore(userId, friendId)
    ]);

    // Update friendship record
    await db
      .update(friends)
      .set({
        connectionDegree: degree,
        closenessScore,
        updatedAt: new Date()
      })
      .where(
        or(
          and(eq(friends.userId, userId), eq(friends.friendId, friendId)),
          and(eq(friends.userId, friendId), eq(friends.friendId, userId))
        )
      );
  }

  /**
   * Log an interaction between friends to update closeness score
   */
  async logInteraction(userId: number, friendId: number, activityType: string, activityData: any = {}, points: number = 1): Promise<void> {
    // Get or create friendship
    const friendship = await db
      .select()
      .from(friends)
      .where(
        or(
          and(eq(friends.userId, userId), eq(friends.friendId, friendId)),
          and(eq(friends.userId, friendId), eq(friends.friendId, userId))
        )
      )
      .limit(1);

    if (friendship.length === 0) {
      return; // No friendship exists
    }

    const friendshipId = friendship[0].id;

    // Log the activity
    await db.insert(friendshipActivities).values({
      friendshipId,
      activityType,
      activityData,
      points
    });

    // Update interaction count and last interaction
    await db
      .update(friends)
      .set({
        interactionCount: sql`${friends.interactionCount} + 1`,
        lastInteractionAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(friends.id, friendshipId));

    // Recalculate closeness score
    await this.updateConnectionMetrics(userId, friendId);
  }
}

export const connectionService = new ConnectionCalculationService();
