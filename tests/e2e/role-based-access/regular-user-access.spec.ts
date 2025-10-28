/**
 * ROLE-BASED ACCESS TEST: Regular User
 * MB.MD Comprehensive Testing - October 28, 2025
 * 
 * Tests: Regular users get basic features only (no autonomous)
 */

import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { EvidenceCollector } from '../../support/evidence';
import { MrBlueVisualChatPage } from '../page-objects/MrBlueVisualChat.page';
import { enableAutonomousMode } from '../../fixtures/feature-flags';

async function loginAsRegularUser(page: Page) {
  // Regular user login (would be implemented based on your auth system)
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // For testing, assume we have a test user endpoint
  await page.evaluate(() => {
    localStorage.setItem('testUserRole', 'user');
  });
}

test.describe('Role-Based Access - Regular User', () => {
  let evidence: EvidenceCollector;
  
  test.beforeEach(async ({ page, request }) => {
    await enableAutonomousMode(request);
    await loginAsRegularUser(page);
    
    evidence = new EvidenceCollector(page, test.info(), 'regular-user');
    evidence.setFeatureFlags({ 'mbmd-autonomous': false }); // Regular user should NOT see this
  });
  
  test.afterEach(async () => {
    await evidence.setStatus(
      test.info().status === 'passed' ? 'passed' : 'failed',
      test.info().duration
    );
    await evidence.saveManifest();
  });
  
  test('Regular user does NOT see autonomous mode badge', async ({ page }) => {
    const chat = new MrBlueVisualChatPage(page);
    
    await chat.goto();
    await evidence.captureScreenshot('01-loaded');
    
    await chat.openAITab();
    await evidence.captureScreenshot('02-ai-tab-opened');
    
    // Verify autonomous mode badge NOT visible
    await expect(chat.badgeAutonomousMode).not.toBeVisible();
    await evidence.captureScreenshot('03-no-autonomous-badge');
  });
  
  test('Regular user gets basic chat features only', async ({ page }) => {
    const chat = new MrBlueVisualChatPage(page);
    
    await chat.goto();
    await chat.openAITab();
    
    // Can still send messages (basic feature)
    await chat.sendMessage('Help me with something');
    await evidence.captureScreenshot('01-message-sent');
    
    // But autonomous execution should NOT start
    const autonomousIndicator = page.locator('[data-testid="autonomous-executing"]');
    await expect(autonomousIndicator).not.toBeVisible();
    await evidence.captureScreenshot('02-no-autonomous-execution');
  });
});
