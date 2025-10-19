/**
 * AI Model Service - Multi-Model Routing
 * Per mb.md lines 1030-1051
 * Supports GPT-4o, Claude, Gemini with intelligent routing
 */

import OpenAI from 'openai';

// Initialize OpenAI client (using Replit AI Integrations)
// No API key needed - billed to credits
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder',
  baseURL: process.env.OPENAI_BASE_URL,
});

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class AIModelService {
  /**
   * Call GPT-4o (primary model)
   * mb.md lines 1034-1036
   */
  async callGPT4o(messages: AIMessage[]): Promise<AIResponse> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 1024,
      });

      return {
        content: response.choices[0].message.content || '',
        model: 'gpt-4o',
        usage: response.usage as any,
      };
    } catch (error: any) {
      console.error('GPT-4o API Error:', error);
      throw new Error(`GPT-4o failed: ${error.message}`);
    }
  }

  /**
   * Call Claude (fallback)
   * Uses ANTHROPIC_API_KEY from secrets
   */
  async callClaude(messages: AIMessage[]): Promise<AIResponse> {
    // Claude integration using existing ANTHROPIC_API_KEY
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    
    if (!anthropicKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          messages: messages.filter(m => m.role !== 'system'),
          system: messages.find(m => m.role === 'system')?.content,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.content[0].text,
        model: 'claude-3.5-sonnet',
        usage: {
          prompt_tokens: data.usage.input_tokens,
          completion_tokens: data.usage.output_tokens,
          total_tokens: data.usage.input_tokens + data.usage.output_tokens,
        },
      };
    } catch (error: any) {
      console.error('Claude API Error:', error);
      throw new Error(`Claude failed: ${error.message}`);
    }
  }

  /**
   * Call Gemini (fallback)
   * Uses GEMINI_API_KEY from secrets
   */
  async callGemini(messages: AIMessage[]): Promise<AIResponse> {
    const geminiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    try {
      // Convert messages to Gemini format
      const contents = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      const systemInstruction = messages.find(m => m.role === 'system')?.content;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.candidates[0].content.parts[0].text,
        model: 'gemini-pro',
      };
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      throw new Error(`Gemini failed: ${error.message}`);
    }
  }

  /**
   * Intelligent routing to best available model
   * Priority: GPT-4o > Claude > Gemini
   */
  async route(model: string, messages: AIMessage[]): Promise<AIResponse> {
    // Use specified model or default to GPT-4o
    const targetModel = model || 'gpt-4o';

    try {
      switch (targetModel) {
        case 'gpt-4o':
        case 'gpt-4':
        case 'openai':
          return await this.callGPT4o(messages);

        case 'claude':
        case 'claude-3.5-sonnet':
        case 'anthropic':
          return await this.callClaude(messages);

        case 'gemini':
        case 'gemini-pro':
        case 'google':
          return await this.callGemini(messages);

        default:
          console.warn(`Unknown model ${targetModel}, defaulting to GPT-4o`);
          return await this.callGPT4o(messages);
      }
    } catch (error: any) {
      // Fallback chain: GPT-4o → Claude → Gemini
      console.error(`Primary model ${targetModel} failed, attempting fallback...`);
      
      if (targetModel !== 'gpt-4o') {
        try {
          return await this.callGPT4o(messages);
        } catch (gptError) {
          console.error('GPT-4o fallback failed, trying Claude...');
        }
      }

      if (targetModel !== 'claude') {
        try {
          return await this.callClaude(messages);
        } catch (claudeError) {
          console.error('Claude fallback failed, trying Gemini...');
        }
      }

      if (targetModel !== 'gemini') {
        return await this.callGemini(messages);
      }

      throw new Error('All AI models failed');
    }
  }
}

// Singleton instance
export const aiModelService = new AIModelService();
