import { Page, Locator, expect } from '@playwright/test';
import { waitForElement, checkToastMessage } from '../helpers/test-helpers';

/**
 * Base Page Object Model for Mundo Tango
 */
export class BasePage {
  protected page: Page;
  
  // Common elements
  protected navbar: Locator;
  protected sidebar: Locator;
  protected footer: Locator;
  protected loadingSpinner: Locator;
  protected toastContainer: Locator;
  
  constructor(page: Page) {
    this.page = page;
    
    // Initialize common locators
    this.navbar = page.locator('[data-testid="navbar"]');
    this.sidebar = page.locator('[data-testid="sidebar"]');
    this.footer = page.locator('[data-testid="footer"]');
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    this.toastContainer = page.locator('[data-testid="toast-container"]');
  }
  
  /**
   * Navigate to a specific path
   */
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }
  
  /**
   * Wait for page to load
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.waitForLoadingToComplete();
  }
  
  /**
   * Wait for loading spinner to disappear
   */
  async waitForLoadingToComplete(): Promise<void> {
    const hasSpinner = await this.loadingSpinner.isVisible();
    if (hasSpinner) {
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 30000 });
    }
  }
  
  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }
  
  /**
   * Get current URL
   */
  getUrl(): string {
    return this.page.url();
  }
  
  /**
   * Check if element is visible
   */
  async isElementVisible(selector: string): Promise<boolean> {
    const element = this.page.locator(selector);
    return await element.isVisible();
  }
  
  /**
   * Click element
   */
  async clickElement(selector: string): Promise<void> {
    const element = await waitForElement(this.page, selector);
    await element.click();
  }
  
  /**
   * Fill input field
   */
  async fillInput(selector: string, value: string): Promise<void> {
    const element = await waitForElement(this.page, selector);
    await element.fill(value);
  }
  
  /**
   * Select option from dropdown
   */
  async selectOption(selector: string, value: string): Promise<void> {
    const element = await waitForElement(this.page, selector);
    await element.selectOption(value);
  }
  
  /**
   * Check/uncheck checkbox
   */
  async toggleCheckbox(selector: string, checked: boolean): Promise<void> {
    const element = await waitForElement(this.page, selector);
    if (checked) {
      await element.check();
    } else {
      await element.uncheck();
    }
  }
  
  /**
   * Get text content
   */
  async getTextContent(selector: string): Promise<string> {
    const element = await waitForElement(this.page, selector);
    return (await element.textContent()) || '';
  }
  
  /**
   * Take screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }
  
  /**
   * Check for toast message
   */
  async expectToastMessage(message: string, type: 'success' | 'error' | 'info' = 'success'): Promise<void> {
    await checkToastMessage(this.page, message, type);
  }
  
  /**
   * Navigate using navbar
   */
  async navigateViaNavbar(linkText: string): Promise<void> {
    await this.navbar.locator(`text="${linkText}"`).click();
    await this.waitForPageLoad();
  }
  
  /**
   * Navigate using sidebar
   */
  async navigateViaSidebar(linkText: string): Promise<void> {
    await this.sidebar.locator(`text="${linkText}"`).click();
    await this.waitForPageLoad();
  }
  
  /**
   * Search for content
   */
  async search(query: string): Promise<void> {
    const searchInput = this.page.locator('[data-testid="input-search"]');
    await searchInput.fill(query);
    await searchInput.press('Enter');
    await this.waitForPageLoad();
  }
  
  /**
   * Open user menu
   */
  async openUserMenu(): Promise<void> {
    await this.page.locator('[data-testid="button-user-menu"]').click();
  }
  
  /**
   * Logout
   */
  async logout(): Promise<void> {
    await this.openUserMenu();
    await this.page.locator('[data-testid="button-logout"]').click();
    await this.page.waitForURL('**/auth/login');
  }
  
  /**
   * Check page accessibility
   */
  async checkAccessibility(): Promise<void> {
    const { assertNoA11yViolations } = await import('../helpers/accessibility');
    await assertNoA11yViolations(this.page);
  }

  /**
   * Take visual regression snapshot
   */
  async takeVisualSnapshot(name: string, options?: {
    fullPage?: boolean;
    clip?: { x: number; y: number; width: number; height: number };
    mask?: Locator[];
    maxDiffPixels?: number;
    maxDiffPixelRatio?: number;
    threshold?: number;
  }): Promise<void> {
    await expect(this.page).toHaveScreenshot(`${name}.png`, {
      fullPage: options?.fullPage ?? true,
      clip: options?.clip,
      mask: options?.mask,
      maxDiffPixels: options?.maxDiffPixels ?? 100,
      maxDiffPixelRatio: options?.maxDiffPixelRatio ?? 0.01,
      threshold: options?.threshold ?? 0.2,
      animations: 'disabled',
    });
  }

  /**
   * Take element snapshot for visual regression
   */
  async takeElementSnapshot(selector: string, name: string, options?: {
    mask?: Locator[];
    maxDiffPixels?: number;
    maxDiffPixelRatio?: number;
    threshold?: number;
  }): Promise<void> {
    const element = this.page.locator(selector);
    await expect(element).toHaveScreenshot(`${name}-element.png`, {
      mask: options?.mask,
      maxDiffPixels: options?.maxDiffPixels ?? 50,
      maxDiffPixelRatio: options?.maxDiffPixelRatio ?? 0.01,
      threshold: options?.threshold ?? 0.2,
      animations: 'disabled',
    });
  }

  /**
   * Verify page structure and content
   */
  async verifyPageStructure(expectedElements: string[]): Promise<void> {
    for (const selector of expectedElements) {
      await expect(this.page.locator(selector)).toBeVisible();
    }
  }

  /**
   * Check for broken links on page
   */
  async checkForBrokenLinks(): Promise<{ url: string; status: number }[]> {
    const links = await this.page.locator('a[href]').all();
    const brokenLinks: { url: string; status: number }[] = [];

    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href && href.startsWith('http')) {
        try {
          const response = await this.page.request.head(href);
          if (response.status() >= 400) {
            brokenLinks.push({ url: href, status: response.status() });
          }
        } catch (error) {
          brokenLinks.push({ url: href || '', status: 0 });
        }
      }
    }

    return brokenLinks;
  }
  
  /**
   * Wait for API response
   */
  async waitForApiResponse(urlPattern: string | RegExp): Promise<any> {
    const response = await this.page.waitForResponse(
      (res) => {
        const url = res.url();
        return typeof urlPattern === 'string'
          ? url.includes(urlPattern)
          : urlPattern.test(url);
      }
    );
    return await response.json();
  }
  
  /**
   * Scroll to bottom
   */
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }
  
  /**
   * Scroll to top
   */
  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo(0, 0);
    });
  }
  
  /**
   * Refresh page
   */
  async refresh(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
  }
  
  /**
   * Go back
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.waitForPageLoad();
  }
  
  /**
   * Go forward
   */
  async goForward(): Promise<void> {
    await this.page.goForward();
    await this.waitForPageLoad();
  }
}