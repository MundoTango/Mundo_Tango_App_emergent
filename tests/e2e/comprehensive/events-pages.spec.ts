import { test, expect } from '@playwright/test';

test.describe('Events System Pages - ESA Layer 51', () => {
  test.describe('Events Listing Page', () => {
    test('should display events grid with filters', async ({ page }) => {
      await page.goto('/events');
      
      // Check MT Ocean theme
      await expect(page.locator('.gradient-turquoise')).toBeVisible();
      
      // Check main elements
      await expect(page.getByTestId('events-grid')).toBeVisible();
      await expect(page.getByTestId('filter-date')).toBeVisible();
      await expect(page.getByTestId('filter-category')).toBeVisible();
      await expect(page.getByTestId('filter-location')).toBeVisible();
      await expect(page.getByTestId('filter-price')).toBeVisible();
      await expect(page.getByTestId('button-create-event')).toBeVisible();
    });

    test('should filter events by category', async ({ page }) => {
      await page.goto('/events');
      
      await page.getByTestId('filter-category').selectOption('milonga');
      await expect(page.getByTestId('events-grid')).toBeVisible();
      
      // Verify filtered results
      const events = page.getByTestId('event-card');
      await expect(events.first()).toContainText(/milonga/i);
    });

    test('should switch between grid and list view', async ({ page }) => {
      await page.goto('/events');
      
      await expect(page.getByTestId('button-view-grid')).toBeVisible();
      await expect(page.getByTestId('button-view-list')).toBeVisible();
      
      await page.getByTestId('button-view-list').click();
      await expect(page.getByTestId('events-list')).toBeVisible();
    });

    test('should show map view', async ({ page }) => {
      await page.goto('/events');
      
      await page.getByTestId('button-view-map').click();
      await expect(page.getByTestId('events-map')).toBeVisible();
      await expect(page.locator('.leaflet-container')).toBeVisible();
    });
  });

  test.describe('Enhanced Events Page', () => {
    test('should display enhanced events features', async ({ page }) => {
      await page.goto('/events');
      
      await expect(page.getByTestId('featured-events')).toBeVisible();
      await expect(page.getByTestId('trending-events')).toBeVisible();
      await expect(page.getByTestId('events-calendar-view')).toBeVisible();
    });

    test('should show event recommendations', async ({ page }) => {
      await page.goto('/events');
      
      await expect(page.getByTestId('recommended-for-you')).toBeVisible();
      await expect(page.getByTestId('based-on-interests')).toBeVisible();
    });
  });

  test.describe('Event Detail Page', () => {
    test('should display event details', async ({ page }) => {
      await page.goto('/events/test-event-id');
      
      await expect(page.getByTestId('event-header')).toBeVisible();
      await expect(page.getByTestId('event-description')).toBeVisible();
      await expect(page.getByTestId('event-date-time')).toBeVisible();
      await expect(page.getByTestId('event-location')).toBeVisible();
      await expect(page.getByTestId('event-price')).toBeVisible();
      await expect(page.getByTestId('button-register')).toBeVisible();
    });

    test('should show attendees list', async ({ page }) => {
      await page.goto('/events/test-event-id');
      
      await expect(page.getByTestId('attendees-list')).toBeVisible();
      await expect(page.getByTestId('attendees-count')).toBeVisible();
    });

    test('should allow event registration', async ({ page }) => {
      await page.goto('/events/test-event-id');
      
      await page.getByTestId('button-register').click();
      await expect(page.getByTestId('modal-registration')).toBeVisible();
      await expect(page.getByTestId('button-confirm-registration')).toBeVisible();
    });

    test('should show similar events', async ({ page }) => {
      await page.goto('/events/test-event-id');
      
      await expect(page.getByTestId('similar-events')).toBeVisible();
      await expect(page.getByTestId('event-recommendations')).toBeVisible();
    });
  });

  test.describe('Event Discovery Feed', () => {
    test('should display discovery sections', async ({ page }) => {
      await page.goto('/events/discover');
      
      await expect(page.getByTestId('recommended-events')).toBeVisible();
      await expect(page.getByTestId('trending-events')).toBeVisible();
      await expect(page.getByTestId('nearby-events')).toBeVisible();
      await expect(page.getByTestId('upcoming-events')).toBeVisible();
    });

    test('should filter by interests', async ({ page }) => {
      await page.goto('/events/discover');
      
      await expect(page.getByTestId('interest-tags')).toBeVisible();
      await page.getByTestId('tag-milonga').click();
      await expect(page.getByTestId('filtered-results')).toBeVisible();
    });

    test('should show personalized recommendations', async ({ page }) => {
      await page.goto('/events/discover');
      
      await expect(page.getByTestId('for-you-section')).toBeVisible();
      await expect(page.getByTestId('based-on-history')).toBeVisible();
    });
  });

  test.describe('Teacher Dashboard', () => {
    test('should display teaching management tools', async ({ page }) => {
      await page.goto('/teacher');
      
      await expect(page.getByTestId('class-schedule')).toBeVisible();
      await expect(page.getByTestId('student-roster')).toBeVisible();
      await expect(page.getByTestId('lesson-plans')).toBeVisible();
      await expect(page.getByTestId('class-materials')).toBeVisible();
      await expect(page.getByTestId('button-create-class')).toBeVisible();
    });

    test('should show student progress', async ({ page }) => {
      await page.goto('/teacher');
      
      await page.getByTestId('tab-students').click();
      await expect(page.getByTestId('student-progress-list')).toBeVisible();
      await expect(page.getByTestId('attendance-tracker')).toBeVisible();
    });

    test('should allow creating new class', async ({ page }) => {
      await page.goto('/teacher');
      
      await page.getByTestId('button-create-class').click();
      await expect(page.getByTestId('modal-create-class')).toBeVisible();
      await expect(page.getByTestId('input-class-name')).toBeVisible();
      await expect(page.getByTestId('select-class-level')).toBeVisible();
      await expect(page.getByTestId('input-class-schedule')).toBeVisible();
    });

    test('should display earnings and payments', async ({ page }) => {
      await page.goto('/teacher');
      
      await page.getByTestId('tab-earnings').click();
      await expect(page.getByTestId('earnings-overview')).toBeVisible();
      await expect(page.getByTestId('payment-history')).toBeVisible();
      await expect(page.getByTestId('pending-payments')).toBeVisible();
    });
  });

  test.describe('Organizer Dashboard', () => {
    test('should display event management tools', async ({ page }) => {
      await page.goto('/organizer');
      
      await expect(page.getByTestId('events-managed')).toBeVisible();
      await expect(page.getByTestId('button-create-event')).toBeVisible();
      await expect(page.getByTestId('revenue-stats')).toBeVisible();
      await expect(page.getByTestId('upcoming-events-list')).toBeVisible();
    });

    test('should show event analytics', async ({ page }) => {
      await page.goto('/organizer');
      
      await page.getByTestId('tab-analytics').click();
      await expect(page.getByTestId('attendance-charts')).toBeVisible();
      await expect(page.getByTestId('revenue-charts')).toBeVisible();
      await expect(page.getByTestId('demographic-insights')).toBeVisible();
    });

    test('should allow creating new event', async ({ page }) => {
      await page.goto('/organizer');
      
      await page.getByTestId('button-create-event').click();
      await expect(page.getByTestId('modal-create-event')).toBeVisible();
      await expect(page.getByTestId('input-event-name')).toBeVisible();
      await expect(page.getByTestId('input-event-date')).toBeVisible();
      await expect(page.getByTestId('input-event-location')).toBeVisible();
      await expect(page.getByTestId('input-ticket-price')).toBeVisible();
    });

    test('should manage event registrations', async ({ page }) => {
      await page.goto('/organizer');
      
      await page.getByTestId('event-card').first().click();
      await expect(page.getByTestId('registrations-list')).toBeVisible();
      await expect(page.getByTestId('button-export-attendees')).toBeVisible();
      await expect(page.getByTestId('button-send-announcement')).toBeVisible();
    });

    test('should show venue management', async ({ page }) => {
      await page.goto('/organizer');
      
      await page.getByTestId('tab-venues').click();
      await expect(page.getByTestId('venues-list')).toBeVisible();
      await expect(page.getByTestId('button-add-venue')).toBeVisible();
    });
  });
});