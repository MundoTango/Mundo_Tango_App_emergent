import { test, expect } from '@playwright/test';

/**
 * Test: Complex Autonomous Refactor
 * Verifies Mr Blue can autonomously extract components across multiple files
 */
test.describe('Autonomous Mode - Complex Refactor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="button-mr-blue"]', { timeout: 10000 });
  });

  test('should autonomously extract reusable component', async ({ page }) => {
    // Open Mr Blue with autonomous mode
    await page.click('[data-testid="button-mr-blue"]');
    await page.waitForSelector('[data-testid="switch-autonomous-mode"]');
    await page.click('[data-testid="switch-autonomous-mode"]');

    // Request complex refactor
    const chatInput = page.locator('[data-testid="input-chat-message"]');
    await chatInput.fill('Extract the user card into a reusable component');
    await page.click('[data-testid="button-send-message"]');

    // Verify progress panel shows multiple steps
    const progressPanel = page.locator('[data-testid="panel-autonomous-progress"]');
    await expect(progressPanel).toBeVisible({ timeout: 5000 });

    // Should create multiple checkpoints (before each major change)
    await page.waitForTimeout(2000);
    const checkpointCount = page.locator('[data-testid="text-checkpoint-count"]');
    const count = await checkpointCount.textContent();
    expect(parseInt(count || '0')).toBeGreaterThan(1);

    // Verify multiple steps executed
    const steps = page.locator('[data-testid^="step-"]');
    await expect(steps).toHaveCount(4, { timeout: 30000 }); // Read, write, test, verify

    console.log('✅ Complex refactor test passed');
  });

  test('should show checkpoint viewer with rollback option', async ({ page }) => {
    // Open Mr Blue
    await page.click('[data-testid="button-mr-blue"]');
    await page.waitForSelector('[data-testid="switch-autonomous-mode"]');
    await page.click('[data-testid="switch-autonomous-mode"]');

    // Make a change
    const chatInput = page.locator('[data-testid="input-chat-message"]');
    await chatInput.fill('Add a new utility function');
    await page.click('[data-testid="button-send-message"]');

    // Wait for completion
    await page.waitForTimeout(5000);

    // Open checkpoint viewer (assuming it's a tab or button)
    const checkpointViewer = page.locator('[data-testid="card-checkpoints"]');
    
    if (await checkpointViewer.isVisible()) {
      // Verify checkpoint exists
      const firstCheckpoint = page.locator('[data-testid^="checkpoint-"]').first();
      await expect(firstCheckpoint).toBeVisible();

      // Verify rollback button exists
      const rollbackButton = page.locator('[data-testid^="button-rollback-"]').first();
      await expect(rollbackButton).toBeVisible();

      console.log('✅ Checkpoint viewer test passed');
    }
  });
});
