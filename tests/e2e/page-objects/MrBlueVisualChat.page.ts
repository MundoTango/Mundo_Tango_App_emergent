/**
 * PAGE OBJECT MODEL (POM) - Mr Blue Visual Chat
 * Industry Standard 2025: Encapsulates UI interactions for maintainability
 * Following Playwright best practices with auto-wait assertions
 */

import { Page, Locator, expect } from '@playwright/test';

export class MrBlueVisualChatPage {
  readonly page: Page;
  
  // Header Elements
  readonly chatContainer: Locator;
  readonly chatHeader: Locator;
  readonly avatarMrBlue: Locator;
  readonly titleText: Locator;
  readonly subtitleText: Locator;
  readonly contextBadges: Locator;
  readonly badgeCurrentPage: Locator;
  readonly badgeSelectedElement: Locator;
  readonly badgeAutonomousMode: Locator;
  
  // Message Elements
  readonly messagesContainer: Locator;
  readonly messagesList: Locator;
  readonly loadingIndicator: Locator;
  readonly loadingMessage: Locator;
  
  // Input Elements
  readonly chatInputArea: Locator;
  readonly inputControls: Locator;
  readonly chatInput: Locator;
  readonly sendButton: Locator;
  readonly sendIcon: Locator;
  readonly loadingIcon: Locator;
  
  // Quick Actions
  readonly quickActionsPanel: Locator;
  readonly quickColorButton: Locator;
  readonly quickLoadingButton: Locator;
  
  // Progress Sidebar
  readonly progressSidebar: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Header
    this.chatContainer = page.getByTestId('mr-blue-visual-chat');
    this.chatHeader = page.getByTestId('chat-header');
    this.avatarMrBlue = page.getByTestId('avatar-mrblue');
    this.titleText = page.getByTestId('text-title');
    this.subtitleText = page.getByTestId('text-subtitle');
    this.contextBadges = page.getByTestId('context-badges');
    this.badgeCurrentPage = page.getByTestId('badge-current-page');
    this.badgeSelectedElement = page.getByTestId('badge-selected-element');
    this.badgeAutonomousMode = page.getByTestId('badge-autonomous-mode');
    
    // Messages
    this.messagesContainer = page.getByTestId('chat-messages-container');
    this.messagesList = page.getByTestId('messages-list');
    this.loadingIndicator = page.getByTestId('loading-indicator');
    this.loadingMessage = page.getByTestId('text-loading-message');
    
    // Input
    this.chatInputArea = page.getByTestId('chat-input-area');
    this.inputControls = page.getByTestId('input-controls');
    this.chatInput = page.getByTestId('input-chat-message');
    this.sendButton = page.getByTestId('button-send-message');
    this.sendIcon = page.getByTestId('icon-send');
    this.loadingIcon = page.getByTestId('icon-loading');
    
    // Quick Actions
    this.quickActionsPanel = page.getByTestId('quick-actions-panel');
    this.quickColorButton = page.getByTestId('button-quick-autonomous-color');
    this.quickLoadingButton = page.getByTestId('button-quick-autonomous-loading');
    
    // Progress
    this.progressSidebar = page.getByTestId('autonomous-progress-sidebar');
  }

  // ========================================
  // NAVIGATION METHODS
  // ========================================

  async goto() {
    await this.page.goto('/?edit=true');
    await this.page.waitForLoadState('networkidle');
  }

  async openAITab() {
    const aiTab = this.page.getByRole('tab', { name: /AI/i });
    await aiTab.click();
    await expect(this.chatContainer).toBeVisible();
  }

  // ========================================
  // INTERACTION METHODS (Industry Standard)
  // ========================================

  async sendMessage(message: string) {
    // Auto-wait assertion: Input should be visible and enabled
    await expect(this.chatInput).toBeVisible();
    await expect(this.chatInput).toBeEnabled();
    
    await this.chatInput.fill(message);
    await this.sendButton.click();
    
    // Verify loading state appears
    await expect(this.loadingIndicator).toBeVisible({ timeout: 2000 });
  }

  async clickQuickAction(action: 'color' | 'loading') {
    const button = action === 'color' ? this.quickColorButton : this.quickLoadingButton;
    await button.click();
    
    // Verify input populated
    const expectedText = action === 'color' ? 'Make this button red' : 'Add a loading spinner';
    await expect(this.chatInput).toHaveValue(expectedText);
  }

  async waitForResponse(timeout = 10000) {
    // Wait for loading to disappear (response received)
    await expect(this.loadingIndicator).not.toBeVisible({ timeout });
  }

  // ========================================
  // ASSERTION METHODS (Best Practices)
  // ========================================

  async assertInitialState() {
    await expect(this.chatContainer).toBeVisible();
    await expect(this.titleText).toHaveText('Mr Blue');
    await expect(this.subtitleText).toContainText('Autonomous Mode');
    await expect(this.badgeAutonomousMode).toBeVisible();
  }

  async assertSelectedElement(elementInfo: string) {
    await expect(this.badgeSelectedElement).toBeVisible();
    await expect(this.badgeSelectedElement).toContainText(elementInfo);
  }

  async assertMessageReceived(content: string) {
    // FIX: Use locator for dynamic test IDs
    const lastMessage = this.page.locator('[data-testid^="message-assistant-"]').last();
    await expect(lastMessage).toBeVisible();
    await expect(lastMessage).toContainText(content);
  }

  async assertAutonomousExecutionStarted() {
    await expect(this.loadingMessage).toHaveText('Executing autonomously...');
  }

  async assertProgressSidebarVisible() {
    await expect(this.progressSidebar).toBeVisible();
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  async getMessageCount(): Promise<number> {
    // FIX: Use locator with CSS selector instead of RegExp
    const messages = await this.page.locator('[data-testid^="message-"]').all();
    return messages.length;
  }

  async getMessageContent(index: number): Promise<string> {
    const messageContent = this.page.getByTestId(`text-message-content-${index}`);
    return await messageContent.textContent() || '';
  }

  async isInputDisabled(): Promise<boolean> {
    return await this.chatInput.isDisabled();
  }

  async isSendButtonDisabled(): Promise<boolean> {
    return await this.sendButton.isDisabled();
  }

  // ========================================
  // NETWORK MOCKING (Advanced)
  // ========================================

  async mockAutonomousAPI(response: any) {
    await this.page.route('**/api/mrblue/autonomous/execute', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  async mockSSEStream(taskId: string, events: any[]) {
    await this.page.route(`**/api/mrblue/autonomous/stream/${taskId}`, route => {
      const eventData = events.map(e => `data: ${JSON.stringify(e)}\n\n`).join('');
      route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: eventData,
      });
    });
  }

  // ========================================
  // ACCESSIBILITY TESTING (WCAG)
  // ========================================

  async checkAccessibility() {
    // Verify ARIA labels
    await expect(this.chatInput).toHaveAttribute('aria-label', 'Chat message input');
    await expect(this.sendButton).toHaveAttribute('aria-label', 'Send message');
    
    // Verify keyboard navigation
    await this.chatInput.focus();
    await expect(this.chatInput).toBeFocused();
    
    return true;
  }

  // ========================================
  // VISUAL REGRESSION (Screenshots)
  // ========================================

  async takeScreenshot(name: string) {
    await expect(this.chatContainer).toHaveScreenshot(`${name}.png`);
  }
}
