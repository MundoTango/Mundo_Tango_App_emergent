/**
 * WEEK 2 STREAM 2: Files Tab Backend API
 * Real file tree API for Visual Editor Files Tab
 */

import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

const router = Router();

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  size?: number;
  extension?: string;
}

/**
 * GET /api/files/tree
 * Get complete file tree for project
 */
router.get('/tree', async (req, res) => {
  try {
    const { dir = '.' } = req.query;
    
    const tree = await buildFileTree(dir as string);
    
    res.json({
      success: true,
      data: { tree }
    });
    
  } catch (error: any) {
    console.error('[FILES API] Error:', error.message);
    res.status(500).json({
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
    
    // Security: Prevent directory traversal
    const normalizedPath = path.normalize(filePath);
    if (normalizedPath.includes('..')) {
      return res.status(403).json({
        success: false,
        error: 'Invalid file path'
      });
    }
    
    const content = await fs.readFile(filePath, 'utf-8');
    
    res.json({
      success: true,
      data: { content }
    });
    
  } catch (error: any) {
    res.status(500).json({
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
    
    // Security: Prevent directory traversal
    const normalizedPath = path.normalize(filePath);
    if (normalizedPath.includes('..')) {
      return res.status(403).json({
        success: false,
        error: 'Invalid file path'
      });
    }
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    // Write file
    await fs.writeFile(filePath, content, 'utf-8');
    
    res.json({
      success: true,
      data: { message: 'File written successfully' }
    });
    
  } catch (error: any) {
    res.status(500).json({
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
    
    // Security: Prevent directory traversal
    const normalizedPath = path.normalize(filePath);
    if (normalizedPath.includes('..')) {
      return res.status(403).json({
        success: false,
        error: 'Invalid file path'
      });
    }
    
    if (type === 'directory') {
      await fs.mkdir(filePath, { recursive: true });
    } else {
      // Ensure parent directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content, 'utf-8');
    }
    
    res.json({
      success: true,
      data: { message: `${type} created successfully` }
    });
    
  } catch (error: any) {
    res.status(500).json({
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
    
    // Security: Prevent directory traversal
    const normalizedPath = path.normalize(filePath);
    if (normalizedPath.includes('..')) {
      return res.status(403).json({
        success: false,
        error: 'Invalid file path'
      });
    }
    
    const stats = await fs.stat(filePath);
    
    if (stats.isDirectory()) {
      await fs.rm(filePath, { recursive: true });
    } else {
      await fs.unlink(filePath);
    }
    
    res.json({
      success: true,
      data: { message: 'Deleted successfully' }
    });
    
  } catch (error: any) {
    res.status(500).json({
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
