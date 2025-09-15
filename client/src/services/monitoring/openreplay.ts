/**
 * ESA Life CEO 61x21 - OpenReplay Integration
 * Session recording and user behavior tracking
 */

import { ConsentManager } from './consent';
import { MonitoringConfig, PrivacyConfig, UserTraits, EventProperties, RageClickEvent } from './types';

declare global {
  interface Window {
    OpenReplay: any;
  }
}

export class OpenReplayService {
  private tracker: any;
  private initialized = false;
  private rageClickThreshold = 3;
  private rageClickWindow = 750; // ms
  private clickHistory: Array<{ timestamp: number; target: Element }> = [];

  constructor(private consentManager: ConsentManager) {}

  async initialize(config: MonitoringConfig): Promise<void> {
    if (this.initialized || !this.consentManager.hasConsent()) {
      return;
    }

    try {
      // Load OpenReplay script dynamically
      await this.loadOpenReplayScript();
      
      const OpenReplay = window.OpenReplay;
      if (!OpenReplay) {
        console.error('[OpenReplay] Failed to load OpenReplay library');
        return;
      }

      // Configure privacy settings
      const privacyConfig = this.buildPrivacyConfig(config.privacy);
      
      // Initialize tracker
      this.tracker = new OpenReplay({
        projectKey: config.projectKey,
        ingestPoint: config.ingestPoint,
        ...privacyConfig,
        // Network and console capture
        network: {
          capturePayload: config.privacy?.captureNetwork ?? true,
          sanitizer: (data: any) => this.sanitizeNetworkData(data)
        },
        console: config.privacy?.captureConsole ?? true,
        // Performance monitoring
        __DISABLE_SECURE_MODE: false
      });

      // Start tracking
      this.tracker.start();
      
      // Set up rage click detection
      this.setupRageClickDetection();
      
      // Set up error tracking
      this.setupErrorTracking();
      
      // Track initial page view
      this.trackPageView(window.location.pathname);
      
      console.log('[OpenReplay] Initialized successfully');
      this.initialized = true;
    } catch (error) {
      console.error('[OpenReplay] Initialization failed:', error);
    }
  }

