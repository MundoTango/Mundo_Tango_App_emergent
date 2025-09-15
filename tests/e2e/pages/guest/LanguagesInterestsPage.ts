import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page object model for Step 3: Languages & Interests
 * Handles language preferences and travel interests
 */
export class LanguagesInterestsPage extends BasePage {
  readonly stepTitle: Locator;
  readonly stepDescription: Locator;
  readonly progressBar: Locator;
  readonly stepIndicator: Locator;
  
  // Languages
  readonly langEnglish: Locator;
  readonly langSpanish: Locator;
  readonly langPortuguese: Locator;
  readonly langFrench: Locator;
  readonly langGerman: Locator;
  readonly langItalian: Locator;
  readonly langChinese: Locator;
  readonly langJapanese: Locator;
  readonly langKorean: Locator;
  readonly langRussian: Locator;
  readonly langArabic: Locator;
  readonly langOtherInput: Locator;
  
  // Interests
  readonly interestTango: Locator;
  readonly interestMuseums: Locator;
  readonly interestArtGalleries: Locator;
  readonly interestLiveMusic: Locator;
  readonly interestFoodTours: Locator;
  readonly interestWineTasting: Locator;
  readonly interestHistoricalSites: Locator;
  readonly interestShopping: Locator;
  readonly interestNatureParks: Locator;
  readonly interestPhotography: Locator;
  readonly interestCookingClasses: Locator;
  readonly interestLocalMarkets: Locator;
  
  // Navigation
  readonly nextButton: Locator;
  readonly previousButton: Locator;
  readonly skipButton: Locator;
  
  // Search/Filter
  readonly languageSearchInput: Locator;
  readonly interestSearchInput: Locator;
  
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
    
    // Languages
    this.langEnglish = page.locator('[data-testid="checkbox-lang-english"]');
    this.langSpanish = page.locator('[data-testid="checkbox-lang-spanish"]');
    this.langPortuguese = page.locator('[data-testid="checkbox-lang-portuguese"]');
    this.langFrench = page.locator('[data-testid="checkbox-lang-french"]');
    this.langGerman = page.locator('[data-testid="checkbox-lang-german"]');
    this.langItalian = page.locator('[data-testid="checkbox-lang-italian"]');
    this.langChinese = page.locator('[data-testid="checkbox-lang-chinese"]');
    this.langJapanese = page.locator('[data-testid="checkbox-lang-japanese"]');
    this.langKorean = page.locator('[data-testid="checkbox-lang-korean"]');
    this.langRussian = page.locator('[data-testid="checkbox-lang-russian"]');
    this.langArabic = page.locator('[data-testid="checkbox-lang-arabic"]');
    this.langOtherInput = page.locator('[data-testid="input-lang-other"]');
    
    // Interests
    this.interestTango = page.locator('[data-testid="checkbox-interest-tango"]');
    this.interestMuseums = page.locator('[data-testid="checkbox-interest-museums"]');
    this.interestArtGalleries = page.locator('[data-testid="checkbox-interest-art-galleries"]');
    this.interestLiveMusic = page.locator('[data-testid="checkbox-interest-live-music"]');
    this.interestFoodTours = page.locator('[data-testid="checkbox-interest-food-tours"]');
    this.interestWineTasting = page.locator('[data-testid="checkbox-interest-wine-tasting"]');
    this.interestHistoricalSites = page.locator('[data-testid="checkbox-interest-historical-sites"]');
    this.interestShopping = page.locator('[data-testid="checkbox-interest-shopping"]');
    this.interestNatureParks = page.locator('[data-testid="checkbox-interest-nature-parks"]');
    this.interestPhotography = page.locator('[data-testid="checkbox-interest-photography"]');
    this.interestCookingClasses = page.locator('[data-testid="checkbox-interest-cooking-classes"]');
    this.interestLocalMarkets = page.locator('[data-testid="checkbox-interest-local-markets"]');
    
    // Navigation
    this.nextButton = page.locator('[data-testid="button-next"]');
    this.previousButton = page.locator('[data-testid="button-previous"]');
    this.skipButton = page.locator('[data-testid="button-skip"]');
    
    // Search/Filter
    this.languageSearchInput = page.locator('[data-testid="input-search-language"]');
    this.interestSearchInput = page.locator('[data-testid="input-search-interest"]');
    
