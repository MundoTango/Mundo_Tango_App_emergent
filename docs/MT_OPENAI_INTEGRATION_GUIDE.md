# Mundo Tango OpenAI Integration Guide
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Model:** GPT-4o | **Usage:** 16 Life CEO Agents + Mr Blue AI  
**References:** 190 codebase instances

## Overview

Mundo Tango integrates **OpenAI GPT-4o** for AI-powered features including 16 Life CEO domain agents, Mr Blue conversational AI, content enhancement, and smart recommendations.

---

## Configuration

### **Environment Variables**

```bash
# .env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7
```

**API Key Setup:** Use `ask_secrets` tool or Replit Secrets

---

## Basic Usage

### **Pattern 1: Simple Completion**

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateResponse(prompt: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return completion.choices[0].message.content || '';
}

// Usage
const response = await generateResponse('Explain tango music history');
```

---

### **Pattern 2: Streaming Responses** (Mr Blue AI)

```typescript
async function streamAIResponse(
  prompt: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      onChunk(content);
    }
  }
}

// Integration with WebSocket
app.post('/api/mrblue/chat', authMiddleware, async (req, res) => {
  const { prompt } = req.body;
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  await streamAIResponse(prompt, (chunk) => {
    res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
  });

  res.write('data: [DONE]\n\n');
  res.end();
});
```

---

### **Pattern 3: Function Calling** (Structured Output)

```typescript
async function analyzePostSentiment(content: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You analyze social media posts for sentiment and topics.',
      },
      { role: 'user', content },
    ],
    functions: [
      {
        name: 'analyze_post',
        description: 'Analyze post sentiment and extract topics',
        parameters: {
          type: 'object',
          properties: {
            sentiment: {
              type: 'string',
              enum: ['positive', 'neutral', 'negative'],
            },
            topics: {
              type: 'array',
              items: { type: 'string' },
            },
            confidence: {
              type: 'number',
              minimum: 0,
              maximum: 1,
            },
          },
          required: ['sentiment', 'topics', 'confidence'],
        },
      },
    ],
    function_call: { name: 'analyze_post' },
  });

  const result = JSON.parse(
    completion.choices[0].message.function_call?.arguments || '{}'
  );

  return result; // { sentiment: 'positive', topics: [...], confidence: 0.92 }
}
```

---

## Life CEO Integration

### **Pattern: Domain Agent (Finance)**

```typescript
interface FinanceAdvice {
  summary: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

async function getFinanceAdvice(userContext: any): Promise<FinanceAdvice> {
  const prompt = `
    User Financial Context:
    - Income: $${userContext.income}
    - Expenses: $${userContext.expenses}
    - Savings: $${userContext.savings}
    - Goals: ${userContext.goals.join(', ')}
    
    Provide personalized financial advice.
  `;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a personal finance advisor. Provide actionable advice.',
      },
      { role: 'user', content: prompt },
    ],
    functions: [
      {
        name: 'provide_finance_advice',
        parameters: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            recommendations: {
              type: 'array',
              items: { type: 'string' },
            },
            riskLevel: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
            },
          },
          required: ['summary', 'recommendations', 'riskLevel'],
        },
      },
    ],
    function_call: { name: 'provide_finance_advice' },
  });

  return JSON.parse(
    completion.choices[0].message.function_call?.arguments || '{}'
  );
}

// API endpoint
app.post('/api/lifeceo/finance/advice', authMiddleware, async (req, res) => {
  const advice = await getFinanceAdvice(req.user);
  res.json(apiSuccess({ data: advice }));
});
```

---

## Cost Optimization

### **1. Token Management**

```typescript
// Count tokens before sending
import { encoding_for_model } from 'tiktoken';

function estimateCost(prompt: string): number {
  const encoding = encoding_for_model('gpt-4o');
  const tokens = encoding.encode(prompt).length;
  
  // GPT-4o pricing (as of Oct 2025)
  const inputCost = (tokens / 1000) * 0.005;  // $0.005 per 1K tokens
  const outputCost = (tokens / 1000) * 0.015; // $0.015 per 1K tokens (estimated)
  
  return inputCost + outputCost;
}

// Example
const cost = estimateCost('Long prompt here...');
console.log(`Estimated cost: $${cost.toFixed(4)}`);
```

### **2. Caching Responses**

```typescript
import { queryClient } from '@lib/queryClient';

async function getCachedAIResponse(prompt: string): Promise<string> {
  const cacheKey = `ai:${hash(prompt)}`;
  
  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) return cached;
  
  // Generate response
  const response = await generateResponse(prompt);
  
  // Cache for 1 hour
  await redis.set(cacheKey, response, 'EX', 3600);
  
  return response;
}
```

### **3. Batch Processing**

```typescript
async function batchAnalyzePosts(posts: Post[]): Promise<any[]> {
  const batchSize = 10;
  const results = [];

  for (let i = 0; i < posts.length; i += batchSize) {
    const batch = posts.slice(i, i + batchSize);
    
    const batchPromises = batch.map(post =>
      analyzePostSentiment(post.content)
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}
```

---

## Error Handling

```typescript
async function safeAICall<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error.code === 'insufficient_quota') {
      console.error('OpenAI quota exceeded');
      // Send alert to admin
    } else if (error.code === 'rate_limit_exceeded') {
      console.warn('Rate limit hit, retrying...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      return fn();
    }
    
    console.error('AI call failed:', error);
    return fallback;
  }
}

// Usage
const response = await safeAICall(
  () => generateResponse(prompt),
  'Sorry, I could not process your request.'
);
```

---

## Testing

```typescript
import { describe, it, expect, vi } from 'vitest';

// Mock OpenAI for tests
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            { message: { content: 'Mocked AI response' } },
          ],
        }),
      },
    },
  })),
}));

describe('OpenAI Integration', () => {
  it('generates response', async () => {
    const response = await generateResponse('Test prompt');
    expect(response).toBe('Mocked AI response');
  });
});
```

---

## Production Deployment

### **Environment Setup**

```bash
# Production
OPENAI_API_KEY=sk-prod-...
OPENAI_ORGANIZATION=org-...
OPENAI_MAX_REQUESTS_PER_MINUTE=3000
```

### **Monitoring**

```typescript
// Track usage
let totalTokens = 0;
let totalCost = 0;

openai.chat.completions.create(...).then(completion => {
  const usage = completion.usage;
  totalTokens += usage.total_tokens;
  totalCost += (usage.total_tokens / 1000) * 0.01;
  
  // Log metrics
  console.log(`Total tokens: ${totalTokens}, Total cost: $${totalCost.toFixed(2)}`);
});
```

---

## Next Steps

1. Read `docs/MT_MULTI_AI_PROVIDER_GUIDE.md` for Gemini/Anthropic fallback
2. See `docs/REPLIT_COST_OPTIMIZATION.md` for cost reduction strategies
3. Review Life CEO agent implementations in `agents/lifeceo/`

**Related Files:**
- `server/services/openai.ts` - OpenAI service wrapper
- `agents/lifeceo/*` - 16 Life CEO domain agents
- `server/routes/mrblue.ts` - Mr Blue AI chat endpoints
