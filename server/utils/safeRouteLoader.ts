/**
 * Safe Route Loader
 * MB.MD Fixed: October 19, 2025
 * Prevents server crashes from missing route files
 */

import type { Express } from 'express';
import type { Server } from 'socket.io';

interface RouteConfig {
  path: string;
  mountPath?: string;
  description?: string;
  io?: Server;
}

interface RouteModule {
  default?: (app: Express, io?: Server) => void;
  registerRoutes?: (app: Express, io?: Server) => void;
}

/**
 * Safely loads route modules with graceful failure handling
 * @param app - Express application instance
 * @param routeConfigs - Array of route configurations to load
 */
export async function safeLoadRoutes(
  app: Express,
  routeConfigs: RouteConfig[]
): Promise<void> {
  const results = {
    loaded: 0,
    skipped: 0,
    errors: [] as string[]
  };

  for (const config of routeConfigs) {
    try {
      const module = await import(config.path) as RouteModule;
      
      if (module.default) {
        module.default(app, config.io);
        console.log(`✅ Loaded route: ${config.description || config.path}`);
        results.loaded++;
      } else if (module.registerRoutes) {
        module.registerRoutes(app, config.io);
        console.log(`✅ Loaded route: ${config.description || config.path}`);
        results.loaded++;
      } else {
        console.warn(`⚠️  Skipped route: ${config.description || config.path} (no default export)`);
        results.skipped++;
      }
    } catch (error) {
      console.warn(`⚠️  Skipped route: ${config.description || config.path} (file not found: ${config.path})`);
      results.skipped++;
    }
  }

  console.log(`📊 Route loading complete: ${results.loaded}/${routeConfigs.length} loaded, ${results.skipped} skipped`);
}
