/**
 * PAGE OBJECT: GitHub Sync
 * MB.MD Comprehensive Testing - October 28, 2025
 * 
 * Tests: GitHub authentication, push workflow, branch management
 */

import { Page, Locator, expect } from '@playwright/test';

export class GitHubSyncPage {
  readonly page: Page;
  
  // Git tab
  readonly gitTab: Locator;
  readonly gitPanel: Locator;
  
  // Authentication
  readonly connectGitHubButton: Locator;
  readonly githubStatus: Locator;
  readonly authenticatedIndicator: Locator;
  
  // Repository info
  readonly repoName: Locator;
  readonly currentBranch: Locator;
  readonly commitHistory: Locator;
  
  // Push workflow
  readonly pushButton: Locator;
  readonly pushStatus: Locator;
  readonly pushSuccess: Locator;
  readonly pushError: Locator;
  
  // Branch management
  readonly branchSelector: Locator;
  readonly createBranchButton: Locator;
  readonly branchInput: Locator;
  
  constructor(page: Page) {
    this.page = page;
    
    this.gitTab = page.getByRole('tab', { name: /Git/i });
    this.gitPanel = page.locator('[data-testid="git-panel"]');
    
    this.connectGitHubButton = page.locator('[data-testid="button-connect-github"]');
    this.githubStatus = page.locator('[data-testid="github-status"]');
    this.authenticatedIndicator = page.locator('[data-testid="github-authenticated"]');
    
    this.repoName = page.locator('[data-testid="repo-name"]');
    this.currentBranch = page.locator('[data-testid="current-branch"]');
    this.commitHistory = page.locator('[data-testid="commit-history"]');
    
    this.pushButton = page.locator('[data-testid="button-push-github"]');
    this.pushStatus = page.locator('[data-testid="push-status"]');
    this.pushSuccess = page.locator('[data-testid="push-success"]');
    this.pushError = page.locator('[data-testid="push-error"]');
    
    this.branchSelector = page.locator('[data-testid="branch-selector"]');
    this.createBranchButton = page.locator('[data-testid="button-create-branch"]');
    this.branchInput = page.locator('[data-testid="input-branch-name"]');
  }
  
  async goto() {
    await this.page.goto('/?edit=true');
    await this.page.waitForLoadState('networkidle');
  }
  
  async openGitTab() {
    await this.gitTab.click();
    await expect(this.gitPanel).toBeVisible();
  }
  
  async assertAuthenticated() {
    await expect(this.authenticatedIndicator).toBeVisible();
    await expect(this.githubStatus).toContainText('Connected');
  }
  
  async pushToGitHub() {
    await this.pushButton.click();
    await expect(this.pushStatus).toContainText('Pushing');
  }
  
  async assertPushSuccessful() {
    await expect(this.pushSuccess).toBeVisible({ timeout: 30000 });
  }
  
  async createBranch(branchName: string) {
    await this.createBranchButton.click();
    await this.branchInput.fill(branchName);
    await this.branchInput.press('Enter');
  }
  
  async assertBranchCreated(branchName: string) {
    await expect(this.currentBranch).toContainText(branchName);
  }
  
  async verifyRemoteSync(): Promise<boolean> {
    const response = await this.page.request.get('/api/git/remote/status');
    const status = await response.json();
    
    return status.inSync === true;
  }
}
