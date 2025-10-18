/**
 * Auth API Integration Tests
 * Phase 12: Integration Testing
 */

import { test, expect } from '@playwright/test';
import { apiRegister, apiLogin } from '../../helpers/api-helpers';
import { createTestUser } from '../../fixtures/users';

test.describe('Auth API', () => {
  test('POST /api/auth/register - should create new user', async ({ request }) => {
    const newUser = createTestUser();
    
    const response = await apiRegister(request, {
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
    });
    
    expect(response).toHaveProperty('user');
    expect(response).toHaveProperty('token');
    expect(response.user.username).toBe(newUser.username);
    expect(response.user.email).toBe(newUser.email);
  });

  test('POST /api/auth/register - should fail with duplicate username', async ({ request }) => {
    const user = createTestUser();
    
    // Register once
    await apiRegister(request, {
      username: user.username,
      email: user.email,
      password: user.password,
    });
    
    // Try to register again with same username
    const response = await request.post('/api/auth/register', {
      data: {
        username: user.username,
        email: `different_${user.email}`,
        password: user.password,
      },
    });
    
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(409); // Conflict
  });

  test('POST /api/auth/login - should return token for valid credentials', async ({ request }) => {
    const user = createTestUser();
    
    // Register user
    await apiRegister(request, {
      username: user.username,
      email: user.email,
      password: user.password,
    });
    
    // Login
    const loginResponse = await apiLogin(request, {
      username: user.username,
      password: user.password,
    });
    
    expect(loginResponse).toHaveProperty('token');
    expect(loginResponse).toHaveProperty('user');
    expect(loginResponse.user.username).toBe(user.username);
  });

  test('POST /api/auth/login - should fail with invalid credentials', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        username: 'nonexistent_user',
        password: 'wrongpassword',
      },
    });
    
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(401); // Unauthorized
  });

  test('GET /api/auth/me - should return current user with valid token', async ({ request }) => {
    const user = createTestUser();
    
    // Register and get token
    const registerResponse = await apiRegister(request, {
      username: user.username,
      email: user.email,
      password: user.password,
    });
    
    const token = registerResponse.token;
    
    // Get current user
    const meResponse = await request.get('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    expect(meResponse.ok()).toBeTruthy();
    const data = await meResponse.json();
    expect(data.username).toBe(user.username);
  });

  test('GET /api/auth/me - should fail without token', async ({ request }) => {
    const response = await request.get('/api/auth/me');
    
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(401); // Unauthorized
  });
});
