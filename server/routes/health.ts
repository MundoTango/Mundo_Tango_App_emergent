// MB.MD S5: Add Production Health Endpoints
export async function registerHealthEndpoints(app: any) {
  const { db } = await import('../db');
  
  // Standard API health endpoint
  app.get('/api/health', (_req: any, res: any) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
  
  // Database health check
  app.get('/api/health/db', async (_req: any, res: any) => {
    try {
      // Simple query to test DB connection
      await db.execute('SELECT 1 as alive');
      res.json({ 
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(503).json({ 
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Integration status endpoint
  app.get('/api/integrations/status', (_req: any, res: any) => {
    const integrations = {
      database: !!process.env.DATABASE_URL,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      objectStorage: !!process.env.REPLIT_OBJECT_STORAGE,
      sentry: !!process.env.SENTRY_DSN,
      posthog: !!process.env.POSTHOG_API_KEY
    };
    
    const configured = Object.values(integrations).filter(Boolean).length;
    const total = Object.keys(integrations).length;
    
    res.json({
      integrations,
      summary: {
        configured,
        total,
        percentage: Math.round((configured / total) * 100)
      },
      timestamp: new Date().toISOString()
    });
  });
}
