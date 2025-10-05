/**
 * Production Configuration for ESA LIFE CEO 61x21
 * Optimized for Replit Autoscale Deployment
 */

export const productionConfig = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    host: '0.0.0.0',
    trustProxy: true,
    maxRequestSize: '50mb',
    timeout: 30000,
    keepAliveTimeout: 65000,
    headersTimeout: 66000
  },

  // Database Configuration
  database: {
    maxConnections: 20,
    idleTimeout: 10000,
    connectionTimeout: 5000,
    statementTimeout: 30000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  },

  // Agent System Configuration
  agents: {
    maxConcurrentJobs: 10,
    jobTimeout: 60000,
    retryAttempts: 3,
    retryDelay: 1000,
    cleanupInterval: 300000 // 5 minutes
  },

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    maxTokens: 2000,
    temperature: 0.7,
    model: 'gpt-4o',
    rateLimit: {
      maxRequests: 100,
      windowMs: 60000 // 1 minute
    }
  },

  // Performance Optimizations
  performance: {
    enableCompression: true,
    enableCaching: true,
    cacheMaxAge: 3600,
    enableRateLimiting: true,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },

  // Security Configuration
  security: {
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['*'],
    enableHelmet: true,
    enableCSRF: process.env.NODE_ENV === 'production',
    sessionSecret: process.env.SESSION_SECRET || 'esa-life-ceo-61x21-secret',
    jwtSecret: process.env.JWT_SECRET || 'esa-life-ceo-jwt-secret'
  },

  // Monitoring Configuration
  monitoring: {
    enableMetrics: true,
    metricsPort: 9090,
    healthCheckPath: '/health',
    readinessPath: '/ready',
    livenessPath: '/live',
    enableErrorTracking: true,
    logLevel: process.env.LOG_LEVEL || 'info'
  },

  // Autoscaling Configuration
  autoscaling: {
    minInstances: 1,
    maxInstances: 10,
    targetCPU: 70,
    targetMemory: 80,
    scaleUpPeriod: 60,
    scaleDownPeriod: 300,
    healthCheckInterval: 30000,
    healthCheckTimeout: 5000,
    startupProbe: {
      path: '/health',
      initialDelaySeconds: 10,
      periodSeconds: 10,
      failureThreshold: 3
    }
  },

  // Feature Flags
  features: {
    enableAgents: true,
    enableWebSockets: true,
    enableFileUploads: true,
    enableEmailService: true,
    enableSearchService: true,
    enableAnalytics: true,
    enableInternationalization: true
  },

  // Resource Limits
  resources: {
    maxFileSize: '100MB',
    maxVideoSize: '500MB',
    maxImageSize: '10MB',
    maxConcurrentUploads: 5,
    tempFileCleanupInterval: 3600000 // 1 hour
  }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'production') {
  // Production-only settings
  productionConfig.server.trustProxy = true;
  productionConfig.security.enableCSRF = true;
  productionConfig.performance.enableCompression = true;
  productionConfig.monitoring.logLevel = 'warn';
} else if (process.env.NODE_ENV === 'development') {
  // Development-only settings
  productionConfig.security.enableCSRF = false;
  productionConfig.monitoring.logLevel = 'debug';
  productionConfig.autoscaling.minInstances = 1;
  productionConfig.autoscaling.maxInstances = 1;
}

export default productionConfig;