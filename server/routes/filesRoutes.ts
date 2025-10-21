/**
 * FILES ROUTES - Real Filesystem Browser API
 * MB.MD Build: File tree, read, write operations
 * Completeness Law: Real filesystem operations, not mock data
 */

import { Router } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// Allowed directories (security: prevent access to sensitive files)
const ALLOWED_DIRS = [
  'client/src',
  'server',
  'shared',
  'docs',
  'agents',
  'scripts'
];

function isPathAllowed(filePath: string): boolean {
  const normalized = path.normalize(filePath).replace(/^\/+/, '');
  return ALLOWED_DIRS.some(dir => normalized.startsWith(dir));
}

// GET /api/files/tree - Get directory tree
router.get('/tree', isAuthenticated, async (req, res) => {
  try {
    const dirPath = (req.query.path as string) || 'client/src';

    if (!isPathAllowed(dirPath)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this directory'
      });
    }

    async function buildTree(currentPath: string, maxDepth: number = 3, currentDepth: number = 0): Promise<any> {
      if (currentDepth >= maxDepth) return null;

      const stats = await fs.stat(currentPath);
      const name = path.basename(currentPath);

      if (stats.isDirectory()) {
        const children = await fs.readdir(currentPath);
        const childNodes = await Promise.all(
          children
            .filter(child => !child.startsWith('.') && child !== 'node_modules')
            .map(child => buildTree(path.join(currentPath, child), maxDepth, currentDepth + 1))
        );

        return {
          name,
          path: currentPath,
          type: 'directory',
          children: childNodes.filter(Boolean)
        };
      } else {
        return {
          name,
          path: currentPath,
          type: 'file',
          size: stats.size,
          modified: stats.mtime.toISOString()
        };
      }
    }

    const tree = await buildTree(dirPath);

    res.json({
      success: true,
      tree
    });
  } catch (error) {
    console.error('File tree error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read directory'
    });
  }
});

// GET /api/files/read - Read file contents
router.get('/read', isAuthenticated, async (req, res) => {
  try {
    const filePath = req.query.path as string;

    if (!filePath || !isPathAllowed(filePath)) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or forbidden file path'
      });
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const stats = await fs.stat(filePath);

    res.json({
      success: true,
      content,
      size: stats.size,
      modified: stats.mtime.toISOString()
    });
  } catch (error) {
    console.error('File read error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read file'
    });
  }
});

// POST /api/files/write - Write file contents
router.post('/write', isAuthenticated, async (req, res) => {
  try {
    const { path: filePath, content } = req.body;

    if (!filePath || !isPathAllowed(filePath)) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or forbidden file path'
      });
    }

    // Create backup before writing
    try {
      const existingContent = await fs.readFile(filePath, 'utf-8');
      await fs.writeFile(`${filePath}.backup`, existingContent);
    } catch {
      // File might not exist yet, that's okay
    }

    await fs.writeFile(filePath, content, 'utf-8');

    res.json({
      success: true,
      message: 'File saved successfully'
    });
  } catch (error) {
    console.error('File write error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to write file'
    });
  }
});

// GET /api/files/recent - Get recently modified files
router.get('/recent', isAuthenticated, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const allFiles: Array<{ path: string; modified: Date; size: number }> = [];

    async function scanDir(dirPath: string) {
      if (!isPathAllowed(dirPath)) return;

      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
          if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

          const fullPath = path.join(dirPath, entry.name);

          if (entry.isDirectory()) {
            await scanDir(fullPath);
          } else {
            const stats = await fs.stat(fullPath);
            allFiles.push({
              path: fullPath,
              modified: stats.mtime,
              size: stats.size
            });
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    }

    for (const dir of ALLOWED_DIRS) {
      await scanDir(dir);
    }

    const recentFiles = allFiles
      .sort((a, b) => b.modified.getTime() - a.modified.getTime())
      .slice(0, limit)
      .map(file => ({
        path: file.path,
        modified: file.modified.toISOString(),
        size: file.size
      }));

    res.json({
      success: true,
      files: recentFiles
    });
  } catch (error) {
    console.error('Recent files error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get recent files'
    });
  }
});

export default router;
