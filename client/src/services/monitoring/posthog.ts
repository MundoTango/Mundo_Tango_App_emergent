/**
 * ESA Life CEO 61x21 - PostHog Integration
 * Product analytics, feature flags, and funnel tracking
 */

import posthog from 'posthog-js';
import { ConsentManager } from './consent';
import { MonitoringConfig, PrivacyConfig, UserTraits, EventProperties, FeatureFlag, FunnelStep } from './types';

export class PostHogService {
  private initialized = false;
  private featureFlags: Map<string, FeatureFlag> = new Map();
  private funnels: Map<string, FunnelStep[]> = new Map();

  constructor(private consentManager: ConsentManager) {
    // Define conversion funnels
    this.setupConversionFunnels();
  }

  async initialize(config: MonitoringConfig): Promise<void> {
    if (this.initialized || !this.consentManager.hasConsent()) {
      return;
    }

    try {
      posthog.init(config.apiKey || '', {
        api_host: config.apiHost || 'https://app.posthog.com',
        // Privacy settings
        mask_all_text: config.privacy?.maskTextContent,
        mask_all_element_attributes: config.privacy?.maskInputContent,
        // Capture settings
        autocapture: true,
        capture_pageview: true,
        capture_pageleave: true,
        cross_subdomain_cookie: true,
        // Session recording (if consent given)
        disable_session_recording: !this.consentManager.hasSessionRecordingConsent(),
        // Performance
        session_recording: {
          maskAllInputs: config.privacy?.maskInputContent ?? true,
          maskTextSelector: config.privacy?.maskTextSelector,
          blockClass: config.privacy?.blockClass || 'ph-no-capture',
        },
        // Feature flags
        bootstrap: {
          featureFlags: this.getBootstrapFeatureFlags()
        },
        // Callbacks
        loaded: (ph) => {
          console.log('[PostHog] Loaded successfully');
          this.loadFeatureFlags();
        }
      });

      // Set up default feature flags
      this.setupFeatureFlags();
      
      // Track initial session
      this.trackEvent('session_start', {
        referrer: document.referrer,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight
      });

      console.log('[PostHog] Initialized successfully');
      this.initialized = true;
    } catch (error) {
      console.error('[PostHog] Initialization failed:', error);
    }
  }

  private setupFeatureFlags(): void {
    // ESA defined feature flags with rollout percentages
    const flags = [
      { name: 'new-onboarding', defaultValue: false, rollout: 0.5 },
      { name: 'ai-enhancement', defaultValue: true, rollout: 1.0 },
      { name: 'live-streaming', defaultValue: false, rollout: 0.25 },
      { name: 'advanced-analytics', defaultValue: false, rollout: 0.1 },
      { name: 'beta-features', defaultValue: false, rollout: 0.05 },
      { name: 'ocean-theme-v2', defaultValue: true, rollout: 1.0 },
      { name: 'lifeceo-agents', defaultValue: true, rollout: 1.0 }
    ];

    flags.forEach(flag => {
      // Simulate rollout (in production, PostHog handles this)
      const isEnabled = Math.random() < flag.rollout;
      this.featureFlags.set(flag.name, {
        name: flag.name,
        variant: isEnabled
      });
    });
  }

  private getBootstrapFeatureFlags(): Record<string, boolean | string> {
    const flags: Record<string, boolean | string> = {};
    this.featureFlags.forEach((flag, name) => {
      flags[name] = flag.variant;
    });
    return flags;
  }

  private loadFeatureFlags(): void {
    if (!posthog.isFeatureEnabled) return;

    // Load actual feature flags from PostHog
    this.featureFlags.forEach((_, name) => {
      const value = posthog.isFeatureEnabled(name);
      if (value !== undefined) {
        this.featureFlags.set(name, {
          name,
          variant: value
        });
      }
    });
  }

  private setupConversionFunnels(): void {
    // Guest to Host conversion funnel
    this.funnels.set('guest_to_host', [
      { name: 'landing_page_view', url: '/' },
      { name: 'registration_started', url: '/register' },
      { name: 'profile_completed', url: '/onboarding' },
      { name: 'host_onboarding_started', url: '/host-onboarding' },
      { name: 'listing_created', properties: { type: 'housing' } },
      { name: 'first_booking_received' }
    ]);

    // User activation funnel
    this.funnels.set('user_activation', [
      { name: 'registration_completed' },
      { name: 'profile_setup' },
      { name: 'first_post_created' },
      { name: 'first_connection_made' },
      { name: 'first_event_attended' }
    ]);

    // Event participation funnel
    this.funnels.set('event_participation', [
      { name: 'events_page_viewed', url: '/events' },
      { name: 'event_details_viewed' },
      { name: 'registration_clicked' },
      { name: 'registration_completed' },
      { name: 'event_attended' }
    ]);

    // AI enhancement adoption funnel
    this.funnels.set('ai_adoption', [
      { name: 'ai_feature_discovered' },
      { name: 'ai_feature_tried' },
      { name: 'ai_feature_used_5_times' },
      { name: 'ai_feature_daily_user' }
    ]);
  }

