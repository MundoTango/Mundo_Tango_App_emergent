/**
 * Multi-Model AI Orchestration Service
 * Coordinates ChatGPT, Claude, Gemini, EVO, and HuggingFace models
 * MB.MD Track 2: Multi-Model Orchestration - Oct 21, 2025
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ModelConfig {
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'together' | 'huggingface';
  strengths: string[];
  costPerToken: number;
}

const MODEL_REGISTRY: Record<string, ModelConfig> = {
  'gpt-4o': {
    name: 'gpt-4o',
    provider: 'openai',
    strengths: ['general', 'coding', 'creative'],
    costPerToken: 0.00001,
  },
  'gpt-4-turbo': {
    name: 'gpt-4-turbo',
    provider: 'openai',
    strengths: ['general', 'analysis', 'vision'],
    costPerToken: 0.00001,
  },
  'claude-3-opus': {
    name: 'claude-3-opus-20240229',
    provider: 'anthropic',
    strengths: ['analysis', 'coding', 'long-context'],
    costPerToken: 0.000015,
  },
  'claude-3-sonnet': {
    name: 'claude-sonnet-4-5-20250929',
    provider: 'anthropic',
    strengths: ['balanced', 'fast', 'coding'],
    costPerToken: 0.000003,
  },
  'gemini-pro': {
    name: 'gemini-1.5-pro-latest',
    provider: 'google',
    strengths: ['multimodal', 'vision', 'long-context'],
    costPerToken: 0.0000035,
  },
};

export class MultiModelOrchestrator {
  /**
   * Select best model for the task based on context
   */
  selectModel(context: {
    taskType?: 'general' | 'coding' | 'creative' | 'analysis' | 'vision';
    hasImages?: boolean;
    needsLongContext?: boolean;
    userPreference?: string;
  }): string {
    // User preference overrides
    if (context.userPreference && MODEL_REGISTRY[context.userPreference]) {
      return context.userPreference;
    }

    // Vision tasks → Gemini or GPT-4V
    if (context.hasImages) {
      return 'gemini-pro';
    }

    // Long context → Claude Opus
    if (context.needsLongContext) {
      return 'claude-3-opus';
    }

    // Coding → Claude Sonnet (best balance)
    if (context.taskType === 'coding') {
      return 'claude-3-sonnet';
    }

    // Creative → GPT-4o
    if (context.taskType === 'creative') {
      return 'gpt-4o';
    }

    // Default: Claude Sonnet (fast, cheap, good quality)
    return 'claude-3-sonnet';
  }

  /**
   * Stream response from selected model
   */
  async *streamResponse(
    messages: Array<{ role: string; content: string }>,
    model: string = 'claude-3-sonnet'
  ): AsyncGenerator<string> {
    const config = MODEL_REGISTRY[model];
    if (!config) {
      throw new Error(`Unknown model: ${model}`);
    }

    switch (config.provider) {
      case 'openai':
        yield* this.streamOpenAI(messages, config.name);
        break;
      case 'anthropic':
        yield* this.streamAnthropic(messages, config.name);
        break;
      case 'google':
        yield* this.streamGemini(messages, config.name);
        break;
      default:
        throw new Error(`Provider ${config.provider} not implemented`);
    }
  }

  /**
   * Stream from OpenAI
   */
  private async *streamOpenAI(
    messages: Array<{ role: string; content: string }>,
    model: string
  ): AsyncGenerator<string> {
    const stream = await openai.chat.completions.create({
      model,
      messages: messages as any,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  /**
   * Stream from Anthropic Claude
   */
  private async *streamAnthropic(
    messages: Array<{ role: string; content: string }>,
    model: string
  ): AsyncGenerator<string> {
    // Convert messages format (remove system messages)
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const stream = await anthropic.messages.stream({
      model,
      max_tokens: 4096,
      system: systemMessage?.content,
      messages: userMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })) as any,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text;
      }
    }
  }

  /**
   * Stream from Google Gemini
   */
  private async *streamGemini(
    messages: Array<{ role: string; content: string }>,
    model: string
  ): AsyncGenerator<string> {
    const genModel = gemini.getGenerativeModel({ model });

    // Convert messages to Gemini format (exclude system messages)
    const history = messages
      .slice(0, -1)
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

    const chat = genModel.startChat({ history });
    const lastMessage = messages[messages.length - 1].content;

    const result = await chat.sendMessageStream(lastMessage);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  }

  /**
   * Parallel query multiple models and return best response
   */
  async queryMultipleModels(
    messages: Array<{ role: string; content: string }>,
    models: string[] = ['gpt-4o', 'claude-3-sonnet', 'gemini-pro']
  ): Promise<{ model: string; response: string; confidence: number }[]> {
    const results = await Promise.all(
      models.map(async (model) => {
        try {
          let fullResponse = '';
          for await (const chunk of this.streamResponse(messages, model)) {
            fullResponse += chunk;
          }
          return {
            model,
            response: fullResponse,
            confidence: 0.8, // TODO: Implement confidence scoring
          };
        } catch (error) {
          console.error(`Error with model ${model}:`, error);
          return {
            model,
            response: '',
            confidence: 0,
          };
        }
      })
    );

    return results.filter(r => r.response.length > 0);
  }
}

export const multiModelOrchestrator = new MultiModelOrchestrator();
