/**
 * VIBE CODING API ROUTES
 * MB.MD SIMULTANEOUS - Integration of all vibe coding services
 * 
 * Endpoints:
 * - POST /api/vibe/edit-file - Apply unified diff to file
 * - POST /api/vibe/map-repository - Generate compact repository map
 * - POST /api/vibe/execute - Execute vibe coding request (multi-agent)
 * 
 * Created: October 23, 2025
 */

import { Router, type Request, Response } from 'express';
import { execSync } from 'child_process';
import { createDiffEditor } from '../services/fileEditing/UnifiedDiffEditor.js';
import { createSearchReplaceEditor } from '../services/fileEditing/SearchReplaceEditor.js';
import { createASTParser } from '../services/repositoryMapping/ASTParser.js';
import { createCompactRepresentation } from '../services/repositoryMapping/CompactRepresentation.js';
import { VibeGraph } from '../services/agents/VibeGraph.js';
import { storage } from '../storage.js';
import { getWebSocketService } from '../services/websocketService.js';
import { db } from '../db.js';
import { componentAttributions, codeChanges } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

/**
 * POST /api/vibe/edit-file - Apply file edits
 * 
 * Body:
 * {
 *   filePath: string,
 *   editType: 'unified_diff' | 'search_replace',
 *   diffContent?: string,  // For unified_diff
 *   searchString?: string, // For search_replace
 *   replaceString?: string // For search_replace
 * }
 */
router.post('/edit-file', async (req: any, res: Response) => {
  if (!req.user?.claims?.sub) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { filePath, editType, diffContent, searchString, replaceString, attribution } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: 'filePath is required' });
    }

    // MB.MD FIX: Remove super admin gate - enable for all authenticated users
    const user = await storage.getUserByReplitId(req.user.claims.sub);
    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    let result;

    if (editType === 'unified_diff') {
      if (!diffContent) {
        return res.status(400).json({ error: 'diffContent is required for unified_diff' });
      }

      const editor = createDiffEditor();
      result = await editor.applyUnifiedDiff(filePath, diffContent);
    } else if (editType === 'search_replace') {
      if (!searchString || replaceString === undefined) {
        return res.status(400).json({ error: 'searchString and replaceString are required' });
      }

      const editor = createSearchReplaceEditor();
      result = await editor.replaceAll(filePath, searchString, replaceString);
    } else {
      return res.status(400).json({ error: 'Invalid editType. Must be unified_diff or search_replace' });
    }

    // 🚀 STREAM B1: Emit Socket.io event for preview auto-refresh
    const wsService = getWebSocketService();
    if (wsService) {
      wsService.sendNotification(user.id, {
        type: 'code-updated',
        title: 'Code Updated',
        message: `File ${filePath} modified successfully`
      });
    }

    // 🚀 STREAM C2: Log attribution if provided
    if (attribution?.xpath && attribution?.agentName && attribution?.agentRole) {
      try {
        await db.insert(componentAttributions).values({
          xpath: attribution.xpath,
          agentName: attribution.agentName,
          agentRole: attribution.agentRole,
          contribution: attribution.contribution || `Modified ${filePath}`,
          componentPath: filePath,
          agentId: attribution.agentId || null // Optional integer agent ID
        });
        console.log('✅ [Attribution] Logged:', attribution);
      } catch (attrError) {
        console.error('⚠️ [Attribution] Failed to log (non-blocking):', attrError);
        // Don't fail the request if attribution logging fails
      }
    }

    // 🚀 TRACK B: Git commit integration (Oct 26, 2025)
    if (result.success) {
      try {
        // Stage the modified file
        execSync(`git add "${filePath}"`, { cwd: process.cwd() });
        
        // Create commit message
        const commitMsg = attribution?.contribution 
          ? `[Mr Blue] ${attribution.contribution}\n\nUser: ${user.name} (#${user.id})\nFile: ${filePath}`
          : `[Mr Blue] Modified ${filePath}\n\nUser: ${user.name} (#${user.id})`;
        
        // Commit the change
        execSync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, { cwd: process.cwd() });
        
        // Get commit hash
        const gitHash = execSync('git rev-parse HEAD', { cwd: process.cwd() }).toString().trim();
        
        console.log(`✅ [Git] Committed ${filePath} → ${gitHash.substring(0, 7)}`);
        
        // Update code_changes table if changeId provided
        if (attribution?.changeId) {
          try {
            await db.update(codeChanges)
              .set({ 
                gitCommitHash: gitHash,
                status: 'applied',
                appliedAt: new Date()
              })
              .where(eq(codeChanges.id, attribution.changeId));
            console.log(`✅ [DB] Updated code_changes record ${attribution.changeId}`);
          } catch (dbError) {
            console.error('⚠️ [DB] Failed to update code_changes (non-blocking):', dbError);
          }
        }
        
        // Add git hash to response (spread into new object)
        (result as any).gitCommitHash = gitHash;
        
      } catch (gitError) {
        console.error('⚠️ [Git] Commit failed (non-blocking):', gitError);
        // Don't fail the request if git commit fails
      }
    }

    res.json(result);
  } catch (error) {
    console.error('[Vibe] File edit error:', error);
    res.status(500).json({ error: 'Failed to edit file' });
  }
});

/**
 * POST /api/vibe/map-repository - Generate compact repository map
 * 
 * Body:
 * {
 *   directoryPath?: string,  // Default: 'server' and 'client/src'
 *   focusFiles?: string[]    // Optional: Generate focused map for specific files
 * }
 */
