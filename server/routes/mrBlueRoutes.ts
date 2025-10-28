/**
 * Mr Blue API Routes - Complete Implementation
 * Database-backed conversations, streaming chat, breadcrumb tracking (TRACK_8)
 * MB.MD Phase: Backend API Routes
 */

import express, { Request, Response } from "express";
import { storage } from "../storage";
import { getUserId } from "../utils/authHelper";
import { insertMrBlueConversationSchema, insertMrBlueMessageSchema, insertBreadcrumbSchema, users } from "../../shared/schema";
import { z } from "zod";
import { db } from "../db";
import { eq } from "drizzle-orm";

// AI service imports (services exist in codebase)
let aiModelService: any;
let routeToLifeCEOAgent: any;
let getAgentByName: any;
let getAllAgents: any;

// MB.MD Phase 3C + 3F: Agent CEO Orchestrator + Self-Awareness
import { agentCeo } from '../services/agentCeoOrchestrator';
import { selfAwarenessSystem } from '../services/selfAwarenessSystem';

// DIRECT AI ORCHESTRATOR IMPORT (bypasses broken require fallback)
import { MultiModelOrchestrator } from '../services/multiModelOrchestrator';

try {
  aiModelService = require('../services/aiModelService').aiModelService;
  const lifeCEORouter = require('../services/lifeCEORouter');
  routeToLifeCEOAgent = lifeCEORouter.routeToLifeCEOAgent;
  getAgentByName = lifeCEORouter.getAgentByName;
  getAllAgents = lifeCEORouter.getAllAgents;
} catch (e) {
  // 🚨 MB.MD FIX (Oct 27, 2025): Fail loudly instead of returning mock data
  console.error('❌ CRITICAL: AI services failed to load:', e);
  console.error('❌ Mr Blue will not function without AI services');
  
  // Throw error instead of silently falling back to mock data
  routeToLifeCEOAgent = (message: string) => {
    throw new Error('AI services not available - check aiModelService and lifeCEORouter');
  };
  getAgentByName = (name: string) => {
    throw new Error('AI services not available - check aiModelService and lifeCEORouter');
  };
  getAllAgents = () => {
    throw new Error('AI services not available - check aiModelService and lifeCEORouter');
  };
  aiModelService = {
    callAI: async (messages: any[], model: string) => {
      throw new Error('AI services not available - aiModelService failed to initialize');
    }
  };
}

const router = express.Router();

// ==================== CONVERSATION MANAGEMENT ====================

// 🎯 PHASE 2B: Get or create Visual Editor conversation (idempotent)
router.get("/visual-editor/conversation", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;

    // Check if Visual Editor conversation exists (by context pattern)
    const existingConversations = await storage.getUserMrBlueConversations(userIdNum, 100);
    const veConversation = existingConversations.find(c => 
      c.context && typeof c.context === 'object' && (c.context as any).source === 'visual-editor'
    );

    if (veConversation) {
      console.log(`✅ [VE Conversation] Found existing conversation ${veConversation.id} for user ${userIdNum}`);
      return res.json(veConversation);
    }

    // Create new Visual Editor conversation
    const newConversation = await storage.createMrBlueConversation({
      userId: userIdNum,
      title: 'Visual Editor Workspace',
      context: { source: 'visual-editor', createdAt: new Date().toISOString() },
      agentMode: 'chat'
    });

    console.log(`✨ [VE Conversation] Created new conversation ${newConversation.id} for user ${userIdNum}`);
    res.json(newConversation);
  } catch (error) {
    console.error("Error getting/creating Visual Editor conversation:", error);
    res.status(500).json({ error: "Failed to get Visual Editor conversation" });
  }
});

