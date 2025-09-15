import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page object model for Step 6: Emergency Contact
 * Handles emergency contact information
 */
export class EmergencyContactStep extends BasePage {
  readonly stepTitle: Locator;
  readonly stepDescription: Locator;
  readonly nameInput: Locator;
  readonly phoneInput: Locator;
  readonly relationshipInput: Locator;
  readonly emailInput: Locator;
  readonly alternatePhoneInput: Locator;
  readonly notesTextarea: Locator;
  readonly privacyNotice: Locator;
  readonly completeButton: Locator;
  readonly backButton: Locator;
  readonly progressBar: Locator;
  readonly stepIndicator: Locator;
  readonly validationMessage: Locator;
  readonly countryCodeSelect: Locator;

  constructor(page: Page) {
    super(page);

    // Step elements
    this.stepTitle = page.locator('[data-testid="step-title-emergency"]');
    this.stepDescription = page.locator('[data-testid="step-description-emergency"]');
    this.progressBar = page.locator('[data-testid="progress-bar"]');
    this.stepIndicator = page.locator('[data-testid="step-indicator"]');

    // Form inputs
    this.nameInput = page.locator('[data-testid="input-emergency-name"]');
    this.phoneInput = page.locator('[data-testid="input-emergency-phone"]');
    this.relationshipInput = page.locator('[data-testid="input-emergency-relationship"]');
    this.emailInput = page.locator('[data-testid="input-emergency-email"]');
    this.alternatePhoneInput = page.locator('[data-testid="input-emergency-alternate-phone"]');
    this.notesTextarea = page.locator('[data-testid="textarea-emergency-notes"]');
    this.countryCodeSelect = page.locator('[data-testid="select-country-code"]');

    // Other elements
    this.privacyNotice = page.locator('[data-testid="privacy-notice-emergency"]');
    this.validationMessage = page.locator('[data-testid="validation-emergency"]');

    // Navigation buttons
    this.completeButton = page.locator('[data-testid="button-complete-onboarding"]');
    this.backButton = page.locator('[data-testid="button-back-emergency"]');
  }

  async fillEmergencyContact(data: {
    name: string;
    phone: string;
    relationship: string;
    email?: string;
    alternatePhone?: string;
    notes?: string;
  }) {
    await this.nameInput.fill(data.name);
    await this.phoneInput.fill(data.phone);
    await this.relationshipInput.fill(data.relationship);
    
    if (data.email) {
      await this.emailInput.fill(data.email);
    }
    
    if (data.alternatePhone) {
      await this.alternatePhoneInput.fill(data.alternatePhone);
    }
    
    if (data.notes) {
      await this.notesTextarea.fill(data.notes);
    }
  }

  async selectCountryCode(code: string) {
    await this.countryCodeSelect.click();
    await this.page.locator(`[data-testid="option-country-${code}"]`).click();
  }

  async getEmergencyContactData(): Promise<{
    name: string;
    phone: string;
    relationship: string;
    email: string;
    alternatePhone: string;
    notes: string;
  }> {
    return {
      name: await this.nameInput.inputValue(),
      phone: await this.phoneInput.inputValue(),
      relationship: await this.relationshipInput.inputValue(),
      email: await this.emailInput.inputValue(),
      alternatePhone: await this.alternatePhoneInput.inputValue(),
      notes: await this.notesTextarea.inputValue()
    };
  }

  async completeOnboarding() {
    await this.completeButton.click();
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
    const data = await this.getEmergencyContactData();
    return !!(data.name && data.phone && data.relationship);
  }

  async validateStep(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const data = await this.getEmergencyContactData();

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Emergency contact name is required');
    }

    if (!data.phone || data.phone.trim().length === 0) {
      errors.push('Emergency contact phone is required');
    }

    if (!data.relationship || data.relationship.trim().length === 0) {
      errors.push('Relationship to emergency contact is required');
    }

    // Validate phone format
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (data.phone && !phoneRegex.test(data.phone)) {
      errors.push('Invalid phone number format');
    }

    // Validate email format if provided
    if (data.email && data.email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Invalid email format');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async fillSampleData() {
    await this.fillEmergencyContact({
      name: 'John Doe',
      phone: '+1 234 567 8900',
      relationship: 'Spouse',
      email: 'john.doe@example.com',
      alternatePhone: '+1 234 567 8901',
      notes: 'Available 24/7 for emergencies'
    });
  }

  async clearAllInputs() {
    await this.nameInput.clear();
    await this.phoneInput.clear();
    await this.relationshipInput.clear();
    await this.emailInput.clear();
    await this.alternatePhoneInput.clear();
    await this.notesTextarea.clear();
  }

  async takeSnapshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/guest-onboarding-emergency-${name}.png`,
      fullPage: true
    });
  }

  async checkAccessibility() {
    const { injectAxe, checkA11y } = await import('@axe-core/playwright');
    await injectAxe(this.page);
    await checkA11y(this.page, '[data-testid="guest-onboarding-emergency"]', {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      }
    });
  }

  async isPrivacyNoticeVisible(): Promise<boolean> {
    return await this.privacyNotice.isVisible();
  }

  async getPrivacyNoticeText(): Promise<string> {
    return await this.privacyNotice.textContent() || '';
  }

  async testPhoneValidation(): Promise<{ valid: boolean; message: string }> {
    // Test various phone formats
    const testCases = [
      { phone: '1234567890', expected: true },
      { phone: '+1 (234) 567-8900', expected: true },
      { phone: '123-456-7890', expected: true },
      { phone: 'invalid-phone', expected: false },
      { phone: 'abc123', expected: false }
    ];

    for (const testCase of testCases) {
      await this.phoneInput.clear();
      await this.phoneInput.fill(testCase.phone);
      await this.phoneInput.blur();
      
      const isValid = !(await this.validationMessage.isVisible());
      if (isValid !== testCase.expected) {
        return {
          valid: false,
          message: `Phone validation failed for: ${testCase.phone}`
        };
      }
    }

    return {
      valid: true,
      message: 'All phone validation tests passed'
    };
  }

  async testEmailValidation(): Promise<{ valid: boolean; message: string }> {
    // Test various email formats
    const testCases = [
      { email: 'test@example.com', expected: true },
      { email: 'user.name@domain.co.uk', expected: true },
      { email: 'invalid-email', expected: false },
      { email: '@example.com', expected: false },
      { email: 'test@', expected: false }
    ];

    for (const testCase of testCases) {
      await this.emailInput.clear();
      await this.emailInput.fill(testCase.email);
      await this.emailInput.blur();
      
      const isValid = !(await this.validationMessage.isVisible());
      if (isValid !== testCase.expected) {
        return {
          valid: false,
          message: `Email validation failed for: ${testCase.email}`
        };
      }
    }

    return {
      valid: true,
      message: 'All email validation tests passed'
    };
  }

  async isCompleteButtonEnabled(): Promise<boolean> {
    return await this.completeButton.isEnabled();
  }

  async getCompleteButtonText(): Promise<string> {
    return await this.completeButton.textContent() || '';
  }
}