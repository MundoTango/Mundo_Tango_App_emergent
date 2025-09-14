/**
 * ESA LIFE CEO 61x21 - Vitest Setup File
 * Backend testing environment configuration
 */

import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Mock modules
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'Mock AI response',
              role: 'assistant'
            }
          }]
        })
      }
    }
  }))
}));

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    auth: {
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    }))
  })
}));

// Mock Redis client
vi.mock('ioredis', () => ({
  default: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    expire: vi.fn(),
    ttl: vi.fn(),
    keys: vi.fn(),
    flushdb: vi.fn()
  }))
}));

// Mock email services
vi.mock('@sendgrid/mail', () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn().mockResolvedValue([{ statusCode: 202 }])
  }
}));

// Global test utilities
global.testUtils = {
  generateId: () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  generateEmail: () => `test.${Date.now()}@example.com`,
  generateToken: () => 'test-token-' + Math.random().toString(36).substr(2)
};

// Database setup
beforeAll(async () => {
  console.log('🧪 ESA LIFE CEO 61x21 Backend Testing Framework Initialized');
  
  // Initialize test database if needed
  if (process.env.TEST_DATABASE_URL) {
    // Setup test database schema
  }
});

// Database cleanup
afterAll(async () => {
  console.log('✅ ESA LIFE CEO 61x21 Backend Testing Framework Cleanup Complete');
  
  // Clean up test database if needed
  if (process.env.TEST_DATABASE_URL) {
    // Cleanup test data
  }
  
  vi.clearAllMocks();
  vi.resetAllMocks();
});

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Performance monitoring for tests
if (process.env.MONITOR_TEST_PERFORMANCE === 'true') {
  let testStartTime: number;
  
  beforeEach(() => {
    testStartTime = Date.now();
  });
  
  afterEach((context) => {
    const duration = Date.now() - testStartTime;
    if (duration > 1000) {
      console.warn(`⚠️ Slow test detected: ${context.task.name} took ${duration}ms`);
    }
  });
}

export { vi };