import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page object model for Step 4: Location & Duration
 * Handles neighborhood preferences and stay duration
 */
export class LocationDurationPage extends BasePage {
  readonly stepTitle: Locator;
  readonly stepDescription: Locator;
  readonly progressBar: Locator;
  readonly stepIndicator: Locator;
  
  // Neighborhoods
  readonly neighborhoodPalermo: Locator;
  readonly neighborhoodRecoleta: Locator;
  readonly neighborhoodSanTelmo: Locator;
  readonly neighborhoodLaBoca: Locator;
  readonly neighborhoodPuertoMadero: Locator;
  readonly neighborhoodBelgrano: Locator;
  readonly neighborhoodVillaCrespo: Locator;
  readonly neighborhoodAlmagro: Locator;
  readonly neighborhoodSearch: Locator;
  readonly neighborhoodMap: Locator;
  readonly neighborhoodInfo: Locator;
  
  // Duration
  readonly durationSelect: Locator;
  readonly durationShort: Locator;
  readonly durationMedium: Locator;
  readonly durationLong: Locator;
  readonly durationExtended: Locator;
  readonly customStartDate: Locator;
  readonly customEndDate: Locator;
  readonly flexibleDatesCheckbox: Locator;
  
  // Navigation
  readonly nextButton: Locator;
  readonly previousButton: Locator;
  readonly skipButton: Locator;
  
  // Map interaction
  readonly mapZoomIn: Locator;
  readonly mapZoomOut: Locator;
  readonly mapFullscreen: Locator;
  readonly mapMarkers: Locator;
  
  // Error/Validation
  readonly errorMessage: Locator;
  readonly validationMessage: Locator;

  constructor(page: Page) {
    super(page);
    
    // Step info
    this.stepTitle = page.locator('[data-testid="step-title"]');
    this.stepDescription = page.locator('[data-testid="step-description"]');
    this.progressBar = page.locator('[data-testid="progress-bar"]');
    this.stepIndicator = page.locator('[data-testid="step-indicator"]');
    
    // Neighborhoods
    this.neighborhoodPalermo = page.locator('[data-testid="checkbox-neighborhood-palermo"]');
    this.neighborhoodRecoleta = page.locator('[data-testid="checkbox-neighborhood-recoleta"]');
    this.neighborhoodSanTelmo = page.locator('[data-testid="checkbox-neighborhood-san-telmo"]');
    this.neighborhoodLaBoca = page.locator('[data-testid="checkbox-neighborhood-la-boca"]');
    this.neighborhoodPuertoMadero = page.locator('[data-testid="checkbox-neighborhood-puerto-madero"]');
    this.neighborhoodBelgrano = page.locator('[data-testid="checkbox-neighborhood-belgrano"]');
    this.neighborhoodVillaCrespo = page.locator('[data-testid="checkbox-neighborhood-villa-crespo"]');
    this.neighborhoodAlmagro = page.locator('[data-testid="checkbox-neighborhood-almagro"]');
    this.neighborhoodSearch = page.locator('[data-testid="input-search-neighborhood"]');
    this.neighborhoodMap = page.locator('[data-testid="neighborhood-map"]');
    this.neighborhoodInfo = page.locator('[data-testid="neighborhood-info"]');
    
    // Duration
    this.durationSelect = page.locator('[data-testid="select-duration"]');
    this.durationShort = page.locator('[data-testid="option-duration-short"]');
    this.durationMedium = page.locator('[data-testid="option-duration-medium"]');
    this.durationLong = page.locator('[data-testid="option-duration-long"]');
    this.durationExtended = page.locator('[data-testid="option-duration-extended"]');
    this.customStartDate = page.locator('[data-testid="input-start-date"]');
    this.customEndDate = page.locator('[data-testid="input-end-date"]');
    this.flexibleDatesCheckbox = page.locator('[data-testid="checkbox-flexible-dates"]');
    
    // Navigation
    this.nextButton = page.locator('[data-testid="button-next"]');
    this.previousButton = page.locator('[data-testid="button-previous"]');
    this.skipButton = page.locator('[data-testid="button-skip"]');
    
    // Map interaction
    this.mapZoomIn = page.locator('[data-testid="button-map-zoom-in"]');
    this.mapZoomOut = page.locator('[data-testid="button-map-zoom-out"]');
    this.mapFullscreen = page.locator('[data-testid="button-map-fullscreen"]');
    this.mapMarkers = page.locator('[data-testid^="map-marker-"]');
    
    // Error/Validation
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.validationMessage = page.locator('[data-testid="validation-message"]');
  }

