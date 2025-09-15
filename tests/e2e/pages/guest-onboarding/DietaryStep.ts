import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page object model for Step 2: Dietary Preferences
 * Handles dietary restrictions and special needs
 */
export class DietaryStep extends BasePage {
  readonly stepTitle: Locator;
  readonly stepDescription: Locator;
  readonly dietaryRestrictionsSection: Locator;
  readonly specialNeedsTextarea: Locator;
  readonly continueButton: Locator;
  readonly backButton: Locator;
  readonly progressBar: Locator;
  readonly stepIndicator: Locator;

  // Dietary restriction checkboxes
  readonly vegetarianCheckbox: Locator;
  readonly veganCheckbox: Locator;
  readonly glutenFreeCheckbox: Locator;
  readonly halalCheckbox: Locator;
  readonly kosherCheckbox: Locator;
  readonly dairyFreeCheckbox: Locator;
  readonly nutAllergiesCheckbox: Locator;
  readonly seafoodAllergiesCheckbox: Locator;

  constructor(page: Page) {
    super(page);

    // Step elements
    this.stepTitle = page.locator('[data-testid="step-title-dietary"]');
    this.stepDescription = page.locator('[data-testid="step-description-dietary"]');
    this.progressBar = page.locator('[data-testid="progress-bar"]');
    this.stepIndicator = page.locator('[data-testid="step-indicator"]');

    // Sections
    this.dietaryRestrictionsSection = page.locator('[data-testid="section-dietary-restrictions"]');
    this.specialNeedsTextarea = page.locator('[data-testid="textarea-special-needs"]');

    // Navigation buttons
    this.continueButton = page.locator('[data-testid="button-continue-dietary"]');
    this.backButton = page.locator('[data-testid="button-back-dietary"]');

    // Dietary restriction checkboxes
    this.vegetarianCheckbox = page.locator('[data-testid="checkbox-dietary-vegetarian"]');
    this.veganCheckbox = page.locator('[data-testid="checkbox-dietary-vegan"]');
    this.glutenFreeCheckbox = page.locator('[data-testid="checkbox-dietary-gluten-free"]');
    this.halalCheckbox = page.locator('[data-testid="checkbox-dietary-halal"]');
    this.kosherCheckbox = page.locator('[data-testid="checkbox-dietary-kosher"]');
    this.dairyFreeCheckbox = page.locator('[data-testid="checkbox-dietary-dairy-free"]');
    this.nutAllergiesCheckbox = page.locator('[data-testid="checkbox-dietary-nut-allergies"]');
    this.seafoodAllergiesCheckbox = page.locator('[data-testid="checkbox-dietary-seafood-allergies"]');
  }

  async selectDietaryRestrictions(restrictions: string[]) {
    for (const restriction of restrictions) {
      const formattedRestriction = restriction.toLowerCase().replace(/\s+/g, '-');
      const checkbox = this.page.locator(`[data-testid="checkbox-dietary-${formattedRestriction}"]`);
      await checkbox.check();
    }
  }

  async unselectDietaryRestriction(restriction: string) {
    const formattedRestriction = restriction.toLowerCase().replace(/\s+/g, '-');
    const checkbox = this.page.locator(`[data-testid="checkbox-dietary-${formattedRestriction}"]`);
    await checkbox.uncheck();
  }

  async enterSpecialNeeds(text: string) {
    await this.specialNeedsTextarea.fill(text);
  }

  async clearSpecialNeeds() {
    await this.specialNeedsTextarea.clear();
  }

  async getSpecialNeeds(): Promise<string> {
    return await this.specialNeedsTextarea.inputValue();
  }

  async getSelectedDietaryRestrictions(): Promise<string[]> {
    const selected: string[] = [];
    const restrictions = [
      'vegetarian', 'vegan', 'gluten-free', 'halal', 
      'kosher', 'dairy-free', 'nut-allergies', 'seafood-allergies'
    ];
    
    for (const restriction of restrictions) {
      const checkbox = this.page.locator(`[data-testid="checkbox-dietary-${restriction}"]`);
      if (await checkbox.isChecked()) {
        selected.push(restriction);
      }
    }
    
    return selected;
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
    // This step is optional, so it's always complete
    return true;
  }

  async validateStep(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const specialNeeds = await this.getSpecialNeeds();

    // Check if special needs text is too long
    if (specialNeeds && specialNeeds.length > 500) {
      errors.push('Special needs description must be less than 500 characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async fillSampleData() {
    await this.selectDietaryRestrictions(['Vegetarian', 'Gluten-free']);
    await this.enterSpecialNeeds('I need wheelchair accessible accommodations and prefer ground floor rooms.');
  }

  async clearAllSelections() {
    const restrictions = await this.getSelectedDietaryRestrictions();
    for (const restriction of restrictions) {
      await this.unselectDietaryRestriction(restriction);
    }
    await this.clearSpecialNeeds();
  }

  async takeSnapshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/guest-onboarding-dietary-${name}.png`,
      fullPage: true
    });
  }

  async checkAccessibility() {
    const { injectAxe, checkA11y } = await import('@axe-core/playwright');
    await injectAxe(this.page);
    await checkA11y(this.page, '[data-testid="guest-onboarding-dietary"]', {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      }
    });
  }

  async checkFormValidation() {
    // Test max length validation for special needs
    const longText = 'a'.repeat(501);
    await this.enterSpecialNeeds(longText);
    await this.continueButton.click();
    
    const errorMessage = this.page.locator('[data-testid="error-special-needs"]');
    return await errorMessage.isVisible();
  }
}