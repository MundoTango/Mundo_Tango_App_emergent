/**
 * Test Utility: Wait for Vibe Execution
 * 
 * Waits for vibe API call to complete and returns result
 */

import { Page } from '@playwright/test';

export async function waitForVibeExecution(page: Page, timeout = 10000): Promise<any> {
  // Wait for network request to complete
  await page.waitForFunction(() => {
    return window.performance.getEntriesByType('resource')
      .some((entry: any) => entry.name.includes('/api/vibe/execute'));
  }, { timeout });

  // Get the response from network monitor
  const performanceEntries = await page.evaluate(() => {
    return window.performance.getEntriesByType('resource')
      .filter((entry: any) => entry.name.includes('/api/vibe/execute'))
      .map((entry: any) => ({
        name: entry.name,
        duration: entry.duration,
      }));
  });

  return performanceEntries[0];
}

export async function waitForToast(page: Page, message: string, timeout = 5000): Promise<void> {
  const toast = page.locator('[data-testid="toast"]').filter({ hasText: message });
  await toast.waitFor({ state: 'visible', timeout });
}

export async function assertElementChanged(
  page: Page,
  selector: string,
  property: string,
  expectedChange: (before: string, after: string) => boolean
): Promise<void> {
  const iframe = page.frameLocator('[data-testid="preview-iframe"]');
  const element = iframe.locator(selector).first();

  const beforeValue = await element.evaluate((el, prop) => 
    window.getComputedStyle(el).getPropertyValue(prop), property
  );

  // Wait for potential changes
  await page.waitForTimeout(2000);

  const afterValue = await element.evaluate((el, prop) => 
    window.getComputedStyle(el).getPropertyValue(prop), property
  );

  if (!expectedChange(beforeValue, afterValue)) {
    throw new Error(
      `Element ${selector} property ${property} did not change as expected.\n` +
      `Before: ${beforeValue}\n` +
      `After: ${afterValue}`
    );
  }
}