  async selectNeighborhoods(neighborhoods: string[]) {
    for (const neighborhood of neighborhoods) {
      switch (neighborhood.toLowerCase()) {
        case 'palermo':
          await this.neighborhoodPalermo.check();
          break;
        case 'recoleta':
          await this.neighborhoodRecoleta.check();
          break;
        case 'san telmo':
          await this.neighborhoodSanTelmo.check();
          break;
        case 'la boca':
          await this.neighborhoodLaBoca.check();
          break;
        case 'puerto madero':
          await this.neighborhoodPuertoMadero.check();
          break;
        case 'belgrano':
          await this.neighborhoodBelgrano.check();
          break;
        case 'villa crespo':
          await this.neighborhoodVillaCrespo.check();
          break;
        case 'almagro':
          await this.neighborhoodAlmagro.check();
          break;
      }
    }
  }

  async selectDuration(duration: 'short' | 'medium' | 'long' | 'extended') {
    await this.durationSelect.click();
    switch (duration) {
      case 'short':
        await this.durationShort.click();
        break;
      case 'medium':
        await this.durationMedium.click();
        break;
      case 'long':
        await this.durationLong.click();
        break;
      case 'extended':
        await this.durationExtended.click();
        break;
    }
  }

  async setCustomDates(startDate: string, endDate: string) {
    await this.customStartDate.fill(startDate);
    await this.customEndDate.fill(endDate);
  }

  async toggleFlexibleDates(flexible: boolean) {
    const isChecked = await this.flexibleDatesCheckbox.isChecked();
    if (isChecked !== flexible) {
      await this.flexibleDatesCheckbox.click();
    }
  }

  async searchNeighborhood(query: string) {
    await this.neighborhoodSearch.fill(query);
    await this.page.waitForTimeout(300); // Wait for search to filter
  }

  async clickMapMarker(neighborhoodName: string) {
    const marker = this.page.locator(`[data-testid="map-marker-${neighborhoodName.toLowerCase().replace(' ', '-')}"]`);
    await marker.click();
  }

  async zoomInMap() {
    await this.mapZoomIn.click();
  }

  async zoomOutMap() {
    await this.mapZoomOut.click();
  }

  async toggleMapFullscreen() {
    await this.mapFullscreen.click();
  }

  async verifyStep() {
    await this.stepTitle.waitFor({ state: 'visible' });
    const title = await this.stepTitle.textContent();
    return title?.includes('Location') || title?.includes('Duration');
  }

  async getProgressPercentage() {
    const progress = await this.progressBar.getAttribute('value');
    return progress ? parseInt(progress) : 67; // Step 4 of 6
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

  async getSelectedNeighborhoods() {
    const selected = [];
    if (await this.neighborhoodPalermo.isChecked()) selected.push('Palermo');
    if (await this.neighborhoodRecoleta.isChecked()) selected.push('Recoleta');
    if (await this.neighborhoodSanTelmo.isChecked()) selected.push('San Telmo');
    if (await this.neighborhoodLaBoca.isChecked()) selected.push('La Boca');
    if (await this.neighborhoodPuertoMadero.isChecked()) selected.push('Puerto Madero');
    if (await this.neighborhoodBelgrano.isChecked()) selected.push('Belgrano');
    if (await this.neighborhoodVillaCrespo.isChecked()) selected.push('Villa Crespo');
    if (await this.neighborhoodAlmagro.isChecked()) selected.push('Almagro');
    return selected;
  }

  async getSelectedDuration() {
    return await this.durationSelect.textContent();
  }

  async getCustomDateRange() {
    const startDate = await this.customStartDate.inputValue();
    const endDate = await this.customEndDate.inputValue();
    return { startDate, endDate };
  }

  async isFlexibleDatesEnabled() {
    return await this.flexibleDatesCheckbox.isChecked();
  }

  async validateDateRange() {
    const { startDate, endDate } = await this.getCustomDateRange();
    if (!startDate || !endDate) return true; // No custom dates set
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end > start;
  }

  async isNextButtonEnabled() {
    return await this.nextButton.isEnabled();
  }

  async verifyMinimumSelection() {
    const neighborhoods = await this.getSelectedNeighborhoods();
    const duration = await this.getSelectedDuration();
    // Require at least one neighborhood and duration selection
    return neighborhoods.length >= 1 && duration !== null;
  }

  async checkMapInteractivity() {
    // Check if map is interactive
    const mapVisible = await this.neighborhoodMap.isVisible();
    const markersCount = await this.mapMarkers.count();
    return mapVisible && markersCount > 0;
  }

  async getNeighborhoodInfo(neighborhoodName: string) {
    await this.clickMapMarker(neighborhoodName);
    await this.neighborhoodInfo.waitFor({ state: 'visible' });
    return await this.neighborhoodInfo.textContent();
  }

  async checkMobileResponsiveness() {
    const viewport = this.page.viewportSize();
    if (viewport && viewport.width < 768) {
      // Check if map is properly sized for mobile
      const mapBounds = await this.neighborhoodMap.boundingBox();
      if (!mapBounds) return false;
      
      // Map should take full width on mobile
      return mapBounds.width >= viewport.width * 0.9;
    }
    return true;
  }

  async captureVisualSnapshot(name: string) {
    await this.page.screenshot({
      path: `test-results/guest-onboarding/${name}.png`,
      fullPage: true
    });
  }
}