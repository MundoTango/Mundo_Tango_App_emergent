/**
 * ESA Layer 51 - Mobile-Specific Visual Regression Tests
 * MT Ocean Theme Mobile Validation
 */

import { test, devices } from '@playwright/test';
import { percyEnhanced } from '../percy-enhanced';

const MOBILE_DEVICES = [
  { name: 'iPhone SE', device: devices['iPhone SE'] },
  { name: 'iPhone 12', device: devices['iPhone 12'] },
  { name: 'iPhone 14 Pro', device: devices['iPhone 14 Pro'] },
  { name: 'Pixel 5', device: devices['Pixel 5'] },
  { name: 'Pixel 7', device: devices['Pixel 7'] },
  { name: 'Galaxy S8', device: devices['Galaxy S8+'] },
  { name: 'Galaxy S20', device: devices['Galaxy S20'] }
];

test.describe('Mobile Visual Regression - MT Ocean Theme', () => {
  MOBILE_DEVICES.forEach(({ name, device }) => {
    test.describe(`Device: ${name}`, () => {
      test.use(device);
      
      test('Mobile Homepage', async ({ page }) => {
        await page.goto('/');
        await percyEnhanced.snapshot(page, `mobile-${name.toLowerCase().replace(' ', '-')}-homepage`);
      });
      
      test('Mobile Navigation Menu', async ({ page }) => {
        await page.goto('/');
        
        // Capture closed menu state
        await percyEnhanced.snapshot(page, `mobile-${name.toLowerCase().replace(' ', '-')}-nav-closed`);
        
        // Open mobile menu
        const menuButton = page.locator('[data-testid="button-mobile-menu"]');
        if (await menuButton.count() > 0) {
          await menuButton.click();
          await page.waitForTimeout(300);
          await percyEnhanced.snapshot(page, `mobile-${name.toLowerCase().replace(' ', '-')}-nav-open`);
        }
      });
      
      test('Mobile Events Grid', async ({ page }) => {
        await page.goto('/events');
        await percyEnhanced.snapshot(page, `mobile-${name.toLowerCase().replace(' ', '-')}-events-grid`);
      });
      
      test('Mobile Profile Page', async ({ page }) => {
        await page.goto('/profile');
        await percyEnhanced.snapshot(page, `mobile-${name.toLowerCase().replace(' ', '-')}-profile`);
      });
      
      test('Mobile Form Interaction', async ({ page }) => {
        await page.goto('/auth/login');
        
        // Empty form
        await percyEnhanced.snapshot(page, `mobile-${name.toLowerCase().replace(' ', '-')}-login-empty`);
        
        // Focus on input
        const emailInput = page.locator('input[type="email"], input[name="email"]').first();
        if (await emailInput.count() > 0) {
          await emailInput.focus();
          await percyEnhanced.snapshot(page, `mobile-${name.toLowerCase().replace(' ', '-')}-login-focused`);
        }
      });
    });
  });
  
  test.describe('Mobile-Specific Interactions', () => {
    test.use(devices['iPhone 12']);
    
    test('Swipe Gestures - Event Carousel', async ({ page }) => {
      await page.goto('/events');
      
      // Find carousel element
      const carousel = page.locator('.event-carousel, .swiper, [data-testid*="carousel"]').first();
      if (await carousel.count() > 0) {
        // Initial state
        await percyEnhanced.snapshot(page, 'mobile-carousel-initial');
        
        // Simulate swipe
        const box = await carousel.boundingBox();
        if (box) {
          await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
          await page.mouse.down();
          await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
          await page.mouse.up();
          await page.waitForTimeout(500);
          
          await percyEnhanced.snapshot(page, 'mobile-carousel-swiped');
        }
      }
    });
    
    test('Pull-to-Refresh', async ({ page }) => {
      await page.goto('/timeline');
      
      // Scroll to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      
      // Simulate pull-to-refresh gesture
      await page.evaluate(() => {
        const event = new CustomEvent('pulltorefresh');
        window.dispatchEvent(event);
      });
      
      await percyEnhanced.snapshot(page, 'mobile-pull-to-refresh');
    });
    
    test('Bottom Navigation Bar', async ({ page }) => {
      await page.goto('/');
      
      // Check for bottom navigation
      const bottomNav = page.locator('.bottom-nav, .mobile-tab-bar, [data-testid="bottom-navigation"]').first();
      if (await bottomNav.count() > 0) {
        await percyEnhanced.snapshot(page, 'mobile-bottom-navigation');
        
        // Test each tab
        const tabs = bottomNav.locator('button, a');
        const tabCount = await tabs.count();
        
        for (let i = 0; i < Math.min(tabCount, 5); i++) {
          await tabs.nth(i).click();
          await page.waitForTimeout(300);
          await percyEnhanced.snapshot(page, `mobile-bottom-nav-tab-${i}`);
        }
      }
    });
    
    test('Mobile Search', async ({ page }) => {
      await page.goto('/search');
      
      // Closed search
      await percyEnhanced.snapshot(page, 'mobile-search-closed');
      
      // Open search
      const searchInput = page.locator('input[type="search"], input[data-testid*="search"]').first();
      if (await searchInput.count() > 0) {
        await searchInput.focus();
        await percyEnhanced.snapshot(page, 'mobile-search-focused');
        
        // Type search query
        await searchInput.type('tango');
        await page.waitForTimeout(500);
        await percyEnhanced.snapshot(page, 'mobile-search-results');
      }
    });
    
    test('Mobile Modal/Sheet', async ({ page }) => {
      await page.goto('/events');
      
      // Find and click first event card to open modal
      const eventCard = page.locator('.event-card, [data-testid*="event-card"]').first();
      if (await eventCard.count() > 0) {
        await eventCard.click();
        await page.waitForTimeout(500);
        
        const modal = page.locator('.modal, .sheet, [role="dialog"]').first();
        if (await modal.count() > 0) {
          await percyEnhanced.snapshot(page, 'mobile-modal-open');
        }
      }
    });
  });
  
  test.describe('Mobile Orientation Changes', () => {
    test('Portrait to Landscape', async ({ page }) => {
      await page.goto('/');
      
      // Portrait orientation
      await page.setViewportSize({ width: 375, height: 667 });
      await percyEnhanced.snapshot(page, 'mobile-orientation-portrait');
      
      // Landscape orientation
      await page.setViewportSize({ width: 667, height: 375 });
      await percyEnhanced.snapshot(page, 'mobile-orientation-landscape');
    });
    
    test('Landscape Events View', async ({ page }) => {
      await page.setViewportSize({ width: 667, height: 375 });
      await page.goto('/events');
      await percyEnhanced.snapshot(page, 'mobile-landscape-events');
    });
  });
  
  test.describe('Mobile Performance', () => {
    test('3G Network - Skeleton Loaders', async ({ page, context }) => {
      // Simulate slow 3G
      await context.route('**/*', route => {
        setTimeout(() => route.continue(), 2000);
      });
      
      await page.goto('/events');
      await page.waitForTimeout(500); // Capture skeleton state
      await percyEnhanced.snapshot(page, 'mobile-3g-loading-skeleton');
    });
    
    test('Offline Mode', async ({ page, context }) => {
      await page.goto('/');
      
      // Go offline
      await context.setOffline(true);
      await page.reload();
      
      await percyEnhanced.snapshot(page, 'mobile-offline-state');
    });
  });
  
  test.describe('Mobile MT Ocean Theme', () => {
    test.use(devices['iPhone 12']);
    
    test('Mobile Glassmorphic Cards', async ({ page }) => {
      await page.goto('/events');
      
      const cards = page.locator('.glassmorphic-card');
      if (await cards.count() > 0) {
        await cards.first().scrollIntoViewIfNeeded();
        await percyEnhanced.snapshot(page, 'mobile-glassmorphic-card', {
          scope: '.glassmorphic-card'
        });
      }
    });
    
    test('Mobile Gradient Elements', async ({ page }) => {
      await page.goto('/');
      
      const gradients = page.locator('.gradient-turquoise');
      if (await gradients.count() > 0) {
        await gradients.first().scrollIntoViewIfNeeded();
        await percyEnhanced.snapshot(page, 'mobile-gradient-turquoise', {
          scope: '.gradient-turquoise'
        });
      }
    });
    
    test('Mobile Touch Interactions', async ({ page }) => {
      await page.goto('/');
      
      // Test touch interactions on buttons
      const button = page.locator('button').first();
      
      // Normal state
      await percyEnhanced.snapshot(page, 'mobile-button-normal');
      
      // Touch/Active state
      await button.tap();
      await percyEnhanced.snapshot(page, 'mobile-button-tapped');
    });
  });
});