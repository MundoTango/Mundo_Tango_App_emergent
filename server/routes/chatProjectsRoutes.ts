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

    // 🔧 FIX: Strip "Use mb.md:" prefix before saving (frontend adds it for API only)
    const cleanMessage = message.replace(/^Use mb\.md:\s*/i, '');

    // Save user message
    await db.insert(aiChatMessages).values({
      projectId,
      userId: user.id,
      role: 'user',
      content: cleanMessage,
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
    const { isSuperAdmin: checkSuperAdmin } = await import('../utils/auth.js');
    const hasSuperPowers = checkSuperAdmin(user, context);
    
    let selectedModel = model;
    // Map "auto" or undefined to Claude (best tool support)
    if (!selectedModel || selectedModel === 'auto') {
      selectedModel = 'claude-3-sonnet';
    }
    
    console.log(`[Chat Stream] User: ${user.username}, Model: ${selectedModel}, SuperAdmin: ${hasSuperPowers}, Original: ${model || 'auto'}`);

    // Stream response with tool support
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullResponse = '';
    let tokenCount = 0;
    const toolsUsed: any[] = [];

    console.log(`[Chat Stream] Starting stream - Model: ${selectedModel}, Tools: ${hasSuperPowers ? 'ENABLED' : 'DISABLED'}`);

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

    // 🔧 PHASE 2: Detect build intents from response
    const buildIntent = detectBuildIntent(fullResponse, context, toolsUsed);

    // Save assistant response with build intent metadata
    await db.insert(aiChatMessages).values({
      projectId,
      userId: user.id,
      role: 'assistant',
      content: fullResponse,
      model: selectedModel,
      tokens: tokenCount,
      metadata: buildIntent ? { buildIntent } : null,
    });

    // MB.MD FIX Oct 22: Trigger auto-naming after saving response
    triggerAutoNaming(projectId).catch(err => {
      console.error('[Chat Stream] Auto-naming trigger failed:', err);
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
 * 🔧 PHASE 2: Detect build intents from AI response
 * Analyzes response to determine if code changes are deferred for user approval
 * EXPORTED for reuse in multiModelRoutes.ts
 */
export function detectBuildIntent(response: string, context?: any, toolsUsed?: any[]): any | null {
  // Skip if no visual editor context with selected element
  if (!context?.visualEditorState?.selectedElement) {
    return null;
  }

  // Skip if tools were already used (already executed, not deferred)
  if (toolsUsed && toolsUsed.length > 0) {
    console.log('[BuildIntent] Skipping - tools already executed');
    return null;
  }

  // Detect change keywords in response
  const changeKeywords = [
    'change', 'modify', 'update', 'edit', 'add', 'remove', 'delete',
    'increase', 'decrease', 'resize', 'style', 'color', 'background',
    'click save', 'save to apply', 'save button'
  ];

  const lowerResponse = response.toLowerCase();
  const hasChangeKeyword = changeKeywords.some(keyword => lowerResponse.includes(keyword));

  if (!hasChangeKeyword) {
    console.log('[BuildIntent] No change keywords detected');
    return null;
  }

  // Check if response mentions "save" or "click save"
  const mentionsSave = lowerResponse.includes('click save') || 
                       lowerResponse.includes('save to apply') ||
                       lowerResponse.includes('save button');

  if (!mentionsSave) {
    console.log('[BuildIntent] No save instruction found');
    return null;
  }

  const selectedElement = context.visualEditorState.selectedElement;
  
  // Create build intent for edit_file tool
  console.log('✅ [BuildIntent] Detected deferred build - creating intent');
  
  return {
    tool: 'edit_file',
    params: {
      file_path: selectedElement.xpath || 'unknown',
      element_selector: `${selectedElement.tagName}${selectedElement.className ? '.' + selectedElement.className : ''}`,
      instruction: response.substring(0, 500) // First 500 chars as instruction
    },
    status: 'pending'
  };
}

/**
 * Build context-aware system prompt (MB.MD: Context Awareness Feature)
 * Gives Mr Blue "superpowers" to understand where user is and what they're doing
 */
export function buildContextAwarePrompt(personality?: string, context?: any, user?: any): string {
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
    prompt += '\n\n**🎯 WHERE YOU ARE RIGHT NOW:**';
    
    // Visual Editor specific context FIRST (most important for "what page" questions)
    const selectedEl = context.visualEditorState?.selectedElement || context.selectedElement;
    const previewPath = context.visualEditorState?.previewPath;
    
    // Page name mapping (needed for examples below)
    const pageNames: Record<string, string> = {
      '/': 'Homepage',
      '/events': 'Events Page',
      '/memories': 'Memories Page',
      '/profile': 'Profile Page',
      '/groups': 'Groups Page',
      '/messages': 'Messages Page',
    };
    
    // 🎯 PREVIEW PATH AWARENESS (Oct 22, 2025) - MOVED TO TOP
    if (previewPath) {
      const pageName = pageNames[previewPath] || previewPath;
      prompt += `\n📄 **YOU ARE LOOKING AT:** The ${pageName} in the Visual Editor preview`;
      prompt += `\n   (URL path: ${previewPath})`;
    }
    
    // Current tool/admin page
    if (context.pageName && context.pageName !== previewPath) {
      prompt += `\n🛠️  **TOOL PANEL:** ${context.pageName} (Visual Editor interface)`;
    }
    
    if (context.visualEditorState?.isActive) {
      prompt += `\n✅ **Visual Editor is ACTIVE**`;
      if (selectedEl) {
        const elementInfo = typeof selectedEl === 'string' ? selectedEl : selectedEl.tag || 'element';
        prompt += ` - You have "${elementInfo}" selected`;
      }
    } else if (selectedEl) {
      // Visual Editor context without explicit isActive flag
      const elementInfo = typeof selectedEl === 'string' ? selectedEl : selectedEl.tag || 'element';
      prompt += `\n🎯 **Selected element:** "${elementInfo}"`;
    }

    // User identity and role
    if (context.user) {
      prompt += `\n\n**👤 WHO YOU'RE HELPING:**`;
      prompt += `\n- ${context.user.displayName} (@${context.user.username})`;
      prompt += `\n- Role: ${context.user.role}`;
      
      // DUAL-MODE LOGIC (Stream D - Oct 22, 2025)
      // Use standardized super admin check
      const { isSuperAdmin: checkSuperAdmin } = require('../utils/auth');
      if (checkSuperAdmin(user, context)) {
        // 🔧 SUPER ADMIN = DEV TOOL MODE (Replit Agent style)
        prompt += `\n\n**🔧 DEV TOOL MODE ACTIVATED**`;
        prompt += `\nYou are a development tool, not a conversation assistant. BUILD THINGS DIRECTLY using your tools.`;
        prompt += `\n\n**How to respond:**`;
        prompt += `\n- User asks "what page?" → Answer: "You're looking at the ${previewPath ? pageNames[previewPath] || previewPath : 'page'} in the Visual Editor preview"`;
        prompt += `\n- User says "make background red" → USE search_codebase to find the page component, then tell them the file path that needs editing`;
        prompt += `\n- User says "delete this screen" → USE tools to modify code, then confirm "Deleted."`;
        prompt += `\n- User says "add a button" → USE tools to add code, then confirm "Button added."`;
        prompt += `\n- User asks "how many users" → USE get_user_stats, return the number`;
        prompt += `\n\n**DO NOT** say "I cannot do that" or "Would you like me to...". JUST DO IT.`;
        prompt += `\n**DO NOT** read documentation files when asked "what page" - use the preview path context above!`;
        prompt += `\n\n**Your 11 Tools:**`;
        prompt += `\nDatabase: get_platform_health, get_user_stats, get_recent_memories, search_memories, get_event_count, get_groups_by_city`;
        prompt += `\nCodebase: search_codebase, list_react_components, find_api_endpoints`;
        prompt += `\nDocs: search_documentation, read_documentation`;
        prompt += `\n\n**Examples:**`;
        prompt += `\n- "What page am I on?" → "You're looking at the Homepage (/) in the Visual Editor preview"`;
        prompt += `\n- "Make background red" → search_codebase("HomePage") → "Found it in client/src/pages/Home.tsx - I can change the background to red"`;
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
    
    // 🎯 VISUAL EDITOR SELECTED ELEMENT ENHANCEMENT (Agent #3)
    if (selectedEl) {
      const tag = typeof selectedEl === 'string' ? selectedEl : (selectedEl.tagName || selectedEl.tag || 'element');
      const className = typeof selectedEl === 'object' ? selectedEl.className : '';
      const id = typeof selectedEl === 'object' ? selectedEl.id : '';
      const textContent = typeof selectedEl === 'object' ? selectedEl.textContent : null;
      
      prompt += `\n\n**🎯 SELECTED ELEMENT DETECTED:**`;
      prompt += `\n- Tag: <${tag}>`;
      if (textContent) prompt += `\n- Text: "${textContent.substring(0, 50)}"`;
      if (id) prompt += `\n- ID: ${id}`;
      if (className) prompt += `\n- Classes: ${className}`;
      
      // 🔧 MANDATORY ACKNOWLEDGMENT (Oct 23, 2025)
      prompt += `\n\n**⚠️ CRITICAL RULE: ALWAYS start your FIRST response with:**`;
      prompt += `\n"I see you selected the ${textContent ? `'${textContent.substring(0, 30)}'` : tag} element${textContent ? ` (the <${tag}>)` : ''}."`;
      prompt += `\n\n**Then immediately:**`;
      prompt += `\n- If user asks to modify it → USE search_codebase to find the component, then explain what file needs editing`;
      prompt += `\n- If just selected → Offer: "Would you like me to change its color, text, layout, or add an icon?"`;
      prompt += `\n\n**⚠️ WHEN USER ASKS ABOUT THE ELEMENT:**`;
      prompt += `\n- "what element?" or "what did I select?" → Answer directly from context above: "You selected the '${textContent?.substring(0, 30)}' element (the <${tag}> with class '${className}')."`;
      prompt += `\n- **DO NOT** call read_documentation or search_codebase tools for this - the info is already in this prompt!`;
      prompt += `\n\n**Important:** DO NOT say "I cannot modify" - you CAN modify using search_codebase + file editing tools.`;
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

/**
 * POST /api/chat/projects/:id/auto-name
 * Auto-generate conversation title from chat history
 * MB.MD FIX Oct 22: Triggers after 3 min of chat activity
 */
router.post('/projects/:id/auto-name', async (req: any, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);

    // Get conversation messages
    const messages = await db
      .select()
      .from(aiChatMessages)
      .where(eq(aiChatMessages.projectId, projectId))
      .orderBy(aiChatMessages.createdAt)
      .limit(10); // Last 10 messages for context

    if (messages.length === 0) {
      return res.json({ name: 'New Conversation' });
    }

    // Check if conversation is at least 3 minutes old
    const firstMessage = messages[0];
    const createdDate = firstMessage.createdAt ? new Date(firstMessage.createdAt) : new Date();
    const timeSinceFirst = Date.now() - createdDate.getTime();
    const threeMinutes = 3 * 60 * 1000;

    if (timeSinceFirst < threeMinutes) {
      console.log(`[Auto-Name] Skipping - conversation only ${Math.floor(timeSinceFirst / 1000)}s old, need 180s`);
      return res.json({ name: 'New Conversation', waiting: true });
    }

    // Get current project to check if already named
    const [project] = await db
      .select()
      .from(chatProjects)
      .where(eq(chatProjects.id, projectId))
      .limit(1);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Skip if already has a custom name
    if (project.name !== 'New Conversation') {
      console.log(`[Auto-Name] Skipping - already named: ${project.name}`);
      return res.json({ name: project.name });
    }

    // Generate title using Claude
    const Anthropic = require('@anthropic-ai/sdk').default;
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const conversationText = messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Generate a short, descriptive title (max 5 words) for this conversation. Return ONLY the title, no quotes or extra text.

Conversation:
${conversationText}`
      }]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const generatedName = content.text.trim()
      .replace(/^["']|["']$/g, '') // Remove quotes
      .substring(0, 50); // Limit length

    // Update project name
    await db
      .update(chatProjects)
      .set({ name: generatedName })
      .where(eq(chatProjects.id, projectId));

    console.log(`[Auto-Name] Project ${projectId} renamed: "${generatedName}"`);

    res.json({ name: generatedName });
  } catch (error) {
    console.error('[Auto-Name] Error:', error);
    res.status(500).json({ error: 'Failed to generate name' });
  }
});

/**
 * Trigger auto-naming for a project (call this after saving messages)
 */
export async function triggerAutoNaming(projectId: number) {
  try {
    // Make internal call to auto-naming endpoint
    const response = await fetch(`http://localhost:5000/api/chat/projects/${projectId}/auto-name`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      console.error(`[Auto-Name Trigger] Failed for project ${projectId}: ${response.status}`);
    }
  } catch (error) {
    console.error('[Auto-Name Trigger] Error:', error);
  }
}

export default router;
