import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page object model for Step 3: Languages & Interests
 * Handles language selection and travel interests
 */
export class LanguagesInterestsStep extends BasePage {
  readonly stepTitle: Locator;
  readonly stepDescription: Locator;
  readonly languagesSection: Locator;
  readonly interestsSection: Locator;
  readonly continueButton: Locator;
  readonly backButton: Locator;
  readonly progressBar: Locator;
  readonly stepIndicator: Locator;

  // Language checkboxes
  readonly englishCheckbox: Locator;
  readonly spanishCheckbox: Locator;
  readonly portugueseCheckbox: Locator;
  readonly frenchCheckbox: Locator;
  readonly germanCheckbox: Locator;
  readonly italianCheckbox: Locator;
  readonly chineseCheckbox: Locator;
  readonly japaneseCheckbox: Locator;
  readonly koreanCheckbox: Locator;
  readonly russianCheckbox: Locator;
  readonly arabicCheckbox: Locator;

  // Interest checkboxes
  readonly tangoDancingCheckbox: Locator;
  readonly museumsCheckbox: Locator;
  readonly artGalleriesCheckbox: Locator;
  readonly liveMusicCheckbox: Locator;
  readonly foodToursCheckbox: Locator;
  readonly wineTastingCheckbox: Locator;
  readonly historicalSitesCheckbox: Locator;
  readonly shoppingCheckbox: Locator;
  readonly natureParksCheckbox: Locator;
  readonly photographyCheckbox: Locator;
  readonly cookingClassesCheckbox: Locator;
  readonly localMarketsCheckbox: Locator;

  constructor(page: Page) {
    super(page);

    // Step elements
    this.stepTitle = page.locator('[data-testid="step-title-languages-interests"]');
    this.stepDescription = page.locator('[data-testid="step-description-languages-interests"]');
    this.progressBar = page.locator('[data-testid="progress-bar"]');
    this.stepIndicator = page.locator('[data-testid="step-indicator"]');

    // Sections
    this.languagesSection = page.locator('[data-testid="section-languages"]');
    this.interestsSection = page.locator('[data-testid="section-interests"]');

    // Navigation buttons
    this.continueButton = page.locator('[data-testid="button-continue-languages"]');
    this.backButton = page.locator('[data-testid="button-back-languages"]');

    // Language checkboxes
    this.englishCheckbox = page.locator('[data-testid="checkbox-language-english"]');
    this.spanishCheckbox = page.locator('[data-testid="checkbox-language-spanish"]');
    this.portugueseCheckbox = page.locator('[data-testid="checkbox-language-portuguese"]');
    this.frenchCheckbox = page.locator('[data-testid="checkbox-language-french"]');
    this.germanCheckbox = page.locator('[data-testid="checkbox-language-german"]');
    this.italianCheckbox = page.locator('[data-testid="checkbox-language-italian"]');
    this.chineseCheckbox = page.locator('[data-testid="checkbox-language-chinese"]');
    this.japaneseCheckbox = page.locator('[data-testid="checkbox-language-japanese"]');
    this.koreanCheckbox = page.locator('[data-testid="checkbox-language-korean"]');
    this.russianCheckbox = page.locator('[data-testid="checkbox-language-russian"]');
    this.arabicCheckbox = page.locator('[data-testid="checkbox-language-arabic"]');

    // Interest checkboxes
    this.tangoDancingCheckbox = page.locator('[data-testid="checkbox-interest-tango-dancing"]');
    this.museumsCheckbox = page.locator('[data-testid="checkbox-interest-museums"]');
    this.artGalleriesCheckbox = page.locator('[data-testid="checkbox-interest-art-galleries"]');
    this.liveMusicCheckbox = page.locator('[data-testid="checkbox-interest-live-music"]');
    this.foodToursCheckbox = page.locator('[data-testid="checkbox-interest-food-tours"]');
    this.wineTastingCheckbox = page.locator('[data-testid="checkbox-interest-wine-tasting"]');
    this.historicalSitesCheckbox = page.locator('[data-testid="checkbox-interest-historical-sites"]');
    this.shoppingCheckbox = page.locator('[data-testid="checkbox-interest-shopping"]');
    this.natureParksCheckbox = page.locator('[data-testid="checkbox-interest-nature-parks"]');
    this.photographyCheckbox = page.locator('[data-testid="checkbox-interest-photography"]');
    this.cookingClassesCheckbox = page.locator('[data-testid="checkbox-interest-cooking-classes"]');
    this.localMarketsCheckbox = page.locator('[data-testid="checkbox-interest-local-markets"]');
  }

