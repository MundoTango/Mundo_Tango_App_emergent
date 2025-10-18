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
  
  if (userData.fullName) {
    await page.fill('[data-testid="input-fullname"]', userData.fullName);
  }
  
  if (userData.city) {
    await page.fill('[data-testid="input-city"]', userData.city);
  }
  
  // Submit form
  await page.click('[data-testid="button-register"]');
  
  // Wait for successful registration
  await expect(page).toHaveURL(/\/(feed|home|dashboard)/);
}

export async function loginUser(page: Page, credentials: {
  username: string;
  password: string;
}) {
  await page.goto('/login');
  
  // Fill login form
  await page.fill('[data-testid="input-username"]', credentials.username);
  await page.fill('[data-testid="input-password"]', credentials.password);
  
  // Submit form
  await page.click('[data-testid="button-login"]');
  
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
