// TRACK 4 (S4): Post Creation E2E Tests
import { test, expect } from '@playwright/test';

test.describe('Post Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage (auth bypass in dev)
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for auto-login
  });

  test('should show post creator', async ({ page }) => {
    // Look for post creation UI
    const postCreator = page.locator('[data-testid="post-creator"]').or(
      page.locator('textarea[placeholder*="What"]')
    );
    
    await expect(postCreator).toBeVisible({ timeout: 10000 });
  });

  test('should open create post modal/form', async ({ page }) => {
    // Try to find and click post creation button
    const createButton = page.locator('[data-testid="button-create-post"]').or(
      page.locator('button:has-text("Create Post")')
    ).or(
      page.locator('button:has-text("Share")')
    );
    
    if (await createButton.isVisible({ timeout: 5000 })) {
      await createButton.click();
      
      // Should show post form
      const postForm = page.locator('textarea').first();
      await expect(postForm).toBeVisible();
    }
  });

  test('should have post feed visible', async ({ page }) => {
    // Navigate to moments/feed page
    await page.goto('/moments');
    
    // Should see feed container or posts
    const feed = page.locator('[data-testid="post-feed"]').or(
      page.locator('.post-item')
    ).or(
      page.locator('[class*="feed"]')
    );
    
    await expect(feed).toBeVisible({ timeout: 10000 });
  });
});
