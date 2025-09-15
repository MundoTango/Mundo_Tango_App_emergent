import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page object model for Step 2: Profile Details
 * Handles user profile information and avatar upload
 */
export class ProfileDetailsPage extends BasePage {
  readonly avatarUpload: Locator;
  readonly avatarPreview: Locator;
  readonly bioTextarea: Locator;
  readonly birthDateInput: Locator;
  readonly genderSelect: Locator;
  readonly phoneInput: Locator;
  readonly whatsappCheckbox: Locator;
  readonly instagramInput: Locator;
  readonly facebookInput: Locator;
  readonly continueButton: Locator;
  readonly backButton: Locator;
  readonly skipButton: Locator;
  readonly progressBar: Locator;
  readonly errorMessage: Locator;
  readonly characterCount: Locator;

  constructor(page: Page) {
    super(page);
    
    // Avatar
    this.avatarUpload = page.locator('[data-testid="input-avatar-upload"]');
    this.avatarPreview = page.locator('[data-testid="avatar-preview"]');
    
    // Profile fields
    this.bioTextarea = page.locator('[data-testid="textarea-bio"]');
    this.birthDateInput = page.locator('[data-testid="input-birth-date"]');
    this.genderSelect = page.locator('[data-testid="select-gender"]');
    this.phoneInput = page.locator('[data-testid="input-phone"]');
    this.whatsappCheckbox = page.locator('[data-testid="checkbox-whatsapp"]');
    
    // Social media
    this.instagramInput = page.locator('[data-testid="input-instagram"]');
    this.facebookInput = page.locator('[data-testid="input-facebook"]');
    
    // Buttons
    this.continueButton = page.locator('[data-testid="button-continue-step-2"]');
    this.backButton = page.locator('[data-testid="button-back-step-2"]');
    this.skipButton = page.locator('[data-testid="button-skip-step-2"]');
    
    // UI elements
    this.progressBar = page.locator('[data-testid="progress-bar"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.characterCount = page.locator('[data-testid="bio-character-count"]');
  }

  async uploadAvatar(filePath: string) {
    await this.avatarUpload.setInputFiles(filePath);
  }

  async fillProfileDetails(data: {
    bio?: string;
    birthDate?: string;
    gender?: string;
    phone?: string;
    hasWhatsapp?: boolean;
    instagram?: string;
    facebook?: string;
  }) {
    if (data.bio) {
      await this.bioTextarea.fill(data.bio);
    }
    if (data.birthDate) {
      await this.birthDateInput.fill(data.birthDate);
    }
    if (data.gender) {
      await this.genderSelect.selectOption(data.gender);
    }
    if (data.phone) {
      await this.phoneInput.fill(data.phone);
    }
    if (data.hasWhatsapp !== undefined) {
      if (data.hasWhatsapp) {
        await this.whatsappCheckbox.check();
      } else {
        await this.whatsappCheckbox.uncheck();
      }
    }
    if (data.instagram) {
      await this.instagramInput.fill(data.instagram);
    }
    if (data.facebook) {
      await this.facebookInput.fill(data.facebook);
    }
  }

  async continueToNextStep() {
    await this.continueButton.click();
  }

  async goBack() {
    await this.backButton.click();
  }

  async skipStep() {
    await this.skipButton.click();
  }

  async getBioCharacterCount(): Promise<number> {
    const text = await this.characterCount.textContent() || '0';
    const match = text.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  async hasAvatarPreview(): Promise<boolean> {
    return await this.avatarPreview.isVisible();
  }

  async getProgressPercentage(): Promise<number> {
    const progress = await this.progressBar.getAttribute('aria-valuenow');
    return parseInt(progress || '0');
  }
}