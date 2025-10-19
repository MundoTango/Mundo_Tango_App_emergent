# Mundo Tango Multi-AI Provider Guide
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Providers:** OpenAI GPT-4o, Google Gemini, Anthropic Claude  
**Strategy:** Multi-model routing with fallback

## Overview

Mundo Tango implements **multi-AI provider routing** for reliability, cost optimization, and leveraging each model's strengths. This guide covers model selection, fallback strategies, and cost comparison.

---

## Provider Configuration

### **Environment Variables**

```bash
# .env
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=sk-ant-...

# Routing strategy
AI_PRIMARY_PROVIDER=openai
AI_FALLBACK_PROVIDER=gemini
AI_ENABLE_FALLBACK=true
```

---

## Model Characteristics

| Provider | Model | Strengths | Cost (per 1M tokens) | Speed |
|----------|-------|-----------|---------------------|-------|
| **OpenAI** | GPT-4o | General intelligence, function calling | $5 input / $15 output | Fast |
| **Gemini** | Gemini Pro | Long context (2M tokens), free tier | $0.25 input / $0.75 output | Fast |
| **Anthropic** | Claude 3.5 Sonnet | Code, analysis, safety | $3 input / $15 output | Medium |

**Use Cases:**
- **OpenAI GPT-4o**: Life CEO agents, Mr Blue chat, structured outputs
- **Gemini Pro**: Long document analysis, cost-sensitive tasks
- **Claude 3.5**: Code review, content moderation, ethical analysis

---

## Multi-Provider Service

### **AI Provider Abstraction**

```typescript
interface AIProvider {
  name: string;
  generateResponse(prompt: string, options?: any): Promise<string>;
  streamResponse(prompt: string, onChunk: (chunk: string) => void): Promise<void>;
  estimateCost(prompt: string): number;
}

class OpenAIProvider implements AIProvider {
  name = 'openai';

  async generateResponse(prompt: string, options?: any): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      ...options,
    });
    return completion.choices[0].message.content || '';
  }

  estimateCost(prompt: string): number {
    const tokens = estimateTokens(prompt);
    return (tokens / 1_000_000) * 5; // $5 per 1M input tokens
  }
}

class GeminiProvider implements AIProvider {
  name = 'gemini';

  async generateResponse(prompt: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  estimateCost(prompt: string): number {
    const tokens = estimateTokens(prompt);
    return (tokens / 1_000_000) * 0.25; // $0.25 per 1M input tokens
  }
}

class AnthropicProvider implements AIProvider {
  name = 'anthropic';

  async generateResponse(prompt: string): Promise<string> {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    return message.content[0].text;
  }

  estimateCost(prompt: string): number {
    const tokens = estimateTokens(prompt);
    return (tokens / 1_000_000) * 3; // $3 per 1M input tokens
  }
}
```

---

## Routing Strategy

### **Pattern 1: Primary + Fallback**

```typescript
class AIRouter {
  private providers: Map<string, AIProvider> = new Map();
  private primaryProvider: string;
  private fallbackProviders: string[];

  constructor() {
    this.providers.set('openai', new OpenAIProvider());
    this.providers.set('gemini', new GeminiProvider());
    this.providers.set('anthropic', new AnthropicProvider());

    this.primaryProvider = process.env.AI_PRIMARY_PROVIDER || 'openai';
    this.fallbackProviders = ['gemini', 'anthropic'];
  }

  async generateResponse(prompt: string): Promise<string> {
    // Try primary provider
    try {
      const primary = this.providers.get(this.primaryProvider)!;
      return await primary.generateResponse(prompt);
    } catch (error) {
      console.warn(`Primary provider ${this.primaryProvider} failed:`, error);

      // Fallback to other providers
      for (const fallbackName of this.fallbackProviders) {
        try {
          const fallback = this.providers.get(fallbackName)!;
          console.log(`Falling back to ${fallbackName}`);
          return await fallback.generateResponse(prompt);
        } catch (fallbackError) {
          console.warn(`Fallback provider ${fallbackName} failed:`, fallbackError);
        }
      }

      throw new Error('All AI providers failed');
    }
  }
}

// Usage
const router = new AIRouter();
const response = await router.generateResponse('Explain tango history');
```

