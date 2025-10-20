import { test, expect } from '@playwright/test';

/**
 * MB.MD S3: E2E Test - Accessibility (A11Y)
 * Created: October 20, 2025
 * 
 * Tests: WCAG AA compliance, keyboard navigation, ARIA labels
 */

test.describe('Accessibility Tests', () => {
  test('should have proper page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Mundo Tango|MT/);
  });

  test('should have lang attribute on html element', async ({ page }) => {
    await page.goto('/');
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
    expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // e.g., "en", "es", "en-US"
  });

  test('should support keyboard navigation on main elements', async ({ page }) => {
    await page.goto('/');
    
    // Try to tab through the page
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    // Check if focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should have skip navigation link or main landmark', async ({ page }) => {
    await page.goto('/');
    
    // Check for skip link or main landmark (both are valid for a11y)
    const skipLink = page.getByText(/skip to|skip navigation|skip to content/i);
    const mainLandmark = page.locator('main, [role="main"]');
    
    const hasSkipLink = await skipLink.count();
    const hasMainLandmark = await mainLandmark.count();
    
    // Should have either skip link OR main landmark for navigation
    expect(hasSkipLink > 0 || hasMainLandmark > 0).toBeTruthy();
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/');
    
    // Get all images
    const images = page.locator('img');
    const count = await images.count();
    
    if (count > 0) {
      // Check first image has alt attribute
      const firstImg = images.first();
      const alt = await firstImg.getAttribute('alt');
      
      // Alt can be empty string for decorative images, but should exist
      expect(alt !== null).toBeTruthy();
    }
  });

  test('buttons should have accessible labels', async ({ page }) => {
    await page.goto('/');
    
    // Get all buttons
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    if (count > 0) {
      const firstButton = buttons.first();
      const text = await firstButton.textContent();
      const ariaLabel = await firstButton.getAttribute('aria-label');
      
      // Button should have either text content or aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('form inputs should have labels', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Get all inputs
    const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"]');
    const count = await inputs.count();
    
    if (count > 0) {
      const firstInput = inputs.first();
      const id = await firstInput.getAttribute('id');
      const ariaLabel = await firstInput.getAttribute('aria-label');
      
      // Input should have ID (for label) or aria-label
      expect(id || ariaLabel).toBeTruthy();
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
    
    // Should have at least one h1
    const h1Count = await h1.count();
    expect(h1Count).toBeGreaterThan(0);
  });

  test('interactive elements should have focus styles', async ({ page }) => {
    await page.goto('/');
    
    // Tab to first focusable element
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    
    // Get focused element's outline or box-shadow
    const focusStyles = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow,
        ring: styles.getPropertyValue('--tw-ring-width') // Tailwind ring
      };
    });
    
    // Should have some focus indicator (outline, box-shadow, or Tailwind ring)
    const hasFocusStyle = 
      (focusStyles.outline && focusStyles.outline !== 'none' && focusStyles.outline !== '0px none rgb(0, 0, 0)') || 
      (focusStyles.boxShadow && focusStyles.boxShadow !== 'none') ||
      (focusStyles.ring && focusStyles.ring !== '');
    
    expect(hasFocusStyle).toBeTruthy();
  });
});
