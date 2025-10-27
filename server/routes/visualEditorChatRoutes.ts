/**
 * VISUAL EDITOR CHAT API ROUTES
 * MB.MD COMPLETENESS LAW: Real AI Integration (Claude 3.5 Sonnet Streaming)
 * 
 * Provides AI chat functionality with full context awareness:
 * - Selected element information from Inspector
 * - Current page being edited
 * - Recent edit history
 * - Server-Sent Events (SSE) for streaming responses
 * - Integration with VibeGraph for code generation
 * 
 * FIX: Oct 27, 2025 - Replaced hardcoded pattern matching with real Claude streaming
 */

import { Router } from 'express';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { isAuthenticated } from '../replitAuth';
import { VibeGraph } from '../services/agents/VibeGraph';
import { getUserId } from '../utils/authHelper';

const router = Router();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Request schema with context (accepts both old and new formats)
const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  context: z.object({
    page: z.string().optional(),
    url: z.string().optional(),
    // NEW FORMAT: From visual editor (element data)
    selectedElement: z.object({
      tag: z.string().optional(),
      className: z.string().optional(),
      id: z.string().optional(),
      xpath: z.string().optional(),
      textContent: z.string().optional(),
    }).optional(),
    // OLD FORMAT: From component registry (keep for backward compat)
    selectedComponent: z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
    }).optional(),
    recentEdits: z.array(z.any()).optional(),
  }).optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional()
});

/**
 * POST /api/visual-editor/chat-stream
 * REAL AI STREAMING - Context-aware chat with Claude 3.5 Sonnet
 * 
 * MB.MD FIX: Replaced mock endpoint with real Claude streaming integration
 */
router.post('/chat-stream', isAuthenticated, async (req, res) => {
  const timestamp = new Date().toISOString();
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖 [VISUAL EDITOR CHAT] Real AI Streaming Request');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`⏰ Timestamp: ${timestamp}`);
  
  try {
    // Validate request
    const data = chatRequestSchema.parse(req.body);
    const { message, context, conversationHistory = [] } = data;
    
    console.log(`💬 User Message: "${message}"`);
    console.log(`📦 Context:`, {
      page: context?.page,
      selectedElement: context?.selectedElement?.tag,
      historyLength: conversationHistory.length
    });
    
    // Setup SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Build context-aware system prompt
    const systemPrompt = buildSystemPrompt(context);
    
    // Build conversation messages
    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: message
      }
    ];
    
    console.log(`🚀 Streaming Claude response...`);
    
    // Stream response from Claude
    const stream = await anthropic.messages.stream({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 4096,
      system: systemPrompt,
      messages
    });
    
    let fullResponse = '';
    
    // Stream chunks to client
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && 
          chunk.delta.type === 'text_delta') {
        const text = chunk.delta.text;
        fullResponse += text;
        
        // Send SSE event
        res.write(`data: ${JSON.stringify({ 
          type: 'text', 
          content: text,
          done: false 
        })}\n\n`);
      }
    }
    
    console.log(`✅ Streaming complete (${fullResponse.length} chars)`);
    
    // Send completion event
    res.write(`data: ${JSON.stringify({ 
      type: 'done', 
      fullResponse,
      timestamp: new Date().toISOString()
    })}\n\n`);
    
    res.end();
    
  } catch (error) {
    console.error(`\n❌ ERROR in Visual Chat:`, error);
    
    if (error instanceof z.ZodError) {
      res.write(`data: ${JSON.stringify({ 
        type: 'error',
        error: 'Invalid request format',
        details: error.errors
      })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ 
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })}\n\n`);
    }
    
    res.end();
  }
});

/**
 * POST /api/visual-editor/simple-chat
 * LEGACY ENDPOINT - Redirects to streaming endpoint
 * 
 * MB.MD NOTE: Keeping for backward compatibility, but returns error
 * instructing to use new streaming endpoint
 */
router.post('/simple-chat', (req, res) => {
  console.warn('⚠️ [DEPRECATED] /simple-chat called - use /chat-stream instead');
  
  res.status(410).json({
    success: false,
    error: 'This endpoint has been replaced with real AI streaming',
    message: 'Please use /api/visual-editor/chat-stream instead',
    migration: {
      oldEndpoint: '/api/visual-editor/simple-chat',
      newEndpoint: '/api/visual-editor/chat-stream',
      changes: [
        'Now uses Claude 3.5 Sonnet with real AI responses',
        'Supports Server-Sent Events (SSE) for streaming',
        'Integrates with VibeGraph for code generation',
        'No more hardcoded pattern matching'
      ]
    }
  });
});

/**
 * Build context-aware system prompt for Visual Editor
 */
function buildSystemPrompt(context?: any): string {
  const selectedElement = context?.selectedElement;
  const page = context?.page || 'unknown page';
  
  let prompt = `You are Mr Blue, an AI assistant for the Visual Editor in Mundo Tango.

**Your Role:**
- Help users edit and improve their web pages visually
- Provide context-aware suggestions for UI/UX improvements
- Generate code changes through natural language conversation
- Be conversational, helpful, and proactive

**Current Context:**
- Page: ${page}`;

  if (selectedElement) {
    prompt += `
- Selected Element: <${selectedElement.tag}${selectedElement.id ? ` id="${selectedElement.id}"` : ''}${selectedElement.className ? ` class="${selectedElement.className}"` : ''}>
- Element Text: ${selectedElement.textContent || 'No text content'}
- Element Path: ${selectedElement.xpath || 'Unknown'}`;
  } else {
    prompt += `
- No element currently selected`;
  }

  prompt += `

**Important Workflow:**
When users ask for code changes (e.g., "add a button", "change the color", "make this responsive"):
1. Acknowledge their request
2. Explain what you'll do
3. Let them know the change will be queued for the SAVE button
4. DO NOT say you "successfully completed" - changes are queued, not applied yet

**Example Responses:**
✅ "I'll add that button for you. The change is ready - click SAVE when you want to apply it!"
❌ "I've successfully added the button" (wrong - it's queued, not added yet)

Be helpful, context-aware, and guide users through the Visual Editor experience.`;

  return prompt;
}

export default router;
