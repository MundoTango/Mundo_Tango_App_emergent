import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page object model for Step 1: Create Account
 * Handles basic account creation form
 */
export class CreateAccountPage extends BasePage {
  readonly nameInput: Locator;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly termsCheckbox: Locator;
  readonly privacyCheckbox: Locator;
  readonly continueButton: Locator;
  readonly backButton: Locator;
  readonly googleSignupButton: Locator;
  readonly facebookSignupButton: Locator;
  readonly progressBar: Locator;
  readonly errorMessage: Locator;
  readonly passwordStrengthIndicator: Locator;
  readonly usernameAvailability: Locator;

  constructor(page: Page) {
    super(page);
    
    // Form fields
    this.nameInput = page.locator('[data-testid="input-name"]');
    this.usernameInput = page.locator('[data-testid="input-username"]');
    this.emailInput = page.locator('[data-testid="input-email"]');
    this.passwordInput = page.locator('[data-testid="input-password"]');
    this.confirmPasswordInput = page.locator('[data-testid="input-confirm-password"]');
    
    // Checkboxes
    this.termsCheckbox = page.locator('[data-testid="checkbox-terms"]');
    this.privacyCheckbox = page.locator('[data-testid="checkbox-privacy"]');
    
    // Buttons
    this.continueButton = page.locator('[data-testid="button-continue-step-1"]');
    this.backButton = page.locator('[data-testid="button-back"]');
    this.googleSignupButton = page.locator('[data-testid="button-google"]');
    this.facebookSignupButton = page.locator('[data-testid="button-facebook"]');
    
    // UI elements
    this.progressBar = page.locator('[data-testid="progress-bar"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.passwordStrengthIndicator = page.locator('[data-testid="password-strength"]');
    this.usernameAvailability = page.locator('[data-testid="username-availability"]');
  }

  async fillAccountDetails(data: {
    name: string;
    username: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }) {
    await this.nameInput.fill(data.name);
    await this.usernameInput.fill(data.username);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.confirmPassword || data.password);
  }

  async acceptTermsAndPrivacy() {
    await this.termsCheckbox.check();
    await this.privacyCheckbox.check();
  }

  async continueToNextStep() {
    await this.continueButton.click();
  }

  async goBack() {
    await this.backButton.click();
  }

  async checkPasswordStrength(): Promise<string> {
    return await this.passwordStrengthIndicator.textContent() || '';
  }

  async checkUsernameAvailability(): Promise<boolean> {
    const text = await this.usernameAvailability.textContent() || '';
    return text.includes('available');
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  async isFormValid(): Promise<boolean> {
    return await this.continueButton.isEnabled();
  }

  async getProgressPercentage(): Promise<number> {
    const progress = await this.progressBar.getAttribute('aria-valuenow');
    return parseInt(progress || '0');
  }

  async attemptSocialSignup(provider: 'google' | 'facebook') {
    if (provider === 'google') {
      await this.googleSignupButton.click();
    } else {
      await this.facebookSignupButton.click();
    }
  }
}