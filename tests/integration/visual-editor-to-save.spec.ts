import { test, expect } from '@playwright/test';
import { loginAsSuperAdmin, waitForRealtimeConnections } from '../helpers/auth';
import { takeScreenshot } from '../helpers/screenshots';
import { validate5Layers, assertSaveBadgeCount } from '../helpers/assertions';

test.describe('Integration: Visual Editor → SAVE → Git', () => {
  test('Visual editor changes queue and commit via SAVE button', async ({ page }) => {
    const testName = 'visual-editor-to-save';
    
    // Step 1: Authenticate
    await loginAsSuperAdmin(page);
    await waitForRealtimeConnections(page);
    await takeScreenshot(page, testName, '01-authenticated');
    
    // Step 2: Open Visual Editor tab
    await page.click('[data-testid="tab-visual-editor"], [data-testid="button-visual-editor"]');
    await page.waitForSelector('[data-testid="visual-editor-canvas"]', { timeout: 10000 });
    await takeScreenshot(page, testName, '02-visual-editor-opened');
    
    // Step 3: Enable edit mode
    const editButton = page.locator('[data-testid="button-edit-mode"], [data-testid="toggle-edit-mode"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(500);
    }
    await takeScreenshot(page, testName, '03-edit-mode-enabled');
    
    // Step 4: Click on an element (heading or button)
    const clickableElement = page.locator('h1, h2, button').first();
    await clickableElement.click();
    await takeScreenshot(page, testName, '04-element-selected');
    
    // Step 5: Open Inspector panel if not visible
    const inspector = page.locator('[data-testid="panel-inspector"]');
    if (!(await inspector.isVisible())) {
      await page.click('[data-testid="tab-inspector"]');
    }
    await takeScreenshot(page, testName, '05-inspector-opened');
    
    // Step 6: Make a style change (e.g., change text size)
    const styleInput = page.locator('[data-testid="input-font-size"], input[placeholder*="size"]').first();
    if (await styleInput.isVisible()) {
      await styleInput.fill('24');
      await styleInput.press('Enter');
    }
    await takeScreenshot(page, testName, '06-style-changed');
    
    // Step 7: Verify SAVE badge shows queued changes
    await page.waitForTimeout(2000); // Give time for change to queue
    await assertSaveBadgeCount(page, 1);
    await takeScreenshot(page, testName, '07-save-badge-updated');
    
    // Step 8: Click SAVE button
    await page.click('[data-testid="button-save"]');
    await takeScreenshot(page, testName, '08-save-clicked');
    
    // Step 9: Verify Git commit completed (badge disappears)
    await page.waitForTimeout(3000);
    const saveBadge = page.locator('[data-testid="save-badge"]');
    await expect(saveBadge).not.toBeVisible({ timeout: 10000 });
    await takeScreenshot(page, testName, '09-git-commit-complete');
    
    // 5-Layer Validation
    await validate5Layers(page, {
      testName,
      ui: async () => {
        await expect(inspector).toBeVisible();
      },
      integration: async () => {
        await expect(saveBadge).not.toBeVisible();
      }
    });
  });
});
