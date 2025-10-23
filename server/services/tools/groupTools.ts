/**
 * GROUP TOOLS - Tango Community Management
 * MB.MD SIMULTANEOUS - Agent #7: Tools Expansion Specialist
 * 
 * 5 Tools for AI to manage Mundo Tango groups/communities:
 * 1. create_group - Create new tango community
 * 2. search_groups - Search groups by city/type
 * 3. join_group - Join a community
 * 4. get_group_members - Get group membership
 * 5. update_group - Modify group settings
 * 
 * Created: October 23, 2025
 */

import { db } from '../../db';
import { groups, groupMembers } from '../../../shared/schema';
import { eq, and, ilike, or } from 'drizzle-orm';

export const groupToolSchemas = {
  create_group: {
    name: 'create_group',
    description: 'Create a new tango community group',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Group name' },
        description: { type: 'string', description: 'Group description' },
        city: { type: 'string', description: 'City location' },
        groupType: {
          type: 'string',
          enum: ['city', 'school', 'organizer', 'interest'],
          description: 'Type of group'
        },
        privacy: {
          type: 'string',
          enum: ['public', 'private'],
          description: 'Group privacy setting'
        }
      },
      required: ['name', 'city', 'groupType']
    }
  },

  search_groups: {
    name: 'search_groups',
    description: 'Search for tango community groups',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search query' },
        city: { type: 'string', description: 'Filter by city' },
        groupType: { type: 'string', description: 'Filter by type' },
        limit: { type: 'number', description: 'Max results (default: 20)' }
      }
    }
  },

  join_group: {
    name: 'join_group',
    description: 'Join a tango community group',
    input_schema: {
      type: 'object' as const,
      properties: {
        groupId: { type: 'number', description: 'Group ID' },
        userId: { type: 'number', description: 'User ID' }
      },
      required: ['groupId', 'userId']
    }
  },

  get_group_members: {
    name: 'get_group_members',
    description: 'Get members of a tango community',
    input_schema: {
      type: 'object' as const,
      properties: {
        groupId: { type: 'number', description: 'Group ID' },
        role: {
          type: 'string',
          enum: ['all', 'admin', 'moderator', 'member'],
          description: 'Filter by role'
        }
      },
      required: ['groupId']
    }
  },

  update_group: {
    name: 'update_group',
    description: 'Update tango group settings',
    input_schema: {
      type: 'object' as const,
      properties: {
        groupId: { type: 'number', description: 'Group ID' },
        updates: {
          type: 'object' as const,
          description: 'Fields to update',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            coverPhoto: { type: 'string' },
            privacy: { type: 'string' }
          }
        }
      },
      required: ['groupId', 'updates']
    }
  }
};

export const groupTools = {
  create_group: async (params: any) => {
    try {
      const [group] = await db.insert(groups).values({
        name: params.name,
        description: params.description || '',
        city: params.city,
        groupType: params.groupType,
        privacy: params.privacy || 'public',
        autoCreated: false,
        memberCount: 0
      }).returning();

      return {
        success: true,
        group,
        message: `Created group: ${group.name}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create group'
      };
    }
  },

  search_groups: async (params: any) => {
    try {
      let query = db.select().from(groups);

      const conditions = [];

      if (params.query) {
        conditions.push(
          or(
            ilike(groups.name, `%${params.query}%`),
            ilike(groups.description, `%${params.query}%`)
          )
        );
      }

      if (params.city) {
        conditions.push(eq(groups.city, params.city));
      }

      if (params.groupType) {
        conditions.push(eq(groups.groupType, params.groupType));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const results = await query.limit(params.limit || 20);

      return {
        success: true,
        groups: results,
        count: results.length
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search groups'
      };
    }
  },

  join_group: async (params: any) => {
    try {
      // Check if already a member
      const existing = await db.select()
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, params.groupId),
            eq(groupMembers.userId, params.userId)
          )
        );

      if (existing.length > 0) {
        return {
          success: false,
          error: 'Already a member of this group'
        };
      }

      await db.insert(groupMembers).values({
        groupId: params.groupId,
        userId: params.userId,
        role: 'member'
      });

      // Update member count
      const [group] = await db.select().from(groups).where(eq(groups.id, params.groupId));
      if (group) {
        await db.update(groups)
          .set({ memberCount: (group.memberCount || 0) + 1 })
          .where(eq(groups.id, params.groupId));
      }

      return {
        success: true,
        message: 'Joined group successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to join group'
      };
    }
  },

  get_group_members: async (params: any) => {
    try {
      let query = db.select()
        .from(groupMembers)
        .where(eq(groupMembers.groupId, params.groupId));

      if (params.role && params.role !== 'all') {
        query = query.where(eq(groupMembers.role, params.role)) as any;
      }

      const members = await query;

      return {
        success: true,
        members,
        count: members.length
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get members'
      };
    }
  },

  update_group: async (params: any) => {
    try {
      const [updated] = await db.update(groups)
        .set(params.updates)
        .where(eq(groups.id, params.groupId))
        .returning();

      if (!updated) {
        return { success: false, error: 'Group not found' };
      }

      return {
        success: true,
        group: updated,
        message: 'Group updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update group'
      };
    }
  }
};
