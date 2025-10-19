/**
 * AI Model Service
 * Multi-model AI routing: GPT-4o (primary), Claude, Gemini (fallbacks)
 * mb.md lines 652-687
 */

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  content: string;
  model: string;
  usage?: any;
}

/**
 * Call OpenAI GPT-4o (primary model)
 */
export async function callGPT4o(messages: AIMessage[]): Promise<AIResponse> {
  // Use Replit AI integration (no API key needed)
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`GPT-4o error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    content: data.choices[0].message.content,
    model: 'gpt-4o',
    usage: data.usage,
  };
}

/**
 * Call Claude as fallback
 */
export async function callClaude(messages: AIMessage[]): Promise<AIResponse> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: messages.filter(m => m.role !== 'system'),
      system: messages.find(m => m.role === 'system')?.content,
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude error: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    content: data.content[0].text,
    model: 'claude-3-5-sonnet',
    usage: data.usage,
  };
}

/**
 * Call Gemini as fallback
 */
export async function callGemini(messages: AIMessage[]): Promise<AIResponse> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: messages
          .filter(m => m.role !== 'system')
          .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini error: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    content: data.candidates[0].content.parts[0].text,
    model: 'gemini-pro',
  };
}

/**
 * Call AI with fallback logic
 * GPT-4o → Claude → Gemini
 */
export async function callAI(messages: AIMessage[], preferredModel = 'gpt-4o'): Promise<AIResponse> {
  const models = [
    { name: 'gpt-4o', fn: callGPT4o },
    { name: 'claude', fn: callClaude },
    { name: 'gemini', fn: callGemini },
  ];

  // Put preferred model first
  const sortedModels = models.sort((a, b) => 
    a.name === preferredModel ? -1 : b.name === preferredModel ? 1 : 0
  );

  let lastError: Error | null = null;

  for (const model of sortedModels) {
    try {
      console.log(`🤖 Calling ${model.name}...`);
      const response = await model.fn(messages);
      console.log(`✅ ${model.name} responded successfully`);
      return response;
    } catch (error: any) {
      console.error(`❌ ${model.name} failed:`, error.message);
      lastError = error;
      continue;
    }
  }

  throw new Error(`All AI models failed. Last error: ${lastError?.message}`);
}

export const aiModelService = {
  callGPT4o,
  callClaude,
  callGemini,
  callAI,
};
