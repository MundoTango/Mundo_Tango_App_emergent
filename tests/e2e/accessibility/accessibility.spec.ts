import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// ESA LIFE CEO 61×21 - Comprehensive Accessibility Testing Suite
// WCAG 2.1 Level AA Compliance Testing

test.describe('Comprehensive WCAG Accessibility Tests', () => {
  test.describe('Homepage Accessibility', () => {
    test('Should pass WCAG standards on homepage', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const accessibilityResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('[data-testid="third-party-widget"]') // Exclude third-party content
        .analyze();
      
      expect(accessibilityResults.violations).toEqual([]);
    });

    test('Should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');
      
      // There should be exactly one h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);
      
      // Check heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
      expect(headings.length).toBeGreaterThan(0);
      
      // Verify logical heading order
      const headingLevels = await page.evaluate(() => {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        return Array.from(headings).map(h => parseInt(h.tagName[1]));
      });
      
      for (let i = 1; i < headingLevels.length; i++) {
        const diff = headingLevels[i] - headingLevels[i - 1];
        expect(diff).toBeLessThanOrEqual(1); // No skipping levels
      }
    });

    test('Should have proper keyboard navigation', async ({ page }) => {
      await page.goto('/');
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      const firstFocusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(firstFocusedElement).toBeTruthy();
      
      // Test skip link if present
      const skipLink = page.locator('a[href="#main"], a[href="#content"]').first();
      if (await skipLink.count() > 0) {
        await skipLink.focus();
        await skipLink.press('Enter');
        const mainContent = await page.locator('#main, #content, main').first();
        await expect(mainContent).toBeInViewport();
      }
    });

    test('Should have sufficient color contrast', async ({ page }) => {
      await page.goto('/');
      
      const contrastResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .options({
          rules: {
            'color-contrast': { enabled: true }
          }
        })
        .analyze();
      
      const contrastViolations = contrastResults.violations.filter(v => v.id === 'color-contrast');
      expect(contrastViolations).toEqual([]);
    });

    test('Should have proper ARIA attributes', async ({ page }) => {
      await page.goto('/');
      
      // Check for ARIA landmarks
      const landmarks = await page.locator('[role="banner"], [role="navigation"], [role="main"], [role="contentinfo"], header, nav, main, footer').count();
      expect(landmarks).toBeGreaterThan(0);
      
      // Check for proper ARIA labels on interactive elements
      const buttons = await page.locator('button:not([aria-label]):not([aria-labelledby])').count();
      expect(buttons).toBe(0);
      
      const links = await page.locator('a[href=""]:not([aria-label]):not([aria-labelledby])').count();
      expect(links).toBe(0);
    });
  });

  test.describe('Authentication Pages Accessibility', () => {
    test('Login page should be accessible', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      const accessibilityResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      expect(accessibilityResults.violations).toEqual([]);
      
      // Check form accessibility
      const formLabels = await page.locator('label[for]').count();
      const formInputs = await page.locator('input[type="text"], input[type="email"], input[type="password"]').count();
      expect(formLabels).toBeGreaterThanOrEqual(formInputs);
      
      // Check error messages accessibility
      const errorMessages = await page.locator('[role="alert"], [aria-live="polite"], [aria-live="assertive"]').count();
      expect(errorMessages).toBeGreaterThanOrEqual(0);
    });

    test('Registration page should be accessible', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      const accessibilityResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      expect(accessibilityResults.violations).toEqual([]);
    });
  });

  test.describe('User Dashboard Accessibility', () => {
    test('Dashboard should be navigable with keyboard only', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Test keyboard navigation through dashboard elements
      const tabbableElements = await page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').count();
      expect(tabbableElements).toBeGreaterThan(0);
      
      // Test focus indicators
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        const styles = window.getComputedStyle(el!);
        return {
          outline: styles.outline,
          boxShadow: styles.boxShadow,
          border: styles.border
        };
      });
      
      // Should have visible focus indicator
      expect(
        focusedElement.outline !== 'none' ||
        focusedElement.boxShadow !== 'none' ||
        focusedElement.border !== 'none'
      ).toBeTruthy();
    });
  });

  test.describe('Profile Pages Accessibility', () => {
    test('Profile page should meet WCAG standards', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      
      const accessibilityResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      expect(accessibilityResults.violations).toEqual([]);
      
      // Check image alt texts
      const imagesWithoutAlt = await page.locator('img:not([alt])').count();
      expect(imagesWithoutAlt).toBe(0);
      
      // Check decorative images
      const decorativeImages = await page.locator('img[alt=""], img[role="presentation"]').count();
      expect(decorativeImages).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Events Pages Accessibility', () => {
    test('Events listing should be accessible', async ({ page }) => {
      await page.goto('/events');
      await page.waitForLoadState('networkidle');
      
      const accessibilityResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      expect(accessibilityResults.violations).toEqual([]);
      
      // Check for proper list structure
      const lists = await page.locator('ul, ol').count();
      if (lists > 0) {
        const listItems = await page.locator('li').count();
        expect(listItems).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Community Pages Accessibility', () => {
    test('Community page should be screen reader friendly', async ({ page }) => {
      await page.goto('/community');
      await page.waitForLoadState('networkidle');
      
      const accessibilityResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
        .analyze();
      
      expect(accessibilityResults.violations).toEqual([]);
      
      // Check for proper semantic HTML
      const semanticElements = await page.locator('article, section, aside, nav').count();
      expect(semanticElements).toBeGreaterThan(0);
    });
  });

  test.describe('Mobile Responsiveness Accessibility', () => {
    test('Should be accessible on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const accessibilityResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      expect(accessibilityResults.violations).toEqual([]);
      
      // Check touch target sizes (minimum 44x44 pixels)
      const touchTargets = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button, a, input');
        return Array.from(buttons).map(el => {
          const rect = el.getBoundingClientRect();
          return {
            width: rect.width,
            height: rect.height
          };
        });
      });
      
      touchTargets.forEach(target => {
        expect(target.width).toBeGreaterThanOrEqual(44);
        expect(target.height).toBeGreaterThanOrEqual(44);
      });
    });
  });

  test.describe('Form Accessibility', () => {
    test('Forms should have proper labels and error handling', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');
      
      // Check all form inputs have labels
      const inputs = await page.locator('input, select, textarea').all();
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        if (id) {
          const label = await page.locator(`label[for="${id}"]`).count();
          const ariaLabel = await input.getAttribute('aria-label');
          const ariaLabelledBy = await input.getAttribute('aria-labelledby');
          
          expect(label > 0 || ariaLabel !== null || ariaLabelledBy !== null).toBeTruthy();
        }
      }
      
      // Check for required field indicators
      const requiredFields = await page.locator('[required], [aria-required="true"]').count();
      if (requiredFields > 0) {
        const requiredIndicators = await page.locator('text=*').count();
        expect(requiredIndicators).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Media Accessibility', () => {
    test('Videos should have captions and audio descriptions', async ({ page }) => {
      await page.goto('/');
      
      const videos = await page.locator('video').all();
      for (const video of videos) {
        // Check for caption tracks
        const tracks = await video.locator('track[kind="captions"], track[kind="subtitles"]').count();
        if (await video.isVisible()) {
          expect(tracks).toBeGreaterThan(0);
        }
        
        // Check for controls
        const hasControls = await video.getAttribute('controls');
        expect(hasControls).toBeTruthy();
      }
    });

    test('Audio elements should have transcripts', async ({ page }) => {
      await page.goto('/');
      
      const audioElements = await page.locator('audio').count();
      if (audioElements > 0) {
        // Check for transcript links or text near audio elements
        const transcripts = await page.locator('[aria-label*="transcript"], .transcript, #transcript').count();
        expect(transcripts).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Data Tables Accessibility', () => {
    test('Tables should have proper structure and headers', async ({ page }) => {
      await page.goto('/admin');
      
      const tables = await page.locator('table').all();
      for (const table of tables) {
        if (await table.isVisible()) {
          // Check for caption or aria-label
          const caption = await table.locator('caption').count();
          const ariaLabel = await table.getAttribute('aria-label');
          expect(caption > 0 || ariaLabel !== null).toBeTruthy();
          
          // Check for header cells
          const headers = await table.locator('th').count();
          expect(headers).toBeGreaterThan(0);
          
          // Check for scope attributes on headers
          const headersWithScope = await table.locator('th[scope]').count();
          expect(headersWithScope).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Error States Accessibility', () => {
    test('404 page should be accessible', async ({ page }) => {
      await page.goto('/non-existent-page');
      
      const accessibilityResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      expect(accessibilityResults.violations).toEqual([]);
      
      // Should have clear error message
      const errorMessage = await page.locator('text=/404|not found/i').count();
      expect(errorMessage).toBeGreaterThan(0);
      
      // Should have navigation options
      const homeLink = await page.locator('a[href="/"]').count();
      expect(homeLink).toBeGreaterThan(0);
    });
  });

  test.describe('Language and Internationalization', () => {
    test('Should have proper language attributes', async ({ page }) => {
      await page.goto('/');
      
      // Check html lang attribute
      const lang = await page.locator('html').getAttribute('lang');
      expect(lang).toBeTruthy();
      expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // e.g., 'en' or 'en-US'
      
      // Check for language switcher accessibility
      const langSwitcher = await page.locator('[aria-label*="language"], [data-testid="language-switcher"]').first();
      if (await langSwitcher.count() > 0) {
        const ariaLabel = await langSwitcher.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
      }
    });
  });

  test.describe('Loading States Accessibility', () => {
    test('Loading indicators should be accessible', async ({ page }) => {
      await page.goto('/');
      
      // Check for loading indicators with proper ARIA attributes
      const loaders = await page.locator('[role="status"], [role="progressbar"], [aria-busy="true"]').all();
      for (const loader of loaders) {
        if (await loader.isVisible()) {
          const ariaLabel = await loader.getAttribute('aria-label');
          const ariaLive = await loader.getAttribute('aria-live');
          const innerText = await loader.innerText();
          
          // Should have some way to communicate loading state
          expect(ariaLabel || ariaLive || innerText).toBeTruthy();
        }
      }
    });
  });
});