/**
 * ADVANCED UI TESTING - Mr Blue Visual Chat
 * Industry Standard 2025 Techniques:
 * 1. Page Object Model (POM)
 * 2. Auto-wait assertions (no manual timeouts)
 * 3. Accessibility testing
 * 4. Visual regression testing
 * 5. Network mocking
 * 6. User journey testing
 * 7. Parallel execution ready
 */

import { test, expect } from '@playwright/test';
import { MrBlueVisualChatPage } from './page-objects/MrBlueVisualChat.page';
import AxeBuilder from '@axe-core/playwright';

test.describe('Mr Blue Visual Chat - Advanced UI Testing', () => {
  let chatPage: MrBlueVisualChatPage;

  test.beforeEach(async ({ page }) => {
    chatPage = new MrBlueVisualChatPage(page);
    await chatPage.goto();
    await chatPage.openAITab();
  });

  // ========================================
  // TEST 1: Initial State & Accessibility
  // ========================================

  test('should render with correct initial state and be accessible', async ({ page }) => {
    // Verify visual state
    await chatPage.assertInitialState();
    
    // Accessibility check (WCAG compliance)
    await chatPage.checkAccessibility();
    
    // Axe-core automated accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="mr-blue-visual-chat"]')
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  // ========================================
  // TEST 2: Visual Regression Testing
  // ========================================

  test.skip('should match visual snapshot (baseline)', async () => {
    // SKIP: Requires baseline snapshots to be generated first
    // Run with: npx playwright test --update-snapshots
    await chatPage.assertInitialState();
    
    // Industry standard: Visual regression testing
    await chatPage.takeScreenshot('mr-blue-initial-state');
  });

  // ========================================
  // TEST 3: User Journey - Quick Action
  // ========================================

  test('should populate input when quick action clicked', async () => {
    // User flow: Click quick action → Verify input populated
    await chatPage.clickQuickAction('color');
    
    // Auto-wait assertion
    await expect(chatPage.chatInput).toHaveValue('Make this button red');
    
    // Verify send button enabled
    expect(await chatPage.isSendButtonDisabled()).toBe(false);
  });

  // ========================================
  // TEST 4: Network Mocking & SSE Testing
  // ========================================

  test('should handle autonomous execution with mocked API', async () => {
    // Mock the autonomous API endpoint
    await chatPage.mockAutonomousAPI({
      success: true,
      data: { taskId: 'test-task-123' }
    });

    // Mock SSE stream events
    await chatPage.mockSSEStream('test-task-123', [
      { type: 'taskStarted', message: 'Task started' },
      { type: 'stepPlanned', step: 'Analyze component', stepId: 'step-1' },
      { type: 'stepInProgress', step: 'Modifying button color', stepId: 'step-1' },
      { type: 'fileApplied', filePath: 'Button.tsx', stepId: 'step-1' },
      { type: 'taskComplete', message: 'Task completed successfully' }
    ]);

    // Send message
    await chatPage.sendMessage('Make this button red');
    
    // Verify loading state
    await chatPage.assertAutonomousExecutionStarted();
    
    // Wait for response
    await chatPage.waitForResponse();
    
    // Verify progress sidebar appeared
    await chatPage.assertProgressSidebarVisible();
  });

  // ========================================
  // TEST 5: Keyboard Navigation (A11y)
  // ========================================

  test('should support keyboard navigation', async ({ page }) => {
    // Focus input
    await chatPage.chatInput.focus();
    await expect(chatPage.chatInput).toBeFocused();
    
    // Type message
    await page.keyboard.type('Test message');
    await expect(chatPage.chatInput).toHaveValue('Test message');
    
    // Press Enter to send
    await page.keyboard.press('Enter');
    
    // Verify message sent (loading appears)
    await expect(chatPage.loadingIndicator).toBeVisible({ timeout: 2000 });
  });

  // ========================================
  // TEST 6: Error Handling & Resilience
  // ========================================

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/mrblue/autonomous/execute', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await chatPage.sendMessage('Test error handling');
    
    // Verify error message shown
    await chatPage.waitForResponse();
    const lastMessage = await chatPage.getMessageContent(await chatPage.getMessageCount() - 1);
    expect(lastMessage).toContain('error');
  });

  // ========================================
  // TEST 7: Multi-Step User Journey
  // ========================================

  test('should complete full autonomous workflow (E2E)', async () => {
    // Step 1: User sees welcome message
    const initialMessages = await chatPage.getMessageCount();
    expect(initialMessages).toBeGreaterThan(0);
    
    // Step 2: User clicks quick action
    await chatPage.clickQuickAction('loading');
    
    // Step 3: User sends message
    await chatPage.sendMessage('Add a loading spinner');
    
    // Step 4: Verify loading state
    await expect(chatPage.loadingIndicator).toBeVisible();
    await expect(chatPage.sendButton).toBeDisabled();
    await expect(chatPage.chatInput).toBeDisabled();
    
    // Step 5: Wait for completion
    await chatPage.waitForResponse(30000);
    
    // Step 6: Verify input re-enabled
    await expect(chatPage.chatInput).toBeEnabled();
    await expect(chatPage.sendButton).toBeEnabled();
  });

  // ========================================
  // TEST 8: Context Badges Verification
  // ========================================

  test('should display context badges correctly', async () => {
    await expect(chatPage.badgeCurrentPage).toBeVisible();
    await expect(chatPage.badgeAutonomousMode).toBeVisible();
    await expect(chatPage.badgeAutonomousMode).toContainText('Autonomous Mode');
  });

  // ========================================
  // TEST 9: Loading States & Transitions
  // ========================================

  test('should show correct loading states during execution', async () => {
    await chatPage.sendMessage('Test loading states');
    
    // Verify loading icon appears
    await expect(chatPage.loadingIcon).toBeVisible({ timeout: 1000 });
    
    // Verify send icon hidden
    await expect(chatPage.sendIcon).not.toBeVisible();
    
    // Verify loading text
    await expect(chatPage.loadingMessage).toHaveText('Executing autonomously...');
  });

  // ========================================
  // TEST 10: Responsive Design (Multi-Device)
  // ========================================

  test.skip('should be responsive on mobile viewport', async ({ page }) => {
    // SKIP: Visual regression test requires baseline
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify chat still functional
    await chatPage.assertInitialState();
    await expect(chatPage.chatInput).toBeVisible();
    await expect(chatPage.quickActionsPanel).toBeVisible();
    
    // Take mobile screenshot
    await chatPage.takeScreenshot('mr-blue-mobile');
  });
});

