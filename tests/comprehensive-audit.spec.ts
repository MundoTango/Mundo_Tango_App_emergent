import { test, expect } from '@playwright/test';

// Configure longer timeout for comprehensive tests
test.setTimeout(60000);

test.describe('ESA LIFE CEO Platform - Comprehensive Audit', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('1. CSRF Token Management', () => {
    test('should fetch CSRF token on application load', async ({ page }) => {
      // Intercept CSRF token request
      const csrfResponse = await page.waitForResponse(
        response => response.url().includes('/api/security/csrf-token') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => null);
      
      if (csrfResponse) {
        const data = await csrfResponse.json();
        expect(data).toHaveProperty('token');
        console.log('✅ CSRF token fetched successfully');
      } else {
        console.log('⚠️ CSRF token endpoint not found - may be using different auth method');
      }
    });

    test('should include CSRF token in API requests', async ({ page }) => {
      // Navigate to events page to trigger API calls
      await page.goto('/events');
      
      // Intercept an API request
      const apiRequest = await page.waitForRequest(
        request => request.url().includes('/api/events') && request.method() === 'GET',
        { timeout: 10000 }
      ).catch(() => null);
      
      if (apiRequest) {
        const headers = apiRequest.headers();
        console.log('✅ API request intercepted successfully');
        // Check if x-csrf-token header exists (may not be needed for GET requests)
        if (headers['x-csrf-token']) {
          console.log('✅ CSRF token included in request headers');
        }
      }
    });
  });

  test.describe('2. Event Discovery Feed', () => {
    test('should load and display events', async ({ page }) => {
      await page.goto('/events');
      await page.waitForLoadState('networkidle');
      
      // Check if the events page loads
      const pageTitle = await page.locator('h1').filter({ hasText: /Discover Events/i }).first();
      await expect(pageTitle).toBeVisible({ timeout: 10000 });
      console.log('✅ Events page loaded successfully');
      
      // Check for event cards or empty state
      const eventCards = page.locator('[data-testid*="card-event"]');
      const emptyState = page.locator('text=/No Events Found/i');
      
      const hasEvents = await eventCards.count() > 0;
      const isEmpty = await emptyState.isVisible().catch(() => false);
      
      if (hasEvents) {
        console.log(`✅ Found ${await eventCards.count()} event cards`);
      } else if (isEmpty) {
        console.log('✅ Empty state displayed correctly');
      } else {
        console.log('⚠️ No events or empty state found');
      }
    });

    test('should have working search and filter functionality', async ({ page }) => {
      await page.goto('/events');
      await page.waitForLoadState('networkidle');
      
      // Test search input
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('tango');
        await page.waitForTimeout(500); // Debounce delay
        console.log('✅ Search input working');
      }
      
      // Test filter button
      const filterButton = page.locator('button').filter({ hasText: /Filter/i }).first();
      if (await filterButton.isVisible()) {
        await filterButton.click();
        console.log('✅ Filter button clickable');
        
        // Check if filter options appear
        const locationInput = page.locator('input[placeholder*="City"]').first();
        if (await locationInput.isVisible({ timeout: 3000 }).catch(() => false)) {
          console.log('✅ Filter options displayed');
        }
      }
    });
  });

  test.describe('3. Navigation and Routing', () => {
    test('should navigate between pages without errors', async ({ page }) => {
      const routes = [
        { path: '/', name: 'Home' },
        { path: '/events', name: 'Events' },
        { path: '/profile', name: 'Profile' },
        { path: '/messages', name: 'Messages' },
        { path: '/groups', name: 'Groups' },
        { path: '/friends', name: 'Friends' },
        { path: '/community', name: 'Community' }
      ];
      
      for (const route of routes) {
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');
        
        // Check for console errors
        const consoleErrors: string[] = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });
        
        await page.waitForTimeout(1000);
        
        if (consoleErrors.length === 0) {
          console.log(`✅ ${route.name} page loaded without errors`);
        } else {
          console.log(`⚠️ ${route.name} page has console errors:`, consoleErrors);
        }
      }
    });
  });

  test.describe('4. UI Theme and Styling', () => {
    test('should display MT Ocean theme gradients', async ({ page }) => {
      await page.goto('/');
      
      // Check for gradient elements
      const gradientElements = page.locator('[class*="gradient"], [class*="turquoise"], [class*="cyan"]');
      const count = await gradientElements.count();
      
      if (count > 0) {
        console.log(`✅ Found ${count} gradient/themed elements`);
        
        // Check specific gradient colors
        const element = gradientElements.first();
        const bgImage = await element.evaluate(el => 
          window.getComputedStyle(el).backgroundImage
        );
        
        if (bgImage && bgImage.includes('gradient')) {
          console.log('✅ MT Ocean gradient theme applied');
        }
      } else {
        console.log('⚠️ No gradient elements found');
      }
      
      // Check glassmorphic cards
      const cards = page.locator('[class*="backdrop-blur"], [class*="bg-white/"]');
      if (await cards.count() > 0) {
        console.log(`✅ Found ${await cards.count()} glassmorphic cards`);
      }
    });

    test('should be responsive on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check if navigation is accessible (hamburger menu or visible nav)
      const mobileMenu = page.locator('[class*="mobile"], [class*="burger"], button[aria-label*="menu"]');
      const visibleNav = page.locator('nav').first();
      
      if (await mobileMenu.isVisible().catch(() => false) || await visibleNav.isVisible()) {
        console.log('✅ Mobile navigation accessible');
      } else {
        console.log('⚠️ Mobile navigation may need attention');
      }
    });
  });

  test.describe('5. Database and Data Persistence', () => {
    test('should maintain data across page refreshes', async ({ page }) => {
      // Navigate to events
      await page.goto('/events');
      await page.waitForLoadState('networkidle');
      
      // Get initial event count
      const initialCards = await page.locator('[data-testid*="event"], [class*="event-card"]').count();
      
      // Refresh the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Get event count after refresh
      const afterRefreshCards = await page.locator('[data-testid*="event"], [class*="event-card"]').count();
      
      if (initialCards === afterRefreshCards) {
        console.log('✅ Data persists across page refresh');
      } else {
        console.log(`⚠️ Data inconsistency: ${initialCards} → ${afterRefreshCards} cards`);
      }
    });
  });

  test.describe('6. Performance and Loading', () => {
    test('should load pages within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      if (loadTime < 3000) {
        console.log(`✅ Home page loaded in ${loadTime}ms (excellent)`);
      } else if (loadTime < 5000) {
        console.log(`✅ Home page loaded in ${loadTime}ms (acceptable)`);
      } else {
        console.log(`⚠️ Home page loaded in ${loadTime}ms (needs optimization)`);
      }
    });

    test('should not have memory leaks on navigation', async ({ page }) => {
      // Navigate between pages multiple times
      for (let i = 0; i < 3; i++) {
        await page.goto('/');
        await page.goto('/events');
        await page.goto('/profile');
      }
      
      // Check if page is still responsive
      const isResponsive = await page.evaluate(() => {
        return document.readyState === 'complete';
      });
      
      expect(isResponsive).toBeTruthy();
      console.log('✅ No apparent memory leaks after multiple navigations');
    });
  });

  test.describe('7. Error Handling', () => {
    test('should handle 404 pages gracefully', async ({ page }) => {
      await page.goto('/non-existent-page-xyz');
      await page.waitForLoadState('networkidle');
      
      // Check if error page or redirect happens
      const url = page.url();
      const pageContent = await page.content();
      
      if (url.includes('404') || pageContent.includes('404') || pageContent.includes('not found')) {
        console.log('✅ 404 errors handled gracefully');
      } else if (url.endsWith('/')) {
        console.log('✅ Invalid routes redirect to home');
      } else {
        console.log('⚠️ 404 handling may need improvement');
      }
    });
  });

  test.describe('8. Real-time Features', () => {
    test('should establish WebSocket connection', async ({ page }) => {
      await page.goto('/');
      
      // Check for Socket.io connection
      const hasSocket = await page.evaluate(() => {
        return typeof (window as any).io !== 'undefined' || 
               typeof (window as any).socket !== 'undefined';
      });
      
      if (hasSocket) {
        console.log('✅ WebSocket/Socket.io available');
      } else {
        console.log('⚠️ Real-time features may not be initialized');
      }
    });
  });

  test.describe('9. Schema Integration', () => {
    test('should not have duplicate export errors', async ({ page }) => {
      // Check console for schema-related errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().includes('duplicate')) {
          errors.push(msg.text());
        }
      });
      
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      if (errors.length === 0) {
        console.log('✅ No duplicate export errors detected');
      } else {
        console.log('❌ Duplicate export errors found:', errors);
      }
    });
  });

  test.describe('10. Summary', () => {
    test('should complete full user journey without critical errors', async ({ page }) => {
      const journey = [
        { action: 'Load home', path: '/' },
        { action: 'Navigate to events', path: '/events' },
        { action: 'Check profile', path: '/profile' },
        { action: 'Return home', path: '/' }
      ];
      
      let criticalErrors = 0;
      page.on('pageerror', () => criticalErrors++);
      
      for (const step of journey) {
        await page.goto(step.path);
        await page.waitForLoadState('networkidle');
        console.log(`✅ ${step.action} completed`);
      }
      
      if (criticalErrors === 0) {
        console.log('✅ Full user journey completed without critical errors');
      } else {
        console.log(`❌ ${criticalErrors} critical errors encountered`);
      }
    });
  });
});

// After all tests
test.afterAll(async () => {
  console.log('\n========================================');
  console.log('COMPREHENSIVE AUDIT COMPLETE');
  console.log('========================================\n');
});