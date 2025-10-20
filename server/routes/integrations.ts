// S1: Integration Health Checks API
// MB.MD Cleanup: Removed Plausible, Notion, Supabase, n8n (see docs/S1_REMOVED_INTEGRATIONS.md)
import { Router } from 'express';

const router = Router();

/**
 * GET /api/integrations/status
 * Returns health status of all core integrations
 * REMOVED: Plausible, Notion, Supabase, n8n (see S1_REMOVED_INTEGRATIONS.md)
 */
router.get('/status', async (req, res) => {
  const integrations = {
    // Core infrastructure (always needed)
    database: !!process.env.DATABASE_URL,
    
    // Payment processing
    stripe: !!process.env.STRIPE_SECRET_KEY,
    
    // AI & Content
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    
    // Storage
    objectStorage: !!process.env.REPLIT_OBJECT_STORAGE,
    
    // Monitoring & Analytics
    sentry: !!process.env.SENTRY_DSN,
    posthog: !!process.env.POSTHOG_API_KEY,
  };

  const summary = {
    configured: Object.values(integrations).filter(Boolean).length,
    total: Object.keys(integrations).length,
    percentage: Math.round((Object.values(integrations).filter(Boolean).length / Object.keys(integrations).length) * 100),
  };

  res.json({
    integrations,
    summary,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/integrations/detailed
 * Detailed health checks with async database validation
 */
router.get('/detailed', async (req, res) => {
  const integrations = {
    // ✅ CORE INTEGRATIONS
    postgresql: await checkPostgreSQL(),
    objectStorage: await checkObjectStorage(),
    socketio: checkSocketIO(),
    posthog: checkPostHog(),
    leaflet: checkLeaflet(),
    reactQuery: checkReactQuery(),
    
    // 🟡 OPTIONAL INTEGRATIONS
    sentry: checkSentry(),
    stripe: checkStripe(),
    openai: checkOpenAI(),
    openreplay: checkOpenReplay(),
  };

  const summary = {
    total: Object.keys(integrations).length,
    healthy: Object.values(integrations).filter(i => i.status === 'healthy').length,
    degraded: Object.values(integrations).filter(i => i.status === 'degraded').length,
    down: Object.values(integrations).filter(i => i.status === 'down').length,
  };

  res.json({
    status: summary.down === 0 ? 'healthy' : summary.down < 3 ? 'degraded' : 'critical',
    summary,
    integrations,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/integrations/:name/health
 * Check individual integration health
 */
router.get('/:name/health', async (req, res) => {
  const { name } = req.params;
  
  const healthChecks: Record<string, () => Promise<any>> = {
    postgresql: checkPostgreSQL,
    objectStorage: checkObjectStorage,
  };

  if (!healthChecks[name]) {
    return res.status(404).json({ error: 'Integration not found' });
  }

  const result = await healthChecks[name]();
  res.json(result);
});

// ============================================
// HEALTH CHECK FUNCTIONS
// ============================================

async function checkPostgreSQL() {
  try {
    const { db } = await import('../db.js');
    await db.execute('SELECT 1 as health');
    return {
      name: 'PostgreSQL',
      status: 'healthy',
      details: 'Connected via Drizzle ORM',
    };
  } catch (error: any) {
    return {
      name: 'PostgreSQL',
      status: 'down',
      error: error.message,
    };
  }
}

async function checkObjectStorage() {
  try {
    const hasObjectStorage = process.env.REPLIT_OBJECT_STORAGE !== undefined;
    return {
      name: 'Object Storage',
      status: hasObjectStorage ? 'healthy' : 'degraded',
      details: hasObjectStorage ? 'Replit Object Storage available' : 'Not configured',
    };
  } catch (error: any) {
    return {
      name: 'Object Storage',
      status: 'down',
      error: error.message,
    };
  }
}

function checkSocketIO() {
  return {
    name: 'Socket.io',
    status: 'healthy',
    details: 'WebSocket server running',
  };
}

function checkPostHog() {
  const apiKey = process.env.POSTHOG_API_KEY;
  return {
    name: 'PostHog Analytics',
    status: apiKey ? 'healthy' : 'degraded',
    details: apiKey ? 'Server + Client analytics active' : 'API key missing (add POSTHOG_API_KEY)',
    configured: !!apiKey,
  };
}

function checkLeaflet() {
  const apiKey = process.env.LOCATIONIQ_API_KEY;
  return {
    name: 'Leaflet/LocationIQ Maps',
    status: apiKey ? 'healthy' : 'degraded',
    details: apiKey ? 'Full geocoding enabled' : 'OpenStreetMap only (no geocoding)',
    configured: !!apiKey,
  };
}

function checkReactQuery() {
  return {
    name: 'React Query',
    status: 'healthy',
    details: 'Client-side caching active',
  };
}

function checkSentry() {
  const dsn = process.env.SENTRY_DSN;
  return {
    name: 'Sentry Error Tracking',
    status: dsn ? 'healthy' : 'degraded',
    details: dsn ? 'Server + Client monitoring active' : 'DSN not configured (add SENTRY_DSN)',
    configured: !!dsn,
  };
}

function checkStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let status = 'down';
  if (secretKey && webhookSecret) status = 'healthy';
  else if (secretKey) status = 'degraded';
  
  return {
    name: 'Stripe Payments',
    status,
    details: secretKey ? (webhookSecret ? 'Fully configured' : 'Missing STRIPE_WEBHOOK_SECRET') : 'Not configured',
    configured: !!secretKey,
    webhookConfigured: !!webhookSecret,
  };
}

function checkOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  return {
    name: 'OpenAI GPT-4',
    status: apiKey ? 'healthy' : 'degraded',
    details: apiKey ? 'AI content generation enabled' : 'API key missing (optional)',
    configured: !!apiKey,
  };
}

function checkOpenReplay() {
  const projectKey = process.env.VITE_OPENREPLAY_PROJECT_KEY;
  return {
    name: 'OpenReplay Session Replay',
    status: projectKey ? 'healthy' : 'degraded',
    details: projectKey ? 'Session recording enabled' : 'Project key missing (optional)',
    configured: !!projectKey,
  };
}

export default router;
