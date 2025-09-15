/**
 * Mundo Tango Visual Regression Tests with Percy
 * Comprehensive visual testing for all critical pages
 */

import { test, expect } from '@playwright/test';
import percySnapshot from '@percy/playwright';

// Helper to wait for page stability
async function waitForPageStability(page) {
  // Wait for network to be idle
  await page.waitForLoadState('networkidle');
  
  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);
  
  // Wait for any animations to complete
  await page.waitForTimeout(500);
  
  // Hide dynamic content
  await page.addStyleTag({
    content: `
      .timestamp, .relative-time, .loading-skeleton {
        visibility: hidden !important;
      }
      *, *::before, *::after {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
      }
    `
  });
}

test.describe('Mundo Tango Visual Regression - Core Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('Homepage - Light Mode', async ({ page }) => {
    await page.goto('/');
    await waitForPageStability(page);
    await percySnapshot(page, 'Homepage - Light Mode', {
      widths: [375, 768, 1280, 1920],
      minHeight: 1024
    });
  });

  test('Homepage - Dark Mode', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    });
    await waitForPageStability(page);
    await percySnapshot(page, 'Homepage - Dark Mode', {
      widths: [375, 768, 1280, 1920],
      minHeight: 1024
    });
  });

  test('Registration Page', async ({ page }) => {
    await page.goto('/auth/register');
    await waitForPageStability(page);
    await percySnapshot(page, 'Registration Page', {
      widths: [375, 768, 1280],
      minHeight: 800
    });
  });

  test('Login Page', async ({ page }) => {
    await page.goto('/auth/login');
    await waitForPageStability(page);
    await percySnapshot(page, 'Login Page', {
      widths: [375, 768, 1280],
      minHeight: 600
    });
  });
});

test.describe('Mundo Tango Visual Regression - Guest Onboarding', () => {
  test('Guest Onboarding - Welcome', async ({ page }) => {
    await page.goto('/guest-onboarding');
    await waitForPageStability(page);
    await percySnapshot(page, 'Guest Onboarding - Welcome', {
      widths: [375, 768, 1280],
      minHeight: 800
    });
  });

  test('Guest Onboarding - Profile Setup', async ({ page }) => {
    await page.goto('/guest-onboarding');
    await page.click('[data-testid="button-continue"]');
    await waitForPageStability(page);
    await percySnapshot(page, 'Guest Onboarding - Profile Setup', {
      widths: [375, 768, 1280],
      minHeight: 800
    });
  });

  test('Guest Onboarding - Preferences', async ({ page }) => {
    await page.goto('/guest-onboarding');
    await page.click('[data-testid="button-continue"]');
    await page.waitForTimeout(500);
    await page.click('[data-testid="button-continue"]');
    await waitForPageStability(page);
    await percySnapshot(page, 'Guest Onboarding - Preferences', {
      widths: [375, 768, 1280],
      minHeight: 800
    });
  });
});

test.describe('Mundo Tango Visual Regression - Main Features', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/api/auth/session', route => {
      route.fulfill({
        status: 200,
        json: {
          user: {
            id: '1',
            email: 'test@mundotango.com',
            name: 'Test User',
            role: 'guest'
          }
        }
      });
    });
  });

  test('Events Page - Grid View', async ({ page }) => {
    await page.goto('/events');
    await waitForPageStability(page);
    await percySnapshot(page, 'Events Page - Grid View', {
      widths: [375, 768, 1280, 1920],
      minHeight: 1024
    });
  });

  test('Events Page - List View', async ({ page }) => {
    await page.goto('/events?view=list');
    await waitForPageStability(page);
    await percySnapshot(page, 'Events Page - List View', {
      widths: [375, 768, 1280],
      minHeight: 1024
    });
  });

  test('Profile Page', async ({ page }) => {
    await page.goto('/profile');
    await waitForPageStability(page);
    await percySnapshot(page, 'Profile Page', {
      widths: [375, 768, 1280],
      minHeight: 1024
    });
  });

  test('Community Page', async ({ page }) => {
    await page.goto('/community');
    await waitForPageStability(page);
    await percySnapshot(page, 'Community Page', {
      widths: [375, 768, 1280, 1920],
      minHeight: 1024
    });
  });

  test('Timeline Page', async ({ page }) => {
    await page.goto('/timeline');
    await waitForPageStability(page);
    await percySnapshot(page, 'Timeline Page', {
      widths: [375, 768, 1280],
      minHeight: 1024
    });
  });
});

