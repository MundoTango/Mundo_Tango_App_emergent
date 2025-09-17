/**
 * ESA Layer 51 - MT Ocean Theme Validation Tests
 * Comprehensive theme consistency and validation testing
 */

import { test, expect } from '@playwright/test';
import { percyEnhanced } from '../percy-enhanced';

const MT_OCEAN_COLORS = {
  primary: '#5EEAD4',
  secondary: '#155E75',
  accent: '#34D399',
  background: {
    light: '#FFFFFF',
    dark: '#0F172A'
  },
  text: {
    light: '#1E293B',
    dark: '#F8FAFC'
  },
  glass: {
    light: 'rgba(94, 234, 212, 0.1)',
    dark: 'rgba(21, 94, 117, 0.1)'
  }
};

test.describe('MT Ocean Theme Validation', () => {
  test.describe('Color Consistency', () => {
    test('Primary Color Usage', async ({ page }) => {
      await page.goto('/');
      
      // Find all elements using primary color
      const primaryElements = await page.evaluate((color) => {
        const elements = [];
        document.querySelectorAll('*').forEach(el => {
          const styles = window.getComputedStyle(el);
          if (styles.backgroundColor.includes(color) || 
              styles.color.includes(color) ||
              styles.borderColor.includes(color)) {
            elements.push({
              tag: el.tagName,
              class: el.className,
              color: color
            });
          }
        });
        return elements;
      }, MT_OCEAN_COLORS.primary);
      
      expect(primaryElements.length).toBeGreaterThan(0);
      await percyEnhanced.snapshot(page, 'theme-primary-color-usage');
    });
    
    test('Secondary Color Usage', async ({ page }) => {
      await page.goto('/');
      
      const secondaryElements = await page.evaluate((color) => {
        const elements = [];
        document.querySelectorAll('*').forEach(el => {
          const styles = window.getComputedStyle(el);
          if (styles.backgroundColor.includes(color) || 
              styles.color.includes(color) ||
              styles.borderColor.includes(color)) {
            elements.push({
              tag: el.tagName,
              class: el.className,
              color: color
            });
          }
        });
        return elements;
      }, MT_OCEAN_COLORS.secondary);
      
      expect(secondaryElements.length).toBeGreaterThan(0);
      await percyEnhanced.snapshot(page, 'theme-secondary-color-usage');
    });
    
    test('Gradient Elements', async ({ page }) => {
      await page.goto('/');
      
      const gradientElements = await page.evaluate(() => {
        const elements = [];
        document.querySelectorAll('[class*="gradient"], [class*="bg-gradient"]').forEach(el => {
          const styles = window.getComputedStyle(el);
          elements.push({
            tag: el.tagName,
            class: el.className,
            background: styles.backgroundImage
          });
        });
        return elements;
      });
      
      expect(gradientElements.length).toBeGreaterThan(0);
      await percyEnhanced.snapshot(page, 'theme-gradient-elements');
    });
  });
  
  test.describe('Glassmorphic Effects', () => {
    test('Glassmorphic Cards', async ({ page }) => {
      await page.goto('/events');
      
      const glassmorphicCards = await page.evaluate(() => {
        const cards = [];
        document.querySelectorAll('.glassmorphic-card').forEach(card => {
          const styles = window.getComputedStyle(card);
          cards.push({
            backdropFilter: styles.backdropFilter,
            background: styles.background,
            border: styles.border,
            boxShadow: styles.boxShadow
          });
        });
        return cards;
      });
      
      expect(glassmorphicCards.length).toBeGreaterThan(0);
      
      // Validate glassmorphic properties
      glassmorphicCards.forEach(card => {
        expect(card.backdropFilter).toContain('blur');
      });
      
      await percyEnhanced.snapshot(page, 'glassmorphic-cards-validation');
    });
    
    test('Glass Overlay Effects', async ({ page }) => {
      await page.goto('/messages');
      
      const overlays = page.locator('.glass-overlay, [class*="glass"]');
      if (await overlays.count() > 0) {
        await percyEnhanced.snapshot(page, 'glass-overlay-effects');
      }
    });
  });
  
  test.describe('Theme Switching', () => {
    test('Light to Dark Mode Transition', async ({ page }) => {
      await page.goto('/');
      
      // Light mode
      await page.evaluate(() => {
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.remove('dark');
      });
      await page.waitForTimeout(500);
      await percyEnhanced.snapshot(page, 'theme-light-mode');
      
      // Transition to dark mode
      await page.evaluate(() => {
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.add('dark');
      });
      await page.waitForTimeout(500);
      await percyEnhanced.snapshot(page, 'theme-dark-mode');
      
      // Validate color changes
      const darkModeColors = await page.evaluate(() => {
        const body = document.body;
        const styles = window.getComputedStyle(body);
        return {
          background: styles.backgroundColor,
          text: styles.color
        };
      });
      
      expect(darkModeColors.background).not.toBe('#FFFFFF');
    });
    
    test('System Preference Detection', async ({ page }) => {
      // Test with system dark mode preference
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');
      await percyEnhanced.snapshot(page, 'theme-system-dark');
      
      // Test with system light mode preference
      await page.emulateMedia({ colorScheme: 'light' });
      await page.reload();
      await percyEnhanced.snapshot(page, 'theme-system-light');
    });
  });
  
  test.describe('Component Theme Consistency', () => {
    test('Buttons', async ({ page }) => {
      await page.goto('/');
      
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        await button.scrollIntoViewIfNeeded();
        
        // Normal state
        await percyEnhanced.snapshot(page, `button-theme-normal-${i}`, {
          scope: 'button'
        });
        
        // Hover state
        await button.hover();
        await percyEnhanced.snapshot(page, `button-theme-hover-${i}`, {
          scope: 'button'
        });
      }
    });
    
    test('Forms', async ({ page }) => {
      await page.goto('/auth/register');
      
      // Input fields
      const inputs = page.locator('input');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        const input = inputs.nth(i);
        
        // Normal state
        await percyEnhanced.snapshot(page, `input-theme-normal-${i}`, {
          scope: 'input'
        });
        
        // Focus state
        await input.focus();
        await percyEnhanced.snapshot(page, `input-theme-focus-${i}`, {
          scope: 'input'
        });
      }
    });
    
    test('Cards', async ({ page }) => {
      await page.goto('/events');
      
      const cards = page.locator('.card, [class*="card"]');
      const cardCount = await cards.count();
      
      for (let i = 0; i < Math.min(cardCount, 3); i++) {
        const card = cards.nth(i);
        await card.scrollIntoViewIfNeeded();
        await percyEnhanced.snapshot(page, `card-theme-${i}`, {
          scope: '[class*="card"]'
        });
      }
    });
    
    test('Navigation', async ({ page }) => {
      await page.goto('/');
      
      // Top navigation
      const topNav = page.locator('nav, header').first();
      if (await topNav.count() > 0) {
        await percyEnhanced.snapshot(page, 'navigation-theme-top', {
          scope: 'nav'
        });
      }
      
      // Sidebar navigation (if exists)
      const sidebar = page.locator('.sidebar, aside').first();
      if (await sidebar.count() > 0) {
        await percyEnhanced.snapshot(page, 'navigation-theme-sidebar', {
          scope: 'aside'
        });
      }
    });
  });
  
  test.describe('Typography Theme', () => {
    test('Font Consistency', async ({ page }) => {
      await page.goto('/');
      
      const typography = await page.evaluate(() => {
        const elements = {};
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a'].forEach(tag => {
          const el = document.querySelector(tag);
          if (el) {
            const styles = window.getComputedStyle(el);
            elements[tag] = {
              fontFamily: styles.fontFamily,
              fontSize: styles.fontSize,
              fontWeight: styles.fontWeight,
              lineHeight: styles.lineHeight,
              color: styles.color
            };
          }
        });
        return elements;
      });
      
      // Validate font consistency
      Object.values(typography).forEach((style: any) => {
        expect(style.fontFamily).toBeTruthy();
      });
      
      await percyEnhanced.snapshot(page, 'typography-theme');
    });
    
    test('Text Colors', async ({ page }) => {
      await page.goto('/');
      
      // Test text colors in light mode
      await page.evaluate(() => {
        document.documentElement.classList.remove('dark');
      });
      
      const lightTextColors = await page.evaluate(() => {
        const p = document.querySelector('p');
        return p ? window.getComputedStyle(p).color : null;
      });
      
      await percyEnhanced.snapshot(page, 'text-colors-light');
      
      // Test text colors in dark mode
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
      });
      
      const darkTextColors = await page.evaluate(() => {
        const p = document.querySelector('p');
        return p ? window.getComputedStyle(p).color : null;
      });
      
      await percyEnhanced.snapshot(page, 'text-colors-dark');
      
      // Ensure text colors are different
      expect(lightTextColors).not.toBe(darkTextColors);
    });
  });
  
  test.describe('Responsive Theme Behavior', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'wide', width: 1920, height: 1080 }
    ];
    
    viewports.forEach(viewport => {
      test(`Theme at ${viewport.name} viewport`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        
        // Validate theme elements are responsive
        const themeElements = await page.evaluate(() => {
          const elements = {};
          ['.glassmorphic-card', '.gradient-turquoise', 'button'].forEach(selector => {
            const el = document.querySelector(selector);
            if (el) {
              const rect = el.getBoundingClientRect();
              elements[selector] = {
                width: rect.width,
                height: rect.height,
                visible: rect.width > 0 && rect.height > 0
              };
            }
          });
          return elements;
        });
        
        Object.values(themeElements).forEach((element: any) => {
          if (element) {
            expect(element.visible).toBeTruthy();
          }
        });
        
        await percyEnhanced.snapshot(page, `responsive-theme-${viewport.name}`);
      });
    });
  });
  
  test.describe('Animation and Transitions', () => {
    test('Hover Animations', async ({ page }) => {
      await page.goto('/');
      
      const animatedElements = page.locator('[class*="hover:"], [class*="transition"]');
      const elementCount = await animatedElements.count();
      
      for (let i = 0; i < Math.min(elementCount, 3); i++) {
        const element = animatedElements.nth(i);
        
        // Before hover
        await percyEnhanced.snapshot(page, `animation-before-hover-${i}`);
        
        // During hover
        await element.hover();
        await page.waitForTimeout(300); // Wait for transition
        await percyEnhanced.snapshot(page, `animation-during-hover-${i}`);
      }
    });
    
    test('Loading Animations', async ({ page }) => {
      await page.goto('/events');
      
      // Find loading spinners or skeletons
      const loaders = page.locator('.loading, .skeleton, [class*="animate-"]');
      if (await loaders.count() > 0) {
        await percyEnhanced.snapshot(page, 'theme-loading-animations');
      }
    });
  });
  
  test.describe('Theme Edge Cases', () => {
    test('Long Content Scrolling', async ({ page }) => {
      await page.goto('/timeline');
      
      // Scroll to different positions
      await page.evaluate(() => window.scrollTo(0, 0));
      await percyEnhanced.snapshot(page, 'theme-scroll-top');
      
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await percyEnhanced.snapshot(page, 'theme-scroll-middle');
      
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await percyEnhanced.snapshot(page, 'theme-scroll-bottom');
    });
    
    test('Modal and Overlay Theming', async ({ page }) => {
      await page.goto('/events');
      
      // Try to open a modal
      const modalTrigger = page.locator('[data-testid*="modal"], [data-testid*="dialog"]').first();
      if (await modalTrigger.count() > 0) {
        await modalTrigger.click();
        await page.waitForTimeout(500);
        
        const modal = page.locator('.modal, [role="dialog"]').first();
        if (await modal.count() > 0) {
          await percyEnhanced.snapshot(page, 'theme-modal-overlay');
        }
      }
    });
    
    test('Error State Theming', async ({ page }) => {
      await page.goto('/auth/register');
      
      // Submit empty form to trigger errors
      const submitButton = page.locator('[type="submit"]').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(500);
        
        await percyEnhanced.snapshot(page, 'theme-error-states');
      }
    });
  });
});