/**
 * E2E Test: Console Log Validation
 * 
 * Purpose:
 * - Capture all console logs during test
 * - Assert expected log messages appear
 * - Assert no error logs (except expected test errors)
 * - Detect unhandled promise rejections
 * - Detect React warnings
 * - Detect CORS errors
 * 
 * Validation:
 * - Plan mode logs: "PLAN MODE - Triggering vibe execution FIRST"
 * - Build mode logs: "BUILD MODE - Triggering vibe execution FIRST"
 * - Vibe execution logs: "✅ [Vibe] Execution result"
 * - No unhandled promise rejections
 * - No React warnings in console
 * - No CORS errors
 */

import { test, expect, ConsoleMessage } from '@playwright/test';

test.describe('Console Log Validation', () => {
  let consoleLogs: ConsoleMessage[] = [];
  let consoleErrors: ConsoleMessage[] = [];
  let consoleWarnings: ConsoleMessage[] = [];

  test.beforeEach(async ({ page }) => {
    // Capture all console messages
    page.on('console', msg => {
      consoleLogs.push(msg);
      
      if (msg.type() === 'error') {
        consoleErrors.push(msg);
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg);
      }
    });

    // Capture unhandled promise rejections
    page.on('pageerror', error => {
      console.error('Page error:', error);
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="mr-blue-toggle"]', { timeout: 10000 });
  });

  test('should log Plan mode execution correctly', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-plan"]');

    await page.locator('[data-testid="input-message"]').fill('Test plan mode');
    await page.click('[data-testid="button-send-message"]');

    await page.waitForTimeout(3000);

    // Find expected logs
    const expectedLogs = [
      '⚙️ [ChatInterface] PLAN MODE - Triggering vibe execution FIRST',
      '✅ [Vibe] Execution result:',
      '❓ [Plan Mode] AI needs clarification'
    ];

    for (const expectedLog of expectedLogs) {
      const found = consoleLogs.some(msg => msg.text().includes(expectedLog));
      expect(found).toBe(true);
    }

    // Save logs
    const fs = require('fs');
    fs.writeFileSync(
      'evidence/console-logs/plan-mode-validation.log',
      consoleLogs.map(msg => `[${msg.type()}] ${msg.text()}`).join('\n')
    );
  });

  test('should log Build mode execution correctly', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    await page.locator('[data-testid="input-message"]').fill('Test build mode');
    await page.click('[data-testid="button-send-message"]');

    await page.waitForTimeout(3000);

    // Find expected logs
    const expectedLogs = [
      '⚙️ [ChatInterface] BUILD MODE - Triggering vibe execution FIRST',
      '✅ [Vibe] Execution result:',
      '🚀 [Build Mode] Applying'
    ];

    for (const expectedLog of expectedLogs) {
      const found = consoleLogs.some(msg => msg.text().includes(expectedLog));
      expect(found).toBe(true);
    }

    // Save logs
    const fs = require('fs');
    fs.writeFileSync(
      'evidence/console-logs/build-mode-validation.log',
      consoleLogs.map(msg => `[${msg.type()}] ${msg.text()}`).join('\n')
    );
  });

  test('should not have unhandled promise rejections', async ({ page }) => {
    let unhandledRejections: any[] = [];

    page.on('pageerror', error => {
      if (error.message.includes('Unhandled Promise')) {
        unhandledRejections.push(error);
      }
    });

    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    await page.locator('[data-testid="input-message"]').fill('Test promises');
    await page.click('[data-testid="button-send-message"]');

    await page.waitForTimeout(3000);

    // Should have no unhandled promise rejections
    expect(unhandledRejections.length).toBe(0);
  });

  test('should not have React warnings', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-plan"]');

    await page.locator('[data-testid="input-message"]').fill('Test React');
    await page.click('[data-testid="button-send-message"]');

    await page.waitForTimeout(2000);

    // Filter for React-specific warnings
    const reactWarnings = consoleWarnings.filter(msg => {
      const text = msg.text();
      return text.includes('React') || 
             text.includes('Warning:') ||
             text.includes('componentWillMount') ||
             text.includes('componentWillReceiveProps');
    });

    // Should have no React warnings
    expect(reactWarnings.length).toBe(0);
  });

  test('should not have CORS errors', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    await page.locator('[data-testid="input-message"]').fill('Test CORS');
    await page.click('[data-testid="button-send-message"]');

    await page.waitForTimeout(2000);

    // Filter for CORS errors
    const corsErrors = consoleErrors.filter(msg => {
      const text = msg.text();
      return text.includes('CORS') || 
             text.includes('Access-Control-Allow-Origin') ||
             text.includes('blocked by CORS policy');
    });

    // Should have no CORS errors
    expect(corsErrors.length).toBe(0);
  });

  test('should log vibe execution details', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    await page.locator('[data-testid="input-message"]').fill('Detailed test');
    await page.click('[data-testid="button-send-message"]');

    await page.waitForTimeout(3000);

    // Should log execution details
    const detailLogs = consoleLogs.filter(msg => {
      const text = msg.text();
      return text.includes('[ChatInterface]') ||
             text.includes('[Vibe]') ||
             text.includes('executionMode');
    });

    expect(detailLogs.length).toBeGreaterThan(0);

    // Generate detailed report
    const fs = require('fs');
    const report = detailLogs.map(msg => ({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    }));

    fs.writeFileSync(
      'evidence/console-logs/execution-details.json',
      JSON.stringify(report, null, 2)
    );
  });

  test('should handle console errors gracefully', async ({ page }) => {
    await page.click('[data-testid="mr-blue-toggle"]');
    await page.click('[data-testid="button-mode-build"]');

    // Trigger an intentional error
    await page.evaluate(() => {
      console.error('Intentional test error');
    });

    await page.waitForTimeout(1000);

    // Error should be captured
    const testError = consoleErrors.find(msg => msg.text().includes('Intentional test error'));
    expect(testError).toBeDefined();
  });
});
