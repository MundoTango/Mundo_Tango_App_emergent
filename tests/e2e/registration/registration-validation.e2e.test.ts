import { test, expect } from '@playwright/test';
import { CreateAccountPage } from '../pages/registration/CreateAccountPage';
import { ProfileDetailsPage } from '../pages/registration/ProfileDetailsPage';
import { DancePreferencesPage } from '../pages/registration/DancePreferencesPage';
import { assertNoA11yViolations } from '../helpers/accessibility';

/**
 * Additional validation tests for Mundo Tango Registration
 * Focus on edge cases and specific validation scenarios
 */

test.describe('Registration Validation Edge Cases', () => {
  let createAccountPage: CreateAccountPage;
  let profileDetailsPage: ProfileDetailsPage;
  let dancePreferencesPage: DancePreferencesPage;

  test.beforeEach(async ({ page }) => {
    createAccountPage = new CreateAccountPage(page);
    profileDetailsPage = new ProfileDetailsPage(page);
    dancePreferencesPage = new DancePreferencesPage(page);
    
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Password Validation', () => {
    test('Password strength indicator updates in real-time', async ({ page }) => {
      // Test weak password
      await createAccountPage.passwordInput.fill('abc');
      await page.waitForTimeout(300);
      let strength = await createAccountPage.checkPasswordStrength();
      expect(strength).toContain('Weak');
      
      // Test medium password
      await createAccountPage.passwordInput.fill('Abc123');
      await page.waitForTimeout(300);
      strength = await createAccountPage.checkPasswordStrength();
      expect(strength).toContain('Medium');
      
      // Test strong password
      await createAccountPage.passwordInput.fill('Abc123!@#Secure');
      await page.waitForTimeout(300);
      strength = await createAccountPage.checkPasswordStrength();
      expect(strength).toContain('Strong');
      
      // Test very strong password
      await createAccountPage.passwordInput.fill('Abc123!@#SecureP@ssw0rd2024');
      await page.waitForTimeout(300);
      strength = await createAccountPage.checkPasswordStrength();
      expect(['Strong', 'Very Strong']).toContain(strength);
    });

    test('Password requirements tooltip', async ({ page }) => {
      // Focus on password field
      await createAccountPage.passwordInput.focus();
      
      // Check if requirements tooltip is visible
      const tooltip = page.locator('[data-testid="password-requirements"]');
      await expect(tooltip).toBeVisible();
      
      // Verify requirements text
      await expect(tooltip).toContainText('8 characters');
      await expect(tooltip).toContainText('uppercase');
      await expect(tooltip).toContainText('lowercase');
      await expect(tooltip).toContainText('number');
      await expect(tooltip).toContainText('special character');
    });
  });

  test.describe('Username Validation', () => {
    test('Username special characters validation', async ({ page }) => {
      const invalidUsernames = [
        'user@name',  // @ symbol
        'user name',  // space
        'user.name',  // dot
        'user-name!', // exclamation
        'u',          // too short
        'a'.repeat(25), // too long
      ];
      
      for (const username of invalidUsernames) {
        await createAccountPage.usernameInput.fill(username);
        await createAccountPage.usernameInput.blur();
        await page.waitForTimeout(500);
        
        const errorMessage = await createAccountPage.getErrorMessage();
        expect(errorMessage).toBeTruthy();
        
        // Clear for next test
        await createAccountPage.usernameInput.clear();
      }
      
      // Test valid usernames
      const validUsernames = [
        'user_name',
        'username123',
        'user_123',
        'abc',
        'a'.repeat(20),
      ];
      
      for (const username of validUsernames) {
        await createAccountPage.usernameInput.fill(username);
        await createAccountPage.usernameInput.blur();
        await page.waitForTimeout(500);
        
        // Should not show error for valid usernames
        const errorMessage = await createAccountPage.getErrorMessage();
        expect(errorMessage).toBeFalsy();
        
        // Clear for next test
        await createAccountPage.usernameInput.clear();
      }
    });

    test('Username real-time availability check', async ({ page }) => {
      // Mock API responses
      await page.route('**/api/users/check-availability', route => {
        const url = new URL(route.request().url());
        const username = url.searchParams.get('username');
        
        const unavailableUsernames = ['admin', 'test', 'user123'];
        const available = !unavailableUsernames.includes(username || '');
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ available }),
        });
      });
      
      // Test unavailable username
      await createAccountPage.usernameInput.fill('admin');
      await page.waitForTimeout(1000); // Debounce delay
      
      let isAvailable = await createAccountPage.checkUsernameAvailability();
      expect(isAvailable).toBe(false);
      
      // Test available username
      await createAccountPage.usernameInput.clear();
      await createAccountPage.usernameInput.fill(`unique_user_${Date.now()}`);
      await page.waitForTimeout(1000); // Debounce delay
      
      isAvailable = await createAccountPage.checkUsernameAvailability();
      expect(isAvailable).toBe(true);
    });
  });

  test.describe('Email Validation', () => {
    test('Email format validation', async ({ page }) => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@invalid.com',
        'invalid@.com',
        'invalid@domain',
        'invalid @domain.com',
        'invalid@domain .com',
      ];
      
      for (const email of invalidEmails) {
        await createAccountPage.emailInput.fill(email);
        await createAccountPage.emailInput.blur();
        await page.waitForTimeout(500);
        
        const errorMessage = await createAccountPage.getErrorMessage();
        expect(errorMessage).toContain('valid email');
        
        // Clear for next test
        await createAccountPage.emailInput.clear();
      }
      
      // Test valid emails
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user123@subdomain.example.com',
      ];
      
      for (const email of validEmails) {
        await createAccountPage.emailInput.fill(email);
        await createAccountPage.emailInput.blur();
        await page.waitForTimeout(500);
        
        // Should not show error for valid emails
        const errorMessage = await createAccountPage.getErrorMessage();
        expect(errorMessage).toBeFalsy();
        
        // Clear for next test
        await createAccountPage.emailInput.clear();
      }
    });

    test('Disposable email detection', async ({ page }) => {
      // Mock API to detect disposable emails
      await page.route('**/api/auth/validate-email', route => {
        const body = route.request().postDataJSON();
        const disposableDomains = ['tempmail.com', '10minutemail.com', 'throwaway.email'];
        const email = body?.email || '';
        const domain = email.split('@')[1];
        const isDisposable = disposableDomains.includes(domain);
        
        route.fulfill({
          status: isDisposable ? 400 : 200,
          contentType: 'application/json',
          body: JSON.stringify({
            valid: !isDisposable,
            message: isDisposable ? 'Disposable email addresses are not allowed' : 'Valid email',
          }),
        });
      });
      
      // Test disposable email
      await createAccountPage.emailInput.fill('test@tempmail.com');
      await createAccountPage.emailInput.blur();
      await page.waitForTimeout(1000);
      
      const errorMessage = await createAccountPage.getErrorMessage();
      expect(errorMessage).toContain('Disposable');
    });
  });

  test.describe('Profile Details Validation', () => {
    test('Bio character limit enforcement', async ({ page }) => {
      // Navigate to profile details step
      await createAccountPage.fillAccountDetails({
        name: 'Test User',
        username: `test_${Date.now()}`,
        email: `test.${Date.now()}@example.com`,
        password: 'Test123!@#',
      });
      await createAccountPage.acceptTermsAndPrivacy();
      await createAccountPage.continueToNextStep();
      await page.waitForLoadState('networkidle');
      
      // Test character limit
      const longBio = 'a'.repeat(501);
      await profileDetailsPage.bioTextarea.fill(longBio);
      
      // Check character count
      const charCount = await profileDetailsPage.getBioCharacterCount();
      expect(charCount).toBe(500); // Should be capped at 500
      
      // Verify actual input value is truncated
      const actualValue = await profileDetailsPage.bioTextarea.inputValue();
      expect(actualValue.length).toBe(500);
    });

    test('Birth date validation', async ({ page }) => {
      // Navigate to profile details step
      await createAccountPage.fillAccountDetails({
        name: 'Test User',
        username: `test_${Date.now()}`,
        email: `test.${Date.now()}@example.com`,
        password: 'Test123!@#',
      });
      await createAccountPage.acceptTermsAndPrivacy();
      await createAccountPage.continueToNextStep();
      await page.waitForLoadState('networkidle');
      
      // Test future date (invalid)
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      await profileDetailsPage.birthDateInput.fill(futureDate.toISOString().split('T')[0]);
      await profileDetailsPage.birthDateInput.blur();
      await page.waitForTimeout(500);
      
      let errorMessage = await profileDetailsPage.errorMessage.textContent();
      expect(errorMessage).toContain('future');
      
      // Test too young (under 13)
      const tooYoung = new Date();
      tooYoung.setFullYear(tooYoung.getFullYear() - 10);
      await profileDetailsPage.birthDateInput.fill(tooYoung.toISOString().split('T')[0]);
      await profileDetailsPage.birthDateInput.blur();
      await page.waitForTimeout(500);
      
      errorMessage = await profileDetailsPage.errorMessage.textContent();
      expect(errorMessage).toContain('13 years');
      
      // Test valid date
      const validDate = new Date();
      validDate.setFullYear(validDate.getFullYear() - 25);
      await profileDetailsPage.birthDateInput.fill(validDate.toISOString().split('T')[0]);
      await profileDetailsPage.birthDateInput.blur();
      await page.waitForTimeout(500);
      
      errorMessage = await profileDetailsPage.errorMessage.textContent();
      expect(errorMessage).toBeFalsy();
    });

    test('Phone number validation', async ({ page }) => {
      // Navigate to profile details step
      await createAccountPage.fillAccountDetails({
        name: 'Test User',
        username: `test_${Date.now()}`,
        email: `test.${Date.now()}@example.com`,
        password: 'Test123!@#',
      });
      await createAccountPage.acceptTermsAndPrivacy();
      await createAccountPage.continueToNextStep();
      await page.waitForLoadState('networkidle');
      
      // Test invalid phone numbers
      const invalidPhones = [
        '123',           // Too short
        'abcdefghij',    // Letters
        '123-456',       // Incomplete
        '++123456789',   // Invalid format
      ];
      
      for (const phone of invalidPhones) {
        await profileDetailsPage.phoneInput.fill(phone);
        await profileDetailsPage.phoneInput.blur();
        await page.waitForTimeout(500);
        
        const errorMessage = await profileDetailsPage.errorMessage.textContent();
        expect(errorMessage).toContain('valid phone');
        
        await profileDetailsPage.phoneInput.clear();
      }
      
      // Test valid phone numbers
      const validPhones = [
        '+1234567890',
        '+54 11 4567-8900',
        '(555) 123-4567',
        '+44 20 7123 4567',
      ];
      
      for (const phone of validPhones) {
        await profileDetailsPage.phoneInput.fill(phone);
        await profileDetailsPage.phoneInput.blur();
        await page.waitForTimeout(500);
        
        const errorMessage = await profileDetailsPage.errorMessage.textContent();
        expect(errorMessage).toBeFalsy();
        
        await profileDetailsPage.phoneInput.clear();
      }
    });

    test('Social media handle validation', async ({ page }) => {
      // Navigate to profile details step
      await createAccountPage.fillAccountDetails({
        name: 'Test User',
        username: `test_${Date.now()}`,
        email: `test.${Date.now()}@example.com`,
        password: 'Test123!@#',
      });
      await createAccountPage.acceptTermsAndPrivacy();
      await createAccountPage.continueToNextStep();
      await page.waitForLoadState('networkidle');
      
      // Test Instagram handle
      await profileDetailsPage.instagramInput.fill('@valid_handle');
      await profileDetailsPage.instagramInput.blur();
      
      // Should auto-format (remove @)
      const instagramValue = await profileDetailsPage.instagramInput.inputValue();
      expect(instagramValue).toBe('valid_handle');
      
      // Test Facebook URL
      await profileDetailsPage.facebookInput.fill('https://facebook.com/profile');
      await profileDetailsPage.facebookInput.blur();
      
      // Should extract username
      const facebookValue = await profileDetailsPage.facebookInput.inputValue();
      expect(facebookValue).toBe('profile');
    });
  });

  test.describe('Dance Preferences Validation', () => {
    test('Minimum role selection', async ({ page }) => {
      // Navigate to dance preferences step
      await createAccountPage.fillAccountDetails({
        name: 'Test User',
        username: `test_${Date.now()}`,
        email: `test.${Date.now()}@example.com`,
        password: 'Test123!@#',
      });
      await createAccountPage.acceptTermsAndPrivacy();
      await createAccountPage.continueToNextStep();
      await profileDetailsPage.skipStep();
      await page.waitForLoadState('networkidle');
      
      // Try to continue without selecting any roles
      const continueButton = dancePreferencesPage.continueButton;
      await expect(continueButton).toBeDisabled();
      
      // Select one role
      await dancePreferencesPage.selectRoles(['dancer']);
      
      // Button should now be enabled
      await expect(continueButton).toBeEnabled();
      
      // Verify role count
      const rolesCount = await dancePreferencesPage.getSelectedRolesCount();
      expect(rolesCount).toBe(1);
    });

    test('Years of experience validation', async ({ page }) => {
      // Navigate to dance preferences step
      await createAccountPage.fillAccountDetails({
        name: 'Test User',
        username: `test_${Date.now()}`,
        email: `test.${Date.now()}@example.com`,
        password: 'Test123!@#',
      });
      await createAccountPage.acceptTermsAndPrivacy();
      await createAccountPage.continueToNextStep();
      await profileDetailsPage.skipStep();
      await page.waitForLoadState('networkidle');
      
      // Test negative number
      await dancePreferencesPage.yearsOfExperienceInput.fill('-5');
      await dancePreferencesPage.yearsOfExperienceInput.blur();
      
      // Should be corrected to 0
      const value = await dancePreferencesPage.yearsOfExperienceInput.inputValue();
      expect(parseInt(value)).toBeGreaterThanOrEqual(0);
      
      // Test very large number
      await dancePreferencesPage.yearsOfExperienceInput.fill('100');
      await dancePreferencesPage.yearsOfExperienceInput.blur();
      
      // Should be capped at reasonable maximum (e.g., 70)
      const cappedValue = await dancePreferencesPage.yearsOfExperienceInput.inputValue();
      expect(parseInt(cappedValue)).toBeLessThanOrEqual(70);
    });
  });

  test.describe('Location Validation', () => {
    test('City autocomplete and validation', async ({ page }) => {
      // Navigate to location step
      await createAccountPage.fillAccountDetails({
        name: 'Test User',
        username: `test_${Date.now()}`,
        email: `test.${Date.now()}@example.com`,
        password: 'Test123!@#',
      });
      await createAccountPage.acceptTermsAndPrivacy();
      await createAccountPage.continueToNextStep();
      await profileDetailsPage.skipStep();
      await dancePreferencesPage.skipStep();
      await page.waitForLoadState('networkidle');
      
      // Type partial city name
      await locationSetupPage.cityInput.fill('Buen');
      await page.waitForTimeout(500); // Wait for autocomplete
      
      // Check autocomplete suggestions
      const suggestions = locationSetupPage.cityAutocomplete.locator('.suggestion');
      await expect(suggestions).toHaveCount(1); // At least one suggestion
      
      // Verify Buenos Aires is suggested
      await expect(suggestions.first()).toContainText('Buenos Aires');
      
      // Select suggestion
      await suggestions.first().click();
      
      // Verify city is filled
      const cityValue = await locationSetupPage.cityInput.inputValue();
      expect(cityValue).toBe('Buenos Aires');
      
      // Verify map updates
      await expect(locationSetupPage.mapMarker).toBeVisible();
    });

    test('Postal code format validation', async ({ page }) => {
      // Navigate to location step
      await createAccountPage.fillAccountDetails({
        name: 'Test User',
        username: `test_${Date.now()}`,
        email: `test.${Date.now()}@example.com`,
        password: 'Test123!@#',
      });
      await createAccountPage.acceptTermsAndPrivacy();
      await createAccountPage.continueToNextStep();
      await profileDetailsPage.skipStep();
      await dancePreferencesPage.skipStep();
      await page.waitForLoadState('networkidle');
      
      // Select country first
      await locationSetupPage.selectCountry('Argentina');
      
      // Test invalid postal codes for Argentina
      const invalidPostalCodes = ['123', 'ABCD', '123456'];
      
      for (const postalCode of invalidPostalCodes) {
        await locationSetupPage.postalCodeInput.fill(postalCode);
        await locationSetupPage.postalCodeInput.blur();
        await page.waitForTimeout(500);
        
        // Should show error
        const error = page.locator('[data-testid="postal-code-error"]');
        await expect(error).toBeVisible();
        
        await locationSetupPage.postalCodeInput.clear();
      }
      
      // Test valid postal code
      await locationSetupPage.postalCodeInput.fill('C1043');
      await locationSetupPage.postalCodeInput.blur();
      await page.waitForTimeout(500);
      
      // Should not show error
      const error = page.locator('[data-testid="postal-code-error"]');
      await expect(error).not.toBeVisible();
    });

    test('Hosting capacity validation', async ({ page }) => {
      // Navigate to location step
      await createAccountPage.fillAccountDetails({
        name: 'Test User',
        username: `test_${Date.now()}`,
        email: `test.${Date.now()}@example.com`,
        password: 'Test123!@#',
      });
      await createAccountPage.acceptTermsAndPrivacy();
      await createAccountPage.continueToNextStep();
      await profileDetailsPage.skipStep();
      await dancePreferencesPage.skipStep();
      await page.waitForLoadState('networkidle');
      
      // Enable hosting
      await locationSetupPage.canHostCheckbox.check();
      
      // Test invalid capacity values
      await locationSetupPage.hostingCapacityInput.fill('0');
      await locationSetupPage.hostingCapacityInput.blur();
      
      // Should show error or correct to minimum
      let value = await locationSetupPage.hostingCapacityInput.inputValue();
      expect(parseInt(value)).toBeGreaterThanOrEqual(1);
      
      // Test very large number
      await locationSetupPage.hostingCapacityInput.fill('100');
      await locationSetupPage.hostingCapacityInput.blur();
      
      // Should be capped at reasonable maximum
      value = await locationSetupPage.hostingCapacityInput.inputValue();
      expect(parseInt(value)).toBeLessThanOrEqual(10);
    });
  });

  test.describe('Accessibility Validation', () => {
    test('Form field labels and ARIA attributes', async ({ page }) => {
      // Check all form fields have proper labels
      const formFields = await page.$$('input, select, textarea');
      
      for (const field of formFields) {
        const id = await field.getAttribute('id');
        const ariaLabel = await field.getAttribute('aria-label');
        const ariaLabelledBy = await field.getAttribute('aria-labelledby');
        
        // Should have either label or aria-label
        if (id) {
          const label = await page.$(`label[for="${id}"]`);
          expect(label || ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }
    });

    test('Error messages are announced to screen readers', async ({ page }) => {
      // Trigger an error
      await createAccountPage.emailInput.fill('invalid');
      await createAccountPage.emailInput.blur();
      await page.waitForTimeout(500);
      
      // Check error message has proper ARIA attributes
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toHaveAttribute('role', 'alert');
      await expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    });

    test('Progress indicators are accessible', async ({ page }) => {
      // Check progress bar has proper ARIA attributes
      const progressBar = createAccountPage.progressBar;
      await expect(progressBar).toHaveAttribute('role', 'progressbar');
      await expect(progressBar).toHaveAttribute('aria-valuenow');
      await expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      await expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });
  });
});