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
    
    // Check if user is authenticated (John Smith) - use more specific selector
    await expect(page.locator('h3:has-text("John Smith")')).toBeVisible();
    
    // Verify memory creation interface is available
    await expect(page.locator('textarea[placeholder*="Share your tango moment"]')).toBeVisible();
  });

  test('should display existing memories with proper visibility', async ({ page }) => {
    // Wait for memories to load
    await page.waitForTimeout(3000);
    
    // Check if memories are displayed (should show 5 memories)
    const memoryCards = page.locator('.card, .post, .memory');
    await expect(memoryCards).toHaveCount(5, { timeout: 10000 });
    
    // Verify memory content is visible
    await expect(page.locator('text="Had an amazing tango class today"')).toBeVisible();
    await expect(page.locator('text="Practicing my ocho cortado"')).toBeVisible();
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