---

### **Pattern 2: Cost-Based Routing**

```typescript
async function generateWithCostOptimization(
  prompt: string,
  maxCost: number = 0.01
): Promise<string> {
  const router = new AIRouter();

  // Check costs
  const openaiCost = router.providers.get('openai')!.estimateCost(prompt);
  const geminiCost = router.providers.get('gemini')!.estimateCost(prompt);
  const claudeCost = router.providers.get('anthropic')!.estimateCost(prompt);

  // Select cheapest provider within budget
  if (geminiCost <= maxCost) {
    return router.providers.get('gemini')!.generateResponse(prompt);
  } else if (claudeCost <= maxCost) {
    return router.providers.get('anthropic')!.generateResponse(prompt);
  } else if (openaiCost <= maxCost) {
    return router.providers.get('openai')!.generateResponse(prompt);
  }

  throw new Error(`No provider within budget: $${maxCost}`);
}
```

---

### **Pattern 3: Task-Based Routing**

```typescript
function selectProviderForTask(task: string): AIProvider {
  const router = new AIRouter();

  switch (task) {
    case 'long_document_analysis':
      // Gemini Pro: 2M token context
      return router.providers.get('gemini')!;

    case 'code_review':
      // Claude: Best for code
      return router.providers.get('anthropic')!;

    case 'structured_output':
      // GPT-4o: Function calling
      return router.providers.get('openai')!;

    case 'content_moderation':
      // Claude: Safety-focused
      return router.providers.get('anthropic')!;

    default:
      return router.providers.get(router.primaryProvider)!;
  }
}

// Usage
const provider = selectProviderForTask('code_review');
const review = await provider.generateResponse(codeSnippet);
```

---

## Cost Comparison

### **Example: 1,000 Life CEO Queries/Day**

```typescript
// Assumptions:
// - Average prompt: 500 tokens input, 200 tokens output
// - 1,000 queries per day
// - 30 days per month

const QUERIES_PER_DAY = 1000;
const DAYS_PER_MONTH = 30;
const TOTAL_QUERIES = QUERIES_PER_DAY * DAYS_PER_MONTH; // 30,000

const INPUT_TOKENS = 500;
const OUTPUT_TOKENS = 200;

// OpenAI GPT-4o
const openaiCost =
  ((INPUT_TOKENS / 1_000_000) * 5 +
  (OUTPUT_TOKENS / 1_000_000) * 15) *
  TOTAL_QUERIES;

// Gemini Pro
const geminiCost =
  ((INPUT_TOKENS / 1_000_000) * 0.25 +
  (OUTPUT_TOKENS / 1_000_000) * 0.75) *
  TOTAL_QUERIES;

// Claude 3.5
const claudeCost =
  ((INPUT_TOKENS / 1_000_000) * 3 +
  (OUTPUT_TOKENS / 1_000_000) * 15) *
  TOTAL_QUERIES;

console.log(`Monthly costs for 30,000 queries:`);
console.log(`OpenAI GPT-4o: $${openaiCost.toFixed(2)}`);   // ~$165
console.log(`Gemini Pro: $${geminiCost.toFixed(2)}`);      // ~$8.25
console.log(`Claude 3.5: $${claudeCost.toFixed(2)}`);      // ~$135

// Hybrid strategy: 70% Gemini, 30% GPT-4o
const hybridCost = (geminiCost * 0.7) + (openaiCost * 0.3);
console.log(`Hybrid (70% Gemini, 30% GPT-4o): $${hybridCost.toFixed(2)}`); // ~$55
```

