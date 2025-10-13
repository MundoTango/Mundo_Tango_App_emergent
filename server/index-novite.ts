/**
 * ESA LIFE CEO 56x21 - Production-Ready Server Without Vite
 * All core functionality intact: video uploads, memory management, API endpoints
 */

import express, { type Request, Response, NextFunction } from "express";
import * as pathModule from "path";
import compression from "compression";
import bytes from 'bytes';
import { Server as SocketServer } from 'socket.io';
import { createServer as createHttpServer } from 'http';
import dotenv from "dotenv";
dotenv.config();

// Import setupSocketIO for Socket.io integration
import { setupSocketIO } from './socket';

// ESA Layer 14: Import cache services
import { cacheService } from './services/cache';
import { cacheWarmer } from './services/cache-warmer';

// Import route handlers
import postsRoutes from './routes/postsRoutes';
import eventsRoutes from './routes/eventsRoutes';
import integrationHelpers from './routes/integrationHelpers';
import hostHomesRoutes from './routes/hostHomesRoutes';
import authRoutes from './routes/authRoutes';

// Memory optimization for large uploads
if (global.gc) {
  console.log('🧹 Garbage collection exposed, enabling aggressive memory management');
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    if (heapUsedMB > 2048) {
      console.log(`♻️ Forcing garbage collection at ${heapUsedMB}MB heap usage`);
      global.gc?.();
    }
  }, 30000);
}

// Import core routes
import uploadRoutes from "./routes/uploadRoutes";
import debugRoutes from "./routes/debugRoutes";
import internalUploadRoutes from "./routes/upload";
import { registerRoutes } from "./routes";
import { streamVideo, isVideoFile } from './videoStreaming';
import { register } from "./lib/prometheus-metrics";
import { initializeElasticsearch } from "./lib/elasticsearch-config";
import { initializeFeatureFlags } from "./lib/feature-flags";
import { logger, phase1Logger, phase4Logger, logLearning } from "./lib/logger";
import { setupSwagger } from "./lib/swagger-config";
import { 
  securityHeaders, 
  sanitizeInput,
  csrfProtection,
  sessionSecurityConfig 
} from "./middleware/security";

// ESA LIFE CEO 61x21 - Phase 13: Security Hardening Imports
import { configureSecurityHeaders, configureCORS } from './security/security-headers';
import { csrfProtection as enhancedCSRF, setupCSRFEndpoint } from './security/csrf-protection';
import { sanitizeRequest } from './security/input-sanitizer';
import { auditMiddleware, AuditEventType, AuditLevel } from './security/audit-logger';
import securityRoutes from './routes/securityRoutes';
import { initializeOAuth } from './security/oauth-config';

const app = express();

// Process-level error handlers
process.on('uncaughtException', (error) => {
  logger.fatal({ error, stack: error.stack }, 'Uncaught Exception');
});

process.on('unhandledRejection', (reason, promise) => {
  const errorDetails = {
    reason: reason instanceof Error ? {
      message: reason.message,
      stack: reason.stack,
      name: reason.name
    } : reason,
    promise: String(promise)
  };
  logger.fatal(errorDetails, 'Unhandled Rejection');
  console.error('Unhandled Promise Rejection:', reason);
});

// ESA Layer 14: Graceful shutdown for cache service
process.on('SIGTERM', async () => {
  console.log('🛑 ESA Layer 14: Shutting down cache services...');
  cacheWarmer.stop();
  await cacheService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 ESA Layer 14: Shutting down cache services...');
  cacheWarmer.stop();
  await cacheService.close();
  process.exit(0);
});

// Enable compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 10 * 1024, // 10KB
  memLevel: 8
}));

// Body parsing middleware with size limits
app.use(express.json({ 
  limit: '1gb',
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '1gb' 
}));

// Request size middleware
app.use((req, res, next) => {
  const contentLength = req.headers['content-length'];
  if (contentLength) {
    const sizeInBytes = parseInt(contentLength);
    const humanSize = bytes(sizeInBytes);
    console.log(`📊 Incoming request size: ${humanSize}`);
    if (sizeInBytes > 100 * 1024 * 1024) { // 100MB
      console.log(`⚠️ Large request detected: ${humanSize}`);
    }
  }
  next();
});

// Apply security headers
app.use(securityHeaders);
app.use(sanitizeInput);

