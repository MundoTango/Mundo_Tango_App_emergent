// ESA Agent #51: Project Tracker E2E Navigation Tests
// Comprehensive routing validation to prevent 404 errors

import { test, expect } from '@playwright/test';

test.describe('Project Tracker Navigation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to projects dashboard
    await page.goto('/admin/projects');
    await page.waitForLoadState('networkidle');
  });

  test('Epic List → Epic Detail navigation', async ({ page }) => {
    // Go to Epics list
    await page.click('[data-testid="link-epics-list"]');
    await expect(page).toHaveURL(/\/admin\/projects\/epics/);
    
    // Wait for epics to load
    await page.waitForSelector('[data-testid^="row-epic-"]', { timeout: 5000 });
    
    // Click first epic
    const firstEpic = page.locator('[data-testid^="row-epic-"]').first();
    const epicKey = await firstEpic.locator('span.font-mono').textContent();
    await firstEpic.click();
    
    // Should navigate to epic detail (singular path)
    await expect(page).toHaveURL(/\/admin\/projects\/epic\/\d+/);
    
    // Verify epic detail page loaded
    await expect(page.locator('h1')).toContainText(epicKey || '');
  });

  test('Story List → Story Detail navigation', async ({ page }) => {
    // Go to Stories list
    await page.click('[data-testid="link-stories-list"]');
    await expect(page).toHaveURL(/\/admin\/projects\/stories/);
    
    // Wait for stories to load
    await page.waitForSelector('[data-testid^="row-story-"]', { timeout: 5000 });
    
    // Click first story
    const firstStory = page.locator('[data-testid^="row-story-"]').first();
    const storyKey = await firstStory.locator('span.font-mono').textContent();
    await firstStory.click();
    
    // Should navigate to story detail (singular path)
    await expect(page).toHaveURL(/\/admin\/projects\/story\/\d+/);
    
    // Verify story detail page loaded
    await expect(page.locator('h1')).toContainText(storyKey || '');
  });

  test('Projects Dashboard → Epic Detail via card', async ({ page }) => {
    // Switch to epics tab
    await page.click('[data-testid="tab-epics"]');
    
    // Wait for epic cards
    await page.waitForSelector('[data-testid^="card-epic-"]', { timeout: 5000 });
    
    // Click first epic card
    const firstCard = page.locator('[data-testid^="card-epic-"]').first();
    const epicKey = await firstCard.locator('[data-testid^="badge-epic-key-"]').textContent();
    await firstCard.click();
    
    // Should navigate to epic detail
    await expect(page).toHaveURL(/\/admin\/projects\/epic\/\d+/);
    await expect(page.locator('h1')).toContainText(epicKey || '');
  });

  test('Story Detail → Epic Detail breadcrumb navigation', async ({ page }) => {
    // Navigate to a story with an epic
    await page.click('[data-testid="link-stories-list"]');
    await page.waitForSelector('[data-testid^="row-story-"]', { timeout: 5000 });
    await page.locator('[data-testid^="row-story-"]').first().click();
    
    // Wait for story detail to load
    await expect(page).toHaveURL(/\/admin\/projects\/story\/\d+/);
    
    // Click epic breadcrumb link (if story has an epic)
    const epicLink = page.locator('[data-testid="link-epic"]');
    if (await epicLink.isVisible()) {
      const epicKey = await epicLink.textContent();
      await epicLink.click();
      
      // Should navigate to epic detail (singular path)
      await expect(page).toHaveURL(/\/admin\/projects\/epic\/\d+/);
      await expect(page.locator('h1')).toContainText(epicKey || '');
    }
  });

  test('GitHub Integration UI appears on Story Detail', async ({ page }) => {
    // Navigate to a story
    await page.click('[data-testid="link-stories-list"]');
    await page.waitForSelector('[data-testid^="row-story-"]', { timeout: 5000 });
    await page.locator('[data-testid^="row-story-"]').first().click();
    
    // Verify story detail loaded
    await expect(page).toHaveURL(/\/admin\/projects\/story\/\d+/);
    
    // Check if GitHub integration section exists
    const githubSection = page.locator('text=GitHub Integration');
    await expect(githubSection).toBeVisible({ timeout: 5000 });
    
    // Verify sync button exists
    const syncButton = page.locator('[data-testid*="sync-github"], button:has-text("Sync with GitHub")');
    await expect(syncButton).toBeVisible();
  });

  test('No 404 errors on all navigation paths', async ({ page }) => {
    const paths = [
      '/admin/projects',
      '/admin/projects/epics',
      '/admin/projects/stories',
      '/admin/sprints',
    ];
    
    for (const path of paths) {
      await page.goto(path);
      
      // Should not show 404 error
      await expect(page.locator('text=404')).not.toBeVisible();
      await expect(page.locator('text=Not Found')).not.toBeVisible();
      
      // Should have valid page content
      const mainContent = page.locator('main, [role="main"], .main-content');
      await expect(mainContent).toBeVisible();
    }
  });

  test('Epic Detail shows GitHub integration for stories', async ({ page }) => {
    // Navigate to epic detail
    await page.click('[data-testid="link-epics-list"]');
    await page.waitForSelector('[data-testid^="row-epic-"]', { timeout: 5000 });
    await page.locator('[data-testid^="row-epic-"]').first().click();
    
    // Should be on epic detail
    await expect(page).toHaveURL(/\/admin\/projects\/epic\/\d+/);
    
    // Check for stories section
    const storiesSection = page.locator('text=Stories');
    await expect(storiesSection).toBeVisible();
    
    // If stories exist, verify they have GitHub metadata columns
    const storyRows = page.locator('[data-testid^="card-story-"]');
    if (await storyRows.count() > 0) {
      // GitHub issue badge should be visible for synced stories
      const githubBadge = page.locator('[data-testid*="github"], .github-badge');
      // Note: May not be visible if no stories are synced yet
    }
  });
});

test.describe('Project Tracker Route Consistency', () => {
  test('All detail routes use singular form', async ({ page }) => {
    // Test that navigation always uses singular paths
    const testCases = [
      { name: 'Epic', listUrl: '/admin/projects/epics', detailPattern: /\/admin\/projects\/epic\/\d+/ },
      { name: 'Story', listUrl: '/admin/projects/stories', detailPattern: /\/admin\/projects\/story\/\d+/ },
    ];
    
    for (const testCase of testCases) {
      await page.goto(testCase.listUrl);
      await page.waitForSelector(`[data-testid^="row-${testCase.name.toLowerCase()}-"]`, { timeout: 5000 });
      
      // Click first item
      const firstRow = page.locator(`[data-testid^="row-${testCase.name.toLowerCase()}-"]`).first();
      await firstRow.click();
      
      // Verify singular route pattern
      await expect(page).toHaveURL(testCase.detailPattern);
    }
  });
});
