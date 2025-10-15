/**
 * VISUAL EDITOR FUNCTIONAL TESTS
 * MB.MD Track B - Testing Infrastructure
 * Agent #78: Functional Testing
 * 
 * Tests FUNCTIONALITY, not just UI existence
 * 8 comprehensive journey validations
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Editor - Functional Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as super admin
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', 'admin@lifeceo.com');
    await page.fill('[data-testid="input-password"]', 'admin123');
    await page.click('[data-testid="button-login"]');
    await page.waitForURL('/memories');
  });

  /**
   * TEST 1: Click-to-select works
   * Journey: User activates visual editor and selects element
   */
  test('should activate visual editor and select component', async ({ page }) => {
    // Navigate to any page with ?edit=true
    await page.goto('/memories?edit=true');
    
    // Wait for visual editor overlay
    await expect(page.locator('[data-testid="visual-editor-overlay"]')).toBeVisible();
    
    // Click any element with data-testid
    const targetElement = page.locator('[data-testid="button-create-memory"]').first();
    await targetElement.click();
    
    // Verify element is selected (edit controls appear)
    await expect(page.locator('[data-testid="edit-controls-panel"]')).toBeVisible();
    
    // Verify component info displayed
    const selectedInfo = page.locator('[data-testid="selected-component-info"]');
    await expect(selectedInfo).toContainText('button-create-memory');
  });

  /**
   * TEST 2: AI generates correct code
   * Journey: User makes visual change → AI converts to code
   */
  test('should generate code from visual changes', async ({ page }) => {
    await page.goto('/memories?edit=true');
    
    // Select element
    await page.locator('[data-testid="text-page-title"]').first().click();
    
    // Make text change
    await page.click('[data-testid="tab-text"]');
    await page.fill('[data-testid="input-text-content"]', 'New Title Text');
    
    // Click generate code
    await page.click('[data-testid="button-generate-code"]');
    
    // Wait for AI response
    await expect(page.locator('[data-testid="code-preview"]')).toBeVisible({ timeout: 10000 });
    
    // Verify code contains the change
    const codeContent = await page.locator('[data-testid="code-preview"]').textContent();
    expect(codeContent).toContain('New Title Text');
    
    // Verify diff shown
    await expect(page.locator('[data-testid="code-diff"]')).toBeVisible();
  });

  /**
   * TEST 3: Preview deploys successfully
   * Journey: User generates code → deploys to preview
   */
  test('should deploy to preview environment', async ({ page }) => {
    await page.goto('/memories?edit=true');
    
    // Make a simple change and generate code (shortened flow)
    await page.locator('[data-testid="button-create-memory"]').first().click();
    await page.click('[data-testid="tab-style"]');
    await page.fill('[data-testid="input-background-color"]', '#ff0000');
    await page.click('[data-testid="button-generate-code"]');
    
    await page.waitForSelector('[data-testid="code-preview"]', { timeout: 10000 });
    
    // Click preview deploy
    await page.click('[data-testid="button-deploy-preview"]');
    
    // Wait for deployment
    await expect(page.locator('[data-testid="preview-url"]')).toBeVisible({ timeout: 30000 });
    
    // Verify preview URL generated
    const previewUrl = await page.locator('[data-testid="preview-url"]').textContent();
    expect(previewUrl).toMatch(/preview-.*\.replit\.app/);
    
    // Verify expiration shown
    await expect(page.locator('[data-testid="preview-expires"]')).toBeVisible();
  });

  /**
   * TEST 4: Production merge completes
   * Journey: Preview tested → merge to production
   */
  test('should create production PR', async ({ page }) => {
    await page.goto('/memories?edit=true');
    
    // Complete flow: select → edit → generate → preview
    await page.locator('[data-testid="text-page-title"]').first().click();
    await page.click('[data-testid="tab-text"]');
    await page.fill('[data-testid="input-text-content"]', 'Production Change');
    await page.click('[data-testid="button-generate-code"]');
    await page.waitForSelector('[data-testid="code-preview"]', { timeout: 10000 });
    
    // Click production deploy
    await page.click('[data-testid="button-deploy-production"]');
    
    // Verify confirmation modal
    await expect(page.locator('[data-testid="confirm-production-deploy"]')).toBeVisible();
    await page.click('[data-testid="button-confirm-deploy"]');
    
    // Wait for PR creation
    await expect(page.locator('[data-testid="pr-status"]')).toBeVisible({ timeout: 30000 });
    
    // Verify PR link or manual merge message
    const prStatus = await page.locator('[data-testid="pr-status"]').textContent();
    expect(prStatus).toMatch(/PR created|manual merge required/i);
  });

  /**
   * TEST 5: Drag-drop repositioning
   * Journey: User drags element to new position
   */
  test('should reposition element via drag & drop', async ({ page }) => {
    await page.goto('/memories?edit=true');
    
    // Select element
    const element = page.locator('[data-testid="button-create-memory"]').first();
    await element.click();
    
    // Get original position
    const originalBox = await element.boundingBox();
    expect(originalBox).toBeTruthy();
    
    // Drag element (simulate drag & drop)
    await element.hover();
    await page.mouse.down();
    await page.mouse.move(originalBox!.x + 100, originalBox!.y + 50);
    await page.mouse.up();
    
    // Verify position changed
    await expect(page.locator('[data-testid="drag-drop-overlay"]')).toBeHidden();
    
    // Check edit controls reflect new position
    const xInput = page.locator('[data-testid="input-position-x"]');
    const newX = await xInput.inputValue();
    expect(parseInt(newX)).toBeGreaterThan(originalBox!.x);
  });

  /**
   * TEST 6: Multi-page editing
   * Journey: Edit multiple pages in same session
   */
  test('should edit multiple pages without losing state', async ({ page }) => {
    // Edit page 1
    await page.goto('/memories?edit=true');
    await page.locator('[data-testid="text-page-title"]').first().click();
    await page.fill('[data-testid="input-text-content"]', 'Memories Title');
    await page.click('[data-testid="button-save-draft"]');
    
    // Navigate to page 2
    await page.goto('/groups?edit=true');
    await page.locator('[data-testid="text-page-title"]').first().click();
    await page.fill('[data-testid="input-text-content"]', 'Groups Title');
    await page.click('[data-testid="button-save-draft"]');
    
    // Verify both drafts saved
    await page.click('[data-testid="button-view-drafts"]');
    await expect(page.locator('[data-testid="draft-memories"]')).toBeVisible();
    await expect(page.locator('[data-testid="draft-groups"]')).toBeVisible();
  });

  /**
   * TEST 7: Undo/Redo functionality
   * Journey: Make changes → undo → redo
   */
  test('should undo and redo changes', async ({ page }) => {
    await page.goto('/memories?edit=true');
    
    // Make first change
    await page.locator('[data-testid="button-create-memory"]').first().click();
    await page.click('[data-testid="tab-style"]');
    await page.fill('[data-testid="input-background-color"]', '#ff0000');
    await page.click('[data-testid="button-apply-change"]');
    
    // Make second change
    await page.fill('[data-testid="input-background-color"]', '#00ff00');
    await page.click('[data-testid="button-apply-change"]');
    
    // Undo last change
    await page.click('[data-testid="button-undo"]');
    const bgAfterUndo = await page.locator('[data-testid="input-background-color"]').inputValue();
    expect(bgAfterUndo).toBe('#ff0000');
    
    // Redo change
    await page.click('[data-testid="button-redo"]');
    const bgAfterRedo = await page.locator('[data-testid="input-background-color"]').inputValue();
    expect(bgAfterRedo).toBe('#00ff00');
  });

  /**
   * TEST 8: Learning system integration
   * Journey: Visual Editor learns from user patterns
   */
  test('should track changes in learning system', async ({ page }) => {
    await page.goto('/memories?edit=true');
    
    // Make several similar changes
    for (let i = 0; i < 3; i++) {
      await page.locator(`[data-testid="button-create-memory"]`).first().click();
      await page.click('[data-testid="tab-style"]');
      await page.fill('[data-testid="input-padding"]', '16');
      await page.click('[data-testid="button-apply-change"]');
      await page.click('[data-testid="button-deselect"]');
    }
    
    // Open learning insights
    await page.click('[data-testid="button-ai-insights"]');
    
    // Verify pattern detected
    await expect(page.locator('[data-testid="pattern-detected"]')).toBeVisible();
    await expect(page.locator('[data-testid="pattern-suggestion"]')).toContainText(/padding.*16/i);
    
    // Verify auto-suggest enabled
    const autoSuggest = page.locator('[data-testid="auto-suggest-padding"]');
    await expect(autoSuggest).toBeVisible();
  });
});
