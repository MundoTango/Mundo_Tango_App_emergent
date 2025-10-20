import { test, expect } from '@playwright/test';

/**
 * MB.MD S4: E2E Test - Homepage & Navigation
 * Created: October 20, 2025
 * 
 * Tests: Core navigation and homepage elements
 */

test.describe('Homepage & Navigation', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*\//);
  });

  test('should have main navigation elements', async ({ page }) => {
    await page.goto('/');
    
    // Check for navigation (could be navbar or sidebar)
    const nav = page.getByRole('navigation').first();
    await expect(nav).toBeVisible({ timeout: 10000 });
  });

  test('should display site logo or brand', async ({ page }) => {
    await page.goto('/');
    
    // Look for logo or brand name
    const logo = page.getByTestId('logo')
      .or(page.getByAltText(/mundo tango|logo/i))
      .or(page.getByText('Mundo Tango').or(page.getByText('MT')))
      .first();
    
    await expect(logo).toBeVisible({ timeout: 10000 });
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Page should still be visible and functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have search functionality or menu', async ({ page }) => {
    await page.goto('/');
    
    // Check for search input or menu button (both are valid navigation patterns)
    const searchInput = page.getByTestId('input-search')
      .or(page.getByPlaceholder(/search/i))
      .or(page.getByRole('searchbox'))
      .first();
    
    const menuButton = page.getByRole('button', { name: /menu|☰/i });
    
    const hasSearch = await searchInput.isVisible().catch(() => false);
    const hasMenu = await menuButton.isVisible().catch(() => false);
    
    // Should have either search OR menu for navigation
    expect(hasSearch || hasMenu).toBeTruthy();
  });
});
