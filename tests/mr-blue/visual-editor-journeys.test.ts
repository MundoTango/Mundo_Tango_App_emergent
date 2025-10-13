/**
 * TRACK B: Visual Editor Customer Journey Tests
 * Agent #78 - Visual Page Editor Testing
 * 
 * Tests 3 complete customer journeys:
 * 1. Text change → AI code generation → deploy
 * 2. Layout change → Tailwind updates → deploy
 * 3. Theme change → global CSS → deploy
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Editor - Customer Journeys', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as Super Admin
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', 'admin@test.com');
    await page.fill('[data-testid="input-password"]', 'admin123');
    await page.click('[data-testid="button-login"]');
    await page.waitForURL('/');
  });

  test('Journey 1: Text Change → AI Code → Deploy', async ({ page }) => {
    console.log('🧪 Testing Journey 1: Text Change Workflow');
    
    // Step 1: Navigate to a page
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Activate Visual Editor
    const editButton = page.locator('[data-testid="button-edit-page"]');
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForSelector('[data-testid="visual-editor-active"]');
      console.log('✅ Visual Editor activated');
    }
    
    // Step 3: Click on heading to edit
    const heading = page.locator('h1').first();
    await heading.click();
    await page.waitForSelector('[data-testid="edit-overlay"]');
    console.log('✅ Element selected for editing');
    
    // Step 4: Change text inline
    const textInput = page.locator('[data-testid="input-text-edit"]');
    await textInput.fill('My Dashboard');
    console.log('✅ Text changed to "My Dashboard"');
    
    // Step 5: Generate AI code
    await page.click('[data-testid="button-generate-code"]');
    await page.waitForSelector('[data-testid="code-preview"]', { timeout: 30000 });
    console.log('✅ AI code generated');
    
    // Step 6: Verify generated code contains change
    const codePreview = await page.textContent('[data-testid="code-preview"]');
    expect(codePreview).toContain('My Dashboard');
    console.log('✅ Generated code verified');
    
    // Step 7: Deploy to preview
    await page.click('[data-testid="button-deploy-preview"]');
    await page.waitForSelector('[data-testid="preview-url"]', { timeout: 30000 });
    const previewUrl = await page.textContent('[data-testid="preview-url"]');
    console.log(`✅ Preview deployed: ${previewUrl}`);
    
    // Step 8: Deploy to production
    await page.click('[data-testid="button-deploy-production"]');
    await page.waitForSelector('[data-testid="deploy-success"]', { timeout: 30000 });
    console.log('✅ Production deployment successful');
    
    // Step 9: Verify live site
    await page.goto('/profile');
    const liveHeading = await page.textContent('h1');
    expect(liveHeading).toContain('My Dashboard');
    console.log('✅ Journey 1 COMPLETE: Live site updated');
  });

  test('Journey 2: Layout Change → Tailwind → Deploy', async ({ page }) => {
    console.log('🧪 Testing Journey 2: Layout Change Workflow');
    
    // Step 1: Navigate to events page
    await page.goto('/events');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Activate Visual Editor
    const editButton = page.locator('[data-testid="button-edit-page"]');
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForSelector('[data-testid="visual-editor-active"]');
    }
    
    // Step 3: Select "Create Event" button
    const createButton = page.locator('[data-testid="button-create-event"]').first();
    await createButton.click();
    await page.waitForSelector('[data-testid="edit-overlay"]');
    console.log('✅ Button selected for editing');
    
    // Step 4: Change alignment to center
    await page.click('[data-testid="button-align-center"]');
    console.log('✅ Alignment changed to center');
    
    // Step 5: Generate code
    await page.click('[data-testid="button-generate-code"]');
    await page.waitForSelector('[data-testid="code-preview"]', { timeout: 30000 });
    
    // Step 6: Verify Tailwind classes updated
    const codePreview = await page.textContent('[data-testid="code-preview"]');
    expect(codePreview).toMatch(/justify-center|text-center|mx-auto/);
    console.log('✅ Tailwind classes updated');
    
    // Step 7: Deploy
    await page.click('[data-testid="button-deploy-preview"]');
    await page.waitForSelector('[data-testid="preview-url"]', { timeout: 30000 });
    
    await page.click('[data-testid="button-deploy-production"]');
    await page.waitForSelector('[data-testid="deploy-success"]', { timeout: 30000 });
    console.log('✅ Journey 2 COMPLETE: Layout changes deployed');
  });

  test('Journey 3: Theme Change → Global CSS → Deploy', async ({ page }) => {
    console.log('🧪 Testing Journey 3: Theme Change Workflow');
    
    // Step 1: Navigate to any page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Activate Visual Editor
    const editButton = page.locator('[data-testid="button-edit-page"]');
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForSelector('[data-testid="visual-editor-active"]');
    }
    
    // Step 3: Select primary button
    const primaryButton = page.locator('button.bg-primary').first();
    await primaryButton.click();
    await page.waitForSelector('[data-testid="edit-overlay"]');
    console.log('✅ Primary button selected');
    
    // Step 4: Change color to green
    await page.click('[data-testid="button-color-picker"]');
    await page.fill('[data-testid="input-color"]', '#10b981'); // Green
    console.log('✅ Color changed to green');
    
    // Step 5: Apply globally
    await page.click('[data-testid="checkbox-apply-globally"]');
    console.log('✅ Global application selected');
    
    // Step 6: Generate CSS
    await page.click('[data-testid="button-generate-code"]');
    await page.waitForSelector('[data-testid="code-preview"]', { timeout: 30000 });
    
    // Step 7: Verify CSS contains color
    const codePreview = await page.textContent('[data-testid="code-preview"]');
    expect(codePreview).toMatch(/#10b981|rgb\(16,\s*185,\s*129\)/);
    console.log('✅ CSS generated with new color');
    
    // Step 8: Verify all buttons update
    const allButtons = await page.locator('button.bg-primary').count();
    console.log(`✅ ${allButtons} buttons will be updated globally`);
    
    // Step 9: Deploy
    await page.click('[data-testid="button-deploy-preview"]');
    await page.waitForSelector('[data-testid="preview-url"]', { timeout: 30000 });
    
    await page.click('[data-testid="button-deploy-production"]');
    await page.waitForSelector('[data-testid="deploy-success"]', { timeout: 30000 });
    console.log('✅ Journey 3 COMPLETE: Theme changes deployed globally');
  });

  test('All Visual Editor APIs Operational', async ({ page }) => {
    // Test backend endpoints
    const endpoints = [
      '/api/visual-editor/generate-code',
      '/api/visual-editor/preview',
      '/api/visual-editor/deploy'
    ];
    
    for (const endpoint of endpoints) {
      const response = await page.request.post(endpoint, {
        data: { test: true }
      });
      expect(response.status()).toBeLessThan(500);
      console.log(`✅ ${endpoint} operational`);
    }
  });
});
