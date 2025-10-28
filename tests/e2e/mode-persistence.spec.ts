/**
 * E2E Test: Mode Toggle Persistence
 * 
 * User Journey:
 * 1. User selects Build mode
 * 2. User sends a message
 * 3. User refreshes page or closes/reopens chat
 * 4. Mode should persist (localStorage)
 * 
 * Validation:
 * - executionMode saved to localStorage
 * - After page reload, correct mode is active
 * - Button state matches localStorage value
 */

import { test, expect } from '@playwright/test';

test.describe('Mode Toggle Persistence', () => {
  test('should persist mode selection in localStorage', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mr-blue-toggle"]', { timeout: 10000 });
    
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    // Check localStorage
    const storedMode = await page.evaluate(() => {
      return localStorage.getItem('mr-blue-execution-mode');
    });

    expect(storedMode).toBe('build');
  });

  test('should restore mode after page reload', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mr-blue-toggle"]', { timeout: 10000 });
    
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-plan"]');

    // Reload page
    await page.reload();
    await page.waitForSelector('[data-testid="mr-blue-toggle"]', { timeout: 10000 });
    
    await page.click('[data-testid="mr-blue-toggle"]');

    // Plan mode should still be active
    const planButton = page.locator('[data-testid="button-mode-plan"]');
    await expect(planButton).toHaveClass(/bg-cyan-500/);
  });

  test('should restore mode after closing and reopening chat', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mr-blue-toggle"]', { timeout: 10000 });
    
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    // Close chat
    await page.click('[data-testid="button-close-chat"]');

    // Reopen chat
    await page.click('[data-testid="mr-blue-toggle"]');

    // Build mode should still be active
    const buildButton = page.locator('[data-testid="button-mode-build"]');
    await expect(buildButton).toHaveClass(/bg-green-500/);
  });

  test('should default to Plan mode for new users', async ({ page }) => {
    // Clear localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('mr-blue-execution-mode');
    });

    await page.waitForSelector('[data-testid="mr-blue-toggle"]', { timeout: 10000 });
    await page.click('[data-testid="mr-blue-toggle"]');

    // Plan mode should be default
    const planButton = page.locator('[data-testid="button-mode-plan"]');
    await expect(planButton).toHaveClass(/bg-cyan-500/);
  });

  test('should sync mode across browser tabs', async ({ context }) => {
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Tab 1: Select Build mode
    await page1.goto('/');
    await page1.waitForSelector('[data-testid="mr-blue-toggle"]', { timeout: 10000 });
    await page1.click('[data-testid="mr-blue-toggle"]');
    await page1.click('[data-testid="button-mode-build"]');

    // Tab 2: Should reflect Build mode
    await page2.goto('/');
    await page2.waitForSelector('[data-testid="mr-blue-toggle"]', { timeout: 10000 });
    await page2.click('[data-testid="mr-blue-toggle"]');

    const buildButton = page2.locator('[data-testid="button-mode-build"]');
    await expect(buildButton).toHaveClass(/bg-green-500/);
  });
});
