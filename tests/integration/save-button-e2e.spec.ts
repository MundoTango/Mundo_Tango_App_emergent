/**
 * Integration Test: SAVE Button End-to-End Flow
 * Tests: UI Change → API Call → File Written → Git Commit
 */

import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.describe('SAVE Button End-to-End', () => {
  test.beforeEach(() => {
    // Reset git state before each test
    try {
      execSync('git reset --hard HEAD && git clean -fd', { cwd: process.cwd() });
    } catch (e) {
      // Ignore errors
    }
  });
  
  test('complete flow: queue change → click SAVE → file written → git commit succeeds', async ({ page }) => {
    await page.goto('/');
    
    // Step 1: Queue a change via visual editor
    await page.evaluate(async () => {
      // Simulate queuing a style change
      window.postMessage({
        type: 'QUEUE_CHANGE',
        change: {
          changeType: 'style',
          filePath: 'client/src/pages/landing.tsx',
          oldValue: 'bg-gradient-to-br',
          newValue: 'bg-gradient-to-tr',
          timestamp: Date.now()
        }
      }, '*');
    });
    
    await page.waitForTimeout(500);
    
    // Step 2: Click SAVE button
    await page.click('[data-testid="button-save"]');
    await page.waitForTimeout(2000);
    
    // Step 3: Verify file written to disk
    const gitStatus = execSync('git status --porcelain', {
      cwd: process.cwd(),
      encoding: 'utf-8'
    });
    
    expect(gitStatus).toContain('landing.tsx');
    
    // Step 4: Verify Git diff shows actual changes
    const gitDiff = execSync('git diff client/src/pages/landing.tsx', {
      cwd: process.cwd(),
      encoding: 'utf-8'
    });
    
    expect(gitDiff).toContain('bg-gradient-to-tr');
    
    // Step 5: Git commit succeeds
    const commitOutput = execSync('git commit -m "Test SAVE changes"', {
      cwd: process.cwd(),
      encoding: 'utf-8'
    });
    
    expect(commitOutput).toMatch(/1 file changed/i);
  });
  
  test('SAVE button shows badge count when changes queued', async ({ page }) => {
    await page.goto('/');
    
    // Queue multiple changes
    await page.evaluate(async () => {
      window.postMessage({
        type: 'QUEUE_CHANGE',
        change: { changeType: 'style', filePath: 'test.tsx', oldValue: 'a', newValue: 'b' }
      }, '*');
      
      window.postMessage({
        type: 'QUEUE_CHANGE',
        change: { changeType: 'content', filePath: 'test.tsx', oldText: 'x', newText: 'y' }
      }, '*');
    });
    
    await page.waitForTimeout(500);
    
    // Verify: SAVE button shows badge "2"
    const saveButton = page.locator('[data-testid="button-save"]');
    const badgeText = await saveButton.textContent();
    
    expect(badgeText).toContain('2');
  });
  
  test('SAVE button clears badge after successful save', async ({ page }) => {
    await page.goto('/');
    
    // Queue change
    await page.evaluate(async () => {
      window.postMessage({
        type: 'QUEUE_CHANGE',
        change: {
          changeType: 'style',
          filePath: 'client/src/pages/landing.tsx',
          oldValue: 'bg-gradient-to-br',
          newValue: 'bg-gradient-to-tr'
        }
      }, '*');
    });
    
    await page.waitForTimeout(500);
    
    // Verify: Badge shows count
    let badgeText = await page.locator('[data-testid="button-save"]').textContent();
    expect(badgeText).toMatch(/\d+/);
    
    // Click SAVE
    await page.click('[data-testid="button-save"]');
    await page.waitForTimeout(2000);
    
    // Verify: Badge cleared or button disabled
    const saveButtonAfter = page.locator('[data-testid="button-save"]');
    const isDisabled = await saveButtonAfter.isDisabled();
    
    expect(isDisabled).toBe(true); // No changes to save
  });
});
