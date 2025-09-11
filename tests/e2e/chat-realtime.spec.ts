/**
 * ESA LIFE CEO 61×21 - Chat & Real-time WebSocket Tests
 * Tests real-time messaging, presence, typing indicators, and connection handling
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Test configuration
const TEST_USERS = {
  user1: {
    email: process.env.USER1_EMAIL || 'user1@mundotango.com',
    password: process.env.USER1_PW || 'testpass123',
    username: 'User One'
  },
  user2: {
    email: process.env.USER2_EMAIL || 'user2@mundotango.com',
    password: process.env.USER2_PW || 'testpass123',
    username: 'User Two'
  },
  user3: {
    email: process.env.USER3_EMAIL || 'user3@mundotango.com',
    password: process.env.USER3_PW || 'testpass123',
    username: 'User Three'
  }
};

// Helper function to login
async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByTestId('input-email').fill(email);
  await page.getByTestId('input-password').fill(password);
  await page.getByTestId('button-submit').click();
  await expect(page).toHaveURL(/dashboard|feed|messages/, { timeout: 10000 });
}

// Helper to wait for WebSocket connection
async function waitForWebSocketConnection(page: Page) {
  await page.waitForFunction(() => {
    // Check for WebSocket ready state in window
    return (window as any).wsConnected === true;
  }, { timeout: 5000 }).catch(() => {
    // Fallback: just wait a bit for connection
    return page.waitForTimeout(2000);
  });
  
  // Also check for visual indicator if available
  const indicator = page.getByTestId('status-websocket');
  if (await indicator.count() > 0) {
    await expect(indicator).toHaveAttribute('data-status', 'connected', { timeout: 5000 });
  }
}

test.describe('Chat & Real-time WebSocket', () => {
  test('Happy: Send and receive messages in real-time', async ({ browser }) => {
    // User 1 logs in
    const user1Ctx = await browser.newContext();
    const user1 = await user1Ctx.newPage();
    
    await loginUser(user1, TEST_USERS.user1.email, TEST_USERS.user1.password);
    await user1.goto('/messages');
    await waitForWebSocketConnection(user1);
    
    // User 2 logs in
    const user2Ctx = await browser.newContext();
    const user2 = await user2Ctx.newPage();
    
    await loginUser(user2, TEST_USERS.user2.email, TEST_USERS.user2.password);
    await user2.goto('/messages');
    await waitForWebSocketConnection(user2);
    
    // User 1 starts a chat with User 2
    await user1.getByTestId('button-new-chat').click();
    await user1.getByTestId('input-search-users').fill(TEST_USERS.user2.username);
    await user1.getByTestId(`user-result-${TEST_USERS.user2.username}`).click();
    await user1.getByTestId('button-start-chat').click();
    
    // User 1 sends a message
    await user1.getByTestId('input-message').fill('Hello from User 1! 🎭');
    await user1.getByTestId('button-send-message').click();
    
    // Verify message appears for User 1
    await expect(user1.getByTestId('message-bubble').last()).toContainText('Hello from User 1! 🎭');
    await expect(user1.getByTestId('message-status').last()).toHaveAttribute('data-status', 'sent');
    
    // User 2 should receive the message
    await expect(user2.getByTestId('notification-new-message')).toBeVisible({ timeout: 5000 });
    await user2.getByTestId('chat-thread-User One').click();
    await expect(user2.getByTestId('message-bubble').last()).toContainText('Hello from User 1! 🎭');
    
    // User 2 replies
    await user2.getByTestId('input-message').fill('Hi back! How are you? 💃');
    await user2.getByTestId('button-send-message').click();
    
    // User 1 receives the reply
    await expect(user1.getByTestId('message-bubble').last()).toContainText('Hi back! How are you? 💃');
    
    // Verify message delivered status
    await expect(user1.getByTestId('message-status').first()).toHaveAttribute('data-status', 'delivered');
    
    // Cleanup
    await user1Ctx.close();
    await user2Ctx.close();
  });

  test('Happy: Typing indicators show in real-time', async ({ browser }) => {
    const user1Ctx = await browser.newContext();
    const user1 = await user1Ctx.newPage();
    
    await loginUser(user1, TEST_USERS.user1.email, TEST_USERS.user1.password);
    await user1.goto('/messages');
    await waitForWebSocketConnection(user1);
    
    const user2Ctx = await browser.newContext();
    const user2 = await user2Ctx.newPage();
    
    await loginUser(user2, TEST_USERS.user2.email, TEST_USERS.user2.password);
    await user2.goto('/messages');
    await waitForWebSocketConnection(user2);
    
    // Start chat
    await user1.getByTestId('button-new-chat').click();
    await user1.getByTestId('input-search-users').fill(TEST_USERS.user2.username);
    await user1.getByTestId(`user-result-${TEST_USERS.user2.username}`).click();
    await user1.getByTestId('button-start-chat').click();
    
    // User 2 opens the chat
    await user2.getByTestId('chat-thread-User One').click();
    
    // User 1 starts typing
    await user1.getByTestId('input-message').fill('I am typing...');
    
    // User 2 should see typing indicator
    await expect(user2.getByTestId('typing-indicator')).toBeVisible();
    await expect(user2.getByTestId('typing-indicator')).toContainText('User One is typing');
    
    // User 1 stops typing (clear input)
    await user1.getByTestId('input-message').clear();
    
    // Typing indicator should disappear
    await expect(user2.getByTestId('typing-indicator')).toBeHidden({ timeout: 3000 });
    
    await user1Ctx.close();
    await user2Ctx.close();
  });

  test('Happy: Presence indicators update correctly', async ({ browser }) => {
    const user1Ctx = await browser.newContext();
    const user1 = await user1Ctx.newPage();
    
    await loginUser(user1, TEST_USERS.user1.email, TEST_USERS.user1.password);
    await user1.goto('/messages');
    await waitForWebSocketConnection(user1);
    
    // Check initial online users
    await user1.getByTestId('button-online-users').click();
    const initialOnlineCount = await user1.getByTestId('online-user').count();
    
    // User 2 comes online
    const user2Ctx = await browser.newContext();
    const user2 = await user2Ctx.newPage();
    
    await loginUser(user2, TEST_USERS.user2.email, TEST_USERS.user2.password);
    await user2.goto('/messages');
    await waitForWebSocketConnection(user2);
    
    // User 1 should see User 2 as online
    await user1.reload(); // Refresh to get updated presence
    await user1.getByTestId('button-online-users').click();
    await expect(user1.getByTestId(`online-user-${TEST_USERS.user2.username}`)).toBeVisible();
    
    const newOnlineCount = await user1.getByTestId('online-user').count();
    expect(newOnlineCount).toBe(initialOnlineCount + 1);
    
    // User 2 goes offline
    await user2Ctx.close();
    
    // User 1 should see User 2 go offline (with some delay)
    await user1.waitForTimeout(2000); // Wait for presence update
    await user1.reload();
    await user1.getByTestId('button-online-users').click();
    await expect(user1.getByTestId(`online-user-${TEST_USERS.user2.username}`)).toHaveCount(0);
    
    await user1Ctx.close();
  });

  test('Edge: Handle message with long text', async ({ browser }) => {
    const user1Ctx = await browser.newContext();
    const user1 = await user1Ctx.newPage();
    
    await loginUser(user1, TEST_USERS.user1.email, TEST_USERS.user1.password);
    await user1.goto('/messages');
    await waitForWebSocketConnection(user1);
    
    const user2Ctx = await browser.newContext();
    const user2 = await user2Ctx.newPage();
    
    await loginUser(user2, TEST_USERS.user2.email, TEST_USERS.user2.password);
    await user2.goto('/messages');
    await waitForWebSocketConnection(user2);
    
    // Start chat
    await user1.getByTestId('button-new-chat').click();
    await user1.getByTestId('input-search-users').fill(TEST_USERS.user2.username);
    await user1.getByTestId(`user-result-${TEST_USERS.user2.username}`).click();
    await user1.getByTestId('button-start-chat').click();
    
    // Send very long message
    const longMessage = 'This is a very long message about tango. '.repeat(50);
    await user1.getByTestId('input-message').fill(longMessage);
    await user1.getByTestId('button-send-message').click();
    
    // Message should be truncated or wrapped properly
    await expect(user1.getByTestId('message-bubble').last()).toBeVisible();
    
    // User 2 receives and can expand long message
    await user2.getByTestId('chat-thread-User One').click();
    const messageBubble = user2.getByTestId('message-bubble').last();
    await expect(messageBubble).toBeVisible();
    
    // Check if there's a "show more" option for long messages
    const showMore = messageBubble.getByTestId('button-show-more');
    if (await showMore.count() > 0) {
      await showMore.click();
      await expect(messageBubble).toContainText('This is a very long message about tango');
    }
    
    await user1Ctx.close();
    await user2Ctx.close();
  });

  test('Edge: Handle WebSocket disconnection and reconnection', async ({ page, context }) => {
    await loginUser(page, TEST_USERS.user1.email, TEST_USERS.user1.password);
    await page.goto('/messages');
    await waitForWebSocketConnection(page);
    
    // Simulate network disconnection
    await context.setOffline(true);
    
    // Should show disconnected status
    await expect(page.getByTestId('alert-connection-lost')).toBeVisible({ timeout: 5000 });
    const statusIndicator = page.getByTestId('status-websocket');
    if (await statusIndicator.count() > 0) {
      await expect(statusIndicator).toHaveAttribute('data-status', 'disconnected');
    }
    
    // Try to send message while offline
    await page.getByTestId('input-message').fill('Message while offline');
    await page.getByTestId('button-send-message').click();
    
    // Should show pending or error state
    await expect(page.getByTestId('message-status').last()).toHaveAttribute('data-status', 'pending');
    
    // Reconnect
    await context.setOffline(false);
    
    // Should reconnect automatically
    await expect(page.getByTestId('alert-connection-restored')).toBeVisible({ timeout: 10000 });
    
    // Pending message should be sent
    await expect(page.getByTestId('message-status').last()).toHaveAttribute('data-status', 'sent', { timeout: 5000 });
  });

  test('Happy: Group chat with multiple users', async ({ browser }) => {
    // Three users join a group chat
    const user1Ctx = await browser.newContext();
    const user1 = await user1Ctx.newPage();
    await loginUser(user1, TEST_USERS.user1.email, TEST_USERS.user1.password);
    await user1.goto('/messages');
    await waitForWebSocketConnection(user1);
    
    const user2Ctx = await browser.newContext();
    const user2 = await user2Ctx.newPage();
    await loginUser(user2, TEST_USERS.user2.email, TEST_USERS.user2.password);
    await user2.goto('/messages');
    await waitForWebSocketConnection(user2);
    
    const user3Ctx = await browser.newContext();
    const user3 = await user3Ctx.newPage();
    await loginUser(user3, TEST_USERS.user3.email, TEST_USERS.user3.password);
    await user3.goto('/messages');
    await waitForWebSocketConnection(user3);
    
    // User 1 creates group chat
    await user1.getByTestId('button-new-group-chat').click();
    await user1.getByTestId('input-group-name').fill('Tango Practice Group');
    await user1.getByTestId('input-search-users').fill(TEST_USERS.user2.username);
    await user1.getByTestId(`checkbox-user-${TEST_USERS.user2.username}`).check();
    await user1.getByTestId('input-search-users').clear();
    await user1.getByTestId('input-search-users').fill(TEST_USERS.user3.username);
    await user1.getByTestId(`checkbox-user-${TEST_USERS.user3.username}`).check();
    await user1.getByTestId('button-create-group').click();
    
    // All users should see the group chat
    await expect(user1.getByTestId('chat-thread-Tango Practice Group')).toBeVisible();
    await expect(user2.getByTestId('chat-thread-Tango Practice Group')).toBeVisible({ timeout: 5000 });
    await expect(user3.getByTestId('chat-thread-Tango Practice Group')).toBeVisible({ timeout: 5000 });
    
    // User 1 sends message to group
    await user1.getByTestId('chat-thread-Tango Practice Group').click();
    await user1.getByTestId('input-message').fill('Welcome to our practice group!');
    await user1.getByTestId('button-send-message').click();
    
    // All users receive the message
    await user2.getByTestId('chat-thread-Tango Practice Group').click();
    await expect(user2.getByTestId('message-bubble').last()).toContainText('Welcome to our practice group!');
    
    await user3.getByTestId('chat-thread-Tango Practice Group').click();
    await expect(user3.getByTestId('message-bubble').last()).toContainText('Welcome to our practice group!');
    
    // Multiple users type simultaneously
    await user2.getByTestId('input-message').fill('Thanks for adding me!');
    await user3.getByTestId('input-message').fill('Excited to practice!');
    
    // User 1 should see multiple typing indicators
    await expect(user1.getByTestId('typing-indicator')).toContainText('multiple people are typing');
    
    await user1Ctx.close();
    await user2Ctx.close();
    await user3Ctx.close();
  });

  test('Edge: Handle rapid message sending', async ({ browser }) => {
    const user1Ctx = await browser.newContext();
    const user1 = await user1Ctx.newPage();
    
    await loginUser(user1, TEST_USERS.user1.email, TEST_USERS.user1.password);
    await user1.goto('/messages');
    await waitForWebSocketConnection(user1);
    
    const user2Ctx = await browser.newContext();
    const user2 = await user2Ctx.newPage();
    
    await loginUser(user2, TEST_USERS.user2.email, TEST_USERS.user2.password);
    await user2.goto('/messages');
    await waitForWebSocketConnection(user2);
    
    // Start chat
    await user1.getByTestId('button-new-chat').click();
    await user1.getByTestId('input-search-users').fill(TEST_USERS.user2.username);
    await user1.getByTestId(`user-result-${TEST_USERS.user2.username}`).click();
    await user1.getByTestId('button-start-chat').click();
    
    // Send multiple messages rapidly
    const messages = ['Message 1', 'Message 2', 'Message 3', 'Message 4', 'Message 5'];
    for (const msg of messages) {
      await user1.getByTestId('input-message').fill(msg);
      await user1.getByTestId('button-send-message').click();
      // Don't wait between messages
    }
    
    // All messages should appear in correct order
    await user2.getByTestId('chat-thread-User One').click();
    
    for (let i = 0; i < messages.length; i++) {
      const bubble = user2.getByTestId('message-bubble').nth(i);
      await expect(bubble).toContainText(messages[i]);
    }
    
    // Check no duplicate messages
    const messageCount = await user2.getByTestId('message-bubble').count();
    expect(messageCount).toBe(messages.length);
    
    await user1Ctx.close();
    await user2Ctx.close();
  });

  test('Failure: Message delivery failure handling', async ({ page, context }) => {
    await loginUser(page, TEST_USERS.user1.email, TEST_USERS.user1.password);
    await page.goto('/messages');
    await waitForWebSocketConnection(page);
    
    // Block WebSocket messages
    await context.route('**/socket.io/**', route => {
      if (route.request().method() === 'POST') {
        route.abort('failed');
      } else {
        route.continue();
      }
    });
    
    // Try to send message
    await page.getByTestId('input-message').fill('This message will fail');
    await page.getByTestId('button-send-message').click();
    
    // Should show error state
    await expect(page.getByTestId('message-status').last()).toHaveAttribute('data-status', 'error', { timeout: 5000 });
    await expect(page.getByTestId('button-retry-message')).toBeVisible();
    
    // Retry sending
    await page.getByTestId('button-retry-message').click();
    
    // If still failing, should show persistent error
    await expect(page.getByTestId('alert-message-failed')).toBeVisible();
  });
});