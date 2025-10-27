/**
 * Visual Editor Save Routes
 * Backend API for persisting visual changes to files
 * MB.MD Track 2 - Universal Save System
 * ✅ FIX #2 (Oct 27): Implement real file mutations using vibe coding editors
 */

import { Router, type Request, Response } from 'express';
import { writeFile, readFile } from 'fs/promises';
import { join, normalize, relative, isAbsolute } from 'path';
import { realpathSync } from 'fs';
import { execFileSync } from 'child_process';
import { applyTextReplacementAST, deleteElementByTextAST } from '../lib/jsxParserAST.js';
import { createDiffEditor } from '../services/fileEditing/UnifiedDiffEditor.js';

const router = Router();

/**
 * ✅ SECURITY: Validate file path to prevent command injection and path traversal
 * Only allow files within the project directory
 * 
 * Security measures:
 * 1. Reject absolute paths from user input
 * 2. Resolve symlinks with realpathSync (prevent symlink escape)
 * 3. Use path.relative() to ensure file is within basePath
 * 4. Check that relative path doesn't start with '..' (escaping)
 * 5. Whitelist file extensions to prevent shell script execution
 */
function validateFilePath(filePath: string): string {
  const basePath = process.cwd();
  
  // 1. Reject absolute paths from user input (prevent /etc/passwd attacks)
  if (isAbsolute(filePath)) {
    throw new Error('Absolute paths not allowed');
  }
  
  // 2. Normalize and join with base
  const normalizedPath = normalize(join(basePath, filePath));
  
  // 3. Resolve the real base path (dereference symlinks)
  let resolvedBase: string;
  try {
    resolvedBase = realpathSync(basePath);
  } catch (error) {
    throw new Error('Failed to resolve base directory');
  }
  
  // 4. Resolve the target path (dereference symlinks)
  // Note: File may not exist yet (new file creation), so we only check if it exists
  let resolvedTarget: string;
  try {
    resolvedTarget = realpathSync(normalizedPath);
  } catch (error) {
    // File doesn't exist yet - validate the normalized path instead
    // Still check parent directory exists and is within base
    const parentDir = join(normalizedPath, '..');
    try {
      const resolvedParent = realpathSync(parentDir);
      const relativeParent = relative(resolvedBase, resolvedParent);
      
      if (relativeParent.startsWith('..') || isAbsolute(relativeParent)) {
        throw new Error('Invalid file path: parent directory outside project');
      }
    } catch (parentError) {
      throw new Error('Invalid file path: parent directory not accessible');
    }
    
    // Use normalized path for non-existent files
    resolvedTarget = normalizedPath;
  }
  
  // 5. Get relative path from resolved base to resolved target
  const relativePath = relative(resolvedBase, resolvedTarget);
  
  // 6. Ensure the relative path doesn't escape (no '..' at start, no absolute result)
  if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
    throw new Error('Invalid file path: outside project directory');
  }
  
  // 7. Whitelist file extensions (prevent shell script execution)
  const allowedExtensions = ['.tsx', '.ts', '.jsx', '.js', '.css', '.json', '.html', '.md'];
  const hasAllowedExtension = allowedExtensions.some(ext => resolvedTarget.endsWith(ext));
  
  if (!hasAllowedExtension) {
    throw new Error('Invalid file type: only TypeScript, JavaScript, CSS, HTML, and Markdown files allowed');
  }
  
  return resolvedTarget;
}

/**
 * POST /api/visual-editor/apply-styles
 * Apply style changes to actual component files
 */
