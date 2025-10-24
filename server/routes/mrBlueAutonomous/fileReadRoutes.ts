import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { sanitizeFilePath } from './securityUtils.js';

const router = Router();

// Supported file extensions for syntax highlighting
const LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.json': 'json',
  '.css': 'css',
  '.html': 'html',
  '.md': 'markdown',
  '.sql': 'sql',
  '.sh': 'bash',
  '.yml': 'yaml',
  '.yaml': 'yaml'
};

/**
 * POST /api/mrblue/read-file
 * Read file contents with metadata
 */
router.post('/read-file', async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'filePath is required and must be a string'
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📖 [MR BLUE - FILE READ]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📁 File Path:', filePath);

    // Security: Sanitize and validate path (prevents path traversal)
    const fullPath = sanitizeFilePath(filePath);
    console.log('🔒 Validated Path:', fullPath);

    // Check if file exists
    const stats = await fs.stat(fullPath);
    
    if (!stats.isFile()) {
      return res.status(400).json({
        success: false,
        error: 'Path is not a file'
      });
    }

    // Read file content
    const content = await fs.readFile(fullPath, 'utf-8');
    const ext = path.extname(fullPath);
    const language = LANGUAGE_MAP[ext] || 'plaintext';

    console.log('✅ File read successfully');
    console.log('📊 Stats:', {
      size: stats.size,
      lines: content.split('\n').length,
      language
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    res.json({
      success: true,
      data: {
        content,
        metadata: {
          path: filePath,
          language,
          size: stats.size,
          lines: content.split('\n').length,
          lastModified: stats.mtime
        }
      }
    });

  } catch (error: any) {
    console.error('❌ [FILE READ ERROR]:', error.message);
    
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
