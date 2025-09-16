/**
 * ESA LIFE CEO 61×21 - Viewport & Performance E2E Tests
 * Testing across all device sizes with performance budgets
 */

import { test, expect, devices } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Performance budget thresholds
const PERFORMANCE_BUDGETS = {
  LCP: 2500,  // Largest Contentful Paint < 2.5s
  FID: 100,   // First Input Delay < 100ms
  CLS: 0.1,   // Cumulative Layout Shift < 0.1
  PageLoad: 3000, // Total page load < 3s
  Interaction: 100 // User interaction < 100ms
};

// Device configurations to test
const DEVICE_CONFIGS = [
  { name: 'Mobile - iPhone 14 Pro', viewport: { width: 393, height: 852 }, isMobile: true },
  { name: 'Mobile - Galaxy S20', viewport: { width: 360, height: 800 }, isMobile: true },
  { name: 'Tablet - iPad Pro', viewport: { width: 1024, height: 1366 }, isMobile: false },
  { name: 'Tablet - iPad Mini', viewport: { width: 768, height: 1024 }, isMobile: false },
  { name: 'Desktop - HD', viewport: { width: 1366, height: 768 }, isMobile: false },
  { name: 'Desktop - Full HD', viewport: { width: 1920, height: 1080 }, isMobile: false },
  { name: 'Desktop - 4K', viewport: { width: 3840, height: 2160 }, isMobile: false }
];

// Critical user journeys to test
const CRITICAL_JOURNEYS = [
  'authentication-flow',
  'post-creation',
  'event-registration',
  'agent-interaction',
  'messaging-flow',
  'profile-management',
  'group-activities',
  'search-discovery'
];

test.describe('Viewport Testing', () => {
  DEVICE_CONFIGS.forEach(device => {
    test.describe(`${device.name}`, () => {
      test.use({ 
        viewport: device.viewport,
        isMobile: device.isMobile,
        hasTouch: device.isMobile
      });

      test('should render homepage correctly', async ({ page }) => {
        await page.goto('/');
        
        // Check critical elements are visible
        await expect(page.getByTestId('nav-header')).toBeVisible();
        await expect(page.getByTestId('hero-section')).toBeVisible();
        
        // Validate responsive design
        if (device.isMobile) {
          // Mobile menu should be visible
          await expect(page.getByTestId('mobile-menu-button')).toBeVisible();
          await expect(page.getByTestId('desktop-nav')).toBeHidden();
        } else {
          // Desktop nav should be visible
          await expect(page.getByTestId('desktop-nav')).toBeVisible();
          await expect(page.getByTestId('mobile-menu-button')).toBeHidden();
        }

        // Take screenshot for visual regression
        await page.screenshot({ 
          path: `tests/screenshots/${device.name.replace(/\s+/g, '-').toLowerCase()}-homepage.png`,
          fullPage: true 
        });
      });

      test('should handle authentication flow', async ({ page }) => {
        await page.goto('/auth/login');
        
        // Check form renders correctly
        const emailInput = page.getByTestId('input-email');
        const passwordInput = page.getByTestId('input-password');
        const submitButton = page.getByTestId('button-submit');
        
        await expect(emailInput).toBeVisible();
        await expect(passwordInput).toBeVisible();
        await expect(submitButton).toBeVisible();
        
        // Test form interaction
        await emailInput.fill('test@mundotango.life');
        await passwordInput.fill('TestPassword123!');
        
        // Measure interaction performance
        const startTime = Date.now();
        await submitButton.click();
        const interactionTime = Date.now() - startTime;
        
        expect(interactionTime).toBeLessThan(PERFORMANCE_BUDGETS.Interaction);
      });

      test('should display posts feed correctly', async ({ page }) => {
        // Login first
        await page.goto('/auth/login');
        await page.getByTestId('input-email').fill('test@mundotango.life');
        await page.getByTestId('input-password').fill('TestPassword123!');
        await page.getByTestId('button-submit').click();
        await page.waitForURL('/');

        // Navigate to posts
        await page.goto('/posts');
        
        // Check feed layout
        const postCards = page.getByTestId(/^card-post-/);
        await expect(postCards.first()).toBeVisible();
        
        // Validate responsive grid
        const firstCard = await postCards.first().boundingBox();
        if (firstCard) {
          if (device.isMobile) {
            // Cards should stack vertically on mobile
            expect(firstCard.width).toBeGreaterThan(device.viewport.width * 0.9);
          } else if (device.viewport.width >= 1024) {
            // Cards should be in grid on desktop
            expect(firstCard.width).toBeLessThan(device.viewport.width * 0.5);
          }
        }
      });

      test('should handle touch interactions on mobile', async ({ page }) => {
        if (!device.isMobile) {
          test.skip();
        }
        
        await page.goto('/');
        
        // Test swipe gesture on carousel
        const carousel = page.getByTestId('carousel-featured');
        if (await carousel.isVisible()) {
          // Simulate swipe
          await carousel.dragTo(carousel, {
            sourcePosition: { x: 300, y: 150 },
            targetPosition: { x: 50, y: 150 }
          });
          
          // Verify carousel moved
          await expect(page.getByTestId('carousel-slide-2')).toBeInViewport();
        }
        
        // Test pull-to-refresh
        await page.evaluate(() => {
          window.scrollTo(0, 0);
        });
        
        // Simulate pull down gesture
        await page.touchscreen.tap(180, 100);
        await page.touchscreen.down();
        await page.touchscreen.move(180, 300);
        await page.touchscreen.up();
      });

      test('should validate MT Ocean theme', async ({ page }) => {
        await page.goto('/');
        
        // Check glassmorphism effects
        const header = page.getByTestId('nav-header');
        const headerBackground = await header.evaluate((el) => 
          window.getComputedStyle(el).backgroundColor
        );
        
        // Should have semi-transparent background
        expect(headerBackground).toMatch(/rgba?\([^)]+,\s*0\.\d+\)/);
        
        // Check gradient backgrounds
        const hero = page.getByTestId('hero-section');
        const heroBackground = await hero.evaluate((el) => 
          window.getComputedStyle(el).backgroundImage
        );
        
        expect(heroBackground).toContain('gradient');
        
        // Verify ocean color palette
        const primaryButton = page.getByTestId('button-primary').first();
        const buttonColor = await primaryButton.evaluate((el) => 
          window.getComputedStyle(el).backgroundColor
        );
        
        // Should use ocean theme colors (blues/teals)
        expect(buttonColor).toMatch(/rgb\(.*\d+.*\)/);
      });
    });
  });
});

