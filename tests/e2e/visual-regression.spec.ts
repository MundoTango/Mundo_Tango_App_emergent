/**
 * E2E Test: Visual Regression Testing
 * 
 * Purpose:
 * - Take screenshots at each step
 * - Compare with baseline images
 * - Detect unintended visual changes
 * 
 * Validation:
 * - Plan mode button styling (cyan)
 * - Build mode button styling (green)
 * - Purple bounding box appearance
 * - Auto-queue badge styling
 * - Toast notifications styling
 * - Modal dialogs styling
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Regression Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mr-blue-toggle"]', { timeout: 10000 });
  });

  test('should maintain Plan mode button styling', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    
    const planButton = page.locator('[data-testid="button-mode-plan"]');
    await planButton.click();

    // Take screenshot of active Plan button
    await expect(planButton).toHaveScreenshot('plan-button-active.png', {
      maxDiffPixels: 100
    });

    // Verify CSS classes
    await expect(planButton).toHaveClass(/bg-cyan-500/);
    await expect(planButton).toHaveClass(/text-white/);
  });

  test('should maintain Build mode button styling', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    
    const buildButton = page.locator('[data-testid="button-mode-build"]');
    await buildButton.click();

    // Take screenshot of active Build button
    await expect(buildButton).toHaveScreenshot('build-button-active.png', {
      maxDiffPixels: 100
    });

    // Verify CSS classes
    await expect(buildButton).toHaveClass(/bg-green-500/);
    await expect(buildButton).toHaveClass(/text-white/);
  });

  test('should display purple bounding box correctly', async ({ page }) => {
    await page.click('[data-testid="visual-editor-toggle"]');
    
    // Click element to trigger bounding box
    const previewFrame = page.frameLocator('[data-testid="preview-iframe"]');
    await previewFrame.locator('h1').first().click();

    // Wait for bounding box to appear
    const boundingBox = page.locator('.purple-bounding-box');
    await expect(boundingBox).toBeVisible({ timeout: 5000 });

    // Take screenshot
    await expect(boundingBox).toHaveScreenshot('purple-bounding-box.png', {
      maxDiffPixels: 200
    });

    // Verify border color
    const borderColor = await boundingBox.evaluate(el => 
      window.getComputedStyle(el).borderColor
    );
    expect(borderColor).toContain('128, 90, 213'); // RGB for purple
  });

  test('should display auto-queue badge correctly', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    // Make a change
    await page.locator('[data-testid="input-message"]').fill('Test badge');
    await page.click('[data-testid="button-send-message"]');
    await page.waitForTimeout(3000);

    const badge = page.locator('[data-testid="auto-queue-badge"]');
    await expect(badge).toBeVisible();

    // Screenshot badge
    await expect(badge).toHaveScreenshot('auto-queue-badge.png', {
      maxDiffPixels: 50
    });
  });

  test('should display toast notifications correctly', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    await page.locator('[data-testid="input-message"]').fill('Toast test');
    await page.click('[data-testid="button-send-message"]');

    // Wait for toast
    const toast = page.locator('[data-testid="toast"]').first();
    await expect(toast).toBeVisible({ timeout: 5000 });

    // Screenshot toast
    await expect(toast).toHaveScreenshot('toast-notification.png', {
      maxDiffPixels: 100
    });
  });

  test('should maintain chat interface layout', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');

    const chatInterface = page.locator('.chat-interface');
    await expect(chatInterface).toBeVisible();

    // Full chat interface screenshot
    await expect(chatInterface).toHaveScreenshot('chat-interface-layout.png', {
      maxDiffPixels: 500
    });
  });

  test('should maintain visual editor layout', async ({ page }) => {
    await page.click('[data-testid="visual-editor-toggle"]');

    const visualEditor = page.locator('.visual-editor-wrapper');
    await expect(visualEditor).toBeVisible();

    // Full visual editor screenshot
    await page.screenshot({ 
      path: 'evidence/screenshots/visual-editor-layout.png',
      fullPage: true 
    });
  });

  test('should maintain mode toggle UI consistency', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');

    const modeToggle = page.locator('[data-testid="mode-toggle-container"]');
    
    // Screenshot mode toggle in default state
    await expect(modeToggle).toHaveScreenshot('mode-toggle-default.png', {
      maxDiffPixels: 100
    });

    // Switch to Plan
    await page.click('[data-testid="button-mode-plan"]');
    await expect(modeToggle).toHaveScreenshot('mode-toggle-plan.png', {
      maxDiffPixels: 100
    });

    // Switch to Build
    await page.click('[data-testid="button-mode-build"]');
    await expect(modeToggle).toHaveScreenshot('mode-toggle-build.png', {
      maxDiffPixels: 100
    });
  });
});
