/**
 * Lighthouse CI Configuration for Mundo Tango
 * ESA-48 Performance Monitoring Agent Specifications
 * ===================================================
 * Core Web Vitals targets:
 * - LCP < 2500ms
 * - FID < 100ms  
 * - CLS < 0.1
 * Performance scores: >90
 * Accessibility: 100
 * SEO: >95
 * PWA: >80
 */

module.exports = {
  ci: {
    collect: {
      // Test all critical pages including multi-step forms
      url: [
        // Homepage
        'http://localhost:5000/',
        
        // Authentication & Registration (5 steps)
        'http://localhost:5000/auth/login',
        'http://localhost:5000/auth/register',
        'http://localhost:5000/auth/register/step-2',
        'http://localhost:5000/auth/register/step-3',
        'http://localhost:5000/auth/register/step-4',
        'http://localhost:5000/auth/register/step-5',
        
        // Guest Onboarding (6 steps)
        'http://localhost:5000/guest-onboarding',
        'http://localhost:5000/guest-onboarding/step-2',
        'http://localhost:5000/guest-onboarding/step-3',
        'http://localhost:5000/guest-onboarding/step-4',
        'http://localhost:5000/guest-onboarding/step-5',
        'http://localhost:5000/guest-onboarding/step-6',
        
        // Core Application Pages
        'http://localhost:5000/events',
        'http://localhost:5000/profile',
        'http://localhost:5000/community',
        'http://localhost:5000/timeline',
        'http://localhost:5000/messages',
        'http://localhost:5000/search',
        'http://localhost:5000/groups',
        'http://localhost:5000/memories',
        'http://localhost:5000/housing',
        'http://localhost:5000/recommendations',
        
        // Admin & Settings
        'http://localhost:5000/admin',
        'http://localhost:5000/settings',
        'http://localhost:5000/privacy',
      ],
      
      // Number of test runs for each URL
      numberOfRuns: 3,
      
      // Test both mobile and desktop viewports
      settings: {
        // Desktop configuration
        desktop: {
          preset: 'desktop',
          throttling: {
            rttMs: 40,
            throughputKbps: 10240,
            cpuSlowdownMultiplier: 1
          },
          screenEmulation: {
            mobile: false,
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
            disabled: false
          },
          emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        
        // Mobile configuration
        mobile: {
          preset: 'mobile',
          throttling: {
            rttMs: 150,
            throughputKbps: 1638.4,
            cpuSlowdownMultiplier: 4
          },
          screenEmulation: {
            mobile: true,
            width: 375,
            height: 812,
            deviceScaleFactor: 3,
            disabled: false
          },
          emulatedUserAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        }
      },
      
      // Chrome flags for accurate testing
      chromeFlags: [
        '--disable-gpu',
        '--no-sandbox',
        '--no-zygote',
        '--disable-dev-shm-usage',
        '--headless'
      ],
      
      // Puppeteer launch options
      puppeteerLaunchOptions: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
      },
      
      // Wait for network idle before testing
      waitForLoad: true,
      disableStorageReset: false
    },
    
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Core Web Vitals (ESA-48 Targets)
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-input-delay': ['error', { maxNumericValue: 100 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // Performance Metrics
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'speed-index': ['warn', { maxNumericValue: 3400 }],
        'interactive': ['error', { maxNumericValue: 3800 }],
        'max-potential-fid': ['warn', { maxNumericValue: 130 }],
        
        // Lighthouse Scores (ESA-48 Requirements)
        'categories:performance': ['error', { minScore: 0.90 }],
        'categories:accessibility': ['error', { minScore: 1.0 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'categories:pwa': ['warn', { minScore: 0.80 }],
        
        // Resource Budgets
        'resource-summary:script:size': ['error', { maxNumericValue: 204800 }], // 200KB JS
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 51200 }], // 50KB CSS
        'resource-summary:image:size': ['warn', { maxNumericValue: 512000 }], // 500KB images
        'resource-summary:font:size': ['warn', { maxNumericValue: 102400 }], // 100KB fonts
        'resource-summary:third-party:size': ['warn', { maxNumericValue: 153600 }], // 150KB third-party
        'resource-summary:total:size': ['error', { maxNumericValue: 1048576 }], // 1MB total
        
        // Network Metrics
        'network-requests': ['warn', { maxNumericValue: 50 }],
        'network-rtt': ['warn', { maxNumericValue: 150 }],
        'network-server-latency': ['warn', { maxNumericValue: 200 }],
        
        // Accessibility Checks
        'color-contrast': 'error',
        'tap-targets': 'error',
        'button-name': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'meta-viewport': 'error',
        
        // Best Practices
        'errors-in-console': 'warn',
        'no-document-write': 'error',
        'geolocation-on-start': 'error',
        'notification-on-start': 'error',
        'no-vulnerable-libraries': 'error',
        
        // SEO Checks
        'meta-description': 'error',
        'document-title': 'error',
        'hreflang': 'warn',
        'canonical': 'warn',
        'robots-txt': 'warn',
        
        // PWA Checks
        'service-worker': 'warn',
        'offline-start-url': 'warn',
        'maskable-icon': 'warn',
        'themed-omnibox': 'warn',
        
        // MT Ocean Theme Performance (Glassmorphic effects)
        'uses-passive-event-listeners': 'error',
        'uses-optimized-images': 'error',
        'uses-webp-images': 'warn',
        'uses-responsive-images': 'error',
        'efficient-animated-content': 'warn',
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn',
        'modern-image-formats': 'warn',
        'uses-rel-preconnect': 'warn',
        'uses-rel-preload': 'warn',
        'font-display': 'warn',
        
        // Critical Rendering Path
        'critical-request-chains': 'warn',
        'redirects': 'warn',
        'mainthread-work-breakdown': 'warn',
        'bootup-time': 'warn',
        'uses-long-cache-ttl': 'warn',
        'total-byte-weight': ['error', { maxNumericValue: 1572864 }], // 1.5MB warning
        
        // JavaScript Execution
        'no-unload-listeners': 'error',
        'duplicated-javascript': 'warn',
        'legacy-javascript': 'warn'
      }
    },
    
    upload: {
      target: 'temporary-public-storage',
      reportFilenamePattern: 'mundo-tango-%%PATHNAME%%-%%DATETIME%%-report.%%EXTENSION%%',
      outputDir: './lighthouse-results',
      
      // GitHub Action output
      githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
      githubStatusContextSuffix: '/lighthouse-ci',
      
      // Performance tracking over time
      serverBaseUrl: process.env.LHCI_SERVER_URL || 'http://localhost:9001',
      token: process.env.LHCI_TOKEN,
      ignoreDuplicateBuildFailure: true
    },
    
    server: {
      port: process.env.LHCI_SERVER_PORT || 9001,
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'postgres',
        sqlConnectionUrl: process.env.DATABASE_URL
      }
    },
    
    // Custom audit configuration for MT Ocean theme
    plugins: [
      {
        name: 'mt-ocean-theme-audits',
        audits: [
          {
            path: './lighthouse/audits/glassmorphism-performance.js'
          },
          {
            path: './lighthouse/audits/gradient-performance.js'
          },
          {
            path: './lighthouse/audits/animation-performance.js'
          }
        ]
      }
    ]
  },
  
  // Performance budget configuration
  budgets: require('./lighthouse/budgets.json')
};