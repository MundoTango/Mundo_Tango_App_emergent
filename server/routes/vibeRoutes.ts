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
// ✅ FIX #5: Use AST-based parser instead of regex
import { applyTextReplacementAST, deleteElementByTextAST } from '../lib/jsxParserAST.js';

const router = Router();

// ✅ FIX #4 (Oct 27): Backend idempotency cache to prevent duplicate executions
// Tracks recent requests by hash to deduplicate identical concurrent requests
const requestCache = new Map<string, { promise: Promise<any>; timestamp: number }>();
const CACHE_TTL = 10000; // 10 seconds

// Cleanup expired cache entries every 30 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      requestCache.delete(key);
    }
  }
}, 30000);

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

    // ✅ SECURITY: Validate user BEFORE checking cache (prevents authorization bypass)
    const user = await storage.getUserByReplitId(req.user.claims.sub);
    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    // ✅ FIX #4: Deduplicate identical concurrent requests (per-user)
    // Generate cache key with FULL content hash to prevent collisions
    const contentHash = diffContent 
      ? `diff:${diffContent}` 
      : `search:${searchString}:${replaceString}`;
    const cacheKey = `edit-file:${user.id}:${filePath}:${editType}:${contentHash}`;
    const cached = requestCache.get(cacheKey);
    
    if (cached) {
      console.log(`⏭️ [Vibe] Deduplicating edit-file request for ${filePath} (user ${user.id})`);
      const result = await cached.promise;
      return res.json(result);
    }

    // ✅ FIX #4: Wrap execution in promise and cache it
    const executionPromise = (async () => {
      let result;

      if (editType === 'unified_diff') {
        if (!diffContent) {
          throw new Error('diffContent is required for unified_diff');
        }

        const editor = createDiffEditor();
        result = await editor.applyUnifiedDiff(filePath, diffContent);
      } else if (editType === 'search_replace') {
        if (!searchString || replaceString === undefined) {
          throw new Error('searchString and replaceString are required');
        }

        const editor = createSearchReplaceEditor();
        result = await editor.replaceAll(filePath, searchString, replaceString);
      } else {
        throw new Error('Invalid editType. Must be unified_diff or search_replace');
      }
      
      return result;
    })();
    
    // Cache the execution promise
    requestCache.set(cacheKey, { promise: executionPromise, timestamp: Date.now() });
    
    const result = await executionPromise;

    // 🚀 STREAM B1: Emit Socket.io event for preview auto-refresh (ONLY if successful)
    const wsService = getWebSocketService();
    if (wsService && result.success) {
      wsService.sendNotification(user.id, {
        type: 'code-updated',
        title: 'Code Updated',
        message: `File ${filePath} modified successfully`
      });
    } else if (!result.success) {
      console.error(`❌ [Vibe] Failed to apply edit to ${filePath}:`, result.error);
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
        // Configure Git identity if not set (prevents "Author identity unknown" errors)
        try {
          execSync('git config user.name || git config user.name "Mr Blue AI"', { cwd: process.cwd(), shell: '/bin/bash' });
          execSync('git config user.email || git config user.email "mrblue@mundotango.life"', { cwd: process.cwd(), shell: '/bin/bash' });
        } catch (configError) {
          // If config check fails, force set it
          execSync('git config user.name "Mr Blue AI"', { cwd: process.cwd() });
          execSync('git config user.email "mrblue@mundotango.life"', { cwd: process.cwd() });
        }
        
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
  // ⏰ CRITICAL: Increase timeout for multi-agent execution (30s → 90s)
  // VibeGraph (Manager → Editor → Verifier → Tester) takes 25-40 seconds
  req.setTimeout(90000); // 90 seconds

  if (!req.user?.claims?.sub) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // 🎯 EXECUTION MODE (Oct 28, 2025): Support planning/building modes
    const { request, visualEditorContext, executionMode = 'build' } = req.body;

    if (!request) {
      return res.status(400).json({ error: 'request is required' });
    }

    // ✅ SECURITY: Validate user BEFORE checking cache (prevents authorization bypass)
    const user = await storage.getUserByReplitId(req.user.claims.sub);
    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    // 🎯 PLAN MODE (Oct 28, 2025): Use REAL Gemini AI for clarification questions
    if (executionMode === 'plan') {
      console.log(`📋 [Vibe Plan] Using Gemini AI to analyze request: "${request.substring(0, 50)}..."`);
      
      const { VibeCodeEngine } = await import('../services/gemini/VibeCodeEngine.js');
      const geminiEngine = new VibeCodeEngine();
      
      const result = await geminiEngine.generateClarifications({
        userRequest: request,
        visualEditorContext,
        executionMode: 'plan'
      });
      
      console.log(`🤖 [Vibe Plan] Gemini decision: needsClarification=${result.needsClarification}, model=${result.modelUsed}, cost=$${result.costEstimate}`);
      
      return res.json({
        status: result.needsClarification ? 'needs_clarification' : 'ready',
        clarificationQuestion: result.clarificationQuestion,
        codeChanges: [],
        tasks: [],
        testResults: null,
        errors: [],
        aiMetadata: {
          modelUsed: result.modelUsed,
          costEstimate: result.costEstimate,
          reasoning: result.reasoning
        }
      });
    }

    // 🚀 BUILD MODE (Oct 28, 2025): Execute immediately
    console.log(`🚀 [Vibe Build] Executing immediately: "${request.substring(0, 50)}..."`);

    // ✅ FIX #4: Deduplicate identical concurrent execute requests (per-user)
    const elementXPath = visualEditorContext?.selectedElement?.xpath || 'no-element';
    const previewPath = visualEditorContext?.previewPath || '/';
    const cacheKey = `execute:${user.id}:${request.trim()}:${elementXPath}:${previewPath}`;
    const cached = requestCache.get(cacheKey);
    
    if (cached) {
      console.log(`⏭️ [Vibe] Deduplicating execute request for user ${user.id}: "${request.substring(0, 50)}..."`);
      const result = await cached.promise;
      
      // ✅ FIX: Check if response already sent (prevents "headers already sent" crash)
      if (!res.headersSent) {
        return res.json({
          status: result.status,
          tasks: result.tasks,
          codeChanges: result.codeChanges,
          testResults: result.testResults,
          errors: result.errors,
          needsClarification: result.needsClarification,
          clarificationQuestion: result.clarificationQuestion
        });
      }
      return;
    }

    // Execute multi-agent graph (wrapped in promise for caching)
    const executionPromise = (async () => {
      const graph = new VibeGraph(request, user, visualEditorContext);
      return await graph.execute();
    })();
    
    // Cache the execution promise
    requestCache.set(cacheKey, { promise: executionPromise, timestamp: Date.now() });
    
    const result = await executionPromise;

    // ✅ FIX: Check if response already sent (prevents "headers already sent" crash)
    if (!res.headersSent) {
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
    } else {
      console.warn('⚠️  [Vibe] Response already sent (timeout?), skipping JSON response');
    }
  } catch (error) {
    console.error('[Vibe] Execution error:', error);
    // ✅ FIX: Check if response already sent
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to execute vibe coding request' });
    }
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

        let result;

        // ✅ FIX #5: Check if this is an edit instruction (from manual edits)
        if (diff.startsWith('EDIT_INSTRUCTION:')) {
          const instructionJson = diff.replace('EDIT_INSTRUCTION: ', '');
          const instruction = JSON.parse(instructionJson);

          console.log(`🔧 [Batch] Processing edit instruction (AST-based):`, instruction.operation);

          if (instruction.operation === 'replace_text') {
            // ✅ Use AST-based parser for proper JSX text replacement
            const success = await applyTextReplacementAST(
              filePath,
              instruction.searchText,
              instruction.replaceWith
            );

            result = {
              success,
              error: success ? undefined : 'Text not found in file'
            };

          } else if (instruction.operation === 'delete_element') {
            // ✅ Use AST-based parser for proper JSX element deletion
            const success = await deleteElementByTextAST(
              filePath,
              instruction.searchText
            );

            result = {
              success,
              error: success ? undefined : 'Element not found in file'
            };

          } else {
            throw new Error(`Unknown edit instruction: ${instruction.operation}`);
          }

        } else {
          // Apply the diff using UnifiedDiffEditor (for AI-generated diffs)
          const editor = createDiffEditor();
          result = await editor.applyUnifiedDiff(filePath, diff);
        }

        // Check if apply was actually successful
        if (result.success) {
          results.push({
            filePath,
            success: true,
            message: `Applied to ${filePath}`
          });
        } else {
          throw new Error(result.error || 'Apply failed');
        }

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
