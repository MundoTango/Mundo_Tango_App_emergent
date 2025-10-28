/**
 * E2E Test: Error Handling - Vibe API Failure
 * 
 * User Journey:
 * 1. User sends request in Build mode
 * 2. Vibe API returns error
 * 3. System should show error toast
 * 4. System should fall back to chat streaming
 * 
 * Validation:
 * - Mock /api/vibe/execute to return 500 error
 * - Console log: "❌ [Vibe] Execution failed"
 * - Toast shows "Vibe coding failed"
 * - Chat streaming continues as fallback
 * - User gets text response even if vibe fails
 */

import { test, expect } from '@playwright/test';

test.describe('Error Handling - Vibe API Failure', () => {
  test('should handle 500 error from vibe API gracefully', async ({ page }) => {
    // Mock vibe API to return error
    await page.route('**/api/vibe/execute', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="mr-blue-toggle"]', { timeout: 10000 });
    
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    // Send message
    await page.locator('[data-testid="input-message"]').fill('Test error handling');
    await page.click('[data-testid="button-send-message"]');

    // Wait for error toast
    const errorToast = page.locator('[data-testid="toast"]').filter({ hasText: 'failed' });
    await expect(errorToast).toBeVisible({ timeout: 5000 });

    // Screenshot error state
    await page.screenshot({ path: 'evidence/screenshots/vibe-api-error.png', fullPage: true });
  });

  test('should fallback to chat streaming on vibe failure', async ({ page }) => {
    // Mock vibe API to fail
    await page.route('**/api/vibe/execute', route => {
      route.abort('failed');
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="mr-blue-toggle"]', { timeout: 10000 });
    
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    await page.locator('[data-testid="input-message"]').fill('Fallback test');
    await page.click('[data-testid="button-send-message"]');

    // Wait for chat response (fallback)
    await page.waitForTimeout(3000);

    // Should still get AI response via streaming
    const messages = page.locator('.message-bubble');
    await expect(messages).toHaveCount(2); // User + AI response
  });

  test('should handle network timeout', async ({ page }) => {
    // Mock vibe API to timeout
    await page.route('**/api/vibe/execute', route => {
      // Never resolve - simulate timeout
      new Promise(() => {});
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="mr-blue-toggle"]', { timeout: 10000 });
    
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-plan"]');

    await page.locator('[data-testid="input-message"]').fill('Timeout test');
    await page.click('[data-testid="button-send-message"]');

    // Should show error after timeout
    await page.waitForTimeout(5000);
    
    const errorToast = page.locator('[data-testid="toast"]').filter({ hasText: 'failed' });
    await expect(errorToast).toBeVisible({ timeout: 10000 });
  });

  test('should handle malformed JSON response', async ({ page }) => {
    // Mock vibe API to return invalid JSON
    await page.route('**/api/vibe/execute', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'invalid json {'
      });
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="mr-blue-toggle"]', { timeout: 10000 });
    
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    await page.locator('[data-testid="input-message"]').fill('JSON error test');
    await page.click('[data-testid="button-send-message"]');

    // Should handle parsing error
    await page.waitForTimeout(2000);
    
    const errorToast = page.locator('[data-testid="toast"]').filter({ hasText: 'failed' });
    await expect(errorToast).toBeVisible({ timeout: 5000 });
  });

  test('should handle missing codeChanges field', async ({ page }) => {
    // Mock vibe API to return incomplete response
    await page.route('**/api/vibe/execute', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success'
          // Missing codeChanges field
        })
      });
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="mr-blue-toggle"]', { timeout: 10000 });
    
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    await page.locator('[data-testid="input-message"]').fill('Missing data test');
    await page.click('[data-testid="button-send-message"]');

    // Should handle gracefully (no changes to apply)
    await page.waitForTimeout(2000);
    
    // Should not show error, just no changes applied
    const errorToast = page.locator('[data-testid="toast"]').filter({ hasText: 'failed' });
    await expect(errorToast).not.toBeVisible();
  });

  test('should retry on transient failures', async ({ page }) => {
    let attemptCount = 0;

    // Mock vibe API to fail first time, succeed second time
    await page.route('**/api/vibe/execute', route => {
      attemptCount++;
      
      if (attemptCount === 1) {
        route.fulfill({
          status: 503,
          body: JSON.stringify({ error: 'Service unavailable' })
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            codeChanges: []
          })
        });
      }
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="mr-blue-toggle"]', { timeout: 10000 });
    
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    await page.locator('[data-testid="input-message"]').fill('Retry test');
    await page.click('[data-testid="button-send-message"]');

    // Should eventually succeed after retry
    await page.waitForTimeout(5000);
    
    expect(attemptCount).toBeGreaterThan(1); // Retried at least once
  });
});
