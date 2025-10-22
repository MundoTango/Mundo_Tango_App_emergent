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
    const { storage } = await import('../storage.js');
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
    const { storage } = await import('../storage.js');
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
    const { storage } = await import('../storage');
    const user = await storage.getUserByReplitId(req.user.claims.sub);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { projectId, message, model, personality } = req.body;

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

    // Build messages array with personality
    const systemPrompt = getPersonalityPrompt(personality);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(m => ({ role: m.role, content: m.content })),
    ];

    // Select best model
    const selectedModel = model || multiModelOrchestrator.selectModel({
      taskType: 'general',
    });

    // Stream response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullResponse = '';
    let tokenCount = 0;

    for await (const chunk of multiModelOrchestrator.streamResponse(messages, selectedModel)) {
      fullResponse += chunk;
      tokenCount += chunk.split(' ').length;
      res.write(`data: ${JSON.stringify({ chunk, model: selectedModel })}\n\n`);
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

    // Track usage  
    await db.insert(modelUsage).values({
      model: selectedModel,
      tokens: tokenCount,
      cost: tokenCount * 0.00001, // Rough estimate
    });

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('[Chat Stream] Error:', error);
    res.status(500).json({ error: 'Failed to stream response' });
  }
});

/**
 * Get personality-specific system prompt
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
