/**
 * VISUAL EDITOR CONTEXT-AWARE CHAT E2E TESTS
 * MB.MD METHODOLOGY: Testing Visual Editor + Mr Blue Integration
 * 
 * Test Scenarios:
 * 1. Element selection → Ask "what element am I on?" → Verify element name returned
 * 2. Element selection → Ask "tell me about this element" → Verify detailed info
 * 3. No selection → Ask "what element am I on?" → Verify helpful prompt
 * 4. General help queries
 * 
 * DEBUG: All requests/responses logged to verify data flow
 */

import { test, expect, Page } from '@playwright/test';

// Helper to wait for network idle
async function waitForNetworkIdle(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Extra buffer
}

// Helper to login as super admin
async function loginAsSuperAdmin(page: Page) {
  console.log('🔐 Logging in as super admin...');
  
  // Navigate to home page (auth bypass should auto-login in dev)
  await page.goto('/');
  await waitForNetworkIdle(page);
  
  // Verify we're logged in by checking for user-specific elements
  const userElement = page.locator('[data-testid*="user"], [data-testid*="profile"], .user-menu, .profile-menu').first();
  await expect(userElement).toBeVisible({ timeout: 10000 });
  
  console.log('✅ Logged in successfully');
}

// Helper to navigate to Visual Editor
async function openVisualEditor(page: Page) {
  console.log('🎨 Opening Visual Editor...');
  
  await page.goto('/admin/visual-editor');
  await waitForNetworkIdle(page);
  
  // Wait for Visual Editor overlay to load
  await expect(page.locator('[data-testid="visual-editor-overlay"]')).toBeVisible({ timeout: 10000 });
  
  console.log('✅ Visual Editor opened');
}

// Helper to send chat message and get response
async function sendChatMessage(page: Page, message: string): Promise<string> {
  console.log(`💬 Sending message: "${message}"`);
  
  const input = page.locator('[data-testid="input-chat-message"]');
  const sendButton = page.locator('[data-testid="button-send-message"]');
  
  await input.fill(message);
  await sendButton.click();
  
  // Wait for response (loading indicator should disappear)
  await expect(page.locator('text=Thinking...')).toBeHidden({ timeout: 10000 });
  
  // Get the last assistant message
  const messages = page.locator('[data-radix-scroll-area-viewport] > div > div');
  const lastMessage = messages.last();
  const responseText = await lastMessage.locator('p').first().textContent();
  
  console.log(`📨 Received response: "${responseText?.substring(0, 100)}..."`);
  
  return responseText || '';
}

