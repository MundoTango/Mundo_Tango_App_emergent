/**
 * Test Memory/Post Fixtures
 * Phase 12: Integration Testing
 */

export const testMemories = {
  simplePost: {
    content: 'Test memory post from E2E test',
    type: 'memory',
    visibility: 'public',
  },
  
  postWithLocation: {
    content: 'Memory with location from E2E test',
    type: 'memory',
    visibility: 'public',
    location: {
      city: 'Buenos Aires',
      country: 'Argentina',
      latitude: -34.6037,
      longitude: -58.3816,
    },
  },
  
  privatePost: {
    content: 'Private memory post from E2E test',
    type: 'memory',
    visibility: 'private',
  },
  
  postWithHashtags: {
    content: 'Test post with #tango #dance #community hashtags',
    type: 'memory',
    visibility: 'public',
  },
};

export const createTestMemory = (overrides = {}) => ({
  content: `Test memory created at ${new Date().toISOString()}`,
  type: 'memory',
  visibility: 'public',
  ...overrides,
});
