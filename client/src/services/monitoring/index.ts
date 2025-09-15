/**
 * ESA Life CEO 61x21 - Unified Monitoring Service
 * Integrates OpenReplay and PostHog for comprehensive monitoring
 */

import { OpenReplayService } from './openreplay';
import { PostHogService } from './posthog';
import { ConsentManager } from './consent';
import { PrivacyConfig } from './types';

export class MonitoringService {
  private static instance: MonitoringService;
  private openReplay: OpenReplayService;
  private postHog: PostHogService;
  private consentManager: ConsentManager;
  private initialized = false;

  private constructor() {
    this.consentManager = new ConsentManager();
    this.openReplay = new OpenReplayService(this.consentManager);
    this.postHog = new PostHogService(this.consentManager);
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  async initialize(config?: PrivacyConfig): Promise<void> {
    if (this.initialized) {
      console.log('[ESA Monitoring] Already initialized');
      return;
    }

    console.log('[ESA Monitoring] Initializing monitoring services...');

    // Check for user consent
    const hasConsent = await this.consentManager.checkConsent();
    
    if (hasConsent) {
      // Initialize OpenReplay for session recording
      await this.openReplay.initialize({
        projectKey: import.meta.env.VITE_OPENREPLAY_PROJECT_KEY || 'mt-ocean-prod',
        ingestPoint: import.meta.env.VITE_OPENREPLAY_INGEST_POINT || 'https://openreplay.mundotango.life',
        privacy: config
      });

      // Initialize PostHog for analytics
      await this.postHog.initialize({
        apiKey: import.meta.env.VITE_POSTHOG_API_KEY || 'phc_mundotango_prod',
        apiHost: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
        privacy: config
      });
    } else {
      console.log('[ESA Monitoring] User consent not granted, monitoring disabled');
    }

    this.initialized = true;
  }

  // User identification for both services
  identifyUser(userId: string, traits?: Record<string, any>): void {
    if (!this.consentManager.hasConsent()) return;
    
    this.openReplay.identifyUser(userId, traits);
    this.postHog.identifyUser(userId, traits);
  }

  // Track custom events
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (!this.consentManager.hasConsent()) return;
    
    // Send to both services
    this.openReplay.trackEvent(eventName, properties);
    this.postHog.trackEvent(eventName, properties);
  }

  // Track Life CEO agent interactions
  trackAgentInteraction(agentName: string, action: string, metadata?: Record<string, any>): void {
    this.trackEvent('lifeceo_agent_interaction', {
      agent: agentName,
      action,
      ...metadata
    });
  }

  // Track page views
  trackPageView(path: string, properties?: Record<string, any>): void {
    if (!this.consentManager.hasConsent()) return;
    
    this.openReplay.trackPageView(path, properties);
    this.postHog.trackPageView(path, properties);
  }

  // Get feature flag value from PostHog
  getFeatureFlag(flagName: string): boolean | string | undefined {
    return this.postHog.getFeatureFlag(flagName);
  }

  // Session management
  startNewSession(): void {
    this.openReplay.startNewSession();
    this.postHog.reset();
  }

  // Privacy controls
  updatePrivacySettings(settings: PrivacyConfig): void {
    this.openReplay.updatePrivacySettings(settings);
    this.postHog.updatePrivacySettings(settings);
  }

  // Consent management
  async requestConsent(): Promise<boolean> {
    return this.consentManager.requestConsent();
  }

  revokeConsent(): void {
    this.consentManager.revokeConsent();
    this.openReplay.stop();
    this.postHog.optOut();
  }

  // Error tracking
  captureException(error: Error, context?: Record<string, any>): void {
    if (!this.consentManager.hasConsent()) return;
    
    this.openReplay.captureException(error, context);
    this.postHog.captureException(error, context);
  }
}

export const monitoring = MonitoringService.getInstance();

// Export types
export * from './types';
export { OpenReplayService } from './openreplay';
export { PostHogService } from './posthog';
export { ConsentManager } from './consent';