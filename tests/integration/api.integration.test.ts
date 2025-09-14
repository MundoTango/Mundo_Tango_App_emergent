/**
 * ESA LIFE CEO 61x21 - API Integration Tests
 * Testing API endpoints with Supertest
 */

import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { app } from '@server/index';
import { db } from '@server/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Test data
const testUser = {
  email: 'api.test@example.com',
  password: 'TestPass123!',
  name: 'API Test User',
  username: 'apitestuser'
};

let authToken: string;
let userId: string;

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Setup test database
    await db.migrate.latest();
    
    // Create test user
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...testUser,
        password: hashedPassword
      })
      .returning();
    
    userId = user.id;
    authToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
  });

  afterAll(async () => {
    // Cleanup test data
    await db.delete(users).where(eq(users.id, userId));
    await db.destroy();
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user', async () => {
        const newUser = {
          email: 'new.user@example.com',
          password: 'NewPass123!',
          name: 'New User',
          username: 'newuser123'
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(newUser)
          .expect(201);

        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('token');
        expect(response.body.user.email).toBe(newUser.email);
        expect(response.body.user.username).toBe(newUser.username);
      });

      it('should reject duplicate email', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send(testUser)
          .expect(409);

        expect(response.body.error).toContain('already exists');
      });

      it('should validate email format', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            ...testUser,
            email: 'invalid-email'
          })
          .expect(400);

        expect(response.body.error).toContain('Invalid email');
      });

      it('should enforce password requirements', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            ...testUser,
            password: '123'
          })
          .expect(400);

        expect(response.body.error).toContain('Password must');
      });
    });

    describe('POST /api/auth/login', () => {
      it('should login with valid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password
          })
          .expect(200);

        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('token');
        expect(response.body.user.email).toBe(testUser.email);
      });

      it('should reject invalid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: 'wrongpassword'
          })
          .expect(401);

        expect(response.body.error).toContain('Invalid credentials');
      });

      it('should handle rate limiting', async () => {
        // Make multiple rapid requests
        const promises = [];
        for (let i = 0; i < 10; i++) {
          promises.push(
            request(app)
              .post('/api/auth/login')
              .send({
                email: testUser.email,
                password: 'wrong'
              })
          );
        }

        const responses = await Promise.all(promises);
        const rateLimited = responses.filter(r => r.status === 429);
        
        expect(rateLimited.length).toBeGreaterThan(0);
      });
    });

    describe('POST /api/auth/logout', () => {
      it('should logout authenticated user', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.message).toContain('Logged out');
      });

      it('should reject unauthenticated logout', async () => {
        await request(app)
          .post('/api/auth/logout')
          .expect(401);
      });
    });
  });

  describe('User Endpoints', () => {
    describe('GET /api/users/profile', () => {
      it('should get authenticated user profile', async () => {
        const response = await request(app)
          .get('/api/users/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.email).toBe(testUser.email);
        expect(response.body.username).toBe(testUser.username);
        expect(response.body).not.toHaveProperty('password');
      });

      it('should reject unauthenticated request', async () => {
        await request(app)
          .get('/api/users/profile')
          .expect(401);
      });
    });

    describe('PATCH /api/users/profile', () => {
      it('should update user profile', async () => {
        const updates = {
          bio: 'Updated bio',
          location: 'Buenos Aires'
        };

        const response = await request(app)
          .patch('/api/users/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .send(updates)
          .expect(200);

        expect(response.body.bio).toBe(updates.bio);
        expect(response.body.location).toBe(updates.location);
      });

      it('should validate update fields', async () => {
        const response = await request(app)
          .patch('/api/users/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            email: 'newemail' // Invalid email format
          })
          .expect(400);

        expect(response.body.error).toContain('Invalid');
      });
    });

    describe('GET /api/users/:id', () => {
      it('should get user by ID', async () => {
        const response = await request(app)
          .get(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.id).toBe(userId);
        expect(response.body.username).toBe(testUser.username);
      });

      it('should return 404 for non-existent user', async () => {
        const response = await request(app)
          .get('/api/users/nonexistent-id')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(response.body.error).toContain('not found');
      });
    });
  });

  describe('Posts/Memories Endpoints', () => {
    let postId: string;

    describe('POST /api/posts', () => {
      it('should create a new post', async () => {
        const newPost = {
          content: 'Test post content',
          privacy: 'public',
          tags: ['test', 'api']
        };

        const response = await request(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(newPost)
          .expect(201);

        postId = response.body.id;
        expect(response.body.content).toBe(newPost.content);
        expect(response.body.userId).toBe(userId);
      });

      it('should validate post content', async () => {
        const response = await request(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            content: '' // Empty content
          })
          .expect(400);

        expect(response.body.error).toContain('Content required');
      });
    });

    describe('GET /api/posts', () => {
      it('should get posts with pagination', async () => {
        const response = await request(app)
          .get('/api/posts')
          .query({ page: 1, limit: 10 })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('posts');
        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('page');
        expect(response.body.posts).toBeInstanceOf(Array);
      });

      it('should filter posts by user', async () => {
        const response = await request(app)
          .get('/api/posts')
          .query({ userId })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        response.body.posts.forEach(post => {
          expect(post.userId).toBe(userId);
        });
      });
    });

    describe('PUT /api/posts/:id', () => {
      it('should update own post', async () => {
        const updates = {
          content: 'Updated content'
        };

        const response = await request(app)
          .put(`/api/posts/${postId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updates)
          .expect(200);

        expect(response.body.content).toBe(updates.content);
      });

      it('should not update other user post', async () => {
        // Create another user's post
        const otherPostId = 'other-post-id';
        
        await request(app)
          .put(`/api/posts/${otherPostId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ content: 'Hacked!' })
          .expect(403);
      });
    });

    describe('DELETE /api/posts/:id', () => {
      it('should delete own post', async () => {
        await request(app)
          .delete(`/api/posts/${postId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(204);

        // Verify deletion
        await request(app)
          .get(`/api/posts/${postId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });
    });
  });

  describe('Events Endpoints', () => {
    let eventId: string;

    describe('POST /api/events', () => {
      it('should create a new event', async () => {
        const newEvent = {
          title: 'Test Event',
          description: 'Test event description',
          date: new Date('2025-12-01'),
          location: 'Buenos Aires',
          capacity: 50
        };

        const response = await request(app)
          .post('/api/events')
          .set('Authorization', `Bearer ${authToken}`)
          .send(newEvent)
          .expect(201);

        eventId = response.body.id;
        expect(response.body.title).toBe(newEvent.title);
        expect(response.body.hostId).toBe(userId);
      });
    });

    describe('GET /api/events', () => {
      it('should get upcoming events', async () => {
        const response = await request(app)
          .get('/api/events')
          .query({ upcoming: true })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.events).toBeInstanceOf(Array);
        
        // Verify events are in future
        response.body.events.forEach(event => {
          expect(new Date(event.date)).toBeGreaterThan(new Date());
        });
      });

      it('should filter events by location', async () => {
        const response = await request(app)
          .get('/api/events')
          .query({ location: 'Buenos Aires' })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        response.body.events.forEach(event => {
          expect(event.location).toContain('Buenos Aires');
        });
      });
    });

    describe('POST /api/events/:id/rsvp', () => {
      it('should RSVP to event', async () => {
        const response = await request(app)
          .post(`/api/events/${eventId}/rsvp`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ status: 'going' })
          .expect(200);

        expect(response.body.status).toBe('going');
        expect(response.body.userId).toBe(userId);
        expect(response.body.eventId).toBe(eventId);
      });

      it('should handle capacity limits', async () => {
        // Create event with capacity 1
        const [limitedEvent] = await db
          .insert(events)
          .values({
            title: 'Limited Event',
            capacity: 1,
            hostId: userId
          })
          .returning();

        // First RSVP should succeed
        await request(app)
          .post(`/api/events/${limitedEvent.id}/rsvp`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ status: 'going' })
          .expect(200);

        // Second RSVP should fail
        const response = await request(app)
          .post(`/api/events/${limitedEvent.id}/rsvp`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ status: 'going' })
          .expect(400);

        expect(response.body.error).toContain('capacity');
      });
    });
  });

  describe('AI Agent Endpoints', () => {
    describe('POST /api/ai/chat', () => {
      it('should chat with AI agent', async () => {
        const response = await request(app)
          .post('/api/ai/chat')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            agentId: 'health-advisor',
            message: 'I need help with my fitness routine'
          })
          .expect(200);

        expect(response.body).toHaveProperty('response');
        expect(response.body).toHaveProperty('agentId');
        expect(response.body.agentId).toBe('health-advisor');
      });

      it('should maintain conversation context', async () => {
        // First message
        await request(app)
          .post('/api/ai/chat')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            agentId: 'career-coach',
            message: 'I want to change careers'
          })
          .expect(200);

        // Second message with context
        const response = await request(app)
          .post('/api/ai/chat')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            agentId: 'career-coach',
            message: 'What skills do I need?'
          })
          .expect(200);

        expect(response.body.hasContext).toBe(true);
      });
    });

    describe('GET /api/ai/agents', () => {
      it('should list all available agents', async () => {
        const response = await request(app)
          .get('/api/ai/agents')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.agents).toHaveLength(16);
        expect(response.body.agents[0]).toHaveProperty('id');
        expect(response.body.agents[0]).toHaveProperty('name');
        expect(response.body.agents[0]).toHaveProperty('category');
      });
    });
  });

  describe('WebSocket Endpoints', () => {
    describe('Socket.IO Connection', () => {
      it('should establish WebSocket connection', async () => {
        const io = require('socket.io-client');
        const socket = io('http://localhost:5000', {
          auth: {
            token: authToken
          }
        });

        await new Promise<void>((resolve) => {
          socket.on('connect', () => {
            expect(socket.connected).toBe(true);
            socket.disconnect();
            resolve();
          });
        });
      });

      it('should receive real-time messages', async () => {
        const io = require('socket.io-client');
        const socket = io('http://localhost:5000', {
          auth: {
            token: authToken
          }
        });

        await new Promise<void>((resolve) => {
          socket.on('message', (data) => {
            expect(data).toHaveProperty('content');
            expect(data).toHaveProperty('timestamp');
            socket.disconnect();
            resolve();
          });

          // Trigger a message
          socket.emit('send-message', {
            content: 'Test message',
            recipientId: 'test-recipient'
          });
        });
      });
    });
  });

  describe('File Upload Endpoints', () => {
    describe('POST /api/upload', () => {
      it('should upload an image', async () => {
        const response = await request(app)
          .post('/api/upload')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', './tests/fixtures/test-image.jpg')
          .expect(200);

        expect(response.body).toHaveProperty('url');
        expect(response.body).toHaveProperty('filename');
        expect(response.body).toHaveProperty('size');
      });

      it('should validate file types', async () => {
        const response = await request(app)
          .post('/api/upload')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', './tests/fixtures/test.exe')
          .expect(400);

        expect(response.body.error).toContain('Invalid file type');
      });

      it('should enforce file size limits', async () => {
        // Create a large file buffer (> 10MB)
        const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
        
        const response = await request(app)
          .post('/api/upload')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', largeBuffer, 'large.jpg')
          .expect(413);

        expect(response.body.error).toContain('File too large');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.error).toContain('Not found');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json')
        .expect(400);

      expect(response.body.error).toContain('Invalid JSON');
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      vi.spyOn(db, 'select').mockRejectedValueOnce(new Error('Database connection lost'));

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.error).toContain('Internal server error');
      expect(response.body).not.toHaveProperty('stack'); // Don't leak stack traces
    });
  });
});