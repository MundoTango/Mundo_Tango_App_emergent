export const deploymentConfig = {
  // Deployment target
  target: 'autoscale' as const,

  // Build configuration
  build: {
    command: 'npm run build',
    outputDir: 'dist',
    environment: {
      NODE_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  },

  // Runtime configuration
  run: {
    command: 'node dist/server/index.js',
    port: 5000,
    environment: {
      NODE_ENV: 'production',
      PORT: '5000'
    }
  },

  // Auto-scaling configuration
  scaling: {
    minInstances: 2,
    maxInstances: 10,
    targetCPU: 70,
    targetMemory: 80,
    scaleUpCooldown: 60, // seconds
    scaleDownCooldown: 300 // seconds
  },

  // Health check
  healthCheck: {
    path: '/health',
    interval: 30,
    timeout: 10,
    unhealthyThreshold: 3,
    healthyThreshold: 2
  },

  // Performance optimization
  optimization: {
    compression: true,
    caching: {
      static: 86400, // 1 day
      api: 300 // 5 minutes
    },
    minify: true,
    bundleAnalyzer: false
  },

  // Monitoring
  monitoring: {
    metrics: true,
    logging: 'info',
    errorTracking: true,
    performanceTracking: true
  },

  // Database
  database: {
    poolSize: 20,
    connectionTimeout: 30000,
    idleTimeout: 10000
  },

  // CDN configuration
  cdn: {
    enabled: false, // MT uses CDN-free architecture
    domains: []
  },

  // Security
  security: {
    helmet: true,
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
      credentials: true
    },
    rateLimit: {
      windowMs: 60000,
      max: 100
    }
  }
};

export function getDeploymentCommand() {
  return {
    deployment_target: deploymentConfig.target,
    build: ['npm', 'run', 'build'],
    run: ['node', 'dist/server/index.js'],
    env: {
      NODE_ENV: 'production',
      PORT: '5000'
    }
  };
}
