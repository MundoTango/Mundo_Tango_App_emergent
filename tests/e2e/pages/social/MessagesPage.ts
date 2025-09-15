import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class MessagesPage extends BasePage {
  // Selectors - Sidebar
  private readonly conversationsList: Locator;
  private readonly conversationItem: Locator;
  private readonly searchConversations: Locator;
  private readonly newMessageButton: Locator;
  private readonly unreadBadge: Locator;

  // Selectors - Chat Area
  private readonly chatHeader: Locator;
  private readonly chatMessages: Locator;
  private readonly messageItem: Locator;
  private readonly messageInput: Locator;
  private readonly sendButton: Locator;
  private readonly attachmentButton: Locator;
  private readonly emojiButton: Locator;
  private readonly typingIndicator: Locator;

  // Selectors - Message Actions
  private readonly replyButton: Locator;
  private readonly deleteButton: Locator;
  private readonly editButton: Locator;
  private readonly reactButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize sidebar locators
    this.conversationsList = page.locator('[data-testid="conversations-list"]');
    this.conversationItem = page.locator('[data-testid^="conversation-item-"]');
    this.searchConversations = page.locator('[data-testid="input-search-conversations"]');
    this.newMessageButton = page.locator('[data-testid="button-new-message"]');
    this.unreadBadge = page.locator('[data-testid^="badge-unread-"]');

    // Initialize chat area locators
    this.chatHeader = page.locator('[data-testid="chat-header"]');
    this.chatMessages = page.locator('[data-testid="chat-messages"]');
    this.messageItem = page.locator('[data-testid^="message-item-"]');
    this.messageInput = page.locator('[data-testid="input-message"]');
    this.sendButton = page.locator('[data-testid="button-send-message"]');
    this.attachmentButton = page.locator('[data-testid="button-attachment"]');
    this.emojiButton = page.locator('[data-testid="button-emoji"]');
    this.typingIndicator = page.locator('[data-testid="typing-indicator"]');

    // Initialize message action locators
    this.replyButton = page.locator('[data-testid^="button-reply-"]');
    this.deleteButton = page.locator('[data-testid^="button-delete-"]');
    this.editButton = page.locator('[data-testid^="button-edit-"]');
    this.reactButton = page.locator('[data-testid^="button-react-"]');
  }

  // Navigation methods
  async navigateToMessages(): Promise<void> {
    await this.goto('/messages');
  }

  async openConversation(userId: string): Promise<void> {
    await this.page.locator(`[data-testid="conversation-item-${userId}"]`).click();
    await this.waitForPageLoad();
  }

  // Action methods
  async sendMessage(message: string): Promise<void> {
    await this.messageInput.fill(message);
    await this.sendButton.click();
  }

  async startNewConversation(username: string): Promise<void> {
    await this.newMessageButton.click();
    const modal = this.page.locator('[data-testid="modal-new-message"]');
    await modal.waitFor({ state: 'visible' });
    
    await this.page.locator('[data-testid="input-recipient"]').fill(username);
    await this.page.locator('[data-testid="button-start-chat"]').click();
  }

  async searchConversation(query: string): Promise<void> {
    await this.searchConversations.fill(query);
    await this.waitForPageLoad();
  }

  // Validation methods
  async getUnreadCount(userId: string): Promise<number> {
    const badge = this.page.locator(`[data-testid="badge-unread-${userId}"]`);
    const count = await badge.textContent() || '0';
    return parseInt(count);
  }

  async verifyMessageSent(message: string): Promise<void> {
    const lastMessage = this.chatMessages.locator('[data-testid^="message-item-"]').last();
    const text = await lastMessage.textContent();
    expect(text).toContain(message);
  }

  async isUserTyping(): Promise<boolean> {
    return await this.typingIndicator.isVisible();
  }

  // Accessibility and visual regression
  async checkPageAccessibility(): Promise<void> {
    await this.checkAccessibility();
  }

  async takePageSnapshot(name?: string): Promise<void> {
    await this.takeVisualSnapshot(name || 'messages-page');
  }
}