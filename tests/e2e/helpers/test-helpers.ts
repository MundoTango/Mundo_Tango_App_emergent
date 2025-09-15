import { Page, BrowserContext, expect, Locator } from '@playwright/test';
import { TestUser, ApiResponse, NetworkMockOptions } from './types';

/**
 * Common test helper utilities for Mundo Tango E2E tests
 */

/**
 * Wait for network idle
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Login helper
 */
export async function login(
  page: Page,
  user: TestUser
): Promise<{ token: string; userId: string }> {
  await page.goto('/auth/login');
  await page.fill('[data-testid="input-email"]', user.email);
  await page.fill('[data-testid="input-password"]', user.password);
  await page.click('[data-testid="button-login"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  
  // Get token from localStorage
  const token = await page.evaluate(() => localStorage.getItem('authToken'));
  const userId = await page.evaluate(() => localStorage.getItem('userId'));
  
  return { token: token || '', userId: userId || '' };
}

/**
 * Logout helper
 */
export async function logout(page: Page): Promise<void> {
  await page.click('[data-testid="button-user-menu"]');
  await page.click('[data-testid="button-logout"]');
  await page.waitForURL('**/auth/login');
}

/**
 * Create authenticated context
 */
export async function createAuthenticatedContext(
  browser: any,
  user: TestUser
): Promise<BrowserContext> {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const { token, userId } = await login(page, user);
  
  // Save auth state
  await context.addCookies([
    {
      name: 'authToken',
      value: token,
      domain: 'localhost',
      path: '/',
    },
  ]);
  
  await page.evaluate(
    ([token, userId]) => {
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', userId);
    },
    [token, userId]
  );
  
  await page.close();
  
  return context;
}

/**
 * Fill form helper
 */
export async function fillForm(
  page: Page,
  formData: Record<string, string | boolean | number>
): Promise<void> {
  for (const [field, value] of Object.entries(formData)) {
    const selector = `[data-testid="${field}"]`;
    const element = await page.$(selector);
    
    if (!element) {
      throw new Error(`Form field not found: ${field}`);
    }
    
    const tagName = await element.evaluate((el) => el.tagName.toLowerCase());
    const type = await element.getAttribute('type');
    
    if (tagName === 'select') {
      await page.selectOption(selector, String(value));
    } else if (type === 'checkbox' || type === 'radio') {
      if (Boolean(value)) {
        await page.check(selector);
      } else {
        await page.uncheck(selector);
      }
    } else if (tagName === 'textarea' || tagName === 'input') {
      await page.fill(selector, String(value));
    }
  }
}

/**
 * Upload file helper
 */
export async function uploadFile(
  page: Page,
  selector: string,
  filePath: string
): Promise<void> {
  const fileInput = await page.$(selector);
  if (!fileInput) {
    throw new Error(`File input not found: ${selector}`);
  }
  
  await fileInput.setInputFiles(filePath);
  
  // Wait for upload to complete
  await page.waitForTimeout(500);
}

/**
 * Take screenshot with custom name
 */
export async function takeScreenshot(
  page: Page,
  name: string,
  fullPage = false
): Promise<Buffer> {
  return await page.screenshot({
    path: `test-results/screenshots/${name}.png`,
    fullPage,
  });
}

/**
 * Mock API response
 */
export async function mockApiResponse(
  page: Page,
  options: NetworkMockOptions
): Promise<void> {
  await page.route(options.url, async (route) => {
    if (options.delay) {
      await new Promise((resolve) => setTimeout(resolve, options.delay));
    }
    
    await route.fulfill({
      status: options.status || 200,
      headers: options.headers || { 'Content-Type': 'application/json' },
      body: JSON.stringify(options.body || {}),
    });
  });
}

/**
 * Wait for element to be visible and stable
 */
export async function waitForElement(
  page: Page,
  selector: string,
  options?: { timeout?: number; state?: 'visible' | 'hidden' | 'attached' | 'detached' }
): Promise<Locator> {
  const locator = page.locator(selector);
  await locator.waitFor({
    state: options?.state || 'visible',
    timeout: options?.timeout || 10000,
  });
  return locator;
}

/**
 * Check if element exists
 */
export async function elementExists(
  page: Page,
  selector: string
): Promise<boolean> {
  return (await page.$(selector)) !== null;
}

/**
 * Get text content of elements
 */
export async function getTextContent(
  page: Page,
  selector: string
): Promise<string[]> {
  return await page.locator(selector).allTextContents();
}

/**
 * Scroll to element
 */
export async function scrollToElement(
  page: Page,
  selector: string
): Promise<void> {
  await page.locator(selector).scrollIntoViewIfNeeded();
}

/**
 * Wait for API response
 */
export async function waitForApiResponse<T = any>(
  page: Page,
  urlPattern: string | RegExp
): Promise<ApiResponse<T>> {
  const response = await page.waitForResponse(
    (res) => {
      const url = res.url();
      return typeof urlPattern === 'string'
        ? url.includes(urlPattern)
        : urlPattern.test(url);
    },
    { timeout: 10000 }
  );
  
  return await response.json();
}

/**
 * Retry action with exponential backoff
 */
export async function retryAction<T>(
  action: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Action failed after retries');
}

/**
 * Clear all cookies and local storage
 */
export async function clearBrowserData(context: BrowserContext): Promise<void> {
  await context.clearCookies();
  const pages = context.pages();
  for (const page of pages) {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
}

/**
 * Generate random test data
 */
export function generateTestData(type: 'email' | 'name' | 'text' | 'number'): string {
  const timestamp = Date.now();
  
  switch (type) {
    case 'email':
      return `test_${timestamp}@mundotango.com`;
    case 'name':
      return `Test User ${timestamp}`;
    case 'text':
      return `Test content ${timestamp}`;
    case 'number':
      return String(Math.floor(Math.random() * 1000));
    default:
      return `test_${timestamp}`;
  }
}

/**
 * Check toast message
 */
export async function checkToastMessage(
  page: Page,
  expectedMessage: string,
  type: 'success' | 'error' | 'info' = 'success'
): Promise<void> {
  const toastSelector = `[data-testid="toast-${type}"]`;
  await waitForElement(page, toastSelector);
  
  const toastText = await page.locator(toastSelector).textContent();
  expect(toastText).toContain(expectedMessage);
  
  // Wait for toast to disappear
  await page.locator(toastSelector).waitFor({ state: 'hidden', timeout: 5000 });
}

/**
 * Navigate with retry
 */
export async function navigateWithRetry(
  page: Page,
  url: string,
  options?: { timeout?: number; waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }
): Promise<void> {
  await retryAction(async () => {
    await page.goto(url, {
      timeout: options?.timeout || 30000,
      waitUntil: options?.waitUntil || 'networkidle',
    });
  });
}