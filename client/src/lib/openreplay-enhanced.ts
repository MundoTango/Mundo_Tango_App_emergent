interface OpenReplayConfig {
  projectKey?: string;
  ingestPoint?: string;
  privacyMode: 'strict' | 'moderate' | 'minimal';
  esaLayerTracking: boolean;
}

class OpenReplayEnhanced {
  private initialized = false;
  private tracker: any = null;
  private sessionMetadata: Record<string, any> = {};
  
  async init(config: OpenReplayConfig) {
    if (this.initialized) return;
    
    // Only load in production or if explicitly enabled
    if (process.env.NODE_ENV === 'development' && !import.meta.env.VITE_ENABLE_OPENREPLAY) {
      console.log('🎥 OpenReplay disabled in development');
      return;
    }
    
    const projectKey = config.projectKey || import.meta.env.VITE_OPENREPLAY_PROJECT_KEY;
    const ingestPoint = config.ingestPoint || import.meta.env.VITE_OPENREPLAY_INGEST_POINT;
    
    if (!projectKey) {
      console.log('🎥 OpenReplay: Missing project key');
      return;
    }
    
    try {
      // Dynamically import OpenReplay to reduce initial bundle size
      const { default: OpenReplay } = await import('@openreplay/tracker').catch(() => {
        console.log('🎥 OpenReplay: Package not installed, session recording disabled');
        return { default: null };
      });
      
      if (!OpenReplay) return;
      
      this.tracker = new OpenReplay({
        projectKey,
        ingestPoint,
        
        // Privacy settings based on ESA compliance requirements
        __DISABLE_SECURE_MODE: false,
        respectDoNotTrack: true,
        
        // Network configuration
        network: {
          failuresOnly: false,
          sessionSampleRate: config.privacyMode === 'strict' ? 10 : 100,
          captureHeaders: config.privacyMode !== 'strict',
          captureBody: config.privacyMode === 'minimal',
          sanitizer: this.sanitizeNetworkData.bind(this)
        },
        
        // Console configuration
        console: {
          isEnabled: true,
          levels: ['error', 'warn', 'log'],
          stringifyOptions: {
            maxDepth: 3,
            maxLength: 1000
          }
        },
        
        // Performance tracking
        profiler: {
          enabled: true,
          longTasks: true,
          longtaskThreshold: 50
        },
        
        // Custom events for ESA framework
        events: config.esaLayerTracking ? this.getESAEvents() : undefined
      });
      
      // Add plugins based on configuration
      await this.setupPlugins(config);
      
      // Start tracking
      this.tracker.start();
      
      // Set up MT Ocean theme tracking
      this.setupThemeTracking();
      
      // Set up error boundary integration
      this.setupErrorBoundary();
      
      // Track ESA layer interactions
      if (config.esaLayerTracking) {
        this.trackESALayers();
      }
      
      this.initialized = true;
      console.log('🎥 OpenReplay session recording started');
    } catch (error) {
      console.log('🎥 OpenReplay: Failed to initialize', error);
    }
  }
  
  private async setupPlugins(config: OpenReplayConfig) {
    try {
      // Note: OpenReplay plugins are not available at this time
      // This functionality is disabled until the packages are available
      console.log('🎥 OpenReplay: Plugins currently disabled');
      
      // Conditionally load plugins based on privacy mode
      // if (config.privacyMode !== 'strict') {
      //   const { default: trackerAssist } = await import('@openreplay/tracker-assist').catch(() => ({ default: null }));
      //   if (trackerAssist && this.tracker) {
      //     this.tracker.use(trackerAssist());
      //   }
      // }
      
      // Always load performance plugin for ESA Layer 48
      // const { default: trackerPerformance } = await import('@openreplay/tracker-performance').catch(() => ({ default: null }));
      // if (trackerPerformance && this.tracker) {
      //   this.tracker.use(trackerPerformance());
      // }
      
      // Load fetch plugin for network tracking
      // const { default: trackerFetch } = await import('@openreplay/tracker-fetch').catch(() => ({ default: null }));
      // if (trackerFetch && this.tracker) {
      //   this.tracker.use(trackerFetch({
      //     sanitiser: this.sanitizeNetworkData.bind(this)
      //   }));
      // }
    } catch (error) {
      console.log('🎥 OpenReplay: Plugin setup failed', error);
    }
  }
  