  identifyUser(userId: string, traits?: UserTraits): void {
    if (!this.initialized) return;

    posthog.identify(userId, {
      email: traits?.email,
      name: traits?.name,
      role: traits?.role,
      plan: traits?.plan,
      created_at: traits?.createdAt,
      ...traits?.customTraits
    });
  }

  trackEvent(eventName: string, properties?: EventProperties): void {
    if (!this.initialized) return;

    // Add context to all events
    const enrichedProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      session_id: posthog.get_session_id(),
      source: 'mundotango_web'
    };

    posthog.capture(eventName, enrichedProperties);

    // Check if event is part of any funnel
    this.checkFunnelProgress(eventName, properties);
  }

  private checkFunnelProgress(eventName: string, properties?: EventProperties): void {
    this.funnels.forEach((steps, funnelName) => {
      const stepIndex = steps.findIndex(step => step.name === eventName);
      
      if (stepIndex !== -1) {
        // Track funnel progress
        posthog.capture('funnel_step_completed', {
          funnel_name: funnelName,
          step_name: eventName,
          step_index: stepIndex,
          total_steps: steps.length,
          completion_percentage: ((stepIndex + 1) / steps.length) * 100,
          ...properties
        });

        // Check if funnel completed
        if (stepIndex === steps.length - 1) {
          posthog.capture('funnel_completed', {
            funnel_name: funnelName,
            total_steps: steps.length
          });
        }
      }
    });
  }

  trackPageView(path: string, properties?: Record<string, any>): void {
    if (!this.initialized) return;

    posthog.capture('$pageview', {
      $current_url: window.location.href,
      $pathname: path,
      $referrer: document.referrer,
      ...properties
    });
  }

  getFeatureFlag(flagName: string): boolean | string | undefined {
    if (!this.initialized) return undefined;

    // First check cached flags
    const cachedFlag = this.featureFlags.get(flagName);
    if (cachedFlag) {
      return cachedFlag.variant;
    }

    // Then check PostHog
    return posthog.isFeatureEnabled(flagName);
  }

  getAllFeatureFlags(): Record<string, boolean | string> {
    if (!this.initialized) return {};

    const flags: Record<string, boolean | string> = {};
    
    // Get all active feature flags
    const activeFlags = posthog.getFeatureFlags();
    if (activeFlags) {
      Object.entries(activeFlags).forEach(([key, value]) => {
        flags[key] = value;
      });
    }

    return flags;
  }

  captureException(error: Error, context?: Record<string, any>): void {
    if (!this.initialized) return;

    posthog.capture('exception', {
      $exception_type: error.name,
      $exception_message: error.message,
      $exception_stack_trace_raw: error.stack,
      ...context
    });
  }

  // Track Life CEO agent interactions
  trackAgentInteraction(agentName: string, action: string, metadata?: Record<string, any>): void {
    this.trackEvent('lifeceo_agent_interaction', {
      agent_name: agentName,
      agent_action: action,
      agent_framework_version: '61x21',
      ...metadata
    });

    // Also track specific agent metrics
    posthog.capture(`agent_${agentName.toLowerCase()}_${action}`, metadata);
  }

  // Track user journey stages
  trackUserJourney(stage: string, properties?: Record<string, any>): void {
    this.trackEvent('user_journey_stage', {
      journey_stage: stage,
      ...properties
    });
  }

  // Cohort analysis
  addUserToCohort(cohortName: string, properties?: Record<string, any>): void {
    if (!this.initialized) return;

    posthog.capture('$set', {
      [`cohort_${cohortName}`]: true,
      [`cohort_${cohortName}_date`]: new Date().toISOString(),
      ...properties
    });
  }

  // A/B testing
  getExperimentVariant(experimentName: string): string | undefined {
    return this.getFeatureFlag(experimentName) as string | undefined;
  }

  trackExperimentExposure(experimentName: string, variant: string): void {
    this.trackEvent('experiment_exposure', {
      experiment_name: experimentName,
      experiment_variant: variant
    });
  }

  reset(): void {
    if (!this.initialized) return;
    posthog.reset();
  }

  optOut(): void {
    if (!this.initialized) return;
    posthog.opt_out_capturing();
  }

  optIn(): void {
    if (!this.initialized) return;
    posthog.opt_in_capturing();
  }

  updatePrivacySettings(settings: PrivacyConfig): void {
    if (!this.initialized) return;

    // Update PostHog configuration
    posthog.set_config({
      mask_all_text: settings.maskTextContent,
      mask_all_element_attributes: settings.maskInputContent,
      session_recording: {
        maskAllInputs: settings.maskInputContent ?? true,
        maskTextSelector: settings.maskTextSelector,
        blockClass: settings.blockClass || 'ph-no-capture',
      }
    });
  }

  // Get analytics insights
  getAnalyticsInsights(): Record<string, any> {
    if (!this.initialized) return {};

    return {
      session_id: posthog.get_session_id(),
      distinct_id: posthog.get_distinct_id(),
      feature_flags: this.getAllFeatureFlags(),
      active_funnels: Array.from(this.funnels.keys())
    };
  }
}