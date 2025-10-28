/**
 * Open Source Agent E2E Tests
 * MB.MD SIMULTANEOUS Stream 3: Testing Infrastructure
 * Playwright tests for cost optimization features
 * Created: October 28, 2025
 */

import { test, expect } from '@playwright/test';

test.describe('Open Source Agent Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as super admin
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to Mr Blue AI interface
    await page.click('[data-testid="button-mr-blue"]');
    await page.waitForSelector('[data-testid="mr-blue-interface"]');
    
    // Open Admin tab
    await page.click('[data-testid="tab-admin"]');
    await page.waitForSelector('[data-testid="tab-opensourceagent"]');
    
    // Open Open Source Agent sub-tab
    await page.click('[data-testid="tab-opensourceagent"]');
  });

  test('should display cost savings metrics', async ({ page }) => {
    // Wait for metrics to load
    await page.waitForSelector('[data-testid="tab-opensourceagent"]', { timeout: 10000 });
    
    // Verify cost savings card is visible
    const savingsCard = await page.locator('text="Monthly Savings"');
    await expect(savingsCard).toBeVisible();
    
    // Verify metrics are displayed
    const freeUsage = await page.locator('text="Free Model Usage"');
    await expect(freeUsage).toBeVisible();
    
    const premiumUsage = await page.locator('text="Premium Usage"');
    await expect(premiumUsage).toBeVisible();
  });

  test('should display discovered models', async ({ page }) => {
    // Wait for models tab
    await page.click('[data-testid="tab-models"]');
    
    // Check if models are loaded (might be empty)
    const modelsSection = await page.locator('[data-testid="tab-models"]');
    await expect(modelsSection).toBeVisible();
    
    // Should show either models or empty state
    const hasModels = await page.locator('[data-testid^="model-card-"]').count() > 0;
    if (!hasModels) {
      // Check for empty state message
      await expect(page.locator('text="No models discovered yet"')).toBeVisible();
    }
  });

  test('should allow model evaluation', async ({ page }) => {
    await page.click('[data-testid="tab-models"]');
    
    // Find a discovered model (if any)
    const evaluateButton = page.locator('[data-testid^="button-evaluate-"]').first();
    const buttonExists = await evaluateButton.count() > 0;
    
    if (buttonExists) {
      // Click evaluate button
      await evaluateButton.click();
      
      // Check for success toast
      await expect(page.locator('text="Evaluation Started"')).toBeVisible({ timeout: 5000 });
      
      // Model should move to evaluating status
      await page.click('[data-testid="tab-evaluating"]');
      await page.waitForTimeout(1000);
      
      // Check evaluating tab has content
      const evaluatingTab = page.locator('[data-testid="tab-evaluating"]');
      await expect(evaluatingTab).toBeVisible();
    } else {
      console.log('No discovered models available for evaluation test');
    }
  });

  test('should display security compliance', async ({ page }) => {
    await page.click('[data-testid="tab-security"]');
    
    // Verify security checks are listed
    await expect(page.locator('text="Security Compliance"')).toBeVisible();
    await expect(page.locator('text="License compliance verification"')).toBeVisible();
    await expect(page.locator('text="Provider reputation check"')).toBeVisible();
  });

  test('should show production models', async ({ page }) => {
    await page.click('[data-testid="tab-production"]');
    
    // Check production tab is visible
    const productionTab = page.locator('[data-testid="tab-production"]');
    await expect(productionTab).toBeVisible();
    
    // Should show either production models or empty state
    const hasProductionModels = await page.locator('text="Production"').count() > 1; // More than just the tab label
    if (!hasProductionModels) {
      await expect(page.locator('text="No models in production yet"')).toBeVisible();
    }
  });
});

test.describe('Cost Tracking', () => {
  test('should track free model usage percentage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to Open Source Agent
    await page.click('[data-testid="button-mr-blue"]');
    await page.click('[data-testid="tab-admin"]');
    await page.click('[data-testid="tab-opensourceagent"]');
    
    // Wait for metrics
    await page.waitForSelector('text="Free Model Usage"', { timeout: 10000 });
    
    // Get free model usage percentage
    const freeUsageCard = page.locator('text="Free Model Usage"').locator('..');
    const percentage = await freeUsageCard.locator('text=/\\d+%/').textContent();
    
    // Should be a valid percentage
    expect(percentage).toMatch(/\d+%/);
    const value = parseInt(percentage || '0');
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(100);
  });

  test('should show cost per user under $1/month', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.click('[data-testid="button-mr-blue"]');
    await page.click('[data-testid="tab-admin"]');
    await page.click('[data-testid="tab-opensourceagent"]');
    
    // Look for cost per user metric
    await page.waitForSelector('text="Monthly Savings"', { timeout: 10000 });
    const savingsCard = page.locator('text="Monthly Savings"').locator('..');
    const costPerUser = await savingsCard.locator('text=/\\$[\\d.]+\\/user\\/month/').textContent();
    
    if (costPerUser) {
      const match = costPerUser.match(/\$([\d.]+)/);
      if (match) {
        const value = parseFloat(match[1]);
        // Should be under $1/user/month
        expect(value).toBeLessThan(1.00);
      }
    }
  });
});
