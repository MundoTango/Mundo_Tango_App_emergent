/**
 * STREAMING SYNC TEST: Chat & Preview Synchronization
 * MB.MD Comprehensive Testing - October 28, 2025
 * 
 * Tests: Real-time updates to both chat and preview, WebSocket streaming
 */

import { test, expect } from '@playwright/test';
import { loginAsSuperAdmin } from '../../helpers/auth';
import { EvidenceCollector, captureStreamingVideo } from '../../support/evidence';
import { StreamingSyncPage } from '../page-objects/StreamingSync.page';
import { MrBlueVisualChatPage } from '../page-objects/MrBlueVisualChat.page';

test.describe('Streaming Sync - Chat & Preview', () => {
  let evidence: EvidenceCollector;
  
  test.beforeEach(async ({ page }) => {
    await loginAsSuperAdmin(page);
    evidence = new EvidenceCollector(page, test.info(), 'super-admin');
  });
  
  test.afterEach(async () => {
    await evidence.setStatus(
      test.info().status === 'passed' ? 'passed' : 'failed',
      test.info().duration
    );
    await evidence.saveManifest();
  });
  
  test('Chat and preview update simultaneously during streaming', async ({ page }) => {
    const streaming = new StreamingSyncPage(page);
    const chat = new MrBlueVisualChatPage(page);
    
    await streaming.goto();
    await evidence.captureScreenshot('01-initial-state');
    
    // Wait for WebSocket connection
    await streaming.waitForWebSocket();
    await evidence.captureScreenshot('02-websocket-connected');
    
    // Capture streaming behavior as video
    await captureStreamingVideo(page, test.info(), async () => {
      await chat.openAITab();
      await chat.sendMessage('Make button red');
      await chat.waitForResponse();
    }, 'chat-preview-streaming');
    
    // Verify both updated
    await streaming.assertSynchronizedUpdate('button', 'button');
    await evidence.captureScreenshot('03-synchronized-update');
    
    // No errors
    expect(evidence.hasErrors()).toBe(false);
  });
  
  test('Measure streaming latency (should be < 1000ms)', async ({ page }) => {
    const streaming = new StreamingSyncPage(page);
    const chat = new MrBlueVisualChatPage(page);
    
    await streaming.goto();
    await streaming.waitForWebSocket();
    
    const latency = await streaming.measureStreamingLatency(async () => {
      await chat.openAITab();
      await chat.sendMessage('Test message');
    });
    
    expect(latency).toBeLessThan(1000);
    await evidence.captureScreenshot('latency-measured');
  });
});
