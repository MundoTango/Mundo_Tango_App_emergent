import { test, expect } from '@playwright/test';

test.describe('Memory Media and Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/memories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  });

  test('should have functional memory creation form', async ({ page }) => {
    // Test memory creation textarea
    const textarea = page.locator('textarea[placeholder*="Share your tango moment"]');
    await expect(textarea).toBeVisible();
    
    // Test typing in memory creation
    await textarea.fill('Test memory: Amazing tango class at La Viruta! #milonga #test');
    await expect(textarea).toHaveValue(/Test memory.*La Viruta/);
  });

  test('should have tag system functionality', async ({ page }) => {
    // Check for tag buttons
    await expect(page.locator('button:has-text("Milonga")')).toBeVisible();
    await expect(page.locator('button:has-text("Práctica")')).toBeVisible();
    await expect(page.locator('button:has-text("Performance")')).toBeVisible();
    
    // Test clicking a tag
    await page.locator('button:has-text("Milonga")').click();
    await page.waitForTimeout(500);
    
    // Verify tag selection (visual feedback)
    const milongaTag = page.locator('button:has-text("Milonga")');
    const tagClass = await milongaTag.getAttribute('class');
    expect(tagClass).toContain('turquoise'); // Should have selected styling
  });

  test('should have location input functionality', async ({ page }) => {
    // Check for location input
    const locationInput = page.locator('input[placeholder*="location"], input[placeholder*="business"]');
    await expect(locationInput).toBeVisible();
    
    // Test location input
    await locationInput.fill('La Viruta, Buenos Aires');
    await expect(locationInput).toHaveValue('La Viruta, Buenos Aires');
  });

  test('should have upload functionality available', async ({ page }) => {
    // Check for upload button/interface
    const uploadButton = page.locator('button:has-text("Upload"), [data-testid*="upload"]');
    await expect(uploadButton).toBeVisible();
    
    // Verify upload specifications are mentioned using correct Playwright syntax
    await expect(page.getByText('500MB', { exact: false })).toBeVisible();
    await expect(page.getByText('30 files', { exact: false })).toBeVisible();
  });

  test('should have share memory functionality', async ({ page }) => {
    // Check for share memory button
    const shareButton = page.locator('button:has-text("Share Memory"), button:has-text("Share")');
    await expect(shareButton).toBeVisible();
    
    // Verify button is initially disabled (no content)
    const isDisabled = await shareButton.isDisabled();
    expect(isDisabled).toBeTruthy();
  });
});