test.describe('Visual Editor Context-Aware Chat', () => {
  test.beforeEach(async ({ page }) => {
    // Set up console logging to capture debug output
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('MR BLUE')) {
        console.log(`[BROWSER] ${msg.text()}`);
      }
    });
    
    await loginAsSuperAdmin(page);
  });
  
  test('should respond with element name when asking "what element am I on?"', async ({ page }) => {
    await openVisualEditor(page);
    
    // Wait for preview iframe to load
    const iframe = page.frameLocator('[data-testid="preview-iframe"]');
    await iframe.locator('body').waitFor({ timeout: 10000 });
    
    // Find and click a button element in the preview
    const button = iframe.locator('button').first();
    await button.waitFor({ timeout: 5000 });
    
    // Get the test-id of the button we're about to click
    const testId = await button.getAttribute('data-testid');
    console.log(`🎯 Selecting element with test-id: ${testId}`);
    
    // Click to select
    await button.click();
    
    // Wait for selection to register
    await page.waitForTimeout(1000);
    
    // Verify element is shown as selected in context badges
    await expect(page.locator(`text=${testId}`)).toBeVisible();
    
    // Ask the question
    const response = await sendChatMessage(page, 'what element am I on?');
    
    // Verify response contains the element name
    expect(response).toContain(testId || '');
    expect(response).not.toContain('No element');
    
    console.log('✅ Test passed: Element name returned correctly');
  });
  
  test('should provide detailed info when asking "tell me about this element"', async ({ page }) => {
    await openVisualEditor(page);
    
    // Select an element
    const iframe = page.frameLocator('[data-testid="preview-iframe"]');
    const button = iframe.locator('button').first();
    await button.waitFor({ timeout: 5000 });
    
    const testId = await button.getAttribute('data-testid');
    console.log(`🎯 Selecting element: ${testId}`);
    
    await button.click();
    await page.waitForTimeout(1000);
    
    // Ask for details
    const response = await sendChatMessage(page, 'tell me about this element');
    
    // Verify response contains detailed information
    expect(response).toContain(testId || '');
    expect(response).toContain('Type:');
    expect(response).toContain('Test ID:');
    expect(response).toContain('Page:');
    
    console.log('✅ Test passed: Detailed element info provided');
  });
  
  test('should prompt user to select element when none selected', async ({ page }) => {
    await openVisualEditor(page);
    
    // Ask question without selecting anything
    const response = await sendChatMessage(page, 'what element am I on?');
    
    // Verify helpful prompt
    expect(response).toContain('No element');
    expect(response).toContain('select');
    
    console.log('✅ Test passed: Helpful prompt when no selection');
  });
  
  test('should provide general help when asked', async ({ page }) => {
    await openVisualEditor(page);
    
    const response = await sendChatMessage(page, 'what can you help me with?');
    
    // Verify help response
    expect(response).toContain('Mr Blue');
    expect(response).toContain('help');
    expect(response.toLowerCase()).toMatch(/element|edit|style|change/);
    
    console.log('✅ Test passed: General help provided');
  });
  
  test('should maintain context across multiple messages', async ({ page }) => {
    await openVisualEditor(page);
    
    // Select an element
    const iframe = page.frameLocator('[data-testid="preview-iframe"]');
    const button = iframe.locator('button').first();
    await button.waitFor({ timeout: 5000 });
    
    const testId = await button.getAttribute('data-testid');
    await button.click();
    await page.waitForTimeout(1000);
    
    // First message
    const response1 = await sendChatMessage(page, 'what element am I on?');
    expect(response1).toContain(testId || '');
    
    // Second message without selecting anything new
    const response2 = await sendChatMessage(page, 'tell me about this element');
    expect(response2).toContain(testId || '');
    
    console.log('✅ Test passed: Context maintained across messages');
  });
  
  test('should update context when selecting different element', async ({ page }) => {
    await openVisualEditor(page);
    
    const iframe = page.frameLocator('[data-testid="preview-iframe"]');
    
    // Select first element
    const button1 = iframe.locator('button').first();
    await button1.waitFor({ timeout: 5000 });
    const testId1 = await button1.getAttribute('data-testid');
    await button1.click();
    await page.waitForTimeout(1000);
    
    const response1 = await sendChatMessage(page, 'what element am I on?');
    expect(response1).toContain(testId1 || '');
    
    // Select second element
    const button2 = iframe.locator('button').nth(1);
    const testId2 = await button2.getAttribute('data-testid');
    await button2.click();
    await page.waitForTimeout(1000);
    
    const response2 = await sendChatMessage(page, 'what element am I on?');
    expect(response2).toContain(testId2 || '');
    expect(response2).not.toContain(testId1 || '');
    
    console.log('✅ Test passed: Context updates with new selection');
  });
  
  test('should handle quick action buttons', async ({ page }) => {
    await openVisualEditor(page);
    
    // Click "What can I edit?" quick action
    const quickAction = page.locator('[data-testid="button-quick-what-edit"]');
    await quickAction.click();
    
    // Verify message was sent
    await expect(page.locator('text=Thinking...')).toBeHidden({ timeout: 10000 });
    
    // Verify response
    const messages = page.locator('[data-radix-scroll-area-viewport] > div > div');
    const lastMessage = messages.last();
    const responseText = await lastMessage.locator('p').first().textContent();
    
    expect(responseText).toBeTruthy();
    
    console.log('✅ Test passed: Quick action buttons work');
  });
});

test.describe('Visual Editor Chat API Integration', () => {
  test('should send correct context in API request', async ({ page }) => {
    // Intercept API calls
    let apiRequestBody: any = null;
    
    page.on('request', request => {
      if (request.url().includes('/api/visual-editor/simple-chat')) {
        try {
          apiRequestBody = JSON.parse(request.postData() || '{}');
          console.log('📤 API Request Body:', JSON.stringify(apiRequestBody, null, 2));
        } catch (e) {
          console.error('Failed to parse request body');
        }
      }
    });
    
    await loginAsSuperAdmin(page);
    await openVisualEditor(page);
    
    // Select an element
    const iframe = page.frameLocator('[data-testid="preview-iframe"]');
    const button = iframe.locator('button').first();
    await button.waitFor({ timeout: 5000 });
    
    const testId = await button.getAttribute('data-testid');
    await button.click();
    await page.waitForTimeout(1000);
    
    // Send a message
    await sendChatMessage(page, 'what element am I on?');
    
    // Verify API request contained correct context
    expect(apiRequestBody).toBeTruthy();
    expect(apiRequestBody.message).toBe('what element am I on?');
    expect(apiRequestBody.context).toBeTruthy();
    expect(apiRequestBody.context.selectedComponent).toBeTruthy();
    expect(apiRequestBody.context.selectedComponent.name).toBe(testId);
    
    console.log('✅ Test passed: API request contains correct context');
  });
});
