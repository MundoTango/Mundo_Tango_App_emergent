/**
 * ESA Life CEO 61x21 - GDPR Consent Manager
 * Handles user consent for analytics and tracking
 */

import { ConsentState } from './types';

export class ConsentManager {
  private static CONSENT_KEY = 'mt_monitoring_consent';
  private static CONSENT_VERSION = '1.0.0';
  private consentState: ConsentState | null = null;

  constructor() {
    this.loadConsent();
  }

  private loadConsent(): void {
    try {
      const stored = localStorage.getItem(ConsentManager.CONSENT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if consent version matches
        if (parsed.version === ConsentManager.CONSENT_VERSION) {
          this.consentState = parsed.state;
        }
      }
    } catch (error) {
      console.error('[ConsentManager] Failed to load consent:', error);
    }
  }

  private saveConsent(): void {
    try {
      localStorage.setItem(ConsentManager.CONSENT_KEY, JSON.stringify({
        version: ConsentManager.CONSENT_VERSION,
        state: this.consentState
      }));
    } catch (error) {
      console.error('[ConsentManager] Failed to save consent:', error);
    }
  }

  async checkConsent(): Promise<boolean> {
    // ESA Layer 49: Always require explicit user consent
    // No auto-granting based on geography - respects user privacy
    if (this.consentState) {
      return this.consentState.analytics || this.consentState.sessionRecording;
    }

    // Default to no consent - user must enable via Settings > Privacy
    return false;
  }

  private async checkIfEU(): Promise<boolean> {
    try {
      // Check timezone for quick EU detection
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const euTimezones = ['Europe/', 'GMT', 'WET', 'CET', 'EET'];
      
      return euTimezones.some(tz => timezone.includes(tz));
    } catch {
      // Default to requiring consent if we can't determine location
      return true;
    }
  }

  // ESA Layer 49 & 7: Consent now managed exclusively through React components
  // Direct DOM manipulation removed to prevent duplicate modals
  async requestConsent(): Promise<boolean> {
    // This method should only be called by React components
    // The actual modal UI is handled by ConsentModal.tsx component
    console.log('[ESA ConsentManager] Consent request delegated to React UI');
    return false; // Default to no consent - user must enable via Settings > Privacy
  }

  hasConsent(): boolean {
    return this.consentState ? 
      (this.consentState.analytics || this.consentState.sessionRecording || this.consentState.errorTracking) : 
      false;
  }

  hasAnalyticsConsent(): boolean {
    return this.consentState?.analytics || false;
  }

  hasSessionRecordingConsent(): boolean {
    return this.consentState?.sessionRecording || false;
  }

  hasErrorTrackingConsent(): boolean {
    return this.consentState?.errorTracking || false;
  }

  updateConsent(state: Partial<ConsentState>): void {
    this.consentState = {
      ...this.consentState,
      ...state,
      timestamp: new Date()
    } as ConsentState;
    
    this.saveConsent();
  }

  revokeConsent(): void {
    this.consentState = {
      analytics: false,
      sessionRecording: false,
      errorTracking: false,
      timestamp: new Date()
    };
    
    this.saveConsent();
  }

  getConsentState(): ConsentState | null {
    return this.consentState;
  }

  // Clear all stored consent data
  clearConsent(): void {
    this.consentState = null;
    localStorage.removeItem(ConsentManager.CONSENT_KEY);
  }
}