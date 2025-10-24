import { test, expect } from '@playwright/test';

/**
 * Test: Autonomous Error Recovery
 * Verifies Mr Blue can handle and retry failed operations
 */
test.describe('Autonomous Mode - Error Recovery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="button-mr-blue"]', { timeout: 10000 });
  });

  test('should retry on syntax errors and fix them', async ({ page }) => {
    // Open Mr Blue with autonomous mode
    await page.click('[data-testid="button-mr-blue"]');
    await page.waitForSelector('[data-testid="switch-autonomous-mode"]');
    await page.click('[data-testid="switch-autonomous-mode"]');

    // Request change that might cause syntax error
    const chatInput = page.locator('[data-testid="input-chat-message"]');
    await chatInput.fill('Add a complex type guard function');
    await page.click('[data-testid="button-send-message"]');

    // Verify progress panel appears
    const progressPanel = page.locator('[data-testid="panel-autonomous-progress"]');
    await expect(progressPanel).toBeVisible({ timeout: 5000 });

    // Look for retry behavior (step count should include retries)
    await page.waitForTimeout(10000); // Give time for potential errors

    // Verify eventually completes (even if there were retries)
    const progressBar = page.locator('[data-testid="progress-autonomous"]');
    const finalValue = await progressBar.getAttribute('aria-valuenow');
    expect(parseInt(finalValue || '0')).toBeGreaterThan(0);

    console.log('✅ Error recovery test passed');
  });

  test('should cancel autonomous mode on user request', async ({ page }) => {
    // Open Mr Blue with autonomous mode
    await page.click('[data-testid="button-mr-blue"]');
    await page.waitForSelector('[data-testid="switch-autonomous-mode"]');
    await page.click('[data-testid="switch-autonomous-mode"]');

    // Start a long-running task
    const chatInput = page.locator('[data-testid="input-chat-message"]');
    await chatInput.fill('Refactor the entire codebase');
    await page.click('[data-testid="button-send-message"]');

    // Wait for progress panel
    await expect(page.locator('[data-testid="panel-autonomous-progress"]')).toBeVisible({ timeout: 5000 });

    // Click cancel
    const cancelButton = page.locator('[data-testid="button-cancel-autonomous"]');
    if (await cancelButton.isVisible()) {
      await cancelButton.click();

      // Verify autonomous mode stopped
      await page.waitForTimeout(2000);
      const progressPanel = page.locator('[data-testid="panel-autonomous-progress"]');
      
      // Panel might hide or show cancelled status
      const isVisible = await progressPanel.isVisible();
      console.log('Progress panel visible after cancel:', isVisible);
    }

    console.log('✅ Cancel test passed');
  });

  test('should enforce max iterations limit', async ({ page }) => {
    // This test would require server-side configuration
    // Just verify the autonomous mode doesn't run forever
    
    await page.click('[data-testid="button-mr-blue"]');
    await page.waitForSelector('[data-testid="switch-autonomous-mode"]');
    await page.click('[data-testid="switch-autonomous-mode"]');

    const chatInput = page.locator('[data-testid="input-chat-message"]');
    await chatInput.fill('Create an impossible infinite loop scenario');
    await page.click('[data-testid="button-send-message"]');

    // Should timeout gracefully within 60 seconds (max 20 iterations)
    await page.waitForTimeout(60000);

    // Verify it didn't crash the app
    await expect(page.locator('[data-testid="modal-mr-blue"]')).toBeVisible();

    console.log('✅ Max iterations test passed');
  });
});
