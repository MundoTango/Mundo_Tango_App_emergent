/**
 * WEEK 2 STREAM 2: Files Tab Backend API
 * Real file tree API for Visual Editor Files Tab
 */

import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

const router = Router();

// SECURITY: Define project root - all operations constrained to this directory
const PROJECT_ROOT = process.cwd();

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  size?: number;
  extension?: string;
}

/**
 * SECURITY: Validate and sanitize file paths
 * Prevents directory traversal and absolute path attacks
 * ARCHITECT FIX: Allow absolute paths if within PROJECT_ROOT
 */
function sanitizeFilePath(userPath: string): string {
  // Normalize the path
  const normalized = path.normalize(userPath);
  
  // Resolve against project root
  const resolved = path.resolve(PROJECT_ROOT, normalized);
  
  // CRITICAL: Ensure resolved path is within project root
  if (!resolved.startsWith(PROJECT_ROOT + path.sep) && resolved !== PROJECT_ROOT) {
    throw new Error('Access denied: Path outside project root');
  }
  
  // ARCHITECT FIX: Check for directory traversal in the RESOLVED path
  // (allows absolute paths from buildFileTree, but still prevents traversal)
  const relative = path.relative(PROJECT_ROOT, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Access denied: Path traversal detected');
  }
  
  return resolved;
}

/**
 * GET /api/files/tree
 * Get complete file tree for project
 */
router.get('/tree', async (req, res) => {
  try {
    const { dir = '.' } = req.query;
    
    // SECURITY: Sanitize path before using
    const safePath = sanitizeFilePath(dir as string);
    
    const tree = await buildFileTree(safePath);
    
    res.json({
      success: true,
      data: { tree }
    });
    
  } catch (error: any) {
    console.error('[FILES API] Error:', error.message);
    res.status(403).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/files/read
 * Read file contents
 */
router.get('/read', async (req, res) => {
  try {
    const { filePath } = req.query;
    
    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'filePath is required'
      });
    }
    
    // SECURITY: Sanitize path before reading
    const safePath = sanitizeFilePath(filePath);
    
    const content = await fs.readFile(safePath, 'utf-8');
    
    res.json({
      success: true,
      data: { content }
    });
    
  } catch (error: any) {
    res.status(403).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/files/write
 * Write file contents
 */
router.post('/write', async (req, res) => {
  try {
    const { filePath, content } = req.body;
    
    if (!filePath || typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'filePath and content are required'
      });
    }
    
    // SECURITY: Sanitize path before writing
    const safePath = sanitizeFilePath(filePath);
    
    // Ensure directory exists (also sanitize parent dir)
    const safeDir = path.dirname(safePath);
    await fs.mkdir(safeDir, { recursive: true });
    
    // Write file
    await fs.writeFile(safePath, content, 'utf-8');
    
    res.json({
      success: true,
      data: { message: 'File written successfully' }
    });
    
  } catch (error: any) {
    res.status(403).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/files/create
 * Create new file or directory
 */
router.post('/create', async (req, res) => {
  try {
    const { filePath, type = 'file', content = '' } = req.body;
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'filePath is required'
      });
    }
    
    // SECURITY: Sanitize path before creating
    const safePath = sanitizeFilePath(filePath);
    
    if (type === 'directory') {
      await fs.mkdir(safePath, { recursive: true });
    } else {
      // Ensure parent directory exists
      const safeDir = path.dirname(safePath);
      await fs.mkdir(safeDir, { recursive: true });
      await fs.writeFile(safePath, content, 'utf-8');
    }
    
    res.json({
      success: true,
      data: { message: `${type} created successfully` }
    });
    
  } catch (error: any) {
    res.status(403).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/files/delete
 * Delete file or directory
 */
router.delete('/delete', async (req, res) => {
  try {
    const { filePath } = req.query;
    
    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'filePath is required'
      });
    }
    
    // SECURITY: Sanitize path before deleting
    const safePath = sanitizeFilePath(filePath);
    
    const stats = await fs.stat(safePath);
    
    if (stats.isDirectory()) {
      await fs.rm(safePath, { recursive: true });
    } else {
      await fs.unlink(safePath);
    }
    
    res.json({
      success: true,
      data: { message: 'Deleted successfully' }
    });
    
  } catch (error: any) {
    res.status(403).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Build file tree recursively
 */
async function buildFileTree(rootDir: string, maxDepth: number = 5, currentDepth: number = 0): Promise<FileNode> {
  const stats = await fs.stat(rootDir);
  const name = path.basename(rootDir);
  
  if (!stats.isDirectory()) {
    return {
      name,
      path: rootDir,
      type: 'file',
      size: stats.size,
      extension: path.extname(name)
    };
  }
  
  const node: FileNode = {
    name,
    path: rootDir,
    type: 'directory',
    children: []
  };
  
  if (currentDepth >= maxDepth) {
    return node;
  }
  
  try {
    const entries = await fs.readdir(rootDir);
    
    // Filter out node_modules, .git, dist, etc.
    const filtered = entries.filter(entry => 
      !['node_modules', '.git', 'dist', '.next', 'build', '.cache'].includes(entry)
    );
    
    for (const entry of filtered) {
      const entryPath = path.join(rootDir, entry);
      
      try {
        const childNode = await buildFileTree(entryPath, maxDepth, currentDepth + 1);
        node.children!.push(childNode);
      } catch (error) {
        // Skip files/dirs we can't access
        console.warn(`Skipping ${entryPath}:`, error);
      }
    }
    
    // Sort: directories first, then files alphabetically
    node.children!.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === 'directory' ? -1 : 1;
    });
    
  } catch (error) {
    console.warn(`Error reading directory ${rootDir}:`, error);
  }
  
  return node;
}

export default router;
