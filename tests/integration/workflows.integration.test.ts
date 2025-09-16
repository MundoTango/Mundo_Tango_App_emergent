/**
 * ESA LIFE CEO 61×21 - Workflow Integration Tests
 * Testing complete user workflows across the platform
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
  setupTestDatabase,
  cleanupTestDatabase,
  TestUtils
} from '../api/contract/test-setup';
import { io, Socket } from 'socket.io-client';

describe('Workflow Integration Tests', () => {
  let socket: Socket;

  beforeAll(async () => {
    await setupTestDatabase();
    // Connect to WebSocket for real-time tests
    socket = io(API_BASE_URL, {
      transports: ['websocket'],
      autoConnect: true
    });
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    if (socket) socket.disconnect();
  });

  describe('User Registration → Agent Initialization → First Interaction', () => {
    it('should complete full onboarding workflow', async () => {
      const uniqueEmail = `newuser${Date.now()}@test.com`;
      const username = `newuser${Date.now()}`;
      const workflowStartTime = Date.now();

      // Step 1: Register new user
      const registerResponse = await request(API_BASE_URL)
        .post('/api/auth/register')
        .send({
          email: uniqueEmail,
          password: 'SecurePass123!',
          name: 'Test User',
          username: username
        })
        .expect(201);

      expect(registerResponse.body.success).toBe(true);
      const userId = registerResponse.body.user.id;

      // Step 2: Complete onboarding profile
      const authRequest = await createAuthenticatedRequest('user');
      const profileResponse = await authRequest
        .put('/api/users/profile')
        .send({
          bio: 'New user bio',
          city: 'Buenos Aires',
          country: 'Argentina',
          languages: ['English', 'Spanish'],
          tangoRoles: ['leader', 'follower'],
          yearsOfDancing: 2
        })
        .expect(200);

      expect(profileResponse.body.success).toBe(true);

      // Step 3: Initialize Life CEO agents
      const agentInitResponse = await authRequest
        .post('/api/agents/initialize')
        .send({
          userId: userId,
          preferences: {
            primaryGoal: 'health',
            interests: ['fitness', 'nutrition']
          }
        })
        .expect(200);

      expect(agentInitResponse.body.initialized).toBe(true);
      expect(agentInitResponse.body.agents.length).toBe(16);

      // Step 4: First agent interaction
      const chatResponse = await authRequest
        .post('/api/agents/life-strategist/chat')
        .send({
          message: 'Help me get started',
          firstInteraction: true
        })
        .expect(200);

      expect(chatResponse.body.response).toContain('welcome');
      expect(chatResponse.body.metadata?.personalized).toBe(true);

      // Step 5: Verify agent memory created
      const memoryResponse = await authRequest
        .get('/api/agents/life-strategist/memories')
        .expect(200);

      expect(memoryResponse.body.memories.length).toBeGreaterThan(0);

      // Validate workflow performance
      const totalTime = Date.now() - workflowStartTime;
      expect(totalTime).toBeLessThan(5000); // Complete workflow in <5s
    });
  });

  describe('Post Creation → AI Enhancement → Real-time Broadcast', () => {
    it('should complete full post creation workflow', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      const workflowStartTime = Date.now();

      // Setup WebSocket listener for real-time updates
      const realtimeUpdateReceived = new Promise((resolve) => {
        socket.on('post:created', (data) => {
          resolve(data);
        });
      });

      // Step 1: Create initial post
      const createResponse = await authRequest
        .post('/api/posts')
        .send({
          content: 'Great milonga tonight at Salon Canning!'
        })
        .expect(201);

      const postId = createResponse.body.post?.id || createResponse.body.id;
      expect(postId).toBeDefined();

      // Step 2: AI Enhancement
      const enhanceResponse = await authRequest
        .post('/api/posts/enhance-content')
        .send({
          postId: postId,
          content: createResponse.body.post?.content || createResponse.body.content
        })
        .expect(200);

      expect(enhanceResponse.body.enhancedContent).toBeDefined();
      expect(enhanceResponse.body.hashtags).toContain('#tango');

      // Step 3: Update post with enhanced content
      const updateResponse = await authRequest
        .put(`/api/posts/${postId}`)
        .send({
          content: enhanceResponse.body.enhancedContent
        })
        .expect(200);

      expect(updateResponse.body.success).toBe(true);

      // Step 4: Verify real-time broadcast
      const realtimeData: any = await Promise.race([
        realtimeUpdateReceived,
        TestUtils.wait(2000).then(() => null)
      ]);

      expect(realtimeData).toBeDefined();
      expect(realtimeData.postId).toBe(postId);

      // Step 5: Verify post appears in feed
      const feedResponse = await authRequest
        .get('/api/posts/feed')
        .expect(200);

      const createdPost = feedResponse.body.data.find((p: any) => p.id === postId);
      expect(createdPost).toBeDefined();
      expect(createdPost.content).toContain(enhanceResponse.body.enhancedContent);

      // Validate workflow performance
      const totalTime = Date.now() - workflowStartTime;
      expect(totalTime).toBeLessThan(3000); // Complete workflow in <3s
    });

    it('should handle post with media upload', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      
      // Create post with media
      const response = await authRequest
        .post('/api/posts')
        .field('content', 'Tango performance at Teatro Colon')
        .attach('media', Buffer.from('fake-image-data'), 'performance.jpg')
        .expect(201);

      const post = response.body.post || response.body;
      expect(post.mediaUrls?.length).toBeGreaterThan(0);

      // Verify media is accessible
      const mediaUrl = post.mediaUrls[0];
      const mediaResponse = await request(API_BASE_URL)
        .get(mediaUrl)
        .expect(200);

      expect(mediaResponse.headers['content-type']).toContain('image');
    });
  });

  describe('Event Creation → Payment Processing → Notification Sending', () => {
    it('should complete full event workflow with paid registration', async () => {
      const organizerRequest = await createAuthenticatedRequest('organizer');
      const userRequest = await createAuthenticatedRequest('user');
      const workflowStartTime = Date.now();

      // Step 1: Create paid event
      const eventData = {
        ...TestUtils.generateTestEvent(),
        price: 50,
        maxAttendees: 20,
        requiresPayment: true
      };

      const createResponse = await organizerRequest
        .post('/api/events')
        .send(eventData)
        .expect(201);

      const eventId = createResponse.body.event?.id || createResponse.body.id;
      expect(eventId).toBeDefined();

      // Step 2: User RSVPs (initiates payment)
      const rsvpResponse = await userRequest
        .post(`/api/events/${eventId}/rsvp`)
        .send({
          status: 'going',
          paymentMethod: 'card'
        })
        .expect(200);

      expect(rsvpResponse.body.paymentIntent).toBeDefined();
      const paymentIntentId = rsvpResponse.body.paymentIntent;

      // Step 3: Process payment
      const paymentResponse = await userRequest
        .post('/api/payments/confirm')
        .send({
          paymentIntentId: paymentIntentId,
          paymentMethodId: 'pm_card_visa' // Test payment method
        })
        .expect(200);

      expect(paymentResponse.body.status).toBe('succeeded');

      // Step 4: Verify RSVP confirmed
      const eventResponse = await userRequest
        .get(`/api/events/${eventId}`)
        .expect(200);

      const event = eventResponse.body.event || eventResponse.body;
      expect(event.rsvpStatus).toBe('going');
      expect(event.attendeesCount).toBe(1);

      // Step 5: Verify notification sent
      const notificationsResponse = await organizerRequest
        .get('/api/notifications')
        .expect(200);

      const notification = notificationsResponse.body.data.find(
        (n: any) => n.type === 'event-registration' && n.eventId === eventId
      );
      
      expect(notification).toBeDefined();
      expect(notification.message).toContain('registered');

      // Validate workflow performance
      const totalTime = Date.now() - workflowStartTime;
      expect(totalTime).toBeLessThan(4000); // Complete workflow in <4s
    });
  });

  describe('Group Creation → Member Invitation → Activity Flow', () => {
    it('should complete full group workflow', async () => {
      const adminRequest = await createAuthenticatedRequest('admin');
      const userRequest = await createAuthenticatedRequest('user');
      
      // Step 1: Create group
      const groupResponse = await adminRequest
        .post('/api/groups')
        .send({
          name: 'Buenos Aires Tango Community',
          description: 'Local tango dancers group',
          type: 'public',
          category: 'dance'
        })
        .expect(201);

      const groupId = groupResponse.body.group?.id || groupResponse.body.id;

      // Step 2: User joins group
      const joinResponse = await userRequest
        .post(`/api/groups/${groupId}/join`)
        .expect(200);

      expect(joinResponse.body.success).toBe(true);

      // Step 3: Create group post
      const postResponse = await userRequest
        .post('/api/posts')
        .send({
          content: 'Welcome to our tango group!',
          groupId: groupId,
          visibility: 'group'
        })
        .expect(201);

      const postId = postResponse.body.post?.id || postResponse.body.id;

      // Step 4: Verify post appears in group feed
      const feedResponse = await userRequest
        .get(`/api/groups/${groupId}/posts`)
        .expect(200);

      const groupPost = feedResponse.body.data.find((p: any) => p.id === postId);
      expect(groupPost).toBeDefined();

      // Step 5: Create group event
      const eventResponse = await adminRequest
        .post('/api/events')
        .send({
          ...TestUtils.generateTestEvent(),
          groupId: groupId,
          visibility: 'members'
        })
        .expect(201);

      expect(eventResponse.body.event?.groupId || eventResponse.body.groupId).toBe(groupId);
    });
  });

  describe('Message → AI Processing → Delivery Flow', () => {
    it('should complete messaging workflow with AI moderation', async () => {
      const senderRequest = await createAuthenticatedRequest('user');
      const receiverRequest = await createAuthenticatedRequest('moderator');

      // Step 1: Send message
      const sendResponse = await senderRequest
        .post('/api/messages/send')
        .send({
          recipientId: 2,
          content: 'Would you like to dance at the milonga tonight?'
        })
        .expect(201);

      const messageId = sendResponse.body.message?.id || sendResponse.body.id;

      // Step 2: AI processes and moderates
      expect(sendResponse.body.aiProcessed).toBe(true);
      expect(sendResponse.body.moderationStatus).toBe('approved');

      // Step 3: Receiver gets message
      const messagesResponse = await receiverRequest
        .get('/api/messages/inbox')
        .expect(200);

      const message = messagesResponse.body.data.find((m: any) => m.id === messageId);
      expect(message).toBeDefined();
      expect(message.content).toContain('dance');

      // Step 4: Reply to message
      const replyResponse = await receiverRequest
        .post('/api/messages/reply')
        .send({
          messageId: messageId,
          content: 'Yes, I would love to!'
        })
        .expect(201);

      expect(replyResponse.body.success).toBe(true);

      // Step 5: Verify conversation thread
      const conversationResponse = await senderRequest
        .get(`/api/conversations/${messageId}`)
        .expect(200);

      expect(conversationResponse.body.messages.length).toBe(2);
    });
  });

  describe('Search → Recommendation → Action Flow', () => {
    it('should complete search and recommendation workflow', async () => {
      const authRequest = await createAuthenticatedRequest('user');

      // Step 1: Search for events
      const searchResponse = await authRequest
        .get('/api/search')
        .query({
          query: 'tango milonga',
          type: 'events'
        })
        .expect(200);

      expect(searchResponse.body.results.length).toBeGreaterThan(0);
      const firstResult = searchResponse.body.results[0];

      // Step 2: Get AI recommendations based on search
      const recommendResponse = await authRequest
        .post('/api/recommendations/generate')
        .send({
          context: 'events',
          baseItem: firstResult.id,
          userPreferences: true
        })
        .expect(200);

      expect(recommendResponse.body.recommendations.length).toBeGreaterThan(0);

      // Step 3: Interact with recommendation
      const recommendedEventId = recommendResponse.body.recommendations[0].id;
      const interactResponse = await authRequest
        .post(`/api/events/${recommendedEventId}/interested`)
        .expect(200);

      expect(interactResponse.body.success).toBe(true);

      // Step 4: Verify recommendation feedback recorded
      const feedbackResponse = await authRequest
        .post('/api/recommendations/feedback')
        .send({
          recommendationId: recommendResponse.body.recommendationId,
          action: 'interested',
          helpful: true
        })
        .expect(200);

      expect(feedbackResponse.body.recorded).toBe(true);
    });
  });

  describe('Multi-Agent Collaboration Workflow', () => {
    it('should coordinate multiple agents for complex user request', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      const sessionId = `workflow-${Date.now()}`;

      // Step 1: Initial complex request
      const initialResponse = await authRequest
        .post('/api/agents/life-strategist/chat')
        .send({
          message: 'I want to be healthier, save money, and advance my career this year',
          sessionId: sessionId,
          allowMultiAgent: true
        })
        .expect(200);

      expect(initialResponse.body.metadata?.agentsInvolved).toContain('health-advisor');
      expect(initialResponse.body.metadata?.agentsInvolved).toContain('financial-advisor');
      expect(initialResponse.body.metadata?.agentsInvolved).toContain('career-coach');

      // Step 2: Health advisor creates plan
      const healthResponse = await authRequest
        .post('/api/agents/health-advisor/chat')
        .send({
          message: 'Create a health plan',
          sessionId: sessionId
        })
        .expect(200);

      expect(healthResponse.body.response).toContain('health');

      // Step 3: Financial advisor creates budget
      const financialResponse = await authRequest
        .post('/api/agents/financial-advisor/chat')
        .send({
          message: 'Create a savings plan',
          sessionId: sessionId,
          context: { healthPlan: healthResponse.body.response }
        })
        .expect(200);

      expect(financialResponse.body.response).toContain('budget');

      // Step 4: Career coach creates action plan
      const careerResponse = await authRequest
        .post('/api/agents/career-coach/chat')
        .send({
          message: 'Create career advancement plan',
          sessionId: sessionId,
          context: {
            healthPlan: healthResponse.body.response,
            financialPlan: financialResponse.body.response
          }
        })
        .expect(200);

      expect(careerResponse.body.response).toContain('career');

      // Step 5: Life strategist synthesizes all plans
      const synthesisResponse = await authRequest
        .post('/api/agents/life-strategist/chat')
        .send({
          message: 'Synthesize all the plans into a cohesive strategy',
          sessionId: sessionId
        })
        .expect(200);

      expect(synthesisResponse.body.response).toContain('health');
      expect(synthesisResponse.body.response).toContain('financial');
      expect(synthesisResponse.body.response).toContain('career');
      expect(synthesisResponse.body.metadata?.plansIntegrated).toBe(true);
    });
  });

  describe('Error Recovery Workflows', () => {
    it('should recover from payment failure', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      
      // Simulate failed payment
      const failedPayment = await authRequest
        .post('/api/payments/process')
        .send({
          amount: 100,
          paymentMethodId: 'pm_card_declined' // Test card that declines
        })
        .expect(402);

      expect(failedPayment.body.error).toContain('declined');

      // Retry with different payment method
      const successPayment = await authRequest
        .post('/api/payments/process')
        .send({
          amount: 100,
          paymentMethodId: 'pm_card_visa' // Test card that succeeds
        })
        .expect(200);

      expect(successPayment.body.status).toBe('succeeded');
    });

    it('should handle agent failure with fallback', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      
      // Simulate agent failure
      const response = await authRequest
        .post('/api/agents/health-advisor/chat')
        .send({
          message: 'Help me',
          simulateFailure: true
        })
        .expect(200);

      // Should fallback to alternative agent
      expect(response.body.fallbackAgent).toBeDefined();
      expect(response.body.response).toBeDefined();
    });
  });

  describe('Performance Critical Workflows', () => {
    it('should handle high-frequency real-time updates', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      const messageCount = 50;
      const startTime = Date.now();

      // Send rapid messages
      const promises = Array(messageCount).fill(null).map((_, i) => 
        authRequest
          .post('/api/messages/send')
          .send({
            recipientId: 2,
            content: `Message ${i}`
          })
      );

      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Should handle 50 messages in < 5 seconds
      expect(totalTime).toBeLessThan(5000);
      
      // Average time per message
      const avgTime = totalTime / messageCount;
      expect(avgTime).toBeLessThan(100);
    });

    it('should maintain performance under concurrent user load', async () => {
      const userCount = 20;
      const startTime = Date.now();

      // Simulate multiple concurrent users
      const promises = Array(userCount).fill(null).map(async () => {
        const authRequest = await createAuthenticatedRequest('user');
        return authRequest.get('/api/posts/feed');
      });

      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should handle 20 concurrent users in < 2 seconds
      expect(totalTime).toBeLessThan(2000);
    });
  });
});

export {};