  private sanitizeNetworkData(data: any): any {
    // Remove sensitive data from network requests
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    
    const sanitized = { ...data };
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
      
      // Check nested objects
      Object.keys(sanitized).forEach(key => {
        if (typeof sanitized[key] === 'object' && sanitized[key] && sanitized[key][field]) {
          sanitized[key][field] = '[REDACTED]';
        }
      });
    });
    
    return sanitized;
  }
  
  private setupThemeTracking() {
    // Track MT Ocean theme interactions
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      if (target.closest('.glassmorphic-card')) {
        this.event('mt_ocean_interaction', {
          element: 'glassmorphic_card',
          action: 'click'
        });
      }
      
      if (target.closest('.gradient-turquoise')) {
        this.event('mt_ocean_interaction', {
          element: 'gradient_element',
          action: 'click'
        });
      }
    });
  }
  
  private setupErrorBoundary() {
    // Global error handler integration
    window.addEventListener('error', (event) => {
      this.handleError(event.error, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new Error(event.reason), {
        type: 'unhandledRejection',
        promise: event.promise
      });
    });
  }
  
  private trackESALayers() {
    // Track active ESA layers based on page context
    const path = window.location.pathname;
    const activeLayer = this.getActiveESALayer(path);
    
    this.setMetadata('esa_layer', activeLayer);
    this.setMetadata('esa_framework', '61x21');
    
    // Track layer transitions
    let lastLayer = activeLayer;
    setInterval(() => {
      const currentLayer = this.getActiveESALayer(window.location.pathname);
      if (currentLayer !== lastLayer) {
        this.event('esa_layer_transition', {
          from: lastLayer,
          to: currentLayer
        });
        lastLayer = currentLayer;
      }
    }, 1000);
  }
  
  private getActiveESALayer(path: string): number {
    // Map paths to ESA layers
    if (path.includes('/admin')) return 56; // Compliance Framework
    if (path.includes('/life-ceo')) return 35; // AI Agent Management
    if (path.includes('/events')) return 24; // Events System
    if (path.includes('/messages')) return 11; // Real-time Features
    if (path.includes('/profile')) return 21; // User Management
    if (path.includes('/analytics')) return 48; // Performance Monitoring
    
    return 1; // Architecture Foundation
  }
  
  private getESAEvents() {
    // Custom events for ESA framework tracking
    return [
      'agent_interaction',
      'layer_activation',
      'mt_ocean_theme_change',
      'performance_anomaly',
      'user_journey_stage',
      'feature_flag_toggle',
      'ai_response_generated',
      'realtime_connection_established'
    ];
  }
  
  // Public API methods
  identify(userId: string, userInfo?: any) {
    if (!this.tracker) return;
    
    this.tracker.setUserID(userId);
    
    if (userInfo) {
      this.tracker.setMetadata('user_info', JSON.stringify(userInfo));
    }
  }
  
  setMetadata(key: string, value: any) {
    if (!this.tracker) return;
    
    this.sessionMetadata[key] = value;
    this.tracker.setMetadata(key, String(value));
  }
  
  event(name: string, props?: any) {
    if (!this.tracker) return;
    
    this.tracker.event(name, props);
  }
  
  handleError(error: Error | null, context?: any) {
    if (!this.tracker || !error) return;
    
    console.error('OpenReplay captured error:', error);
    
    this.tracker.handleError(error, {
      ...context,
      esa_layer: this.getActiveESALayer(window.location.pathname),
      mt_theme: 'ocean',
      timestamp: new Date().toISOString()
    });
  }
  
  startTransaction(name: string) {
    if (!this.tracker) return null;
    
    const startTime = performance.now();
    
    return {
      end: () => {
        const duration = performance.now() - startTime;
        this.event('transaction_completed', {
          name,
          duration,
          esa_layer: this.getActiveESALayer(window.location.pathname)
        });
      }
    };
  }
  
  isActive(): boolean {
    return this.initialized && this.tracker !== null;
  }
  
  getSessionURL(): string | null {
    if (!this.tracker) return null;
    
    return this.tracker.getSessionURL();
  }
  
  stop() {
    if (!this.tracker) return;
    
    this.tracker.stop();
    this.initialized = false;
    this.tracker = null;
  }
}

export const openReplayEnhanced = new OpenReplayEnhanced();

// Export convenience methods
export const trackSessionEvent = (name: string, props?: any) =>
  openReplayEnhanced.event(name, props);

export const identifyUser = (userId: string, userInfo?: any) =>
  openReplayEnhanced.identify(userId, userInfo);

export const handleSessionError = (error: Error, context?: any) =>
  openReplayEnhanced.handleError(error, context);