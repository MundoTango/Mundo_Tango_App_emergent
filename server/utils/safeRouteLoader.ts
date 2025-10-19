/**
 * Safe Route Loader - Prevents server crashes from phantom imports
 * Created: Oct 19, 2025
 * 
 * This utility provides graceful failure for missing route files instead of
 * crashing the entire server. Part of the File Integrity System.
 * 
 * Usage:
 *   import { safeLoadRoute } from './utils/safeRouteLoader';
 *   const myRoutes = safeLoadRoute('./routes/myRoutes', 'myRoutes');
 */

import { Router } from 'express';
import { existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Safely loads a route module, returning a dummy router if file doesn't exist
 */
export function safeLoadRoute(modulePath: string, routeName: string): Router {
  const router = Router();
  
  try {
    // Check if file exists first
    const absolutePath = resolve(__dirname, '..', modulePath + '.ts');
    const jsPath = resolve(__dirname, '..', modulePath + '.js');
    
    if (!existsSync(absolutePath) && !existsSync(jsPath)) {
      console.warn(`⚠️  [SafeLoader] Route file not found: ${modulePath}`);
      console.warn(`   Creating placeholder router for ${routeName}`);
      
      // Return empty router that logs attempts to use it
      router.use('*', (req, res) => {
        res.status(503).json({
          error: 'Route temporarily unavailable',
          message: `The ${routeName} routes are not yet implemented`,
          path: req.path
        });
      });
      
      return router;
    }
    
    // File exists, try to load it
    const module = require(modulePath);
    
    // Handle different export patterns
    if (module.default) {
      return module.default;
    } else if (module.router) {
      return module.router;
    } else if (typeof module === 'function') {
      return module();
    } else {
      console.warn(`⚠️  [SafeLoader] ${routeName} exported in unexpected format`);
      return module;
    }
    
  } catch (error: any) {
    console.error(`❌ [SafeLoader] Failed to load ${routeName}:`, error.message);
    console.error(`   Stack: ${error.stack?.split('\n')[0]}`);
    
    // Return error-handling router
    router.use('*', (req, res) => {
      res.status(503).json({
        error: 'Route loading failed',
        message: `The ${routeName} routes failed to load: ${error.message}`,
        path: req.path
      });
    });
    
    return router;
  }
}

/**
 * Safely loads multiple routes in parallel
 */
export function safeLoadRoutes(routes: Array<{ path: string; name: string }>): Record<string, Router> {
  const loadedRoutes: Record<string, Router> = {};
  
  for (const route of routes) {
    loadedRoutes[route.name] = safeLoadRoute(route.path, route.name);
  }
  
  return loadedRoutes;
}

/**
 * Check if a route file exists without trying to load it
 */
export function routeExists(modulePath: string): boolean {
  const absolutePath = resolve(__dirname, '..', modulePath + '.ts');
  const jsPath = resolve(__dirname, '..', modulePath + '.js');
  return existsSync(absolutePath) || existsSync(jsPath);
}