  async selectLanguages(languages: string[]) {
    for (const language of languages) {
      const formattedLanguage = language.toLowerCase().replace(/\s+/g, '-');
      const checkbox = this.page.locator(`[data-testid="checkbox-language-${formattedLanguage}"]`);
      await checkbox.check();
    }
  }

  async unselectLanguage(language: string) {
    const formattedLanguage = language.toLowerCase().replace(/\s+/g, '-');
    const checkbox = this.page.locator(`[data-testid="checkbox-language-${formattedLanguage}"]`);
    await checkbox.uncheck();
  }

  async selectInterests(interests: string[]) {
    for (const interest of interests) {
      const formattedInterest = interest.toLowerCase().replace(/\s+/g, '-');
      const checkbox = this.page.locator(`[data-testid="checkbox-interest-${formattedInterest}"]`);
      await checkbox.check();
    }
  }

  async unselectInterest(interest: string) {
    const formattedInterest = interest.toLowerCase().replace(/\s+/g, '-');
    const checkbox = this.page.locator(`[data-testid="checkbox-interest-${formattedInterest}"]`);
    await checkbox.uncheck();
  }

  async getSelectedLanguages(): Promise<string[]> {
    const selected: string[] = [];
    const languages = [
      'english', 'spanish', 'portuguese', 'french', 'german', 
      'italian', 'chinese', 'japanese', 'korean', 'russian', 'arabic'
    ];
    
    for (const language of languages) {
      const checkbox = this.page.locator(`[data-testid="checkbox-language-${language}"]`);
      if (await checkbox.isChecked()) {
        selected.push(language);
      }
    }
    
    return selected;
  }

  async getSelectedInterests(): Promise<string[]> {
    const selected: string[] = [];
    const interests = [
      'tango-dancing', 'museums', 'art-galleries', 'live-music', 
      'food-tours', 'wine-tasting', 'historical-sites', 'shopping',
      'nature-parks', 'photography', 'cooking-classes', 'local-markets'
    ];
    
    for (const interest of interests) {
      const checkbox = this.page.locator(`[data-testid="checkbox-interest-${interest}"]`);
      if (await checkbox.isChecked()) {
        selected.push(interest);
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
    const languages = await this.getSelectedLanguages();
    const interests = await this.getSelectedInterests();
    return languages.length > 0 && interests.length > 0;
  }

  async validateStep(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const languages = await this.getSelectedLanguages();
    const interests = await this.getSelectedInterests();

    if (languages.length === 0) {
      errors.push('Please select at least one language');
    }

    if (interests.length === 0) {
      errors.push('Please select at least one interest');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async fillSampleData() {
    await this.selectLanguages(['English', 'Spanish', 'Portuguese']);
    await this.selectInterests(['Tango Dancing', 'Food Tours', 'Wine Tasting', 'Local Markets']);
  }

  async clearAllSelections() {
    const languages = await this.getSelectedLanguages();
    for (const language of languages) {
      await this.unselectLanguage(language);
    }

    const interests = await this.getSelectedInterests();
    for (const interest of interests) {
      await this.unselectInterest(interest);
    }
  }

  async takeSnapshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/guest-onboarding-languages-${name}.png`,
      fullPage: true
    });
  }

  async checkAccessibility() {
    const { injectAxe, checkA11y } = await import('@axe-core/playwright');
    await injectAxe(this.page);
    await checkA11y(this.page, '[data-testid="guest-onboarding-languages"]', {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      }
    });
  }

  async selectAllLanguages() {
    const languages = [
      'English', 'Spanish', 'Portuguese', 'French', 'German', 
      'Italian', 'Chinese', 'Japanese', 'Korean', 'Russian', 'Arabic'
    ];
    await this.selectLanguages(languages);
  }

  async selectAllInterests() {
    const interests = [
      'Tango Dancing', 'Museums', 'Art Galleries', 'Live Music', 
      'Food Tours', 'Wine Tasting', 'Historical Sites', 'Shopping',
      'Nature Parks', 'Photography', 'Cooking Classes', 'Local Markets'
    ];
    await this.selectInterests(interests);
  }
}