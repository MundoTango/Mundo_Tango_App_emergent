import { test, expect } from '@playwright/test';

test.describe('Billing & Subscriptions Pages - ESA Layer 51', () => {
  test.describe('Subscribe Page', () => {
    test('should display subscription tiers', async ({ page }) => {
      await page.goto('/subscribe');
      
      // Check MT Ocean theme
      await expect(page.locator('.gradient-turquoise')).toBeVisible();
      
      // Check subscription tiers
      await expect(page.getByTestId('tier-free')).toBeVisible();
      await expect(page.getByTestId('tier-premium')).toBeVisible();
      await expect(page.getByTestId('tier-business')).toBeVisible();
      await expect(page.getByTestId('tier-enterprise')).toBeVisible();
    });

    test('should show feature comparison', async ({ page }) => {
      await page.goto('/subscribe');
      
      await expect(page.getByTestId('feature-comparison-table')).toBeVisible();
      await expect(page.getByTestId('feature-list')).toBeVisible();
      await expect(page.getByTestId('pricing-toggle-monthly')).toBeVisible();
      await expect(page.getByTestId('pricing-toggle-annual')).toBeVisible();
    });

    test('should allow tier selection', async ({ page }) => {
      await page.goto('/subscribe');
      
      await page.getByTestId('button-select-premium').click();
      await expect(page.getByTestId('checkout-summary')).toBeVisible();
      await expect(page.getByTestId('selected-tier')).toContainText('Premium');
    });
  });

  test.describe('Billing Dashboard Page', () => {
    test('should display billing overview', async ({ page }) => {
      await page.goto('/settings/billing');
      
      await expect(page.getByTestId('billing-overview')).toBeVisible();
      await expect(page.getByTestId('current-plan')).toBeVisible();
      await expect(page.getByTestId('next-billing-date')).toBeVisible();
      await expect(page.getByTestId('payment-method')).toBeVisible();
    });

    test('should show billing history', async ({ page }) => {
      await page.goto('/settings/billing');
      
      await page.getByTestId('tab-history').click();
      await expect(page.getByTestId('billing-history-table')).toBeVisible();
      await expect(page.getByTestId('invoice-list')).toBeVisible();
      await expect(page.getByTestId('button-download-invoice')).toBeVisible();
    });

    test('should allow plan management', async ({ page }) => {
      await page.goto('/settings/billing');
      
      await expect(page.getByTestId('button-upgrade-plan')).toBeVisible();
      await expect(page.getByTestId('button-downgrade-plan')).toBeVisible();
      await expect(page.getByTestId('button-cancel-subscription')).toBeVisible();
    });
  });

  test.describe('Checkout Page', () => {
    test('should display checkout form', async ({ page }) => {
      await page.goto('/checkout/premium');
      
      await expect(page.getByTestId('checkout-form')).toBeVisible();
      await expect(page.getByTestId('order-summary')).toBeVisible();
      await expect(page.getByTestId('payment-form')).toBeVisible();
      await expect(page.getByTestId('billing-address')).toBeVisible();
    });

    test('should handle payment methods', async ({ page }) => {
      await page.goto('/checkout/premium');
      
      await expect(page.getByTestId('payment-method-card')).toBeVisible();
      await expect(page.getByTestId('payment-method-paypal')).toBeVisible();
      await expect(page.getByTestId('payment-method-stripe')).toBeVisible();
    });

    test('should apply promo codes', async ({ page }) => {
      await page.goto('/checkout/premium');
      
      await page.getByTestId('input-promo-code').fill('SAVE20');
      await page.getByTestId('button-apply-promo').click();
      
      await expect(page.getByTestId('discount-applied')).toBeVisible();
      await expect(page.getByTestId('updated-total')).toBeVisible();
    });

    test('should validate payment information', async ({ page }) => {
      await page.goto('/checkout/premium');
      
      await page.getByTestId('button-complete-purchase').click();
      
      await expect(page.getByTestId('error-card-number')).toBeVisible();
      await expect(page.getByTestId('error-expiry')).toBeVisible();
      await expect(page.getByTestId('error-cvv')).toBeVisible();
    });
  });

  test.describe('Payment Methods Page', () => {
    test('should display saved payment methods', async ({ page }) => {
      await page.goto('/payment-methods');
      
      await expect(page.getByTestId('payment-methods-list')).toBeVisible();
      await expect(page.getByTestId('button-add-payment-method')).toBeVisible();
      await expect(page.getByTestId('default-payment-indicator')).toBeVisible();
    });

    test('should add new payment method', async ({ page }) => {
      await page.goto('/payment-methods');
      
      await page.getByTestId('button-add-payment-method').click();
      await expect(page.getByTestId('modal-add-payment')).toBeVisible();
      await expect(page.getByTestId('input-card-number')).toBeVisible();
      await expect(page.getByTestId('input-card-name')).toBeVisible();
    });

    test('should set default payment method', async ({ page }) => {
      await page.goto('/payment-methods');
      
      const paymentMethod = page.getByTestId('payment-method-item').first();
      await paymentMethod.getByTestId('button-set-default').click();
      
      await expect(page.getByTestId('message-default-updated')).toBeVisible();
    });
  });

  test.describe('Invoices Page', () => {
    test('should display invoice list', async ({ page }) => {
      await page.goto('/invoices');
      
      await expect(page.getByTestId('invoices-table')).toBeVisible();
      await expect(page.getByTestId('invoice-filters')).toBeVisible();
      await expect(page.getByTestId('date-range-selector')).toBeVisible();
    });

    test('should view invoice details', async ({ page }) => {
      await page.goto('/invoices');
      
      const firstInvoice = page.getByTestId('invoice-row').first();
      await firstInvoice.getByTestId('button-view').click();
      
      await expect(page.getByTestId('invoice-details')).toBeVisible();
      await expect(page.getByTestId('line-items')).toBeVisible();
      await expect(page.getByTestId('invoice-total')).toBeVisible();
    });

    test('should download invoice PDF', async ({ page }) => {
      await page.goto('/invoices');
      
      const firstInvoice = page.getByTestId('invoice-row').first();
      await expect(firstInvoice.getByTestId('button-download-pdf')).toBeVisible();
    });
  });

  test.describe('Subscription Page', () => {
    test('should display current subscription', async ({ page }) => {
      await page.goto('/subscription');
      
      await expect(page.getByTestId('subscription-details')).toBeVisible();
      await expect(page.getByTestId('plan-name')).toBeVisible();
      await expect(page.getByTestId('billing-cycle')).toBeVisible();
      await expect(page.getByTestId('renewal-date')).toBeVisible();
    });

    test('should show usage statistics', async ({ page }) => {
      await page.goto('/subscription');
      
      await page.getByTestId('tab-usage').click();
      await expect(page.getByTestId('usage-metrics')).toBeVisible();
      await expect(page.getByTestId('api-calls')).toBeVisible();
      await expect(page.getByTestId('storage-used')).toBeVisible();
      await expect(page.getByTestId('users-count')).toBeVisible();
    });

    test('should manage subscription addons', async ({ page }) => {
      await page.goto('/subscription');
      
      await page.getByTestId('tab-addons').click();
      await expect(page.getByTestId('available-addons')).toBeVisible();
      await expect(page.getByTestId('active-addons')).toBeVisible();
      await expect(page.getByTestId('button-add-addon')).toBeVisible();
    });
  });

  test.describe('Subscription Analytics Page', () => {
    test('should display subscription metrics', async ({ page }) => {
      await page.goto('/admin/subscription-analytics');
      
      await expect(page.getByTestId('mrr-chart')).toBeVisible();
      await expect(page.getByTestId('arr-chart')).toBeVisible();
      await expect(page.getByTestId('churn-rate')).toBeVisible();
      await expect(page.getByTestId('ltv-metrics')).toBeVisible();
    });

    test('should show subscriber growth', async ({ page }) => {
      await page.goto('/admin/subscription-analytics');
      
      await expect(page.getByTestId('subscriber-growth-chart')).toBeVisible();
      await expect(page.getByTestId('new-subscribers')).toBeVisible();
      await expect(page.getByTestId('cancelled-subscribers')).toBeVisible();
      await expect(page.getByTestId('net-growth')).toBeVisible();
    });

    test('should display revenue breakdown', async ({ page }) => {
      await page.goto('/admin/subscription-analytics');
      
      await page.getByTestId('tab-revenue').click();
      await expect(page.getByTestId('revenue-by-tier')).toBeVisible();
      await expect(page.getByTestId('revenue-by-region')).toBeVisible();
      await expect(page.getByTestId('payment-method-breakdown')).toBeVisible();
    });
  });
});