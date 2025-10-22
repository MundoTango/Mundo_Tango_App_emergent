/**
 * CHAT SUMMARIZATION API
 * MB.MD Stream 1: Real-time AI summarization for voice transcripts
 * 
 * Endpoint: POST /api/chat/summarize
 */

import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// POST /api/chat/summarize - Summarize transcript into bullets (Agent #128: Visual Context)
router.post('/summarize', async (req, res) => {
  try {
    const { text, visualContext } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text required' });
    }

    // Agent #128: Build context-aware prompt
    let contextNote = '';
    if (visualContext) {
      contextNote = `\n\nVISUAL CONTEXT: User has selected a <${visualContext.tagName}>${visualContext.id ? ` with id="${visualContext.id}"` : ''} element in the Visual Editor. Consider this element when summarizing the conversation.`;
    }

    // Use Claude to summarize
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Summarize this conversation transcript into concise bullet points. Each bullet should be a key point or action item. Format as JSON with:
{
  "bullets": ["Point 1", "Point 2", ...],
  "details": ["Optional expanded context for Point 1", "Context for Point 2", ...]
}${contextNote}

Transcript:
${text}`
      }]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Parse JSON from Claude's response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const summary = JSON.parse(jsonMatch[0]);

    res.json(summary);
  } catch (error: any) {
    console.error('[ChatSummarization] Error:', error);
    res.status(500).json({ 
      error: 'Summarization failed',
      message: error.message 
    });
  }
});

export default router;