    // Error/Validation
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.validationMessage = page.locator('[data-testid="validation-message"]');
  }

  async selectLanguages(languages: string[]) {
    for (const language of languages) {
      switch (language.toLowerCase()) {
        case 'english':
          await this.langEnglish.check();
          break;
        case 'spanish':
        case 'español':
          await this.langSpanish.check();
          break;
        case 'portuguese':
        case 'português':
          await this.langPortuguese.check();
          break;
        case 'french':
        case 'français':
          await this.langFrench.check();
          break;
        case 'german':
        case 'deutsch':
          await this.langGerman.check();
          break;
        case 'italian':
        case 'italiano':
          await this.langItalian.check();
          break;
        case 'chinese':
        case '中文':
          await this.langChinese.check();
          break;
        case 'japanese':
        case '日本語':
          await this.langJapanese.check();
          break;
        case 'korean':
        case '한국어':
          await this.langKorean.check();
          break;
        case 'russian':
        case 'русский':
          await this.langRussian.check();
          break;
        case 'arabic':
        case 'عربي':
          await this.langArabic.check();
          break;
        default:
          // For other languages, use the other input field
          await this.langOtherInput.fill(language);
      }
    }
  }

  async selectInterests(interests: string[]) {
    for (const interest of interests) {
      switch (interest.toLowerCase()) {
        case 'tango':
        case 'tango dancing':
          await this.interestTango.check();
          break;
        case 'museums':
          await this.interestMuseums.check();
          break;
        case 'art galleries':
        case 'art':
          await this.interestArtGalleries.check();
          break;
        case 'live music':
        case 'music':
          await this.interestLiveMusic.check();
          break;
        case 'food tours':
        case 'food':
          await this.interestFoodTours.check();
          break;
        case 'wine tasting':
        case 'wine':
          await this.interestWineTasting.check();
          break;
        case 'historical sites':
        case 'history':
          await this.interestHistoricalSites.check();
          break;
        case 'shopping':
          await this.interestShopping.check();
          break;
        case 'nature & parks':
        case 'nature':
        case 'parks':
          await this.interestNatureParks.check();
          break;
        case 'photography':
          await this.interestPhotography.check();
          break;
        case 'cooking classes':
        case 'cooking':
          await this.interestCookingClasses.check();
          break;
        case 'local markets':
        case 'markets':
          await this.interestLocalMarkets.check();
          break;
      }
    }
  }

  async searchLanguage(query: string) {
    if (await this.languageSearchInput.isVisible()) {
      await this.languageSearchInput.fill(query);
      await this.page.waitForTimeout(300); // Wait for filter to apply
    }
  }

  async searchInterest(query: string) {
    if (await this.interestSearchInput.isVisible()) {
      await this.interestSearchInput.fill(query);
      await this.page.waitForTimeout(300); // Wait for filter to apply
    }
  }

  async verifyStep() {
    await this.stepTitle.waitFor({ state: 'visible' });
    const title = await this.stepTitle.textContent();
    return title?.includes('Languages') || title?.includes('Interests');
  }

  async getProgressPercentage() {
    const progress = await this.progressBar.getAttribute('value');
    return progress ? parseInt(progress) : 50; // Step 3 of 6
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

  async getSelectedLanguages() {
    const selected = [];
    if (await this.langEnglish.isChecked()) selected.push('English');
    if (await this.langSpanish.isChecked()) selected.push('Spanish');
    if (await this.langPortuguese.isChecked()) selected.push('Portuguese');
    if (await this.langFrench.isChecked()) selected.push('French');
    if (await this.langGerman.isChecked()) selected.push('German');
    if (await this.langItalian.isChecked()) selected.push('Italian');
    if (await this.langChinese.isChecked()) selected.push('Chinese');
    if (await this.langJapanese.isChecked()) selected.push('Japanese');
    if (await this.langKorean.isChecked()) selected.push('Korean');
    if (await this.langRussian.isChecked()) selected.push('Russian');
    if (await this.langArabic.isChecked()) selected.push('Arabic');
    
    const otherLang = await this.langOtherInput.inputValue();
    if (otherLang) selected.push(otherLang);
    
    return selected;
  }

  async getSelectedInterests() {
    const selected = [];
    if (await this.interestTango.isChecked()) selected.push('Tango Dancing');
    if (await this.interestMuseums.isChecked()) selected.push('Museums');
    if (await this.interestArtGalleries.isChecked()) selected.push('Art Galleries');
    if (await this.interestLiveMusic.isChecked()) selected.push('Live Music');
    if (await this.interestFoodTours.isChecked()) selected.push('Food Tours');
    if (await this.interestWineTasting.isChecked()) selected.push('Wine Tasting');
    if (await this.interestHistoricalSites.isChecked()) selected.push('Historical Sites');
    if (await this.interestShopping.isChecked()) selected.push('Shopping');
    if (await this.interestNatureParks.isChecked()) selected.push('Nature & Parks');
    if (await this.interestPhotography.isChecked()) selected.push('Photography');
    if (await this.interestCookingClasses.isChecked()) selected.push('Cooking Classes');
    if (await this.interestLocalMarkets.isChecked()) selected.push('Local Markets');
    return selected;
  }

  async verifyMinimumSelection() {
    const languages = await this.getSelectedLanguages();
    const interests = await this.getSelectedInterests();
    // Require at least one language and one interest
    return languages.length >= 1 && interests.length >= 1;
  }

  async isNextButtonEnabled() {
    return await this.nextButton.isEnabled();
  }

  async checkMobileResponsiveness() {
    const viewport = this.page.viewportSize();
    if (viewport && viewport.width < 768) {
      // Check if grids are properly stacked for mobile
      const languageGrid = await this.page.evaluate(() => {
        const checkboxes = document.querySelectorAll('[data-testid^="checkbox-lang-"]');
        if (checkboxes.length < 2) return true;
        const first = checkboxes[0].getBoundingClientRect();
        const second = checkboxes[1].getBoundingClientRect();
        return first.top !== second.top;
      });
      
      const interestGrid = await this.page.evaluate(() => {
        const checkboxes = document.querySelectorAll('[data-testid^="checkbox-interest-"]');
        if (checkboxes.length < 2) return true;
        const first = checkboxes[0].getBoundingClientRect();
        const second = checkboxes[1].getBoundingClientRect();
        return first.top !== second.top;
      });
      
      return languageGrid && interestGrid;
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