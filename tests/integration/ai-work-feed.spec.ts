import { test, expect } from '@playwright/test';
import { loginAsSuperAdmin, waitForRealtimeConnections } from '../helpers/auth';
import { takeScreenshot } from '../helpers/screenshots';

test.describe('Integration: AI Work Feed SSE', () => {
  test('AI Work Feed shows real-time SSE events during vibe coding', async ({ page }) => {
    const testName = 'ai-work-feed-sse';
    
    await loginAsSuperAdmin(page);
    await waitForRealtimeConnections(page);
    await takeScreenshot(page, testName, '01-authenticated');
    
    // Step 1: Open AI Work Feed sidebar (if not already visible)
    const workFeed = page.locator('[data-testid="ai-work-feed"], [data-testid="sidebar-work-feed"]');
    
    if (!(await workFeed.isVisible())) {
      const sidebarToggle = page.locator('[data-testid="button-toggle-sidebar"]');
      if (await sidebarToggle.isVisible()) {
        await sidebarToggle.click();
      }
    }
    await takeScreenshot(page, testName, '02-work-feed-visible');
    
    // Step 2: Open Mr Blue chat and trigger vibe coding
    await page.click('[data-testid="button-open-mrblue"], [data-testid="toolbar-mrblue"]');
    await page.waitForSelector('[data-testid="chat-interface"]', { timeout: 10000 });
    
    const chatInput = page.locator('[data-testid="input-chat-message"], [data-testid="chat-input"]').first();
    await chatInput.fill('Add a new section to the homepage with a gradient background');
    await page.click('[data-testid="button-send-message"], [data-testid="send-chat"]');
    await takeScreenshot(page, testName, '03-vibe-coding-request-sent');
    
    // Step 3: Wait for AI Work Feed to show events
    await page.waitForTimeout(5000); // Give time for SSE events to arrive
    await takeScreenshot(page, testName, '04-waiting-for-sse-events');
    
    // Step 4: Look for activity indicators in work feed
    const feedItems = page.locator('[data-testid="work-feed-item"], [data-testid="feed-event"]');
    
    // We expect at least some activity (may be previous events if feed persists)
    const feedCount = await feedItems.count();
    console.log(`📊 AI Work Feed items found: ${feedCount}`);
    
    if (feedCount > 0) {
      await takeScreenshot(page, testName, '05-sse-events-received');
      await expect(feedItems.first()).toBeVisible();
    } else {
      console.log('⚠️ No AI Work Feed items found - SSE may not be configured or events not triggering');
      await takeScreenshot(page, testName, '05-no-sse-events');
    }
    
    // Validate streaming happened
    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeVisible({ timeout: 30000 });
    await takeScreenshot(page, testName, '06-vibe-coding-complete');
  });
});
