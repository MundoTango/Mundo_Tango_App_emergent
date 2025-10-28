/**
 * E2E Test: Build Mode - Immediate Execution
 * 
 * User Journey:
 * 1. User opens Mr Blue chat in Visual Editor
 * 2. User clicks "Build" mode (green button)
 * 3. User sends: "Add a smiley emoji 😊 to the homepage"
 * 4. System should apply changes immediately
 * 5. User should see emoji on the page
 * 
 * Validation:
 * - Network: POST to /api/vibe/execute with executionMode: 'build'
 * - Console: "⚙️ [ChatInterface] BUILD MODE - Triggering vibe execution FIRST"
 * - Response: codeChanges array with file diffs
 * - Console: "🚀 [Build Mode] Applying X change(s)"
 * - Toast: "✅ Changes applied"
 * - DOM: Emoji appears in preview
 * - Screenshot: Emoji visible on page
 */

import { test, expect } from '@playwright/test';

test.describe('Build Mode - Immediate Execution', () => {
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
      if (request.url().includes('/api/vibe')) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postDataJSON?.() || null,
        });
      }
    });

    // Capture network responses
    page.on('response', async response => {
      if (response.url().includes('/api/vibe')) {
        networkResponses.push({
          url: response.url(),
          status: response.status(),
          body: await response.json().catch(() => null),
        });
      }
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="mr-blue-toggle"]', { timeout: 10000 });
  });

  test('should execute code changes immediately in Build mode', async ({ page }) => {
    // Step 1: Open Mr Blue chat
    await page.click('[data-testid="mr-blue-toggle"]');
    await expect(page.locator('.chat-interface')).toBeVisible();

    // Step 2: Click "Build" mode button
    const buildButton = page.locator('[data-testid="button-mode-build"]');
    await expect(buildButton).toBeVisible();
    await buildButton.click();

    // Verify Build button is active (green background)
    await expect(buildButton).toHaveClass(/bg-green-500/);

    // Step 3: Send message to add emoji
    const messageInput = page.locator('[data-testid="input-message"]');
    await messageInput.fill('Add a smiley emoji 😊 to the homepage');

    // Take screenshot before execution
    await page.screenshot({ path: 'evidence/screenshots/build-mode-before-execution.png', fullPage: true });

    const sendButton = page.locator('[data-testid="button-send-message"]');
    await sendButton.click();

    // Step 4: Wait for vibe API execution
    await page.waitForFunction(() => {
      return window.performance.getEntriesByType('resource')
        .some((entry: any) => entry.name.includes('/api/vibe/execute'));
    }, { timeout: 10000 });

    // Verify network request to vibe API
    const executeRequest = networkRequests.find(req => req.url.includes('/api/vibe/execute'));
    expect(executeRequest).toBeDefined();
    expect(executeRequest.method).toBe('POST');
    expect(executeRequest.postData.executionMode).toBe('build');
    expect(executeRequest.postData.message).toContain('smiley emoji');

    // Verify console logs
    const buildModeLog = consoleLogs.find(log => 
      log.includes('BUILD MODE - Triggering vibe execution FIRST')
    );
    expect(buildModeLog).toBeDefined();

    const vibeResultLog = consoleLogs.find(log => 
      log.includes('✅ [Vibe] Execution result:')
    );
    expect(vibeResultLog).toBeDefined();

    const applyingLog = consoleLogs.find(log => 
      log.includes('🚀 [Build Mode] Applying') && log.includes('change(s)')
    );
    expect(applyingLog).toBeDefined();

    // Step 5: Verify code changes response
    const executeResponse = networkResponses.find(res => res.url.includes('/api/vibe/execute'));
    expect(executeResponse).toBeDefined();
    expect(executeResponse.status).toBe(200);
    expect(executeResponse.body.status).toBe('success');
    expect(executeResponse.body.codeChanges).toBeDefined();
    expect(executeResponse.body.codeChanges.length).toBeGreaterThan(0);

    // Verify applyCodeChange API calls
    const applyRequests = networkRequests.filter(req => req.url.includes('/api/vibe/apply'));
    expect(applyRequests.length).toBeGreaterThan(0);

    // Step 6: Verify toast notification
    const successToast = page.locator('[data-testid="toast"]').filter({ hasText: 'Changes applied' });
    await expect(successToast).toBeVisible({ timeout: 5000 });

    // Verify toast shows correct file count
    const fileCount = executeResponse.body.codeChanges.length;
    await expect(successToast).toContainText(`${fileCount} file(s)`);

    // Step 7: Wait for preview iframe to reload
    await page.waitForTimeout(2000); // Allow time for file changes to apply

    // Step 8: Verify emoji appears in the DOM
    // Note: This depends on the actual implementation, adjust selector as needed
    const previewFrame = page.frameLocator('[data-testid="preview-iframe"]');
    // Check if emoji exists in page content (may vary based on implementation)
    const pageContent = await previewFrame.locator('body').textContent();
    expect(pageContent).toContain('😊');

    // Take final screenshot showing emoji
    await page.screenshot({ path: 'evidence/screenshots/build-mode-execution.png', fullPage: true });

    // Generate evidence files
    const fs = require('fs');
    fs.writeFileSync(
      'evidence/console-logs/build-mode.log',
      consoleLogs.join('\n')
    );
    fs.writeFileSync(
      'evidence/network-traces/build-mode-requests.json',
      JSON.stringify({ requests: networkRequests, responses: networkResponses }, null, 2)
    );
  });

  test('should show auto-queue badge after execution', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');
    
    const messageInput = page.locator('[data-testid="input-message"]');
    await messageInput.fill('Add a button to the page');
    await page.click('[data-testid="button-send-message"]');

    // Wait for execution
    await page.waitForTimeout(3000);

    // Verify auto-queue badge appears
    const badge = page.locator('[data-testid="auto-queue-badge"]');
    await expect(badge).toBeVisible({ timeout: 5000 });

    // Verify badge shows count
    await expect(badge).toHaveText(/[1-9]/); // At least 1 change queued
  });

  test('should apply multiple changes in sequence', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');
    
    // First change
    await page.locator('[data-testid="input-message"]').fill('Add a heading');
    await page.click('[data-testid="button-send-message"]');
    await page.waitForTimeout(2000);

    // Second change
    await page.locator('[data-testid="input-message"]').fill('Add a paragraph');
    await page.click('[data-testid="button-send-message"]');
    await page.waitForTimeout(2000);

    // Verify both changes logged
    const applyLogs = consoleLogs.filter(log => log.includes('🚀 [Build Mode] Applying'));
    expect(applyLogs.length).toBeGreaterThanOrEqual(2);

    // Verify auto-queue badge shows cumulative count
    const badge = page.locator('[data-testid="auto-queue-badge"]');
    const badgeText = await badge.textContent();
    expect(parseInt(badgeText || '0')).toBeGreaterThanOrEqual(2);
  });
});
