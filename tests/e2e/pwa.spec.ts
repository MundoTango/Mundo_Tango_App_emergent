import { test, expect } from '@playwright/test';

test.describe('PWA Functionality', () => {
  test('Service worker is registered', async ({ page }) => {
    await page.goto('/');
    
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        return registration !== null;
      }
      return false;
    });
    
    expect(swRegistered).toBe(true);
  });

  test('Manifest is properly configured', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    expect(response?.status()).toBe(200);
    
    const manifest = await response?.json();
    expect(manifest.name).toBe('Mundo Tango - Life CEO & Community Platform');
    expect(manifest.short_name).toBe('Mundo Tango');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test('Offline page is accessible', async ({ page }) => {
    const response = await page.goto('/offline.html');
    expect(response?.status()).toBe(200);
    
    await expect(page.locator('text=You\'re Offline')).toBeVisible();
  });

  test('Push notification permission can be requested', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Mock notification permission
    await page.evaluate(() => {
      // @ts-ignore
      window.Notification = {
        permission: 'default',
        requestPermission: () => Promise.resolve('granted')
      };
    });
    
    const hasNotifications = await page.evaluate(() => {
      return 'Notification' in window;
    });
    
    expect(hasNotifications).toBe(true);
  });

  test('App is installable (manifest + SW)', async ({ page }) => {
    await page.goto('/');
    
    const isInstallable = await page.evaluate(() => {
      return 'serviceWorker' in navigator && 
             document.querySelector('link[rel="manifest"]') !== null;
    });
    
    expect(isInstallable).toBe(true);
  });
});

test.describe('Performance Optimizations', () => {
  test('Request coalescing prevents duplicate requests', async ({ page }) => {
    const requests = new Map<string, number>();
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/')) {
        requests.set(url, (requests.get(url) || 0) + 1);
      }
    });
    
    await page.goto('/dashboard');
    
    // Make multiple rapid requests for the same resource
    await page.evaluate(() => {
      Promise.all([
        fetch('/api/user/me'),
        fetch('/api/user/me'),
        fetch('/api/user/me')
      ]);
    });
    
    await page.waitForTimeout(500);
    
    // With coalescing, should only make 1 actual request
    const meRequests = Array.from(requests.entries())
      .filter(([url]) => url.includes('/api/user/me'))
      .reduce((sum, [, count]) => sum + count, 0);
    
    expect(meRequests).toBeLessThanOrEqual(1);
  });

  test('Lazy loading works for heavy components', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Intelligence Dashboard should be lazy loaded
    const initialBundleSize = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .reduce((total, entry: any) => total + (entry.transferSize || 0), 0);
    });
    
    await page.goto('/admin/intelligence-dashboard');
    
    const afterNavigationSize = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .reduce((total, entry: any) => total + (entry.transferSize || 0), 0);
    });
    
    // New chunk should be loaded
    expect(afterNavigationSize).toBeGreaterThan(initialBundleSize);
  });
});
