/**
 * Test User Fixtures
 * Phase 12: Integration Testing
 */

export const testUsers = {
  validUser: {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@mundotango.test`,
    password: 'TestPassword123!',
    fullName: 'Test User',
    city: 'Buenos Aires',
    country: 'Argentina',
  },
  
  secondUser: {
    username: `testuser2_${Date.now()}`,
    email: `test2_${Date.now()}@mundotango.test`,
    password: 'TestPassword456!',
    fullName: 'Second Test User',
    city: 'New York',
    country: 'United States',
  },
  
  invalidCredentials: {
    username: 'nonexistent',
    email: 'invalid@mundotango.test',
    password: 'WrongPassword',
  },
};

export const createTestUser = () => ({
  username: `testuser_${Date.now()}_${Math.random().toString(36).slice(2)}`,
  email: `test_${Date.now()}_${Math.random().toString(36).slice(2)}@mundotango.test`,
  password: 'TestPassword123!',
  fullName: 'Generated Test User',
  city: 'Buenos Aires',
  country: 'Argentina',
});
