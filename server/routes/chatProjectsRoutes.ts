/**
 * Chat Projects API Routes
 * ChatGPT-style project organization for Mr Blue
 * MB.MD Track 3: Projects System - Oct 21, 2025
 */

import { Router, type Request, Response } from 'express';
import { db } from '../db';
import { chatProjects, aiChatMessages, modelUsage, type InsertChatProject, type InsertAIChatMessage } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { multiModelOrchestrator } from '../services/multiModelOrchestrator';
import { streamWithTools } from '../services/tools/universalToolOrchestrator';
import { storage } from '../storage';

const router = Router();

/**
 * GET /api/chat/projects - Get all projects for user
 */
router.get('/projects', async (req: any, res: Response) => {
  if (!req.user?.claims?.sub) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // Get database user from Replit ID
    const user = await storage.getUserByReplitId(req.user.claims.sub);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const projects = await db
      .select()
      .from(chatProjects)
      .where(eq(chatProjects.userId, user.id))
      .orderBy(desc(chatProjects.updatedAt));

    res.json(projects);
  } catch (error) {
    console.error('[Chat Projects] Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * POST /api/chat/projects - Create new project
 */
router.post('/projects', async (req: any, res: Response) => {
  if (!req.user?.claims?.sub) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    console.log(`[Chat Projects POST] Authenticated user replitId: ${req.user.claims.sub}`);
    
    // Get database user from Replit ID
    const user = await storage.getUserByReplitId(req.user.claims.sub);
    
    console.log(`[Chat Projects POST] User lookup result:`, user ? `User found: id=${user.id}` : 'User NOT found');
    console.log(`[Chat Projects POST] FULL USER OBJECT:`, JSON.stringify(user, null, 2));
    
    if (!user) {
      console.error(`[Chat Projects POST] CRITICAL: User not found for replitId ${req.user.claims.sub}`);
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, description } = req.body;
    
    console.log(`[Chat Projects POST] About to insert - userId:`, user.id, `type:`, typeof user.id);
    console.log(`[Chat Projects POST] Request body:`, { name, description });

    const [project] = await db
      .insert(chatProjects)
      .values({
        userId: user.id,
        name,
        description,
      })
      .returning();

    console.log(`[Chat Projects POST] Project created successfully: id=${project.id}`);
    res.json(project);
  } catch (error) {
    console.error('[Chat Projects] Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

/**
 * GET /api/chat/projects/:id/messages - Get messages in project
 */
router.get('/projects/:id/messages', async (req: any, res: Response) => {
  if (!req.user?.claims?.sub) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const projectId = parseInt(req.params.id);

    const messages = await db
      .select()
      .from(aiChatMessages)
      .where(eq(aiChatMessages.projectId, projectId))
      .orderBy(aiChatMessages.createdAt);

    res.json(messages);
  } catch (error) {
    console.error('[Chat Projects] Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

/**
 * POST /api/chat/stream - Stream AI response (multi-model)
 */
router.post('/stream', async (req: any, res: Response) => {
  if (!req.user?.claims?.sub) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // Get database user from Replit ID
    const user = await storage.getUserByReplitId(req.user.claims.sub);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { projectId, message, model, personality, context } = req.body;

    // Save user message
    await db.insert(aiChatMessages).values({
      projectId,
      userId: user.id,
      role: 'user',
      content: message,
      model: null,
    });

    // Get conversation history
    const history = await db
      .select()
      .from(aiChatMessages)
      .where(eq(aiChatMessages.projectId, projectId))
      .orderBy(aiChatMessages.createdAt)
      .limit(20);

    // Build context-aware system prompt (MB.MD: Give Mr Blue "superpowers")
    const systemPrompt = buildContextAwarePrompt(personality, context, user);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(m => ({ role: m.role, content: m.content })),
    ];

    // Select best model - "auto" uses Claude (best tool calling)
    const isSuperAdmin = user.email === 'admin@mundotango.life' || 
                        user.tangoRoles?.includes('super_admin');
    
    let selectedModel = model;
    // Map "auto" or undefined to Claude (best tool support)
    if (!selectedModel || selectedModel === 'auto') {
      selectedModel = 'claude-3-sonnet';
    }
    
    console.log(`[Chat Stream] User: ${user.username}, Model: ${selectedModel}, SuperAdmin: ${isSuperAdmin}, Original: ${model || 'auto'}`);

    // Stream response with tool support
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullResponse = '';
    let tokenCount = 0;
    const toolsUsed: any[] = [];

    console.log(`[Chat Stream] Starting stream - Model: ${selectedModel}, Tools: ${isSuperAdmin ? 'ENABLED' : 'DISABLED'}`);

    // Use universal tool-enabled orchestrator (works with all models)
    for await (const chunk of streamWithTools(messages, selectedModel, user, (tool, params, result) => {
      // Track tool usage for logging
      console.log(`[Tool Used] ${tool}:`, JSON.stringify(params).substring(0, 100), '→', JSON.stringify(result).substring(0, 100));
      toolsUsed.push({ tool, params, result });
    })) {
      if (chunk.type === 'text') {
        fullResponse += chunk.content;
        tokenCount += chunk.content.split(' ').length;
        res.write(`data: ${JSON.stringify({ type: 'text', chunk: chunk.content, model: selectedModel })}\n\n`);
      } else if (chunk.type === 'tool_use') {
        res.write(`data: ${JSON.stringify({ type: 'tool_use', tool: chunk.tool, message: chunk.content })}\n\n`);
      } else if (chunk.type === 'tool_result') {
        res.write(`data: ${JSON.stringify({ type: 'tool_result', tool: chunk.tool, message: chunk.content })}\n\n`);
      }
    }

    // Save assistant response
    await db.insert(aiChatMessages).values({
      projectId,
      userId: user.id,
      role: 'assistant',
      content: fullResponse,
      model: selectedModel,
      tokens: tokenCount,
    });

    // Track usage - TEMPORARILY DISABLED until db schema syncs
    // await db.insert(modelUsage).values({
    //   userId: user.id,
    //   model: selectedModel,
    //   tokens: tokenCount,
    //   cost: tokenCount * 0.00001, // Rough estimate
    // });

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('[Chat Stream] Error:', error);
    res.status(500).json({ error: 'Failed to stream response' });
  }
});

/**
 * Build context-aware system prompt (MB.MD: Context Awareness Feature)
 * Gives Mr Blue "superpowers" to understand where user is and what they're doing
 */
function buildContextAwarePrompt(personality?: string, context?: any, user?: any): string {
  // Base personality
  const basePrompts: Record<string, string> = {
    professional: 'You are a professional AI assistant. Be formal, precise, and focus on delivering accurate information.',
    friendly: 'You are Mr Blue, a friendly AI companion for the Mundo Tango platform. Be warm, conversational, and supportive.',
    mentor: 'You are a wise mentor. Provide thoughtful guidance, ask clarifying questions, and help users learn.',
    debug: 'You are a technical debugging assistant. Show your reasoning, provide detailed explanations, and include code examples.',
  };

  let prompt = basePrompts[personality || 'friendly'] || basePrompts.friendly;

  // Add context awareness if available
  if (context) {
    prompt += '\n\n**CONTEXT AWARENESS:**';
    
    // Current page
    if (context.pageName) {
      prompt += `\n- The user is currently on the "${context.pageName}" page (route: ${context.route})`;
    }

    // User identity and role
    if (context.user) {
      prompt += `\n- You are assisting ${context.user.displayName} (@${context.user.username})`;
      prompt += `\n- User role: ${context.user.role}`;
      
      // Super admin capabilities with explicit tool usage instructions
      if (context.user.role === 'super_admin' || user?.email === 'admin@mundotango.life') {
        prompt += `\n\n**🔧 OMNISCIENT MODE ACTIVATED - YOU HAVE SUPERPOWERS**`;
        prompt += `\nYou have 11 AI tools at your disposal. USE THEM ACTIVELY:`;
        prompt += `\n\n**Database Tools** (query real-time platform data):`;
        prompt += `\n- get_platform_health - Get total users, memories, events, groups`;
        prompt += `\n- get_user_stats - User count, signups today/this week`;
        prompt += `\n- get_recent_memories - Latest posts from users`;
        prompt += `\n- search_memories - Search posts by keyword`;
        prompt += `\n- get_event_count - Count upcoming/past events`;
        prompt += `\n- get_groups_by_city - Find tango groups by city`;
        prompt += `\n\n**Codebase Tools** (explore the source code):`;
        prompt += `\n- search_codebase - Find components, functions, code patterns`;
        prompt += `\n- list_react_components - See all React components`;
        prompt += `\n- find_api_endpoints - Discover backend API routes`;
        prompt += `\n\n**Documentation Tools** (access project docs):`;
        prompt += `\n- search_documentation - Search all docs for specific info`;
        prompt += `\n- read_documentation - Read specific doc files (e.g., "MB.MD", "MrBlue/mb.md")`;
        prompt += `\n\n**IMPORTANT**: When users ask about platform data, code, or documentation, USE THE APPROPRIATE TOOL. Don't guess or use generic knowledge.`;
        prompt += `\nExamples:`;
        prompt += `\n- "How many users?" → USE get_user_stats`;
        prompt += `\n- "What is MB.MD?" → USE read_documentation with file_path: "MB_MD_QA_PROTOCOL.md"`;
        prompt += `\n- "Where is ChatInterface?" → USE search_codebase`;
      }
    }

    // Visual Editor specific context
    if (context.visualEditorState?.isActive) {
      prompt += `\n- The Visual Editor is active`;
      if (context.visualEditorState.selectedElement) {
        prompt += ` with "${context.visualEditorState.selectedElement}" selected`;
      }
    }

    prompt += `\n\nUse this context to provide relevant, helpful responses. You CAN see what page they're on and what they're doing.`;
  }

  return prompt;
}

/**
 * Get personality-specific system prompt (Legacy - deprecated in favor of buildContextAwarePrompt)
 */
function getPersonalityPrompt(personality?: string): string {
  const prompts: Record<string, string> = {
    professional: 'You are a professional AI assistant. Be formal, precise, and focus on delivering accurate information.',
    friendly: 'You are a friendly AI companion. Be warm, conversational, and supportive in your responses.',
    mentor: 'You are a wise mentor. Provide thoughtful guidance, ask clarifying questions, and help users learn.',
    debug: 'You are a technical debugging assistant. Show your reasoning, provide detailed explanations, and include code examples.',
  };

  return prompts[personality || 'friendly'] || prompts.friendly;
}

export default router;
