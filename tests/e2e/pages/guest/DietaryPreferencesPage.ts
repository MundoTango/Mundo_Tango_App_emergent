import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page object model for Step 2: Dietary Preferences
 * Handles dietary restrictions and special needs
 */
export class DietaryPreferencesPage extends BasePage {
  readonly stepTitle: Locator;
  readonly stepDescription: Locator;
  readonly progressBar: Locator;
  readonly stepIndicator: Locator;
  
  // Dietary Options
  readonly dietVegetarian: Locator;
  readonly dietVegan: Locator;
  readonly dietGlutenFree: Locator;
  readonly dietHalal: Locator;
  readonly dietKosher: Locator;
  readonly dietDairyFree: Locator;
  readonly dietNutAllergies: Locator;
  readonly dietSeafoodAllergies: Locator;
  
  // Special Needs
  readonly specialNeedsTextarea: Locator;
  readonly specialNeedsCharCount: Locator;
  
  // Navigation
  readonly nextButton: Locator;
  readonly previousButton: Locator;
  readonly skipButton: Locator;
  
  // Error/Validation
  readonly errorMessage: Locator;
  readonly validationMessage: Locator;
  readonly infoTooltip: Locator;

  constructor(page: Page) {
    super(page);
    
    // Step info
    this.stepTitle = page.locator('[data-testid="step-title"]');
    this.stepDescription = page.locator('[data-testid="step-description"]');
    this.progressBar = page.locator('[data-testid="progress-bar"]');
    this.stepIndicator = page.locator('[data-testid="step-indicator"]');
    
    // Dietary Options
    this.dietVegetarian = page.locator('[data-testid="checkbox-diet-vegetarian"]');
    this.dietVegan = page.locator('[data-testid="checkbox-diet-vegan"]');
    this.dietGlutenFree = page.locator('[data-testid="checkbox-diet-gluten-free"]');
    this.dietHalal = page.locator('[data-testid="checkbox-diet-halal"]');
    this.dietKosher = page.locator('[data-testid="checkbox-diet-kosher"]');
    this.dietDairyFree = page.locator('[data-testid="checkbox-diet-dairy-free"]');
    this.dietNutAllergies = page.locator('[data-testid="checkbox-diet-nut-allergies"]');
    this.dietSeafoodAllergies = page.locator('[data-testid="checkbox-diet-seafood-allergies"]');
    
    // Special Needs
    this.specialNeedsTextarea = page.locator('[data-testid="textarea-special-needs"]');
    this.specialNeedsCharCount = page.locator('[data-testid="char-count-special-needs"]');
    
    // Navigation
    this.nextButton = page.locator('[data-testid="button-next"]');
    this.previousButton = page.locator('[data-testid="button-previous"]');
    this.skipButton = page.locator('[data-testid="button-skip"]');
    
    // Error/Validation
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.validationMessage = page.locator('[data-testid="validation-message"]');
    this.infoTooltip = page.locator('[data-testid="info-tooltip"]');
  }

  async selectDietaryRestrictions(restrictions: string[]) {
    for (const restriction of restrictions) {
      switch (restriction.toLowerCase()) {
        case 'vegetarian':
          await this.dietVegetarian.check();
          break;
        case 'vegan':
          await this.dietVegan.check();
          break;
        case 'gluten-free':
        case 'gluten free':
          await this.dietGlutenFree.check();
          break;
        case 'halal':
          await this.dietHalal.check();
          break;
        case 'kosher':
          await this.dietKosher.check();
          break;
        case 'dairy-free':
        case 'dairy free':
          await this.dietDairyFree.check();
          break;
        case 'nut allergies':
        case 'nuts':
          await this.dietNutAllergies.check();
          break;
        case 'seafood allergies':
        case 'seafood':
          await this.dietSeafoodAllergies.check();
          break;
      }
    }
  }

  async enterSpecialNeeds(text: string) {
    await this.specialNeedsTextarea.fill(text);
  }

  async verifyStep() {
    await this.stepTitle.waitFor({ state: 'visible' });
    const title = await this.stepTitle.textContent();
    return title?.includes('Dietary');
  }

  async getProgressPercentage() {
    const progress = await this.progressBar.getAttribute('value');
    return progress ? parseInt(progress) : 33; // Step 2 of 6
  }

  async continueToNext() {
    await this.nextButton.click();
    await this.waitForPageLoad();
  }

  async goToPrevious() {
    await this.previousButton.click();
    await this.waitForPageLoad();
  }

  async skipStep() {
    if (await this.skipButton.isVisible()) {
      await this.skipButton.click();
      await this.waitForPageLoad();
    }
  }

  async getSelectedDietaryRestrictions() {
    const selected = [];
    if (await this.dietVegetarian.isChecked()) selected.push('Vegetarian');
    if (await this.dietVegan.isChecked()) selected.push('Vegan');
    if (await this.dietGlutenFree.isChecked()) selected.push('Gluten-free');
    if (await this.dietHalal.isChecked()) selected.push('Halal');
    if (await this.dietKosher.isChecked()) selected.push('Kosher');
    if (await this.dietDairyFree.isChecked()) selected.push('Dairy-free');
    if (await this.dietNutAllergies.isChecked()) selected.push('Nut allergies');
    if (await this.dietSeafoodAllergies.isChecked()) selected.push('Seafood allergies');
    return selected;
  }

  async getSpecialNeedsText() {
    return await this.specialNeedsTextarea.inputValue();
  }

  async getCharacterCount() {
    const countText = await this.specialNeedsCharCount.textContent();
    const match = countText?.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  async verifyCharacterLimit() {
    const text = await this.getSpecialNeedsText();
    const count = await this.getCharacterCount();
    return text.length === count;
  }

  async testMaxCharacterInput() {
    const maxText = 'a'.repeat(500); // Assuming 500 char limit
    await this.enterSpecialNeeds(maxText);
    const actualText = await this.getSpecialNeedsText();
    return actualText.length <= 500;
  }

  async isNextButtonEnabled() {
    return await this.nextButton.isEnabled();
  }

  async checkValidation() {
    // Check if at least one option is selected or special needs is filled
    const restrictions = await this.getSelectedDietaryRestrictions();
    const specialNeeds = await this.getSpecialNeedsText();
    return restrictions.length > 0 || specialNeeds.length > 0;
  }

  async checkMobileResponsiveness() {
    const viewport = this.page.viewportSize();
    if (viewport && viewport.width < 768) {
      // Check if checkboxes are properly stacked for mobile
      const isStacked = await this.page.evaluate(() => {
        const checkboxes = document.querySelectorAll('[data-testid^="checkbox-diet-"]');
        if (checkboxes.length < 2) return true;
        const first = checkboxes[0].getBoundingClientRect();
        const second = checkboxes[1].getBoundingClientRect();
        return first.top !== second.top;
      });
      return isStacked;
    }
    return true;
  }

  async hoverInfoTooltip() {
    await this.infoTooltip.hover();
    // Wait for tooltip to appear
    await this.page.waitForTimeout(500);
    const tooltipText = await this.page.locator('[role="tooltip"]').textContent();
    return tooltipText;
  }

  async captureVisualSnapshot(name: string) {
    await this.page.screenshot({
      path: `test-results/guest-onboarding/${name}.png`,
      fullPage: true
    });
  }
}