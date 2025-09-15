import { test, expect } from '@playwright/test';
import {
  runAccessibilityScan,
  assertNoA11yViolations,
  checkWCAGCriteria,
  checkColorContrast,
  checkAriaAttributes,
  checkFormLabels,
  checkImageAltText,
  checkFocusIndicators,
  generateA11yReport,
} from './helpers/accessibility';
import { login } from './helpers/test-helpers';
import { testUsers } from './fixtures/test-data';

/**
 * Accessibility Testing Suite for Mundo Tango
 */

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });
  
  test('Homepage accessibility compliance', async ({ page }) => {
    // Run comprehensive accessibility scan
    const results = await runAccessibilityScan(page);
    
    // Generate detailed report
    await generateA11yReport(page, 'homepage-a11y');
    
    // Assert no critical violations
    const criticalViolations = results.violations.filter(v => v.impact === 'critical');
    expect(criticalViolations).toHaveLength(0);
    
    // Check WCAG AA compliance
    await checkWCAGCriteria(page, 'AA');
    
    // Check color contrast
    await checkColorContrast(page);
    
    // Check all images have alt text
    await checkImageAltText(page);
  });
  
  test('Authentication pages accessibility', async ({ page }) => {
    // Test login page
    await page.goto('/auth/login');
    await assertNoA11yViolations(page);
    
    // Check form labels
    await checkFormLabels(page);
    
    // Check focus indicators
    await checkFocusIndicators(page, '[data-testid="input-email"]');
    await checkFocusIndicators(page, '[data-testid="input-password"]');
    await checkFocusIndicators(page, '[data-testid="button-login"]');
    
    // Test registration page
    await page.goto('/auth/register');
    await assertNoA11yViolations(page);
    await checkFormLabels(page);
  });
  
  test('Dashboard accessibility for authenticated users', async ({ page }) => {
    await login(page, testUsers.regularUser);
    await page.goto('/dashboard');
    
    // Check accessibility with some allowed violations for dynamic content
    await assertNoA11yViolations(page, {
      allowedViolations: ['color-contrast'], // May have decorative elements
      skipImpacts: ['minor'],
    });
    
    // Check ARIA attributes on interactive elements
    const interactiveElements = await page.locator('button, a, [role="button"]').all();
    for (const element of interactiveElements) {
      const selector = await element.evaluate(el => {
        return el.getAttribute('data-testid') || el.className;
      });
      if (selector) {
        await checkAriaAttributes(page, `[data-testid="${selector}"]`);
      }
    }
  });
  
  test('Events page accessibility', async ({ page }) => {
    await login(page, testUsers.regularUser);
    await page.goto('/events');
    
    const results = await runAccessibilityScan(page, {
      include: ['main'], // Focus on main content
      exclude: ['[data-testid="advertisement"]'], // Exclude ads
    });
    
    // Check specific rules
    const landmarkViolations = results.violations.filter(v => v.id === 'landmark-one-main');
    expect(landmarkViolations).toHaveLength(0);
    
    // Check event cards have proper structure
    const eventCards = await page.locator('[data-testid^="card-event-"]').all();
    for (const card of eventCards) {
      // Each card should have proper heading structure
      const heading = await card.locator('h2, h3').count();
      expect(heading).toBeGreaterThan(0);
      
      // Check interactive elements within cards
      const buttons = await card.locator('button').all();
      for (const button of buttons) {
        const ariaLabel = await button.getAttribute('aria-label');
        const textContent = await button.textContent();
        expect(ariaLabel || textContent).toBeTruthy();
      }
    }
  });
  
  test('Keyboard navigation throughout the app', async ({ page }) => {
    await login(page, testUsers.regularUser);
    
    // Test main navigation
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
    
    // Navigate through main menu items
    const menuItems = [
      'Dashboard',
      'Events',
      'Community',
      'Messages',
      'Profile',
    ];
    
    for (const item of menuItems) {
      await page.keyboard.press('Tab');
      const focusedText = await page.evaluate(() => document.activeElement?.textContent);
      if (focusedText?.includes(item)) {
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');
        
        // Check page is accessible
        await assertNoA11yViolations(page, {
          skipImpacts: ['minor'],
        });
        
        // Go back to test next item
        await page.goto('/dashboard');
      }
    }
  });
  
  test('Screen reader compatibility', async ({ page }) => {
    await page.goto('/');
    
    // Check for screen reader only content
    const srOnlyElements = await page.locator('.sr-only, [aria-hidden="true"]').all();
    
    for (const element of srOnlyElements) {
      const isHidden = await element.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.position === 'absolute' && 
               styles.width === '1px' && 
               styles.height === '1px';
      });
      
      if (!isHidden) {
        const ariaHidden = await element.getAttribute('aria-hidden');
        expect(ariaHidden).toBe('true');
      }
    }
    
    // Check live regions for dynamic content
    const liveRegions = await page.locator('[aria-live]').all();
    for (const region of liveRegions) {
      const ariaLive = await region.getAttribute('aria-live');
      expect(['polite', 'assertive', 'off']).toContain(ariaLive);
    }
  });
  
  test('Mobile accessibility', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Mobile-specific accessibility checks
    await assertNoA11yViolations(page);
    
    // Check touch target sizes (minimum 44x44 pixels)
    const touchTargets = await page.locator('button, a, [role="button"]').all();
    
    for (const target of touchTargets) {
      const box = await target.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
    
    // Check mobile menu accessibility
    await page.click('[data-testid="button-hamburger-menu"]');
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    
    // Menu should be accessible
    const menuRole = await mobileMenu.getAttribute('role');
    expect(menuRole).toBe('navigation');
    
    const ariaLabel = await mobileMenu.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });
  
  test('Form accessibility and error handling', async ({ page }) => {
    await page.goto('/events/create');
    
    // Submit empty form to trigger validation
    await page.click('[data-testid="button-submit"]');
    
    // Check error messages are accessible
    const errorMessages = await page.locator('[role="alert"]').all();
    expect(errorMessages.length).toBeGreaterThan(0);
    
    for (const error of errorMessages) {
      // Error should be associated with form field
      const id = await error.getAttribute('id');
      if (id) {
        const associatedField = await page.locator(`[aria-describedby="${id}"]`).count();
        expect(associatedField).toBeGreaterThan(0);
      }
      
      // Error should be announced to screen readers
      const ariaLive = await error.getAttribute('aria-live');
      expect(ariaLive).toBe('polite');
    }
    
    // Check form field labels
    await checkFormLabels(page);
  });
  
  test('Color blind friendly design', async ({ page }) => {
    await page.goto('/');
    
    // Simulate different types of color blindness
    const colorBlindTypes = [
      'protanopia',    // Red-blind
      'deuteranopia',  // Green-blind
      'tritanopia',    // Blue-blind
      'achromatopsia', // Total color blindness
    ];
    
    for (const type of colorBlindTypes) {
      // Apply color blind filter
      await page.addStyleTag({
        content: `
          body {
            filter: url(#${type});
          }
        `
      });
      
      // Check that important information is still distinguishable
      await assertNoA11yViolations(page, {
        skipImpacts: ['minor'],
      });
      
      // Remove filter
      await page.evaluate(() => {
        document.body.style.filter = '';
      });
    }
  });
  
  test('Generate comprehensive accessibility report', async ({ page }) => {
    const pagesToTest = [
      { path: '/', name: 'homepage' },
      { path: '/auth/login', name: 'login' },
      { path: '/events', name: 'events' },
      { path: '/community', name: 'community' },
      { path: '/profile', name: 'profile' },
    ];
    
    const allResults = [];
    
    for (const pageInfo of pagesToTest) {
      await page.goto(pageInfo.path);
      
      const results = await runAccessibilityScan(page);
      await generateA11yReport(page, `${pageInfo.name}-detailed`);
      
      allResults.push({
        page: pageInfo.name,
        url: pageInfo.path,
        violations: results.violations.length,
        passes: results.passes.length,
        incomplete: results.incomplete.length,
      });
    }
    
    // Log summary
    console.table(allResults);
    
    // Assert overall compliance
    const totalViolations = allResults.reduce((sum, r) => sum + r.violations, 0);
    expect(totalViolations).toBeLessThan(10); // Threshold for acceptable violations
  });
});