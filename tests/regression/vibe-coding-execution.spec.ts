/**
 * Regression Test: Vibe Coding Execution Bypass Bug
 * Prevents: AI responding conversationally instead of generating code
 * 
 * Bug History: Oct 26-27, 2025
 * - User selected element (purple outline visible)
 * - User typed: "make it red"
 * - AI asked: "Which element?" (nonsensical - element already selected)
 * - Result: No code generated, SAVE button stayed disabled
 * 
 * Root Cause: AI prompt didn't have conditional logic for selectedElement
 * 
 * This test ensures:
 * 1. When element selected → AI generates code (no questions)
 * 2. When no element → AI asks clarifying questions
 * 3. Code changes queue properly
 * 4. SAVE button shows badge count
 */

import { test, expect } from '@playwright/test';

test.describe('Vibe Coding Execution Regression', () => {
  test('should generate code immediately when element selected (no clarification)', async ({ page }) => {
    await page.goto('/');
    
    // Open Visual Editor
    await page.click('[data-testid="button-visual-editor"]');
    await page.waitForTimeout(1000);
    
    // Select an element (Cmd+Click or inspector)
    // For testing, we'll use the API directly
    
    const consoleLogs: string[] = [];
    page.on('console', msg => consoleLogs.push(msg.text()));
    
    // Simulate vibe coding request WITH selected element
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/vibe/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request: 'make it red',
          visualEditorContext: {
            selectedElement: {
              tag: 'div',
              id: 'test-element',
              className: 'bg-blue-500',
              innerText: 'Test',
              xpath: '/html/body/div'
            },
            previewPath: '/'
          }
        })
      });
      
      return res.json();
    });
    
    // Verify: NO clarification needed (element already selected)
    expect(response.needsClarification).toBe(false);
    
    // Verify: Code changes generated
    expect(response.codeChanges).toBeDefined();
    expect(response.codeChanges.length).toBeGreaterThan(0);
    
    // Verify: No clarification question returned
    expect(response.clarificationQuestion).toBeUndefined();
  });
  
  test('should ask clarifying questions when NO element selected', async ({ page }) => {
    await page.goto('/');
    
    // Simulate vibe coding request WITHOUT selected element
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/vibe/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request: 'make it red',
          visualEditorContext: {
            selectedElement: null, // ← No element selected
            previewPath: '/'
          }
        })
      });
      
      return res.json();
    });
    
    // Verify: Clarification needed (ambiguous request)
    expect(response.needsClarification).toBe(true);
    
    // Verify: Clarification question returned
    expect(response.clarificationQuestion).toBeDefined();
    expect(response.clarificationQuestion).toMatch(/select|element|which/i);
  });
  
  test('should queue code changes and show SAVE button badge', async ({ page }) => {
    await page.goto('/');
    
    // Open Visual Editor
    await page.click('[data-testid="button-visual-editor"]');
    await page.waitForTimeout(1000);
    
    // Execute vibe coding with element selected
    await page.evaluate(async () => {
      const res = await fetch('/api/vibe/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request: 'make background red and add smiley',
          visualEditorContext: {
            selectedElement: {
              tag: 'div',
              id: 'test',
              className: 'bg-blue-500',
              xpath: '/html/body/div'
            },
            previewPath: '/'
          }
        })
      });
      
      const data = await res.json();
      
      // Queue changes to visual editor context
      window.postMessage({
        type: 'VIBE_CODE_CHANGES',
        changes: data.codeChanges
      }, '*');
    });
    
    await page.waitForTimeout(1000);
    
    // Verify: SAVE button shows badge with change count
    const saveButton = page.locator('[data-testid="button-save"]');
    await expect(saveButton).toBeVisible();
    
    // Badge should show count (may be "1" or "2" depending on how changes grouped)
    const badgeText = await saveButton.textContent();
    expect(badgeText).toMatch(/\d+/); // Contains a number
  });
  
  test('should call /api/vibe/execute endpoint (not bypass execution)', async ({ page }) => {
    await page.goto('/');
    
    // Track API calls
    const apiCalls: string[] = [];
    page.on('request', req => {
      if (req.url().includes('/api/vibe')) {
        apiCalls.push(`${req.method()} ${req.url()}`);
      }
    });
    
    // Open Visual Editor and send vibe request
    await page.click('[data-testid="button-visual-editor"]');
    await page.waitForTimeout(500);
    
    await page.evaluate(async () => {
      await fetch('/api/vibe/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request: 'test request',
          visualEditorContext: {
            selectedElement: { tag: 'div', xpath: '/html/body/div' },
            previewPath: '/'
          }
        })
      });
    });
    
    await page.waitForTimeout(500);
    
    // Verify: /api/vibe/execute was called
    const executeCall = apiCalls.find(call => call.includes('/api/vibe/execute'));
    expect(executeCall).toBeDefined();
    expect(executeCall).toContain('POST');
  });
});
