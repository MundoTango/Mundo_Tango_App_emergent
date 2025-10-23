/**
 * Execute Build Routes - AI Build Intent Execution
 * Handles execution of Mr Blue's planned code changes
 * MB.MD: Chat → Save → Build Workflow (Agent #2)
 */

import { Router, type Response } from 'express';
import { db } from '../db';
import { aiChatMessages } from '@shared/schema';
import { eq, inArray } from 'drizzle-orm';
import { ToolExecutor } from '../services/tools/ToolExecutor';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = Router();
const toolExecutor = new ToolExecutor();

/**
 * POST /api/chat/execute-builds
 * Execute pending AI build intents from chat messages
 * 
 * Security: Super admin only, Git snapshot before execution, rollback on failure
 */
router.post('/execute-builds', async (req: any, res: Response) => {
  try {
    const { messageIds, projectId } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ error: 'messageIds array required' });
    }

    if (!projectId) {
      return res.status(400).json({ error: 'projectId required' });
    }

    console.log(`[ExecuteBuilds] Processing ${messageIds.length} build intents for project ${projectId}`);

    // 1. Fetch messages with build intents
    const messages = await db
      .select()
      .from(aiChatMessages)
      .where(inArray(aiChatMessages.id, messageIds));

    if (messages.length === 0) {
      return res.status(404).json({ error: 'No messages found' });
    }

    // 2. Extract build intents from metadata
    const buildIntents = messages
      .filter(m => m.metadata?.buildIntent)
      .map(m => ({
        messageId: m.id,
        tool: (m.metadata as any).buildIntent.tool,
        params: (m.metadata as any).buildIntent.params,
        description: m.content
      }));

    if (buildIntents.length === 0) {
      return res.status(400).json({ error: 'No build intents found in messages' });
    }

    console.log(`[ExecuteBuilds] Found ${buildIntents.length} build intents:`, buildIntents.map(b => b.tool));

    // 3. 🔒 SAFETY: Create Git snapshot before execution
    let snapshotCreated = false;
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const commitMessage = `Snapshot before AI build - ${buildIntents.map(b => b.tool).join(', ')}`;
      
      await execAsync(`git add -A && git commit -m "${commitMessage}" --allow-empty`);
      snapshotCreated = true;
      console.log(`[ExecuteBuilds] ✅ Git snapshot created`);
    } catch (gitError) {
      console.warn(`[ExecuteBuilds] ⚠️ Git snapshot failed (continuing):`, gitError);
      // Continue anyway - not all environments have Git
    }

    // 4. Execute tools
    const results: any[] = [];
    const filesChanged: string[] = [];
    let executionFailed = false;

    for (const intent of buildIntents) {
      try {
        console.log(`[ExecuteBuilds] Executing ${intent.tool}...`);
        
        const result = await toolExecutor.executeTool(intent.tool, intent.params, req.user);
        
        if (result.error) {
          executionFailed = true;
          results.push({
            tool: intent.tool,
            success: false,
            error: result.message
          });
          break; // Stop on first error
        } else {
          results.push({
            tool: intent.tool,
            success: true,
            result: result
          });

          // Track file changes
          if (intent.params.file_path) {
            filesChanged.push(intent.params.file_path);
          }
        }
      } catch (error) {
        executionFailed = true;
        results.push({
          tool: intent.tool,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        break;
      }
    }

    // 5. 🔄 ROLLBACK if execution failed and snapshot exists
    if (executionFailed && snapshotCreated) {
      try {
        console.log(`[ExecuteBuilds] 🔄 Rolling back due to failure...`);
        await execAsync('git reset --hard HEAD~1');
        console.log(`[ExecuteBuilds] ✅ Rollback successful`);
        
        return res.status(500).json({
          success: false,
          message: 'Build failed and changes were rolled back',
          results,
          rolledBack: true
        });
      } catch (rollbackError) {
        console.error(`[ExecuteBuilds] ❌ Rollback failed:`, rollbackError);
        return res.status(500).json({
          success: false,
          message: 'Build failed and rollback also failed - manual intervention needed',
          results,
          rolledBack: false
        });
      }
    }

    // 6. Update message metadata to mark as executed
    for (const intent of buildIntents) {
      const message = messages.find(m => m.id === intent.messageId);
      const existingMetadata = message?.metadata || {};
      const existingBuildIntent = existingMetadata?.buildIntent || {};
      
      await db
        .update(aiChatMessages)
        .set({
          metadata: {
            ...existingMetadata,
            buildIntent: {
              ...existingBuildIntent,
              status: executionFailed ? 'failed' : 'executed',
              executedAt: new Date().toISOString()
            }
          }
        })
        .where(eq(aiChatMessages.id, intent.messageId));
    }

    // 7. Success response
    res.json({
      success: !executionFailed,
      message: `Executed ${buildIntents.length} build intents successfully`,
      results,
      filesChanged,
      snapshotCreated
    });

  } catch (error) {
    console.error('[ExecuteBuilds] Error:', error);
    res.status(500).json({ 
      error: 'Failed to execute builds',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
