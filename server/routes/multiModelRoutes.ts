/**
 * MULTI-MODEL CONSENSUS API ROUTES
 * MB.MD Stream 2: All Models feature
 * MB.MD FIX Oct 22: Added message persistence to database
 * MB.MD FIX Oct 22 (#2): Added tool support for super admins
 * 
 * Endpoints for multi-model AI coordination
 */

import { Router } from 'express';
import { modelCoordinator } from '../services/multiModel/ModelCoordinator';
import { streamWithTools } from '../services/tools/universalToolOrchestrator';
import { db } from '../db';
import { aiChatMessages } from '@shared/schema';
import { storage } from '../storage';
import { triggerAutoNaming, buildContextAwarePrompt, detectBuildIntent } from './chatProjectsRoutes';
import { isSuperAdmin } from '../utils/auth';

const router = Router();

/**
 * POST /api/multimodel/consensus
 * Execute query across all models and return consensus
 * MB.MD FIX: Now saves messages to database
 * MB.MD FIX Oct 22 (#2): Adds tool support for super admins
 */
router.post('/consensus', async (req: any, res) => {
  try {
    const { query, projectId, systemPrompt, context } = req.body;
    
    // 🔍 DEBUG: Log what we received
    console.log('🔍 [MultiModel] Request body keys:', Object.keys(req.body));
    console.log('🔍 [MultiModel] query value:', query ? `"${query.substring(0, 50)}..."` : 'MISSING');
    
    if (!query) {
      console.error('❌ [MultiModel] No query provided in request body:', req.body);
      return res.status(400).json({ error: 'Query is required' });
    }

    // MB.MD FIX: Get user for saving messages
    let userId: number | undefined;
    let user: any = null;
    
    if (req.user?.claims?.sub) {
      user = await storage.getUserByReplitId(req.user.claims.sub);
      userId = user?.id;
    }
    
    console.log('[MultiModel] Executing consensus for:', query.substring(0, 50));

    // MB.MD FIX: Save user message to database BEFORE processing
    if (projectId && userId) {
      // 🔧 FIX: Strip "Use mb.md:" prefix before saving
      const cleanQuery = query.replace(/^Use mb\.md:\s*/i, '');
      
      await db.insert(aiChatMessages).values({
        projectId,
        userId,
        role: 'user',
        content: cleanQuery,
        model: null,
      });
      console.log(`[MultiModel] Saved user message to project ${projectId}`);
    }
    
    // MB.MD FIX Oct 22 (#2): Check if user is super admin for tool support
    const hasSuperPowers = isSuperAdmin(user, context);
    console.log(`[MultiModel] User: ${user?.username}, SuperAdmin: ${hasSuperPowers}`);
    
    // 🎨 DEBUG: Log Visual Editor context (Oct 22, 2025)
    if (context?.visualEditorState || context?.selectedElement) {
      console.log('🎨 [MultiModel] Visual Editor context received:', {
        isActive: context?.visualEditorState?.isActive,
        selectedElement: context?.visualEditorState?.selectedElement || context?.selectedElement
      });
    }
    
    // 🔧 BUILD CONTEXT-AWARE SYSTEM PROMPT (Oct 22, 2025)
    // Use the same context builder as /api/chat/stream for consistency
    const contextAwareSystemPrompt = buildContextAwarePrompt(
      systemPrompt?.includes('professional') ? 'professional' :
      systemPrompt?.includes('mentor') ? 'mentor' :
      systemPrompt?.includes('debug') ? 'debug' : 'friendly',
      context,
      user
    );
    
    console.log(`[MultiModel] System prompt length: ${contextAwareSystemPrompt.length} chars`);
    
    let result;
    
    if (hasSuperPowers && projectId && userId) {
      // 🔧 SUPER ADMIN MODE: Use tool-enabled execution
      console.log('[MultiModel] OMNISCIENT MODE: Executing with tool support');
      
      // Execute all 3 models with tools in parallel
      const models = ['claude-3-sonnet', 'gpt-4o', 'gemini-pro'];
      const messages = [
        { role: 'system', content: contextAwareSystemPrompt },
        { role: 'user', content: query }
      ];
      
      const modelResponses = await Promise.allSettled(
        models.map(async (model) => {
          const startTime = Date.now();
          let fullResponse = '';
          const toolsUsed: string[] = [];
          
          try {
            // Stream with tools for each model
            for await (const chunk of streamWithTools(messages, model, user, (tool) => {
              toolsUsed.push(tool);
            })) {
              if (chunk.type === 'text') {
                fullResponse += chunk.content;
              }
            }
            
            return {
              model: model === 'claude-3-sonnet' ? 'Claude 3.5 Sonnet' : 
                     model === 'gpt-4o' ? 'GPT-4o' : 'Gemini Pro',
              content: fullResponse,
              confidence: model === 'claude-3-sonnet' ? 0.95 : model === 'gpt-4o' ? 0.90 : 0.88,
              executionTime: Date.now() - startTime,
              toolsUsed
            };
          } catch (error) {
            console.error(`[MultiModel] ${model} error:`, error);
            return {
              model: model === 'claude-3-sonnet' ? 'Claude 3.5 Sonnet' : 
                     model === 'gpt-4o' ? 'GPT-4o' : 'Gemini Pro',
              content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              confidence: 0,
              executionTime: Date.now() - startTime,
              toolsUsed: []
            };
          }
        })
      );
      
      // Extract successful responses
      const models_responses = modelResponses
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map(r => r.value);
      
      // Build consensus from tool-enabled responses
      const validModels = models_responses.filter(m => m.confidence > 0);
      const bestModel = validModels.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      , validModels[0] || models_responses[0]);
      
      const finalPlan = bestModel 
        ? `**Consensus Plan (led by ${bestModel.model}):**\n\n${bestModel.content}`
        : 'All models encountered errors. Please try again.';
      
      // Count unique tools used across all models
      const allToolsUsed = new Set(models_responses.flatMap(m => m.toolsUsed || []));
      if (allToolsUsed.size > 0) {
        console.log(`[MultiModel] Tools used: ${Array.from(allToolsUsed).join(', ')}`);
      }
      
      result = {
        finalPlan,
        models: models_responses,
        debate: generateDebateTranscript(models_responses, query),
        totalTime: models_responses.reduce((sum, m) => sum + (m.executionTime || 0), 0),
        toolsUsed: Array.from(allToolsUsed)
      };
    } else {
      // 👥 REGULAR USER MODE: No tool access
      console.log('[MultiModel] Regular mode: No tool access');
      result = await modelCoordinator.executeAll(query, contextAwareSystemPrompt);
    }

    // MB.MD FIX: Save AI response to database AFTER processing
    if (projectId && userId && result.finalPlan) {
      // 🔧 PHASE 2: Detect build intents from multi-model consensus response
      const buildIntent = detectBuildIntent(result.finalPlan, context, (result as any).toolsUsed || []);
      
      if (buildIntent) {
        console.log('✅ [MultiModel] Build intent detected - will defer execution until user clicks Save');
      }
      
      await db.insert(aiChatMessages).values({
        projectId,
        userId,
        role: 'assistant',
        content: result.finalPlan,
        model: 'Multi-Model Consensus',  // 🔧 FIX: User-friendly badge name
        tokens: result.finalPlan.split(' ').length, // Rough estimate
        metadata: buildIntent ? { buildIntent } : null, // 🔧 PHASE 2: Add build intent metadata
      });
      console.log(`[MultiModel] Saved AI response to project ${projectId}`);
      
      // MB.MD FIX Oct 22: Trigger auto-naming after 3 min
      triggerAutoNaming(projectId).catch(err => {
        console.error('[MultiModel] Auto-naming trigger failed:', err);
      });
    }
    
    res.json(result);
  } catch (error: any) {
    console.error('[MultiModel] Consensus error:', error);
    res.status(500).json({ error: error.message || 'Failed to execute consensus' });
  }
});

