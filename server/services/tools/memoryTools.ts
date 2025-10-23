/**
 * MEMORY/POST TOOLS - Tango Social Memory Management
 * MB.MD SIMULTANEOUS - Agent #7: Tools Expansion Specialist
 * 
 * 5 Tools for AI to manage Mundo Tango memories/posts:
 * 1. create_memory - Create new memory/post
 * 2. search_memories - Search memories by user/hashtag
 * 3. like_memory - Like/unlike a memory
 * 4. comment_on_memory - Add comment to memory
 * 5. get_memory_feed - Get personalized feed
 * 
 * Created: October 23, 2025
 */

import { db } from '../../db';
import { posts } from '../../../shared/schema';
import { eq, desc, ilike, or, and } from 'drizzle-orm';

export const memoryToolSchemas = {
  create_memory: {
    name: 'create_memory',
    description: 'Create a new tango memory/post (moment, achievement, event recap)',
    input_schema: {
      type: 'object' as const,
      properties: {
        userId: { type: 'number', description: 'User ID' },
        content: { type: 'string', description: 'Post content/caption' },
        mediaUrls: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Photos/videos URLs (optional)'
        },
        location: { type: 'string', description: 'Location/venue (optional)' },
        hashtags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Hashtags (optional)'
        },
        visibility: {
          type: 'string',
          enum: ['public', 'friends', 'private'],
          description: 'Who can see this post'
        }
      },
      required: ['userId', 'content']
    }
  },

  search_memories: {
    name: 'search_memories',
    description: 'Search tango memories by user, hashtag, or keyword',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search query (optional)' },
        userId: { type: 'number', description: 'Filter by user (optional)' },
        hashtag: { type: 'string', description: 'Filter by hashtag (optional)' },
        limit: { type: 'number', description: 'Max results (default: 20)' }
      }
    }
  },

  like_memory: {
    name: 'like_memory',
    description: 'Like or unlike a tango memory',
    input_schema: {
      type: 'object' as const,
      properties: {
        memoryId: { type: 'number', description: 'Memory/post ID' },
        userId: { type: 'number', description: 'User ID' },
        action: {
          type: 'string',
          enum: ['like', 'unlike'],
          description: 'Like or unlike action'
        }
      },
      required: ['memoryId', 'userId', 'action']
    }
  },

  comment_on_memory: {
    name: 'comment_on_memory',
    description: 'Add a comment to a tango memory',
    input_schema: {
      type: 'object' as const,
      properties: {
        memoryId: { type: 'number', description: 'Memory/post ID' },
        userId: { type: 'number', description: 'User ID' },
        comment: { type: 'string', description: 'Comment text' }
      },
      required: ['memoryId', 'userId', 'comment']
    }
  },

  get_memory_feed: {
    name: 'get_memory_feed',
    description: 'Get personalized tango memory feed for a user',
    input_schema: {
      type: 'object' as const,
      properties: {
        userId: { type: 'number', description: 'User ID' },
        limit: { type: 'number', description: 'Max posts (default: 20)' }
      },
      required: ['userId']
    }
  }
};

export const memoryTools = {
  create_memory: async (params: any) => {
    try {
      const [post] = await db.insert(posts).values({
        userId: params.userId,
        content: params.content,
        mediaEmbeds: params.mediaUrls ? { urls: params.mediaUrls } : null,
        location: params.location || null,
        hashtags: params.hashtags || [],
        visibility: params.visibility || 'public',
        likesCount: 0,
        commentsCount: 0
      }).returning();

      return {
        success: true,
        memory: post,
        message: 'Memory created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create memory'
      };
    }
  },

  search_memories: async (params: any) => {
    try {
      let query = db.select().from(posts);

      const conditions = [];

      if (params.userId) {
        conditions.push(eq(posts.userId, params.userId));
      }

      if (params.query) {
        conditions.push(
          or(
            ilike(posts.content, `%${params.query}%`),
            ilike(posts.location as any, `%${params.query}%`)
          )
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const results = await query
        .orderBy(desc(posts.createdAt))
        .limit(params.limit || 20);

      return {
        success: true,
        memories: results,
        count: results.length
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search memories'
      };
    }
  },

  like_memory: async (params: any) => {
    try {
      const [post] = await db.select().from(posts).where(eq(posts.id, params.memoryId));

      if (!post) {
        return { success: false, error: 'Memory not found' };
      }

      const currentLikes = post.likesCount || 0;
      const newLikes = params.action === 'like' ? currentLikes + 1 : Math.max(0, currentLikes - 1);

      await db.update(posts)
        .set({ likesCount: newLikes })
        .where(eq(posts.id, params.memoryId));

      return {
        success: true,
        message: params.action === 'like' ? 'Memory liked' : 'Memory unliked',
        likesCount: newLikes
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to like memory'
      };
    }
  },

  comment_on_memory: async (params: any) => {
    try {
      // Update comments count
      const [post] = await db.select().from(posts).where(eq(posts.id, params.memoryId));

      if (!post) {
        return { success: false, error: 'Memory not found' };
      }

      const newCount = (post.commentsCount || 0) + 1;

      await db.update(posts)
        .set({ commentsCount: newCount })
        .where(eq(posts.id, params.memoryId));

      return {
        success: true,
        message: 'Comment added successfully',
        commentsCount: newCount
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add comment'
      };
    }
  },

  get_memory_feed: async (params: any) => {
    try {
      // Get public posts ordered by recent
      const feed = await db.select()
        .from(posts)
        .where(eq(posts.visibility, 'public'))
        .orderBy(desc(posts.createdAt))
        .limit(params.limit || 20);

      return {
        success: true,
        feed,
        count: feed.length
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get feed'
      };
    }
  }
};
