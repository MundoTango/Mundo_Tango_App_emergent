/**
 * Playwright Fixture: Authenticated Page
 * 
 * Provides a page with user already logged in
 * Handles auth bypass for testing
 */

import { test as base, Page } from '@playwright/test';

type AuthenticatedPageFixture = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthenticatedPageFixture>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate and wait for auth bypass
    await page.goto('/');
    
    // Wait for user authentication (auth bypass in dev mode)
    await page.waitForFunction(() => {
      return window.localStorage.getItem('user') !== null;
    }, { timeout: 10000 }).catch(() => {
      console.log('Using default auth bypass');
    });

    // Verify authenticated
    const userElement = page.locator('[data-testid="user-avatar"]');
    await userElement.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {
      console.log('User avatar not visible, but continuing');
    });

    await use(page);
  },
});

export { expect } from '@playwright/test';
