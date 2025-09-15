import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page object model for Step 5: Welcome & Tutorial
 * Handles onboarding tutorial and initial setup
 */
export class WelcomeTutorialPage extends BasePage {
  readonly welcomeMessage: Locator;
  readonly tutorialContainer: Locator;
  readonly tutorialSteps: Locator;
  readonly currentStepIndicator: Locator;
  readonly tutorialContent: Locator;
  readonly skipTutorialButton: Locator;
  readonly nextTutorialButton: Locator;
  readonly previousTutorialButton: Locator;
  readonly startExploringButton: Locator;
  readonly recommendedGroups: Locator;
  readonly recommendedEvents: Locator;
  readonly recommendedPeople: Locator;
  readonly joinGroupButtons: Locator;
  readonly followUserButtons: Locator;
  readonly rsvpEventButtons: Locator;
  readonly notificationPreferences: Locator;
  readonly emailNotificationsCheckbox: Locator;
  readonly pushNotificationsCheckbox: Locator;
  readonly smsNotificationsCheckbox: Locator;
  readonly profileCompletionBadge: Locator;
  readonly progressBar: Locator;
  readonly confettiAnimation: Locator;

  constructor(page: Page) {
    super(page);
    
    // Welcome elements
    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
    this.confettiAnimation = page.locator('[data-testid="confetti-animation"]');
    
    // Tutorial elements
    this.tutorialContainer = page.locator('[data-testid="tutorial-container"]');
    this.tutorialSteps = page.locator('[data-testid="tutorial-steps"]');
    this.currentStepIndicator = page.locator('[data-testid="tutorial-current-step"]');
    this.tutorialContent = page.locator('[data-testid="tutorial-content"]');
    
    // Tutorial navigation
    this.skipTutorialButton = page.locator('[data-testid="button-skip-tutorial"]');
    this.nextTutorialButton = page.locator('[data-testid="button-next-tutorial"]');
    this.previousTutorialButton = page.locator('[data-testid="button-previous-tutorial"]');
    this.startExploringButton = page.locator('[data-testid="button-start-exploring"]');
    
    // Recommendations
    this.recommendedGroups = page.locator('[data-testid="recommended-groups"]');
    this.recommendedEvents = page.locator('[data-testid="recommended-events"]');
    this.recommendedPeople = page.locator('[data-testid="recommended-people"]');
    this.joinGroupButtons = page.locator('[data-testid^="button-join-group-"]');
    this.followUserButtons = page.locator('[data-testid^="button-follow-user-"]');
    this.rsvpEventButtons = page.locator('[data-testid^="button-rsvp-event-"]');
    
    // Notification preferences
    this.notificationPreferences = page.locator('[data-testid="notification-preferences"]');
    this.emailNotificationsCheckbox = page.locator('[data-testid="checkbox-email-notifications"]');
    this.pushNotificationsCheckbox = page.locator('[data-testid="checkbox-push-notifications"]');
    this.smsNotificationsCheckbox = page.locator('[data-testid="checkbox-sms-notifications"]');
    
    // Profile completion
    this.profileCompletionBadge = page.locator('[data-testid="profile-completion-badge"]');
    this.progressBar = page.locator('[data-testid="progress-bar"]');
  }

  async skipTutorial() {
    await this.skipTutorialButton.click();
  }

  async navigateTutorial(direction: 'next' | 'previous') {
    if (direction === 'next') {
      await this.nextTutorialButton.click();
    } else {
      await this.previousTutorialButton.click();
    }
  }

  async completeTutorial() {
    // Navigate through all tutorial steps
    while (await this.nextTutorialButton.isVisible() && await this.nextTutorialButton.isEnabled()) {
      await this.nextTutorialButton.click();
      await this.page.waitForTimeout(300); // Small delay for animation
    }
  }

  async getCurrentTutorialStep(): Promise<number> {
    const text = await this.currentStepIndicator.textContent() || '1';
    const match = text.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  }

  async getTotalTutorialSteps(): Promise<number> {
    const steps = await this.tutorialSteps.count();
    return steps;
  }

  async joinRecommendedGroup(index: number = 0) {
    const buttons = await this.joinGroupButtons.all();
    if (buttons[index]) {
      await buttons[index].click();
    }
  }

  async followRecommendedUser(index: number = 0) {
    const buttons = await this.followUserButtons.all();
    if (buttons[index]) {
      await buttons[index].click();
    }
  }

  async rsvpToRecommendedEvent(index: number = 0) {
    const buttons = await this.rsvpEventButtons.all();
    if (buttons[index]) {
      await buttons[index].click();
    }
  }

  async setNotificationPreferences(data: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  }) {
    if (data.email !== undefined) {
      if (data.email) {
        await this.emailNotificationsCheckbox.check();
      } else {
        await this.emailNotificationsCheckbox.uncheck();
      }
    }
    if (data.push !== undefined) {
      if (data.push) {
        await this.pushNotificationsCheckbox.check();
      } else {
        await this.pushNotificationsCheckbox.uncheck();
      }
    }
    if (data.sms !== undefined) {
      if (data.sms) {
        await this.smsNotificationsCheckbox.check();
      } else {
        await this.smsNotificationsCheckbox.uncheck();
      }
    }
  }

  async startExploring() {
    await this.startExploringButton.click();
  }

  async getProfileCompletionPercentage(): Promise<number> {
    const text = await this.profileCompletionBadge.textContent() || '0%';
    const match = text.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  async hasConfettiAnimation(): Promise<boolean> {
    return await this.confettiAnimation.isVisible();
  }

  async getRecommendedGroupsCount(): Promise<number> {
    return await this.recommendedGroups.locator('.group-card').count();
  }

  async getRecommendedEventsCount(): Promise<number> {
    return await this.recommendedEvents.locator('.event-card').count();
  }

  async getRecommendedPeopleCount(): Promise<number> {
    return await this.recommendedPeople.locator('.user-card').count();
  }

  async getWelcomeMessage(): Promise<string> {
    return await this.welcomeMessage.textContent() || '';
  }

  async getProgressPercentage(): Promise<number> {
    const progress = await this.progressBar.getAttribute('aria-valuenow');
    return parseInt(progress || '100'); // Should be 100% at this step
  }
}