import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class OnboardingPage extends BasePage {
  // Selectors - Progress
  private readonly progressBar: Locator;
  private readonly stepIndicator: Locator;
  private readonly skipButton: Locator;
  private readonly backButton: Locator;
  private readonly nextButton: Locator;

  // Selectors - Welcome Step
  private readonly welcomeTitle: Locator;
  private readonly welcomeDescription: Locator;
  private readonly getStartedButton: Locator;

  // Selectors - Profile Setup
  private readonly profilePictureUpload: Locator;
  private readonly displayNameInput: Locator;
  private readonly bioTextarea: Locator;
  private readonly locationInput: Locator;

  // Selectors - Interests
  private readonly interestsGrid: Locator;
  private readonly interestItem: Locator;
  private readonly selectedInterests: Locator;

  // Selectors - Preferences
  private readonly notificationToggle: Locator;
  private readonly privacySettings: Locator;
  private readonly languageSelect: Locator;
  private readonly timezoneSelect: Locator;

  // Selectors - Completion
  private readonly completionMessage: Locator;
  private readonly goToDashboardButton: Locator;
  private readonly exploreButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize progress locators
    this.progressBar = page.locator('[data-testid="progress-bar"]');
    this.stepIndicator = page.locator('[data-testid="step-indicator"]');
    this.skipButton = page.locator('[data-testid="button-skip"]');
    this.backButton = page.locator('[data-testid="button-back"]');
    this.nextButton = page.locator('[data-testid="button-next"]');

    // Initialize welcome step locators
    this.welcomeTitle = page.locator('[data-testid="text-welcome-title"]');
    this.welcomeDescription = page.locator('[data-testid="text-welcome-description"]');
    this.getStartedButton = page.locator('[data-testid="button-get-started"]');

    // Initialize profile setup locators
    this.profilePictureUpload = page.locator('[data-testid="input-profile-picture"]');
    this.displayNameInput = page.locator('[data-testid="input-display-name"]');
    this.bioTextarea = page.locator('[data-testid="textarea-bio"]');
    this.locationInput = page.locator('[data-testid="input-location"]');

    // Initialize interests locators
    this.interestsGrid = page.locator('[data-testid="grid-interests"]');
    this.interestItem = page.locator('[data-testid^="interest-item-"]');
    this.selectedInterests = page.locator('[data-testid="selected-interests"]');

    // Initialize preferences locators
    this.notificationToggle = page.locator('[data-testid="toggle-notifications"]');
    this.privacySettings = page.locator('[data-testid="privacy-settings"]');
    this.languageSelect = page.locator('[data-testid="select-language"]');
    this.timezoneSelect = page.locator('[data-testid="select-timezone"]');

    // Initialize completion locators
    this.completionMessage = page.locator('[data-testid="text-completion-message"]');
    this.goToDashboardButton = page.locator('[data-testid="button-go-to-dashboard"]');
    this.exploreButton = page.locator('[data-testid="button-explore"]');
  }

  // Navigation methods
  async navigateToOnboarding(): Promise<void> {
    await this.goto('/onboarding');
  }

  async goToNextStep(): Promise<void> {
    await this.nextButton.click();
    await this.waitForPageLoad();
  }

  async goToPreviousStep(): Promise<void> {
    await this.backButton.click();
    await this.waitForPageLoad();
  }

  async skipOnboarding(): Promise<void> {
    await this.skipButton.click();
    await this.waitForPageLoad();
  }

  // Action methods
  async startOnboarding(): Promise<void> {
    await this.getStartedButton.click();
    await this.waitForPageLoad();
  }

  async setupProfile(data: {
    displayName: string;
    bio?: string;
    location?: string;
    profilePicture?: string;
  }): Promise<void> {
    await this.displayNameInput.fill(data.displayName);
    
    if (data.bio) {
      await this.bioTextarea.fill(data.bio);
    }
    
    if (data.location) {
      await this.locationInput.fill(data.location);
    }
    
    if (data.profilePicture) {
      await this.profilePictureUpload.setInputFiles(data.profilePicture);
    }
    
    await this.goToNextStep();
  }

  async selectInterests(interests: string[]): Promise<void> {
    for (const interest of interests) {
      await this.page.locator(`[data-testid="interest-item-${interest}"]`).click();
    }
    
    await this.goToNextStep();
  }

  async setPreferences(preferences: {
    notifications?: boolean;
    language?: string;
    timezone?: string;
  }): Promise<void> {
    if (preferences.notifications !== undefined) {
      const isEnabled = await this.notificationToggle.isChecked();
      if (isEnabled !== preferences.notifications) {
        await this.notificationToggle.click();
      }
    }
    
    if (preferences.language) {
      await this.languageSelect.selectOption(preferences.language);
    }
    
    if (preferences.timezone) {
      await this.timezoneSelect.selectOption(preferences.timezone);
    }
    
    await this.goToNextStep();
  }

  async completeOnboarding(): Promise<void> {
    await this.goToDashboardButton.click();
    await this.waitForPageLoad();
  }

  // Validation methods
  async getCurrentStep(): Promise<number> {
    const stepText = await this.stepIndicator.textContent() || '1';
    return parseInt(stepText.replace(/\D/g, ''));
  }

  async getProgressPercentage(): Promise<number> {
    const progress = await this.progressBar.getAttribute('aria-valuenow') || '0';
    return parseInt(progress);
  }

  async isOnboardingComplete(): Promise<boolean> {
    return await this.completionMessage.isVisible();
  }

  async verifyPageElements(): Promise<void> {
    const expectedElements = [
      '[data-testid="progress-bar"]',
      '[data-testid="step-indicator"]',
      '[data-testid="button-next"]',
    ];
    
    await this.verifyPageStructure(expectedElements);
  }

  // Accessibility and visual regression
  async checkPageAccessibility(): Promise<void> {
    await this.checkAccessibility();
  }

  async takePageSnapshot(name?: string): Promise<void> {
    await this.takeVisualSnapshot(name || 'onboarding-page');
  }
}