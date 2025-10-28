/**
 * MR BLUE CHAT TEST: Vibe Coding
 * MB.MD Comprehensive Testing - October 28, 2025
 * 
 * Tests: Conversational UI changes, auto-queueing, no Apply buttons
 */

import { test, expect } from '@playwright/test';
import { loginAsSuperAdmin } from '../../helpers/auth';
import { EvidenceCollector } from '../../support/evidence';
import { MrBlueVisualChatPage } from '../page-objects/MrBlueVisualChat.page';
import { UniversalSavePage } from '../page-objects/UniversalSave.page';
import { enableAutonomousMode } from '../../fixtures/feature-flags';

test.describe('Mr Blue Chat - Vibe Coding', () => {
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
  
  test('Vibe coding auto-queues changes without Apply button', async ({ page }) => {
    const chat = new MrBlueVisualChatPage(page);
    const save = new UniversalSavePage(page);
    
    // Open Visual Editor
    await chat.goto();
    await evidence.captureScreenshot('01-visual-editor');
    
    // Open AI tab
    await chat.openAITab();
    await evidence.captureScreenshot('02-ai-tab-opened');
    
    // Send vibe coding request
    await chat.sendMessage('Make the main heading bigger and bold');
    await evidence.captureScreenshot('03-message-sent');
    
    // Wait for AI response
    await chat.waitForResponse();
    await evidence.captureScreenshot('04-ai-response-received');
    
    // Verify changes are auto-queued (no Apply button needed)
    await save.assertBadgeCount(1);
    await evidence.captureScreenshot('05-changes-auto-queued');
    
    // Verify no Apply button exists (vibe coding UX pattern)
    const applyButton = page.locator('[data-testid="button-apply"], text=Apply');
    await expect(applyButton).not.toBeVisible();
    await evidence.captureScreenshot('06-no-apply-button');
    
    // No errors
    expect(evidence.hasErrors()).toBe(false);
  });
  
  test('AI asks clarifying questions when request is ambiguous', async ({ page }) => {
    const chat = new MrBlueVisualChatPage(page);
    
    await chat.goto();
    await chat.openAITab();
    
    // Send ambiguous request
    await chat.sendMessage('Change the color');
    await evidence.captureScreenshot('01-ambiguous-request');
    
    // Wait for response
    await chat.waitForResponse();
    await evidence.captureScreenshot('02-ai-response');
    
    // Verify AI asks for clarification
    await chat.assertMessageReceived('Which color would you like to change?');
    await evidence.captureScreenshot('03-clarifying-question');
  });
});
