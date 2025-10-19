/**
 * AI Model Service - GPT-4o Integration
 * mb.md lines 1043-1051
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || '',
});

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export const aiModelService = {
  /**
   * Call GPT-4o for chat completion
   */
  async chatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<string> {
    const {
      model = 'gpt-4o',
      temperature = 0.7,
      maxTokens = 2000,
    } = options;

    try {
      console.log(`🤖 Calling ${model}...`);
      
      const response = await openai.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      const content = response.choices[0]?.message?.content || 'No response generated';
      console.log(`✅ ${model} responded successfully`);
      
      return content;
    } catch (error: any) {
      console.error(`❌ ${model} error:`, error.message);
      throw new Error(`AI model error: ${error.message}`);
    }
  },

  /**
   * Stream chat completion (for future use)
   */
  async streamChatCompletion(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    options: ChatCompletionOptions = {}
  ): Promise<void> {
    const {
      model = 'gpt-4o',
      temperature = 0.7,
      maxTokens = 2000,
    } = options;

    try {
      const stream = await openai.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          onChunk(content);
        }
      }
    } catch (error: any) {
      console.error(`❌ Streaming error:`, error.message);
      throw new Error(`AI streaming error: ${error.message}`);
    }
  },
};
