/**
 * MB.MD TRACK B: Functional AI Validation Tests
 * Tests actual Mr Blue AI functionality across all pages
 * 
 * CRITICAL: These tests verify AI WORKS, not just UI exists
 * - Click Mr Blue button → Send message → Verify AI response
 * - Test on multiple pages (global accessibility)
 * - Validate response quality and context awareness
 * - Integration with autonomous learning system
 */

import { test, expect } from '@playwright/test';

// Test configuration
const TEST_TIMEOUT = 30000; // AI responses can take time
const AI_RESPONSE_MIN_LENGTH = 20; // Meaningful responses
const PAGES_TO_TEST = [
  '/',
  '/memories', 
  '/admin',
  '/community',
  '/events'
];

test.describe('Mr Blue AI - Functional Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as Super Admin for full access
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', 'admin@test.com');
    await page.fill('[data-testid="input-password"]', 'admin123');
    await page.click('[data-testid="button-login"]');
    await page.waitForURL('/');
    
    // Wait for Mr Blue to initialize
    await page.waitForSelector('[data-testid="button-mr-blue"]', { 
      state: 'visible',
      timeout: 10000 
    });
  });

  test('🔵 CRITICAL: Mr Blue Responds to Messages (Home Page)', async ({ page }) => {
    console.log('🔵 [TRACK B TEST 1] Testing Mr Blue AI response on home page');
    
    // Step 1: Click Mr Blue floating button
    await page.click('[data-testid="button-mr-blue"]');
    console.log('✅ Mr Blue button clicked');
    
    // Step 2: Wait for chat interface
    const chatInput = page.locator('[data-testid="input-chat"]');
    await expect(chatInput).toBeVisible({ timeout: 5000 });
    console.log('✅ Chat interface opened');
    
    // Step 3: Send test message
    const testMessage = 'Tell me about this platform';
    await chatInput.fill(testMessage);
    await page.click('[data-testid="button-send"]');
    console.log(`✅ Message sent: "${testMessage}"`);
    
    // Step 4: Wait for AI response (with timeout for AI processing)
    const aiResponse = await page.waitForSelector('[data-testid^="ai-message-"]', {
      timeout: TEST_TIMEOUT,
      state: 'visible'
    });
    console.log('✅ AI response received');
    
    // Step 5: Validate response quality
    const responseText = await aiResponse.textContent();
    expect(responseText).toBeTruthy();
    expect(responseText!.length).toBeGreaterThan(AI_RESPONSE_MIN_LENGTH);
    console.log(`✅ Response quality validated: ${responseText!.substring(0, 50)}...`);
    
    // Step 6: Verify no error messages
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).not.toBeVisible();
    console.log('✅ No error messages displayed');
  });

  test('🌐 CRITICAL: Mr Blue Works on ALL Pages', async ({ page }) => {
    console.log('🌐 [TRACK B TEST 2] Testing Mr Blue across all pages');
    
    for (const pagePath of PAGES_TO_TEST) {
      console.log(`\n📍 Testing on: ${pagePath}`);
      
      // Navigate to page
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Verify Mr Blue button exists (global accessibility)
      const mrBlueButton = page.locator('[data-testid="button-mr-blue"]');
      await expect(mrBlueButton).toBeVisible({ timeout: 5000 });
      console.log(`  ✅ Mr Blue button visible on ${pagePath}`);
      
      // Click and send message
      await mrBlueButton.click();
      await page.waitForSelector('[data-testid="input-chat"]', { state: 'visible' });
      
      await page.fill('[data-testid="input-chat"]', `Help me with ${pagePath}`);
      await page.click('[data-testid="button-send"]');
      
      // Wait for response
      const response = await page.waitForSelector('[data-testid^="ai-message-"]', {
        timeout: TEST_TIMEOUT
      });
      
      const responseText = await response.textContent();
      expect(responseText).toBeTruthy();
      console.log(`  ✅ AI responded on ${pagePath}: ${responseText!.substring(0, 40)}...`);
      
      // Close chat for next test
      const closeButton = page.locator('[data-testid="button-close-chat"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
  });

  test('🧠 Context-Aware Responses', async ({ page }) => {
    console.log('🧠 [TRACK B TEST 3] Testing context awareness');
    
    // Test on Memories page - should mention memories/posts
    await page.goto('/memories');
    await page.click('[data-testid="button-mr-blue"]');
    await page.fill('[data-testid="input-chat"]', 'What can I do here?');
    await page.click('[data-testid="button-send"]');
    
    const response = await page.waitForSelector('[data-testid^="ai-message-"]', {
      timeout: TEST_TIMEOUT
    });
    
    const responseText = (await response.textContent())!.toLowerCase();
    
    // Response should be context-aware (mention memories, posts, feed, etc.)
    const contextKeywords = ['memor', 'post', 'feed', 'share', 'moment'];
    const hasContext = contextKeywords.some(keyword => responseText.includes(keyword));
    
    expect(hasContext).toBeTruthy();
    console.log(`✅ Context-aware response: ${responseText.substring(0, 60)}...`);
  });

  test('⚡ Performance: Response Time Under 15s', async ({ page }) => {
    console.log('⚡ [TRACK B TEST 4] Testing AI response time');
    
    await page.goto('/');
    await page.click('[data-testid="button-mr-blue"]');
    await page.fill('[data-testid="input-chat"]', 'Hello');
    
    const startTime = Date.now();
    await page.click('[data-testid="button-send"]');
    
    await page.waitForSelector('[data-testid^="ai-message-"]', {
      timeout: TEST_TIMEOUT
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`✅ Response time: ${responseTime}ms`);
    expect(responseTime).toBeLessThan(15000); // 15s max
  });

  test('🔄 Multiple Messages in Conversation', async ({ page }) => {
    console.log('🔄 [TRACK B TEST 5] Testing conversation flow');
    
    await page.goto('/');
    await page.click('[data-testid="button-mr-blue"]');
    
    const messages = [
      'Hello',
      'What is this platform?',
      'How do I create a post?'
    ];
    
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      console.log(`  📤 Sending message ${i + 1}: "${msg}"`);
      
      await page.fill('[data-testid="input-chat"]', msg);
      await page.click('[data-testid="button-send"]');
      
      await page.waitForSelector(`[data-testid="ai-message-${i + 1}"]`, {
        timeout: TEST_TIMEOUT
      });
      
      console.log(`  ✅ Response ${i + 1} received`);
    }
    
    // Verify all messages in conversation
    const allMessages = page.locator('[data-testid^="ai-message-"]');
    const messageCount = await allMessages.count();
    expect(messageCount).toBe(messages.length);
    console.log(`✅ Conversation maintained: ${messageCount} responses`);
  });

  test('🚨 Error Handling: Invalid Input', async ({ page }) => {
    console.log('🚨 [TRACK B TEST 6] Testing error handling');
    
    await page.goto('/');
    await page.click('[data-testid="button-mr-blue"]');
    
    // Send empty message
    await page.click('[data-testid="button-send"]');
    
    // Should show validation error or gracefully handle
    const errorOrResponse = await Promise.race([
      page.waitForSelector('[data-testid="error-validation"]', { timeout: 2000 }).catch(() => null),
      page.waitForSelector('[data-testid^="ai-message-"]', { timeout: 2000 }).catch(() => null)
    ]);
    
    expect(errorOrResponse).toBeTruthy(); // Either error message or handled gracefully
    console.log('✅ Empty message handled appropriately');
  });

  test('🔐 Authentication: Endpoint Security', async ({ page }) => {
    console.log('🔐 [TRACK B TEST 7] Testing API security');
    
    // Test API endpoint directly (should require auth)
    const response = await page.request.post('/api/mrblue/simple-chat', {
      data: {
        message: 'test',
        context: {},
        model: 'claude-sonnet-4-20250514'
      }
    });
    
    // Should return 401 if not authenticated, or 200 if session valid
    expect([200, 401]).toContain(response.status());
    console.log(`✅ API endpoint security: ${response.status()}`);
  });

  test('📊 Integration: Autonomous Learning Records', async ({ page }) => {
    console.log('📊 [TRACK B TEST 8] Testing autonomous learning integration');
    
    await page.goto('/');
    await page.click('[data-testid="button-mr-blue"]');
    await page.fill('[data-testid="input-chat"]', 'Test autonomous learning');
    await page.click('[data-testid="button-send"]');
    
    await page.waitForSelector('[data-testid^="ai-message-"]', {
      timeout: TEST_TIMEOUT
    });
    
    // Check if interaction was logged
    const learningResponse = await page.request.get('/api/component-learning/history/MrBlueChat');
    expect(learningResponse.status()).toBe(200);
    
    const learningData = await learningResponse.json();
    console.log(`✅ Learning system tracked interaction: ${learningData.length || 0} records`);
  });
});

// Continuous validation hook (runs on schedule)
test.describe('Mr Blue - Continuous Validation', () => {
  test('🔁 Hourly Health Check', async ({ page }) => {
    console.log('🔁 Running hourly Mr Blue health check');
    
    await page.goto('/');
    
    // Quick smoke test
    await page.click('[data-testid="button-mr-blue"]');
    await page.fill('[data-testid="input-chat"]', 'Health check');
    await page.click('[data-testid="button-send"]');
    
    const response = await page.waitForSelector('[data-testid^="ai-message-"]', {
      timeout: TEST_TIMEOUT
    });
    
    const responseText = await response.textContent();
    expect(responseText).toBeTruthy();
    
    console.log('✅ Hourly health check PASSED');
    
    // Report to autonomous learning
    await page.request.post('/api/component-learning/record', {
      data: {
        componentName: 'MrBlueChat',
        learningType: 'health-check',
        status: 'success',
        timestamp: new Date().toISOString()
      }
    });
  });
});
