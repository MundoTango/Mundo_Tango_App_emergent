/**
 * E2E Test: Network Request Validation
 * 
 * Purpose:
 * - Monitor all network traffic during Plan/Build operations
 * - Verify correct endpoints are called
 * - Verify request bodies are correct
 * - Verify responses match schemas
 * - Ensure no duplicate requests (dedupe works)
 * - Ensure proper authentication
 * 
 * Validation:
 * - No duplicate /api/vibe/execute calls
 * - Request bodies include all required fields
 * - Responses match TypeScript interfaces
 * - No 400/500 errors during normal operation
 * - CORS headers present
 * - Authentication cookies sent
 */

import { test, expect, Route } from '@playwright/test';

test.describe('Network Request Validation', () => {
  let allRequests: any[] = [];
  let allResponses: any[] = [];

  test.beforeEach(async ({ page }) => {
    // Capture ALL network activity
    page.on('request', request => {
      allRequests.push({
        timestamp: Date.now(),
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postDataJSON?.() || null,
      });
    });

    page.on('response', async response => {
      allResponses.push({
        timestamp: Date.now(),
        url: response.url(),
        status: response.status(),
        headers: response.headers(),
        body: await response.json().catch(() => null),
      });
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="mr-blue-toggle"]', { timeout: 10000 });
  });

  test('should not duplicate vibe API calls', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    // Send message
    await page.locator('[data-testid="input-message"]').fill('Add a button');
    await page.click('[data-testid="button-send-message"]');

    // Wait for processing
    await page.waitForTimeout(3000);

    // Count vibe execute calls
    const vibeExecuteCalls = allRequests.filter(req => 
      req.url.includes('/api/vibe/execute')
    );

    // Should be exactly 1 call (no duplicates)
    expect(vibeExecuteCalls.length).toBe(1);
  });

  test('should include all required fields in vibe API request', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-plan"]');

    await page.locator('[data-testid="input-message"]').fill('Test message');
    await page.click('[data-testid="button-send-message"]');

    await page.waitForTimeout(2000);

    const vibeRequest = allRequests.find(req => req.url.includes('/api/vibe/execute'));
    expect(vibeRequest).toBeDefined();

    // Verify required fields
    expect(vibeRequest.postData.message).toBeDefined();
    expect(vibeRequest.postData.executionMode).toBeDefined();
    expect(vibeRequest.postData.previewPath).toBeDefined();
    expect(vibeRequest.postData.selectedElement).toBeDefined(); // Can be null

    // Verify executionMode is valid
    expect(['plan', 'build']).toContain(vibeRequest.postData.executionMode);
  });

  test('should receive valid response schema from vibe API', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-plan"]');

    await page.locator('[data-testid="input-message"]').fill('Test request');
    await page.click('[data-testid="button-send-message"]');

    await page.waitForTimeout(3000);

    const vibeResponse = allResponses.find(res => res.url.includes('/api/vibe/execute'));
    expect(vibeResponse).toBeDefined();

    // Should return 200 OK
    expect(vibeResponse.status).toBe(200);

    // Should have valid response body
    expect(vibeResponse.body).toBeDefined();
    expect(vibeResponse.body.status).toBeDefined();

    // Status should be one of valid values
    expect(['success', 'needs_clarification', 'error']).toContain(vibeResponse.body.status);

    if (vibeResponse.body.status === 'needs_clarification') {
      expect(vibeResponse.body.clarificationQuestion).toBeDefined();
      expect(typeof vibeResponse.body.clarificationQuestion).toBe('string');
    }

    if (vibeResponse.body.status === 'success') {
      expect(vibeResponse.body.codeChanges).toBeDefined();
      expect(Array.isArray(vibeResponse.body.codeChanges)).toBe(true);
    }
  });

  test('should not encounter 400/500 errors during normal operation', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    await page.locator('[data-testid="input-message"]').fill('Add content');
    await page.click('[data-testid="button-send-message"]');

    await page.waitForTimeout(3000);

    // Check all API responses
    const apiResponses = allResponses.filter(res => res.url.includes('/api/'));
    
    for (const response of apiResponses) {
      // Should not have 4xx or 5xx errors
      expect(response.status).toBeLessThan(400);
    }

    // Generate report
    const fs = require('fs');
    fs.writeFileSync(
      'evidence/network-traces/all-requests.json',
      JSON.stringify({ requests: allRequests, responses: allResponses }, null, 2)
    );
  });

  test('should send authentication cookies with requests', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    await page.locator('[data-testid="input-message"]').fill('Test auth');
    await page.click('[data-testid="button-send-message"]');

    await page.waitForTimeout(2000);

    const vibeRequest = allRequests.find(req => req.url.includes('/api/vibe/execute'));
    
    // Should have cookie header (authentication)
    expect(vibeRequest.headers.cookie || vibeRequest.headers.Cookie).toBeDefined();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/vibe/execute', route => {
      route.abort('failed');
    });

    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    await page.locator('[data-testid="input-message"]').fill('Test error');
    await page.click('[data-testid="button-send-message"]');

    await page.waitForTimeout(2000);

    // Should show error toast
    const errorToast = page.locator('[data-testid="toast"]').filter({ hasText: 'failed' });
    await expect(errorToast).toBeVisible({ timeout: 5000 });
  });

  test('should measure API response times', async ({ page }) => {
    const startTime = Date.now();

    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    await page.locator('[data-testid="input-message"]').fill('Performance test');
    await page.click('[data-testid="button-send-message"]');

    // Wait for vibe API to complete
    await page.waitForFunction(() => {
      return window.performance.getEntriesByType('resource')
        .some((entry: any) => entry.name.includes('/api/vibe/execute'));
    }, { timeout: 10000 });

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // API should respond within 10 seconds
    expect(totalTime).toBeLessThan(10000);

    // Get actual API response time
    const performanceEntries = await page.evaluate(() => {
      return window.performance.getEntriesByType('resource')
        .filter((entry: any) => entry.name.includes('/api/vibe/execute'))
        .map((entry: any) => ({
          name: entry.name,
          duration: entry.duration,
          responseStart: entry.responseStart,
          responseEnd: entry.responseEnd
        }));
    });

    console.log('API Performance:', performanceEntries);
  });
});
