import { test, expect } from '@playwright/test';

test.describe('Integration Pages - ESA Layer 51', () => {
  test.describe('Notion Home Page', () => {
    test('should display Notion integration home', async ({ page }) => {
      await page.goto('/notion-home');
      
      // Check MT Ocean theme
      await expect(page.locator('.gradient-turquoise')).toBeVisible();
      
      // Check main elements
      await expect(page.getByTestId('notion-workspace')).toBeVisible();
      await expect(page.getByTestId('connected-status')).toBeVisible();
      await expect(page.getByTestId('recent-pages')).toBeVisible();
      await expect(page.getByTestId('sync-status')).toBeVisible();
    });

    test('should connect to Notion workspace', async ({ page }) => {
      await page.goto('/notion-home');
      
      const isConnected = await page.getByTestId('connected-status').textContent();
      
      if (!isConnected?.includes('Connected')) {
        await page.getByTestId('button-connect-notion').click();
        await expect(page.getByTestId('modal-notion-auth')).toBeVisible();
        await expect(page.getByTestId('input-api-key')).toBeVisible();
        await expect(page.getByTestId('button-authorize')).toBeVisible();
      }
    });

    test('should display synchronized content', async ({ page }) => {
      await page.goto('/notion-home');
      
      await expect(page.getByTestId('synced-databases')).toBeVisible();
      await expect(page.getByTestId('synced-pages')).toBeVisible();
      await expect(page.getByTestId('last-sync-time')).toBeVisible();
    });

    test('should allow manual sync', async ({ page }) => {
      await page.goto('/notion-home');
      
      await page.getByTestId('button-sync-now').click();
      await expect(page.getByTestId('sync-progress')).toBeVisible();
      await expect(page.getByTestId('sync-status')).toContainText('Syncing');
    });
  });

  test.describe('Notion Entry Page', () => {
    test('should display Notion entry creation', async ({ page }) => {
      await page.goto('/notion-entry');
      
      await expect(page.getByTestId('entry-editor')).toBeVisible();
      await expect(page.getByTestId('entry-title')).toBeVisible();
      await expect(page.getByTestId('entry-content')).toBeVisible();
      await expect(page.getByTestId('entry-properties')).toBeVisible();
      await expect(page.getByTestId('button-save-to-notion')).toBeVisible();
    });

    test('should select target database', async ({ page }) => {
      await page.goto('/notion-entry');
      
      await expect(page.getByTestId('database-selector')).toBeVisible();
      await page.getByTestId('database-selector').click();
      await expect(page.getByTestId('database-list')).toBeVisible();
    });

    test('should create new Notion entry', async ({ page }) => {
      await page.goto('/notion-entry');
      
      await page.getByTestId('entry-title').fill('Test Entry');
      await page.getByTestId('entry-content').fill('Test content for Notion');
      await page.getByTestId('button-save-to-notion').click();
      
      await expect(page.getByTestId('message-entry-created')).toBeVisible();
    });

    test('should set entry properties', async ({ page }) => {
      await page.goto('/notion-entry');
      
      await page.getByTestId('tab-properties').click();
      await expect(page.getByTestId('property-tags')).toBeVisible();
      await expect(page.getByTestId('property-status')).toBeVisible();
      await expect(page.getByTestId('property-priority')).toBeVisible();
    });

    test('should preview entry before saving', async ({ page }) => {
      await page.goto('/notion-entry');
      
      await page.getByTestId('entry-title').fill('Preview Test');
      await page.getByTestId('button-preview').click();
      
      await expect(page.getByTestId('modal-preview')).toBeVisible();
      await expect(page.getByTestId('preview-content')).toContainText('Preview Test');
    });
  });

  test.describe('Stripe Integration', () => {
    test('should display Stripe dashboard connection', async ({ page }) => {
      await page.goto('/integrations/stripe');
      
      await expect(page.getByTestId('stripe-status')).toBeVisible();
      await expect(page.getByTestId('payment-overview')).toBeVisible();
      await expect(page.getByTestId('recent-transactions')).toBeVisible();
      await expect(page.getByTestId('revenue-metrics')).toBeVisible();
    });

    test('should show payment method configuration', async ({ page }) => {
      await page.goto('/integrations/stripe');
      
      await page.getByTestId('tab-payment-methods').click();
      await expect(page.getByTestId('enabled-methods')).toBeVisible();
      await expect(page.getByTestId('card-payments')).toBeVisible();
      await expect(page.getByTestId('bank-transfers')).toBeVisible();
    });
  });

  test.describe('Google Calendar Integration', () => {
    test('should display calendar sync status', async ({ page }) => {
      await page.goto('/integrations/google-calendar');
      
      await expect(page.getByTestId('calendar-sync-status')).toBeVisible();
      await expect(page.getByTestId('synced-calendars')).toBeVisible();
      await expect(page.getByTestId('upcoming-events')).toBeVisible();
    });

    test('should allow calendar selection', async ({ page }) => {
      await page.goto('/integrations/google-calendar');
      
      await expect(page.getByTestId('calendar-selector')).toBeVisible();
      await expect(page.getByTestId('sync-settings')).toBeVisible();
      await expect(page.getByTestId('sync-frequency')).toBeVisible();
    });
  });

  test.describe('Mailchimp Integration', () => {
    test('should display email marketing dashboard', async ({ page }) => {
      await page.goto('/integrations/mailchimp');
      
      await expect(page.getByTestId('mailchimp-status')).toBeVisible();
      await expect(page.getByTestId('subscriber-count')).toBeVisible();
      await expect(page.getByTestId('campaign-stats')).toBeVisible();
      await expect(page.getByTestId('audience-lists')).toBeVisible();
    });

    test('should manage audience lists', async ({ page }) => {
      await page.goto('/integrations/mailchimp');
      
      await page.getByTestId('tab-audiences').click();
      await expect(page.getByTestId('audience-table')).toBeVisible();
      await expect(page.getByTestId('button-create-audience')).toBeVisible();
    });
  });
});