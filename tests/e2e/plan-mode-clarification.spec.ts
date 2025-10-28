/**
 * E2E Test: Plan Mode - Clarification Questions
 * 
 * User Journey:
 * 1. User opens Mr Blue chat in Visual Editor
 * 2. User clicks "Plan" mode (cyan button)
 * 3. User sends: "Redesign the homepage"
 * 4. System should ask clarifying questions
 * 5. User should NOT see code execution
 * 
 * Validation:
 * - Network: POST to /api/vibe/execute with executionMode: 'plan'
 * - Console: "⚙️ [ChatInterface] PLAN MODE - Triggering vibe execution FIRST"
 * - Response: status: 'needs_clarification', clarificationQuestion exists
 * - UI: Clarification question appears in chat
 * - Toast: "❓ Clarifying question" notification
 * - File System: No code changes applied
 * - Screenshot: Clarification question visible
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Plan Mode - Clarification Questions', () => {
  let consoleLogs: string[] = [];
  let networkRequests: any[] = [];
  let networkResponses: any[] = [];

  test.beforeEach(async ({ page }) => {
    // Capture console logs
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Capture network requests
    page.on('request', request => {
      if (request.url().includes('/api/vibe/execute')) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postDataJSON(),
        });
      }
    });

    // Capture network responses
    page.on('response', async response => {
      if (response.url().includes('/api/vibe/execute')) {
        networkResponses.push({
          url: response.url(),
          status: response.status(),
          body: await response.json().catch(() => null),
        });
      }
    });

    // Navigate to app
    await page.goto('/');
    
    // Wait for authentication
    await page.waitForSelector('[data-testid="mr-blue-toggle"]', { timeout: 10000 });
  });

  test('should ask clarifying questions in Plan mode', async ({ page }) => {
    // Step 1: Open Mr Blue chat
    await page.click('[data-testid="mr-blue-toggle"]');
    await expect(page.locator('.chat-interface')).toBeVisible();

    // Step 2: Click "Plan" mode button
    const planButton = page.locator('[data-testid="button-mode-plan"]');
    await expect(planButton).toBeVisible();
    await planButton.click();

    // Verify Plan button is active (cyan background)
    await expect(planButton).toHaveClass(/bg-cyan-500/);

    // Step 3: Send message
    const messageInput = page.locator('[data-testid="input-message"]');
    await messageInput.fill('Redesign the homepage');

    const sendButton = page.locator('[data-testid="button-send-message"]');
    await expect(sendButton).toBeEnabled();
    
    // Take screenshot before sending
    await page.screenshot({ path: 'evidence/screenshots/plan-mode-before-send.png', fullPage: true });
    
    await sendButton.click();

    // Step 4: Wait for vibe API call
    await page.waitForFunction(() => {
      return window.performance.getEntriesByType('resource')
        .some((entry: any) => entry.name.includes('/api/vibe/execute'));
    }, { timeout: 10000 });

    // Verify network request
    expect(networkRequests.length).toBeGreaterThan(0);
    const vibeRequest = networkRequests[0];
    expect(vibeRequest.url).toContain('/api/vibe/execute');
    expect(vibeRequest.method).toBe('POST');
    expect(vibeRequest.postData.executionMode).toBe('plan');
    expect(vibeRequest.postData.message).toContain('Redesign the homepage');

    // Verify console logs
    const planModeLog = consoleLogs.find(log => 
      log.includes('PLAN MODE - Triggering vibe execution FIRST')
    );
    expect(planModeLog).toBeDefined();

    // Step 5: Wait for clarification question
    await page.waitForSelector('.message-bubble:has-text("To redesign")', { timeout: 10000 });

    // Verify response
    expect(networkResponses.length).toBeGreaterThan(0);
    const vibeResponse = networkResponses[0];
    expect(vibeResponse.status).toBe(200);
    expect(vibeResponse.body.status).toBe('needs_clarification');
    expect(vibeResponse.body.clarificationQuestion).toBeTruthy();

    // Verify clarification appears in UI
    const clarificationMessage = page.locator('.message-bubble').last();
    await expect(clarificationMessage).toContainText('To redesign');
    
    // Verify toast notification
    const toast = page.locator('[data-testid="toast"]').filter({ hasText: 'Clarifying question' });
    await expect(toast).toBeVisible({ timeout: 5000 });

    // Step 6: Verify NO code changes were applied
    // (In plan mode, we should not see any file write operations)
    const applyChangeLog = consoleLogs.find(log => 
      log.includes('applyCodeChange')
    );
    expect(applyChangeLog).toBeUndefined();

    // Take final screenshot
    await page.screenshot({ path: 'evidence/screenshots/plan-mode-clarification.png', fullPage: true });

    // Generate console log report
    const fs = require('fs');
    fs.writeFileSync(
      'evidence/console-logs/plan-mode.log',
      consoleLogs.join('\n')
    );

    // Generate network trace
    fs.writeFileSync(
      'evidence/network-traces/plan-mode-requests.json',
      JSON.stringify({ requests: networkRequests, responses: networkResponses }, null, 2)
    );
  });

  test('should show correct console logs for Plan mode', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-plan"]');
    
    const messageInput = page.locator('[data-testid="input-message"]');
    await messageInput.fill('Add a button');
    await page.click('[data-testid="button-send-message"]');

    // Wait for vibe execution
    await page.waitForTimeout(2000);

    // Verify expected console logs appear
    const expectedLogs = [
      '⚙️ [ChatInterface] PLAN MODE - Triggering vibe execution FIRST',
      '✅ [Vibe] Execution result:',
      '❓ [Plan Mode] AI needs clarification'
    ];

    for (const expectedLog of expectedLogs) {
      const found = consoleLogs.some(log => log.includes(expectedLog));
      expect(found).toBe(true);
    }
  });

  test('should not apply code changes in Plan mode', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-plan"]');
    
    const messageInput = page.locator('[data-testid="input-message"]');
    await messageInput.fill('Change the background color');
    await page.click('[data-testid="button-send-message"]');

    // Wait for response
    await page.waitForTimeout(3000);

    // Verify NO "Changes applied" toast
    const successToast = page.locator('[data-testid="toast"]').filter({ hasText: 'Changes applied' });
    await expect(successToast).not.toBeVisible();

    // Verify NO applyCodeChange calls in console
    const applyLogs = consoleLogs.filter(log => log.includes('applyCodeChange'));
    expect(applyLogs.length).toBe(0);

    // Verify NO auto-queue badge increment
    const badge = page.locator('[data-testid="auto-queue-badge"]');
    await expect(badge).not.toBeVisible();
  });
});
