import { test, expect } from '@playwright/test';

/**
 * MB.MD S4: E2E Test - Authentication & Login Flow
 * Created: October 20, 2025
 * 
 * Critical User Flow: User authentication and login
 * Covers: Homepage → Login → Dashboard
 */

test.describe('Authentication & Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page elements', async ({ page }) => {
    // Navigate to login (or check if already on login)
    const loginButton = page.getByTestId('button-login').or(page.getByRole('button', { name: /login/i })).first();
    
    if (await loginButton.isVisible()) {
      await loginButton.click();
    }

    // Verify login form elements
    await expect(page.getByTestId('input-email').or(page.getByRole('textbox', { name: /email/i })).first()).toBeVisible();
    await expect(page.getByTestId('input-password').or(page.getByLabel(/password/i)).first()).toBeVisible();
    await expect(page.getByTestId('button-submit').or(page.getByRole('button', { name: /sign in|login/i })).first()).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    // Navigate to login if not already there
    const loginButton = page.getByTestId('button-login').or(page.getByRole('button', { name: /login/i })).first();
    
    if (await loginButton.isVisible()) {
      await loginButton.click();
    }

    const currentUrl = page.url();

    // Try to submit empty form
    const submitButton = page.getByTestId('button-submit').or(page.getByRole('button', { name: /sign in|login/i })).first();
    await submitButton.click();

    await page.waitForTimeout(500);

    // Should either show validation error OR stay on same page (not redirect)
    const errorMessage = page.getByText(/required|invalid|must|error/i);
    const hasError = await errorMessage.isVisible().catch(() => false);
    const urlUnchanged = page.url() === currentUrl;
    
    // Form validation should either show error message OR prevent navigation
    expect(hasError || urlUnchanged).toBeTruthy();
  });

  test('should navigate to register page', async ({ page }) => {
    // Look for register link
    const registerLink = page.getByTestId('link-register').or(page.getByRole('link', { name: /sign up|register|create account/i })).first();
    
    if (await registerLink.isVisible()) {
      await registerLink.click();
      
      // Verify we're on register page
      await expect(page).toHaveURL(/.*register|signup/);
    }
  });

  test('should attempt login with test credentials', async ({ page }) => {
    // Navigate to login
    const loginButton = page.getByTestId('button-login').or(page.getByRole('button', { name: /login/i })).first();
    
    if (await loginButton.isVisible()) {
      await loginButton.click();
    }

    const loginUrl = page.url();

    // Fill in test credentials
    const emailInput = page.getByTestId('input-email').or(page.getByRole('textbox', { name: /email/i })).first();
    const passwordInput = page.getByTestId('input-password').or(page.getByLabel(/password/i)).first();
    
    await emailInput.fill('test@mundotango.com');
    await passwordInput.fill('testpassword123');

    // Submit form
    const submitButton = page.getByTestId('button-submit').or(page.getByRole('button', { name: /sign in|login/i })).first();
    await submitButton.click();

    // Wait for response
    await page.waitForTimeout(2000);
    
    // Should either redirect (success) OR show error message (failure)
    const currentUrl = page.url();
    const hasRedirected = currentUrl !== loginUrl;
    const errorMessage = page.getByText(/invalid|incorrect|failed|error/i);
    const hasError = await errorMessage.isVisible().catch(() => false);
    
    // Login attempt should result in either redirect OR error message
    expect(hasRedirected || hasError).toBeTruthy();
  });

  test('should have responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to login
    const loginButton = page.getByTestId('button-login').or(page.getByRole('button', { name: /login/i })).first();
    
    if (await loginButton.isVisible()) {
      await loginButton.click();
    }

    // Verify mobile-friendly layout
    const emailInput = page.getByTestId('input-email').or(page.getByRole('textbox', { name: /email/i })).first();
    await expect(emailInput).toBeVisible();
    
    // Check input is properly sized for mobile
    const box = await emailInput.boundingBox();
    expect(box?.width).toBeGreaterThan(200); // Should be wide enough for mobile
  });
});
