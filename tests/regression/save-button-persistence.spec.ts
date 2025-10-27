/**
 * Regression Test: SAVE Button File Persistence Bug
 * Prevents: Stub endpoints returning success without writing files
 * 
 * Bug History: Oct 26-27, 2025
 * - Frontend: SAVE button exists and clickable ✅
 * - Backend: /api/visual-editor/save returns 200 OK ✅
 * - Actual work: NONE ❌
 * - Result: User clicks SAVE → Git commits fail with "nothing to commit"
 * 
 * Root Cause: Stub endpoint `res.json({ success: true })` without file I/O
 * 
 * This test ensures:
 * 1. SAVE button actually writes files to disk
 * 2. Git sees modified files (not "nothing to commit")
 * 3. No stub endpoints (server validates changes)
 * 4. Stale client payloads rejected (security fix)
 */

import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

test.describe('SAVE Button File Persistence Regression', () => {
  test('should write files to disk (not stub endpoint)', async ({ page }) => {
    // Reset git state
    try {
      execSync('git reset --hard HEAD', { cwd: process.cwd() });
    } catch (e) {
      // Ignore errors
    }
    
    await page.goto('/');
    
    // Simulate SAVE button click with real changes
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/visual-editor/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changes: [
            {
              changeType: 'style',
              filePath: 'client/src/pages/landing.tsx',
              oldValue: 'bg-gradient-to-br',
              newValue: 'bg-gradient-to-tr'
            }
          ],
          page: '/',
          savedAt: new Date().toISOString()
        })
      });
      
      return {
        status: res.status,
        data: await res.json()
      };
    });
    
    // Verify: API returns success
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    
    await page.waitForTimeout(1000);
    
    // Verify: Git sees modified files (CRITICAL - this was failing with stub)
    const gitStatus = execSync('git status --porcelain', { 
      cwd: process.cwd(),
      encoding: 'utf-8'
    });
    
    // Should see modified file (not empty)
    expect(gitStatus.trim()).not.toBe('');
    expect(gitStatus).toContain('landing.tsx');
    
    // Verify: Git diff shows actual changes
    const gitDiff = execSync('git diff client/src/pages/landing.tsx', {
      cwd: process.cwd(),
      encoding: 'utf-8'
    });
    
    expect(gitDiff).toContain('bg-gradient-to-tr');
    expect(gitDiff).toContain('-bg-gradient-to-br');
  });
  
  test('should reject stale client payloads (security fix)', async ({ page }) => {
    await page.goto('/');
    
    // Try to save a change with outdated oldValue (doesn't exist in file)
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/visual-editor/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changes: [
            {
              changeType: 'style',
              filePath: 'client/src/pages/landing.tsx',
              oldValue: 'THIS_TEXT_DOES_NOT_EXIST_IN_FILE', // ← Stale/malicious payload
              newValue: 'bg-red-500'
            }
          ],
          page: '/',
          savedAt: new Date().toISOString()
        })
      });
      
      return {
        status: res.status,
        data: await res.json()
      };
    });
    
    // Verify: Server rejects stale change
    expect(response.data.success).toBe(false);
    expect(response.data.results[0].success).toBe(false);
    expect(response.data.results[0].error).toMatch(/stale change|not found/i);
    
    // Verify: File NOT modified (security validation worked)
    const gitStatus = execSync('git status --porcelain', { 
      cwd: process.cwd(),
      encoding: 'utf-8'
    });
    
    // Should be empty (no changes applied)
    expect(gitStatus).not.toContain('landing.tsx');
  });
  
  test('should apply multiple changes and stage all files', async ({ page }) => {
    // Reset git
    try {
      execSync('git reset --hard HEAD && git clean -fd', { cwd: process.cwd() });
    } catch (e) {}
    
    await page.goto('/');
    
    // Apply multiple changes at once
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/visual-editor/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changes: [
            {
              changeType: 'style',
              filePath: 'client/src/pages/landing.tsx',
              oldValue: 'bg-gradient-to-br',
              newValue: 'bg-gradient-to-tr'
            },
            {
              changeType: 'content',
              filePath: 'client/src/pages/landing.tsx',
              oldText: 'Welcome Back!',
              newText: 'Welcome Back!!!'
            }
          ],
          page: '/',
          savedAt: new Date().toISOString()
        })
      });
      
      return {
        status: res.status,
        data: await res.json()
      };
    });
    
    await page.waitForTimeout(1000);
    
    // Verify: All changes applied
    expect(response.data.success).toBe(true);
    expect(response.data.results.filter((r: any) => r.success).length).toBe(2);
    
    // Verify: Files staged for commit
    const gitStatus = execSync('git status --porcelain', {
      cwd: process.cwd(),
      encoding: 'utf-8'
    });
    
    // Should see staged files (starts with 'M ' or 'A ')
    expect(gitStatus).toMatch(/[MA]\s+client\/src\/pages\/landing\.tsx/);
  });
  
  test('should allow Git commit after SAVE (no "nothing to commit" error)', async ({ page }) => {
    // Reset git
    try {
      execSync('git reset --hard HEAD', { cwd: process.cwd() });
    } catch (e) {}
    
    await page.goto('/');
    
    // Save changes
    await page.evaluate(async () => {
      await fetch('/api/visual-editor/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changes: [{
            changeType: 'style',
            filePath: 'client/src/pages/landing.tsx',
            oldValue: 'bg-gradient-to-br',
            newValue: 'bg-gradient-to-tr'
          }],
          page: '/',
          savedAt: new Date().toISOString()
        })
      });
    });
    
    await page.waitForTimeout(1000);
    
    // Try to commit
    let commitOutput = '';
    let commitError = false;
    
    try {
      commitOutput = execSync('git commit -m "Test SAVE button changes"', {
        cwd: process.cwd(),
        encoding: 'utf-8'
      });
    } catch (error: any) {
      commitError = true;
      commitOutput = error.message;
    }
    
    // Verify: Commit succeeds (NOT "nothing to commit")
    expect(commitError).toBe(false);
    expect(commitOutput).not.toMatch(/nothing to commit/i);
    expect(commitOutput).toMatch(/1 file changed/i);
  });
});