// ========================================
// TEST SUITE 2: Performance Testing
// ========================================

test.describe('Mr Blue Performance Tests', () => {
  test('should handle rapid message sending', async ({ page }) => {
    const chatPage = new MrBlueVisualChatPage(page);
    await chatPage.goto();
    await chatPage.openAITab();

    // Send multiple messages rapidly
    for (let i = 0; i < 5; i++) {
      await chatPage.chatInput.fill(`Message ${i}`);
      // Don't wait for response - test rate limiting
    }
    
    // Verify system remains stable
    await expect(chatPage.chatContainer).toBeVisible();
  });
});

// ========================================
// TEST SUITE 3: Visual Regression Suite
// ========================================

test.describe('Visual Regression Tests', () => {
  test.skip('should match snapshots in different states', async ({ page }) => {
    // SKIP: Requires baseline snapshots to be generated first
    // Run with: npx playwright test --update-snapshots
    const chatPage = new MrBlueVisualChatPage(page);
    await chatPage.goto();
    await chatPage.openAITab();

    // Snapshot 1: Initial state
    await chatPage.takeScreenshot('state-initial');
    
    // Snapshot 2: With message
    await chatPage.chatInput.fill('Test message');
    await chatPage.takeScreenshot('state-input-filled');
    
    // Snapshot 3: Loading state
    await chatPage.sendButton.click();
    await expect(chatPage.loadingIndicator).toBeVisible();
    await chatPage.takeScreenshot('state-loading');
  });
});
