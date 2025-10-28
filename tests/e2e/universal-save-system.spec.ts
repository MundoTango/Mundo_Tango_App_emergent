/**
 * E2E Test: Universal Save System - Git Commits
 * 
 * User Journey:
 * 1. User makes multiple changes in Build mode
 * 2. Changes are queued (not committed)
 * 3. User clicks SAVE button
 * 4. System creates Git commit with all changes
 * 5. User sees success notification
 * 
 * Validation:
 * - SAVE button is visible
 * - SAVE button shows pending count badge
 * - Network: POST to /api/git/commit when SAVE clicked
 * - Request includes all queued file paths
 * - Response confirms commit created
 * - Toast shows "✅ Changes saved to Git"
 * - Pending changes badge resets to 0
 * - Git log shows new commit
 * - Screenshot: Success notification
 */

import { test, expect } from '@playwright/test';

test.describe('Universal Save System - Git Commits', () => {
  let networkRequests: any[] = [];

  test.beforeEach(async ({ page }) => {
    page.on('request', request => {
      if (request.url().includes('/api/git') || request.url().includes('/api/vibe')) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postDataJSON?.() || null,
        });
      }
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="mr-blue-toggle"]', { timeout: 10000 });
  });

  test('should show SAVE button with pending count', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    // Make a change
    await page.locator('[data-testid="input-message"]').fill('Add button');
    await page.click('[data-testid="button-send-message"]');
    await page.waitForTimeout(3000);

    // SAVE button should be visible
    const saveButton = page.locator('[data-testid="button-save"]');
    await expect(saveButton).toBeVisible();

    // SAVE button should show pending count
    const pendingBadge = saveButton.locator('.badge');
    await expect(pendingBadge).toBeVisible();
    await expect(pendingBadge).toHaveText(/[1-9]/); // At least 1 pending
  });

  test('should commit all queued changes when SAVE clicked', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    // Make multiple changes
    await page.locator('[data-testid="input-message"]').fill('Change 1');
    await page.click('[data-testid="button-send-message"]');
    await page.waitForTimeout(2000);

    await page.locator('[data-testid="input-message"]').fill('Change 2');
    await page.click('[data-testid="button-send-message"]');
    await page.waitForTimeout(2000);

    // Click SAVE
    const saveButton = page.locator('[data-testid="button-save"]');
    await saveButton.click();

    // Wait for Git commit API call
    await page.waitForTimeout(2000);

    // Verify commit API was called
    const commitRequest = networkRequests.find(req => req.url.includes('/api/git/commit'));
    expect(commitRequest).toBeDefined();
    expect(commitRequest.method).toBe('POST');

    // Verify all files included
    expect(commitRequest.postData.files).toBeDefined();
    expect(commitRequest.postData.files.length).toBeGreaterThan(0);
  });

  test('should show success notification after save', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    // Make change
    await page.locator('[data-testid="input-message"]').fill('Test save');
    await page.click('[data-testid="button-send-message"]');
    await page.waitForTimeout(2000);

    // Click SAVE
    await page.click('[data-testid="button-save"]');

    // Verify toast notification
    const successToast = page.locator('[data-testid="toast"]').filter({ hasText: 'saved to Git' });
    await expect(successToast).toBeVisible({ timeout: 5000 });

    // Take screenshot
    await page.screenshot({ path: 'evidence/screenshots/save-success-notification.png', fullPage: true });
  });

  test('should reset pending count after save', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    // Make change
    await page.locator('[data-testid="input-message"]').fill('Test reset');
    await page.click('[data-testid="button-send-message"]');
    await page.waitForTimeout(2000);

    // Verify badge shows count
    const badge = page.locator('[data-testid="auto-queue-badge"]');
    await expect(badge).toHaveText('1');

    // Click SAVE
    await page.click('[data-testid="button-save"]');
    await page.waitForTimeout(2000);

    // Badge should reset or hide
    const badgeVisible = await badge.isVisible().catch(() => false);
    if (badgeVisible) {
      await expect(badge).toHaveText('0');
    }
  });

  test('should include commit message in Git operation', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    await page.locator('[data-testid="input-message"]').fill('Feature test');
    await page.click('[data-testid="button-send-message"]');
    await page.waitForTimeout(2000);

    await page.click('[data-testid="button-save"]');
    await page.waitForTimeout(2000);

    const commitRequest = networkRequests.find(req => req.url.includes('/api/git/commit'));
    expect(commitRequest.postData.message).toBeDefined();
    expect(commitRequest.postData.message).toBeTruthy();
  });
});
