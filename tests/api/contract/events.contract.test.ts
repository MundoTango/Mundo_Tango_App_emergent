/**
 * ESA LIFE CEO 61×21 - Events API Contract Tests
 * Testing all /api/events/* endpoints
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

// Schema definitions for events
const EventSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  date: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()).optional(),
  location: z.string(),
  category: z.enum(['milonga', 'practica', 'workshop', 'festival', 'class', 'social', 'performance']),
  maxAttendees: z.number().optional(),
  attendeesCount: z.number().default(0),
  price: z.number().optional(),
  imageUrl: z.string().nullable().optional(),
  organizerId: z.number(),
  visibility: z.enum(['public', 'private', 'members']).default('public'),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).default('published'),
  createdAt: z.string().datetime().or(z.date()),
  organizer: z.object({
    id: z.number(),
    name: z.string(),
    username: z.string(),
    profileImage: z.string().nullable().optional()
  }).optional(),
  rsvpStatus: z.enum(['going', 'interested', 'not_going']).nullable().optional()
});

const RSVPResponseSchema = z.object({
  success: z.literal(true),
  status: z.enum(['going', 'interested', 'not_going']),
  attendeesCount: z.number(),
  message: z.string().optional()
});

describe('Events API Contract Tests', () => {
  let testEventId: number;

  describe('POST /api/events', () => {
    it('should create a new event', async () => {
      const startTime = Date.now();
      const authRequest = await createAuthenticatedRequest('organizer');
      const eventData = TestUtils.generateTestEvent();

      const response = await authRequest
        .post('/api/events')
        .send(eventData)
        .expect(201);

      validateResponseTime(startTime, PERF_THRESHOLDS.WRITE);
      validateSchema(response.body.event || response.body, EventSchema);

      testEventId = response.body.event?.id || response.body.id;
      expect(response.body.success || response.body.id).toBeTruthy();
      expect(response.body.event?.title || response.body.title).toBe(eventData.title);
    });

    it('should reject event creation without organizer role', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      const eventData = TestUtils.generateTestEvent();

      const response = await authRequest
        .post('/api/events')
        .send(eventData)
        .expect(403);

      validateSchema(response.body, ErrorResponseSchema);
      expect(response.body.error || response.body.message).toContain('permission');
    });

    it('should validate required fields', async () => {
      const authRequest = await createAuthenticatedRequest('organizer');

      const response = await authRequest
        .post('/api/events')
        .send({
          description: 'Missing title and date'
        })
        .expect(422);

      validateSchema(response.body, ErrorResponseSchema);
      expect(response.body.error || response.body.message).toContain('required');
    });

    it('should handle date validation', async () => {
      const authRequest = await createAuthenticatedRequest('organizer');

      const response = await authRequest
        .post('/api/events')
        .send({
          ...TestUtils.generateTestEvent(),
          date: 'invalid-date'
        })
        .expect(422);

      validateSchema(response.body, ErrorResponseSchema);
    });

    it('should prevent past event creation', async () => {
      const authRequest = await createAuthenticatedRequest('organizer');

      const response = await authRequest
        .post('/api/events')
        .send({
          ...TestUtils.generateTestEvent(),
          date: new Date(Date.now() - 86400000).toISOString() // Yesterday
        })
        .expect(422);

      validateSchema(response.body, ErrorResponseSchema);
      expect(response.body.error || response.body.message).toContain('past');
    });
  });

  describe('GET /api/events', () => {
    it('should retrieve events list', async () => {
      const startTime = Date.now();
      
      const response = await request(API_BASE_URL)
        .get('/api/events')
        .query({ limit: 20, offset: 0 })
        .expect(200);

      validateResponseTime(startTime, PERF_THRESHOLDS.READ);
      validateSchema(response.body, PaginatedResponseSchema);

      const events = response.body.data;
      expect(Array.isArray(events)).toBe(true);
      if (events.length > 0) {
        validateSchema(events[0], EventSchema);
      }
    });

    it('should filter events by category', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/events')
        .query({ category: 'milonga' })
        .expect(200);

      const events = response.body.data;
      events.forEach((event: any) => {
        expect(event.category).toBe('milonga');
      });
    });

    it('should filter events by date range', async () => {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 7 * 86400000).toISOString(); // Next week

      const response = await request(API_BASE_URL)
        .get('/api/events')
        .query({ startDate, endDate })
        .expect(200);

      const events = response.body.data;
      events.forEach((event: any) => {
        const eventDate = new Date(event.date);
        expect(eventDate >= new Date(startDate)).toBe(true);
        expect(eventDate <= new Date(endDate)).toBe(true);
      });
    });

    it('should search events by keyword', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/events')
        .query({ search: 'tango' })
        .expect(200);

      const events = response.body.data;
      events.forEach((event: any) => {
        const hasKeyword = 
          event.title.toLowerCase().includes('tango') ||
          event.description.toLowerCase().includes('tango');
        expect(hasKeyword).toBe(true);
      });
    });

    it('should sort events by date', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/events')
        .query({ sort: 'date', order: 'asc' })
        .expect(200);

      const events = response.body.data;
      for (let i = 1; i < events.length; i++) {
        const prevDate = new Date(events[i - 1].date);
        const currDate = new Date(events[i].date);
        expect(currDate >= prevDate).toBe(true);
      }
    });
  });

  describe('GET /api/events/:id', () => {
    it('should retrieve a specific event', async () => {
      const startTime = Date.now();
      
      const response = await request(API_BASE_URL)
        .get(`/api/events/${testEventId}`)
        .expect(200);

      validateResponseTime(startTime, PERF_THRESHOLDS.READ);
      validateSchema(response.body.event || response.body, EventSchema);
      
      const event = response.body.event || response.body;
      expect(event.id).toBe(testEventId);
    });

    it('should include RSVP status for authenticated users', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      
      const response = await authRequest
        .get(`/api/events/${testEventId}`)
        .expect(200);

      const event = response.body.event || response.body;
      expect('rsvpStatus' in event).toBe(true);
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/events/999999')
        .expect(404);

      validateSchema(response.body, ErrorResponseSchema);
    });
  });

  describe('PUT /api/events/:id', () => {
    it('should update event as organizer', async () => {
      const startTime = Date.now();
      const authRequest = await createAuthenticatedRequest('organizer');
      
      const response = await authRequest
        .put(`/api/events/${testEventId}`)
        .send({
          description: 'Updated event description',
          maxAttendees: 100
        })
        .expect(200);

      validateResponseTime(startTime, PERF_THRESHOLDS.WRITE);
      expect(response.body.success).toBe(true);
    });

    it('should reject update from non-organizer', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      
      const response = await authRequest
        .put(`/api/events/${testEventId}`)
        .send({
          title: 'Trying to update'
        })
        .expect(403);

      validateSchema(response.body, ErrorResponseSchema);
    });

    it('should prevent changing past events', async () => {
      const authRequest = await createAuthenticatedRequest('organizer');
      
      const response = await authRequest
        .put(`/api/events/${testEventId}`)
        .send({
          date: new Date(Date.now() - 86400000).toISOString() // Yesterday
        })
        .expect(422);

      validateSchema(response.body, ErrorResponseSchema);
    });
  });

  describe('POST /api/events/:id/rsvp', () => {
    it('should RSVP to an event', async () => {
      const startTime = Date.now();
      const authRequest = await createAuthenticatedRequest('user');
      
      const response = await authRequest
        .post(`/api/events/${testEventId}/rsvp`)
        .send({
          status: 'going'
        })
        .expect(200);

      validateResponseTime(startTime, PERF_THRESHOLDS.WRITE);
      validateSchema(response.body, RSVPResponseSchema);
      expect(response.body.status).toBe('going');
    });

    it('should update RSVP status', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      
      // First RSVP
      await authRequest
        .post(`/api/events/${testEventId}/rsvp`)
        .send({ status: 'going' })
        .expect(200);

      // Update RSVP
      const response = await authRequest
        .post(`/api/events/${testEventId}/rsvp`)
        .send({ status: 'interested' })
        .expect(200);

      expect(response.body.status).toBe('interested');
    });

    it('should enforce max attendees limit', async () => {
      const authRequest = await createAuthenticatedRequest('organizer');
      
      // Create event with limited capacity
      const eventResponse = await authRequest
        .post('/api/events')
        .send({
          ...TestUtils.generateTestEvent(),
          maxAttendees: 1
        })
        .expect(201);

      const limitedEventId = eventResponse.body.event?.id || eventResponse.body.id;

      // First user RSVPs
      const user1Request = await createAuthenticatedRequest('user');
      await user1Request
        .post(`/api/events/${limitedEventId}/rsvp`)
        .send({ status: 'going' })
        .expect(200);

      // Second user should be waitlisted or rejected
      const user2Request = await createAuthenticatedRequest('moderator');
      const response = await user2Request
        .post(`/api/events/${limitedEventId}/rsvp`)
        .send({ status: 'going' })
        .expect([200, 422]);

      if (response.status === 200) {
        expect(response.body.status).toBe('interested'); // Waitlisted
      }
    });

    it('should require authentication for RSVP', async () => {
      const response = await request(API_BASE_URL)
        .post(`/api/events/${testEventId}/rsvp`)
        .send({ status: 'going' })
        .expect(401);

      validateSchema(response.body, ErrorResponseSchema);
    });
  });

  describe('GET /api/events/:id/attendees', () => {
    it('should list event attendees', async () => {
      const startTime = Date.now();
      
      const response = await request(API_BASE_URL)
        .get(`/api/events/${testEventId}/attendees`)
        .expect(200);

      validateResponseTime(startTime, PERF_THRESHOLDS.READ);
      expect(Array.isArray(response.body.attendees || response.body.data)).toBe(true);
    });

    it('should filter attendees by RSVP status', async () => {
      const response = await request(API_BASE_URL)
        .get(`/api/events/${testEventId}/attendees`)
        .query({ status: 'going' })
        .expect(200);

      const attendees = response.body.attendees || response.body.data;
      attendees.forEach((attendee: any) => {
        expect(attendee.rsvpStatus).toBe('going');
      });
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should cancel event as organizer', async () => {
      const authRequest = await createAuthenticatedRequest('organizer');
      
      // Create event to cancel
      const createResponse = await authRequest
        .post('/api/events')
        .send(TestUtils.generateTestEvent())
        .expect(201);

      const eventId = createResponse.body.event?.id || createResponse.body.id;

      // Cancel the event
      const deleteResponse = await authRequest
        .delete(`/api/events/${eventId}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // Verify event is cancelled
      const getResponse = await request(API_BASE_URL)
        .get(`/api/events/${eventId}`)
        .expect(200);

      const event = getResponse.body.event || getResponse.body;
      expect(event.status).toBe('cancelled');
    });

    it('should notify attendees when event is cancelled', async () => {
      const organizerRequest = await createAuthenticatedRequest('organizer');
      
      // Create and cancel event with attendees
      const eventResponse = await organizerRequest
        .post('/api/events')
        .send(TestUtils.generateTestEvent())
        .expect(201);

      const eventId = eventResponse.body.event?.id || eventResponse.body.id;

      // User RSVPs
      const userRequest = await createAuthenticatedRequest('user');
      await userRequest
        .post(`/api/events/${eventId}/rsvp`)
        .send({ status: 'going' })
        .expect(200);

      // Cancel event
      const cancelResponse = await organizerRequest
        .delete(`/api/events/${eventId}`)
        .expect(200);

      expect(cancelResponse.body.notificationsSent).toBeGreaterThan(0);
    });
  });

  describe('GET /api/events/my', () => {
    it('should retrieve user\'s created events', async () => {
      const startTime = Date.now();
      const authRequest = await createAuthenticatedRequest('organizer');
      
      const response = await authRequest
        .get('/api/events/my')
        .expect(200);

      validateResponseTime(startTime, PERF_THRESHOLDS.READ);
      validateSchema(response.body, PaginatedResponseSchema);

      const events = response.body.data;
      events.forEach((event: any) => {
        expect(event.organizerId).toBeDefined();
      });
    });
  });

  describe('GET /api/events/attending', () => {
    it('should retrieve events user is attending', async () => {
      const startTime = Date.now();
      const authRequest = await createAuthenticatedRequest('user');
      
      const response = await authRequest
        .get('/api/events/attending')
        .expect(200);

      validateResponseTime(startTime, PERF_THRESHOLDS.READ);
      validateSchema(response.body, PaginatedResponseSchema);

      const events = response.body.data;
      events.forEach((event: any) => {
        expect(['going', 'interested'].includes(event.rsvpStatus)).toBe(true);
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent RSVPs', async () => {
      const organizerRequest = await createAuthenticatedRequest('organizer');
      
      // Create event
      const eventResponse = await organizerRequest
        .post('/api/events')
        .send({
          ...TestUtils.generateTestEvent(),
          maxAttendees: 100
        })
        .expect(201);

      const eventId = eventResponse.body.event?.id || eventResponse.body.id;

      // Simulate concurrent RSVPs
      const startTime = Date.now();
      const promises = ['user', 'moderator', 'organizer'].map(async (userType) => {
        const authRequest = await createAuthenticatedRequest(userType as any);
        return authRequest
          .post(`/api/events/${eventId}/rsvp`)
          .send({ status: 'going' });
      });

      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      expect(totalTime).toBeLessThan(PERF_THRESHOLDS.WRITE * 2);
    });

    it('should retrieve large events list efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(API_BASE_URL)
        .get('/api/events')
        .query({ limit: 100 })
        .expect(200);

      const responseTime = validateResponseTime(startTime, PERF_THRESHOLDS.READ * 2);
      expect(responseTime).toBeLessThan(300);
    });
  });

  describe('Security Tests', () => {
    it('should sanitize event content', async () => {
      const authRequest = await createAuthenticatedRequest('organizer');
      
      const response = await authRequest
        .post('/api/events')
        .send({
          ...TestUtils.generateTestEvent(),
          title: '<script>alert("XSS")</script>Milonga',
          description: 'Test <img src=x onerror=alert(1)> event'
        })
        .expect(201);

      const event = response.body.event || response.body;
      expect(event.title).not.toContain('<script>');
      expect(event.description).not.toContain('onerror');
    });

    it('should validate location data', async () => {
      const authRequest = await createAuthenticatedRequest('organizer');
      
      const response = await authRequest
        .post('/api/events')
        .send({
          ...TestUtils.generateTestEvent(),
          location: '../../../etc/passwd'
        })
        .expect([201, 422]);

      if (response.status === 201) {
        const event = response.body.event || response.body;
        expect(event.location).not.toContain('..');
      }
    });
  });
});

export { EventSchema, RSVPResponseSchema };