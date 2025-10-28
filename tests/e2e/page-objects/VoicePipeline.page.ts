/**
 * PAGE OBJECT: Voice Pipeline
 * MB.MD Comprehensive Testing - October 28, 2025
 * 
 * Tests: Voice transcription, AI summarization, evidence storage
 */

import { Page, Locator, expect } from '@playwright/test';

export class VoicePipelinePage {
  readonly page: Page;
  
  // Voice controls
  readonly voiceButton: Locator;
  readonly voiceModal: Locator;
  readonly microphoneButton: Locator;
  readonly stopRecordingButton: Locator;
  readonly voiceStatus: Locator;
  
  // Transcription display
  readonly transcriptContainer: Locator;
  readonly liveTranscript: Locator;
  readonly transcriptHistory: Locator;
  
  // AI summarization
  readonly summaryPanel: Locator;
  readonly aiSummary: Locator;
  readonly summaryStreaming: Locator;
  
  // Evidence
  readonly evidenceIndicator: Locator;
  
  constructor(page: Page) {
    this.page = page;
    
    this.voiceButton = page.locator('[data-testid="button-voice-mode"]');
    this.voiceModal = page.locator('[data-testid="voice-modal"]');
    this.microphoneButton = page.locator('[data-testid="button-start-recording"]');
    this.stopRecordingButton = page.locator('[data-testid="button-stop-recording"]');
    this.voiceStatus = page.locator('[data-testid="voice-status"]');
    
    this.transcriptContainer = page.locator('[data-testid="transcript-container"]');
    this.liveTranscript = page.locator('[data-testid="live-transcript"]');
    this.transcriptHistory = page.locator('[data-testid="transcript-history"]');
    
    this.summaryPanel = page.locator('[data-testid="summary-panel"]');
    this.aiSummary = page.locator('[data-testid="ai-summary"]');
    this.summaryStreaming = page.locator('[data-testid="summary-streaming"]');
    
    this.evidenceIndicator = page.locator('[data-testid="voice-evidence-captured"]');
  }
  
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }
  
  async openVoiceModal() {
    await this.voiceButton.click();
    await expect(this.voiceModal).toBeVisible();
  }
  
  async startRecording() {
    await this.microphoneButton.click();
    await expect(this.voiceStatus).toContainText('Recording');
  }
  
  async stopRecording() {
    await this.stopRecordingButton.click();
    await expect(this.voiceStatus).toContainText('Stopped');
  }
  
  async assertTranscriptDisplayed(expectedText: string) {
    await expect(this.liveTranscript).toContainText(expectedText);
  }
  
  async assertAISummaryGenerated() {
    await expect(this.aiSummary).toBeVisible();
    await expect(this.aiSummary).not.toBeEmpty();
  }
  
  async assertEvidenceStored(sessionId: number) {
    // Verify via API that transcript was stored in MB.MD session
    const response = await this.page.request.get(`/api/mbmd/session/${sessionId}/evidence`);
    const evidence = await response.json();
    
    expect(evidence.voiceTranscripts?.length).toBeGreaterThan(0);
  }
}
