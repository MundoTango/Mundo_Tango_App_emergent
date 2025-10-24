import { test, expect } from '@playwright/test';

/**
 * Test: Simple Autonomous Change
 * Verifies Mr Blue can autonomously update button text
 */
test.describe('Autonomous Mode - Simple Change', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for auth
    await page.waitForSelector('[data-testid="button-mr-blue"]', { timeout: 10000 });
  });

  test('should enable autonomous mode and update button text', async ({ page }) => {
    // Step 1: Open Mr Blue
    await page.click('[data-testid="button-mr-blue"]');
    await page.waitForSelector('[data-testid="modal-mr-blue"]');

    // Step 2: Enable autonomous mode
    const autonomousToggle = page.locator('[data-testid="switch-autonomous-mode"]');
    await expect(autonomousToggle).toBeVisible();
    await autonomousToggle.click();

    // Verify toggle is enabled
    const toggleIcon = page.locator('[data-testid="icon-autonomous-active"]');
    await expect(toggleIcon).toBeVisible();

    // Step 3: Send autonomous request
    const chatInput = page.locator('[data-testid="input-chat-message"]');
    await chatInput.fill('Change the submit button text to "Send Now"');
    await page.click('[data-testid="button-send-message"]');

    // Step 4: Verify progress panel appears
    const progressPanel = page.locator('[data-testid="panel-autonomous-progress"]');
    await expect(progressPanel).toBeVisible({ timeout: 5000 });

    // Step 5: Wait for checkpoint creation
    await expect(page.locator('[data-testid="text-checkpoint-count"]')).toContainText('1', { timeout: 10000 });

    // Step 6: Verify current step updates
    const currentStep = page.locator('[data-testid="text-current-step"]');
    await expect(currentStep).toBeVisible();

    // Step 7: Wait for completion (progress bar reaches 100%)
    await expect(page.locator('[data-testid="progress-autonomous"]')).toHaveAttribute('aria-valuenow', '100', { timeout: 30000 });

    console.log('✅ Autonomous mode simple change test passed');
  });

  test('should require approval for high-risk changes', async ({ page }) => {
    // Open Mr Blue and enable autonomous
    await page.click('[data-testid="button-mr-blue"]');
    await page.waitForSelector('[data-testid="switch-autonomous-mode"]');
    await page.click('[data-testid="switch-autonomous-mode"]');

    // Request a destructive change
    const chatInput = page.locator('[data-testid="input-chat-message"]');
    await chatInput.fill('Delete the user authentication system');
    await page.click('[data-testid="button-send-message"]');

    // Verify approval modal appears
    const approvalModal = page.locator('[data-testid="modal-approval"]');
    await expect(approvalModal).toBeVisible({ timeout: 5000 });

    // Verify risk level is HIGH
    await expect(page.locator('[data-testid="badge-risk-level"]')).toContainText('HIGH');

    // Reject the change
    await page.click('[data-testid="button-reject"]');
    await expect(approvalModal).not.toBeVisible();

    console.log('✅ Approval workflow test passed');
  });
});
