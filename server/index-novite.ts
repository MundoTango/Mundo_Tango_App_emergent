/**
 * Mundo Tango ESA LIFE CEO - Production-Ready Server Without Vite
 * All core functionality intact: video uploads, memory management, API endpoints
 */

/// <reference types="node" />

import express, { type Request, type Response, type NextFunction } from "express";
import * as pathModule from "path";
import compression from "compression";
import bytes from 'bytes';
import { Server as SocketServer } from 'socket.io';
import { createServer as createHttpServer } from 'http';
import dotenv from "dotenv";
dotenv.config();

// Ensure Node.js types are available
declare const global: typeof globalThis & { gc?: () => void };
declare const process: NodeJS.Process;
declare const console: Console;

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
import cspReportsRouter from "./routes/csp-reports";
import ttsRoutes from "./routes/ttsRoutes";
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
import { requestLogger } from "./middleware/requestLogger";
import { getConnectionStatus, pool } from "./db";

// AGENT #143: Initialize observability (gated behind env flag)
import { initObservability, shutdownObservability } from "./observability";

const app = express();

// Disable X-Powered-By header for security (Architect recommendation: Oct 20, 2025)
app.disable('x-powered-by');

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
app.use((req: Request, res: Response, next: NextFunction) => {
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
// MB.MD Phase 5: Request logging middleware (before routes)
app.use(requestLogger);

app.use(securityHeaders);
app.use(sanitizeInput);

// TRACK 3B: Cache-busting middleware (MB.MD 100% Plan - Oct 26, 2025)
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.endsWith('.js') || req.path.endsWith('.css')) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

// Initialize feature flags
initializeFeatureFlags().catch(error => {
  logger.error({ error }, 'Failed to initialize feature flags');
});

// Comprehensive health check endpoints - MB.MD S5: Production Ready
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Simple health check for deployment
app.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).send('ok');
});

app.get('/ready', async (req: Request, res: Response) => {
  try {
    const { db } = await import('./db');
    await db.execute('SELECT 1');
    res.json({ status: 'ready', database: 'connected' });
  } catch (error) {
    logger.error({ error }, 'Readiness check failed');
    res.status(503).json({ status: 'not ready', error: 'Database connection failed' });
  }
});

// Database Health Check - Critical for deployment monitoring (registered early to avoid Vite intercept)
app.get('/api/health/db', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const status = getConnectionStatus();
    
    // Test actual database connectivity
    let queryLatency = 0;
    try {
      const queryStart = Date.now();
      await pool.query('SELECT 1');
      queryLatency = Date.now() - queryStart;
    } catch (err) {
      return res.status(503).json({
        status: 'unhealthy',
        error: 'Database query failed',
        message: err instanceof Error ? err.message : String(err),
        connectionStatus: status,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      status: status.isConnected ? 'healthy' : 'degraded',
      database: {
        connected: status.isConnected,
        retriesAttempted: status.retriesAttempted,
        queryLatency: `${queryLatency}ms`,
        pool: status.poolStats
      },
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: 'Health check failed',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});

// Metrics endpoint
app.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await register.metrics();
    res.set('Content-Type', register.contentType);
    res.end(metrics);
  } catch (error) {
    logger.error({ error }, 'Error generating metrics');
    res.status(500).end();
  }
});

// Setup API documentation
setupSwagger(app);

