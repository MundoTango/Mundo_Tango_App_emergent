export default {
  ci: {
    // Collection settings
    collect: {
      url: [
        'http://localhost:5000/memories',
        'http://localhost:5000/community-world-map',
        'http://localhost:5000/',
        'http://localhost:5000/auth/login',
        'http://localhost:5000/profile',
        'http://localhost:5000/events'
      ],
      startServerCommand: 'npm run dev',
      startServerReadyPattern: 'Server running on port 5000',
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          cpuSlowdownMultiplier: 1
        }
      }
    },
    
    // Assertions for ESA Layer 48 requirements
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        
        // Core Web Vitals (as specified in ESA framework)
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // LCP < 2.5s
        'first-input-delay': ['error', { maxNumericValue: 100 }], // FID < 100ms  
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // CLS < 0.1
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],
        
        // Bundle size (< 100KB per route as specified)
        'total-byte-weight': ['error', { maxNumericValue: 102400 }],
        'uses-responsive-images': 'error',
        'uses-optimized-images': 'error',
        'uses-text-compression': 'error',
        'uses-rel-preconnect': 'warn',
        
        // MT Ocean theme specific
        'color-contrast': 'error',
        'viewport': 'error'
      }
    },
    
    // Upload settings (for CI/CD)
    upload: {
      target: 'temporary-public-storage'
    },
    
    // Server settings
    server: {
      port: 9001,
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'postgres',
        sqlDatabasePath: process.env.DATABASE_URL
      }
    }
  }
};