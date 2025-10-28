/**
 * UNIVERSAL SAVE TEST: Git Commit
 * MB.MD Comprehensive Testing - October 28, 2025
 * 
 * Tests: AI-powered commit messages (Agent #126), confirmation, no data loss
 */

import { test, expect } from '@playwright/test';
import { loginAsSuperAdmin } from '../../helpers/auth';
import { EvidenceCollector } from '../../support/evidence';
import { UniversalSavePage } from '../page-objects/UniversalSave.page';
import { MrBlueVisualChatPage } from '../page-objects/MrBlueVisualChat.page';

test.describe('Universal Save - Git Commit', () => {
  let evidence: EvidenceCollector;
  
  test.beforeEach(async ({ page }) => {
    await loginAsSuperAdmin(page);
    evidence = new EvidenceCollector(page, test.info(), 'super-admin');
  });
  
  test.afterEach(async () => {
    await evidence.setStatus(
      test.info().status === 'passed' ? 'passed' : 'failed',
      test.info().duration
    );
    await evidence.saveManifest();
  });
  
  test('Save button creates AI-powered git commit', async ({ page }) => {
    const save = new UniversalSavePage(page);
    const chat = new MrBlueVisualChatPage(page);
    
    await save.goto();
    await evidence.captureScreenshot('01-loaded');
    
    // Make a change via Mr Blue
    await chat.openAITab();
    await chat.sendMessage('Make button bigger');
    await chat.waitForResponse();
    await evidence.captureScreenshot('02-change-made');
    
    // Verify badge shows queued change
    await save.assertBadgeCount(1);
    await evidence.captureScreenshot('03-badge-shows-change');
    
    // Click save
    await save.clickSave();
    await evidence.captureScreenshot('04-save-clicked');
    
    // Verify modal opened with AI-generated commit message
    await save.assertSaveModalOpened();
    await save.assertCommitMessageGenerated();
    await evidence.captureScreenshot('05-commit-message-generated');
    
    // Confirm save
    await save.confirmSave();
    await evidence.captureScreenshot('06-saving');
    
    // Verify successful
    await save.assertSaveSuccessful();
    await evidence.captureScreenshot('07-save-success');
    
    // Verify git commit created
    const commitSha = await save.verifyGitCommitCreated();
    expect(commitSha).toBeTruthy();
    await evidence.captureScreenshot('08-git-commit-verified');
  });
  
  test('Cancel save preserves all queued changes (no data loss)', async ({ page }) => {
    const save = new UniversalSavePage(page);
    const chat = new MrBlueVisualChatPage(page);
    
    await save.goto();
    
    // Make multiple changes
    await chat.openAITab();
    await chat.sendMessage('Change 1');
    await chat.waitForResponse();
    await chat.sendMessage('Change 2');
    await chat.waitForResponse();
    
    await evidence.captureScreenshot('01-multiple-changes');
    
    // Verify no data loss on cancel
    await save.assertNoDataLoss();
    await evidence.captureScreenshot('02-no-data-loss');
  });
});
