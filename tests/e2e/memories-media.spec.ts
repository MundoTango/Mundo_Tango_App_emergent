/**
 * ESA LIFE CEO 61×21 - Memories & Media Handling Tests
 * Tests memory creation with media uploads, compression, and CDN delivery
 */

import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Memories + Media', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('/login');
    await page.getByTestId('input-email').fill('test@mundotango.com');
    await page.getByTestId('input-password').fill('testpass123');
    await page.getByTestId('button-submit').click();
    await expect(page).toHaveURL(/dashboard|feed|memories/);
  });

  test('Happy: Create memory with image upload', async ({ page }) => {
    await page.goto('/memories');
    await page.getByTestId('button-create-memory').click();
    
    // Fill content
    await page.getByTestId('input-memory-content').fill('Beautiful tango moment at the milonga! #tango #milonga');
    
    // Upload image - using a test fixture
    const fileInput = page.getByTestId('button-upload-image');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/test-image.jpg'));
    
    // Wait for upload preview
    await expect(page.getByTestId('image-preview')).toBeVisible({ timeout: 5000 });
    
    // Submit
    await page.getByTestId('button-submit-memory').click();
    
    // Verify success
    await expect(page.getByText('Memory shared successfully')).toBeVisible();
    
    // Verify memory appears in feed with image
    await expect(page.getByTestId('list-memories-feed')).toContainText('Beautiful tango moment');
    await expect(page.locator('[data-testid^="memory-image-"]')).toBeVisible();
  });

  test('Happy: Embed YouTube video URL', async ({ page }) => {
    await page.goto('/memories');
    await page.getByTestId('button-create-memory').click();
    
    await page.getByTestId('input-memory-content').fill('Check out this amazing tango performance!');
    await page.getByTestId('input-video-url').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await page.getByTestId('button-submit-memory').click();
    
    await expect(page.getByText('Memory shared successfully')).toBeVisible();
    
    // Verify video embed appears
    await expect(page.locator('iframe[src*="youtube.com"]')).toBeVisible();
  });

  test('Edge: Handle oversize file gracefully', async ({ page }) => {
    await page.goto('/memories');
    await page.getByTestId('button-create-memory').click();
    
    // Attempt to upload large file (simulated)
    // In real test, would use actual large file
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="button-upload-image"]') as HTMLInputElement;
      const file = new File(['x'.repeat(15 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    // Should show error for oversized file
    await expect(page.getByText(/file too large|maximum.*10MB/i)).toBeVisible();
  });

  test('Edge: Network throttling during upload', async ({ page, context }) => {
    // Simulate slow 3G
    await context.route('**/*', route => {
      setTimeout(() => route.continue(), 2000);
    });
    
    await page.goto('/memories');
    await page.getByTestId('button-create-memory').click();
    await page.getByTestId('input-memory-content').fill('Testing slow upload');
    
    // Should show upload progress
    const fileInput = page.getByTestId('button-upload-image');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/test-image.jpg'));
    
    await expect(page.getByTestId('upload-progress')).toBeVisible();
  });

  test('Failure: CDN/Storage failure fallback', async ({ page, context }) => {
    // Block Cloudinary uploads
    await context.route('**/cloudinary.com/**', route => {
      route.abort('failed');
    });
    
    await page.goto('/memories');
    await page.getByTestId('button-create-memory').click();
    
    const fileInput = page.getByTestId('button-upload-image');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/test-image.jpg'));
    
    // Should show error and allow retry
    await expect(page.getByText(/upload failed|try again/i)).toBeVisible();
    await expect(page.getByTestId('button-retry-upload')).toBeVisible();
  });
});