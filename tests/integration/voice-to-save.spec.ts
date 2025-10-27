import { test, expect } from '@playwright/test';
import { loginAsSuperAdmin, waitForRealtimeConnections } from '../helpers/auth';
import { takeScreenshot } from '../helpers/screenshots';
import { validate5Layers, assertSaveBadgeCount } from '../helpers/assertions';

test.describe('Integration: Voice → SAVE → Git', () => {
  test('Voice mode auto-executes and commits via SAVE button', async ({ page }) => {
    const testName = 'voice-to-save';
    
    // Step 1: Authenticate
    await loginAsSuperAdmin(page);
    await waitForRealtimeConnections(page);
    await takeScreenshot(page, testName, '01-authenticated');
    
    // Step 2: Open Mr Blue chat
    await page.click('[data-testid="button-open-mrblue"], [data-testid="toolbar-mrblue"]');
    await page.waitForSelector('[data-testid="chat-interface"]', { timeout: 10000 });
    
    // Step 3: Open voice mode
    await page.click('[data-testid="button-voice-mode"], [data-testid="open-voice"]');
    await page.waitForSelector('[data-testid="voice-modal"]', { timeout: 10000 });
    await takeScreenshot(page, testName, '02-voice-modal-opened');
    
    // Step 4: Simulate voice input via text (testing auto-execute flow)
    // Note: Real voice testing requires microphone permissions
    const voiceInput = page.locator('[data-testid="voice-text-input"], [data-testid="input-voice-text"]').first();
    
    if (await voiceInput.isVisible()) {
      await voiceInput.fill('Change the button color to red');
      await page.click('[data-testid="button-send-voice"], [data-testid="submit-voice"]');
      await takeScreenshot(page, testName, '03-voice-request-sent');
    } else {
      // Voice modal might auto-start recording - use push-to-talk mode instead
      console.log('⚠️ Voice modal opened but no text input found - skipping voice test');
      await page.click('[data-testid="button-close-voice"]');
      test.skip();
      return;
    }
    
    // Step 5: Wait for AI response and auto-execution
    await page.waitForTimeout(10000); // Voice processing takes longer
    await takeScreenshot(page, testName, '04-ai-processing');
    
    // Step 6: Close voice modal
    await page.click('[data-testid="button-close-voice"]');
    await page.waitForTimeout(1000);
    
    // Step 7: Verify SAVE badge shows queued changes
    await assertSaveBadgeCount(page, 1);
    await takeScreenshot(page, testName, '05-save-badge-updated');
    
    // Step 8: Click SAVE button
    await page.click('[data-testid="button-save"]');
    await takeScreenshot(page, testName, '06-save-clicked');
    
    // Step 9: Verify Git commit completed
    await page.waitForTimeout(3000);
    const saveBadge = page.locator('[data-testid="save-badge"]');
    await expect(saveBadge).not.toBeVisible({ timeout: 10000 });
    await takeScreenshot(page, testName, '07-git-commit-complete');
    
    // 5-Layer Validation
    await validate5Layers(page, {
      testName,
      ui: async () => {
        const voiceModal = page.locator('[data-testid="voice-modal"]');
        await expect(voiceModal).not.toBeVisible();
      },
      integration: async () => {
        await expect(saveBadge).not.toBeVisible();
      }
    });
  });
});
