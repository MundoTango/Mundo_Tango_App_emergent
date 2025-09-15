import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page object model for Step 3: Dance Preferences
 * Handles tango experience and role selection
 */
export class DancePreferencesPage extends BasePage {
  readonly experienceLevelSelect: Locator;
  readonly yearsOfExperienceInput: Locator;
  readonly danceStyleCheckboxes: Map<string, Locator>;
  readonly roleCheckboxes: Map<string, Locator>;
  readonly partnerPreferenceRadio: Map<string, Locator>;
  readonly favoriteOrchestraInput: Locator;
  readonly aboutTangoTextarea: Locator;
  readonly continueButton: Locator;
  readonly backButton: Locator;
  readonly skipButton: Locator;
  readonly progressBar: Locator;
  readonly roleDescriptions: Locator;
  readonly selectedRolesBadge: Locator;

  constructor(page: Page) {
    super(page);
    
    // Experience fields
    this.experienceLevelSelect = page.locator('[data-testid="select-experience-level"]');
    this.yearsOfExperienceInput = page.locator('[data-testid="input-years-experience"]');
    
    // Dance styles
    this.danceStyleCheckboxes = new Map([
      ['salon', page.locator('[data-testid="checkbox-style-salon"]')],
      ['milonguero', page.locator('[data-testid="checkbox-style-milonguero"]')],
      ['nuevo', page.locator('[data-testid="checkbox-style-nuevo"]')],
      ['stage', page.locator('[data-testid="checkbox-style-stage"]')],
      ['vals', page.locator('[data-testid="checkbox-style-vals"]')],
      ['milonga', page.locator('[data-testid="checkbox-style-milonga"]')],
    ]);
    
    // Roles in community
    this.roleCheckboxes = new Map([
      ['dancer', page.locator('[data-testid="checkbox-role-dancer"]')],
      ['teacher', page.locator('[data-testid="checkbox-role-teacher"]')],
      ['organizer', page.locator('[data-testid="checkbox-role-organizer"]')],
      ['dj', page.locator('[data-testid="checkbox-role-dj"]')],
      ['musician', page.locator('[data-testid="checkbox-role-musician"]')],
      ['host', page.locator('[data-testid="checkbox-role-host"]')],
      ['guide', page.locator('[data-testid="checkbox-role-guide"]')],
    ]);
    
    // Partner preference
    this.partnerPreferenceRadio = new Map([
      ['leader', page.locator('[data-testid="radio-partner-leader"]')],
      ['follower', page.locator('[data-testid="radio-partner-follower"]')],
      ['both', page.locator('[data-testid="radio-partner-both"]')],
      ['no-preference', page.locator('[data-testid="radio-partner-no-preference"]')],
    ]);
    
    // Additional fields
    this.favoriteOrchestraInput = page.locator('[data-testid="input-favorite-orchestra"]');
    this.aboutTangoTextarea = page.locator('[data-testid="textarea-about-tango"]');
    
    // Buttons
    this.continueButton = page.locator('[data-testid="button-continue-step-3"]');
    this.backButton = page.locator('[data-testid="button-back-step-3"]');
    this.skipButton = page.locator('[data-testid="button-skip-step-3"]');
    
    // UI elements
    this.progressBar = page.locator('[data-testid="progress-bar"]');
    this.roleDescriptions = page.locator('[data-testid="role-descriptions"]');
    this.selectedRolesBadge = page.locator('[data-testid="selected-roles-count"]');
  }

  async selectExperienceLevel(level: 'beginner' | 'intermediate' | 'advanced' | 'professional') {
    await this.experienceLevelSelect.selectOption(level);
  }

  async setYearsOfExperience(years: number) {
    await this.yearsOfExperienceInput.fill(years.toString());
  }

  async selectDanceStyles(styles: string[]) {
    for (const style of styles) {
      const checkbox = this.danceStyleCheckboxes.get(style);
      if (checkbox) {
        await checkbox.check();
      }
    }
  }

  async selectRoles(roles: string[]) {
    for (const role of roles) {
      const checkbox = this.roleCheckboxes.get(role);
      if (checkbox) {
        await checkbox.check();
      }
    }
  }

  async selectPartnerPreference(preference: 'leader' | 'follower' | 'both' | 'no-preference') {
    const radio = this.partnerPreferenceRadio.get(preference);
    if (radio) {
      await radio.check();
    }
  }

  async fillAdditionalInfo(data: {
    favoriteOrchestra?: string;
    aboutTango?: string;
  }) {
    if (data.favoriteOrchestra) {
      await this.favoriteOrchestraInput.fill(data.favoriteOrchestra);
    }
    if (data.aboutTango) {
      await this.aboutTangoTextarea.fill(data.aboutTango);
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

  async getSelectedRolesCount(): Promise<number> {
    const text = await this.selectedRolesBadge.textContent() || '0';
    return parseInt(text);
  }

  async getProgressPercentage(): Promise<number> {
    const progress = await this.progressBar.getAttribute('aria-valuenow');
    return parseInt(progress || '0');
  }
}