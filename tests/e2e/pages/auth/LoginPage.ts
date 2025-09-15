import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class LoginPage extends BasePage {
  // Selectors
  private readonly pageTitle: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly rememberMeCheckbox: Locator;
  private readonly loginButton: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly registerLink: Locator;
  private readonly googleLoginButton: Locator;
  private readonly githubLoginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly successMessage: Locator;
  private readonly loadingIndicator: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.pageTitle = page.locator('[data-testid="text-login-title"]');
    this.emailInput = page.locator('[data-testid="input-email"]');
    this.passwordInput = page.locator('[data-testid="input-password"]');
    this.rememberMeCheckbox = page.locator('[data-testid="checkbox-remember-me"]');
    this.loginButton = page.locator('[data-testid="button-login"]');
    this.forgotPasswordLink = page.locator('[data-testid="link-forgot-password"]');
    this.registerLink = page.locator('[data-testid="link-register"]');
    this.googleLoginButton = page.locator('[data-testid="button-google-login"]');
    this.githubLoginButton = page.locator('[data-testid="button-github-login"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.successMessage = page.locator('[data-testid="success-message"]');
    this.loadingIndicator = page.locator('[data-testid="loading-indicator"]');
  }

  // Navigation methods
  async navigateToLogin(): Promise<void> {
    await this.goto('/auth/login');
  }

  async navigateToRegister(): Promise<void> {
    await this.registerLink.click();
    await this.waitForPageLoad();
  }

  async navigateToForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
    await this.waitForPageLoad();
  }

  // Action methods
  async fillLoginForm(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async checkRememberMe(): Promise<void> {
    await this.rememberMeCheckbox.check();
  }

  async submitLogin(): Promise<void> {
    await this.loginButton.click();
    await this.waitForPageLoad();
  }

  async login(email: string, password: string, rememberMe = false): Promise<void> {
    await this.fillLoginForm(email, password);
    if (rememberMe) {
      await this.checkRememberMe();
    }
    await this.submitLogin();
  }

  async loginWithGoogle(): Promise<void> {
    await this.googleLoginButton.click();
    // Handle OAuth flow
  }

  async loginWithGithub(): Promise<void> {
    await this.githubLoginButton.click();
    // Handle OAuth flow
  }

  // Validation methods
  async verifyLoginSuccess(): Promise<void> {
    const url = this.getUrl();
    expect(url).not.toContain('/auth/login');
    expect(url).toMatch(/\/(dashboard|home|timeline)/);
  }

  async verifyErrorMessage(message: string): Promise<void> {
    await this.errorMessage.waitFor({ state: 'visible' });
    const text = await this.errorMessage.textContent();
    expect(text).toContain(message);
  }

  async verifySuccessMessage(message: string): Promise<void> {
    await this.successMessage.waitFor({ state: 'visible' });
    const text = await this.successMessage.textContent();
    expect(text).toContain(message);
  }

  async isLoggedIn(): Promise<boolean> {
    const url = this.getUrl();
    return !url.includes('/auth/login');
  }

  async verifyPageElements(): Promise<void> {
    const expectedElements = [
      '[data-testid="text-login-title"]',
      '[data-testid="input-email"]',
      '[data-testid="input-password"]',
      '[data-testid="button-login"]',
      '[data-testid="link-forgot-password"]',
      '[data-testid="link-register"]',
    ];
    
    await this.verifyPageStructure(expectedElements);
  }

  async verifyFieldValidation(field: 'email' | 'password', expectedError: string): Promise<void> {
    const fieldError = this.page.locator(`[data-testid="error-${field}"]`);
    await fieldError.waitFor({ state: 'visible' });
    const text = await fieldError.textContent();
    expect(text).toContain(expectedError);
  }

  // Accessibility and visual regression
  async checkPageAccessibility(): Promise<void> {
    await this.checkAccessibility();
  }

  async takePageSnapshot(name?: string): Promise<void> {
    await this.takeVisualSnapshot(name || 'login-page');
  }

  async takeFormSnapshot(): Promise<void> {
    await this.takeElementSnapshot('[data-testid="login-form"]', 'login-form');
  }
}