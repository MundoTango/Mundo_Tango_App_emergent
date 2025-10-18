/**
 * Memory Creation Flow E2E Tests
 * Phase 12: Integration Testing
 * Tests: Create, view, edit, delete memories
 */

import { test, expect } from '@playwright/test';
import { registerUser, loginUser } from '../helpers/auth-helpers';
import { createTestUser } from '../fixtures/users';
import { testMemories, createTestMemory } from '../fixtures/memories';

test.describe('Memory Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login before each test
    const user = createTestUser();
    await registerUser(page, user);
  });

  test('should create a simple memory post', async ({ page }) => {
    // Navigate to create post
    await page.click('[data-testid="button-create-post"]');
    
    // Fill in memory content
    const memory = createTestMemory();
    await page.fill('[data-testid="input-post-content"]', memory.content);
    
    // Submit post
    await page.click('[data-testid="button-submit-post"]');
    
    // Wait for post to appear in feed
    await page.waitForSelector(`text=${memory.content.substring(0, 20)}`, { timeout: 5000 });
    
    // Verify post is visible
    const postVisible = await page.locator(`text=${memory.content.substring(0, 20)}`).isVisible();
    expect(postVisible).toBe(true);
  });

  test('should create memory with hashtags', async ({ page }) => {
    await page.click('[data-testid="button-create-post"]');
    
    await page.fill('[data-testid="input-post-content"]', testMemories.postWithHashtags.content);
    await page.click('[data-testid="button-submit-post"]');
    
    // Wait for post with hashtags
    await page.waitForSelector('text=#tango', { timeout: 5000 });
    
    // Verify hashtags are rendered
    const tangoHashtag = await page.locator('text=#tango').isVisible();
    const danceHashtag = await page.locator('text=#dance').isVisible();
    expect(tangoHashtag).toBe(true);
    expect(danceHashtag).toBe(true);
  });

  test('should view created memory on profile', async ({ page }) => {
    // Create a memory
    await page.click('[data-testid="button-create-post"]');
    const memory = createTestMemory();
    await page.fill('[data-testid="input-post-content"]', memory.content);
    await page.click('[data-testid="button-submit-post"]');
    
    await page.waitForTimeout(1000);
    
    // Navigate to profile
    await page.click('[data-testid="link-profile"]');
    
    // Verify memory appears on profile
    const memoryVisible = await page.locator(`text=${memory.content.substring(0, 20)}`).isVisible();
    expect(memoryVisible).toBe(true);
  });

  test('should delete a memory', async ({ page }) => {
    // Create a memory
    await page.click('[data-testid="button-create-post"]');
    const memory = createTestMemory({ content: 'Memory to be deleted' });
    await page.fill('[data-testid="input-post-content"]', memory.content);
    await page.click('[data-testid="button-submit-post"]');
    
    await page.waitForTimeout(1000);
    
    // Find and delete the post
    const postCard = page.locator(`text=${memory.content}`).locator('..').locator('..');
    await postCard.locator('[data-testid="button-post-menu"]').click();
    await page.click('[data-testid="button-delete-post"]');
    
    // Confirm deletion
    await page.click('[data-testid="button-confirm-delete"]');
    
    // Verify post is removed
    await page.waitForTimeout(1000);
    const postExists = await page.locator(`text=${memory.content}`).count();
    expect(postExists).toBe(0);
  });

  test('should like a memory', async ({ page }) => {
    // Create a memory
    await page.click('[data-testid="button-create-post"]');
    const memory = createTestMemory();
    await page.fill('[data-testid="input-post-content"]', memory.content);
    await page.click('[data-testid="button-submit-post"]');
    
    await page.waitForTimeout(1000);
    
    // Find the post and like it
    const postCard = page.locator(`text=${memory.content.substring(0, 20)}`).locator('..').locator('..');
    await postCard.locator('[data-testid="button-like-post"]').click();
    
    // Verify like count increased
    const likeCount = await postCard.locator('[data-testid="text-like-count"]').textContent();
    expect(parseInt(likeCount || '0')).toBeGreaterThan(0);
  });

  test('should comment on a memory', async ({ page }) => {
    // Create a memory
    await page.click('[data-testid="button-create-post"]');
    const memory = createTestMemory();
    await page.fill('[data-testid="input-post-content"]', memory.content);
    await page.click('[data-testid="button-submit-post"]');
    
    await page.waitForTimeout(1000);
    
    // Find the post and add comment
    const postCard = page.locator(`text=${memory.content.substring(0, 20)}`).locator('..').locator('..');
    await postCard.locator('[data-testid="button-comment"]').click();
    
    const commentText = 'Test comment from E2E';
    await page.fill('[data-testid="input-comment"]', commentText);
    await page.click('[data-testid="button-submit-comment"]');
    
    // Verify comment appears
    await page.waitForSelector(`text=${commentText}`, { timeout: 5000 });
    const commentVisible = await page.locator(`text=${commentText}`).isVisible();
    expect(commentVisible).toBe(true);
  });
});
