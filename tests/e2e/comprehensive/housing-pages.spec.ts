import { test, expect } from '@playwright/test';

test.describe('Housing & Marketplace Pages - ESA Layer 51', () => {
  test.describe('Housing Marketplace Page', () => {
    test('should display housing listings grid', async ({ page }) => {
      await page.goto('/housing-marketplace');
      
      // Check MT Ocean theme
      await expect(page.locator('.gradient-turquoise')).toBeVisible();
      
      // Check main elements
      await expect(page.getByTestId('property-grid')).toBeVisible();
      await expect(page.getByTestId('map-view')).toBeVisible();
      await expect(page.getByTestId('filter-price')).toBeVisible();
      await expect(page.getByTestId('filter-rooms')).toBeVisible();
      await expect(page.getByTestId('filter-amenities')).toBeVisible();
      await expect(page.getByTestId('button-list-property')).toBeVisible();
    });

    test('should filter properties by price range', async ({ page }) => {
      await page.goto('/housing-marketplace');
      
      await page.getByTestId('filter-price-min').fill('500');
      await page.getByTestId('filter-price-max').fill('1500');
      await page.getByTestId('button-apply-filters').click();
      
      await expect(page.getByTestId('filtered-results')).toBeVisible();
      await expect(page.getByTestId('results-count')).toBeVisible();
    });

    test('should switch to map view', async ({ page }) => {
      await page.goto('/housing-marketplace');
      
      await page.getByTestId('button-view-map').click();
      await expect(page.locator('.leaflet-container')).toBeVisible();
      await expect(page.getByTestId('map-markers')).toBeVisible();
    });

    test('should show property details', async ({ page }) => {
      await page.goto('/housing-marketplace');
      
      const firstProperty = page.getByTestId('property-card').first();
      await firstProperty.click();
      
      await expect(page.getByTestId('property-details')).toBeVisible();
      await expect(page.getByTestId('property-images')).toBeVisible();
      await expect(page.getByTestId('property-amenities')).toBeVisible();
      await expect(page.getByTestId('button-contact-host')).toBeVisible();
    });
  });

  test.describe('Host Onboarding Page', () => {
    test('should display host onboarding steps', async ({ page }) => {
      await page.goto('/host-onboarding');
      
      await expect(page.getByTestId('onboarding-progress')).toBeVisible();
      await expect(page.getByTestId('step-property-info')).toBeVisible();
      await expect(page.getByTestId('button-continue')).toBeVisible();
    });

    test('should validate property information form', async ({ page }) => {
      await page.goto('/host-onboarding');
      
      await page.getByTestId('input-property-title').fill('');
      await page.getByTestId('button-continue').click();
      
      await expect(page.getByTestId('error-property-title')).toBeVisible();
    });

    test('should allow property details entry', async ({ page }) => {
      await page.goto('/host-onboarding');
      
      // Step 1: Property Info
      await expect(page.getByTestId('input-property-title')).toBeVisible();
      await expect(page.getByTestId('textarea-property-description')).toBeVisible();
      await expect(page.getByTestId('input-property-address')).toBeVisible();
      await expect(page.getByTestId('select-property-type')).toBeVisible();
      
      await page.getByTestId('input-property-title').fill('Cozy Studio in Palermo');
      await page.getByTestId('button-continue').click();
      
      // Step 2: Amenities
      await expect(page.getByTestId('amenities-selector')).toBeVisible();
      await expect(page.getByTestId('checkbox-wifi')).toBeVisible();
      await expect(page.getByTestId('checkbox-kitchen')).toBeVisible();
      await expect(page.getByTestId('checkbox-parking')).toBeVisible();
    });

    test('should allow photo upload', async ({ page }) => {
      await page.goto('/host-onboarding');
      
      // Navigate to photo step
      await page.getByTestId('step-photos').click();
      
      await expect(page.getByTestId('photo-uploader')).toBeVisible();
      await expect(page.getByTestId('button-upload-photo')).toBeVisible();
      await expect(page.getByTestId('photo-guidelines')).toBeVisible();
    });

    test('should set pricing and availability', async ({ page }) => {
      await page.goto('/host-onboarding');
      
      // Navigate to pricing step
      await page.getByTestId('step-pricing').click();
      
      await expect(page.getByTestId('input-nightly-rate')).toBeVisible();
      await expect(page.getByTestId('input-weekly-discount')).toBeVisible();
      await expect(page.getByTestId('input-monthly-discount')).toBeVisible();
      await expect(page.getByTestId('calendar-availability')).toBeVisible();
    });

    test('should preview listing before submission', async ({ page }) => {
      await page.goto('/host-onboarding');
      
      // Navigate to review step
      await page.getByTestId('step-review').click();
      
      await expect(page.getByTestId('listing-preview')).toBeVisible();
      await expect(page.getByTestId('button-edit-property')).toBeVisible();
      await expect(page.getByTestId('button-publish-listing')).toBeVisible();
    });
  });

  test.describe('Guest Onboarding Page', () => {
    test('should display guest preferences form', async ({ page }) => {
      await page.goto('/guest-onboarding');
      
      await expect(page.getByTestId('guest-preferences')).toBeVisible();
      await expect(page.getByTestId('date-picker-checkin')).toBeVisible();
      await expect(page.getByTestId('date-picker-checkout')).toBeVisible();
      await expect(page.getByTestId('input-guests-count')).toBeVisible();
      await expect(page.getByTestId('select-location')).toBeVisible();
    });

    test('should show budget preferences', async ({ page }) => {
      await page.goto('/guest-onboarding');
      
      await expect(page.getByTestId('budget-slider')).toBeVisible();
      await expect(page.getByTestId('budget-min')).toBeVisible();
      await expect(page.getByTestId('budget-max')).toBeVisible();
      await expect(page.getByTestId('currency-selector')).toBeVisible();
    });

    test('should allow amenity preferences selection', async ({ page }) => {
      await page.goto('/guest-onboarding');
      
      await page.getByTestId('step-amenities').click();
      
      await expect(page.getByTestId('essential-amenities')).toBeVisible();
      await expect(page.getByTestId('checkbox-wifi')).toBeVisible();
      await expect(page.getByTestId('checkbox-kitchen')).toBeVisible();
      await expect(page.getByTestId('checkbox-air-conditioning')).toBeVisible();
      await expect(page.getByTestId('checkbox-workspace')).toBeVisible();
    });

    test('should show recommended properties', async ({ page }) => {
      await page.goto('/guest-onboarding');
      
      // Fill preferences
      await page.getByTestId('select-location').selectOption('Buenos Aires');
      await page.getByTestId('input-guests-count').fill('2');
      await page.getByTestId('button-search-properties').click();
      
      await expect(page.getByTestId('recommended-properties')).toBeVisible();
      await expect(page.getByTestId('property-recommendations')).toBeVisible();
    });

    test('should allow saving search preferences', async ({ page }) => {
      await page.goto('/guest-onboarding');
      
      await page.getByTestId('button-save-preferences').click();
      await expect(page.getByTestId('message-preferences-saved')).toBeVisible();
      await expect(page.getByTestId('saved-searches')).toBeVisible();
    });

    test('should provide search alerts setup', async ({ page }) => {
      await page.goto('/guest-onboarding');
      
      await page.getByTestId('step-alerts').click();
      
      await expect(page.getByTestId('alert-preferences')).toBeVisible();
      await expect(page.getByTestId('toggle-email-alerts')).toBeVisible();
      await expect(page.getByTestId('toggle-push-alerts')).toBeVisible();
      await expect(page.getByTestId('alert-frequency')).toBeVisible();
    });
  });
});