/**
 * ESA LIFE CEO 61×21 - Authentication API Contract Tests
 * Testing all /api/auth/* and /api/users/* endpoints
 */

import request from 'supertest';
import { z } from 'zod';
import {
  API_BASE_URL,
  TEST_USERS,
  PERF_THRESHOLDS,
  validateResponseTime,
  validateSchema,
  setupTestDatabase,
  cleanupTestDatabase,
  ErrorResponseSchema,
  SuccessResponseSchema,
  createAuthenticatedRequest
} from './test-setup';

// Schema definitions for auth responses
const UserResponseSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  username: z.string(),
  profileImage: z.string().nullable(),
  isVerified: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string().datetime().or(z.date()),
  role: z.string().optional()
});

const LoginResponseSchema = z.object({
  success: z.literal(true),
  user: UserResponseSchema,
  token: z.string().optional(),
  message: z.string().optional()
});

const RegisterResponseSchema = z.object({
  success: z.literal(true),
  user: UserResponseSchema.partial(),
  message: z.string()
});

describe('Authentication API Contract Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const startTime = Date.now();
      const newUser = {
        email: `newuser${Date.now()}@test.com`,
        password: 'SecurePass123!',
        name: 'New Test User',
        username: `newuser${Date.now()}`
      };

      const response = await request(API_BASE_URL)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      // Validate response time
      validateResponseTime(startTime, PERF_THRESHOLDS.WRITE);

      // Validate response schema
      validateSchema(response.body, RegisterResponseSchema);

      // Validate specific fields
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('success');
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(API_BASE_URL)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123!',
          name: 'Test User',
          username: 'testuser'
        })
        .expect(422);

      validateSchema(response.body, ErrorResponseSchema);
      expect(response.body.error || response.body.message).toContain('email');
    });

    it('should reject registration with weak password', async () => {
      const response = await request(API_BASE_URL)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          name: 'Test User',
          username: 'testuser'
        })
        .expect(422);

      validateSchema(response.body, ErrorResponseSchema);
      expect(response.body.error || response.body.message).toContain('password');
    });

    it('should reject duplicate email registration', async () => {
      const response = await request(API_BASE_URL)
        .post('/api/auth/register')
        .send({
          email: TEST_USERS.user.email,
          password: 'SecurePass123!',
          name: 'Duplicate User',
          username: 'duplicateuser'
        })
        .expect(409);

      validateSchema(response.body, ErrorResponseSchema);
      expect(response.body.error || response.body.message).toContain('exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const startTime = Date.now();
      const response = await request(API_BASE_URL)
        .post('/api/auth/login')
        .send({
          email: TEST_USERS.user.email,
          password: TEST_USERS.user.password
        })
        .expect(200);

      validateResponseTime(startTime, PERF_THRESHOLDS.READ);
      validateSchema(response.body, LoginResponseSchema);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(TEST_USERS.user.email);
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject login with invalid password', async () => {
      const response = await request(API_BASE_URL)
        .post('/api/auth/login')
        .send({
          email: TEST_USERS.user.email,
          password: 'wrongpassword'
        })
        .expect(401);

      validateSchema(response.body, ErrorResponseSchema);
      expect(response.body.error || response.body.message).toContain('Invalid');
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(API_BASE_URL)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      validateSchema(response.body, ErrorResponseSchema);
    });

    it('should handle rate limiting on multiple failed attempts', async () => {
      const attempts = 10;
      let rateLimited = false;

      for (let i = 0; i < attempts; i++) {
        const response = await request(API_BASE_URL)
          .post('/api/auth/login')
          .send({
            email: TEST_USERS.user.email,
            password: 'wrongpassword'
          });

        if (response.status === 429) {
          rateLimited = true;
          expect(response.body.error || response.body.message).toContain('rate');
          break;
        }
      }

      // Rate limiting should kick in after multiple failed attempts
      expect(rateLimited).toBe(true);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user when authenticated', async () => {
      const startTime = Date.now();
      const authRequest = await createAuthenticatedRequest('user');
      const response = await authRequest
        .get('/api/auth/me')
        .expect(200);

      validateResponseTime(startTime, PERF_THRESHOLDS.READ);
      validateSchema(response.body.user || response.body, UserResponseSchema);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/auth/me')
        .expect(401);

      validateSchema(response.body, ErrorResponseSchema);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should successfully logout authenticated user', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      const response = await authRequest
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('logout');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh authentication token', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      const response = await authRequest
        .post('/api/auth/refresh')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset email', async () => {
      const response = await request(API_BASE_URL)
        .post('/api/auth/forgot-password')
        .send({
          email: TEST_USERS.user.email
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('reset');
    });

    it('should handle non-existent email gracefully', async () => {
      const response = await request(API_BASE_URL)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        })
        .expect(200); // Should return 200 to prevent email enumeration

      expect(response.body.success).toBe(true);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      const startTime = Date.now();
      const authRequest = await createAuthenticatedRequest('user');
      const response = await authRequest
        .put('/api/users/profile')
        .send({
          name: 'Updated Name',
          bio: 'Updated bio',
          city: 'Buenos Aires',
          country: 'Argentina'
        })
        .expect(200);

      validateResponseTime(startTime, PERF_THRESHOLDS.WRITE);
      expect(response.body.success).toBe(true);
    });

    it('should reject invalid profile data', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      const response = await authRequest
        .put('/api/users/profile')
        .send({
          email: 'invalid-email' // Should not be able to update email directly
        })
        .expect(422);

      validateSchema(response.body, ErrorResponseSchema);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by ID', async () => {
      const startTime = Date.now();
      const response = await request(API_BASE_URL)
        .get('/api/users/1')
        .expect(200);

      validateResponseTime(startTime, PERF_THRESHOLDS.READ);
      validateSchema(response.body.user || response.body, UserResponseSchema);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/users/999999')
        .expect(404);

      validateSchema(response.body, ErrorResponseSchema);
    });
  });

  describe('Security Tests', () => {
    it('should prevent SQL injection in login', async () => {
      const response = await request(API_BASE_URL)
        .post('/api/auth/login')
        .send({
          email: "admin' OR '1'='1",
          password: "password' OR '1'='1"
        })
        .expect(401);

      validateSchema(response.body, ErrorResponseSchema);
    });

    it('should prevent XSS in registration', async () => {
      const response = await request(API_BASE_URL)
        .post('/api/auth/register')
        .send({
          email: 'xss@test.com',
          password: 'SecurePass123!',
          name: '<script>alert("XSS")</script>',
          username: 'xsstest'
        });

      // If registration succeeds, verify the name is sanitized
      if (response.status === 201) {
        expect(response.body.user.name).not.toContain('<script>');
      }
    });

    it('should enforce CSRF protection', async () => {
      const response = await request(API_BASE_URL)
        .post('/api/auth/logout')
        .set('Origin', 'http://evil-site.com')
        .expect(403);

      validateSchema(response.body, ErrorResponseSchema);
    });
  });
});

// Export for use in other test suites
export { UserResponseSchema, LoginResponseSchema };