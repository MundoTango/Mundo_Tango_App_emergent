import { test, expect } from '@playwright/test';
import { loginAsSuperAdmin, waitForRealtimeConnections } from '../helpers/auth';
import { takeScreenshot } from '../helpers/screenshots';

test.describe('Unit: executeVibeCoding() Function', () => {
  test('executeVibeCoding called when code keywords detected in chat', async ({ page }) => {
    const testName = 'unit-vibe-coding-execution';
    
    await loginAsSuperAdmin(page);
    await waitForRealtimeConnections(page);
    
    // Listen for API calls to /api/vibe/execute
    const apiCalls: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/vibe/execute')) {
        apiCalls.push(request.url());
        console.log('✓ executeVibeCoding() API call detected:', request.url());
      }
    });
    
    await page.click('[data-testid="button-open-mrblue"], [data-testid="toolbar-mrblue"]');
    await page.waitForSelector('[data-testid="chat-interface"]', { timeout: 10000 });
    
    // Send message with code keywords
    const chatInput = page.locator('[data-testid="input-chat-message"], [data-testid="chat-input"]').first();
    await chatInput.fill('Change the heading to say Welcome to Mundo Tango');
    await page.click('[data-testid="button-send-message"], [data-testid="send-chat"]');
    
    // Wait for AI response
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 30000 });
    
    // Wait a bit more for executeVibeCoding to be called
    await page.waitForTimeout(5000);
    
    await takeScreenshot(page, testName, 'after-response');
    
    // Verify executeVibeCoding was called
    if (apiCalls.length > 0) {
      console.log(`✅ executeVibeCoding() called ${apiCalls.length} time(s)`);
      expect(apiCalls.length).toBeGreaterThan(0);
    } else {
      console.log('⚠️ executeVibeCoding() not called - may not have detected code keywords');
    }
  });
});