/**
 * Generate debate transcript for transparency
 */
function generateDebateTranscript(models: any[], query: string): string {
  const transcript: string[] = [];
  
  transcript.push(`## Model Deliberation: "${query.substring(0, 60)}..."\n`);
  
  models.forEach(model => {
    if (model.confidence > 0) {
      const toolInfo = model.toolsUsed && model.toolsUsed.length > 0 
        ? ` [Tools: ${model.toolsUsed.join(', ')}]` 
        : '';
      transcript.push(`**${model.model}** (${model.executionTime}ms, confidence: ${(model.confidence * 100).toFixed(0)}%)${toolInfo}:`);
      transcript.push(model.content.substring(0, 200) + '...\n');
    }
  });
  
  return transcript.join('\n');
}

/**
 * POST /api/multimodel/single
 * Execute query on single model
 */
router.post('/single', async (req, res) => {
  try {
    const { model, query, systemPrompt } = req.body;
    
    if (!model || !query) {
      return res.status(400).json({ error: 'Model and query are required' });
    }
    
    console.log(`[MultiModel] Executing ${model} for:`, query.substring(0, 50));
    
    const result = await modelCoordinator.executeModel(model, query, systemPrompt);
    
    res.json({ model, content: result });
  } catch (error: any) {
    console.error('[MultiModel] Single model error:', error);
    res.status(500).json({ error: error.message || 'Failed to execute model' });
  }
});

export default router;
