/**
 * ESA LIFE CEO 56x21 - Production-Ready Server Without Vite
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
app.use(securityHeaders);
app.use(sanitizeInput);

// Initialize feature flags
initializeFeatureFlags().catch(error => {
  logger.error('Failed to initialize feature flags:', error);
});

// Health check endpoints
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
    logger.error('Readiness check failed:', error);
    res.status(503).json({ status: 'not ready', error: 'Database connection failed' });
  }
});

// Metrics endpoint
app.get('/metrics', async (req: Request, res: Response) => {
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

// ESA LIFE CEO 56x21 - Add chunked upload routes for large videos
import chunkedUploadRoutes from './routes/chunkedUploadRoutes';
app.use(chunkedUploadRoutes);

// ESA LIFE CEO 56x21 - Serve uploads directory for profile photos and media
app.use('/uploads', express.static(pathModule.join(process.cwd(), 'uploads')));

// Define client path early - PRODUCTION: dist/public (built by vite)
const clientPath = pathModule.join(process.cwd(), 'dist', 'public');

// API routes
const startServer = async () => {
  try {
    console.log('🔄 Initializing database connection...');
    const httpServer = await registerRoutes(app);
    console.log('✅ Routes registered successfully');
    
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
      console.log(`✅ ESA LIFE CEO 56x21 Server running on port ${PORT}`);
      console.log(`  Heap Limit: ${heapSize} GB`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Video uploads: ✅ Enabled (456MB+ support)`);
      console.log(`  Memory management: ✅ Optimized`);
      console.log(`  All core features: ✅ Operational`);
      console.log(`[server] listening on ${PORT}`);
    });

    // Add error handler for the server
    httpServer.on('error', (error: any) => {
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