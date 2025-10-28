/**
 * PAGE OBJECT: Streaming Synchronization
 * MB.MD Comprehensive Testing - October 28, 2025
 * 
 * Tests: Real-time chat/preview updates, WebSocket streaming, SSE events
 */

import { Page, Locator, expect } from '@playwright/test';

export class StreamingSyncPage {
  readonly page: Page;
  
  // Chat elements
  readonly chatMessages: Locator;
  readonly latestMessage: Locator;
  readonly streamingIndicator: Locator;
  
  // Preview elements
  readonly previewPanel: Locator;
  readonly previewContent: Locator;
  readonly previewUpdateIndicator: Locator;
  
  // Streaming status
  readonly websocketStatus: Locator;
  readonly sseStatus: Locator;
  
  constructor(page: Page) {
    this.page = page;
    
    this.chatMessages = page.locator('[data-testid="chat-messages"]');
    this.latestMessage = page.locator('[data-testid^="message-"]').last();
    this.streamingIndicator = page.locator('[data-testid="streaming-indicator"]');
    
    this.previewPanel = page.locator('[data-testid="preview-panel"]');
    this.previewContent = page.frameLocator('[data-testid="preview-iframe"]').locator('body');
    this.previewUpdateIndicator = page.locator('[data-testid="preview-updating"]');
    
    this.websocketStatus = page.locator('[data-testid="websocket-status"]');
    this.sseStatus = page.locator('[data-testid="sse-status"]');
  }
  
  async goto() {
    await this.page.goto('/?edit=true');
    await this.page.waitForLoadState('networkidle');
  }
  
  /**
   * Wait for WebSocket connection
   */
  async waitForWebSocket(timeout: number = 10000): Promise<void> {
    await this.page.waitForFunction(
      () => (window as any).socketConnected === true,
      { timeout }
    );
  }
  
  /**
   * Listen for streaming events
   */
  async captureStreamingEvents(action: () => Promise<void>): Promise<string[]> {
    const events: string[] = [];
    
    // Listen for WebSocket messages
    this.page.on('websocket', ws => {
      ws.on('framereceived', ({ payload }) => {
        const payloadStr = typeof payload === 'string' ? payload : payload.toString();
        events.push(payloadStr);
      });
    });
    
    await action();
    
    return events;
  }
  
  /**
   * Assert chat and preview update simultaneously
   */
  async assertSynchronizedUpdate(chatContent: string, previewSelector: string) {
    // Wait for chat message
    await expect(this.latestMessage).toContainText(chatContent);
    
    // Wait for preview update (should happen at same time)
    const previewElement = this.previewContent.locator(previewSelector);
    await expect(previewElement).toBeVisible();
  }
  
  /**
   * Measure streaming latency
   */
  async measureStreamingLatency(action: () => Promise<void>): Promise<number> {
    const startTime = Date.now();
    await action();
    await this.latestMessage.waitFor({ state: 'visible' });
    return Date.now() - startTime;
  }
}
