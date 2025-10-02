import { test, expect } from '@playwright/test';

test.describe('Groups Feed MT Ocean Theme & Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://127.0.0.1:5000/groups/buenos-aires-tango');
    // Wait for group to load
    await page.waitForSelector('text=Buenos Aires', { timeout: 10000 });
    // Click on Posts tab
    await page.click('[data-testid="tab-posts"]');
    await page.waitForTimeout(2000); // Wait for posts to load
  });

  test('should display gradient background matching ESAMemoryFeed', async ({ page }) => {
    // Check for the gradient background container
    const postsTab = await page.locator('div.min-h-screen.bg-gradient-to-br');
    await expect(postsTab).toBeVisible();
    
    // Verify gradient classes
    const classList = await postsTab.getAttribute('class');
    expect(classList).toContain('from-gray-50');
    expect(classList).toContain('via-gray-100');
    expect(classList).toContain('to-gray-200');
  });

  test('should display 3-column responsive grid layout', async ({ page }) => {
    // Check for grid container
    const gridContainer = await page.locator('div.grid.grid-cols-1.lg\\:grid-cols-3');
    await expect(gridContainer).toBeVisible();
    
    // Check main content column (2/3 width)
    const mainColumn = await page.locator('div.lg\\:col-span-2').first();
    await expect(mainColumn).toBeVisible();
    
    // Check sidebar column (1/3 width)
    const sidebarColumn = await page.locator('div.lg\\:col-span-1').first();
    await expect(sidebarColumn).toBeVisible();
  });

  test('should display post creator button with turquoise gradient', async ({ page }) => {
    // Check for floating send button
    const sendButton = await page.locator('[data-testid="button-expand-post-creator"]');
    await expect(sendButton).toBeVisible();
    
    // Verify gradient styling
    const classList = await sendButton.getAttribute('class');
    expect(classList).toContain('bg-gradient-to-br');
    expect(classList).toContain('from-turquoise-400');
    expect(classList).toContain('to-cyan-500');
  });

  test('should display filter buttons with correct styling', async ({ page }) => {
    // Check All Posts filter button
    const allPostsButton = await page.locator('[data-testid="filter-all-posts"]');
    await expect(allPostsButton).toBeVisible();
    
    // Should have active gradient (default selected)
    const classList = await allPostsButton.getAttribute('class');
    expect(classList).toContain('from-turquoise-500');
    expect(classList).toContain('to-cyan-500');
  });

  test('should display post with glassmorphic card styling', async ({ page }) => {
    // Wait for posts to load
    await page.waitForTimeout(3000);
    
    // Check for glassmorphic card
    const postCard = await page.locator('.glassmorphic').first();
    
    if (await postCard.count() > 0) {
      await expect(postCard).toBeVisible();
      const classList = await postCard.getAttribute('class');
      expect(classList).toContain('glassmorphic');
    }
  });

  test('should filter posts when clicking filter buttons', async ({ page }) => {
    // Click residents filter
    const residentsButton = await page.locator('[data-testid="filter-residents"]');
    await residentsButton.click();
    
    // Wait for posts to reload
    await page.waitForTimeout(1500);
    
    // Check button has active state
    const classList = await residentsButton.getAttribute('class');
    expect(classList).toContain('from-turquoise-500');
    expect(classList).toContain('to-cyan-500');
  });

  test('should expand post creator when clicking send button', async ({ page }) => {
    const sendButton = await page.locator('[data-testid="button-expand-post-creator"]');
    await sendButton.click();
    
    // Wait for expansion animation
    await page.waitForTimeout(500);
    
    // Check for collapse button (indicates expanded state)
    const collapseButton = await page.locator('[data-testid="button-collapse-post-creator"]');
    await expect(collapseButton).toBeVisible();
  });

  test('should display friendship status on posts (if any)', async ({ page }) => {
    await page.waitForTimeout(3000);
    
    // Check if "See Friendship" button exists on any post
    const friendshipButton = await page.locator('[data-testid^="button-see-friendship"]').first();
    
    if (await friendshipButton.count() > 0) {
      await expect(friendshipButton).toBeVisible();
      const classList = await friendshipButton.getAttribute('class');
      expect(classList).toContain('from-teal-500');
    }
  });
});
