/**
 * Authentication Flow E2E Tests
 * Phase 12: Integration Testing
 * Tests: Registration, Login, Logout flows
 */

import { test, expect } from '@playwright/test';
import { registerUser, loginUser, logoutUser, isAuthenticated } from '../helpers/auth-helpers';
import { testUsers, createTestUser } from '../fixtures/users';

test.describe('Authentication Flow', () => {
  test('should register a new user successfully', async ({ page }) => {
    const newUser = createTestUser();
    
    await registerUser(page, newUser);
    
    // Verify user is authenticated
    const authenticated = await isAuthenticated(page);
    expect(authenticated).toBe(true);
    
    // Verify URL changed to feed/dashboard
    expect(page.url()).toMatch(/\/(feed|home|dashboard)/);
  });

  test('should login with valid credentials', async ({ page }) => {
    // First register a user
    const user = createTestUser();
    await registerUser(page, user);
    await logoutUser(page);
    
    // Now login with same credentials
    await loginUser(page, {
      email: user.email,
      password: user.password,
    });
    
    // Verify user is authenticated
    const authenticated = await isAuthenticated(page);
    expect(authenticated).toBe(true);
  });

  test('should fail login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="input-email"]', testUsers.invalidCredentials.email);
    await page.fill('[data-testid="input-password"]', testUsers.invalidCredentials.password);
    await page.click('[data-testid="button-submit"]');
    
    // Should stay on login page or show error
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/login');
  });

  test('should logout successfully', async ({ page }) => {
    // Register and login
    const user = createTestUser();
    await registerUser(page, user);
    
    // Logout
    await logoutUser(page);
    
    // Verify user is not authenticated
    const authenticated = await isAuthenticated(page);
    expect(authenticated).toBe(false);
  });

  test('should persist authentication across page reloads', async ({ page }) => {
    // Register user
    const user = createTestUser();
    await registerUser(page, user);
    
    // Reload page
    await page.reload();
    
    // Verify still authenticated
    const authenticated = await isAuthenticated(page);
    expect(authenticated).toBe(true);
  });

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    await page.goto('/profile');
    
    // Should redirect to login or home
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/(login|home|$)/);
  });
});
