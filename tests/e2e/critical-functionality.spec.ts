import { test, expect } from '@playwright/test';

test.describe('Critical Platform Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Start at the home page
    await page.goto('http://localhost:5000');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('Upcoming Events shows clean message without debug JSON', async ({ page }) => {
    // Navigate to events or check sidebar
    const eventsSection = page.locator('text=/No upcoming events/i');
    if (await eventsSection.isVisible()) {
      // Check that debug JSON is NOT present
      const debugText = page.locator('text=/Debug:/i');
      await expect(debugText).toHaveCount(0);
      
      // Check that clean message is present
      await expect(page.locator('text=/Check back later for new events/i')).toBeVisible();
    }
  });

  test('User names are clickable and navigate to profiles', async ({ page }) => {
    // Look for a user name in a post
    const userName = page.locator('h4').filter({ hasText: /Pierre Dubois|Elena Rodriguez|Sarah Johnson/i }).first();
    
    if (await userName.isVisible()) {
      // Click on the user name
      await userName.click();
      
      // Should navigate to a profile page
      await expect(page).toHaveURL(/\/profile\/\d+/);
    }
  });

  test('Post actions menu works correctly', async ({ page }) => {
    // Find a post with an actions menu
    const actionsButton = page.locator('[data-testid="post-actions-menu"], button:has-text("⋮")').first();
    
    if (await actionsButton.isVisible()) {
      await actionsButton.click();
      
      // Check that menu options are visible
      const menuOptions = page.locator('[role="menu"], [data-radix-ui-menu-content]');
      await expect(menuOptions).toBeVisible();
      
      // Check for expected menu items
      const saveOption = page.locator('text=/Save Post/i, text=/Save to collection/i');
      const reportOption = page.locator('text=/Report/i');
      
      // At least one of these should be visible
      const hasSaveOption = await saveOption.isVisible().catch(() => false);
      const hasReportOption = await reportOption.isVisible().catch(() => false);
      
      expect(hasSaveOption || hasReportOption).toBeTruthy();
    }
  });

  test('Share functionality opens ShareModal', async ({ page }) => {
    // Find a share button
    const shareButton = page.locator('[data-testid="share-button"], button:has-text("Share")').first();
    
    if (await shareButton.isVisible()) {
      await shareButton.click();
      
      // Check that ShareModal opens
      const shareModal = page.locator('[data-testid="share-modal"], [role="dialog"]:has-text("Share Post")');
      await expect(shareModal).toBeVisible();
      
      // Check for share options
      await expect(page.locator('text=/Share to Timeline/i')).toBeVisible();
      await expect(page.locator('text=/Share with Comment/i')).toBeVisible();
      await expect(page.locator('text=/Copy Link/i')).toBeVisible();
    }
  });

  test('City groups display on community page', async ({ page }) => {
    // Navigate to community page
    await page.goto('http://localhost:5000/community');
    await page.waitForLoadState('networkidle');
    
    // Check for city group cards
    const cityCards = page.locator('[data-testid*="city-group"], .city-group-card, div:has-text("Buenos Aires"), div:has-text("Paris"), div:has-text("New York")');
    
    // Should have at least one city group visible
    const count = await cityCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Backend endpoints respond correctly', async ({ page, request }) => {
    // Test city-groups endpoint
    const cityGroupsResponse = await request.get('http://localhost:5000/api/city-groups');
    expect(cityGroupsResponse.ok()).toBeTruthy();
    const cityData = await cityGroupsResponse.json();
    expect(cityData.success).toBeTruthy();
    expect(Array.isArray(cityData.data)).toBeTruthy();
    
    // Test that save post endpoint exists (though it may require auth)
    const savePostResponse = await request.post('http://localhost:5000/api/saved-posts', {
      data: { postId: 1 }
    });
    // Should get either 200 (success) or 401 (needs auth), not 404
    expect([200, 401].includes(savePostResponse.status())).toBeTruthy();
  });
});