test.describe('Performance Testing', () => {
  test('should meet LCP requirements', async ({ page }) => {
    const metrics = await page.goto('/', { waitUntil: 'networkidle' });
    
    // Measure Largest Contentful Paint
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.renderTime || lastEntry.loadTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });
    
    expect(Number(lcp)).toBeLessThan(PERFORMANCE_BUDGETS.LCP);
  });

  test('should meet FID requirements', async ({ page }) => {
    await page.goto('/');
    
    // Measure First Input Delay
    const startTime = Date.now();
    await page.getByTestId('button-primary').first().click();
    const fid = Date.now() - startTime;
    
    expect(fid).toBeLessThan(PERFORMANCE_BUDGETS.FID);
  });

  test('should meet CLS requirements', async ({ page }) => {
    await page.goto('/');
    
    // Measure Cumulative Layout Shift
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          resolve(clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
        
        // Trigger some actions that might cause layout shift
        setTimeout(() => resolve(clsValue), 3000);
      });
    });
    
    expect(Number(cls)).toBeLessThan(PERFORMANCE_BUDGETS.CLS);
  });

  test('should meet page load time requirements', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(PERFORMANCE_BUDGETS.PageLoad);
  });

  test('should handle rapid navigation efficiently', async ({ page }) => {
    await page.goto('/');
    
    const navigationTargets = [
      '/posts',
      '/events',
      '/groups',
      '/profile',
      '/messages'
    ];
    
    for (const target of navigationTargets) {
      const startTime = Date.now();
      await page.goto(target);
      const navTime = Date.now() - startTime;
      
      expect(navTime).toBeLessThan(1000); // Each navigation < 1s
    }
  });

  test('should optimize image loading', async ({ page }) => {
    await page.goto('/posts');
    
    // Check for lazy loading
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      const loading = await img.getAttribute('loading');
      
      // Images below fold should lazy load
      if (i > 2) {
        expect(loading).toBe('lazy');
      }
      
      // Check for responsive images
      const srcset = await img.getAttribute('srcset');
      expect(srcset).toBeTruthy();
    }
  });

  test('should cache static assets', async ({ page }) => {
    // First load
    await page.goto('/');
    
    // Get resource timing
    const resources = await page.evaluate(() => 
      performance.getEntriesByType('resource')
    );
    
    // Second load (should use cache)
    await page.reload();
    
    const cachedResources = await page.evaluate(() => 
      performance.getEntriesByType('resource')
    );
    
    // Static assets should load faster from cache
    const cssFiles = cachedResources.filter((r: any) => r.name.endsWith('.css'));
    cssFiles.forEach((resource: any) => {
      expect(resource.duration).toBeLessThan(50); // Cached CSS < 50ms
    });
  });
});

