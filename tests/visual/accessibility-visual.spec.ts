/**
 * Mundo Tango Accessibility Visual Testing
 * Ensures visual elements meet accessibility standards
 */

import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility Visual Tests', () => {
  test('Homepage accessibility', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
    
    // Check color contrast for Ocean theme
    const violations = await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      },
      includedImpacts: ['critical', 'serious', 'moderate']
    });
    
    expect(violations).toBeNull();
  });

  test('Dark mode color contrast', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    });
    
    await injectAxe(page);
    const violations = await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true },
        'color-contrast-enhanced': { enabled: true }
      }
    });
    
    expect(violations).toBeNull();
  });

  test('Forms accessibility', async ({ page }) => {
    await page.goto('/auth/register');
    await injectAxe(page);
    
    const violations = await checkA11y(page, '#registration-form', {
      rules: {
        'label': { enabled: true },
        'aria-label': { enabled: true },
        'form-field-multiple-labels': { enabled: true }
      }
    });
    
    expect(violations).toBeNull();
  });

  test('Focus visible indicators', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => {
      const el = document.activeElement;
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineColor: styles.outlineColor,
        boxShadow: styles.boxShadow
      };
    });
    
    // Ensure focus is visible
    expect(firstFocused.outline !== 'none' || firstFocused.boxShadow !== 'none').toBeTruthy();
  });
});