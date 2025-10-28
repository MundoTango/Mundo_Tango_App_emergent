/**
 * MR BLUE UNIFIED ROUTES - Merged Chat + Vibe Coding Endpoint
 * Created: October 28, 2025
 * Purpose: Single endpoint that does BOTH streaming chat AND vibe coding execution
 * 
 * Architecture:
 * POST /api/mrblue/unified - Unified chat+vibe endpoint
 * - Accepts: conversationId, message, executionMode ('plan' | 'build')
 * - Returns: SSE stream with chat response + code changes
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { getUserId } from '../utils/authHelper';
import { VibeCodeEngine } from '../services/gemini/VibeCodeEngine';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const geminiEngine = new VibeCodeEngine();

/**
 * UNIFIED ENDPOINT - Chat + Vibe Coding in One
 * Streams chat response AND executes vibe coding in parallel
 */
router.post('/unified', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;

    // Validate request
    const schema = z.object({
      conversationId: z.number(),
      message: z.string().min(1),
      model: z.string().optional().default('claude-sonnet-4'),
      selectedElement: z.any().optional(),
      previewPath: z.string().optional(),
      executionMode: z.enum(['plan', 'build']).optional().default('build')
    });

    const { conversationId, message, model, selectedElement, previewPath, executionMode } = schema.parse(req.body);

    // Verify conversation ownership
    const conversation = await storage.getMrBlueConversation(conversationId);
    if (!conversation || conversation.userId !== userIdNum) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Save user message
    await storage.createMrBlueMessage({
      conversationId,
      role: 'user',
      content: message,
      streaming: false
    });

    // Get conversation history
    const messageHistory = await storage.getMrBlueMessagesByConversation(conversationId, 10);

    // Build context
    let visualEditorContext = '';
    if (selectedElement) {
      visualEditorContext = `\n\n🎨 VISUAL EDITOR CONTEXT:
Selected Element: <${selectedElement.tagName}> on ${previewPath}
Classes: ${selectedElement.className || 'none'}
Text: "${selectedElement.textContent || 'none'}"`;
    }

    // Build AI messages
    const aiMessages = [
      {
        role: 'system' as const,
        content: `You are Mr. Blue, an AI coding assistant powered by Google Gemini and Anthropic Claude.${visualEditorContext}

You CAN make changes to code! When users ask to:
- "Add a button" / "Change the color" / "Create a page"
- "Update the layout" / "Fix this bug" / "Add a feature"

Respond naturally like: "I'll add that for you now. I'm updating the component to include..."

The vibe coding system handles all technical work in the background.`
      },
      ...messageHistory.slice(-8).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      {
        role: 'user' as const,
        content: message
      }
    ];

    // Create AI message record
    const aiMessage = await storage.createMrBlueMessage({
      conversationId,
      role: 'assistant',
      content: '',
      streaming: true,
      metadata: { model, executionMode }
    });

    let accumulatedResponse = '';

    // PHASE 1: Stream chat response using Claude
    console.log(`💬 [Unified] Streaming chat response with ${model}...`);
    
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: aiMessages.slice(1) as any,
      system: aiMessages[0].content
    });

    // Stream text chunks
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        accumulatedResponse += chunk.delta.text;
        res.write(`data: ${JSON.stringify({ type: 'text', chunk: chunk.delta.text })}\n\n`);
      }
    }

    // Update AI message with final content
    await storage.updateMrBlueMessage(aiMessage.id, {
      content: accumulatedResponse,
      streaming: false
    });

    console.log(`✅ [Unified] Chat streaming complete: ${accumulatedResponse.length} chars`);

    // PHASE 2: Execute vibe coding (if code intent detected)
    const codeKeywords = ['add', 'create', 'modify', 'change', 'update', 'fix', 'build', 'remove', 'delete', 'color', 'size', 'button', 'component'];
    const hasCodeIntent = codeKeywords.some(kw => message.toLowerCase().includes(kw)) || !!selectedElement;

    if (hasCodeIntent) {
      console.log(`🚀 [Unified] Code intent detected, executing vibe coding...`);
      
      res.write(`data: ${JSON.stringify({ type: 'status', phase: 'Vibe Coding', message: 'Analyzing code changes...', icon: '🤖' })}\n\n`);

      try {
        // Execute Gemini Vibe Code
        const vibeResult = await geminiEngine.execute({
          userRequest: message,
          visualEditorContext: selectedElement ? { selectedElement, previewPath: previewPath || '/' } : undefined,
          executionMode,
          conversationHistory: messageHistory.map(m => ({ role: m.role as any, content: m.content }))
        });

        console.log(`🤖 [Unified] Gemini result: needsClarification=${vibeResult.needsClarification}, tasks=${vibeResult.tasks.length}, model=${vibeResult.modelUsed}, cost=$${vibeResult.costEstimate}`);

        // Send vibe coding results
        res.write(`data: ${JSON.stringify({ 
          type: 'vibe_result',
          needsClarification: vibeResult.needsClarification,
          clarificationQuestion: vibeResult.clarificationQuestion,
          tasks: vibeResult.tasks,
          codeChanges: vibeResult.codeChanges,
          modelUsed: vibeResult.modelUsed,
          costEstimate: vibeResult.costEstimate
        })}\n\n`);

      } catch (vibeError) {
        console.error(`❌ [Unified] Vibe coding error:`, vibeError);
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'Vibe coding failed' })}\n\n`);
      }
    }

    // End stream
    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (error) {
    console.error(`❌ [Unified] Error:`, error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Unified endpoint failed' });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Server error' })}\n\n`);
      res.end();
    }
  }
});

export default router;
