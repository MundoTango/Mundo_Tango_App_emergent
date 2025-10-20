// TRACK 4 (S4): Messaging E2E Tests
import { test, expect } from '@playwright/test';

test.describe('Direct Messaging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
  });

  test('should show messages page', async ({ page }) => {
    await page.goto('/messages');
    
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('messages');
  });

  test('should display message list or empty state', async ({ page }) => {
    await page.goto('/messages');
    
    const messageArea = page.locator('[data-testid="message-list"]').or(
      page.locator('.message-thread')
    ).or(
      page.locator('text=No messages')
    );
    
    await expect(messageArea).toBeVisible({ timeout: 10000 });
  });

  test('should have WebSocket connection active', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Check console logs for WebSocket connection
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(2000);
    
    const hasSocketLog = logs.some(log => 
      log.includes('Socket') || 
      log.includes('WebSocket') || 
      log.includes('connected')
    );
    
    expect(hasSocketLog).toBeTruthy();
  });
});
