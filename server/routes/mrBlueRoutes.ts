import { Router } from 'express';
import { streamText } from 'ai';
import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db';
import { mrBlueConversations } from '@shared/schema';
import { codeIntelligenceAgent } from '../agents/Agent110_CodeIntelligence';

export const mrBlueRouter = Router();

/*
<important_code_snippet_instructions>
The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229". 
If the user doesn't specify a model, always prefer using "claude-sonnet-4-20250514" as it is the latest model.
</important_code_snippet_instructions>
*/
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// POST /api/mrblue/chat
mrBlueRouter.post('/chat', async (req, res) => {
  try {
    const { messages, pageContext, userRole, mode = 'chat' } = req.body;

    // Build system prompt based on user role and mode
    let systemPrompt = `You are Mr Blue, an AI assistant for the Mundo Tango platform.

Current Page Context: ${JSON.stringify(pageContext)}
User Role: ${userRole}
Mode: ${mode}

`;

    if (userRole === 'super_admin') {
      systemPrompt += `
SUPER ADMIN CAPABILITIES:
- You can read, write, and modify any file in the codebase
- You can execute terminal commands
- You can install/remove packages
- You can generate and preview React components
- Always show a preview before making changes
- Ask for approval before executing destructive actions

Available Tools:
- readFile(path): Read file contents
- writeFile(path, content): Write to file
- searchCodebase(query): Semantic code search
- generateComponent(description): Generate React component
- executeCommand(command): Run terminal command
`;
    }

    // Stream response from Claude
    const stream = await anthropic.messages.stream({
      model: DEFAULT_MODEL_STR,
      max_tokens: 4096,
      messages: messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      system: systemPrompt
    });

    // Convert Anthropic stream to AI SDK format
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk.delta.text)}\n`));
          }
        }
        controller.close();
      }
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    const reader = readableStream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/mrblue/code-intelligence/search
mrBlueRouter.post('/code-intelligence/search', async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;
    const results = await codeIntelligenceAgent.semanticSearch(query, limit);
    res.json({ results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/mrblue/code-intelligence/index
mrBlueRouter.post('/code-intelligence/index', async (req, res) => {
  try {
    const { filePath, content } = req.body;
    await codeIntelligenceAgent.indexFile(filePath, content);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/mrblue/approval/:messageId
mrBlueRouter.post('/approval/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    // Handle approval/rejection logic
    res.json({ success: true, action, messageId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default mrBlueRouter;
