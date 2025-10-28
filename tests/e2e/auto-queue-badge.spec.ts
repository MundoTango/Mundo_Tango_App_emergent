/**
 * E2E Test: Auto-Queue Badge - Change Tracking
 * 
 * User Journey:
 * 1. User makes changes in Build mode
 * 2. Auto-queue badge shows count
 * 3. User makes more changes
 * 4. Badge count increments
 * 5. User can click badge to see pending changes
 * 
 * Validation:
 * - Badge initially hidden or shows 0
 * - Badge appears after first change
 * - Badge count increments correctly
 * - Clicking badge shows pending changes dropdown
 * - Dropdown lists all queued changes
 * - Screenshot: Badge with count visible
 */

import { test, expect } from '@playwright/test';

test.describe('Auto-Queue Badge - Change Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mr-blue-toggle"]', { timeout: 10000 });
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');
  });

  test('should show badge after first code change', async ({ page }) => {
    // Initially, badge should not be visible or show 0
    const badge = page.locator('[data-testid="auto-queue-badge"]');
    const initiallyVisible = await badge.isVisible().catch(() => false);
    
    if (initiallyVisible) {
      await expect(badge).toHaveText('0');
    }

    // Make a change
    await page.locator('[data-testid="input-message"]').fill('Add a title');
    await page.click('[data-testid="button-send-message"]');
    
    // Wait for change to process
    await page.waitForTimeout(3000);

    // Badge should now be visible with count 1
    await expect(badge).toBeVisible({ timeout: 5000 });
    await expect(badge).toHaveText('1');

    // Take screenshot
    await page.screenshot({ path: 'evidence/screenshots/auto-queue-badge-one-change.png', fullPage: true });
  });

  test('should increment badge count for multiple changes', async ({ page }) => {
    const badge = page.locator('[data-testid="auto-queue-badge"]');

    // First change
    await page.locator('[data-testid="input-message"]').fill('Add a heading');
    await page.click('[data-testid="button-send-message"]');
    await page.waitForTimeout(2000);
    await expect(badge).toHaveText('1');

    // Second change
    await page.locator('[data-testid="input-message"]').fill('Add a button');
    await page.click('[data-testid="button-send-message"]');
    await page.waitForTimeout(2000);
    await expect(badge).toHaveText('2');

    // Third change
    await page.locator('[data-testid="input-message"]').fill('Add an image');
    await page.click('[data-testid="button-send-message"]');
    await page.waitForTimeout(2000);
    await expect(badge).toHaveText('3');

    // Take screenshot
    await page.screenshot({ path: 'evidence/screenshots/auto-queue-badge-multiple-changes.png', fullPage: true });
  });

  test('should show pending changes dropdown when clicked', async ({ page }) => {
    // Make changes first
    await page.locator('[data-testid="input-message"]').fill('Add content');
    await page.click('[data-testid="button-send-message"]');
    await page.waitForTimeout(2000);

    // Click badge
    const badge = page.locator('[data-testid="auto-queue-badge"]');
    await badge.click();

    // Dropdown should appear
    const dropdown = page.locator('[data-testid="pending-changes-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // Dropdown should list changes
    const changeItems = dropdown.locator('[data-testid^="pending-change-"]');
    await expect(changeItems).toHaveCount(1);

    // Each item should show file path
    const firstItem = changeItems.first();
    await expect(firstItem).toBeVisible();
    const itemText = await firstItem.textContent();
    expect(itemText).toContain('.tsx'); // File extension

    // Take screenshot
    await page.screenshot({ path: 'evidence/screenshots/pending-changes-dropdown.png', fullPage: true });
  });

  test('should reset badge count after SAVE', async ({ page }) => {
    // Make changes
    await page.locator('[data-testid="input-message"]').fill('Add content');
    await page.click('[data-testid="button-send-message"]');
    await page.waitForTimeout(2000);

    const badge = page.locator('[data-testid="auto-queue-badge"]');
    await expect(badge).toHaveText('1');

    // Click SAVE button
    const saveButton = page.locator('[data-testid="button-save"]');
    await saveButton.click();

    // Wait for save to complete
    await page.waitForTimeout(2000);

    // Badge should reset to 0 or hide
    const badgeVisible = await badge.isVisible().catch(() => false);
    if (badgeVisible) {
      await expect(badge).toHaveText('0');
    }
  });

  test('should show correct file paths in dropdown', async ({ page }) => {
    // Make a change that affects a specific file
    await page.locator('[data-testid="input-message"]').fill('Modify HomePage component');
    await page.click('[data-testid="button-send-message"]');
    await page.waitForTimeout(3000);

    // Open dropdown
    await page.locator('[data-testid="auto-queue-badge"]').click();

    // Verify file path is shown
    const dropdown = page.locator('[data-testid="pending-changes-dropdown"]');
    await expect(dropdown).toContainText('Home'); // Component name
  });
});
