// ESA LIFE CEO 61x21 - Phase 21: Production Configuration
import { config as dotenvConfig } from 'dotenv';
import * as path from 'path';

// Load production environment variables
dotenvConfig({ path: '.env.production' });

export const productionConfig = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || '5000'),
    host: process.env.HOST || '0.0.0.0',
    environment: 'production',
    trustProxy: true,
    corsOrigin: process.env.CORS_ORIGIN || 'https://mundotango.life',
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL,
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'),
    statementTimeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'),
    ssl: {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    },
  },

  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL,
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
    connectionTimeout: 5000,
    lazyConnect: true,
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || 'change-this-in-production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: true,
    httpOnly: true,
    sameSite: 'strict' as const,
  },

  // Security Configuration
  security: {
    bcryptRounds: 12,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: '7d',
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    csrfTokenExpiry: 60 * 60 * 1000, // 1 hour
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: {
      api: 100,
      auth: 5,
      upload: 10,
      payment: 3,
    },
  },

  // Performance Configuration
  performance: {
    enableCompression: true,
    compressionLevel: 6,
    maxPayloadSize: '10mb',
    requestTimeout: 30000,
    keepAliveTimeout: 65000,
    headersTimeout: 66000,
    enableCache: true,
    cacheMaxAge: 3600, // 1 hour
    staticCacheMaxAge: 86400, // 24 hours
  },

  // Monitoring Configuration
  monitoring: {
    enableMetrics: true,
    metricsPort: parseInt(process.env.METRICS_PORT || '9090'),
    enableHealthCheck: true,
    enableAPM: process.env.ENABLE_APM === 'true',
    sentryDsn: process.env.SENTRY_DSN,
    logLevel: process.env.LOG_LEVEL || 'info',
  },

  // Upload Configuration
  upload: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 10,
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'audio/mpeg',
      'audio/wav',
      'application/pdf',
    ],
  },

  // Email Configuration
  email: {
    from: process.env.EMAIL_FROM || 'noreply@mundotango.life',
    replyTo: process.env.EMAIL_REPLY_TO || 'support@mundotango.life',
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    resendApiKey: process.env.RESEND_API_KEY,
  },

  // External Services
  services: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      apiVersion: '2024-11-20.acacia',
    },
    supabase: {
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY,
      serviceKey: process.env.SUPABASE_SERVICE_KEY,
    },
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    },
  },

  // Feature Flags
  features: {
    enableSignup: process.env.ENABLE_SIGNUP !== 'false',
    enableSocialLogin: process.env.ENABLE_SOCIAL_LOGIN === 'true',
    enablePayments: process.env.ENABLE_PAYMENTS !== 'false',
    enableNotifications: process.env.ENABLE_NOTIFICATIONS !== 'false',
    enableAnalytics: process.env.ENABLE_ANALYTICS !== 'false',
    enableMaintenanceMode: process.env.MAINTENANCE_MODE === 'true',
    enableDebugMode: false,
  },

  // CDN Configuration
  cdn: {
    enabled: process.env.CDN_ENABLED === 'true',
    url: process.env.CDN_URL || 'https://cdn.mundotango.life',
    imageOptimization: true,
    autoWebp: true,
    lazyLoading: true,
  },

  // Backup Configuration
  backup: {
    enabled: process.env.BACKUP_ENABLED === 'true',
    schedule: process.env.BACKUP_SCHEDULE || '0 3 * * *', // 3 AM daily
    retention: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
    s3Bucket: process.env.BACKUP_S3_BUCKET,
  },
};

// Validate required configuration
export function validateProductionConfig(): void {
  const required = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'JWT_SECRET',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate security settings
  if (productionConfig.session.secret === 'change-this-in-production') {
    throw new Error('SESSION_SECRET must be changed from default value');
  }

  // Validate database URL format
  if (!productionConfig.database.url?.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection string');
  }

  console.log('✅ Production configuration validated successfully');
}

export default productionConfig;