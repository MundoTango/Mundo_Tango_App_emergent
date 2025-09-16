/**
 * ESA LIFE CEO 61×21 - API Contract Testing Setup
 * Comprehensive testing framework for all API endpoints
 */

import request from 'supertest';
import { z } from 'zod';
import { db, pool } from '../../../server/db';
import { users, sessions, posts, events, groups, agents, memories } from '../../../shared/schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';

// Test server URL - uses the running development server
export const API_BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000';

// Test timeout configuration
export const TEST_TIMEOUT = 30000; // 30 seconds

// Performance thresholds
export const PERF_THRESHOLDS = {
  READ: 100,  // <100ms for read operations
  WRITE: 500, // <500ms for write operations
  AGENT: 1000, // <1s for agent processing
  ROUTING: 100, // <100ms for agent routing
};

// Test user credentials
export const TEST_USERS = {
  admin: {
    email: 'admin@test.mundotango.life',
    password: 'Admin123!@#',
    name: 'Test Admin',
    username: 'testadmin',
    role: 'admin'
  },
  user: {
    email: 'user@test.mundotango.life',
    password: 'User123!@#',
    name: 'Test User',
    username: 'testuser',
    role: 'user'
  },
  moderator: {
    email: 'mod@test.mundotango.life',
    password: 'Mod123!@#',
    name: 'Test Moderator',
    username: 'testmod',
    role: 'moderator'
  },
  organizer: {
    email: 'organizer@test.mundotango.life',
    password: 'Org123!@#',
    name: 'Test Organizer',
    username: 'testorganizer',
    role: 'organizer'
  }
};

// Helper to create authenticated request
export async function createAuthenticatedRequest(userType: keyof typeof TEST_USERS = 'user') {
  const user = TEST_USERS[userType];
  
  // Create session cookie
  const sessionData = {
    userId: userType === 'admin' ? 1 : userType === 'moderator' ? 2 : userType === 'organizer' ? 3 : 4,
    email: user.email,
    role: user.role
  };
  
  // Generate JWT token
  const token = jwt.sign(sessionData, process.env.JWT_SECRET || 'test-secret-key', {
    expiresIn: '1d'
  });

  return request(API_BASE_URL)
    .set('Authorization', `Bearer ${token}`)
    .set('Cookie', [`connect.sid=test-session-${userType}`]);
}

// Helper to validate response time
export function validateResponseTime(startTime: number, threshold: number) {
  const duration = Date.now() - startTime;
  if (duration > threshold) {
    throw new Error(`Response time ${duration}ms exceeded threshold ${threshold}ms`);
  }
  return duration;
}

// Helper to validate Zod schema
export function validateSchema<T>(data: any, schema: z.ZodType<T>): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Schema validation failed:', error.errors);
      throw new Error(`Schema validation failed: ${JSON.stringify(error.errors)}`);
    }
    throw error;
  }
}

// Setup test database
export async function setupTestDatabase() {
  try {
    // Clear test data
    await db.delete(sessions);
    await db.delete(posts);
    await db.delete(events);
    await db.delete(groups);
    await db.delete(memories);
    
    // Create test users if they don't exist
    for (const [key, userData] of Object.entries(TEST_USERS)) {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);
        
      if (existingUser.length === 0) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await db.insert(users).values({
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          username: userData.username,
          isVerified: true,
          isActive: true
        });
      }
    }
    
    console.log('✅ Test database setup complete');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
}

// Cleanup test database
export async function cleanupTestDatabase() {
  try {
    // Delete test data created during tests
    await db.delete(sessions);
    await db.delete(posts);
    await db.delete(events); 
    await db.delete(groups);
    await db.delete(memories);
    
    console.log('✅ Test database cleanup complete');
  } catch (error) {
    console.error('❌ Failed to cleanup test database:', error);
  }
}

// Schema definitions for response validation
export const ErrorResponseSchema = z.object({
  success: z.boolean().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  statusCode: z.number().optional()
});

export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.any().optional(),
  message: z.string().optional()
});

export const PaginatedResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(z.any()),
  total: z.number().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  hasMore: z.boolean().optional()
});

// Common test utilities
export const TestUtils = {
  // Generate random test data
  generateTestPost: () => ({
    content: `Test post content ${Date.now()}`,
    mediaUrls: [],
    visibility: 'public'
  }),
  
  generateTestEvent: () => ({
    title: `Test Event ${Date.now()}`,
    description: 'Test event description',
    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    location: 'Buenos Aires, Argentina',
    category: 'milonga',
    maxAttendees: 50
  }),
  
  generateTestGroup: () => ({
    name: `Test Group ${Date.now()}`,
    description: 'Test group description',
    type: 'public',
    category: 'dance'
  }),
  
  generateTestMessage: () => ({
    content: `Test message ${Date.now()}`,
    recipientId: 2
  }),
  
  // Wait helper for async operations
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Retry helper for flaky operations
  retry: async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1) throw error;
        await TestUtils.wait(delay);
      }
    }
  }
};

// Export test runner configuration
export const testConfig = {
  setupFilesAfterEnv: ['./test-setup.ts'],
  testTimeout: TEST_TIMEOUT,
  maxConcurrency: 5,
  verbose: true
};