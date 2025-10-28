/**
 * ROLE-BASED ACCESS TEST: Super Admin
 * MB.MD Comprehensive Testing - October 28, 2025
 * 
 * Tests: Super admin gets full autonomous mode
 */

import { test, expect } from '@playwright/test';
import { loginAsSuperAdmin } from '../../helpers/auth';
import { EvidenceCollector } from '../../support/evidence';
import { MrBlueVisualChatPage } from '../page-objects/MrBlueVisualChat.page';
import { enableAutonomousMode } from '../../fixtures/feature-flags';

test.describe('Role-Based Access - Super Admin', () => {
  let evidence: EvidenceCollector;
  
  test.beforeEach(async ({ page, request }) => {
    await enableAutonomousMode(request);
    await loginAsSuperAdmin(page);
    
    evidence = new EvidenceCollector(page, test.info(), 'super-admin');
    evidence.setFeatureFlags({ 'mbmd-autonomous': true });
  });
  
  test.afterEach(async () => {
    await evidence.setStatus(
      test.info().status === 'passed' ? 'passed' : 'failed',
      test.info().duration
    );
    await evidence.saveManifest();
  });
  
  test('Super admin sees autonomous mode badge', async ({ page }) => {
    const chat = new MrBlueVisualChatPage(page);
    
    await chat.goto();
    await evidence.captureScreenshot('01-loaded');
    
    await chat.openAITab();
    await evidence.captureScreenshot('02-ai-tab-opened');
    
    // Verify autonomous mode badge visible
    await expect(chat.badgeAutonomousMode).toBeVisible();
    await evidence.captureScreenshot('03-autonomous-badge-visible');
    
    // Verify initial state shows autonomous mode
    await chat.assertInitialState();
    await evidence.captureScreenshot('04-autonomous-mode-active');
  });
  
  test('Super admin can trigger 200-minute autonomous sessions', async ({ page, request }) => {
    const chat = new MrBlueVisualChatPage(page);
    
    await chat.goto();
    await chat.openAITab();
    
    // Send autonomous request
    await chat.sendMessage('Build a complete landing page');
    await evidence.captureScreenshot('01-autonomous-request');
    
    // Verify autonomous execution started
    await chat.assertAutonomousExecutionStarted();
    await evidence.captureScreenshot('02-autonomous-started');
    
    // Verify progress sidebar visible
    await chat.assertProgressSidebarVisible();
    await evidence.captureScreenshot('03-progress-sidebar');
  });
});
