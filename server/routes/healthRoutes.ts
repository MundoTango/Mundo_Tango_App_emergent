// ESA LIFE CEO 61x21 - Phase 21: Health Check Endpoints
import { Router, Request, Response } from 'express';
import { db, pool } from '../db';
import { supabase } from '../supabaseClient';
import { redisCache } from '../services/cacheService';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

// Basic health check
router.get('/health', async (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ESA LIFE CEO 61x21',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Liveness probe - simple check to verify the service is running
router.get('/healthz', (req: Request, res: Response) => {
  res.status(200).send('ok');
});

// Readiness probe - comprehensive system check
router.get('/ready', async (req: Request, res: Response) => {
  const checks: any = {
    timestamp: new Date().toISOString(),
    status: 'checking',
    checks: {},
  };

  try {
    // Database check
    try {
      const dbResult = await db.execute('SELECT 1');
      checks.checks.database = {
        status: 'healthy',
        responseTime: 0,
        connections: {
          active: pool.totalCount,
          idle: pool.idleCount,
          waiting: pool.waitingCount,
        },
      };
    } catch (error) {
      checks.checks.database = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Database connection failed',
      };
    }

    // Redis check
    try {
      const redisStart = Date.now();
      await redisCache.ping();
      checks.checks.redis = {
        status: 'healthy',
        responseTime: Date.now() - redisStart,
      };
    } catch (error) {
      checks.checks.redis = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Redis connection failed',
      };
    }

    // Supabase check
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      checks.checks.supabase = {
        status: error ? 'unhealthy' : 'healthy',
        error: error?.message,
      };
    } catch (error) {
      checks.checks.supabase = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Supabase connection failed',
      };
    }

    // Disk space check
    const diskPath = process.env.UPLOAD_PATH || '/tmp';
    try {
      const stats = fs.statfsSync(diskPath);
      const totalSpace = stats.blocks * stats.bsize;
      const freeSpace = stats.bavail * stats.bsize;
      const usedPercentage = ((totalSpace - freeSpace) / totalSpace) * 100;
      
      checks.checks.diskSpace = {
        status: usedPercentage < 90 ? 'healthy' : 'warning',
        path: diskPath,
        totalGB: (totalSpace / 1024 / 1024 / 1024).toFixed(2),
        freeGB: (freeSpace / 1024 / 1024 / 1024).toFixed(2),
        usedPercentage: usedPercentage.toFixed(2),
      };
    } catch (error) {
      checks.checks.diskSpace = {
        status: 'unknown',
        error: error instanceof Error ? error.message : 'Disk check failed',
      };
    }

    // Memory check
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;
    
    checks.checks.memory = {
      status: memoryUsagePercent < 90 ? 'healthy' : 'warning',
      totalGB: (totalMemory / 1024 / 1024 / 1024).toFixed(2),
      freeGB: (freeMemory / 1024 / 1024 / 1024).toFixed(2),
      usedPercentage: memoryUsagePercent.toFixed(2),
      processMemoryMB: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
    };

    // CPU check
    const cpus = os.cpus();
    const loadAverage = os.loadavg();
    
    checks.checks.cpu = {
      status: loadAverage[0] < cpus.length * 2 ? 'healthy' : 'warning',
      cores: cpus.length,
      loadAverage: {
        '1min': loadAverage[0].toFixed(2),
        '5min': loadAverage[1].toFixed(2),
        '15min': loadAverage[2].toFixed(2),
      },
    };

    // External services check
    checks.checks.externalServices = {
      stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not-configured',
      sendgrid: process.env.SENDGRID_API_KEY ? 'configured' : 'not-configured',
      cloudinary: process.env.CLOUDINARY_URL ? 'configured' : 'not-configured',
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'not-configured',
    };

    // Overall status
    const allHealthy = Object.values(checks.checks).every((check: any) => 
      check.status === 'healthy' || check.status === 'configured'
    );
    
    checks.status = allHealthy ? 'healthy' : 'degraded';
    
    res.status(allHealthy ? 200 : 503).json(checks);
  } catch (error) {
    checks.status = 'unhealthy';
    checks.error = error instanceof Error ? error.message : 'Health check failed';
    res.status(503).json(checks);
  }
});

// Metrics endpoint for monitoring
router.get('/metrics', async (req: Request, res: Response) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      rss: process.memoryUsage().rss,
      heapTotal: process.memoryUsage().heapTotal,
      heapUsed: process.memoryUsage().heapUsed,
      external: process.memoryUsage().external,
    },
    cpu: process.cpuUsage(),
    system: {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      hostname: os.hostname(),
      uptime: os.uptime(),
    },
    database: {
      poolSize: pool.totalCount,
      activeConnections: pool.totalCount - pool.idleCount,
      waitingRequests: pool.waitingCount,
    },
  };

  res.json(metrics);
});

// Version endpoint
router.get('/version', (req: Request, res: Response) => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
  );
  
  res.json({
    name: packageJson.name,
    version: packageJson.version,
    framework: 'ESA LIFE CEO 61x21',
    phase: '21',
    deployment: process.env.DEPLOYMENT_ID || 'local',
    buildTime: process.env.BUILD_TIME || 'development',
    commitHash: process.env.COMMIT_HASH || 'development',
  });
});

export default router;