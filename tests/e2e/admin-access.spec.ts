// TRACK 12: E2E Test - Admin Access
import { test, expect } from '@playwright/test';

test.describe('Admin Access', () => {
  test('Pierre can access admin dashboard', async ({ page }) => {
    // Navigate to admin
    await page.goto('/admin');
    
    // Check for admin dashboard elements
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=System Health')).toBeVisible();
  });

  test('Mr Blue is visible for super admin', async ({ page }) => {
    await page.goto('/');
    
    // Check for Mr Blue buttons
    const esaButton = page.locator('[data-testid*="esa-mindmap"]').or(page.locator('button:has-text("ESA")'));
    const mrBlueButton = page.locator('[data-testid*="mrblue"]').or(page.locator('button:has-text("Mr Blue")'));
    
    // At least one should be visible
    const count = await esaButton.count() + await mrBlueButton.count();
    expect(count).toBeGreaterThan(0);
  });
});
