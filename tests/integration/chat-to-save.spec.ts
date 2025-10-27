import { test, expect } from '@playwright/test';
import { loginAsSuperAdmin, waitForRealtimeConnections } from '../helpers/auth';
import { takeScreenshot } from '../helpers/screenshots';
import { validate5Layers, assertSaveBadgeCount } from '../helpers/assertions';

test.describe('Integration: Chat → SAVE → Git', () => {
  test('Chat vibe coding creates queued changes and commits via SAVE button', async ({ page }) => {
    const testName = 'chat-to-save-git';
    
    // Step 1: Authenticate
    await loginAsSuperAdmin(page);
    await waitForRealtimeConnections(page);
    await takeScreenshot(page, testName, '01-authenticated');
    
    // Step 2: Open Mr Blue chat
    await page.click('[data-testid="button-open-mrblue"], [data-testid="toolbar-mrblue"]');
    await page.waitForSelector('[data-testid="chat-interface"]', { timeout: 10000 });
    await takeScreenshot(page, testName, '02-mrblue-opened');
    
    // Step 3: Type vibe coding request
    const chatInput = page.locator('[data-testid="input-chat-message"], [data-testid="chat-input"]').first();
    await chatInput.fill('Make the main heading text larger and bolder');
    await takeScreenshot(page, testName, '03-typed-request');
    
    // Step 4: Send message
    await page.click('[data-testid="button-send-message"], [data-testid="send-chat"]');
    await takeScreenshot(page, testName, '04-message-sent');
    
    // Step 5: Wait for AI streaming response
    await page.waitForSelector('[data-testid="ai-message"], .ai-response', { timeout: 30000 });
    await takeScreenshot(page, testName, '05-ai-response-received');
    
    // Step 6: Wait for vibe coding execution
    await page.waitForTimeout(5000); // Give time for executeVibeCoding()
    await takeScreenshot(page, testName, '06-vibe-coding-executed');
    
    // Step 7: Verify SAVE badge shows queued changes
    await assertSaveBadgeCount(page, 1); // Expect at least 1 change queued
    await takeScreenshot(page, testName, '07-save-badge-updated');
    
    // Step 8: Click SAVE button
    await page.click('[data-testid="button-save"]');
    await takeScreenshot(page, testName, '08-save-clicked');
    
    // Step 9: Wait for Git commit (badge should disappear)
    await page.waitForTimeout(3000);
    const saveBadge = page.locator('[data-testid="save-badge"]');
    await expect(saveBadge).not.toBeVisible({ timeout: 10000 });
    await takeScreenshot(page, testName, '09-git-commit-complete');
    
    // 5-Layer Validation
    await validate5Layers(page, {
      testName,
      ui: async () => {
        // UI: Verify AI response is visible
        const aiMessage = page.locator('[data-testid="ai-message"]').first();
        await expect(aiMessage).toBeVisible();
      },
      integration: async () => {
        // Integration: Verify full flow completed
        await expect(saveBadge).not.toBeVisible();
      }
    });
  });
});