router.post('/apply-styles', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { mutations } = req.body;

    if (!mutations || !Array.isArray(mutations)) {
      return res.status(400).json({ error: 'Mutations array required' });
    }

    console.log('[VisualEditor] Applying style changes:', mutations.length);

    // ✅ FIX #2 (Oct 27): Implement real file mutations using AST parser
    // ✅ SECURITY FIX (Oct 27): Validate paths and use execFileSync to prevent command injection
    // ✅ HTTP STATUS FIX (Oct 27): Return 400/403 for validation errors instead of 200
    const results = [];
    let hasValidationError = false;
    
    for (const mutation of mutations) {
      const { filePath, oldValue, newValue } = mutation;
      
      try {
        // Validate file path for security
        const validatedPath = validateFilePath(filePath);
        
        // Use AST-based text replacement for Tailwind class changes
        const success = await applyTextReplacementAST(validatedPath, oldValue, newValue);
        
        if (success) {
          // Stage the file for git (using execFileSync with args array - secure)
          execFileSync('git', ['add', validatedPath], { cwd: process.cwd() });
          results.push({ filePath, success: true });
        } else {
          results.push({ filePath, success: false, error: 'Text not found' });
        }
      } catch (error) {
        console.error(`[VisualEditor] Failed to apply style to ${filePath}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Check if this is a security validation error
        if (errorMessage.includes('Invalid file') || errorMessage.includes('not allowed')) {
          hasValidationError = true;
        }
        
        results.push({ 
          filePath, 
          success: false, 
          error: errorMessage
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    // If all mutations failed due to validation errors, return 403
    if (hasValidationError && successCount === 0) {
      return res.status(403).json({
        error: 'Invalid file paths detected',
        message: 'One or more file paths failed security validation',
        results
      });
    }

    res.json({ 
      success: successCount > 0, 
      message: `Applied ${successCount}/${mutations.length} style changes`,
      results
    });
  } catch (error) {
    console.error('[VisualEditor] Error applying styles:', error);
    res.status(500).json({ error: 'Failed to apply styles' });
  }
});

/**
 * POST /api/visual-editor/apply-content
 * Apply content/text changes to files
 */
router.post('/apply-content', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { changes } = req.body;

    if (!changes || !Array.isArray(changes)) {
      return res.status(400).json({ error: 'Changes array required' });
    }

    console.log('[VisualEditor] Applying content changes:', changes.length);

    // ✅ FIX #2 (Oct 27): Implement real content changes using AST parser
    // ✅ SECURITY FIX (Oct 27): Validate paths and use execFileSync to prevent command injection
    // ✅ HTTP STATUS FIX (Oct 27): Return 400/403 for validation errors instead of 200
    const results = [];
    let hasValidationError = false;
    
    for (const change of changes) {
      const { filePath, oldText, newText } = change;
      
      try {
        // Validate file path for security
        const validatedPath = validateFilePath(filePath);
        
        const success = await applyTextReplacementAST(validatedPath, oldText, newText);
        
        if (success) {
          execFileSync('git', ['add', validatedPath], { cwd: process.cwd() });
          results.push({ filePath, success: true });
        } else {
          results.push({ filePath, success: false, error: 'Text not found' });
        }
      } catch (error) {
        console.error(`[VisualEditor] Failed to apply content to ${filePath}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Check if this is a security validation error
        if (errorMessage.includes('Invalid file') || errorMessage.includes('not allowed')) {
          hasValidationError = true;
        }
        
        results.push({ 
          filePath, 
          success: false, 
          error: errorMessage
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    // If all changes failed due to validation errors, return 403
    if (hasValidationError && successCount === 0) {
      return res.status(403).json({
        error: 'Invalid file paths detected',
        message: 'One or more file paths failed security validation',
        results
      });
    }

    res.json({ 
      success: successCount > 0, 
      message: `Applied ${successCount}/${changes.length} content changes`,
      results
    });
  } catch (error) {
    console.error('[VisualEditor] Error applying content:', error);
    res.status(500).json({ error: 'Failed to apply content' });
  }
});

/**
 * POST /api/visual-editor/apply-structure
 * Apply structural changes (add/delete elements) via AI
 */
router.post('/apply-structure', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { changes } = req.body;

    if (!changes || !Array.isArray(changes)) {
      return res.status(400).json({ error: 'Changes array required' });
    }

    console.log('[VisualEditor] Applying structure changes:', changes.length);

    // ✅ FIX #2 (Oct 27): Implement structural changes (deletions via AST)
    // ✅ SECURITY FIX (Oct 27): Validate paths and use execFileSync to prevent command injection
    // ✅ HTTP STATUS FIX (Oct 27): Return 400/403 for validation errors instead of 200
    const results = [];
    let hasValidationError = false;
    
    for (const change of changes) {
      const { filePath, operation, elementText } = change;
      
      try {
        if (operation === 'delete' && elementText) {
          // Validate file path for security
          const validatedPath = validateFilePath(filePath);
          
          const success = await deleteElementByTextAST(validatedPath, elementText);
          
          if (success) {
            execFileSync('git', ['add', validatedPath], { cwd: process.cwd() });
            results.push({ filePath, operation, success: true });
          } else {
            results.push({ filePath, operation, success: false, error: 'Element not found' });
          }
        } else {
          // For other operations (add), we'd need AI code generation
          results.push({ 
            filePath, 
            operation, 
            success: false, 
            error: 'Only delete operations supported via AST' 
          });
        }
      } catch (error) {
        console.error(`[VisualEditor] Failed to apply structure change to ${filePath}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Check if this is a security validation error
        if (errorMessage.includes('Invalid file') || errorMessage.includes('not allowed')) {
          hasValidationError = true;
        }
        
        results.push({ 
          filePath, 
          operation,
          success: false, 
          error: errorMessage
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    // If all changes failed due to validation errors, return 403
    if (hasValidationError && successCount === 0) {
      return res.status(403).json({
        error: 'Invalid file paths detected',
        message: 'One or more file paths failed security validation',
        results
      });
    }

    res.json({ 
      success: successCount > 0, 
      message: `Applied ${successCount}/${changes.length} structure changes`,
      results
    });
  } catch (error) {
    console.error('[VisualEditor] Error applying structure:', error);
    res.status(500).json({ error: 'Failed to apply structure' });
  }
});

/**
 * POST /api/visual-editor/save
 * Universal Save - Save all changes at once
 * ✅ FIX #3 (Oct 27): Implement real file I/O using unified diff editor
 */
router.post('/save', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { changes, page, savedAt } = req.body;

    if (!changes || !Array.isArray(changes)) {
      return res.status(400).json({ error: 'Changes array required' });
    }

    console.log(`[VisualEditor] Universal Save: ${changes.length} changes for page ${page}`);
    
    // Group changes by type
    const grouped = {
      style: changes.filter((c: any) => c.changeType === 'style'),
      content: changes.filter((c: any) => c.changeType === 'content'),
      layout: changes.filter((c: any) => c.changeType === 'layout'),
      delete: changes.filter((c: any) => c.changeType === 'delete'),
      diff: changes.filter((c: any) => c.changeType === 'diff' || c.type === 'unified_diff')
    };

    console.log('[VisualEditor] Changes breakdown:', {
      style: grouped.style.length,
      content: grouped.content.length,
      layout: grouped.layout.length,
      delete: grouped.delete.length,
      diff: grouped.diff.length
    });

    // ✅ FIX #3 (Oct 27): Apply all changes using existing endpoints logic
    const results = [];
    let hasValidationError = false;
    let totalSuccess = 0;
    
    // Apply style changes
    for (const change of grouped.style) {
      try {
        const validatedPath = validateFilePath(change.filePath);
        const success = await applyTextReplacementAST(
          validatedPath, 
          change.oldValue, 
          change.newValue
        );
        
        if (success) {
          execFileSync('git', ['add', validatedPath], { cwd: process.cwd() });
          results.push({ filePath: change.filePath, changeType: 'style', success: true });
          totalSuccess++;
        } else {
          results.push({ filePath: change.filePath, changeType: 'style', success: false, error: 'Text not found' });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('Invalid file') || errorMessage.includes('not allowed')) {
          hasValidationError = true;
        }
        results.push({ 
          filePath: change.filePath, 
          changeType: 'style',
          success: false, 
          error: errorMessage
        });
      }
    }
    
    // Apply content changes
    for (const change of grouped.content) {
      try {
        const validatedPath = validateFilePath(change.filePath);
        const success = await applyTextReplacementAST(
          validatedPath, 
          change.oldText, 
          change.newText
        );
        
        if (success) {
          execFileSync('git', ['add', validatedPath], { cwd: process.cwd() });
          results.push({ filePath: change.filePath, changeType: 'content', success: true });
          totalSuccess++;
        } else {
          results.push({ filePath: change.filePath, changeType: 'content', success: false, error: 'Text not found' });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('Invalid file') || errorMessage.includes('not allowed')) {
          hasValidationError = true;
        }
        results.push({ 
          filePath: change.filePath, 
          changeType: 'content',
          success: false, 
          error: errorMessage
        });
      }
    }
    
    // Apply delete changes
    for (const change of grouped.delete) {
      try {
        const validatedPath = validateFilePath(change.filePath);
        const success = await deleteElementByTextAST(
          validatedPath, 
          change.elementText
        );
        
        if (success) {
          execFileSync('git', ['add', validatedPath], { cwd: process.cwd() });
          results.push({ filePath: change.filePath, changeType: 'delete', success: true });
          totalSuccess++;
        } else {
          results.push({ filePath: change.filePath, changeType: 'delete', success: false, error: 'Element not found' });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('Invalid file') || errorMessage.includes('not allowed')) {
          hasValidationError = true;
        }
        results.push({ 
          filePath: change.filePath, 
          changeType: 'delete',
          success: false, 
          error: errorMessage
        });
      }
    }
    
    // Apply unified diff changes
    for (const change of grouped.diff) {
      try {
        const validatedPath = validateFilePath(change.filePath);
        const editor = createDiffEditor();
        const result = await editor.applyUnifiedDiff(validatedPath, change.diff);
        
        if (result.success) {
          execFileSync('git', ['add', validatedPath], { cwd: process.cwd() });
          results.push({ filePath: change.filePath, changeType: 'diff', success: true });
          totalSuccess++;
        } else {
          results.push({ filePath: change.filePath, changeType: 'diff', success: false, error: result.error });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('Invalid file') || errorMessage.includes('not allowed')) {
          hasValidationError = true;
        }
        results.push({ 
          filePath: change.filePath, 
          changeType: 'diff',
          success: false, 
          error: errorMessage
        });
      }
    }
    
    // If all changes failed due to validation errors, return 403
    if (hasValidationError && totalSuccess === 0) {
      return res.status(403).json({
        error: 'Invalid file paths detected',
        message: 'One or more file paths failed security validation',
        results
      });
    }
    
    console.log(`[VisualEditor] ✅ Universal Save complete: ${totalSuccess}/${changes.length} changes applied`);
    
    res.json({ 
      success: totalSuccess > 0, 
      message: `Saved ${totalSuccess}/${changes.length} changes successfully`,
      savedAt,
      breakdown: {
        style: grouped.style.length,
        content: grouped.content.length,
        layout: grouped.layout.length,
        delete: grouped.delete.length,
        diff: grouped.diff.length
      },
      results
    });
  } catch (error) {
    console.error('[VisualEditor] Error saving changes:', error);
    res.status(500).json({ error: 'Failed to save changes' });
  }
});

export default router;
