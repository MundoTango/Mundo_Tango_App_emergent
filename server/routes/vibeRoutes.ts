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
import { createDiffEditor } from '../services/fileEditing/UnifiedDiffEditor.js';
import { createSearchReplaceEditor } from '../services/fileEditing/SearchReplaceEditor.js';
import { createASTParser } from '../services/repositoryMapping/ASTParser.js';
import { createCompactRepresentation } from '../services/repositoryMapping/CompactRepresentation.js';
import { VibeGraph } from '../services/agents/VibeGraph.js';
import { storage } from '../storage.js';

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
    const { filePath, editType, diffContent, searchString, replaceString } = req.body;

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

    res.json({
      status: result.status,
      tasks: result.tasks,
      codeChanges: result.codeChanges,
      testResults: result.testResults,
      errors: result.errors
    });
  } catch (error) {
    console.error('[Vibe] Execution error:', error);
    res.status(500).json({ error: 'Failed to execute vibe coding request' });
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
      multiAgent: 'available'
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
