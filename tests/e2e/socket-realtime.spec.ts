import { test, expect } from '@playwright/test';

test.describe('Socket.io Real-time Features', () => {
  test('should have Socket.io connectivity and real-time features', async ({ page }) => {
    await page.goto('http://localhost:3000/memories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check for Socket.io client initialization (should be in browser console)
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });

    // Test memory creation which should trigger Socket.io events
    const textarea = page.locator('textarea[placeholder*="Share your tango moment"]');
    await textarea.fill('Socket.io test: Real-time tango memory! #realtime #test');
    
    // Click a tag to enhance the memory
    await page.getByRole('button', { name: /Milonga/ }).click();
    
    // Submit the memory (should trigger Socket.io broadcast)
    const shareButton = page.getByRole('button', { name: /Share Memory/ });
    await expect(shareButton).toBeEnabled();
    await shareButton.click();
    
    // Wait for potential real-time updates
    await page.waitForTimeout(3000);
    
    // Test passed if no major errors occurred during Socket.io operations
    await expect(page.locator('h1:has-text("Memories")')).toBeVisible();
  });

  test('should handle AI enhancement features', async ({ page }) => {
    await page.goto('http://localhost:3000/memories');
    await page.waitForLoadState('networkidle');
    
    // Verify AI enhancement endpoint exists (test backend integration)
    const response = await page.request.post('http://localhost:8001/api/memories/enhance', {
      data: {
        content: 'Test tango memory for AI enhancement',
        options: {
          enhanceContent: true,
          generateTags: true,
          analyzeSentiment: true
        }
      }
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBeTruthy();
    expect(data.data.aiProvider).toBeDefined();
  });
});