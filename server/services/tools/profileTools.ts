/**
 * PROFILE TOOLS - Tango-Specific Profile Management
 * MB.MD SIMULTANEOUS - Agent #7: Tools Expansion Specialist
 * 
 * 5 Tools for AI to manage Mundo Tango profiles:
 * 1. get_profile - Get user profile by ID
 * 2. update_profile - Update user profile
 * 3. search_users - Search users by criteria
 * 4. follow_user - Follow another user
 * 5. get_followers - Get user's followers
 * 
 * Created: October 23, 2025
 */

import { db } from '../../db';
import { users, userProfiles, follows } from '../../../shared/schema';
import { eq, and, or, ilike } from 'drizzle-orm';

export const profileToolSchemas = {
  get_profile: {
    name: 'get_profile',
    description: 'Get a tango dancer profile by user ID',
    input_schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', description: 'User ID' }
      },
      required: ['userId']
    }
  },

  update_profile: {
    name: 'update_profile',
    description: 'Update tango dancer profile information',
    input_schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', description: 'User ID' },
        updates: {
          type: 'object',
          description: 'Profile fields to update',
          properties: {
            bio: { type: 'string' },
            tangoRoles: { type: 'array', items: { type: 'string' } },
            leaderLevel: { type: 'number' },
            followerLevel: { type: 'number' },
            yearsOfDancing: { type: 'number' },
            city: { type: 'string' },
            country: { type: 'string' }
          }
        }
      },
      required: ['userId', 'updates']
    }
  },

  search_users: {
    name: 'search_users',
    description: 'Search for tango dancers by name, city, or dance level',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query (name or username)' },
        city: { type: 'string', description: 'Filter by city' },
        country: { type: 'string', description: 'Filter by country' },
        minLeaderLevel: { type: 'number', description: 'Minimum leader level (1-10)' },
        minFollowerLevel: { type: 'number', description: 'Minimum follower level (1-10)' },
        limit: { type: 'number', description: 'Max results (default: 20)' }
      }
    }
  },

  follow_user: {
    name: 'follow_user',
    description: 'Follow another tango dancer',
    input_schema: {
      type: 'object',
      properties: {
        followerId: { type: 'number', description: 'User ID who is following' },
        followingId: { type: 'number', description: 'User ID to follow' }
      },
      required: ['followerId', 'followingId']
    }
  },

  get_followers: {
    name: 'get_followers',
    description: 'Get list of users following a tango dancer',
    input_schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', description: 'User ID' },
        type: { 
          type: 'string',
          enum: ['followers', 'following'],
          description: 'Get followers or following'
        }
      },
      required: ['userId']
    }
  }
};

export const profileTools = {
  get_profile: async (params: any) => {
    try {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, params.userId));

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      return {
        success: true,
        profile: {
          id: user.id,
          name: user.name,
          username: user.username,
          bio: user.bio,
          city: user.city,
          country: user.country,
          tangoRoles: user.tangoRoles,
          leaderLevel: user.leaderLevel,
          followerLevel: user.followerLevel,
          yearsOfDancing: user.yearsOfDancing,
          profileImage: user.profileImage
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get profile'
      };
    }
  },

  update_profile: async (params: any) => {
    try {
      const [updated] = await db.update(users)
        .set(params.updates)
        .where(eq(users.id, params.userId))
        .returning();

      if (!updated) {
        return { success: false, error: 'User not found' };
      }

      return {
        success: true,
        profile: updated,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile'
      };
    }
  },

  search_users: async (params: any) => {
    try {
      let query = db.select().from(users);

      const conditions = [];

      if (params.query) {
        conditions.push(
          or(
            ilike(users.name, `%${params.query}%`),
            ilike(users.username, `%${params.query}%`)
          )
        );
      }

      if (params.city) {
        conditions.push(eq(users.city, params.city));
      }

      if (params.country) {
        conditions.push(eq(users.country, params.country));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const results = await query.limit(params.limit || 20);

      return {
        success: true,
        users: results,
        count: results.length
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search users'
      };
    }
  },

  follow_user: async (params: any) => {
    try {
      // Check if already following
      const existing = await db.select()
        .from(follows)
        .where(
          and(
            eq(follows.followerId, params.followerId),
            eq(follows.followingId, params.followingId)
          )
        );

      if (existing.length > 0) {
        return {
          success: false,
          error: 'Already following this user'
        };
      }

      await db.insert(follows).values({
        followerId: params.followerId,
        followingId: params.followingId
      });

      return {
        success: true,
        message: 'Now following user'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to follow user'
      };
    }
  },

  get_followers: async (params: any) => {
    try {
      const type = params.type || 'followers';

      let query;
      if (type === 'followers') {
        // Get users who follow this user
        query = db.select({
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage
        })
        .from(follows)
        .innerJoin(users, eq(follows.followerId, users.id))
        .where(eq(follows.followingId, params.userId));
      } else {
        // Get users this user follows
        query = db.select({
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage
        })
        .from(follows)
        .innerJoin(users, eq(follows.followingId, users.id))
        .where(eq(follows.followerId, params.userId));
      }

      const results = await query;

      return {
        success: true,
        users: results,
        count: results.length
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get followers'
      };
    }
  }
};
