import { Page } from '@playwright/test';

/**
 * Authenticate as super admin (Pierre Dubois - Agent #1)
 * Uses ESA auto-login feature for testing
 */
export async function loginAsSuperAdmin(page: Page) {
  await page.goto('/');
  
  // Wait for auth to complete (ESA auto-login as admin@mundotango.life)
  await page.waitForSelector('[data-testid="user-profile"]', { timeout: 10000 });
  
  // Verify we're logged in as admin
  const username = await page.textContent('[data-testid="user-profile"]');
  if (!username?.includes('Elena') && !username?.includes('Pierre')) {
    throw new Error('Failed to authenticate as admin');
  }
}

/**
 * Wait for WebSocket/SSE connections to be ready
 */
export async function waitForRealtimeConnections(page: Page) {
  // Wait for Socket.io connection
  await page.waitForFunction(
    () => {
      return (window as any).socketConnected === true;
    },
    { timeout: 10000 }
  ).catch(() => {
    console.warn('Socket.io connection timeout - may affect real-time features');
  });
  
  // Give SSE a moment to establish
  await page.waitForTimeout(1000);
}
