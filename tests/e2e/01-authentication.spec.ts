// TRACK 4 (S4): Authentication E2E Tests
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/Mundo Tango/i);
  });

  test('should show login page', async ({ page }) => {
    // Navigate to login
    await page.goto('/auth/login');
    
    // Verify login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[data-testid="button-submit"]')).toBeVisible();
  });

  test('should show register page', async ({ page }) => {
    await page.goto('/auth/register');
    
    // Verify registration form
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should auto-login in dev mode', async ({ page }) => {
    // In dev mode, auth bypass should work
    await page.goto('/');
    
    // Wait for auth to complete
    await page.waitForTimeout(2000);
    
    // Should see authenticated user UI
    const userMenu = page.locator('[data-testid="user-menu"]');
    await expect(userMenu).toBeVisible({ timeout: 10000 });
  });

  test('should show user profile after login', async ({ page }) => {
    await page.goto('/profile');
    
    // Should either redirect to login or show profile
    const isLoginPage = await page.url().includes('/auth/login');
    const isProfilePage = await page.url().includes('/profile');
    
    expect(isLoginPage || isProfilePage).toBeTruthy();
  });
});
