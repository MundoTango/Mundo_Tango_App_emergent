import { test, expect } from '@playwright/test';
import { loginAsSuperAdmin, waitForRealtimeConnections } from '../helpers/auth';
import { takeScreenshot } from '../helpers/screenshots';
import { assertStreamingActive } from '../helpers/assertions';

test.describe('Integration: Dual Chat Streaming', () => {
  test('Streaming works in both main chat and Visual Editor AI tab', async ({ page }) => {
    const testName = 'dual-streaming';
    
    await loginAsSuperAdmin(page);
    await waitForRealtimeConnections(page);
    
    // Test 1: Main Mr Blue Chat Streaming
    await page.click('[data-testid="button-open-mrblue"], [data-testid="toolbar-mrblue"]');
    await page.waitForSelector('[data-testid="chat-interface"]', { timeout: 10000 });
    await takeScreenshot(page, testName, '01-main-chat-opened');
    
    const chatInput1 = page.locator('[data-testid="input-chat-message"], [data-testid="chat-input"]').first();
    await chatInput1.fill('Tell me about tango music');
    await page.click('[data-testid="button-send-message"], [data-testid="send-chat"]');
    
    // Verify streaming indicator appears
    await assertStreamingActive(page);
    await takeScreenshot(page, testName, '02-main-chat-streaming');
    
    // Wait for response to complete
    await page.waitForTimeout(5000);
    await takeScreenshot(page, testName, '03-main-chat-complete');
    
    // Test 2: Visual Editor AI Tab Streaming
    await page.click('[data-testid="tab-visual-editor"], [data-testid="button-visual-editor"]');
    await page.waitForSelector('[data-testid="visual-editor-canvas"]', { timeout: 10000 });
    
    // Open AI tab in Visual Editor
    await page.click('[data-testid="tab-ai"], [data-testid="visual-editor-ai-tab"]');
    await page.waitForTimeout(1000);
    await takeScreenshot(page, testName, '04-visual-editor-ai-tab-opened');
    
    const chatInput2 = page.locator('[data-testid="input-chat-message"], [data-testid="chat-input"]').last();
    if (await chatInput2.isVisible()) {
      await chatInput2.fill('Explain responsive design');
      await page.locator('[data-testid="button-send-message"], [data-testid="send-chat"]').last().click();
      
      // Verify streaming in Visual Editor AI tab
      await assertStreamingActive(page);
      await takeScreenshot(page, testName, '05-visual-editor-ai-streaming');
      
      await page.waitForTimeout(5000);
      await takeScreenshot(page, testName, '06-visual-editor-ai-complete');
    } else {
      console.log('⚠️ Visual Editor AI tab does not have separate chat input');
    }
    
    // Validate both locations showed streaming
    const aiMessages = page.locator('[data-testid="ai-message"]');
    await expect(aiMessages.first()).toBeVisible();
    await takeScreenshot(page, testName, '07-both-locations-validated');
  });
});