**Recommendation:** Use Gemini for bulk queries, GPT-4o for critical tasks → **67% cost savings**

---

## Implementation Examples

### **Life CEO Agent with Fallback**

```typescript
async function getLifeCEOAdvice(
  domain: string,
  userContext: any
): Promise<any> {
  const router = new AIRouter();

  const prompt = `
    Domain: ${domain}
    User Context: ${JSON.stringify(userContext)}
    
    Provide personalized advice for this life domain.
  `;

  try {
    // Try GPT-4o first (best for structured output)
    const response = await router.generateResponse(prompt);
    return JSON.parse(response);
  } catch (error) {
    // Fallback to Gemini (cheaper, still good)
    console.warn('GPT-4o failed, using Gemini fallback');
    const fallbackResponse = await router.providers
      .get('gemini')!
      .generateResponse(prompt);
    return JSON.parse(fallbackResponse);
  }
}
```

---

### **Mr Blue Chat with Streaming**

```typescript
async function streamMrBlueResponse(
  prompt: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  const router = new AIRouter();

  try {
    // Primary: OpenAI streaming
    await router.providers.get('openai')!.streamResponse(prompt, onChunk);
  } catch (error) {
    // Fallback: Gemini (non-streaming fallback)
    const response = await router.providers.get('gemini')!.generateResponse(prompt);
    onChunk(response);
  }
}
```

---

## Monitoring & Analytics

```typescript
interface ProviderMetrics {
  provider: string;
  requests: number;
  successes: number;
  failures: number;
  totalCost: number;
  avgLatency: number;
}

class AIMetricsTracker {
  private metrics: Map<string, ProviderMetrics> = new Map();

  trackRequest(
    provider: string,
    success: boolean,
    cost: number,
    latency: number
  ) {
    const metric = this.metrics.get(provider) || {
      provider,
      requests: 0,
      successes: 0,
      failures: 0,
      totalCost: 0,
      avgLatency: 0,
    };

    metric.requests++;
    if (success) metric.successes++;
    else metric.failures++;
    metric.totalCost += cost;
    metric.avgLatency =
      (metric.avgLatency * (metric.requests - 1) + latency) / metric.requests;

    this.metrics.set(provider, metric);
  }

  getMetrics(): ProviderMetrics[] {
    return Array.from(this.metrics.values());
  }
}

// Usage
const tracker = new AIMetricsTracker();

async function trackedAICall(prompt: string): Promise<string> {
  const start = Date.now();
  const router = new AIRouter();

  try {
    const response = await router.generateResponse(prompt);
    const latency = Date.now() - start;
    const cost = router.providers.get(router.primaryProvider)!.estimateCost(prompt);

    tracker.trackRequest(router.primaryProvider, true, cost, latency);
    return response;
  } catch (error) {
    const latency = Date.now() - start;
    tracker.trackRequest(router.primaryProvider, false, 0, latency);
    throw error;
  }
}
```

---

## Best Practices

1. **✅ Use Gemini for bulk operations** (20x cheaper than GPT-4o)
2. **✅ Reserve GPT-4o for structured outputs** (function calling)
3. **✅ Use Claude for content moderation** (safety-focused)
4. **✅ Implement fallback for reliability** (99.9% uptime)
5. **✅ Track costs per provider** (optimize monthly spend)
6. **✅ Cache responses when possible** (avoid duplicate calls)

---

## Next Steps

1. Read `docs/MT_OPENAI_INTEGRATION_GUIDE.md` for GPT-4o details
2. See `docs/REPLIT_COST_OPTIMIZATION.md` for AI cost reduction
3. Review `agents/mrblue/` for multi-model routing implementation

**Related Files:**
- `server/services/ai-router.ts` - Multi-provider router
- `agents/lifeceo/*` - Life CEO agents with fallback
- `server/routes/mrblue.ts` - Mr Blue streaming chat
