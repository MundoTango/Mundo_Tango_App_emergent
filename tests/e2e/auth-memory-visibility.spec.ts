import { test, expect } from '@playwright/test';

test.describe('Memory Authentication and Visibility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to memories page
    await page.goto('http://localhost:3000/memories');
    await page.waitForLoadState('networkidle');
  });

  test('should load memories page with authentication', async ({ page }) => {
    // Check if memories page loads
    await expect(page.locator('h1:has-text("Memories")')).toBeVisible({ timeout: 10000 });
    
    // Check if user is authenticated (John Smith) - use first occurrence to avoid strict mode
    await expect(page.getByText('John Smith').first()).toBeVisible();
    
    // Verify memory creation interface is available
    await expect(page.locator('textarea[placeholder*="Share your tango moment"]')).toBeVisible();
  });

  test('should display existing memories with proper visibility', async ({ page }) => {
    // Wait for memories to load
    await page.waitForTimeout(5000);
    
    // Scroll down to see the memory feed (below creation form)
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(2000);
    
    // Check if memories are displayed using proper Playwright syntax
    await expect(page.getByText('Had an amazing tango class', { exact: false })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Practicing my ocho', { exact: false })).toBeVisible();
    await expect(page.getByText('Confitería Ideal', { exact: false })).toBeVisible();
  });

  test('should show privacy controls for memory creation', async ({ page }) => {
    // Check privacy dropdown is available
    await expect(page.locator('select, [data-testid="visibility-selector"]')).toBeVisible();
    
    // Verify privacy options
    const privacySelect = page.locator('select').first();
    const options = await privacySelect.locator('option').allTextContents();
    expect(options.some(opt => opt.includes('Public'))).toBeTruthy();
    expect(options.some(opt => opt.includes('Friends'))).toBeTruthy();
    expect(options.some(opt => opt.includes('Private'))).toBeTruthy();
  });
});