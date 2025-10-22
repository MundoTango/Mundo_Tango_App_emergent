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

    // OPTIMIZATION: Get recent conversation history (limit 10 for speed)
    const history = await db
      .select()
      .from(aiChatMessages)
      .where(eq(aiChatMessages.projectId, projectId))
      .orderBy(aiChatMessages.createdAt)
      .limit(10); // Reduced from 20 for faster queries and less token usage

    // Build context-aware system prompt (MB.MD: Give Mr Blue "superpowers")
    const systemPrompt = buildContextAwarePrompt(personality, context, user);
    
    // OPTIMIZATION: Compress history messages (keep recent full, summarize older)
    const compressedHistory = history.map((m, idx) => {
      // Keep last 5 messages at full length
      if (idx >= history.length - 5) {
        return { role: m.role, content: m.content };
      }
      // Compress older messages (trim to 200 chars)
      return { 
        role: m.role, 
        content: m.content.substring(0, 200) + (m.content.length > 200 ? '...' : '')
      };
    });
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...compressedHistory,
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
      
      // DUAL-MODE LOGIC (Stream D - Oct 22, 2025)
      if (context.user.role === 'super_admin' || user?.email === 'admin@mundotango.life') {
        // 🔧 SUPER ADMIN = DEV TOOL MODE (Replit Agent style)
        prompt += `\n\n**🔧 DEV TOOL MODE ACTIVATED**`;
        prompt += `\nYou are a development tool, not a conversation assistant. BUILD THINGS DIRECTLY using your tools.`;
        prompt += `\n\n**How to respond:**`;
        prompt += `\n- User says "delete this screen" → USE tools to modify code, then confirm "Deleted."`;
        prompt += `\n- User says "add a button" → USE tools to add code, then confirm "Button added."`;
        prompt += `\n- User asks "how many users" → USE get_user_stats, return the number`;
        prompt += `\n\n**DO NOT** say "I cannot do that" or "Would you like me to...". JUST DO IT.`;
        prompt += `\n\n**Your 11 Tools:**`;
        prompt += `\nDatabase: get_platform_health, get_user_stats, get_recent_memories, search_memories, get_event_count, get_groups_by_city`;
        prompt += `\nCodebase: search_codebase, list_react_components, find_api_endpoints`;
        prompt += `\nDocs: search_documentation, read_documentation`;
        prompt += `\n\n**Examples:**`;
        prompt += `\n- "Delete welcome screen" → search_codebase("WelcomeBack") → modify file → "Deleted."`;
        prompt += `\n- "Show platform stats" → get_platform_health() → return stats`;
        prompt += `\n- "Find ChatInterface" → search_codebase("ChatInterface") → return location`;
      } else {
        // 👥 REGULAR USER = FRIENDLY GUIDE MODE
        prompt += `\n\n**User Mode: You're a helpful guide**`;
        prompt += `\nExplain features, answer questions, and guide users through the platform.`;
        prompt += `\nBe conversational, supportive, and educational.`;
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
