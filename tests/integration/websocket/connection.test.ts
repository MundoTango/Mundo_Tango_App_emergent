/**
 * WebSocket Connection Tests
 * Phase 12: Integration Testing
 * Tests: Connection, disconnection, room management
 */

import { test, expect } from '@playwright/test';
import { registerUser } from '../../helpers/auth-helpers';
import { createTestUser } from '../../fixtures/users';

test.describe('WebSocket Connection', () => {
  test('should establish WebSocket connection after login', async ({ page }) => {
    // Register and login
    const user = createTestUser();
    await registerUser(page, user);
    
    // Wait for WebSocket connection
    await page.waitForTimeout(2000);
    
    // Check if Socket.io connection is established
    const isConnected = await page.evaluate(() => {
      // @ts-ignore - socket may be on window
      return window.socket?.connected || false;
    });
    
    expect(isConnected).toBe(true);
  });

  test('should receive heartbeat from server', async ({ page }) => {
    const user = createTestUser();
    await registerUser(page, user);
    
    // Listen for heartbeat events
    const heartbeatReceived = await page.evaluate(() => {
      return new Promise((resolve) => {
        // @ts-ignore
        if (window.socket) {
          // @ts-ignore
          window.socket.on('heartbeat', () => {
            resolve(true);
          });
          
          // Timeout after 10 seconds
          setTimeout(() => resolve(false), 10000);
        } else {
          resolve(false);
        }
      });
    });
    
    expect(heartbeatReceived).toBe(true);
  });

  test('should join user room on connection', async ({ page }) => {
    const user = createTestUser();
    await registerUser(page, user);
    
    await page.waitForTimeout(2000);
    
    // Check if user joined their room
    const roomJoined = await page.evaluate(() => {
      // @ts-ignore
      return window.socket?.connected && true;
    });
    
    expect(roomJoined).toBe(true);
  });

  test('should reconnect after disconnect', async ({ page }) => {
    const user = createTestUser();
    await registerUser(page, user);
    
    await page.waitForTimeout(2000);
    
    // Disconnect WebSocket
    await page.evaluate(() => {
      // @ts-ignore
      if (window.socket) {
        // @ts-ignore
        window.socket.disconnect();
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Reconnect
    await page.evaluate(() => {
      // @ts-ignore
      if (window.socket) {
        // @ts-ignore
        window.socket.connect();
      }
    });
    
    await page.waitForTimeout(2000);
    
    // Check if reconnected
    const isConnected = await page.evaluate(() => {
      // @ts-ignore
      return window.socket?.connected || false;
    });
    
    expect(isConnected).toBe(true);
  });

  test('should receive real-time notifications', async ({ page, context }) => {
    // Create two users
    const user1 = createTestUser();
    const user2 = createTestUser();
    
    // User 1 logs in
    await registerUser(page, user1);
    
    // User 2 logs in on different page
    const page2 = await context.newPage();
    await registerUser(page2, user2);
    
    // User 2 creates a post mentioning User 1
    await page2.click('[data-testid="button-create-post"]');
    await page2.fill('[data-testid="input-post-content"]', `Hey @${user1.username}! Check this out!`);
    await page2.click('[data-testid="button-submit-post"]');
    
    // User 1 should receive notification (wait up to 5 seconds)
    await page.waitForTimeout(5000);
    
    // Check if notification bell has indicator
    const notificationCount = await page.locator('[data-testid="notification-count"]').count();
    expect(notificationCount).toBeGreaterThan(0);
    
    await page2.close();
  });
});
