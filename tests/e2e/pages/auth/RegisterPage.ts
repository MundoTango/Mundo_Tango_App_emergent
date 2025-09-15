import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class RegisterPage extends BasePage {
  // Selectors
  private readonly pageTitle: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly usernameInput: Locator;
  private readonly birthDateInput: Locator;
  private readonly phoneInput: Locator;
  private readonly termsCheckbox: Locator;
  private readonly privacyCheckbox: Locator;
  private readonly marketingCheckbox: Locator;
  private readonly registerButton: Locator;
  private readonly loginLink: Locator;
  private readonly googleSignupButton: Locator;
  private readonly githubSignupButton: Locator;
  private readonly passwordStrengthIndicator: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.pageTitle = page.locator('[data-testid="text-register-title"]');
    this.emailInput = page.locator('[data-testid="input-email"]');
    this.passwordInput = page.locator('[data-testid="input-password"]');
    this.confirmPasswordInput = page.locator('[data-testid="input-confirm-password"]');
    this.firstNameInput = page.locator('[data-testid="input-first-name"]');
    this.lastNameInput = page.locator('[data-testid="input-last-name"]');
    this.usernameInput = page.locator('[data-testid="input-username"]');
    this.birthDateInput = page.locator('[data-testid="input-birth-date"]');
    this.phoneInput = page.locator('[data-testid="input-phone"]');
    this.termsCheckbox = page.locator('[data-testid="checkbox-terms"]');
    this.privacyCheckbox = page.locator('[data-testid="checkbox-privacy"]');
    this.marketingCheckbox = page.locator('[data-testid="checkbox-marketing"]');
    this.registerButton = page.locator('[data-testid="button-register"]');
    this.loginLink = page.locator('[data-testid="link-login"]');
    this.googleSignupButton = page.locator('[data-testid="button-google-signup"]');
    this.githubSignupButton = page.locator('[data-testid="button-github-signup"]');
    this.passwordStrengthIndicator = page.locator('[data-testid="password-strength"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  // Navigation methods
  async navigateToRegister(): Promise<void> {
    await this.goto('/auth/register');
  }

  async navigateToLogin(): Promise<void> {
    await this.loginLink.click();
    await this.waitForPageLoad();
  }

  // Action methods
  async fillRegistrationForm(data: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    username?: string;
    birthDate?: string;
    phone?: string;
  }): Promise<void> {
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.confirmPassword);
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    
    if (data.username) {
      await this.usernameInput.fill(data.username);
    }
    
    if (data.birthDate) {
      await this.birthDateInput.fill(data.birthDate);
    }
    
    if (data.phone) {
      await this.phoneInput.fill(data.phone);
    }
  }

  async acceptTermsAndConditions(): Promise<void> {
    await this.termsCheckbox.check();
    await this.privacyCheckbox.check();
  }

  async acceptMarketing(): Promise<void> {
    await this.marketingCheckbox.check();
  }

  async submitRegistration(): Promise<void> {
    await this.registerButton.click();
    await this.waitForPageLoad();
  }

  async registerWithGoogle(): Promise<void> {
    await this.googleSignupButton.click();
    // Handle OAuth flow
  }

  async registerWithGithub(): Promise<void> {
    await this.githubSignupButton.click();
    // Handle OAuth flow
  }

  async completeRegistration(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<void> {
    await this.fillRegistrationForm({
      ...data,
      confirmPassword: data.password,
    });
    await this.acceptTermsAndConditions();
    await this.submitRegistration();
  }

  // Validation methods
  async verifyPasswordStrength(strength: 'weak' | 'medium' | 'strong'): Promise<void> {
    await this.passwordStrengthIndicator.waitFor({ state: 'visible' });
    const strengthClass = await this.passwordStrengthIndicator.getAttribute('class');
    expect(strengthClass).toContain(strength);
  }

  async verifyErrorMessage(message: string): Promise<void> {
    await this.errorMessage.waitFor({ state: 'visible' });
    const text = await this.errorMessage.textContent();
    expect(text).toContain(message);
  }

  async verifyFieldError(field: string, error: string): Promise<void> {
    const fieldError = this.page.locator(`[data-testid="error-${field}"]`);
    await fieldError.waitFor({ state: 'visible' });
    const text = await fieldError.textContent();
    expect(text).toContain(error);
  }

  async isRegistrationSuccessful(): Promise<boolean> {
    // Check if redirected to onboarding or dashboard
    const url = this.getUrl();
    return url.includes('/onboarding') || url.includes('/dashboard');
  }

  async verifyPageElements(): Promise<void> {
    const expectedElements = [
      '[data-testid="text-register-title"]',
      '[data-testid="input-email"]',
      '[data-testid="input-password"]',
      '[data-testid="input-confirm-password"]',
      '[data-testid="input-first-name"]',
      '[data-testid="input-last-name"]',
      '[data-testid="checkbox-terms"]',
      '[data-testid="checkbox-privacy"]',
      '[data-testid="button-register"]',
    ];
    
    await this.verifyPageStructure(expectedElements);
  }

  // Accessibility and visual regression
  async checkPageAccessibility(): Promise<void> {
    await this.checkAccessibility();
  }

  async takePageSnapshot(name?: string): Promise<void> {
    await this.takeVisualSnapshot(name || 'register-page');
  }

  async takeFormSnapshot(): Promise<void> {
    await this.takeElementSnapshot('[data-testid="register-form"]', 'register-form');
  }
}