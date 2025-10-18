/**
 * Authentication Helper Functions
 * Phase 12: Integration Testing
 */

import { Page, expect } from '@playwright/test';

export async function registerUser(page: Page, userData: {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  city?: string;
  country?: string;
}) {
  await page.goto('/register');
  
  // Fill registration form
  await page.fill('[data-testid="input-username"]', userData.username);
  await page.fill('[data-testid="input-email"]', userData.email);
  await page.fill('[data-testid="input-password"]', userData.password);
  await page.fill('[data-testid="input-confirm-password"]', userData.password);
  
  if (userData.fullName) {
    await page.fill('[data-testid="input-name"]', userData.fullName);
  }
  
  // Accept terms and privacy
  await page.check('[data-testid="checkbox-terms"]');
  await page.check('[data-testid="checkbox-privacy"]');
  
  // Submit form
  await page.click('[data-testid="button-submit"]');
  
  // Wait for successful registration (redirects to onboarding)
  await expect(page).toHaveURL(/\/(onboarding|feed|home|dashboard)/);
}

export async function loginUser(page: Page, credentials: {
  email: string;
  password: string;
}) {
  await page.goto('/login');
  
  // Fill login form
  await page.fill('[data-testid="input-email"]', credentials.email);
  await page.fill('[data-testid="input-password"]', credentials.password);
  
  // Submit form
  await page.click('[data-testid="button-submit"]');
  
  // Wait for successful login
  await expect(page).toHaveURL(/\/(feed|home|dashboard)/);
}

export async function logoutUser(page: Page) {
  // Click profile/menu button
  await page.click('[data-testid="button-menu"]');
  
  // Click logout
  await page.click('[data-testid="button-logout"]');
  
  // Wait for redirect to login/home
  await expect(page).toHaveURL(/\/(login|home|$)/);
}

export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // Check if user menu or profile button exists
    const profileButton = await page.locator('[data-testid="button-menu"]').count();
    return profileButton > 0;
  } catch {
    return false;
  }
}

export async function getAuthToken(page: Page): Promise<string | null> {
  // Get auth token from localStorage
  return await page.evaluate(() => {
    return localStorage.getItem('auth-token') || null;
  });
}