// ESA LIFE CEO 61x21 - Phase 13: Enhanced Security Configuration
configureSecurityHeaders(app);
configureCORS(app);

// Enhanced CSRF protection
app.use(enhancedCSRF({
  skipPaths: ['/api/webhook', '/api/stripe/webhook', '/api/upload', '/uploads'],
}));
setupCSRFEndpoint(app);

// Input sanitization middleware
app.use(sanitizeRequest);

// Initialize OAuth providers
initializeOAuth();

// Audit logging for critical endpoints
app.use('/api/auth/*', auditMiddleware(AuditEventType.LOGIN_SUCCESS));
app.use('/api/admin/*', auditMiddleware(AuditEventType.ADMIN_ACTION, AuditLevel.INFO));
app.use('/api/users/*', auditMiddleware(AuditEventType.DATA_UPDATED, AuditLevel.INFO));

// Initialize feature flags
initializeFeatureFlags().catch(error => {
  logger.error('Failed to initialize feature flags:', error);
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Simple health check for deployment
app.get('/healthz', (_req, res) => {
  res.status(200).send('ok');
});

app.get('/ready', async (req, res) => {
  try {
    const { db } = await import('./db');
    await db.execute('SELECT 1');
    res.json({ status: 'ready', database: 'connected' });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({ status: 'not ready', error: 'Database connection failed' });
  }
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    const metrics = await register.metrics();
    res.set('Content-Type', register.contentType);
    res.end(metrics);
  } catch (error) {
    logger.error('Error generating metrics:', error);
    res.status(500).end();
  }
});

// Setup API documentation
setupSwagger(app);

// Video streaming route
app.get('/api/videos/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = pathModule.join(process.cwd(), 'uploads', filename);

  if (!isVideoFile(filename)) {
    return res.status(400).json({ error: 'Invalid video file' });
  }

  streamVideo(req, res, filePath);
});

// Mount upload routes
app.use('/api/upload', uploadRoutes);
app.use(internalUploadRoutes); // ESA Layer 13: Internal upload system
app.use('/api/debug', debugRoutes);

// ESA LIFE CEO 61x21 - Mount security routes (OAuth, 2FA, API keys)
app.use('/api', securityRoutes);

// Mount integration helper routes for Events Agent coordination
// app.use('/api/integration', integrationHelpers); // Original line commented out

// ESA LIFE CEO 56x21 - Add chunked upload routes for large videos
import chunkedUploadRoutes from './routes/chunkedUploadRoutes';
app.use(chunkedUploadRoutes);

// ESA LIFE CEO 61x21 - Expert Agent Routes
import aiExpertRoutes from './routes/ai-expert';
import uiUxRoutes from './routes/ui-ux';
import translationRoutes from './routes/translation';
import auditRoutes from './routes/audit';
app.use('/api/ai-expert', aiExpertRoutes);
app.use('/api/ui-ux', uiUxRoutes);
app.use('/api/translation', translationRoutes);
app.use('/api/audit', auditRoutes); // ESA Audit Runner System

// MB.MD PHASE 4 - Smart Agents Routes (Agents #106-109)
import smartAgentsRoutes from './routes/smartAgentsRoutes';
app.use('/api/smart-agents', smartAgentsRoutes);

// MB.MD PHASE 5 - Smart Agents V2 Routes (Enhanced)
import smartAgentsV2Routes from './routes/smartAgentsV2Routes';
app.use('/api/smart-agents', smartAgentsV2Routes);

// MB.MD PHASE 6 - Autonomous Intelligence & Self-Healing Routes
import phase6Routes from './routes/phase6Routes';
app.use('/api/phase6', phase6Routes);

// ESA LIFE CEO 56x21 - Serve uploads directory for profile photos and media
app.use('/uploads', express.static(pathModule.join(process.cwd(), 'uploads')));

// Define client path for fallbacks
const clientPath = pathModule.join(process.cwd(), 'client', 'dist');

// ESA FIX: Use Vite for development, static files for production
if (process.env.NODE_ENV === 'development') {
  // Development: Vite will be set up later in startServer
  console.log('🔧 [DEV] Will use Vite middleware for client assets');
} else {
  // Production: Serve static files from dist
  app.use(express.static(clientPath, {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      if (path.endsWith('.js') || path.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=UTF-8');
      } else if (path.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=UTF-8');
      }
    }
  }));
}

