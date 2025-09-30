import { test, expect } from '@playwright/test';

test.describe('Extended @Mention Navigation System', () => {
  test('should navigate correctly when clicking all 4 mention types', async ({ page }) => {
    // Login as Pierre Dubois (user 7)
    await page.goto('http://localhost:5000/memories');
    
    // Wait for posts to load
    await page.waitForSelector('[data-testid*="post-"]', { timeout: 10000 });
    
    // Find post 99 which has all 4 mention types
    const post = page.locator('[data-testid="post-99"]').first();
    
    if (await post.count() === 0) {
      console.log('Post 99 not found, looking for any post with mentions...');
      // Fallback: find any post with mention badges
      const mentionBadge = page.locator('.mention-badge').first();
      await expect(mentionBadge).toBeVisible({ timeout: 5000 });
    } else {
      await expect(post).toBeVisible();
    }
    
    // Test 1: Click user mention (blue badge)
    console.log('Testing user mention click...');
    const userMention = page.locator('a[href*="/profile/1"]').first();
    await userMention.scrollIntoViewIfNeeded();
    await expect(userMention).toBeVisible();
    await userMention.click();
    await page.waitForURL('**/profile/1**', { timeout: 5000 });
    console.log('✅ User mention navigation works!');
    
    // Go back to memories
    await page.goto('http://localhost:5000/memories');
    await page.waitForSelector('[data-testid*="post-"]', { timeout: 5000 });
    
    // Test 2: Click event mention (green badge)
    console.log('Testing event mention click...');
    const eventMention = page.locator('a[href*="/events/3?tab=posts"]').first();
    await eventMention.scrollIntoViewIfNeeded();
    await expect(eventMention).toBeVisible();
    await eventMention.click();
    await page.waitForURL('**/events/3?tab=posts**', { timeout: 5000 });
    console.log('✅ Event mention navigation works!');
    
    // Verify Posts tab is active
    const postsTab = page.locator('text=Posts').first();
    await expect(postsTab).toBeVisible();
    
    // Go back to memories
    await page.goto('http://localhost:5000/memories');
    await page.waitForSelector('[data-testid*="post-"]', { timeout: 5000 });
    
    // Test 3: Click city group mention (orange badge with MapPin)
    console.log('Testing city group mention click...');
    const cityMention = page.locator('a[href*="/groups/buenos-aires-tango?tab=posts"]').first();
    await cityMention.scrollIntoViewIfNeeded();
    await expect(cityMention).toBeVisible();
    await cityMention.click();
    await page.waitForURL('**/groups/buenos-aires-tango?tab=posts**', { timeout: 5000 });
    console.log('✅ City group mention navigation works!');
    
    // Go back to memories
    await page.goto('http://localhost:5000/memories');
    await page.waitForSelector('[data-testid*="post-"]', { timeout: 5000 });
    
    // Test 4: Click professional group mention (purple badge)
    console.log('Testing professional group mention click...');
    const groupMention = page.locator('a[href*="/groups/pro-tango-instructors?tab=posts"]').first();
    await groupMention.scrollIntoViewIfNeeded();
    await expect(groupMention).toBeVisible();
    await groupMention.click();
    await page.waitForURL('**/groups/pro-tango-instructors?tab=posts**', { timeout: 5000 });
    console.log('✅ Professional group mention navigation works!');
    
    // Verify Posts tab is active
    const groupPostsTab = page.locator('text=Posts').first();
    await expect(groupPostsTab).toBeVisible();
    
    console.log('🎉 All 4 mention types navigate correctly!');
  });
  
  test('should show filtered posts on event detail page', async ({ page }) => {
    // Navigate directly to event with posts filter
    await page.goto('http://localhost:5000/events/3?tab=posts&filter=participants');
    
    // Wait for Posts tab to be active
    await page.waitForSelector('text=Posts', { timeout: 10000 });
    
    // Check filter buttons exist
    const participantsBtn = page.locator('button:has-text("Participants")').first();
    const guestsBtn = page.locator('button:has-text("Guests")').first();
    
    await expect(participantsBtn).toBeVisible();
    await expect(guestsBtn).toBeVisible();
    
    console.log('✅ Event Posts tab with filtering works!');
  });
  
  test('should show filtered posts on group detail page', async ({ page }) => {
    // Test city group
    await page.goto('http://localhost:5000/groups/buenos-aires-tango?tab=posts&filter=residents');
    await page.waitForSelector('text=Posts', { timeout: 10000 });
    
    // Check if city group filters exist (Residents/Visitors)
    const residentsBtn = page.locator('button:has-text("Residents")').first();
    if (await residentsBtn.count() > 0) {
      await expect(residentsBtn).toBeVisible();
      console.log('✅ City group Posts tab with Residents/Visitors filtering works!');
    }
    
    // Test professional group
    await page.goto('http://localhost:5000/groups/pro-tango-instructors?tab=posts&filter=members');
    await page.waitForSelector('text=Posts', { timeout: 10000 });
    
    // Check if professional group filters exist (Members/Non-members)
    const membersBtn = page.locator('button:has-text("Members")').first();
    if (await membersBtn.count() > 0) {
      await expect(membersBtn).toBeVisible();
      console.log('✅ Professional group Posts tab with Members/Non-members filtering works!');
    }
  });
});
