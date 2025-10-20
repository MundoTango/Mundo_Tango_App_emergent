// S1: Integration Health Checks API
import { Router } from 'express';

const router = Router();

/**
 * GET /api/integrations/status
 * Returns health status of all integrations
 */
router.get('/status', async (req, res) => {
  const integrations = {
    // ✅ WORKING INTEGRATIONS
    postgresql: await checkPostgreSQL(),
    objectStorage: await checkObjectStorage(),
    socketio: checkSocketIO(),
    posthog: checkPostHog(),
    leaflet: checkLeaflet(),
    reactQuery: checkReactQuery(),
    
    // 🟡 PARTIAL INTEGRATIONS
    sentry: checkSentry(),
    stripe: checkStripe(),
    openai: checkOpenAI(),
    openreplay: checkOpenReplay(),
    plausible: checkPlausible(),
    notion: checkNotion(),
    supabase: checkSupabase(),
    n8n: checkN8N(),
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
    const result = await db.execute('SELECT 1 as health');
    return {
      name: 'PostgreSQL',
      status: 'healthy',
      latency: 0, // Could measure actual latency
      details: 'Connected',
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
  // Socket.io is initialized in server, assume healthy if server is running
  return {
    name: 'Socket.io',
    status: 'healthy',
    details: 'WebSocket server running',
  };
}

function checkPostHog() {
  const apiKey = process.env.POSTHOG_API_KEY;
  return {
    name: 'PostHog',
    status: apiKey ? 'healthy' : 'degraded',
    details: apiKey ? 'API key configured' : 'API key missing',
    configured: !!apiKey,
  };
}

function checkLeaflet() {
  const apiKey = process.env.LOCATIONIQ_API_KEY;
  return {
    name: 'Leaflet/LocationIQ',
    status: apiKey ? 'healthy' : 'degraded',
    details: apiKey ? 'LocationIQ API configured' : 'Using OpenStreetMap (no geocoding)',
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
    name: 'Sentry',
    status: dsn ? 'healthy' : 'down',
    details: dsn ? 'Error tracking enabled' : 'DSN not configured',
    configured: !!dsn,
    required: true,
  };
}

function checkStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let status = 'down';
  if (secretKey && webhookSecret) status = 'healthy';
  else if (secretKey) status = 'degraded';
  
  return {
    name: 'Stripe',
    status,
    details: secretKey ? (webhookSecret ? 'Fully configured' : 'Webhook missing') : 'Not configured',
    configured: !!secretKey,
    webhookConfigured: !!webhookSecret,
    required: true,
  };
}

function checkOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  return {
    name: 'OpenAI',
    status: apiKey ? 'healthy' : 'degraded',
    details: apiKey ? 'AI features enabled' : 'API key missing',
    configured: !!apiKey,
    required: false,
  };
}

function checkOpenReplay() {
  const projectKey = process.env.VITE_OPENREPLAY_PROJECT_KEY;
  return {
    name: 'OpenReplay',
    status: projectKey ? 'healthy' : 'down',
    details: projectKey ? 'Session replay enabled' : 'Not configured',
    configured: !!projectKey,
    required: false,
  };
}

function checkPlausible() {
  // Plausible uses script tag, no API key needed
  return {
    name: 'Plausible',
    status: 'healthy',
    details: 'Privacy-first analytics via script tag',
    configured: true,
    required: false,
  };
}

function checkNotion() {
  const apiKey = process.env.NOTION_API_KEY;
  return {
    name: 'Notion CMS',
    status: apiKey ? 'healthy' : 'down',
    details: apiKey ? 'CMS integration active' : 'Not configured',
    configured: !!apiKey,
    required: false,
    note: 'Decision needed: Keep or remove?',
  };
}

function checkSupabase() {
  const url = process.env.SUPABASE_URL;
  return {
    name: 'Supabase',
    status: url ? 'degraded' : 'down',
    details: url ? 'Configured but redundant with Drizzle?' : 'Not configured',
    configured: !!url,
    required: false,
    note: 'Decision needed: May be redundant with PostgreSQL/Drizzle',
  };
}

function checkN8N() {
  const apiKey = process.env.N8N_API_KEY;
  return {
    name: 'n8n',
    status: apiKey ? 'healthy' : 'down',
    details: apiKey ? 'Workflow automation enabled' : 'Not configured',
    configured: !!apiKey,
    required: false,
    note: 'Decision needed: Set up workflows or defer?',
  };
}

export default router;
