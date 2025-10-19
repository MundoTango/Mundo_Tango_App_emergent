import { Express, Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Safely loads and registers a route module if it exists.
 * Prevents server crashes from phantom imports.
 * 
 * @param app - Express application instance
 * @param routePath - Relative path to route file (e.g., './routes/userRoutes')
 * @param mountPath - API mount path (e.g., '/api' or '/api/journey')
 * @param description - Human-readable description for logging
 * @returns true if route was loaded, false if file doesn't exist
 */
export async function safeLoadRoute(
  app: Express,
  routePath: string,
  mountPath: string = '',
  description?: string
): Promise<boolean> {
  try {
    // Dynamically import the module (let Node.js resolve the path)
    const module = await import(routePath);
    const router = module.default || module;
    
    if (!router) {
      console.warn(`⚠️  Route module ${routePath} has no default export - skipping`);
      return false;
    }
    
    // Register the router
    if (mountPath) {
      app.use(mountPath, router);
    } else {
      app.use(router);
    }
    
    console.log(`✅ Loaded route: ${description || routePath}${mountPath ? ` at ${mountPath}` : ''}`);
    return true;
  } catch (error: any) {
    console.warn(`⚠️  Failed to load route ${routePath}:`, error.message);
    return false;
  }
}

/**
 * Batch loads multiple routes safely.
 * 
 * @param app - Express application instance
 * @param routes - Array of route configuration objects
 * @returns Object with counts of loaded and failed routes
 */
export async function safeLoadRoutes(
  app: Express,
  routes: Array<{
    path: string;
    mountPath?: string;
    description?: string;
  }>
): Promise<{ loaded: number; failed: number; total: number }> {
  let loaded = 0;
  let failed = 0;
  
  for (const route of routes) {
    const success = await safeLoadRoute(
      app,
      route.path,
      route.mountPath || '',
      route.description
    );
    if (success) {
      loaded++;
    } else {
      failed++;
    }
  }
  
  const total = routes.length;
  console.log(`📊 Route loading complete: ${loaded}/${total} loaded, ${failed} skipped`);
  
  return { loaded, failed, total };
}

/**
 * Auto-discovers and loads all route files from a directory.
 * 
 * @param app - Express application instance
 * @param routesDir - Directory path containing route files
 * @param mountPath - Base mount path for all routes
 * @returns Number of routes loaded
 */
export async function autoLoadRoutes(
  app: Express,
  routesDir: string,
  mountPath: string = '/api'
): Promise<number> {
  const routesPath = path.resolve(__dirname, '..', routesDir);
  
  if (!fs.existsSync(routesPath)) {
    console.error(`❌ Routes directory not found: ${routesDir}`);
    return 0;
  }
  
  const files = fs.readdirSync(routesPath)
    .filter(file => (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts'))
    .map(file => file.replace(/\.(ts|js)$/, ''));
  
  let loaded = 0;
  
  for (const file of files) {
    const success = await safeLoadRoute(
      app,
      `./${routesDir}/${file}`,
      mountPath,
      file
    );
    if (success) loaded++;
  }
  
  console.log(`📦 Auto-loaded ${loaded}/${files.length} routes from ${routesDir}`);
  return loaded;
}
