import { test, expect } from '@playwright/test';

test.describe('Legal & Support Pages - ESA Layer 51', () => {
  test.describe('Code of Conduct Page', () => {
    test('should display code of conduct sections', async ({ page }) => {
      await page.goto('/code-of-conduct');
      
      // Check MT Ocean theme
      await expect(page.locator('.gradient-turquoise')).toBeVisible();
      
      // Check main sections
      await expect(page.getByTestId('conduct-overview')).toBeVisible();
      await expect(page.getByTestId('community-standards')).toBeVisible();
      await expect(page.getByTestId('prohibited-behavior')).toBeVisible();
      await expect(page.getByTestId('enforcement-policies')).toBeVisible();
      await expect(page.getByTestId('reporting-violations')).toBeVisible();
    });

    test('should allow accepting code of conduct', async ({ page }) => {
      await page.goto('/code-of-conduct');
      
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      await expect(page.getByTestId('checkbox-accept-conduct')).toBeVisible();
      await expect(page.getByTestId('button-agree-continue')).toBeVisible();
      
      await page.getByTestId('checkbox-accept-conduct').check();
      await expect(page.getByTestId('button-agree-continue')).toBeEnabled();
    });

    test('should provide contact for violations', async ({ page }) => {
      await page.goto('/code-of-conduct');
      
      await expect(page.getByTestId('report-violation-section')).toBeVisible();
      await expect(page.getByTestId('button-report-violation')).toBeVisible();
      await expect(page.getByTestId('email-conduct-team')).toBeVisible();
    });
  });

  test.describe('404 Not Found Page', () => {
    test('should display 404 error page', async ({ page }) => {
      await page.goto('/nonexistent-page-404');
      
      await expect(page.getByTestId('error-404')).toBeVisible();
      await expect(page.getByTestId('error-message')).toContainText('Page not found');
      await expect(page.getByTestId('button-go-home')).toBeVisible();
      await expect(page.getByTestId('search-site')).toBeVisible();
    });

    test('should provide navigation options', async ({ page }) => {
      await page.goto('/nonexistent-page-404');
      
      await expect(page.getByTestId('suggested-pages')).toBeVisible();
      await expect(page.getByTestId('popular-links')).toBeVisible();
      await expect(page.getByTestId('sitemap-link')).toBeVisible();
    });

    test('should allow searching from 404 page', async ({ page }) => {
      await page.goto('/nonexistent-page-404');
      
      await page.getByTestId('search-site').fill('events');
      await page.getByTestId('button-search').click();
      
      await page.waitForURL('**/search?q=events');
      await expect(page.getByTestId('search-results')).toBeVisible();
    });
  });

  test.describe('Travel Planner Page', () => {
    test('should display travel planning interface', async ({ page }) => {
      await page.goto('/travel-planner');
      
      await expect(page.getByTestId('trip-planner')).toBeVisible();
      await expect(page.getByTestId('destination-selector')).toBeVisible();
      await expect(page.getByTestId('date-range-picker')).toBeVisible();
      await expect(page.getByTestId('budget-calculator')).toBeVisible();
      await expect(page.getByTestId('itinerary-builder')).toBeVisible();
    });

    test('should search for destinations', async ({ page }) => {
      await page.goto('/travel-planner');
      
      await page.getByTestId('destination-selector').fill('Buenos Aires');
      await page.getByTestId('button-search-destination').click();
      
      await expect(page.getByTestId('destination-results')).toBeVisible();
      await expect(page.getByTestId('destination-info')).toBeVisible();
      await expect(page.getByTestId('local-events')).toBeVisible();
    });

    test('should create travel itinerary', async ({ page }) => {
      await page.goto('/travel-planner');
      
      await page.getByTestId('button-add-activity').click();
      await expect(page.getByTestId('modal-add-activity')).toBeVisible();
      await expect(page.getByTestId('activity-type')).toBeVisible();
      await expect(page.getByTestId('activity-time')).toBeVisible();
      await expect(page.getByTestId('activity-location')).toBeVisible();
    });

    test('should calculate trip budget', async ({ page }) => {
      await page.goto('/travel-planner');
      
      await page.getByTestId('tab-budget').click();
      await expect(page.getByTestId('budget-breakdown')).toBeVisible();
      await expect(page.getByTestId('accommodation-cost')).toBeVisible();
      await expect(page.getByTestId('transport-cost')).toBeVisible();
      await expect(page.getByTestId('activities-cost')).toBeVisible();
      await expect(page.getByTestId('total-budget')).toBeVisible();
    });

    test('should connect with local communities', async ({ page }) => {
      await page.goto('/travel-planner');
      
      await page.getByTestId('tab-communities').click();
      await expect(page.getByTestId('local-communities')).toBeVisible();
      await expect(page.getByTestId('local-hosts')).toBeVisible();
      await expect(page.getByTestId('local-events')).toBeVisible();
      await expect(page.getByTestId('button-connect-locals')).toBeVisible();
    });

    test('should save and share travel plans', async ({ page }) => {
      await page.goto('/travel-planner');
      
      await expect(page.getByTestId('button-save-itinerary')).toBeVisible();
      await expect(page.getByTestId('button-share-itinerary')).toBeVisible();
      await expect(page.getByTestId('button-export-pdf')).toBeVisible();
      
      await page.getByTestId('button-save-itinerary').click();
      await expect(page.getByTestId('message-saved')).toBeVisible();
    });
  });

  test.describe('Privacy Policy Page', () => {
    test('should display privacy policy sections', async ({ page }) => {
      await page.goto('/privacy');
      
      await expect(page.getByTestId('privacy-overview')).toBeVisible();
      await expect(page.getByTestId('data-collection')).toBeVisible();
      await expect(page.getByTestId('data-usage')).toBeVisible();
      await expect(page.getByTestId('data-sharing')).toBeVisible();
      await expect(page.getByTestId('user-rights')).toBeVisible();
      await expect(page.getByTestId('contact-privacy')).toBeVisible();
    });

    test('should provide data management options', async ({ page }) => {
      await page.goto('/privacy');
      
      await expect(page.getByTestId('button-download-data')).toBeVisible();
      await expect(page.getByTestId('button-delete-account')).toBeVisible();
      await expect(page.getByTestId('button-manage-preferences')).toBeVisible();
    });
  });

  test.describe('Terms of Service Page', () => {
    test('should display terms of service', async ({ page }) => {
      await page.goto('/terms');
      
      await expect(page.getByTestId('terms-content')).toBeVisible();
      await expect(page.getByTestId('usage-terms')).toBeVisible();
      await expect(page.getByTestId('user-obligations')).toBeVisible();
      await expect(page.getByTestId('limitation-liability')).toBeVisible();
      await expect(page.getByTestId('governing-law')).toBeVisible();
    });

    test('should allow accepting terms', async ({ page }) => {
      await page.goto('/terms');
      
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      await expect(page.getByTestId('checkbox-accept-terms')).toBeVisible();
      await expect(page.getByTestId('button-agree-terms')).toBeVisible();
    });
  });
});