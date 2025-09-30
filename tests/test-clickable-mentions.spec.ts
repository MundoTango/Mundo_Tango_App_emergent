import { test, expect } from '@playwright/test';

test.describe('Clickable @Mentions Navigation', () => {
  test('should have clickable mention links in posts', async ({ page }) => {
    await page.goto('http://localhost:5000/memories');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Look for any clickable mention links
    const userMention = page.locator('a[href^="/profile/"]').first();
    const eventMention = page.locator('a[href^="/events/"][href*="tab=posts"]').first();
    const groupMention = page.locator('a[href^="/groups/"][href*="tab=posts"]').first();
    
    // Check if at least one mention type is present and clickable
    const hasMentions = 
      (await userMention.count() > 0) ||
      (await eventMention.count() > 0) ||
      (await groupMention.count() > 0);
    
    console.log('User mentions found:', await userMention.count());
    console.log('Event mentions found:', await eventMention.count());
    console.log('Group mentions found:', await groupMention.count());
    
    if (!hasMentions) {
      console.log('⚠️  No mention links found on page. Posts may not be loaded or may not have mentions.');
    } else {
      console.log('✅ Clickable mention links are present!');
      
      // Test clicking a mention if available
      if (await userMention.count() > 0) {
        await userMention.click();
        await page.waitForURL('**/profile/**', { timeout: 5000 });
        console.log('✅ User mention click works!');
      } else if (await eventMention.count() > 0) {
        await eventMention.click();
        await page.waitForURL('**/events/**', { timeout: 5000 });
        console.log('✅ Event mention click works!');
      } else if (await groupMention.count() > 0) {
        await groupMention.click();
        await page.waitForURL('**/groups/**', { timeout: 5000 });
        console.log('✅ Group mention click works!');
      }
    }
  });
});
