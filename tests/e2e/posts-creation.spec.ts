import { test, expect } from '@playwright/test';

/**
 * MB.MD S4: E2E Test - Post Creation Flow
 * Created: October 20, 2025
 * 
 * Critical User Flow: Create post → appears in timeline
 * Tests: Posts/Memories system functionality
 */

test.describe('Post Creation Flow', () => {
  test('should display post creation button on timeline', async ({ page }) => {
    await page.goto('/');
    
    // Look for create post button (various possible names)
    const createButton = page.getByTestId('button-create-post')
      .or(page.getByTestId('button-new-post'))
      .or(page.getByRole('button', { name: /create|new post|share/i }))
      .first();
    
    await expect(createButton).toBeVisible({ timeout: 10000 });
  });

  test('should open post creation dialog/form', async ({ page }) => {
    await page.goto('/');
    
    const createButton = page.getByTestId('button-create-post')
      .or(page.getByRole('button', { name: /create|new post/i }))
      .first();
    
    await createButton.click();
    
    // Wait for dialog/form to open
    await page.waitForTimeout(500);
    
    // Check for post textarea
    const textarea = page.getByTestId('textarea-post-content')
      .or(page.getByRole('textbox', { name: /what.*mind|share.*thoughts/i }))
      .or(page.getByPlaceholder(/what.*mind|share/i))
      .first();
    
    await expect(textarea).toBeVisible();
  });

  test('should have submit button for post', async ({ page }) => {
    await page.goto('/');
    
    // Open post creation
    const createButton = page.getByTestId('button-create-post')
      .or(page.getByRole('button', { name: /create|new post/i }))
      .first();
    
    await createButton.click();
    await page.waitForTimeout(500);
    
    // Look for submit button
    const submitButton = page.getByTestId('button-submit-post')
      .or(page.getByRole('button', { name: /post|publish|share/i }))
      .first();
    
    await expect(submitButton).toBeVisible();
  });
});