router.post('/map-repository', async (req: any, res: Response) => {
  if (!req.user?.claims?.sub) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { directoryPath, focusFiles } = req.body;

    // MB.MD FIX: Remove super admin gate - enable for all authenticated users
    const user = await storage.getUserByReplitId(req.user.claims.sub);
    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    const parser = createASTParser();
    const compactRep = createCompactRepresentation();

    // Parse directories
    const directories = directoryPath ? [directoryPath] : ['server', 'client/src'];
    let allFiles = [];

    for (const dir of directories) {
      const files = await parser.parseDirectory(dir);
      allFiles.push(...files);
    }

    // Generate repository map
    let repoMap;
    if (focusFiles && focusFiles.length > 0) {
      repoMap = compactRep.generateFocusedMap(allFiles, focusFiles, true);
    } else {
      repoMap = compactRep.generateRepositoryMap(allFiles);
    }

    // Return both structured data and formatted string
    res.json({
      repositoryMap: repoMap,
      formatted: compactRep.formatAsString(repoMap)
    });
  } catch (error) {
    console.error('[Vibe] Repository mapping error:', error);
    res.status(500).json({ error: 'Failed to generate repository map' });
  }
});

/**
 * POST /api/vibe/execute - Execute vibe coding request (multi-agent)
 * 
 * Body:
 * {
 *   request: string,
 *   visualEditorContext?: {
 *     selectedElement: any,
 *     previewPath: string
 *   }
 * }
 */
router.post('/execute', async (req: any, res: Response) => {
  if (!req.user?.claims?.sub) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { request, visualEditorContext } = req.body;

    if (!request) {
      return res.status(400).json({ error: 'request is required' });
    }

    // MB.MD FIX: Remove super admin gate - enable for all authenticated users
    const user = await storage.getUserByReplitId(req.user.claims.sub);
    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    // Execute multi-agent graph
    const graph = new VibeGraph(request, user, visualEditorContext);
    const result = await graph.execute();

    // 🎯 REPLIT-STYLE: Return clarification info if needed
    res.json({
      status: result.status,
      tasks: result.tasks,
      codeChanges: result.codeChanges,
      testResults: result.testResults,
      errors: result.errors,
      needsClarification: result.needsClarification,
      clarificationQuestion: result.clarificationQuestion
    });
  } catch (error) {
    console.error('[Vibe] Execution error:', error);
    res.status(500).json({ error: 'Failed to execute vibe coding request' });
  }
});

/**
 * POST /api/vibe/apply-batch - Apply all pending changes (SAVE button)
 * 
 * Body:
 * {
 *   changes: Array<{ filePath: string, diff: string, type: string }>
 * }
 */
router.post('/apply-batch', async (req: any, res: Response) => {
  if (!req.user?.claims?.sub) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { changes } = req.body;

    if (!changes || !Array.isArray(changes)) {
      return res.status(400).json({ error: 'changes array is required' });
    }

    const user = await storage.getUserByReplitId(req.user.claims.sub);
    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    console.log(`🚀 [Vibe Batch] Applying ${changes.length} change(s)...`);

    const results = [];
    const errors = [];

    // Apply each change sequentially
    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      const { filePath, diff, type } = change;

      try {
        console.log(`📝 [Batch ${i + 1}/${changes.length}] Applying ${filePath}...`);

        // Apply the diff using UnifiedDiffEditor
        const editor = createDiffEditor();
        const result = await editor.apply(filePath, diff);

        results.push({
          filePath,
          success: true,
          message: result.message
        });

      } catch (error) {
        console.error(`❌ [Batch ${i + 1}/${changes.length}] Failed:`, error);
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        
        results.push({
          filePath,
          success: false,
          error: errorMsg
        });

        errors.push(`${filePath}: ${errorMsg}`);
      }
    }

    // 🚀 TRACK B: Create single git commit for all changes
    if (results.some(r => r.success)) {
      try {
        const successfulFiles = results.filter(r => r.success).map(r => r.filePath);

        // Stage all successful files
        for (const file of successfulFiles) {
          execSync(`git add "${file}"`, { cwd: process.cwd() });
        }

        // Create batch commit message
        const commitMsg = `[Mr Blue Batch] Applied ${successfulFiles.length} vibe coding change(s)

User: ${user.name} (#${user.id})
Files: ${successfulFiles.join(', ')}`;

        // Commit
        execSync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, { cwd: process.cwd() });

        // Get commit hash
        const gitHash = execSync('git rev-parse HEAD', { cwd: process.cwd() }).toString().trim();

        console.log(`✅ [Git Batch] Committed ${successfulFiles.length} files → ${gitHash.substring(0, 7)}`);

        res.json({
          success: true,
          results,
          errors: errors.length > 0 ? errors : undefined,
          gitCommitHash: gitHash,
          summary: {
            total: changes.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
          }
        });

      } catch (gitError) {
        console.error('⚠️ [Git Batch] Commit failed:', gitError);
        res.json({
          success: true,
          results,
          errors: [...errors, 'Git commit failed (changes still applied)'],
          summary: {
            total: changes.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
          }
        });
      }
    } else {
      res.status(500).json({
        success: false,
        results,
        errors,
        summary: {
          total: changes.length,
          successful: 0,
          failed: changes.length
        }
      });
    }

  } catch (error) {
    console.error('[Vibe Batch] Error:', error);
    res.status(500).json({ error: 'Failed to apply batch' });
  }
});

/**
 * GET /api/vibe/health - Health check
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    services: {
      fileEditing: 'available',
      repositoryMapping: 'available',
      multiAgent: 'available',
      batchApply: 'available'
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
