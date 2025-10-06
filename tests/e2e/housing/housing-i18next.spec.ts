import { test, expect } from '@playwright/test';

test.describe('Housing i18next Translation Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as test user
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('housing marketplace displays translated content', async ({ page }) => {
    // Navigate to housing marketplace
    await page.goto('/housing-marketplace');
    await page.waitForLoadState('networkidle');

    // Check for key translated elements (English defaults)
    await expect(page.getByTestId('text-title')).toContainText('Tango Housing Marketplace');
    await expect(page.getByTestId('text-subtitle')).toContainText('Find the perfect place');
    
    // Check stats are visible with translations
    await expect(page.getByTestId('stat-active-listings')).toBeVisible();
    await expect(page.getByTestId('stat-cities')).toBeVisible();
    await expect(page.getByTestId('stat-rating')).toBeVisible();
    
    // Check filter panel has translated labels
    await expect(page.getByText('Room Type')).toBeVisible();
    await expect(page.getByText('Price Range')).toBeVisible();
    await expect(page.getByText('Amenities')).toBeVisible();
  });

  test('listing detail page displays translated buttons and messages', async ({ page }) => {
    // Navigate to a listing
    await page.goto('/listing/1');
    await page.waitForLoadState('networkidle');

    // Check back button has translated text
    const backButton = page.getByTestId('button-back-to-marketplace');
    await expect(backButton).toContainText('Back to Marketplace');
    
    // Check other translated elements
    await expect(page.getByTestId('section-photo-gallery')).toBeVisible();
  });

  test('Aurora Tide glassmorphic elements are present', async ({ page }) => {
    await page.goto('/housing-marketplace');
    await page.waitForLoadState('networkidle');

    // Check for glass-card classes (Aurora Tide design system)
    const glassElements = await page.locator('.glass-card').count();
    expect(glassElements).toBeGreaterThan(0);
    
    // Verify dark mode support classes exist
    const darkModeElements = await page.locator('[class*="dark:"]').count();
    expect(darkModeElements).toBeGreaterThan(0);
  });

  test('data-testid attributes are properly set for accessibility', async ({ page }) => {
    await page.goto('/housing-marketplace');
    await page.waitForLoadState('networkidle');

    // Check critical data-testids exist
    await expect(page.getByTestId('page-housing-marketplace')).toBeVisible();
    await expect(page.getByTestId('input-search-location')).toBeVisible();
    await expect(page.getByTestId('button-toggle-filters')).toBeVisible();
  });
});
