/**
 * ESA LIFE CEO 61x21 - Post Editing Flow E2E Test
 * Tests Layer 7 & 23 unified edit experience across the platform
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Post Editing Flow - ESA Layer 7 Compliance', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to memories page
    await page.goto('/modern-memories');
    
    // Wait for posts to load
    await page.waitForSelector('[data-testid^="card-post-"]', { timeout: 10000 });
  });

  test('should edit correct post when clicking Edit from non-first item', async ({ page }) => {
    // Get all posts on the page
    const posts = await page.locator('[data-testid^="card-post-"]').all();
    
    // Ensure we have at least 2 posts to test properly
    expect(posts.length).toBeGreaterThan(1);
    
    // Target the second post (non-first item)
    const targetPostIndex = 1;
    const targetPost = posts[targetPostIndex];
    
    // Get the original content of the target post
    const originalContent = await targetPost.locator('[data-testid="text-content"]').textContent();
    
    // Click the three dots menu on the target post
    await targetPost.locator('[data-testid="button-actions-menu"]').click();
    
    // Click Edit post option
    await page.locator('[data-testid="option-edit-post"]').click();
    
    // Wait for BeautifulPostCreator dialog to open
    await page.waitForSelector('[data-testid="dialog-beautiful-post-creator"]', { timeout: 5000 });
    
    // Verify the content in the editor matches the target post
    const editorContent = await page.locator('[data-testid="input-post-content"]').inputValue();
    expect(editorContent).toBe(originalContent);
    
    // Edit the content
    const newContent = originalContent + ' - Edited via ESA Layer 7 Test';
    await page.locator('[data-testid="input-post-content"]').fill(newContent);
    
    // Save the edit
    await page.locator('[data-testid="button-save-post"]').click();
    
    // Wait for dialog to close
    await page.waitForSelector('[data-testid="dialog-beautiful-post-creator"]', { state: 'hidden' });
    
    // Wait for the post to update
    await page.waitForTimeout(1000);
    
    // Verify only the target post was updated
    const updatedPosts = await page.locator('[data-testid^="card-post-"]').all();
    
    for (let i = 0; i < updatedPosts.length; i++) {
      const postContent = await updatedPosts[i].locator('[data-testid="text-content"]').textContent();
      
      if (i === targetPostIndex) {
        // This post should be edited
        expect(postContent).toBe(newContent);
      } else {
        // Other posts should remain unchanged
        expect(postContent).not.toContain('- Edited via ESA Layer 7 Test');
      }
    }
  });

  test('should show BeautifulPostCreator features in edit mode', async ({ page }) => {
    // Click the three dots menu on any post
    await page.locator('[data-testid="button-actions-menu"]').first().click();
    
    // Click Edit post option
    await page.locator('[data-testid="option-edit-post"]').click();
    
    // Wait for BeautifulPostCreator dialog
    await page.waitForSelector('[data-testid="dialog-beautiful-post-creator"]');
    
    // Verify all BeautifulPostCreator features are present
    await expect(page.locator('[data-testid="input-post-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-add-media"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-add-location"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-emoji-picker"]')).toBeVisible();
    await expect(page.locator('[data-testid="select-visibility"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-advanced-options"]')).toBeVisible();
    
    // Verify it's in edit mode (Save button instead of Post)
    await expect(page.locator('[data-testid="button-save-post"]')).toHaveText(/Save|Update/);
  });

  test('should cancel edit without saving changes', async ({ page }) => {
    // Get the first post
    const firstPost = page.locator('[data-testid^="card-post-"]').first();
    const originalContent = await firstPost.locator('[data-testid="text-content"]').textContent();
    
    // Open edit dialog
    await firstPost.locator('[data-testid="button-actions-menu"]').click();
    await page.locator('[data-testid="option-edit-post"]').click();
    
    // Wait for dialog
    await page.waitForSelector('[data-testid="dialog-beautiful-post-creator"]');
    
    // Make changes
    await page.locator('[data-testid="input-post-content"]').fill('This should not be saved');
    
    // Cancel the edit
    await page.locator('[data-testid="button-cancel"]').click();
    
    // Wait for dialog to close
    await page.waitForSelector('[data-testid="dialog-beautiful-post-creator"]', { state: 'hidden' });
    
    // Verify content remains unchanged
    const currentContent = await firstPost.locator('[data-testid="text-content"]').textContent();
    expect(currentContent).toBe(originalContent);
  });
});