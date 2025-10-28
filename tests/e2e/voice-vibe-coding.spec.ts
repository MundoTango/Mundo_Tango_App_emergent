/**
 * STAGE 4 TESTING: Voice + Vibe Coding E2E Test ($2)
 * Complete user journey with real AI
 * Created: October 28, 2025
 * 
 * Purpose: Validate complete workflow WebSocket → Voice → AI → Vibe Coding → Git
 * Cost: ~$2 per run (includes multiple AI calls + browser automation)
 * When to Run: Before production deployment ONLY
 */

import { test, expect } from '@playwright/test';

test.describe('Voice + Vibe Coding Integration', () => {
  test('Super admin can use voice to trigger vibe coding', async ({ page }) => {
    // Step 1: Login as super admin
    await page.goto('/');
    await page.click('[data-testid="button-login"]');
    await page.fill('[data-testid="input-email"]', 'superadmin@mundotango.app');
    await page.fill('[data-testid="input-password"]', 'test123');
    await page.click('[data-testid="button-submit"]');
    await page.waitForURL('/dashboard');

    // Screenshot 1: Access (RULE 3)
    await page.screenshot({ path: 'evidence/voice-e2e-1-access.png' });

    // Step 2: Open Mr Blue chat
    await page.click('[data-testid="button-mrblue"]');
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();

    // Step 3: Enable voice mode
    await page.click('[data-testid="button-voice-mode"]');
    await expect(page.locator('[data-testid="voice-indicator"]')).toBeVisible();

    // Screenshot 2: Action (RULE 3)
    await page.screenshot({ path: 'evidence/voice-e2e-2-voice-enabled.png' });

    // Step 4: Simulate voice command (via text for testing)
    await page.fill('[data-testid="input-chat"]', 'Make the header bigger and change it to blue');
    await page.click('[data-testid="button-send"]');

    // Wait for AI response
    await page.waitForSelector('[data-testid="chat-message-assistant"]', { timeout: 30000 });

    // Step 5: Verify vibe coding was triggered
    const vibeBadge = page.locator('[data-testid="badge-vibe-coding"]');
    await expect(vibeBadge).toBeVisible({ timeout: 30000 });

    // Screenshot 3: Result (RULE 3)
    await page.screenshot({ path: 'evidence/voice-e2e-3-vibe-coding-triggered.png' });

    // Step 6: Verify code changes queued
    const queueBadge = page.locator('[data-testid="badge-queue-count"]');
    await expect(queueBadge).toContainText(/[1-9]/); // At least 1 change queued

    // Step 7: Open Universal Save panel
    await page.click('[data-testid="button-universal-save"]');
    await expect(page.locator('[data-testid="panel-universal-save"]')).toBeVisible();

    // Screenshot 4: Changes queued (RULE 3)
    await page.screenshot({ path: 'evidence/voice-e2e-4-changes-queued.png' });

    // Step 8: Commit changes
    await page.click('[data-testid="button-commit-all"]');
    await page.waitForSelector('[data-testid="toast-success"]', { timeout: 10000 });

    // Screenshot 5: Success (RULE 3)
    await page.screenshot({ path: 'evidence/voice-e2e-5-committed.png' });

    // RULE 4: Verify access controls (regular user shouldn't have this)
    // TODO: Test as regular user
  });

  test('Voice WebSocket connects successfully', async ({ page }) => {
    await page.goto('/');
    // Login
    await page.click('[data-testid="button-login"]');
    await page.fill('[data-testid="input-email"]', 'superadmin@mundotango.app');
    await page.fill('[data-testid="input-password"]', 'test123');
    await page.click('[data-testid="button-submit"]');
    await page.waitForURL('/dashboard');

    // Open Mr Blue
    await page.click('[data-testid="button-mrblue"]');
    
    // Enable voice
    await page.click('[data-testid="button-voice-mode"]');

    // Check browser console for WebSocket connection
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));

    // Wait for WebSocket connection message
    await page.waitForTimeout(3000);
    
    const hasWebSocketLog = logs.some(log => 
      log.includes('WebSocket') || log.includes('realtime') || log.includes('connected')
    );

    expect(hasWebSocketLog).toBe(true);
  });

  test('Plan mode asks clarifying questions before executing', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="button-login"]');
    await page.fill('[data-testid="input-email"]', 'superadmin@mundotango.app');
    await page.fill('[data-testid="input-password"]', 'test123');
    await page.click('[data-testid="button-submit"]');
    await page.waitForURL('/dashboard');

    // Open Mr Blue
    await page.click('[data-testid="button-mrblue"]');

    // Enable Plan mode
    await page.click('[data-testid="toggle-plan-mode"]');
    
    // Send vague request
    await page.fill('[data-testid="input-chat"]', 'Redesign the homepage');
    await page.click('[data-testid="button-send"]');

    // Wait for AI clarification question
    await page.waitForSelector('[data-testid="chat-message-assistant"]', { timeout: 30000 });
    
    const lastMessage = page.locator('[data-testid="chat-message-assistant"]').last();
    const messageText = await lastMessage.textContent();
    
    // Should contain question marks (clarifying questions)
    expect(messageText).toContain('?');
    
    // Screenshot
    await page.screenshot({ path: 'evidence/plan-mode-clarification.png' });
  });
});

/**
 * TEST SUMMARY
 * - 3 comprehensive E2E tests
 * - Total cost: ~$2
 * - Execution time: ~5-10 minutes
 * - Purpose: Validate complete voice → vibe coding workflow
 * - Evidence: 5+ screenshots for MB.MD compliance
 */
