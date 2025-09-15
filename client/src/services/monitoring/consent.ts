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
    // If we already have consent, return it
    if (this.consentState) {
      return this.consentState.analytics || this.consentState.sessionRecording;
    }

    // Check if user is in EU (GDPR compliance)
    const isEU = await this.checkIfEU();
    
    // For non-EU users, we can use legitimate interest
    // For EU users, we need explicit consent
    if (!isEU) {
      // Auto-grant consent for non-EU users with opt-out option
      this.consentState = {
        analytics: true,
        sessionRecording: true,
        errorTracking: true,
        timestamp: new Date()
      };
      this.saveConsent();
      return true;
    }

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

  async requestConsent(): Promise<boolean> {
    return new Promise((resolve) => {
      // Create consent modal
      const modal = this.createConsentModal((granted) => {
        if (granted) {
          this.consentState = {
            analytics: true,
            sessionRecording: true,
            errorTracking: true,
            timestamp: new Date()
          };
        } else {
          this.consentState = {
            analytics: false,
            sessionRecording: false,
            errorTracking: false,
            timestamp: new Date()
          };
        }
        
        this.saveConsent();
        document.body.removeChild(modal);
        resolve(granted);
      });

      document.body.appendChild(modal);
    });
  }

  private createConsentModal(callback: (granted: boolean) => void): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4';
    modal.setAttribute('data-testid', 'consent-modal');
    
    modal.innerHTML = `
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" data-testid="modal-backdrop"></div>
      <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 transform transition-all">
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Privacy & Analytics</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Help us improve your experience</p>
          </div>
        </div>
        
        <div class="space-y-3">
          <div class="flex items-start space-x-3">
            <input type="checkbox" id="analytics-consent" checked class="mt-1 rounded border-gray-300 text-teal-500 focus:ring-teal-500" data-testid="checkbox-analytics">
            <label for="analytics-consent" class="text-sm text-gray-700 dark:text-gray-300">
              <span class="font-medium">Product Analytics</span>
              <p class="text-gray-500 dark:text-gray-400 mt-1">Understand how you use our features to improve the platform</p>
            </label>
          </div>
          
          <div class="flex items-start space-x-3">
            <input type="checkbox" id="session-consent" checked class="mt-1 rounded border-gray-300 text-teal-500 focus:ring-teal-500" data-testid="checkbox-session">
            <label for="session-consent" class="text-sm text-gray-700 dark:text-gray-300">
              <span class="font-medium">Session Recording</span>
              <p class="text-gray-500 dark:text-gray-400 mt-1">Help us identify and fix user experience issues</p>
            </label>
          </div>
          
          <div class="flex items-start space-x-3">
            <input type="checkbox" id="error-consent" checked class="mt-1 rounded border-gray-300 text-teal-500 focus:ring-teal-500" data-testid="checkbox-errors">
            <label for="error-consent" class="text-sm text-gray-700 dark:text-gray-300">
              <span class="font-medium">Error Tracking</span>
              <p class="text-gray-500 dark:text-gray-400 mt-1">Automatically report technical issues for faster resolution</p>
            </label>
          </div>
        </div>
        
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <p class="text-xs text-blue-800 dark:text-blue-200">
            🔒 Your data is encrypted and never sold. You can change these settings anytime in your privacy preferences.
          </p>
        </div>
        
        <div class="flex space-x-3 pt-2">
          <button 
            onclick="this.dispatchEvent(new CustomEvent('consent-reject', { bubbles: true }))"
            class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            data-testid="button-reject">
            Reject All
          </button>
          <button 
            onclick="this.dispatchEvent(new CustomEvent('consent-accept', { bubbles: true }))"
            class="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-colors shadow-lg shadow-teal-500/25"
            data-testid="button-accept">
            Accept Selected
          </button>
        </div>
      </div>
    `;

    // Add event listeners
    modal.addEventListener('consent-accept', () => {
      const analytics = (modal.querySelector('#analytics-consent') as HTMLInputElement)?.checked || false;
      const session = (modal.querySelector('#session-consent') as HTMLInputElement)?.checked || false;
      const errors = (modal.querySelector('#error-consent') as HTMLInputElement)?.checked || false;
      
      this.consentState = {
        analytics,
        sessionRecording: session,
        errorTracking: errors,
        timestamp: new Date()
      };
      
      callback(analytics || session || errors);
    });

    modal.addEventListener('consent-reject', () => {
      callback(false);
    });

    return modal;
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