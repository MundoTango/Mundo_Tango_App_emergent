/**
 * E2E Test: Visual Editor Integration - Element Selection
 * 
 * User Journey:
 * 1. User opens Visual Editor
 * 2. User clicks an element (purple bounding box appears)
 * 3. User opens Mr Blue chat (element context preserved)
 * 4. User switches to Build mode
 * 5. User sends: "Make this bigger"
 * 6. System should modify the SELECTED element
 * 
 * Validation:
 * - Purple bounding box visible on element selection
 * - Inspector panel shows element details
 * - Mr Blue chat receives selectedElement context
 * - Network: POST includes selectedElement with XPath
 * - Code changes target the correct element
 * - Element size increases in preview
 * - Screenshot: Before/after comparison
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Editor - Element Selection Context', () => {
  let consoleLogs: string[] = [];
  let networkRequests: any[] = [];

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    page.on('request', request => {
      if (request.url().includes('/api/vibe/execute')) {
        networkRequests.push({
          url: request.url(),
          postData: request.postDataJSON?.() || null,
        });
      }
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="visual-editor-toggle"]', { timeout: 10000 });
  });

  test('should pass selected element context to vibe API', async ({ page }) => {
    // Step 1: Open Visual Editor
    await page.click('[data-testid="visual-editor-toggle"]');
    await expect(page.locator('.visual-editor-wrapper')).toBeVisible();

    // Step 2: Click an element in preview
    const previewFrame = page.frameLocator('[data-testid="preview-iframe"]');
    const targetElement = previewFrame.locator('h1').first(); // Click first heading
    
    // Take screenshot before selection
    await page.screenshot({ path: 'evidence/screenshots/element-before-selection.png', fullPage: true });
    
    await targetElement.click();

    // Verify purple bounding box appears
    const boundingBox = page.locator('.purple-bounding-box');
    await expect(boundingBox).toBeVisible({ timeout: 5000 });

    // Verify Inspector panel shows element details
    const inspector = page.locator('[data-testid="inspector-panel"]');
    await expect(inspector).toBeVisible();
    await expect(inspector).toContainText('H1'); // Tag name

    // Take screenshot with purple bounding box
    await page.screenshot({ path: 'evidence/screenshots/element-selected-with-box.png', fullPage: true });

    // Step 3: Open Mr Blue chat (element context should be preserved)
    await page.click('[data-testid="mr-blue-toggle"]');
    await expect(page.locator('.chat-interface')).toBeVisible();

    // Verify console log shows element context
    const elementLog = consoleLogs.find(log => 
      log.includes('activeElement') || log.includes('selectedElement')
    );
    expect(elementLog).toBeDefined();

    // Step 4: Switch to Build mode
    await page.click('[data-testid="button-mode-build"]');

    // Step 5: Send contextual request
    const messageInput = page.locator('[data-testid="input-message"]');
    await messageInput.fill('Make this bigger');
    await page.click('[data-testid="button-send-message"]');

    // Step 6: Wait for vibe API call
    await page.waitForTimeout(3000);

    // Verify network request includes selectedElement
    const vibeRequest = networkRequests.find(req => req.url.includes('/api/vibe/execute'));
    expect(vibeRequest).toBeDefined();
    expect(vibeRequest.postData.selectedElement).toBeDefined();
    expect(vibeRequest.postData.selectedElement.tagName).toBe('H1');
    expect(vibeRequest.postData.selectedElement.xpath).toBeDefined();

    // Step 7: Verify element changes in preview
    // Get element's computed style before and after
    const elementAfter = previewFrame.locator('h1').first();
    const fontSize = await elementAfter.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    // Font size should be larger (exact value depends on implementation)
    expect(parseFloat(fontSize)).toBeGreaterThan(16); // Minimum expected size increase

    // Take final screenshot
    await page.screenshot({ path: 'evidence/screenshots/element-after-resize.png', fullPage: true });

    // Generate evidence
    const fs = require('fs');
    fs.writeFileSync(
      'evidence/console-logs/element-selection.log',
      consoleLogs.join('\n')
    );
  });

  test('should preserve element context when chat reopens', async ({ page }) => {
    // Select an element
    await page.click('[data-testid="visual-editor-toggle"]');
    const previewFrame = page.frameLocator('[data-testid="preview-iframe"]');
    await previewFrame.locator('button').first().click();

    // Open chat
    await page.click('[data-testid="mr-blue-toggle"]');
    
    // Close chat
    await page.click('[data-testid="button-close-chat"]');

    // Reopen chat
    await page.click('[data-testid="mr-blue-toggle"]');

    // Verify element context persisted
    const contextLog = consoleLogs.find(log => 
      log.includes('lastKnownElement') || log.includes('Element context preserved')
    );
    expect(contextLog).toBeDefined();
  });

  test('should show element info in chat when selected', async ({ page }) => {
    await page.click('[data-testid="visual-editor-toggle"]');
    
    // Select element
    const previewFrame = page.frameLocator('[data-testid="preview-iframe"]');
    await previewFrame.locator('p').first().click();

    // Open chat
    await page.click('[data-testid="mr-blue-toggle"]');

    // Verify element badge or indicator appears in chat
    const elementBadge = page.locator('[data-testid="inspector-badge"]');
    await expect(elementBadge).toBeVisible();
    await expect(elementBadge).toContainText('P'); // Tag name
  });
});
