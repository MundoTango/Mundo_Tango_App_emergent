/**
 * ESA LIFE CEO 61×21 - Posts API Contract Tests
 * Testing all /api/posts/* endpoints including AI enhancement
 */

import request from 'supertest';
import { z } from 'zod';
import {
  API_BASE_URL,
  TEST_USERS,
  PERF_THRESHOLDS,
  validateResponseTime,
  validateSchema,
  createAuthenticatedRequest,
  ErrorResponseSchema,
  SuccessResponseSchema,
  PaginatedResponseSchema,
  TestUtils
} from './test-setup';

// Schema definitions for posts
const PostSchema = z.object({
  id: z.number(),
  content: z.string(),
  userId: z.number(),
  likesCount: z.number().default(0),
  commentsCount: z.number().default(0),
  sharesCount: z.number().default(0),
  mediaUrls: z.array(z.string()).optional(),
  imageUrl: z.string().nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  visibility: z.enum(['public', 'private', 'friends']).default('public'),
  createdAt: z.string().datetime().or(z.date()),
  user: z.object({
    id: z.number(),
    name: z.string(),
    username: z.string(),
    profileImage: z.string().nullable().optional()
  }).optional()
});

const EnhancedContentSchema = z.object({
  success: z.literal(true),
  enhancedContent: z.string(),
  suggestions: z.array(z.string()).optional(),
  hashtags: z.array(z.string()).optional(),
  aiMetrics: z.object({
    clarity: z.number(),
    engagement: z.number(),
    sentiment: z.string()
  }).optional()
});

