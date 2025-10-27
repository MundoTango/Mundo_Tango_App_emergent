/**
 * Integration Test: Voice Audio Transmission End-to-End
 * Tests complete flow: UI → WebSocket → Audio Capture → Backend
 */

import { test, expect } from '@playwright/test';

test.describe('Voice Audio Transmission Integration', () => {
  test('should establish WebSocket connection when voice modal opens', async ({ page }) => {
    await page.goto('/');
    
    // Track WebSocket connections
    let wsConnected = false;
    page.on('websocket', ws => {
      ws.on('open', () => {
        wsConnected = true;
      });
    });
    
    // Open Mr Blue → Voice
    await page.click('[data-testid="button-mr-blue"]');
    await page.waitForTimeout(500);
    
    await page.click('[data-testid="button-voice"]');
    await page.waitForTimeout(500);
    
    // Click Start Voice
    await page.click('[data-testid="button-start-voice"]');
    await page.waitForTimeout(2000);
    
    // Verify: WebSocket connected
    expect(wsConnected).toBe(true);
  });
  
  test('should show connection status in UI', async ({ page }) => {
    await page.goto('/');
    
    const consoleLogs: string[] = [];
    page.on('console', msg => consoleLogs.push(msg.text()));
    
    // Open voice modal
    await page.click('[data-testid="button-mr-blue"]');
    await page.click('[data-testid="button-voice"]');
    
    // Wait for modal
    await page.waitForSelector('[data-testid="button-start-voice"]');
    
    // Initially should show idle state
    const initialStatus = await page.locator('.text-xs.text-gray-500').textContent();
    expect(initialStatus).toMatch(/Click.*Start.*begin/i);
    
    // Start voice
    await page.click('[data-testid="button-start-voice"]');
    await page.waitForTimeout(2000);
    
    // Should show active state
    const activeStatus = await page.locator('.text-xs.text-gray-500').textContent();
    expect(activeStatus).toMatch(/Tip:|AI summarizes|real-time/i);
  });
  
  test('should use single realtimeStatus (no duplicate connectionStatus)', async ({ page }) => {
    await page.goto('/');
    
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('status:') || msg.text().includes('Status:')) {
        consoleLogs.push(msg.text());
      }
    });
    
    // Open voice and start
    await page.click('[data-testid="button-mr-blue"]');
    await page.click('[data-testid="button-voice"]');
    await page.click('[data-testid="button-start-voice"]');
    await page.waitForTimeout(2000);
    
    // Verify: Only realtimeStatus logs (not connectionStatus)
    const realtimeLogs = consoleLogs.filter(log => /realtime status:/i.test(log));
    const connectionLogs = consoleLogs.filter(log => /connection status:/i.test(log));
    
    expect(realtimeLogs.length).toBeGreaterThan(0);
    expect(connectionLogs.length).toBe(0); // No duplicate state!
  });
});
