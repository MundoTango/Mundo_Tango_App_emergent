/**
 * PAGES ROUTES - Dynamic Route Discovery API
 * MB.MD Build: Discover all pages in client/src/pages
 * Completeness Law: Real filesystem scanning, not hardcoded pages
 */

import { Router } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import { isAuthenticated } from '../replitAuth';

const router = Router();

const PAGES_DIR = 'client/src/pages';

// GET /api/pages/list - Discover all pages
router.get('/list', isAuthenticated, async (req, res) => {
  try {
    const pagesPath = path.resolve(process.cwd(), PAGES_DIR);
    const files = await fs.readdir(pagesPath);

    const pages = await Promise.all(
      files
        .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
        .map(async file => {
          const filePath = path.join(pagesPath, file);
          const stats = await fs.stat(filePath);
          const content = await fs.readFile(filePath, 'utf-8');

          // Try to extract route from filename
          const name = file.replace(/Page\.(tsx|ts)$/, '').replace(/\.(tsx|ts)$/, '');
          const route = name === 'Home' ? '/' : `/${name.toLowerCase()}`;

          // Check if page has route comment
          const routeMatch = content.match(/\/\/\s*@route\s+(.+)/);
          const actualRoute = routeMatch ? routeMatch[1].trim() : route;

          // Extract page title from component or file
          const titleMatch = content.match(/<title>([^<]+)<\/title>/) || 
                           content.match(/title:\s*['"]([^'"]+)['"]/);
          const title = titleMatch ? titleMatch[1] : name;

          return {
            name,
            title,
            path: actualRoute,
            file: `${PAGES_DIR}/${file}`,
            size: stats.size,
            modified: stats.mtime.toISOString()
          };
        })
    );

    res.json({
      success: true,
      pages: pages.sort((a, b) => a.name.localeCompare(b.name)),
      count: pages.length
    });
  } catch (error) {
    console.error('Pages list error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list pages'
    });
  }
});

// GET /api/pages/routes - Get App.tsx routes configuration
router.get('/routes', isAuthenticated, async (req, res) => {
  try {
    const appPath = path.resolve(process.cwd(), 'client/src/App.tsx');
    const content = await fs.readFile(appPath, 'utf-8');

    // Extract Route components
    const routeRegex = /<Route\s+path="([^"]+)"\s+(?:component|element)={([^}]+)}/g;
    const routes = [];
    let match;

    while ((match = routeRegex.exec(content)) !== null) {
      routes.push({
        path: match[1],
        component: match[2].replace(/[<>]/g, '').trim()
      });
    }

    res.json({
      success: true,
      routes,
      count: routes.length
    });
  } catch (error) {
    console.error('Routes extraction error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract routes'
    });
  }
});

// POST /api/pages/create - Create new page (future enhancement)
router.post('/create', isAuthenticated, async (req, res) => {
  try {
    const { name, template } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Page name is required'
      });
    }

    const fileName = `${name}Page.tsx`;
    const filePath = path.join(PAGES_DIR, fileName);

    // Check if file already exists
    try {
      await fs.access(filePath);
      return res.status(409).json({
        success: false,
        error: 'Page already exists'
      });
    } catch {
      // File doesn't exist, proceed
    }

    // Create page from template
    const pageTemplate = template || `
export default function ${name}Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">${name}</h1>
      <p>Your new page is ready!</p>
    </div>
  );
}
`.trim();

    await fs.writeFile(filePath, pageTemplate);

    res.json({
      success: true,
      message: 'Page created successfully',
      file: `${PAGES_DIR}/${fileName}`
    });
  } catch (error) {
    console.error('Page creation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create page'
    });
  }
});

export default router;
