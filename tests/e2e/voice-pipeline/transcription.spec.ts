/**
 * VOICE PIPELINE TEST: Transcription
 * MB.MD Comprehensive Testing - October 28, 2025
 * 
 * Tests: Voice input capture, transcript display, evidence storage
 */

import { test, expect } from '@playwright/test';
import { loginAsSuperAdmin } from '../../helpers/auth';
import { EvidenceCollector } from '../../support/evidence';
import { VoicePipelinePage } from '../page-objects/VoicePipeline.page';
import { createMBMDSession, assertSessionHasEvidence } from '../../fixtures/mbmd-session';
import { enableAutonomousMode } from '../../fixtures/feature-flags';

test.describe('Voice Pipeline - Transcription', () => {
  let evidence: EvidenceCollector;
  
  test.beforeEach(async ({ page, request }) => {
    await enableAutonomousMode(request);
    await loginAsSuperAdmin(page);
    
    evidence = new EvidenceCollector(page, test.info(), 'super-admin');
    evidence.setFeatureFlags({ 'mbmd-voice-evidence': true });
  });
  
  test.afterEach(async () => {
    await evidence.setStatus(
      test.info().status === 'passed' ? 'passed' : 'failed',
      test.info().duration
    );
    await evidence.saveManifest();
  });
  
  test('Voice transcription appears in live preview', async ({ page }) => {
    const voice = new VoicePipelinePage(page);
    
    await voice.goto();
    await evidence.captureScreenshot('01-home');
    
    await voice.openVoiceModal();
    await evidence.captureScreenshot('02-voice-modal-opened');
    
    // Start recording (in test, we'll mock audio input)
    await voice.startRecording();
    await evidence.captureScreenshot('03-recording-started');
    
    // Simulate transcript appearing
    await voice.assertTranscriptDisplayed('Make the heading bigger');
    await evidence.captureScreenshot('04-transcript-displayed');
    
    // Stop recording
    await voice.stopRecording();
    await evidence.captureScreenshot('05-recording-stopped');
    
    // No errors
    expect(evidence.hasErrors()).toBe(false);
  });
  
  test('Voice transcripts stored in MB.MD session evidence', async ({ page, request }) => {
    const voice = new VoicePipelinePage(page);
    
    // Create MB.MD session
    const session = await createMBMDSession(request, 1, 'Test prompt');
    
    await voice.goto();
    await voice.openVoiceModal();
    await voice.startRecording();
    
    // Wait for transcript
    await page.waitForTimeout(2000);
    
    await voice.stopRecording();
    
    // Verify evidence stored
    await voice.assertEvidenceStored(session.id);
    await evidence.captureScreenshot('evidence-verified');
  });
});
