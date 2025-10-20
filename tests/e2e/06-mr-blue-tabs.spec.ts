import { test, expect } from '@playwright/test';

/**
 * MB.MD QA Protocol: E2E Test for Mr Blue 7-Tab Journey
 * Tests all 7 specialist tabs are accessible and functional
 */
test.describe('Mr Blue AI Companion - 7 Tab User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Mr Blue page
    await page.goto('/mr-blue');
    
    // Wait for page to load
    await expect(page.locator('h1:has-text("Mr Blue AI Companion")')).toBeVisible();
  });

  test('should display all 7 tabs', async ({ page }) => {
    // Verify all 7 tabs are visible
    await expect(page.locator('[data-testid="tab-chat"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-tours"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-subscriptions"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-search"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-sitebuilder"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-visualeditor"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-quality"]')).toBeVisible();
  });

  test('TAB 1: Chat - should navigate and display chat interface', async ({ page }) => {
    await page.locator('[data-testid="tab-chat"]').click();
    
    // Verify chat elements load
    await expect(page.locator('[data-testid="input-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-send"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-new-chat"]')).toBeVisible();
  });

  test('TAB 2: Tours - should navigate and display tour options', async ({ page }) => {
    await page.locator('[data-testid="tab-tours"]').click();
    
    // Verify tours content loads
    await expect(page.locator('text=Interactive Tours')).toBeVisible();
    await expect(page.locator('[data-testid="button-tour-welcome"]')).toBeVisible();
  });

  test('TAB 3: Subscriptions - should navigate and display subscription manager', async ({ page }) => {
    await page.locator('[data-testid="tab-subscriptions"]').click();
    
    // Verify subscriptions content loads
    await expect(page.locator('text=subscription')).toBeVisible({ timeout: 5000 });
  });

  test('TAB 4: Search - should navigate and display search interface', async ({ page }) => {
    await page.locator('[data-testid="tab-search"]').click();
    
    // Verify search elements load
    await expect(page.locator('[data-testid="input-platform-search"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-search"]')).toBeVisible();
  });

  test('TAB 5: Site Builder - should navigate and display AI builder', async ({ page }) => {
    await page.locator('[data-testid="tab-sitebuilder"]').click();
    
    // Verify site builder content loads
    await expect(page.locator('text=builder')).toBeVisible({ timeout: 5000 });
  });

  test('TAB 6: Visual Editor - should navigate and display visual editor', async ({ page }) => {
    await page.locator('[data-testid="tab-visualeditor"]').click();
    
    // Verify visual editor loads
    await expect(page.locator('text=visual')).toBeVisible({ timeout: 5000 });
  });

  test('TAB 7: Quality & Learning - should navigate and display QA validators', async ({ page }) => {
    await page.locator('[data-testid="tab-quality"]').click();
    
    // Verify quality & learning subtabs load
    await expect(page.locator('[data-testid="subtab-quality"]')).toBeVisible();
    await expect(page.locator('[data-testid="subtab-learning"]')).toBeVisible();
  });

  test('Complete user journey - navigate through all 7 tabs', async ({ page }) => {
    const tabs = [
      'tab-chat',
      'tab-tours', 
      'tab-subscriptions',
      'tab-search',
      'tab-sitebuilder',
      'tab-visualeditor',
      'tab-quality'
    ];

    // Navigate through each tab sequentially
    for (const tabId of tabs) {
      await page.locator(`[data-testid="${tabId}"]`).click();
      await page.waitForTimeout(300); // Allow tab content to load
      
      // Verify tab is active
      const tab = page.locator(`[data-testid="${tabId}"]`);
      await expect(tab).toHaveAttribute('data-state', 'active');
    }
  });

  test('should handle tab switching without errors', async ({ page }) => {
    // Monitor console for errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Rapidly switch between tabs
    await page.locator('[data-testid="tab-tours"]').click();
    await page.locator('[data-testid="tab-chat"]').click();
    await page.locator('[data-testid="tab-search"]').click();
    await page.locator('[data-testid="tab-quality"]').click();

    // No console errors should occur
    expect(errors.length).toBe(0);
  });
});
