/**
 * STAGE 2 TESTING: CHEAP Smoke Tests ($0.02)
 * Real API connectivity validation
 * Created: October 28, 2025
 * 
 * Purpose: Verify API keys work and models are accessible
 * Cost: ~$0.02 per run
 * When to Run: On PR submission
 */

import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

describe('Real AI API Connectivity', () => {
  test('Gemini API connectivity (Flash model)', async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: 'Say "test passed" if you can hear me.'
    });

    expect(response.text).toContain('test passed');
    console.log('✅ Gemini Flash API: CONNECTED');
  }, 30000);

  test('Anthropic Claude API connectivity', async () => {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Say "test passed" if you can hear me.' }]
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    expect(text).toContain('test passed');
    console.log('✅ Claude Sonnet 4 API: CONNECTED');
  }, 30000);

  test('OpenAI GPT-4o API connectivity', async () => {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Say "test passed" if you can hear me.' }]
    });

    const text = response.choices[0]?.message?.content || '';
    expect(text).toContain('test passed');
    console.log('✅ GPT-4o API: CONNECTED');
  }, 30000);
});

/**
 * TEST SUMMARY
 * - 3 real API calls
 * - Total cost: ~$0.02
 * - Execution time: ~10 seconds
 * - Purpose: Validate all AI providers are accessible
 */
