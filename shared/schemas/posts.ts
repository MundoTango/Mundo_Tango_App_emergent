import { z } from 'zod';

// User schema for posts - ESA LIFE CEO 61×21 Layer 22 (Group Management)
export const PostUserSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  profileImage: z.string().nullable().optional(),
  // ESA Framework Layer 22: Friendship data for "See Friendship" button
  friendshipStatus: z.enum(['accepted', 'pending', 'blocked', 'none']).nullable().optional(),
  connectionType: z.string().nullable().optional(),
  // Additional user fields from backend
  tangoRoles: z.array(z.string()).nullable().optional(),
  leaderLevel: z.string().nullable().optional(),
  followerLevel: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional()
}).nullable();

// Media schema for posts
export const PostMediaSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  url: z.string().nullable().optional(),
  type: z.enum(['image', 'video']).optional(),
  thumbnail: z.string().nullable().optional()
});

// Single post schema
export const PostSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  content: z.string(),
  user: PostUserSchema,
  images: z.array(PostMediaSchema).nullable().optional(),
  media: z.array(PostMediaSchema).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  location: z.string().nullable().optional(),
  likesCount: z.number().default(0),
  commentsCount: z.number().default(0),
  sharesCount: z.number().default(0),
  isLiked: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string().nullable().optional(),
  visibility: z.enum(['public', 'private', 'friends']).default('public')
});

// Posts feed response schema
export const PostsFeedResponseSchema = z.object({
  posts: z.array(PostSchema).default([]),
  hasMore: z.boolean().default(false),
  total: z.number().default(0),
  page: z.number().default(1)
});

// Alternative response format (array of posts)
export const PostsArrayResponseSchema = z.array(PostSchema);

// Flexible posts response that handles both formats
export const FlexiblePostsResponseSchema = z.union([
  PostsFeedResponseSchema,
  z.object({
    data: z.array(PostSchema),
    meta: z.object({
      hasMore: z.boolean(),
      total: z.number(),
      page: z.number()
    }).optional()
  }),
  PostsArrayResponseSchema
]);

// Transform helper to normalize different response formats
export function normalizePostsResponse(data: unknown): { posts: z.infer<typeof PostSchema>[], hasMore: boolean, total: number } {
  // Try to parse as structured response first
  const structuredResult = PostsFeedResponseSchema.safeParse(data);
  if (structuredResult.success) {
    return structuredResult.data;
  }

  // Try array format
  const arrayResult = PostsArrayResponseSchema.safeParse(data);
  if (arrayResult.success) {
    return {
      posts: arrayResult.data,
      hasMore: arrayResult.data.length >= 20, // Assume more if full page
      total: arrayResult.data.length
    };
  }

  // Try data/meta format
  if (typeof data === 'object' && data !== null && 'data' in data) {
    const dataObj = data as any;
    const postsResult = PostsArrayResponseSchema.safeParse(dataObj.data);
    if (postsResult.success) {
      return {
        posts: postsResult.data,
        hasMore: dataObj.meta?.hasMore ?? postsResult.data.length >= 20,
        total: dataObj.meta?.total ?? postsResult.data.length
      };
    }
  }

  // Fallback to empty
  return { posts: [], hasMore: false, total: 0 };
}

// Type exports
export type Post = z.infer<typeof PostSchema>;
export type PostUser = z.infer<typeof PostUserSchema>;
export type PostMedia = z.infer<typeof PostMediaSchema>;
export type PostsFeedResponse = z.infer<typeof PostsFeedResponseSchema>;