test.describe('Mundo Tango Visual Regression - Mobile Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
  });

  test('Mobile Menu - Closed', async ({ page }) => {
    await page.goto('/');
    await waitForPageStability(page);
    await percySnapshot(page, 'Mobile Menu - Closed', {
      widths: [375],
      minHeight: 812
    });
  });

  test('Mobile Menu - Open', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="button-mobile-menu"]');
    await page.waitForTimeout(300); // Wait for menu animation
    await waitForPageStability(page);
    await percySnapshot(page, 'Mobile Menu - Open', {
      widths: [375],
      minHeight: 812
    });
  });

  test('Mobile Events Carousel', async ({ page }) => {
    await page.goto('/events');
    await waitForPageStability(page);
    await percySnapshot(page, 'Mobile Events Carousel', {
      widths: [375],
      minHeight: 812
    });
  });
});

test.describe('Mundo Tango Visual Regression - Form States', () => {
  test('Registration Form - Empty', async ({ page }) => {
    await page.goto('/auth/register');
    await waitForPageStability(page);
    await percySnapshot(page, 'Registration Form - Empty', {
      widths: [375, 768, 1280]
    });
  });

  test('Registration Form - Validation Errors', async ({ page }) => {
    await page.goto('/auth/register');
    await page.click('[data-testid="button-submit"]');
    await page.waitForTimeout(500); // Wait for validation
    await waitForPageStability(page);
    await percySnapshot(page, 'Registration Form - Validation Errors', {
      widths: [375, 768, 1280]
    });
  });

  test('Registration Form - Filled', async ({ page }) => {
    await page.goto('/auth/register');
    await page.fill('[data-testid="input-name"]', 'John Doe');
    await page.fill('[data-testid="input-email"]', 'john@example.com');
    await page.fill('[data-testid="input-password"]', 'SecurePass123!');
    await page.fill('[data-testid="input-confirm-password"]', 'SecurePass123!');
    await waitForPageStability(page);
    await percySnapshot(page, 'Registration Form - Filled', {
      widths: [375, 768, 1280]
    });
  });
});

test.describe('Mundo Tango Visual Regression - Loading States', () => {
  test('Events Page - Loading', async ({ page }) => {
    // Slow down network to capture loading state
    await page.route('**/api/events', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          json: { events: [] }
        });
      }, 2000);
    });
    
    await page.goto('/events');
    await page.waitForTimeout(500); // Capture during loading
    await percySnapshot(page, 'Events Page - Loading', {
      widths: [375, 768, 1280]
    });
  });

  test('Profile Page - Loading', async ({ page }) => {
    await page.route('**/api/profile', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          json: { profile: {} }
        });
      }, 2000);
    });
    
    await page.goto('/profile');
    await page.waitForTimeout(500); // Capture during loading
    await percySnapshot(page, 'Profile Page - Loading', {
      widths: [375, 768, 1280]
    });
  });
});

test.describe('Mundo Tango Visual Regression - Ocean Theme Elements', () => {
  test('Ocean Theme - Buttons', async ({ page }) => {
    await page.goto('/');
    await waitForPageStability(page);
    
    // Focus on button section
    const buttonSection = await page.locator('.button-showcase');
    if (await buttonSection.count() > 0) {
      await percySnapshot(page, 'Ocean Theme - Buttons', {
        widths: [1280],
        scope: '.button-showcase'
      });
    }
  });

  test('Ocean Theme - Cards', async ({ page }) => {
    await page.goto('/events');
    await waitForPageStability(page);
    
    // Focus on card elements
    await percySnapshot(page, 'Ocean Theme - Cards', {
      widths: [375, 768, 1280],
      scope: '.events-grid'
    });
  });

  test('Ocean Theme - Forms', async ({ page }) => {
    await page.goto('/auth/register');
    await waitForPageStability(page);
    
    // Focus on form elements
    await percySnapshot(page, 'Ocean Theme - Forms', {
      widths: [375, 768, 1280],
      scope: '#registration-form'
    });
  });
});