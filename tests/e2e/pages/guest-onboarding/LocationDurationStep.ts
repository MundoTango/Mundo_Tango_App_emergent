import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page object model for Step 4: Location & Duration
 * Handles neighborhood preferences and stay duration
 */
export class LocationDurationStep extends BasePage {
  readonly stepTitle: Locator;
  readonly stepDescription: Locator;
  readonly neighborhoodsSection: Locator;
  readonly stayDurationSelect: Locator;
  readonly continueButton: Locator;
  readonly backButton: Locator;
  readonly progressBar: Locator;
  readonly stepIndicator: Locator;

  // Neighborhood checkboxes
  readonly palermoCheckbox: Locator;
  readonly recoletaCheckbox: Locator;
  readonly sanTelmoCheckbox: Locator;
  readonly laBocaCheckbox: Locator;
  readonly puertoMaderoCheckbox: Locator;
  readonly belgranoCheckbox: Locator;
  readonly villaCrespoCheckbox: Locator;
  readonly almagroCheckbox: Locator;

  constructor(page: Page) {
    super(page);

    // Step elements
    this.stepTitle = page.locator('[data-testid="step-title-location"]');
    this.stepDescription = page.locator('[data-testid="step-description-location"]');
    this.progressBar = page.locator('[data-testid="progress-bar"]');
    this.stepIndicator = page.locator('[data-testid="step-indicator"]');

    // Sections
    this.neighborhoodsSection = page.locator('[data-testid="section-neighborhoods"]');
    this.stayDurationSelect = page.locator('[data-testid="select-stay-duration"]');

    // Navigation buttons
    this.continueButton = page.locator('[data-testid="button-continue-location"]');
    this.backButton = page.locator('[data-testid="button-back-location"]');

    // Neighborhood checkboxes
    this.palermoCheckbox = page.locator('[data-testid="checkbox-neighborhood-palermo"]');
    this.recoletaCheckbox = page.locator('[data-testid="checkbox-neighborhood-recoleta"]');
    this.sanTelmoCheckbox = page.locator('[data-testid="checkbox-neighborhood-san-telmo"]');
    this.laBocaCheckbox = page.locator('[data-testid="checkbox-neighborhood-la-boca"]');
    this.puertoMaderoCheckbox = page.locator('[data-testid="checkbox-neighborhood-puerto-madero"]');
    this.belgranoCheckbox = page.locator('[data-testid="checkbox-neighborhood-belgrano"]');
    this.villaCrespoCheckbox = page.locator('[data-testid="checkbox-neighborhood-villa-crespo"]');
    this.almagroCheckbox = page.locator('[data-testid="checkbox-neighborhood-almagro"]');
  }

  async selectNeighborhoods(neighborhoods: string[]) {
    for (const neighborhood of neighborhoods) {
      const formattedNeighborhood = neighborhood.toLowerCase().replace(/\s+/g, '-');
      const checkbox = this.page.locator(`[data-testid="checkbox-neighborhood-${formattedNeighborhood}"]`);
      await checkbox.check();
    }
  }

  async unselectNeighborhood(neighborhood: string) {
    const formattedNeighborhood = neighborhood.toLowerCase().replace(/\s+/g, '-');
    const checkbox = this.page.locator(`[data-testid="checkbox-neighborhood-${formattedNeighborhood}"]`);
    await checkbox.uncheck();
  }

  async selectStayDuration(duration: 'short' | 'medium' | 'long' | 'extended') {
    await this.stayDurationSelect.click();
    await this.page.locator(`[data-testid="option-duration-${duration}"]`).click();
  }

  async getSelectedNeighborhoods(): Promise<string[]> {
    const selected: string[] = [];
    const neighborhoods = [
      'palermo', 'recoleta', 'san-telmo', 'la-boca', 
      'puerto-madero', 'belgrano', 'villa-crespo', 'almagro'
    ];
    
    for (const neighborhood of neighborhoods) {
      const checkbox = this.page.locator(`[data-testid="checkbox-neighborhood-${neighborhood}"]`);
      if (await checkbox.isChecked()) {
        selected.push(neighborhood);
      }
    }
    
    return selected;
  }

  async getSelectedStayDuration(): Promise<string> {
    const selectedOption = await this.stayDurationSelect.locator('[data-selected="true"]').textContent();
    return selectedOption || '';
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
    const neighborhoods = await this.getSelectedNeighborhoods();
    const duration = await this.getSelectedStayDuration();
    return neighborhoods.length > 0 && duration !== '';
  }

  async validateStep(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const neighborhoods = await this.getSelectedNeighborhoods();
    const duration = await this.getSelectedStayDuration();

    if (neighborhoods.length === 0) {
      errors.push('Please select at least one neighborhood');
    }

    if (!duration) {
      errors.push('Please select your typical stay duration');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async fillSampleData() {
    await this.selectNeighborhoods(['Palermo', 'Recoleta', 'San Telmo']);
    await this.selectStayDuration('medium');
  }

  async clearAllSelections() {
    const neighborhoods = await this.getSelectedNeighborhoods();
    for (const neighborhood of neighborhoods) {
      await this.unselectNeighborhood(neighborhood);
    }
  }

  async selectAllNeighborhoods() {
    const neighborhoods = [
      'Palermo', 'Recoleta', 'San Telmo', 'La Boca', 
      'Puerto Madero', 'Belgrano', 'Villa Crespo', 'Almagro'
    ];
    await this.selectNeighborhoods(neighborhoods);
  }

  async takeSnapshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/guest-onboarding-location-${name}.png`,
      fullPage: true
    });
  }

  async checkAccessibility() {
    const { injectAxe, checkA11y } = await import('@axe-core/playwright');
    await injectAxe(this.page);
    await checkA11y(this.page, '[data-testid="guest-onboarding-location"]', {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      }
    });
  }

  async getNeighborhoodDescriptions(): Promise<{ [key: string]: string }> {
    const descriptions: { [key: string]: string } = {};
    const neighborhoods = [
      'palermo', 'recoleta', 'san-telmo', 'la-boca', 
      'puerto-madero', 'belgrano', 'villa-crespo', 'almagro'
    ];
    
    for (const neighborhood of neighborhoods) {
      const descElement = this.page.locator(`[data-testid="description-neighborhood-${neighborhood}"]`);
      if (await descElement.isVisible()) {
        descriptions[neighborhood] = await descElement.textContent() || '';
      }
    }
    
    return descriptions;
  }

  async hoverOverNeighborhood(neighborhood: string) {
    const formattedNeighborhood = neighborhood.toLowerCase().replace(/\s+/g, '-');
    const element = this.page.locator(`[data-testid="checkbox-neighborhood-${formattedNeighborhood}"]`);
    await element.hover();
  }

  async getDurationDescription(duration: 'short' | 'medium' | 'long' | 'extended'): Promise<string> {
    const descElement = this.page.locator(`[data-testid="description-duration-${duration}"]`);
    return await descElement.textContent() || '';
  }
}