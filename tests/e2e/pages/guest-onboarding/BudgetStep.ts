import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page object model for Step 5: Budget Range
 * Handles budget preferences and currency selection
 */
export class BudgetStep extends BasePage {
  readonly stepTitle: Locator;
  readonly stepDescription: Locator;
  readonly currencySelect: Locator;
  readonly minBudgetInput: Locator;
  readonly maxBudgetInput: Locator;
  readonly budgetSlider: Locator;
  readonly budgetDisplay: Locator;
  readonly continueButton: Locator;
  readonly backButton: Locator;
  readonly progressBar: Locator;
  readonly stepIndicator: Locator;
  readonly budgetValidationMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Step elements
    this.stepTitle = page.locator('[data-testid="step-title-budget"]');
    this.stepDescription = page.locator('[data-testid="step-description-budget"]');
    this.progressBar = page.locator('[data-testid="progress-bar"]');
    this.stepIndicator = page.locator('[data-testid="step-indicator"]');

    // Budget inputs
    this.currencySelect = page.locator('[data-testid="select-currency"]');
    this.minBudgetInput = page.locator('[data-testid="input-min-budget"]');
    this.maxBudgetInput = page.locator('[data-testid="input-max-budget"]');
    this.budgetSlider = page.locator('[data-testid="slider-budget"]');
    this.budgetDisplay = page.locator('[data-testid="display-budget-range"]');
    this.budgetValidationMessage = page.locator('[data-testid="validation-budget"]');

    // Navigation buttons
    this.continueButton = page.locator('[data-testid="button-continue-budget"]');
    this.backButton = page.locator('[data-testid="button-back-budget"]');
  }

  async selectCurrency(currency: 'USD' | 'EUR' | 'ARS' | 'GBP') {
    await this.currencySelect.click();
    await this.page.locator(`[data-testid="option-currency-${currency}"]`).click();
  }

  async setMinBudget(amount: number) {
    await this.minBudgetInput.clear();
    await this.minBudgetInput.fill(amount.toString());
  }

  async setMaxBudget(amount: number) {
    await this.maxBudgetInput.clear();
    await this.maxBudgetInput.fill(amount.toString());
  }

  async setBudgetRange(min: number, max: number) {
    await this.setMinBudget(min);
    await this.setMaxBudget(max);
  }

  async useBudgetSlider(minPercentage: number, maxPercentage: number) {
    // Interact with range slider
    const sliderMin = this.budgetSlider.locator('[data-testid="slider-handle-min"]');
    const sliderMax = this.budgetSlider.locator('[data-testid="slider-handle-max"]');
    
    // Get slider dimensions
    const sliderBox = await this.budgetSlider.boundingBox();
    if (sliderBox) {
      const minX = sliderBox.x + (sliderBox.width * minPercentage / 100);
      const maxX = sliderBox.x + (sliderBox.width * maxPercentage / 100);
      
      await sliderMin.dragTo(sliderMin, { targetPosition: { x: minX, y: sliderBox.y } });
      await sliderMax.dragTo(sliderMax, { targetPosition: { x: maxX, y: sliderBox.y } });
    }
  }

  async getSelectedCurrency(): Promise<string> {
    return await this.currencySelect.locator('[data-selected="true"]').textContent() || '';
  }

  async getMinBudget(): Promise<number> {
    const value = await this.minBudgetInput.inputValue();
    return parseInt(value) || 0;
  }

  async getMaxBudget(): Promise<number> {
    const value = await this.maxBudgetInput.inputValue();
    return parseInt(value) || 0;
  }

  async getBudgetRange(): Promise<{ min: number; max: number; currency: string }> {
    return {
      min: await this.getMinBudget(),
      max: await this.getMaxBudget(),
      currency: await this.getSelectedCurrency()
    };
  }

  async getBudgetDisplayText(): Promise<string> {
    return await this.budgetDisplay.textContent() || '';
  }

  async continueToNextStep() {
    await this.continueButton.click();
    await this.waitForPageLoad();
  }

  async goBackToPreviousStep() {
    await this.backButton.click();
    await this.waitForPageLoad();
  }

  async getProgressPercentage(): Promise<number> {
    const progressValue = await this.progressBar.getAttribute('aria-valuenow');
    return progressValue ? parseInt(progressValue) : 0;
  }

  async isStepComplete(): Promise<boolean> {
    const budget = await this.getBudgetRange();
    return budget.min > 0 && budget.max > 0 && budget.max >= budget.min;
  }

  async validateStep(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const budget = await this.getBudgetRange();

    if (budget.min <= 0) {
      errors.push('Minimum budget must be greater than 0');
    }

    if (budget.max <= 0) {
      errors.push('Maximum budget must be greater than 0');
    }

    if (budget.max < budget.min) {
      errors.push('Maximum budget must be greater than or equal to minimum budget');
    }

    if (!budget.currency) {
      errors.push('Please select a currency');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async fillSampleData() {
    await this.selectCurrency('USD');
    await this.setBudgetRange(50, 150);
  }

  async clearAllInputs() {
    await this.minBudgetInput.clear();
    await this.maxBudgetInput.clear();
  }

  async takeSnapshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/guest-onboarding-budget-${name}.png`,
      fullPage: true
    });
  }

  async checkAccessibility() {
    const { injectAxe, checkA11y } = await import('@axe-core/playwright');
    await injectAxe(this.page);
    await checkA11y(this.page, '[data-testid="guest-onboarding-budget"]', {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      }
    });
  }

  async testInvalidBudgetInputs() {
    // Test negative values
    await this.setMinBudget(-100);
    await this.setMaxBudget(-50);
    const negativeValidation = await this.budgetValidationMessage.isVisible();

    // Test max less than min
    await this.setMinBudget(100);
    await this.setMaxBudget(50);
    const rangeValidation = await this.budgetValidationMessage.isVisible();

    // Test non-numeric input
    await this.minBudgetInput.fill('abc');
    await this.maxBudgetInput.fill('xyz');
    const nonNumericValidation = await this.budgetValidationMessage.isVisible();

    return {
      negativeValidation,
      rangeValidation,
      nonNumericValidation
    };
  }

  async getCurrencyConversionRate(from: string, to: string): Promise<number> {
    // Mock conversion rates for testing
    const rates: { [key: string]: number } = {
      'USD-EUR': 0.85,
      'USD-ARS': 350,
      'USD-GBP': 0.73,
      'EUR-USD': 1.18,
      'EUR-ARS': 411,
      'EUR-GBP': 0.86,
      'ARS-USD': 0.0029,
      'ARS-EUR': 0.0024,
      'ARS-GBP': 0.0021,
      'GBP-USD': 1.37,
      'GBP-EUR': 1.16,
      'GBP-ARS': 476
    };
    
    return rates[`${from}-${to}`] || 1;
  }

  async convertBudget(amount: number, from: string, to: string): Promise<number> {
    const rate = await this.getCurrencyConversionRate(from, to);
    return Math.round(amount * rate);
  }
}