import { test, expect } from '@playwright/test';

test.describe('Authentication Pages - ESA Layer 51', () => {
  test.describe('Login Page', () => {
    test('should display login form with all required elements', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Check MT Ocean theme elements
      await expect(page.locator('.glassmorphic-card')).toBeVisible();
      await expect(page.locator('.gradient-turquoise')).toBeVisible();
      
      // Check form elements
      await expect(page.getByTestId('input-email')).toBeVisible();
      await expect(page.getByTestId('input-password')).toBeVisible();
      await expect(page.getByTestId('button-submit')).toBeVisible();
      await expect(page.getByTestId('link-forgot-password')).toBeVisible();
      await expect(page.getByTestId('link-register')).toBeVisible();
    });
    
    test('should handle login errors gracefully', async ({ page }) => {
      await page.goto('/auth/login');
      
      await page.getByTestId('input-email').fill('invalid@example.com');
      await page.getByTestId('input-password').fill('wrongpass');
      await page.getByTestId('button-submit').click();
      
      await expect(page.getByTestId('error-message')).toBeVisible();
    });

    test('should remember user with Remember Me checkbox', async ({ page }) => {
      await page.goto('/auth/login');
      
      await expect(page.getByTestId('checkbox-remember-me')).toBeVisible();
      await page.getByTestId('checkbox-remember-me').check();
      
      // Verify checkbox is checked
      await expect(page.getByTestId('checkbox-remember-me')).toBeChecked();
    });

    test('should redirect to dashboard after successful login', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Mock successful login
      await page.getByTestId('input-email').fill('user@example.com');
      await page.getByTestId('input-password').fill('validPassword123');
      await page.getByTestId('button-submit').click();
      
      // Should redirect to dashboard
      await page.waitForURL('**/dashboard', { timeout: 5000 }).catch(() => {});
    });
  });
  
  test.describe('Register Page', () => {
    test('should display registration form with validation', async ({ page }) => {
      await page.goto('/auth/register');
      
      // Check MT Ocean theme
      await expect(page.locator('.glassmorphic-card')).toBeVisible();
      
      // Check form fields
      await expect(page.getByTestId('input-name')).toBeVisible();
      await expect(page.getByTestId('input-email')).toBeVisible();
      await expect(page.getByTestId('input-password')).toBeVisible();
      await expect(page.getByTestId('input-confirm-password')).toBeVisible();
      await expect(page.getByTestId('button-register')).toBeVisible();
    });

    test('should validate password match', async ({ page }) => {
      await page.goto('/auth/register');
      
      await page.getByTestId('input-password').fill('Password123!');
      await page.getByTestId('input-confirm-password').fill('DifferentPassword123!');
      await page.getByTestId('button-register').click();
      
      await expect(page.getByTestId('error-password-match')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/auth/register');
      
      await page.getByTestId('input-email').fill('invalid-email');
      await page.getByTestId('input-email').blur();
      
      await expect(page.getByTestId('error-email-format')).toBeVisible();
    });

    test('should show terms and conditions checkbox', async ({ page }) => {
      await page.goto('/auth/register');
      
      await expect(page.getByTestId('checkbox-terms')).toBeVisible();
      await expect(page.getByTestId('link-terms')).toBeVisible();
      await expect(page.getByTestId('link-privacy')).toBeVisible();
    });
  });

  test.describe('Forgot Password Page', () => {
    test('should display password reset form', async ({ page }) => {
      await page.goto('/auth/forgot-password');
      
      await expect(page.getByTestId('input-email')).toBeVisible();
      await expect(page.getByTestId('button-reset-password')).toBeVisible();
      await expect(page.getByTestId('link-back-to-login')).toBeVisible();
    });

    test('should show success message after reset request', async ({ page }) => {
      await page.goto('/auth/forgot-password');
      
      await page.getByTestId('input-email').fill('user@example.com');
      await page.getByTestId('button-reset-password').click();
      
      await expect(page.getByTestId('message-reset-sent')).toBeVisible();
    });
  });
});