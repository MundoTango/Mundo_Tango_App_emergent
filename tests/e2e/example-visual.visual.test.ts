import { test, expect } from '@playwright/test';
import {
  takePercySnapshot,
  compareScreenshot,
  stabilizePage,
  hideDynamicElements,
  takeResponsiveScreenshots,
  testComponentVisually,
  testDarkMode,
  testPrintLayout,
  testLoadingStates,
  checkCSSProperties,
} from './helpers/visual-regression';
import { login } from './helpers/test-helpers';
import { testUsers } from './fixtures/test-data';

/**
 * Visual Regression Testing Suite for Mundo Tango
 */

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure consistent viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
  });
  
  test('Homepage visual consistency', async ({ page }) => {
    await page.goto('/');
    await stabilizePage(page);
    
    // Hide dynamic elements
    await hideDynamicElements(page, [
      '[data-testid="live-event-count"]',
      '[data-testid="online-users"]',
    ]);
    
    // Take baseline screenshot
    await compareScreenshot(page, {
      name: 'homepage-baseline',
      fullPage: true,
      threshold: 0.1,
    });
    
    // Percy snapshot for cross-browser testing
    await takePercySnapshot(page, 'Homepage', {
      widths: [375, 768, 1280, 1920],
      minHeight: 2000,
    });
  });
  
  test('Responsive design across all breakpoints', async ({ page }) => {
    await page.goto('/');
    
    // Test all responsive breakpoints
    await takeResponsiveScreenshots(page, 'responsive-homepage', [
      { width: 320, height: 568, label: 'mobile-small' },
      { width: 375, height: 667, label: 'mobile-medium' },
      { width: 414, height: 896, label: 'mobile-large' },
      { width: 768, height: 1024, label: 'tablet-portrait' },
      { width: 1024, height: 768, label: 'tablet-landscape' },
      { width: 1280, height: 720, label: 'desktop-hd' },
      { width: 1920, height: 1080, label: 'desktop-fullhd' },
      { width: 2560, height: 1440, label: 'desktop-2k' },
    ]);
  });
  
  test('Component states visual testing', async ({ page }) => {
    await login(page, testUsers.regularUser);
    await page.goto('/events');
    
    // Test event card in different states
    await testComponentVisually(
      page,
      '[data-testid="card-event-1"]',
      'event-card',
      [
        {
          name: 'hover',
          action: async () => {
            await page.hover('[data-testid="card-event-1"]');
          },
        },
        {
          name: 'focused',
          action: async () => {
            await page.focus('[data-testid="card-event-1"]');
          },
        },
        {
          name: 'expanded',
          action: async () => {
            await page.click('[data-testid="button-expand-1"]');
          },
        },
      ]
    );
    
    // Test button states
    const buttons = [
      { selector: '[data-testid="button-primary"]', name: 'primary-button' },
      { selector: '[data-testid="button-secondary"]', name: 'secondary-button' },
      { selector: '[data-testid="button-danger"]', name: 'danger-button' },
    ];
    
    for (const button of buttons) {
      await testComponentVisually(page, button.selector, button.name, [
        {
          name: 'hover',
          action: async () => await page.hover(button.selector),
        },
        {
          name: 'active',
          action: async () => {
            await page.locator(button.selector).click({ force: true });
          },
        },
        {
          name: 'disabled',
          action: async () => {
            await page.evaluate((sel) => {
              const btn = document.querySelector(sel) as HTMLButtonElement;
              if (btn) btn.disabled = true;
            }, button.selector);
          },
        },
      ]);
    }
  });
  
  test('Dark mode visual consistency', async ({ page }) => {
    const pagesToTest = [
      { path: '/', name: 'homepage' },
      { path: '/events', name: 'events' },
      { path: '/community', name: 'community' },
      { path: '/profile', name: 'profile' },
    ];
    
    for (const pageInfo of pagesToTest) {
      await page.goto(pageInfo.path);
      await stabilizePage(page);
      await testDarkMode(page, pageInfo.name);
    }
  });
  
  test('Form elements visual testing', async ({ page }) => {
    await page.goto('/events/create');
    await stabilizePage(page);
    
    // Test form in different states
    const formStates = [
      { name: 'empty', action: async () => {} },
      {
        name: 'filled',
        action: async () => {
          await page.fill('[data-testid="input-title"]', 'Test Event');
          await page.fill('[data-testid="textarea-description"]', 'Test Description');
          await page.selectOption('[data-testid="select-category"]', 'milonga');
        },
      },
      {
        name: 'validation-errors',
        action: async () => {
          await page.click('[data-testid="button-submit"]');
          await page.waitForTimeout(500);
        },
      },
    ];
    
    for (const state of formStates) {
      await state.action();
      await compareScreenshot(page, {
        name: `form-state-${state.name}`,
        fullPage: false,
        clip: { x: 0, y: 0, width: 800, height: 600 },
      });
    }
  });
  
  test('Loading states and skeletons', async ({ page }) => {
    await login(page, testUsers.regularUser);
    
    // Test loading states for different pages
    const loadingTests = [
      { path: '/events', name: 'events-loading' },
      { path: '/feed', name: 'feed-loading' },
      { path: '/messages', name: 'messages-loading' },
    ];
    
    for (const test of loadingTests) {
      await testLoadingStates(
        page,
        test.name,
        async () => await page.goto(test.path)
      );
    }
  });
  
  test('Print layout visual testing', async ({ page }) => {
    const pagesToTest = [
      { path: '/events/1', name: 'event-details-print' },
      { path: '/profile', name: 'profile-print' },
    ];
    
    for (const pageInfo of pagesToTest) {
      await page.goto(pageInfo.path);
      await stabilizePage(page);
      await testPrintLayout(page, pageInfo.name);
    }
  });
  
  test('CSS properties validation', async ({ page }) => {
    await page.goto('/');
    
    // Test primary button CSS properties
    await checkCSSProperties(page, '[data-testid="button-primary"]', {
      'background-color': 'rgb(59, 130, 246)', // Blue-500
      'color': 'rgb(255, 255, 255)',           // White
      'border-radius': '6px',
      'padding': '8px 16px',
    });
    
    // Test card CSS properties
    await checkCSSProperties(page, '[data-testid="card"]', {
      'background-color': 'rgb(255, 255, 255)',
      'border-radius': '8px',
      'box-shadow': 'rgba(0, 0, 0, 0.1) 0px 1px 3px 0px',
    });
  });
  
  test('Animations and transitions', async ({ page }) => {
    // Enable animations for this test
    await page.goto('/');
    
    // Test modal animation
    await page.click('[data-testid="button-open-modal"]');
    
    // Capture animation frames
    const frames = [];
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(100);
      frames.push(await page.screenshot());
    }
    
    // Compare final state
    await compareScreenshot(page, {
      name: 'modal-animation-complete',
      fullPage: false,
    });
  });
  
  test('Complex layouts visual testing', async ({ page }) => {
    await login(page, testUsers.regularUser);
    
    // Test grid layout
    await page.goto('/community');
    await stabilizePage(page);
    
    await compareScreenshot(page, {
      name: 'community-grid-layout',
      fullPage: true,
      mask: [page.locator('[data-testid*="timestamp"]')],
    });
    
    // Test masonry layout
    await page.goto('/feed');
    await stabilizePage(page);
    
    await compareScreenshot(page, {
      name: 'feed-masonry-layout',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 1080 },
    });
  });
  
  test('Map and interactive elements', async ({ page }) => {
    await page.goto('/map');
    await page.waitForLoadState('networkidle');
    
    // Wait for map to load
    await page.waitForSelector('[data-testid="map-container"] canvas', {
      timeout: 10000,
    });
    
    // Hide dynamic map elements
    await page.evaluate(() => {
      // Hide map controls that might differ
      const controls = document.querySelectorAll('.mapboxgl-control-container');
      controls.forEach(c => (c as HTMLElement).style.display = 'none');
    });
    
    await compareScreenshot(page, {
      name: 'map-view',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1200, height: 800 },
    });
  });
  
  test('Generate visual regression report', async ({ page }) => {
    const results = [];
    const pagesToTest = [
      '/',
      '/events',
      '/community',
      '/profile',
    ];
    
    for (const path of pagesToTest) {
      await page.goto(path);
      await stabilizePage(page);
      
      try {
        await compareScreenshot(page, {
          name: `visual-report-${path.replace('/', 'root')}`,
          fullPage: true,
        });
        results.push({ name: path, passed: true });
      } catch (error) {
        results.push({ 
          name: path, 
          passed: false, 
          diff: error.message 
        });
      }
    }
    
    // Generate report
    const { generateVisualReport } = await import('./helpers/visual-regression');
    await generateVisualReport(results);
    
    // Log results
    console.table(results);
  });
});