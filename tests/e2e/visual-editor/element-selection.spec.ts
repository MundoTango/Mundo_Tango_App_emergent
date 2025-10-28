/**
 * VISUAL EDITOR TEST: Element Selection
 * MB.MD Comprehensive Testing - October 28, 2025
 * 
 * Tests: Click-to-select, purple bounding box, inspector data display
 */

import { test, expect } from '@playwright/test';
import { loginAsSuperAdmin } from '../../helpers/auth';
import { EvidenceCollector } from '../../support/evidence';
import { VisualEditorPage } from '../page-objects/VisualEditor.page';
import { enableAutonomousMode, resetFeatureFlags } from '../../fixtures/feature-flags';

test.describe('Visual Editor - Element Selection', () => {
  let evidence: EvidenceCollector;
  
  test.beforeEach(async ({ page, request }) => {
    // Reset feature flags
    await resetFeatureFlags(request);
    
    // Enable autonomous mode for super admin
    await enableAutonomousMode(request);
    
    // Login and navigate
    await loginAsSuperAdmin(page);
    
    // Initialize evidence collector
    evidence = new EvidenceCollector(page, test.info(), 'super-admin');
    evidence.setFeatureFlags({
      'mbmd-autonomous': true,
      'mbmd-architect-review': true,
      'mbmd-voice-evidence': true,
    });
  });
  
  test.afterEach(async () => {
    await evidence.setStatus(
      test.info().status === 'passed' ? 'passed' : 'failed',
      test.info().duration
    );
    await evidence.saveManifest();
  });
  
  test('Super admin can select elements with purple bounding box', async ({ page }) => {
    const editor = new VisualEditorPage(page);
    
    // Navigate to Visual Editor
    await editor.goto();
    await evidence.captureScreenshot('01-visual-editor-opened');
    
    // Open Inspector tab
    await editor.openTab('Inspector');
    await evidence.captureScreenshot('02-inspector-tab-opened');
    
    // Click on a heading element
    await editor.selectElement('h1');
    await evidence.captureScreenshot('03-element-selected');
    
    // Verify purple bounding box appears
    await editor.assertPurpleBoundingBox();
    await evidence.captureScreenshot('04-purple-bounding-box');
    
    // Verify inspector shows correct data
    await editor.assertInspectorShowsData('H1');
    await evidence.captureScreenshot('05-inspector-shows-data');
    
    // Dual-theme screenshot
    await evidence.captureDualThemeScreenshot('06-element-selection');
    
    // Verify no console errors
    expect(evidence.hasErrors()).toBe(false);
  });
  
  test('Inspector panel displays element properties correctly', async ({ page }) => {
    const editor = new VisualEditorPage(page);
    
    await editor.goto();
    await evidence.captureScreenshot('01-loaded');
    
    await editor.openTab('Inspector');
    
    // Select element with classes
    await editor.selectElement('.btn-primary');
    await evidence.captureScreenshot('02-button-selected');
    
    // Verify all properties displayed
    await editor.assertInspectorShowsData('BUTTON', ['btn-primary']);
    await evidence.captureScreenshot('03-properties-displayed');
    
    // Get element text content
    const text = await editor.getSelectedElementText();
    expect(text.length).toBeGreaterThan(0);
    
    await evidence.captureScreenshot('04-final-state');
  });
});
