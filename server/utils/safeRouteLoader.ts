/**
 * Safe Route Loader
 * MB.MD Created: October 19, 2025
 * Prevents server crashes from phantom imports
 */

import type { Application } from 'express';
import { existsSync } from 'fs';
import { resolve } from 'path';

export interface RouteConfig {
  path: string;
  mountPath: string;
  description: string;
}

/**
 * Safely load routes with graceful failure handling
 * @param app Express application instance
 * @param routes Array of route configurations to load
 */
export async function safeLoadRoutes(app: Application, routes: RouteConfig[]): Promise<void> {
  let loaded = 0;
  let skipped = 0;

  for (const route of routes) {
    try {
      // Convert relative path to absolute
      const routePath = route.path.startsWith('../') 
        ? resolve(__dirname, route.path)
        : route.path;
      
      // Check if file exists
      const tsPath = `${routePath}.ts`;
      const jsPath = `${routePath}.js`;
      
      if (!existsSync(tsPath) && !existsSync(jsPath)) {
        console.warn(`⚠️  Skipped route: ${route.description} (file not found: ${routePath})`);
        skipped++;
        continue;
      }

      // Dynamic import
      const module = await import(route.path);
      const router = module.default;
      
      if (!router) {
        console.warn(`⚠️  Skipped route: ${route.description} (no default export)`);
        skipped++;
        continue;
      }

      app.use(route.mountPath || '/api', router);
      console.log(`✅ Loaded route: ${route.description}`);
      loaded++;
    } catch (error: any) {
      console.error(`❌ Failed to load route: ${route.description}`, error.message);
      skipped++;
    }
  }

  console.log(`📊 Route loading complete: ${loaded}/${routes.length} loaded, ${skipped} skipped`);
}
