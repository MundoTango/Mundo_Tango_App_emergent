/**
 * STREAM 4: E2E Testing - Visual Editor Workflow
 * 
 * Test: point → select → chat → apply → save workflow
 * Research: docs/research/TESTING_OBSERVABILITY_RESEARCH.md
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Visual Editor Point-and-Ask Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Visual Editor
    await page.goto('/');
    
    // Wait for app to load
    await page.waitForSelector('[data-testid="visual-editor-sidebar"]', { timeout: 30000 });
  });

  test('should complete full workflow: point → select → chat → apply → save', async ({ page }) => {
    // STEP 1: Enable inspector mode
    await page.click('[data-testid="inspector-mode-page"]');
    
    // STEP 2: Click an element on the page to select it
    // Find any clickable element (button, div, etc.)
    const targetElement = page.locator('button').first();
    await targetElement.click({ modifiers: ['Meta'] }); // Cmd+Click
    
    // STEP 3: Verify element is selected in Inspector Panel
    await expect(page.locator('[data-testid="visual-editor-sidebar"]')).toContainText('button');
    
    // STEP 4: Switch to AI Tab
    await page.click('[data-testid="tab-chat"]');
    
    // STEP 5: Chat with Mr Blue about the selected element
    const chatInput = page.locator('[data-testid="textarea-ai-prompt"]');
    await chatInput.fill('Make this button larger and blue');
    
    // STEP 6: Generate code changes
    await page.click('[data-testid="button-generate-code"]');
    
    // STEP 7: Wait for AI response (streaming)
    await page.waitForSelector('[data-testid="diff-preview-card"]', { timeout: 30000 });
    
    // STEP 8: Apply changes
    await page.click('[data-testid="button-apply-change"]');
    
    // STEP 9: Verify success toast
    await expect(page.locator('text=Changes Applied')).toBeVisible();
    
    // STEP 10: Save to git (via SAVE button)
    await page.click('[data-testid="button-save-all"]');
    await expect(page.locator('text=committed to git')).toBeVisible();
  });

  test('should handle element selection across different inspector modes', async ({ page }) => {
    // Test page mode
    await page.click('[data-testid="inspector-mode-page"]');
    const pageElement = page.locator('div').first();
    await pageElement.click({ modifiers: ['Meta'] });
    await expect(page.locator('[data-testid="visual-editor-sidebar"]')).toContainText('Selected Element');
    
    // Test sidebar mode
    await page.click('[data-testid="inspector-mode-sidebar"]');
    const sidebarElement = page.locator('[data-testid="visual-editor-sidebar"] button').first();
    await sidebarElement.click({ modifiers: ['Meta'] });
    await expect(page.locator('[data-testid="visual-editor-sidebar"]')).toContainText('Selected Element');
  });

  test('should show error recovery when AI generation fails', async ({ page }) => {
    await page.click('[data-testid="tab-chat"]');
    
    // Enter invalid/impossible request
    const chatInput = page.locator('[data-testid="textarea-ai-prompt"]');
    await chatInput.fill('Delete the entire application and start over');
    
    await page.click('[data-testid="button-generate-code"]');
    
    // Should show error message with tiered recovery
    await expect(page.locator('text=Generation Failed')).toBeVisible({ timeout: 10000 });
  });

  test('should maintain context when switching between tabs', async ({ page }) => {
    // Select element
    await page.click('[data-testid="inspector-mode-page"]');
    const targetElement = page.locator('h1').first();
    await targetElement.click({ modifiers: ['Meta'] });
    
    // Switch to Inspector tab
    await page.click('[data-testid="tab-inspector"]');
    await expect(page.locator('text=h1')).toBeVisible();
    
    // Switch to AI tab
    await page.click('[data-testid="tab-chat"]');
    
    // Context should persist (selected element shown)
    await expect(page.locator('[data-testid="inspector-badge"]')).toContainText('h1');
  });

  test('should pass WCAG AA accessibility audit', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation in Visual Editor', async ({ page }) => {
    // Tab through Visual Editor controls
    await page.keyboard.press('Tab'); // First tab
    await page.keyboard.press('Tab'); // Second tab
    
    // Should focus on tab buttons
    const activeElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    expect(activeElement).toContain('tab-');
    
    // Arrow keys should switch tabs
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    
    // Verify tab switched
    const selectedTab = await page.locator('[aria-selected="true"]').getAttribute('data-testid');
    expect(selectedTab).toBeTruthy();
  });
});

test.describe('Visual Editor Performance', () => {
  test('should load Visual Editor in under 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="visual-editor-sidebar"]');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle responsive preview switching quickly', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="tab-preview"]');
    
    const startTime = Date.now();
    
    // Switch between device modes
    await page.click('[data-testid="preview-mobile"]');
    await page.waitForTimeout(100);
    await page.click('[data-testid="preview-tablet"]');
    await page.waitForTimeout(100);
    await page.click('[data-testid="preview-desktop"]');
    
    const switchTime = Date.now() - startTime;
    expect(switchTime).toBeLessThan(1000);
  });
});
