/**
 * PAGE OBJECT: Universal Save System
 * MB.MD Comprehensive Testing - October 28, 2025
 * 
 * Tests: Change collection, git commits, no data loss
 */

import { Page, Locator, expect } from '@playwright/test';

export class UniversalSavePage {
  readonly page: Page;
  
  // Save button and badge
  readonly saveButton: Locator;
  readonly saveBadge: Locator;
  readonly changeCount: Locator;
  
  // Save confirmation
  readonly saveModal: Locator;
  readonly commitMessage: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;
  
  // Save status
  readonly saveSpinner: Locator;
  readonly saveSuccess: Locator;
  readonly saveError: Locator;
  
  // Change queue
  readonly changeQueue: Locator;
  readonly queuedChanges: Locator;
  
  constructor(page: Page) {
    this.page = page;
    
    this.saveButton = page.locator('[data-testid="button-save"]');
    this.saveBadge = page.locator('[data-testid="save-badge"]');
    this.changeCount = page.locator('[data-testid="change-count"]');
    
    this.saveModal = page.locator('[data-testid="save-modal"]');
    this.commitMessage = page.locator('[data-testid="commit-message"]');
    this.confirmButton = page.locator('[data-testid="button-confirm-save"]');
    this.cancelButton = page.locator('[data-testid="button-cancel-save"]');
    
    this.saveSpinner = page.locator('[data-testid="save-spinner"]');
    this.saveSuccess = page.locator('[data-testid="save-success"]');
    this.saveError = page.locator('[data-testid="save-error"]');
    
    this.changeQueue = page.locator('[data-testid="change-queue"]');
    this.queuedChanges = page.locator('[data-testid^="queued-change-"]');
  }
  
  async goto() {
    await this.page.goto('/?edit=true');
    await this.page.waitForLoadState('networkidle');
  }
  
  async assertBadgeCount(expectedCount: number) {
    await expect(this.saveBadge).toBeVisible();
    await expect(this.changeCount).toHaveText(expectedCount.toString());
  }
  
  async clickSave() {
    await this.saveButton.click();
  }
  
  async assertSaveModalOpened() {
    await expect(this.saveModal).toBeVisible();
  }
  
  async assertCommitMessageGenerated() {
    const message = await this.commitMessage.textContent();
    expect(message).toBeTruthy();
    expect(message!.length).toBeGreaterThan(10); // AI-generated should be descriptive
  }
  
  async confirmSave() {
    await this.confirmButton.click();
    await expect(this.saveSpinner).toBeVisible();
  }
  
  async assertSaveSuccessful() {
    await expect(this.saveSuccess).toBeVisible({ timeout: 15000 });
    await expect(this.saveBadge).not.toBeVisible(); // Badge should disappear
  }
  
  async getQueuedChanges(): Promise<string[]> {
    const changes = await this.queuedChanges.all();
    const changeTexts = await Promise.all(changes.map(c => c.textContent()));
    return changeTexts.filter((text): text is string => text !== null);
  }
  
  async assertNoDataLoss() {
    // Verify all changes are still in queue if save was cancelled
    const initialChanges = await this.getQueuedChanges();
    
    await this.clickSave();
    await this.cancelButton.click();
    
    const afterCancelChanges = await this.getQueuedChanges();
    expect(afterCancelChanges).toEqual(initialChanges);
  }
  
  async verifyGitCommitCreated(): Promise<string> {
    const response = await this.page.request.get('/api/git/commits/latest');
    const commit = await response.json();
    
    expect(commit.message).toBeTruthy();
    expect(commit.author).toContain('Agent #126'); // Git Operations Specialist
    
    return commit.sha;
  }
}
