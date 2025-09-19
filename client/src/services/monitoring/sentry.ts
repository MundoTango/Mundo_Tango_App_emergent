/**
 * ESA Life CEO 61x21 - Sentry Integration
 * Error tracking, performance monitoring, and replay sessions
 */

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { ConsentManager } from './consent';
import { MonitoringConfig, PrivacyConfig, UserTraits } from './types';

export class SentryService {
  private initialized = false;
  private consentManager: ConsentManager;

  constructor(consentManager: ConsentManager) {
    this.consentManager = consentManager;
  }

  async initialize(config?: MonitoringConfig): Promise<void> {
    if (this.initialized) {
      console.log('[Sentry] Already initialized');
      return;
    }

    // Check for consent first
    if (!this.consentManager.hasErrorTrackingConsent()) {
      console.log('[Sentry] Error tracking consent not granted');
      return;
    }

    const dsn = import.meta.env.VITE_SENTRY_DSN;
    
    // Don't initialize without DSN
    if (!dsn) {
      console.log('[Sentry] No DSN provided, skipping initialization');
      return;
    }

    try {
      Sentry.init({
        dsn,
        
        // Environment configuration
        environment: import.meta.env.VITE_ENV || 'development',
        
        // Performance monitoring
        integrations: [
          new BrowserTracing({
            // Set sampling rate for performance monitoring
            tracingOrigins: ['localhost', /^\//],
            // Track interactions
            routingInstrumentation: Sentry.reactRouterV6Instrumentation(
              window.history
            ),
          }),
          new Sentry.Replay({
            // Only capture replays when errors occur
            maskAllText: config?.privacy?.maskTextContent ?? true,
            maskAllInputs: config?.privacy?.maskInputContent ?? true,
            blockAllMedia: false,
            // Sampling rates
            sessionSampleRate: 0.1, // 10% of sessions
            errorSampleRate: 1.0, // 100% of sessions with errors
          }),
        ],
        
        // Performance sampling
        tracesSampleRate: import.meta.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        
        // Release tracking
        release: import.meta.env.VITE_APP_VERSION || 'unknown',
        
        // User privacy
        beforeSend(event, hint) {
          // Remove sensitive data
          if (event.request) {
            // Remove auth headers
            if (event.request.headers) {
              delete event.request.headers['Authorization'];
              delete event.request.headers['Cookie'];
            }
            
            // Remove sensitive query params
            if (event.request.query_string) {
              event.request.query_string = event.request.query_string
                .replace(/token=[^&]+/g, 'token=[REDACTED]')
                .replace(/key=[^&]+/g, 'key=[REDACTED]')
                .replace(/password=[^&]+/g, 'password=[REDACTED]');
            }
          }
          
          // Remove PII from error messages
          if (event.exception?.values) {
            event.exception.values.forEach((exception) => {
              if (exception.value) {
                // Redact email addresses
                exception.value = exception.value.replace(
                  /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
                  '[email]'
                );
                // Redact phone numbers
                exception.value = exception.value.replace(
                  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
                  '[phone]'
                );
              }
            });
          }
          
          return event;
        },
        
        // Ignore certain errors
        ignoreErrors: [
          // Browser extensions
          'top.GLOBALS',
          'ResizeObserver loop limit exceeded',
          'ResizeObserver loop completed with undelivered notifications',
          // Network errors
          'Network request failed',
          'NetworkError',
          'Failed to fetch',
          // Common non-errors
          'Non-Error promise rejection captured',
          // Safari specific
          'Non-Error exception captured',
        ],
        
        // Allow URLs
        allowUrls: [
          /https?:\/\/(.*)\.mundotango\.life/,
          /https?:\/\/localhost/,
        ],
      });

      // Set initial user context
      this.setInitialContext();
      
      console.log('[Sentry] Initialized successfully');
      this.initialized = true;
    } catch (error) {
      console.error('[Sentry] Initialization failed:', error);
    }
  }

  private setInitialContext(): void {
    // Set app context
    Sentry.setContext('app', {
      name: 'Mundo Tango',
      version: import.meta.env.VITE_APP_VERSION || 'unknown',
      framework: 'ESA Life CEO 61x21',
      layer: 48, // Performance Monitoring Layer
    });

    // Set device context
    Sentry.setContext('device', {
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      pixel_ratio: window.devicePixelRatio,
      online: navigator.onLine,
      language: navigator.language,
    });

    // Set browser context
    const userAgent = navigator.userAgent;
    const browser = this.getBrowserInfo(userAgent);
    Sentry.setContext('browser', browser);
  }

  private getBrowserInfo(userAgent: string): Record<string, any> {
    const browser: Record<string, any> = {
      user_agent: userAgent,
    };

    // Detect browser type
    if (userAgent.includes('Chrome')) {
      browser.name = 'Chrome';
      browser.version = userAgent.match(/Chrome\/(\d+)/)?.[1];
    } else if (userAgent.includes('Firefox')) {
      browser.name = 'Firefox';
      browser.version = userAgent.match(/Firefox\/(\d+)/)?.[1];
    } else if (userAgent.includes('Safari')) {
      browser.name = 'Safari';
      browser.version = userAgent.match(/Version\/(\d+)/)?.[1];
    } else if (userAgent.includes('Edge')) {
      browser.name = 'Edge';
      browser.version = userAgent.match(/Edge\/(\d+)/)?.[1];
    }

    return browser;
  }

  identifyUser(userId: string, traits?: UserTraits): void {
    if (!this.initialized) return;

    Sentry.setUser({
      id: userId,
      email: traits?.email,
      username: traits?.name,
      // Custom attributes
      role: traits?.role,
      plan: traits?.plan,
    });

    // Set additional user context
    if (traits?.customTraits) {
      Sentry.setContext('user_metadata', traits.customTraits);
    }
  }

  captureException(error: Error, context?: Record<string, any>): void {
    if (!this.initialized || !this.consentManager.hasErrorTrackingConsent()) {
      console.error('[Sentry] Error captured but not sent (no consent):', error);
      return;
    }

    // Add context to the error
    if (context) {
      Sentry.withScope((scope) => {
        scope.setContext('error_context', context);
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>): void {
    if (!this.initialized || !this.consentManager.hasErrorTrackingConsent()) return;

    if (context) {
      Sentry.withScope((scope) => {
        scope.setContext('message_context', context);
        Sentry.captureMessage(message, level);
      });
    } else {
      Sentry.captureMessage(message, level);
    }
  }

  // Performance monitoring
  startTransaction(name: string, op: string): any {
    if (!this.initialized) return null;

    return Sentry.startTransaction({
      name,
      op,
    });
  }

  // Track breadcrumbs
  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: Sentry.SeverityLevel;
    data?: Record<string, any>;
  }): void {
    if (!this.initialized) return;

    Sentry.addBreadcrumb({
      message: breadcrumb.message,
      category: breadcrumb.category || 'custom',
      level: breadcrumb.level || 'info',
      data: breadcrumb.data,
      timestamp: Date.now() / 1000,
    });
  }

  // Track Life CEO specific events
  trackLifeCEOEvent(layer: number, event: string, data?: Record<string, any>): void {
    if (!this.initialized) return;

    this.addBreadcrumb({
      message: `Layer ${layer}: ${event}`,
      category: 'lifeceo',
      data: {
        layer,
        event,
        ...data,
      },
    });

    // Also send as a transaction for performance tracking
    const transaction = this.startTransaction(`lifeceo.layer${layer}`, event);
    if (transaction) {
      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          transaction.setData(key, value);
        });
      }
      transaction.finish();
    }
  }

  // Session replay controls
  startReplay(): void {
    if (!this.initialized) return;
    const replay = Sentry.getCurrentHub().getIntegration(Sentry.Replay);
    if (replay) {
      replay.start();
    }
  }

  stopReplay(): void {
    if (!this.initialized) return;
    const replay = Sentry.getCurrentHub().getIntegration(Sentry.Replay);
    if (replay) {
      replay.stop();
    }
  }

  // Update privacy settings
  updatePrivacySettings(settings: PrivacyConfig): void {
    if (!this.initialized) return;

    // Update replay masking settings
    const replay = Sentry.getCurrentHub().getIntegration(Sentry.Replay);
    if (replay) {
      // Note: Sentry doesn't support dynamic privacy updates after init
      // This would require reinitializing Sentry
      console.warn('[Sentry] Privacy settings update requires reinitialization');
    }
  }

  // Clear user data
  clearUser(): void {
    if (!this.initialized) return;
    Sentry.configureScope((scope) => scope.clear());
  }

  // Profiling
  profileComponent(componentName: string): () => void {
    if (!this.initialized) return () => {};

    const transaction = this.startTransaction(`component.${componentName}`, 'ui.react.render');
    
    return () => {
      if (transaction) {
        transaction.finish();
      }
    };
  }

  // Custom tags
  setTag(key: string, value: string | number | boolean): void {
    if (!this.initialized) return;
    Sentry.setTag(key, value);
  }

  setTags(tags: Record<string, string | number | boolean>): void {
    if (!this.initialized) return;
    Sentry.setTags(tags);
  }

  // Scope management
  withScope(callback: (scope: any) => void): void {
    if (!this.initialized) return;
    Sentry.withScope(callback);
  }

  // Check if Sentry is initialized
  isInitialized(): boolean {
    return this.initialized;
  }
}