  private async loadOpenReplayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.OpenReplay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.openreplay.com/latest/openreplay.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load OpenReplay script'));
      document.head.appendChild(script);
    });
  }

  private buildPrivacyConfig(privacy?: PrivacyConfig): any {
    return {
      obscureTextEmails: privacy?.maskEmails ?? true,
      obscureTextNumbers: privacy?.maskPhoneNumbers ?? true,
      obscureInputEmails: privacy?.maskEmails ?? true,
      obscureInputDates: false,
      defaultInputMode: privacy?.maskInputContent ? 1 : 0,
      // CSS classes for privacy
      blockClass: privacy?.blockClass || 'or-block',
      ignoreClass: privacy?.ignoreClass || 'or-ignore',
      maskTextClass: privacy?.maskTextClass || 'or-mask',
      maskTextSelector: privacy?.maskTextSelector || '.sensitive-data',
      blockSelector: privacy?.blockSelector || '.no-record',
      ignoreSelector: privacy?.ignoreSelector || ''
    };
  }

  private sanitizeNetworkData(data: any): any {
    // Remove sensitive headers
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
    
    if (data.request?.headers) {
      sensitiveHeaders.forEach(header => {
        if (data.request.headers[header]) {
          data.request.headers[header] = '[REDACTED]';
        }
      });
    }

    if (data.response?.headers) {
      sensitiveHeaders.forEach(header => {
        if (data.response.headers[header]) {
          data.response.headers[header] = '[REDACTED]';
        }
      });
    }

    // Sanitize request/response bodies with sensitive data
    if (data.request?.body) {
      data.request.body = this.sanitizeBody(data.request.body);
    }

    if (data.response?.body) {
      data.response.body = this.sanitizeBody(data.response.body);
    }

    return data;
  }

  private sanitizeBody(body: any): any {
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return body;
      }
    }

    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'ssn'];
    
    const sanitize = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;
      
      const result = Array.isArray(obj) ? [...obj] : { ...obj };
      
      for (const key in result) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          result[key] = '[REDACTED]';
        } else if (typeof result[key] === 'object') {
          result[key] = sanitize(result[key]);
        }
      }
      
      return result;
    };

    return sanitize(body);
  }

  private setupRageClickDetection(): void {
    document.addEventListener('click', (event) => {
      const now = Date.now();
      const target = event.target as Element;
      
      // Clean old clicks
      this.clickHistory = this.clickHistory.filter(
        click => now - click.timestamp < this.rageClickWindow
      );
      
      // Check for rage clicks on same element
      const sameElementClicks = this.clickHistory.filter(
        click => click.target === target
      );
      
      if (sameElementClicks.length >= this.rageClickThreshold - 1) {
        this.handleRageClick({
          selector: this.getElementSelector(target),
          count: sameElementClicks.length + 1,
          timestamp: new Date(),
          position: { x: event.clientX, y: event.clientY }
        });
      }
      
      // Add current click
      this.clickHistory.push({ timestamp: now, target });
    });
  }

  private getElementSelector(element: Element): string {
    const path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let selector = element.nodeName.toLowerCase();
      
      if (element.id) {
        selector += '#' + element.id;
        path.unshift(selector);
        break;
      } else if (element.className && typeof element.className === 'string') {
        selector += '.' + element.className.split(' ').filter(c => c).join('.');
      }
      
      path.unshift(selector);
      element = element.parentNode as Element;
    }
    
    return path.join(' > ');
  }

  private handleRageClick(event: RageClickEvent): void {
    console.warn('[OpenReplay] Rage click detected:', event);
    
    if (this.tracker) {
      this.tracker.event('rage_click', {
        selector: event.selector,
        count: event.count,
        x: event.position.x,
        y: event.position.y
      });
    }
  }

  private setupErrorTracking(): void {
    // Track unhandled errors
    window.addEventListener('error', (event) => {
      this.captureException(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureException(new Error(event.reason), {
        type: 'unhandledrejection'
      });
    });
  }

  identifyUser(userId: string, traits?: UserTraits): void {
    if (!this.tracker || !this.initialized) return;
    
    this.tracker.setUserID(userId);
    
    if (traits) {
      this.tracker.setMetadata('email', traits.email);
      this.tracker.setMetadata('name', traits.name);
      this.tracker.setMetadata('role', traits.role);
      this.tracker.setMetadata('plan', traits.plan);
      
      if (traits.customTraits) {
        Object.entries(traits.customTraits).forEach(([key, value]) => {
          this.tracker.setMetadata(key, value);
        });
      }
    }
  }

  trackEvent(eventName: string, properties?: EventProperties): void {
    if (!this.tracker || !this.initialized) return;
    
    this.tracker.event(eventName, properties);
  }

  trackPageView(path: string, properties?: Record<string, any>): void {
    if (!this.tracker || !this.initialized) return;
    
    this.tracker.event('page_view', {
      path,
      url: window.location.href,
      referrer: document.referrer,
      ...properties
    });
  }

  captureException(error: Error, context?: Record<string, any>): void {
    if (!this.tracker || !this.initialized) return;
    
    this.tracker.event('error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context
    });
  }

  startNewSession(): void {
    if (!this.tracker || !this.initialized) return;
    
    this.tracker.stop();
    this.tracker.start();
  }

  stop(): void {
    if (!this.tracker || !this.initialized) return;
    
    this.tracker.stop();
    this.initialized = false;
  }

  updatePrivacySettings(settings: PrivacyConfig): void {
    // OpenReplay requires re-initialization for privacy changes
    if (this.tracker && this.initialized) {
      console.log('[OpenReplay] Privacy settings updated, reinitializing...');
      this.stop();
      // Re-initialization would happen on next tracking call
    }
  }
}