import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Login Page Object Model
 */
export class LoginPage extends BasePage {
  private emailInput = '[data-testid="input-email"]';
  private passwordInput = '[data-testid="input-password"]';
  private loginButton = '[data-testid="button-login"]';
  private registerLink = '[data-testid="link-register"]';
  private forgotPasswordLink = '[data-testid="link-forgot-password"]';
  private rememberMeCheckbox = '[data-testid="checkbox-remember-me"]';
  private errorMessage = '[data-testid="text-error-message"]';
  private googleLoginButton = '[data-testid="button-google-login"]';
  private githubLoginButton = '[data-testid="button-github-login"]';
  
  constructor(page: Page) {
    super(page);
  }
  
  /**
   * Navigate to login page
   */
  async goto(): Promise<void> {
    await super.goto('/auth/login');
  }
  
  /**
   * Fill login form
   */
  async fillLoginForm(email: string, password: string): Promise<void> {
    await this.fillInput(this.emailInput, email);
    await this.fillInput(this.passwordInput, password);
  }
  
  /**
   * Submit login form
   */
  async submitLogin(): Promise<void> {
    await this.clickElement(this.loginButton);
  }
  
  /**
   * Login with credentials
   */
  async login(email: string, password: string, rememberMe = false): Promise<void> {
    await this.fillLoginForm(email, password);
    
    if (rememberMe) {
      await this.toggleCheckbox(this.rememberMeCheckbox, true);
    }
    
    await this.submitLogin();
    
    // Wait for redirect
    await this.page.waitForURL((url) => !url.href.includes('/auth/login'), {
      timeout: 10000,
    });
  }
  
  /**
   * Login with Google
   */
  async loginWithGoogle(): Promise<void> {
    await this.clickElement(this.googleLoginButton);
    // Handle OAuth flow if needed
  }
  
  /**
   * Login with GitHub
   */
  async loginWithGitHub(): Promise<void> {
    await this.clickElement(this.githubLoginButton);
    // Handle OAuth flow if needed
  }
  
  /**
   * Navigate to register page
   */
  async goToRegister(): Promise<void> {
    await this.clickElement(this.registerLink);
    await this.page.waitForURL('**/auth/register');
  }
  
  /**
   * Navigate to forgot password page
   */
  async goToForgotPassword(): Promise<void> {
    await this.clickElement(this.forgotPasswordLink);
    await this.page.waitForURL('**/auth/forgot-password');
  }
  
  /**
   * Get error message
   */
  async getErrorMessage(): Promise<string> {
    return await this.getTextContent(this.errorMessage);
  }
  
  /**
   * Check if login button is enabled
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    const button = this.page.locator(this.loginButton);
    return await button.isEnabled();
  }
  
  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    // Check if redirected away from login page
    const url = this.page.url();
    return !url.includes('/auth/login');
  }
  
  /**
   * Validate login form
   */
  async validateLoginForm(): Promise<{
    emailError?: string;
    passwordError?: string;
  }> {
    const errors: any = {};
    
    // Check email validation
    const emailError = await this.page.locator(`${this.emailInput} ~ .error-text`).textContent();
    if (emailError) errors.emailError = emailError;
    
    // Check password validation
    const passwordError = await this.page.locator(`${this.passwordInput} ~ .error-text`).textContent();
    if (passwordError) errors.passwordError = passwordError;
    
    return errors;
  }
}