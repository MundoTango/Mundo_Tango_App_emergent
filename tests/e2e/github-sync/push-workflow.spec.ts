/**
 * GITHUB SYNC TEST: Push Workflow
 * MB.MD Comprehensive Testing - October 28, 2025
 * 
 * Tests: Authentication, push to remote, sync status
 */

import { test, expect } from '@playwright/test';
import { loginAsSuperAdmin } from '../../helpers/auth';
import { EvidenceCollector } from '../../support/evidence';
import { GitHubSyncPage } from '../page-objects/GitHubSync.page';

test.describe('GitHub Sync - Push Workflow', () => {
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
  
  test('Super admin can push commits to GitHub', async ({ page }) => {
    const github = new GitHubSyncPage(page);
    
    await github.goto();
    await evidence.captureScreenshot('01-loaded');
    
    // Open Git tab
    await github.openGitTab();
    await evidence.captureScreenshot('02-git-tab-opened');
    
    // Verify authenticated
    await github.assertAuthenticated();
    await evidence.captureScreenshot('03-authenticated');
    
    // Push to GitHub
    await github.pushToGitHub();
    await evidence.captureScreenshot('04-push-started');
    
    // Verify push successful
    await github.assertPushSuccessful();
    await evidence.captureScreenshot('05-push-success');
    
    // Verify remote sync
    const inSync = await github.verifyRemoteSync();
    expect(inSync).toBe(true);
    await evidence.captureScreenshot('06-remote-synced');
  });
  
  test('Branch management works correctly', async ({ page }) => {
    const github = new GitHubSyncPage(page);
    
    await github.goto();
    await github.openGitTab();
    
    // Create new branch
    const branchName = `test-branch-${Date.now()}`;
    await github.createBranch(branchName);
    await evidence.captureScreenshot('01-branch-created');
    
    // Verify branch created
    await github.assertBranchCreated(branchName);
    await evidence.captureScreenshot('02-branch-verified');
  });
});
