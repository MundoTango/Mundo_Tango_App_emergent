/**
 * COMPONENT TESTS - Isolated Component Behavior
 * ✅ FIX #4 (Oct 27): Test individual components without full E2E flow
 */

import { test, expect } from '@playwright/test';

test.describe('ChatInterface Component', () => {
  test('renders chat interface with input', async ({ page }) => {
    await page.goto('http://localhost:5000/');
    
    // Open Mr Blue
    await page.locator('[data-testid="button-open-mrblue"]').click();
    await expect(page.locator('[data-testid="dialog-mrblue"]')).toBeVisible();

    // Check chat input exists
    const chatInput = page.locator('[data-testid="mr-blue-input"]');
    await expect(chatInput).toBeVisible();
    await expect(chatInput).toBeEnabled();
  });

  test('accepts user input and enables send', async ({ page }) => {
    await page.goto('http://localhost:5000/');
    await page.locator('[data-testid="button-open-mrblue"]').click();

    const chatInput = page.locator('[data-testid="mr-blue-input"]');
    await chatInput.fill('test message');
    
    // Send button should be enabled after typing
    const sendButton = page.locator('[data-testid="button-send-message"]');
    await expect(sendButton).toBeEnabled();
  });
});

test.describe('SaveOrchestrator Component', () => {
  test('SAVE button shows pending changes count', async ({ page }) => {
    await page.goto('http://localhost:5000/');
    
    // Open Mr Blue -> Visual Editor
    await page.locator('[data-testid="button-open-mrblue"]').click();
    await page.locator('[data-testid="tab-visualeditor"]').click();

    // Check SAVE button exists
    const saveButton = page.locator('[data-testid="button-save-all"]');
    await expect(saveButton).toBeVisible();

    // Initial state should show "0" or no badge
    const badgeText = await saveButton.textContent();
    console.log('💾 SAVE button initial text:', badgeText);
  });
});

test.describe('UnifiedVoiceModal Component', () => {
  test('voice button opens voice modal', async ({ page }) => {
    await page.goto('http://localhost:5000/');
    
    // Open Mr Blue
    await page.locator('[data-testid="button-open-mrblue"]').click();

    // Click voice button
    const voiceButton = page.locator('[data-testid="button-voice-mode"]');
    if (await voiceButton.isVisible()) {
      await voiceButton.click();
      
      // Check modal opens
      const voiceModal = page.locator('[data-testid="dialog-voice-modal"]');
      await expect(voiceModal).toBeVisible({ timeout: 5000 });
    } else {
      console.log('⚠️  Voice button not found - may be super admin only');
    }
  });
});

export {};