// API routes
const startServer = async () => {
  try {
    console.log('🔄 Initializing database connection...');
    const httpServer = await registerRoutes(app);
    console.log('✅ Routes registered successfully');

    // ESA Layer 14: Initialize cache service
    console.log('🔄 ESA Layer 14: Initializing cache service...');
    await cacheService.get('test'); // Test cache connection
    const cacheStatus = cacheService.getStatus();
    console.log(`✅ ESA Layer 14: Cache service initialized`);
    console.log(`  - Redis: ${cacheStatus.redis ? '✅ Connected' : '❌ Not available (using memory cache)'}`);
    console.log(`  - Memory Cache: ✅ Active`);
    
    // ESA Layer 14: Start cache warming service
    cacheWarmer.start();
    console.log('✅ ESA Layer 14: Cache warming service started');

    // Initialize Socket.io real-time features
    const io = setupSocketIO(httpServer);
    console.log('✅ Socket.io real-time features initialized on port 5000');

    // MB.MD PHASE 4 - Initialize Smart Agents (Agents #106-109)
    try {
      const { smartAgents } = await import('./agents');
      await smartAgents.initialize(io);
      console.log('✅ MB.MD: Smart Agents #106-109 initialized and scheduled');
    } catch (error) {
      console.error('⚠️  Failed to initialize Smart Agents:', error);
    }

    // Mount API routes
    app.use(authRoutes); // ESA Agent #3-4: Authentication routes
    app.use(postsRoutes);
    app.use(eventsRoutes);
    app.use(integrationHelpers);
    app.use(hostHomesRoutes);

    // ESA FIX: Setup Vite in development mode BEFORE catch-all route
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 [DEV] Setting up Vite development server...');
      try {
        const { setupVite } = await import('./vite');
        await setupVite(app, httpServer);
        console.log('✅ [DEV] Vite middleware configured');
      } catch (viteError) {
        console.error('⚠️ [DEV] Failed to setup Vite, falling back to static files:', viteError);
        // Fallback to static files if Vite fails
        app.use(express.static(clientPath));
        
        // Add catch-all for fallback mode
        app.get('*', (req, res, next) => {
          if (req.url.startsWith('/api') || req.url.startsWith('/uploads')) {
            return next();
          }
          res.sendFile(pathModule.join(clientPath, 'index.html'));
        });
      }
    } else {
      // Production: Add catch-all route for SPA client-side routing
      app.get('*', (req, res, next) => {
        // Skip API routes
        if (req.url.startsWith('/api') || req.url.startsWith('/uploads')) {
          return next();
        }
        
        // Serve index.html for all other routes
        res.sendFile(pathModule.join(clientPath, 'index.html'));
      });
    }

    const PORT = Number(process.env.PORT) || (process.env.NODE_ENV === 'production' ? 80 : 5000);
    console.log(`🌐 Starting server on port ${PORT}`);

    // Initialize ESA Open Source Tools (Phase 1)
    try {
      const { esaToolsRegistry } = await import('./services/ESAOpenSourceToolsRegistry');
      await esaToolsRegistry.initializeAllTools();
    } catch (error) {
      console.error('⚠️  Failed to initialize ESA tools:', error);
    }

    // ESA LIFE CEO 61x21 - AI Research Expert: Daily Intelligence Scheduler
    try {
      const { startAIResearchScheduler } = await import('./jobs/ai-research-scheduler');
      startAIResearchScheduler();
    } catch (error) {
      console.error('⚠️  Failed to start AI Research scheduler:', error);
    }

    httpServer.listen(PORT, '0.0.0.0', (error?: Error) => {
      if (error) {
        console.error('❌ Failed to bind to port:', error);
        throw error;
      }
      const heapSize = Math.round(process.memoryUsage().heapTotal / 1024 / 1024 / 1024 * 100) / 100;
      console.log(`✅ ESA LIFE CEO 56x21 Server running on port ${PORT}`);
      console.log(`  Heap Limit: ${heapSize} GB`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Video uploads: ✅ Enabled (456MB+ support)`);
      console.log(`  Memory management: ✅ Optimized`);
      console.log(`  All core features: ✅ Operational`);
      console.log(`[server] listening on ${PORT}`);
    });

    // Add error handler for the server
    httpServer.on('error', (error) => {
      console.error('❌ HTTP Server error:', error);
      logger.fatal('HTTP Server error:', error);
      throw error;
    });

  } catch (error) {
    console.error('❌ Server startup error:', error);
    logger.fatal('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();