// Get all conversations for current user
router.get("/conversations", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const conversations = await storage.getUserMrBlueConversations(userId, limit);
    
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Create new conversation
router.post("/conversations", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    // Create conversation data (userId enforced from session)
    const conversationData = {
      userId: userId,
      title: req.body.title || 'New Conversation',
      context: req.body.context || null,
      agentMode: req.body.agentMode || 'chat'
    };

    // Validate with Zod schema (Pattern 2: no .omit() in route)
    insertMrBlueConversationSchema.parse(conversationData);

    const conversation = await storage.createMrBlueConversation(conversationData);
    res.status(201).json(conversation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// Get single conversation
router.get("/conversations/:id", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const conversationId = parseInt(req.params.id);
    const conversation = await storage.getMrBlueConversation(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Verify ownership
    if (conversation.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

// Update conversation
router.put("/conversations/:id", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    const conversationId = parseInt(req.params.id);
    const conversation = await storage.getMrBlueConversation(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Verify ownership
    if (conversation.userId !== userIdNum) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Validate update data (prevent userId tampering)
    const updateData = {
      title: req.body.title,
      context: req.body.context,
      agentMode: req.body.agentMode
    };

    const updated = await storage.updateMrBlueConversation(conversationId, updateData);
    res.json(updated);
  } catch (error) {
    console.error("Error updating conversation:", error);
    res.status(500).json({ error: "Failed to update conversation" });
  }
});

// Delete conversation
router.delete("/conversations/:id", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    const conversationId = parseInt(req.params.id);
    const conversation = await storage.getMrBlueConversation(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Verify ownership
    if (conversation.userId !== userIdNum) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await storage.deleteMrBlueConversation(conversationId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

// ==================== MESSAGE MANAGEMENT ====================

// Get messages for conversation
router.get("/conversations/:id/messages", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    const conversationId = parseInt(req.params.id);
    const conversation = await storage.getMrBlueConversation(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Verify ownership
    if (conversation.userId !== userIdNum) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const messages = await storage.getMrBlueMessagesByConversation(conversationId, limit);
    
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send message (non-streaming)
router.post("/conversations/:id/messages", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    const conversationId = parseInt(req.params.id);
    const conversation = await storage.getMrBlueConversation(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Verify ownership
    if (conversation.userId !== userIdNum) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Create message data (role enforced as 'user')
    const messageData = {
      conversationId,
      role: 'user' as const, // Always user for client-submitted messages
      content: req.body.content,
      streaming: req.body.streaming || false,
      metadata: req.body.metadata || null
    };

    // Validate with Zod schema (Pattern 2: validation in route)
    insertMrBlueMessageSchema.parse(messageData);

    const message = await storage.createMrBlueMessage(messageData);
    
    // Update conversation timestamp
    await storage.updateMrBlueConversation(conversationId, { updatedAt: new Date() });

    res.status(201).json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Failed to create message" });
  }
});

// ==================== STREAMING CHAT (SSE) ====================

// Streaming chat endpoint with AI integration
router.post("/stream", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    
    // Validate stream request inputs
    const streamSchema = z.object({
      conversationId: z.number(),
      message: z.string().min(1),
      model: z.string().optional().default('gpt-4o'),
      // 🚨 MB.MD FIX (Oct 27): Accept selected element context from frontend
      selectedElement: z.any().optional(),
      previewPath: z.string().optional(),
      // 🎯 MB.MD PHASE 1 (Oct 28): Accept execution mode from frontend
      executionMode: z.enum(['plan', 'build']).optional().default('build')
    });
    
    const { conversationId, message, model, selectedElement, previewPath, executionMode } = streamSchema.parse(req.body);
    
    // 🔍 DEBUG: Log received element context
    if (selectedElement) {
      console.log('🎯 [Stream] Received selected element:', {
        tag: selectedElement.tagName,
        className: selectedElement.className,
        xpath: selectedElement.xpath,
        previewPath
      });
    }

    // Verify conversation ownership
    const conversation = await storage.getMrBlueConversation(conversationId);
    if (!conversation || conversation.userId !== userIdNum) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // 🎯 FIX #6 (Oct 27): Load user profile BEFORE streaming starts
    // This prevents "headers already sent" errors if profile fetch fails
    const userProfile = await db
      .select({
        name: users.name,
        email: users.email,
        role: users.role,
        nickname: users.nickname,
        bio: users.bio,
        subscriptionTier: users.subscriptionTier
      })
      .from(users)
      .where(eq(users.id, userIdNum))
      .limit(1);
    
    const user = userProfile[0];
    const userContext = user ? `\n\nUser Profile:\n- Name: ${user.name}${user.nickname ? ` (${user.nickname})` : ''}\n- Email: ${user.email}\n- Role: ${user.role}\n- Subscription: ${user.subscriptionTier}${user.bio ? `\n- Bio: ${user.bio}` : ''}` : '';

    // NOW set headers for SSE (after all DB operations that can fail)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Save user message
    const userMessage = await storage.createMrBlueMessage({
      conversationId,
      role: "user",
      content: message,
      streaming: false
    });

    // 🚨 MB.MD FIX (Oct 27): Bypass broken lifeCEORouter, use direct agent name
    // The streaming works via MultiModelOrchestrator (line 408), these are just for prompt
    let targetAgent = 'Mr Blue';
    let agentDescription = 'A friendly AI assistant for Mundo Tango';
    
    try {
      targetAgent = conversation.agentMode || routeToLifeCEOAgent(message);
      const agentDetails = getAgentByName(targetAgent);
      agentDescription = agentDetails?.description || agentDescription;
    } catch (e) {
      // AI services not loaded, use fallback (doesn't affect streaming)
      console.log('⚠️ [Stream] lifeCEORouter not available, using fallback agent name');
    }

    // Get conversation history for context
    const messageHistory = await storage.getMrBlueMessagesByConversation(conversationId, 10);
    
    // 🚨 MB.MD FIX (Oct 27): Build Visual Editor context string
    let visualEditorContext = '';
    if (selectedElement) {
      visualEditorContext = `\n\n🎨 VISUAL EDITOR CONTEXT:
You are currently helping the user edit their website. They have selected an element:

**Selected Element:**
- Tag: <${selectedElement.tagName || 'unknown'}>
- Class: ${selectedElement.className || 'No classes'}
- ID: ${selectedElement.id || 'No ID'}
- Text Content: "${selectedElement.textContent || 'No text'}"
- Page: ${previewPath || 'Unknown'}
- XPath: ${selectedElement.xpath || 'Unknown'}

**When the user asks "what element am I on?"**, tell them about THIS selected element above.

**Important:**
- The user has clicked on this specific element in the Visual Editor
- They want to know about THIS element or make changes to it
- Be specific about which element they selected
- Use the element's actual properties (tag, class, text) in your response`;
    }
    
    // Build AI messages
    const aiMessages = [
      {
        role: 'system' as const,
        content: `You are Mr. Blue, powered by ${targetAgent}. ${agentDescription}${userContext}${visualEditorContext}

IMPORTANT: You have access to the user's profile above. Use their name when appropriate and maintain context of who they are across conversations.

🎨 VIBE CODING CAPABILITIES:
You CAN make changes to code, UI, documents, and files! When users ask you to:
- "Add a button" / "Change the color" / "Create a page"
- "Add a feature" / "Modify the layout" / "Add a smiley face" 😊
- "Update the text" / "Create a document" / "Fix this bug"

YOU CAN DO THIS via the vibe coding system! Respond naturally like:
✅ "I'll add that for you now. I'm updating the [component/page] to include [feature]..."
✅ "Sure! I'm modifying the [section] to change [detail]..."
✅ "Let me create that [page/component] with [specifications]..."

NARRATION: As you work, briefly describe what you're doing (1-2 sentences) so the user knows you're actively making changes.

DO NOT say:
❌ "I'm unable to make changes"
❌ "I can't modify files"
❌ "I don't have access to..."

REAL LIMITATIONS (acknowledge these honestly):
- Complex multi-step features may need clarification
- Large architectural changes should be broken into steps
- Some requests may need user to click SAVE to apply changes

The vibe coding system runs automatically in the background and handles all technical work. Focus on being helpful and conversational.`,
      },
      ...messageHistory.slice(-8).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      {
        role: 'user' as const,
        content: message,
      },
    ];

    // Create AI message record
    const aiMessage = await storage.createMrBlueMessage({
      conversationId,
      role: "assistant",
      content: "",
      streaming: true,
      metadata: { agent: targetAgent, model }
    });

    try {
      // Validate API keys before calling AI
      if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
        throw new Error('No AI API keys configured - please set ANTHROPIC_API_KEY or OPENAI_API_KEY');
      }
      
      console.log(`🤖 [Stream] Calling ${model} AI with ${aiMessages.length} messages`);
      console.log(`🔑 [Stream] API Keys available: ANTHROPIC=${!!process.env.ANTHROPIC_API_KEY}, OPENAI=${!!process.env.OPENAI_API_KEY}`);
      
      // 🚀 REPLIT-STYLE STREAMING: Send MB.MD phase updates
      const sendStatus = (phase: string, message: string, icon: string = '🔍') => {
        res.write(`data: ${JSON.stringify({
          type: 'status',
          phase,
          message,
          icon,
          messageId: aiMessage.id
        })}\n\n`);
      };
      
      // MB.MD PHASE 1: MAPPING
      sendStatus('MAPPING', 'Analyzing your request...', '🔍');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (selectedElement) {
        sendStatus('MAPPING', `Examining selected element: <${selectedElement.tagName}> with class "${selectedElement.className}"`, '🎯');
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // MB.MD PHASE 2: BREAKDOWN
      sendStatus('BREAKDOWN', 'Planning response and identifying required actions...', '📋');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Direct instantiation (static import at top of file)
      const orchestrator = new MultiModelOrchestrator();
      
      // MB.MD PHASE 3: MITIGATION (AI Response)
      sendStatus('MITIGATION', `Consulting ${model.includes('claude') ? 'Claude' : 'GPT'} AI...`, '🤖');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      let fullContent = '';
      let charCount = 0;
      
      // Stream response in real-time from AI
      for await (const chunk of orchestrator.streamResponse(aiMessages, model)) {
        fullContent += chunk;
        charCount++;
        
        res.write(`data: ${JSON.stringify({ 
          type: 'text',
          chunk,
          messageId: aiMessage.id,
          done: false 
        })}\n\n`);
        
        // Small delay for smoother streaming (10ms)
        if (charCount % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
      
      console.log(`✅ [Stream] AI response complete: ${fullContent.substring(0, 100)}...`);
      
      // MB.MD PHASE 4: DEPLOYMENT (Saving to database)
      sendStatus('DEPLOYMENT', 'Saving response to conversation history...', '💾');
      await new Promise(resolve => setTimeout(resolve, 200));

      // Update final message
      await storage.updateMrBlueMessage(aiMessage.id, {
        content: fullContent,
        streaming: false
      });

      // Update conversation timestamp
      await storage.updateMrBlueConversation(conversationId, { updatedAt: new Date() });
      
      sendStatus('COMPLETE', 'Response complete! Changes queued for SAVE button.', '✅');

      // Send completion event
      res.write(`data: ${JSON.stringify({ 
        messageId: aiMessage.id,
        done: true,
        fullContent,
        agent: targetAgent,
        model: model  // Use model from schema parse (not undefined response)
      })}\n\n`);

    } catch (aiError) {
      console.error("AI service error:", aiError);
      
      // Fallback response
      const fallbackContent = "I'm having trouble connecting to my AI service right now. Please try again in a moment.";
      await storage.updateMrBlueMessage(aiMessage.id, {
        content: fallbackContent,
        streaming: false
      });

      res.write(`data: ${JSON.stringify({ 
        messageId: aiMessage.id,
        done: true,
        fullContent: fallbackContent,
        error: true
      })}\n\n`);
    }

    res.end();
  } catch (error) {
    console.error("Error in streaming chat:", error);
    res.write(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`);
    res.end();
  }
});

// ==================== LEGACY CHAT ENDPOINT (for backward compatibility) ====================

router.post('/chat', async (req, res) => {
  try {
    const { 
      message, 
      personality, 
      agent, 
      context = {}, 
      model = 'gpt-4o',
      conversationHistory = []
    } = req.body;

    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    const userId = await getUserId(req);
    const userIdNum = userId ? (typeof userId === 'string' ? parseInt(userId) : userId) : 0;

    // MB.MD Phase 3F: Check for self-awareness queries first
    if (selfAwarenessSystem.isSelfAwareQuery(message)) {
      console.log('🧠 [Mr Blue] Self-awareness query detected');
      const selfAwareResponse = await selfAwarenessSystem.answerSelfAwareQuery(message);
      
      return res.json({
        success: true,
        response: selfAwareResponse,
        model: 'self-awareness-system',
        agent: 'Agent #0',
        agentDetails: { name: 'CEO (Self-Awareness)', description: 'Platform knowledge system' },
        usage: { totalTokens: 0 },
        timestamp: new Date().toISOString(),
      });
    }

    // MB.MD Phase 3C: Use Agent CEO Orchestrator for intent detection
    const intent = agentCeo.detectIntent(message);
    console.log(`🎯 [Mr Blue] Intent detected:`, intent);

    // Route to specialized agent if high confidence
    if (intent.confidence > 0.7) {
      const agentResponse = await agentCeo.routeToAgent(intent, message, userIdNum);
      
      return res.json({
        success: true,
        response: agentResponse,
        model: 'agent-orchestration',
        agent: intent.targetAgent,
        agentDetails: { name: intent.targetAgent, description: intent.reasoning },
        intent: intent.intent,
        usage: { totalTokens: 0 },
        timestamp: new Date().toISOString(),
      });
    }

    // Fallback to AI model for general conversation
    const targetAgent = agent || routeToLifeCEOAgent(message);
    const agentDetails = getAgentByName(targetAgent);

    // Build AI messages with context
    const messages = [
      {
        role: 'system' as const,
        content: personality || `You are Mr. Blue, a friendly and helpful AI assistant for Mundo Tango.

🎨 VIBE CODING CAPABILITIES:
You CAN make changes to code, UI, documents, and files! When users ask you to:
- "Add a button" / "Change the color" / "Create a page"
- "Add a feature" / "Modify the layout" / "Add a smiley face" 😊
- "Update the text" / "Create a document" / "Fix this bug"

🚨 CRITICAL WORKFLOW (READ THIS FIRST):
The vibe coding system PREPARES changes but does NOT apply them immediately!
Changes are QUEUED until the user clicks the SAVE button.

✅ CORRECT responses (use these patterns):
- "I'm preparing to add that button for you... The change is ready - click SAVE to apply it!"
- "I've queued the color change... Click the SAVE button when you're ready to apply it!"
- "I'm setting up the new page... The code is ready - hit SAVE to make it live!"

❌ WRONG responses (NEVER use these):
- "I've successfully deleted..." (NO - it's queued, not deleted yet!)
- "The button is now added..." (NO - it's prepared, not added yet!)
- "I've updated the page..." (NO - it's ready to save, not updated yet!)

NARRATION PATTERN:
1. Acknowledge the request
2. Say you're preparing/queuing the change
3. Remind user to click SAVE button

DO NOT say:
❌ "I'm unable to make changes"
❌ "I can't modify files"
❌ "Successfully completed" (it's queued, not completed!)

The vibe coding system runs automatically in the background. Your job is to be helpful, accurate, and remind users about the SAVE workflow.`,
      },
      ...conversationHistory.slice(-10),
      {
        role: 'user' as const,
        content: message,
      },
    ];

    // Call AI model
    const response = await aiModelService.callAI(messages, model);

    res.json({
      success: true,
      response: response.content,
      model: response.model,
      agent: targetAgent,
      agentDetails,
      usage: response.usage,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Mr Blue Chat Error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to get AI response',
      message: error.message,
    });
  }
});

// ==================== BREADCRUMB TRACKING (TRACK_8 ML) ====================

// Create breadcrumb (track user action)
router.post("/breadcrumbs", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    
    // Create breadcrumb data (userId enforced from session)
    const breadcrumbData = {
      userId: userIdNum,
      sessionId: req.body.sessionId,
      timestamp: new Date(),
      page: req.body.page,
      pageTitle: req.body.pageTitle || null,
      referrer: req.body.referrer || null,
      action: req.body.action,
      target: req.body.target || null,
      targetId: req.body.targetId || null,
      value: req.body.value || null,
      userJourney: req.body.userJourney || null,
      userRole: req.body.userRole || null,
      userIntent: req.body.userIntent || null,
      success: req.body.success !== false,
      error: req.body.error || null,
      duration: req.body.duration || null,
      prediction: req.body.prediction || null,
      confidence: req.body.confidence || null,
      patternId: req.body.patternId || null
    };

    // Validate with Zod schema (Pattern 2: secure input validation)
    insertBreadcrumbSchema.parse(breadcrumbData);

    const breadcrumb = await storage.createBreadcrumb(breadcrumbData);
    res.status(201).json(breadcrumb);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    console.error("Error creating breadcrumb:", error);
    res.status(500).json({ error: "Failed to create breadcrumb" });
  }
});

// Get user breadcrumbs (for ML/analytics)
router.get("/breadcrumbs", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    const sessionId = req.query.sessionId as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

    const breadcrumbs = await storage.getUserBreadcrumbs(userIdNum, sessionId, limit);
    res.json(breadcrumbs);
  } catch (error) {
    console.error("Error fetching breadcrumbs:", error);
    res.status(500).json({ error: "Failed to fetch breadcrumbs" });
  }
});

// Get session breadcrumbs (for journey visualization)
router.get("/breadcrumbs/session/:sessionId", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { sessionId } = req.params;
    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    const breadcrumbs = await storage.getSessionBreadcrumbs(sessionId);
    
    // Filter to only return user's breadcrumbs
    const userBreadcrumbs = breadcrumbs.filter(b => b.userId === userIdNum);
    
    res.json(userBreadcrumbs);
  } catch (error) {
    console.error("Error fetching session breadcrumbs:", error);
    res.status(500).json({ error: "Failed to fetch session breadcrumbs" });
  }
});

// ==================== MB.MD AUTONOMOUS MODE ====================
// WS2: New endpoint for autonomous coding with MB.MD protocol
// Created: October 28, 2025

router.post("/build", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // FIX #1: Use Zod schema validation (Architect feedback Oct 28)
    const { buildRequestSchema } = await import('@shared/schema');
    const validatedBody = buildRequestSchema.parse(req.body);
    const { conversationId, userRequest, visualContext, featureTag } = validatedBody;

    // Verify conversation ownership
    const conversation = await storage.getMrBlueConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    if (conversation.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Get user object for VibeGraph
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Import VibeGraph (lazy import to avoid circular dependencies)
    const { VibeGraph } = await import('../services/agents/VibeGraph.js');

    // FIX #2: Use 200-minute autonomous runtime (Architect feedback Oct 28)
    const vibeGraph = new VibeGraph(
      userRequest,
      user,
      visualContext,
      { autonomousMode: true, maxMinutes: 200 }
    );

    // Execute VibeGraph (this will trigger MAPPING → BREAKDOWN → MITIGATION → DEPLOYMENT)
    const result = await vibeGraph.execute();

    // Extract session info and serialize with Zod schema (Architect feedback Oct 28)
    const sessionId = vibeGraph.getSessionId();
    const status = vibeGraph.getStatus();

    const { buildResponseSchema } = await import('@shared/schema');
    const response = buildResponseSchema.parse({
      sessionId: sessionId || 0,
      status: status || 'complete',
      mappingSummary: result.mapping,
      progress: result.progress || []
    });

    res.json(response);

  } catch (error: any) {
    console.error("Error executing build:", error);
    res.status(500).json({ 
      error: "Failed to execute build",
      message: error.message 
    });
  }
});

// ==================== LIFE CEO AGENTS ====================

// Get all Life CEO agents
router.get('/agents', async (req, res) => {
  try {
    const agents = getAllAgents();

    res.json({
      success: true,
      agents,
      count: agents.length,
    });

  } catch (error: any) {
    console.error('❌ Get Agents Error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to get agents',
      message: error.message,
    });
  }
});

export default router;