describe('Posts API Contract Tests', () => {
  let testPostId: number;

  describe('POST /api/posts', () => {
    it('should create a new post', async () => {
      const startTime = Date.now();
      const authRequest = await createAuthenticatedRequest('user');
      const postData = TestUtils.generateTestPost();

      const response = await authRequest
        .post('/api/posts')
        .send(postData)
        .expect(201);

      validateResponseTime(startTime, PERF_THRESHOLDS.WRITE);
      validateSchema(response.body.post || response.body, PostSchema);

      testPostId = response.body.post?.id || response.body.id;
      expect(response.body.success || response.body.id).toBeTruthy();
    });

    it('should create post with media upload', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      
      const response = await authRequest
        .post('/api/posts')
        .field('content', 'Post with media')
        .field('visibility', 'public')
        .attach('media', Buffer.from('test image data'), 'test.jpg')
        .expect(201);

      const post = response.body.post || response.body;
      expect(post.mediaUrls?.length).toBeGreaterThan(0);
    });

    it('should reject post without content', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      
      const response = await authRequest
        .post('/api/posts')
        .send({
          visibility: 'public'
        })
        .expect(422);

      validateSchema(response.body, ErrorResponseSchema);
      expect(response.body.error || response.body.message).toContain('content');
    });

    it('should enforce content length limits', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      const longContent = 'a'.repeat(5001); // Assuming 5000 char limit
      
      const response = await authRequest
        .post('/api/posts')
        .send({
          content: longContent
        })
        .expect(422);

      validateSchema(response.body, ErrorResponseSchema);
    });
  });

  describe('GET /api/posts', () => {
    it('should retrieve posts feed', async () => {
      const startTime = Date.now();
      const authRequest = await createAuthenticatedRequest('user');
      
      const response = await authRequest
        .get('/api/posts')
        .query({ limit: 20, offset: 0 })
        .expect(200);

      validateResponseTime(startTime, PERF_THRESHOLDS.READ);
      validateSchema(response.body, PaginatedResponseSchema);

      const posts = response.body.data;
      expect(Array.isArray(posts)).toBe(true);
      if (posts.length > 0) {
        validateSchema(posts[0], PostSchema);
      }
    });

    it('should support pagination', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      
      // Get first page
      const page1 = await authRequest
        .get('/api/posts')
        .query({ limit: 5, offset: 0 })
        .expect(200);

      // Get second page
      const page2 = await authRequest
        .get('/api/posts')
        .query({ limit: 5, offset: 5 })
        .expect(200);

      // Ensure different content
      if (page1.body.data.length > 0 && page2.body.data.length > 0) {
        expect(page1.body.data[0].id).not.toBe(page2.body.data[0].id);
      }
    });

    it('should filter posts by visibility', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      
      const response = await authRequest
        .get('/api/posts')
        .query({ visibility: 'public' })
        .expect(200);

      const posts = response.body.data;
      posts.forEach((post: any) => {
        expect(post.visibility).toBe('public');
      });
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should retrieve a specific post', async () => {
      const startTime = Date.now();
      const authRequest = await createAuthenticatedRequest('user');
      
      const response = await authRequest
        .get(`/api/posts/${testPostId}`)
        .expect(200);

      validateResponseTime(startTime, PERF_THRESHOLDS.READ);
      validateSchema(response.body.post || response.body, PostSchema);
      
      const post = response.body.post || response.body;
      expect(post.id).toBe(testPostId);
    });

    it('should return 404 for non-existent post', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      
      const response = await authRequest
        .get('/api/posts/999999')
        .expect(404);

      validateSchema(response.body, ErrorResponseSchema);
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should update own post', async () => {
      const startTime = Date.now();
      const authRequest = await createAuthenticatedRequest('user');
      
      const response = await authRequest
        .put(`/api/posts/${testPostId}`)
        .send({
          content: 'Updated post content'
        })
        .expect(200);

      validateResponseTime(startTime, PERF_THRESHOLDS.WRITE);
      expect(response.body.success).toBe(true);
    });

    it('should reject updating another user\'s post', async () => {
      const authRequest = await createAuthenticatedRequest('moderator');
      
      const response = await authRequest
        .put(`/api/posts/${testPostId}`)
        .send({
          content: 'Trying to update'
        })
        .expect(403);

      validateSchema(response.body, ErrorResponseSchema);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete own post', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      
      // Create a post to delete
      const createResponse = await authRequest
        .post('/api/posts')
        .send(TestUtils.generateTestPost())
        .expect(201);

      const postId = createResponse.body.post?.id || createResponse.body.id;

      // Delete the post
      const deleteResponse = await authRequest
        .delete(`/api/posts/${postId}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // Verify deletion
      await authRequest
        .get(`/api/posts/${postId}`)
        .expect(404);
    });

    it('should reject deleting another user\'s post', async () => {
      const authRequest = await createAuthenticatedRequest('moderator');
      
      const response = await authRequest
        .delete(`/api/posts/${testPostId}`)
        .expect(403);

      validateSchema(response.body, ErrorResponseSchema);
    });
  });

  describe('POST /api/posts/:id/like', () => {
    it('should like a post', async () => {
      const startTime = Date.now();
      const authRequest = await createAuthenticatedRequest('user');
      
      const response = await authRequest
        .post(`/api/posts/${testPostId}/like`)
        .expect(200);

      validateResponseTime(startTime, PERF_THRESHOLDS.WRITE);
      expect(response.body.success).toBe(true);
      expect(response.body.likesCount).toBeGreaterThan(0);
    });

    it('should toggle like on second request', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      
      // Like
      const likeResponse = await authRequest
        .post(`/api/posts/${testPostId}/like`)
        .expect(200);

      const initialCount = likeResponse.body.likesCount;

      // Unlike
      const unlikeResponse = await authRequest
        .post(`/api/posts/${testPostId}/like`)
        .expect(200);

      expect(unlikeResponse.body.likesCount).toBe(initialCount - 1);
    });
  });

  describe('POST /api/posts/:id/comment', () => {
    let commentId: number;

    it('should add a comment to post', async () => {
      const startTime = Date.now();
      const authRequest = await createAuthenticatedRequest('user');
      
      const response = await authRequest
        .post(`/api/posts/${testPostId}/comment`)
        .send({
          content: 'Test comment'
        })
        .expect(201);

      validateResponseTime(startTime, PERF_THRESHOLDS.WRITE);
      expect(response.body.success).toBe(true);
      expect(response.body.comment.content).toBe('Test comment');
      
      commentId = response.body.comment.id;
    });

    it('should reject empty comment', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      
      const response = await authRequest
        .post(`/api/posts/${testPostId}/comment`)
        .send({
          content: ''
        })
        .expect(422);

      validateSchema(response.body, ErrorResponseSchema);
    });
  });

  describe('POST /api/posts/enhance-content', () => {
    it('should enhance post content with AI', async () => {
      const startTime = Date.now();
      const authRequest = await createAuthenticatedRequest('user');
      
      const response = await authRequest
        .post('/api/posts/enhance-content')
        .send({
          content: 'Having a great time at the milonga tonight'
        })
        .expect(200);

      validateResponseTime(startTime, PERF_THRESHOLDS.AGENT); // AI processing
      validateSchema(response.body, EnhancedContentSchema);
      
      expect(response.body.enhancedContent).toBeTruthy();
      expect(response.body.enhancedContent.length).toBeGreaterThan(0);
    });

    it('should handle AI service unavailability gracefully', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      
      // Send multiple requests to potentially trigger rate limit
      const promises = Array(5).fill(null).map(() => 
        authRequest
          .post('/api/posts/enhance-content')
          .send({ content: 'Test content' })
      );

      const responses = await Promise.all(promises);
      
      // At least one should succeed or fail gracefully
      responses.forEach(response => {
        expect([200, 429, 503].includes(response.status)).toBe(true);
      });
    });
  });

  describe('GET /api/posts/direct', () => {
    it('should retrieve direct/private posts', async () => {
      const startTime = Date.now();
      const authRequest = await createAuthenticatedRequest('user');
      
      const response = await authRequest
        .get('/api/posts/direct')
        .expect(200);

      validateResponseTime(startTime, PERF_THRESHOLDS.READ);
      validateSchema(response.body, PaginatedResponseSchema);
      
      const posts = response.body.data;
      posts.forEach((post: any) => {
        expect(['private', 'direct'].includes(post.visibility)).toBe(true);
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent post creation', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      const concurrentRequests = 10;
      
      const startTime = Date.now();
      const promises = Array(concurrentRequests).fill(null).map(() =>
        authRequest
          .post('/api/posts')
          .send(TestUtils.generateTestPost())
      );

      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(PERF_THRESHOLDS.WRITE * 5);
    });

    it('should retrieve large feed efficiently', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      const startTime = Date.now();
      
      const response = await authRequest
        .get('/api/posts')
        .query({ limit: 100 })
        .expect(200);

      const responseTime = validateResponseTime(startTime, PERF_THRESHOLDS.READ * 2);
      
      // Even large queries should be fast
      expect(responseTime).toBeLessThan(200);
    });
  });

  describe('Security Tests', () => {
    it('should sanitize HTML in post content', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      
      const response = await authRequest
        .post('/api/posts')
        .send({
          content: '<script>alert("XSS")</script>Normal text'
        })
        .expect(201);

      const post = response.body.post || response.body;
      expect(post.content).not.toContain('<script>');
      expect(post.content).toContain('Normal text');
    });

    it('should prevent path traversal in media uploads', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      
      const response = await authRequest
        .post('/api/posts')
        .field('content', 'Test post')
        .attach('media', Buffer.from('test'), '../../../etc/passwd')
        .expect([201, 422]);

      if (response.status === 201) {
        const post = response.body.post || response.body;
        // Ensure the file wasn't saved with path traversal
        post.mediaUrls?.forEach((url: string) => {
          expect(url).not.toContain('..');
        });
      }
    });
  });
});

export { PostSchema, EnhancedContentSchema };