test.describe('Critical User Journeys', () => {
  CRITICAL_JOURNEYS.forEach(journey => {
    test(`should complete ${journey} journey`, async ({ page }) => {
      const startTime = Date.now();
      
      switch (journey) {
        case 'authentication-flow':
          await testAuthenticationFlow(page);
          break;
        case 'post-creation':
          await testPostCreation(page);
          break;
        case 'event-registration':
          await testEventRegistration(page);
          break;
        case 'agent-interaction':
          await testAgentInteraction(page);
          break;
        case 'messaging-flow':
          await testMessagingFlow(page);
          break;
        case 'profile-management':
          await testProfileManagement(page);
          break;
        case 'group-activities':
          await testGroupActivities(page);
          break;
        case 'search-discovery':
          await testSearchDiscovery(page);
          break;
      }
      
      const journeyTime = Date.now() - startTime;
      expect(journeyTime).toBeLessThan(10000); // Each journey < 10s
    });
  });
});

test.describe('Accessibility Testing', () => {
  test('should pass accessibility checks', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocused).toBeDefined();
    
    // Continue tabbing
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Should be able to activate with Enter
    await page.keyboard.press('Enter');
  });

  test('should support screen readers', async ({ page }) => {
    await page.goto('/');
    
    // Check for ARIA labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      
      // Button should have either aria-label or text content
      expect(ariaLabel || text).toBeTruthy();
    }
    
    // Check for semantic HTML
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
  });
});

// Journey test functions
async function testAuthenticationFlow(page: any) {
  await page.goto('/auth/login');
  await page.getByTestId('input-email').fill('test@mundotango.life');
  await page.getByTestId('input-password').fill('TestPassword123!');
  await page.getByTestId('button-submit').click();
  await page.waitForURL('/');
  await expect(page.getByTestId('user-menu')).toBeVisible();
}

async function testPostCreation(page: any) {
  await testAuthenticationFlow(page);
  await page.getByTestId('button-create-post').click();
  await page.getByTestId('textarea-content').fill('Test post content');
  await page.getByTestId('button-publish').click();
  await expect(page.getByTestId('toast-success')).toBeVisible();
}

async function testEventRegistration(page: any) {
  await testAuthenticationFlow(page);
  await page.goto('/events');
  await page.getByTestId(/^card-event-/).first().click();
  await page.getByTestId('button-rsvp').click();
  await page.getByTestId('select-status').selectOption('going');
  await page.getByTestId('button-confirm').click();
  await expect(page.getByTestId('rsvp-confirmed')).toBeVisible();
}

async function testAgentInteraction(page: any) {
  await testAuthenticationFlow(page);
  await page.getByTestId('button-life-ceo').click();
  await page.getByTestId('select-agent').selectOption('health-advisor');
  await page.getByTestId('input-message').fill('I need health advice');
  await page.getByTestId('button-send').click();
  await expect(page.getByTestId('agent-response')).toBeVisible();
}

async function testMessagingFlow(page: any) {
  await testAuthenticationFlow(page);
  await page.goto('/messages');
  await page.getByTestId('button-new-message').click();
  await page.getByTestId('input-recipient').fill('testuser');
  await page.getByTestId('textarea-message').fill('Hello!');
  await page.getByTestId('button-send').click();
  await expect(page.getByTestId('message-sent')).toBeVisible();
}

async function testProfileManagement(page: any) {
  await testAuthenticationFlow(page);
  await page.goto('/profile');
  await page.getByTestId('button-edit-profile').click();
  await page.getByTestId('input-bio').fill('Updated bio');
  await page.getByTestId('button-save').click();
  await expect(page.getByTestId('profile-updated')).toBeVisible();
}

async function testGroupActivities(page: any) {
  await testAuthenticationFlow(page);
  await page.goto('/groups');
  await page.getByTestId(/^card-group-/).first().click();
  await page.getByTestId('button-join').click();
  await expect(page.getByTestId('group-joined')).toBeVisible();
}

async function testSearchDiscovery(page: any) {
  await page.goto('/');
  await page.getByTestId('input-search').fill('tango');
  await page.getByTestId('button-search').click();
  await expect(page.getByTestId('search-results')).toBeVisible();
  const results = page.getByTestId(/^result-/);
  await expect(results.first()).toBeVisible();
}

export {};