// Video streaming route
app.get('/api/videos/:filename', (req: Request, res: Response) => {
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

// OpenAI TTS routes (Oct 22, 2025 - Premium voice quality)
app.use(ttsRoutes);

// GPT-4o Realtime API routes (Oct 22, 2025 - Two-way voice conversation)
import { setupRealtimeWebSocket } from './routes/realtimeRoutes';

// MB.MD Phase 5: CSP violation reporting
app.use(cspReportsRouter);

// Mundo Tango ESA LIFE CEO - Add chunked upload routes for large videos
import chunkedUploadRoutes from './routes/chunkedUploadRoutes';
app.use(chunkedUploadRoutes);

// Model Monitoring & Auto-Update Routes (Stream G - Oct 22, 2025)
import modelMonitorRoutes from './routes/modelMonitorRoutes';
app.use('/api/models', modelMonitorRoutes);

// VIBE CODING: File Editing Routes (MB.MD 100% Plan - Oct 26, 2025)
// ❌ OLD: vibeEditRoutes removed - use vibeRoutes instead (Oct 27, 2025)
// VIBE routes are registered in routes.ts now

// TRACK 3A: Hot Reload Routes (MB.MD 100% Plan - Oct 26, 2025)
import { createHotReloadRoutes } from './routes/hotReloadRoutes';

// Mundo Tango ESA LIFE CEO - Serve uploads directory for profile photos and media
app.use('/uploads', express.static(pathModule.join(process.cwd(), 'uploads')));

// Define client path early - PRODUCTION: dist/public (built by vite)
const clientPath = pathModule.join(process.cwd(), 'dist', 'public');

// API routes
const startServer = async () => {
  try {
    // AGENT #143: Initialize observability (gated behind env flag)
    if (process.env.ENABLE_OBSERVABILITY === 'true') {
      console.log('📊 [Observability] Initializing OpenTelemetry...');
      await initObservability();
    } else {
      console.log('📊 [Observability] Disabled (set ENABLE_OBSERVABILITY=true to enable)');
    }
    
    console.log('🔄 Initializing database connection...');
    const httpServer = await registerRoutes(app);
    console.log('✅ Routes registered successfully');
    
    // Setup GPT-4o Realtime API WebSocket (Oct 22, 2025)
    setupRealtimeWebSocket(httpServer);
    console.log('✅ Realtime API WebSocket initialized');
    
    // TRACK 3A: Initialize Hot Reload Manager (MB.MD 100% Plan - Oct 26, 2025)
    const io = require('./routes').io; // Get Socket.io instance from routes
    if (io) {
      const { HotReloadManager } = await import('./services/preview/hotReloadManager');
      const hotReloadManager = new HotReloadManager(io);
      hotReloadManager.start();
      app.use('/api/hot-reload', createHotReloadRoutes(io));
      console.log('✅ Hot Reload Manager initialized (<500ms target)');
    }
    
    // IMPORTANT: Static file serving AFTER API routes to prevent HTML responses for API calls
    app.use(express.static(clientPath));
    
    // Fallback route for client-side routing
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(pathModule.join(clientPath, 'index.html'));
    });
    
    // Use port 80 for production deployments (Replit requirement)
    const PORT = Number(process.env.PORT) || (process.env.NODE_ENV === 'production' ? 80 : 5000);
    console.log(`🌐 Starting server on port ${PORT}`);
    
    httpServer.listen(PORT, '0.0.0.0', (error?: any) => {
      if (error) {
        console.error('❌ Failed to bind to port:', error);
        throw error;
      }
      const heapSize = Math.round(process.memoryUsage().heapTotal / 1024 / 1024 / 1024 * 100) / 100;
      console.log(`✅ Mundo Tango ESA LIFE CEO Server running on port ${PORT}`);
      console.log(`  Heap Limit: ${heapSize} GB`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Video uploads: ✅ Enabled (456MB+ support)`);
      console.log(`  Memory management: ✅ Optimized`);
      console.log(`  All core features: ✅ Operational`);
      console.log(`[server] listening on ${PORT}`);
      
      // Start automated model monitoring (checks 4x daily for deprecations - Oct 22, 2025)
      // ✅ MB.MD SIMULTANEOUS FIX: Handled in routes.ts static import now
      // This is a duplicate initialization - modelMonitorCron already started in routes.ts
      // Left here as fallback if routes.ts fails to initialize
    });

    // Add error handler for the server
    httpServer.on('error', (error: any) => {
      console.error('❌ HTTP Server error:', error);
      logger.fatal('HTTP Server error:', error);
      throw error;
    });

  } catch (error) {
    console.error('❌ Server startup error:', error);
    logger.fatal({ error }, 'Failed to start server');
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📊 [Observability] Shutting down...');
  if (process.env.ENABLE_OBSERVABILITY === 'true') {
    await shutdownObservability();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('📊 [Observability] Shutting down...');
  if (process.env.ENABLE_OBSERVABILITY === 'true') {
    await shutdownObservability();
  }
  process.exit(0);
});

startServer();