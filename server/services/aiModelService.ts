/**
 * AI Model Service - GPT-4o Integration
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
};
