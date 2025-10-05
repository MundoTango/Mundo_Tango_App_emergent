# OpenAI GPT-4o Integration

## Overview

All 16 Life CEO agents are connected to OpenAI's GPT-4o model, providing intelligent, context-aware responses with conversation memory and function calling capabilities.

## Architecture

### AgentOrchestrator Service

Central service managing OpenAI interactions:

**Location:** `server/services/AgentOrchestrator.ts`

```typescript
class AgentOrchestrator {
  async processMessage(context: AgentContext, userMessage: string): Promise<string>;
  async *streamMessage(context: AgentContext, userMessage: string): AsyncGenerator<string>;
  async getConversationHistory(userId: number, agentId: string): Promise<Message[]>;
  async saveMessage(userId: number, agentId: string, role: string, content: string): Promise<void>;
}
```

### Agent Registry

All 16 agents defined with specialized prompts:

```typescript
export const AGENT_REGISTRY = {
  'life-ceo': {
    id: 'life-ceo',
    name: 'Life CEO',
    icon: '👔',
    description: 'General life management and coordination',
    systemPrompt: `You are the Life CEO, the central coordinator...`,
    capabilities: ['coordination', 'prioritization', 'delegation']
  },
  'health': {
    id: 'health',
    name: 'Health Agent',
    icon: '🏥',
    description: 'Wellness and medical management',
    systemPrompt: `You are a health and wellness advisor...`,
    capabilities: ['fitness_planning', 'nutrition_advice', 'health_tracking']
  }
  // ... 14 more agents
};
```

## OpenAI Configuration

### Model Settings

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [...],
  temperature: 0.7,
  max_tokens: 1000,
  user: `user-${userId}` // For abuse monitoring
});
```

**Model:** `gpt-4o`
- Latest OpenAI model with superior reasoning
- Multimodal capabilities (text, image, future audio)
- Function calling support
- 128k context window

**Parameters:**
- `temperature: 0.7` - Balanced creativity/consistency
- `max_tokens: 1000` - Cost optimization (~$0.01/request)
- `user` ID - Track usage per user

### Streaming Responses

Server-Sent Events for real-time responses:

```typescript
async *streamMessage(context: AgentContext, userMessage: string) {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [...],
    stream: true
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) yield content;
  }
}
```

**Benefits:**
- Real-time user feedback
- Lower perceived latency
- Progressive rendering
- Better UX for long responses

## Conversation Memory

### Message Storage

All conversations stored in PostgreSQL:

```typescript
export const agentMessages = pgTable('agent_messages', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  agentId: varchar('agent_id', { length: 50 }).notNull(),
  role: varchar('role', { length: 20 }).notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});
```

### Context Management

Last 10 messages included for context:

```typescript
const conversationHistory = await agentOrchestrator.getConversationHistory(userId, agentId);
const recentHistory = conversationHistory.slice(-10);

const messages = [
  { role: 'system', content: agent.systemPrompt },
  ...recentHistory.map(msg => ({
    role: msg.role,
    content: msg.content
  })),
  { role: 'user', content: userMessage }
];
```

**Context Window Management:**
- Keep last 10 messages (~5 turns)
- Prune older messages to stay under token limit
- Preserve system prompt always
- Future: Semantic compression of old context

### Memory Extraction

Automatic memory storage for important information:

```typescript
async storeMemoryIfImportant(userId: number, agentId: string, userMsg: string, assistantMsg: string) {
  // Use GPT to determine if information should be remembered
  const isImportant = await this.checkImportance(userMsg, assistantMsg);
  
  if (isImportant) {
    await db.insert(agentMemories).values({
      userId,
      agentId,
      memoryType: 'preference', // or 'fact', 'goal', 'relationship'
      content: extractedInfo,
      importance: 0.8
    });
  }
}
```

**Memory Types:**
- **Preferences:** User likes/dislikes, styles, preferences
- **Facts:** Personal information, constraints, requirements
- **Goals:** Objectives, aspirations, targets
- **Relationships:** Connections, context, dependencies

## Function Calling (AgentTools)

### Tool Definitions

Agents can call platform functions:

```typescript
const tools = [
  {
    type: 'function',
    function: {
      name: 'searchHousing',
      description: 'Search for housing listings with filters',
      parameters: {
        type: 'object',
        properties: {
          cityId: { type: 'number', description: 'City group ID' },
          minPrice: { type: 'number' },
          maxPrice: { type: 'number' },
          bedrooms: { type: 'number' }
        }
      }
    }
  }
];
```

### Tool Execution

When agent requests a function call:

```typescript
if (completion.choices[0].message.tool_calls) {
  const toolCall = completion.choices[0].message.tool_calls[0];
  const args = JSON.parse(toolCall.function.arguments);
  
  const result = await agentTools[toolCall.function.name](userId, args);
  
  // Send result back to agent
  const finalResponse = await openai.chat.completions.create({
    messages: [
      ...previousMessages,
      completion.choices[0].message,
      {
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result)
      }
    ]
  });
}
```

### Available Tools

See [AgentTools documentation](./agent-tools.md) for full list:
- `searchHousing` - Find properties
- `checkBookingAvailability` - Check dates
- `createBooking` - Make reservation
- `searchEvents` - Find events
- `createPost` - Generate social content
- And 10+ more...

## Cost Management

### Token Tracking

Track input and output tokens:

```typescript
const completion = await openai.chat.completions.create({...});

const tokensUsed = {
  input: completion.usage?.prompt_tokens || 0,
  output: completion.usage?.completion_tokens || 0,
  total: completion.usage?.total_tokens || 0
};

// Store for billing/analytics
await db.insert(agentTokenUsage).values({
  userId,
  agentId,
  inputTokens: tokensUsed.input,
  outputTokens: tokensUsed.output,
  estimatedCost: (tokensUsed.input * 0.000005) + (tokensUsed.output * 0.000015)
});
```

### Rate Limiting

Protect against abuse:

```typescript
const rateLimiter = {
  maxRequests: 100,
  windowMs: 60000, // 1 minute
  perUser: true
};

// Check before OpenAI call
if (await isRateLimited(userId)) {
  throw new Error('Rate limit exceeded');
}
```

### Cost Estimation

**GPT-4o Pricing:**
- Input: $5.00 per 1M tokens
- Output: $15.00 per 1M tokens

**Average Conversation:**
- Input: ~500 tokens ($0.0025)
- Output: ~300 tokens ($0.0045)
- **Total: ~$0.007 per turn**

**Monthly Estimates:**
- 1,000 users × 10 turns/day = 10,000 turns/day
- 10,000 × $0.007 = $70/day
- **~$2,100/month at scale**

## Error Handling

### API Errors

```typescript
try {
  const response = await openai.chat.completions.create({...});
} catch (error) {
  if (error.status === 429) {
    // Rate limited - retry with backoff
    await sleep(1000);
    return retry();
  } else if (error.status === 500) {
    // OpenAI server error - fallback response
    return 'I apologize, I am experiencing technical difficulties.';
  } else {
    // Log and alert
    logger.error('OpenAI API error', error);
    throw error;
  }
}
```

### Timeout Protection

```typescript
const timeout = 30000; // 30 seconds
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), timeout);

try {
  const response = await openai.chat.completions.create({
    signal: controller.signal,
    ...
  });
} finally {
  clearTimeout(timeoutId);
}
```

## Testing

### Development Test Endpoint

```bash
curl -X POST http://localhost:5000/api/life-ceo/test/health \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are 3 tips for better sleep?"
  }'
```

### Production Endpoint (Authenticated)

```bash
curl -X POST http://localhost:5000/api/life-ceo/agents/health/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "message": "Help me create a fitness plan"
  }'
```

### Streaming Test

```bash
curl -X POST http://localhost:5000/api/life-ceo/agents/finance/stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "message": "Create a budget plan for me"
  }'
```

## Best Practices

1. **System Prompts:** Be specific, include examples, set boundaries
2. **Context:** Keep relevant, prune aggressively, stay under 8k tokens
3. **Streaming:** Use for responses >200 tokens
4. **Function Calls:** Validate arguments, handle errors gracefully
5. **Memory:** Extract selectively, use importance scoring
6. **Costs:** Monitor daily, set budgets, optimize token usage
7. **Rate Limiting:** Per-user limits, exponential backoff
8. **Error Messages:** User-friendly, actionable, logged for debugging

## Monitoring

View OpenAI metrics in the dashboard:
- Navigate to `/admin/agent-metrics`
- Token usage tab shows costs
- Response times per agent
- Error rates and types
- Daily/monthly trends

## Future Enhancements

- [ ] Multi-agent collaboration workflows
- [ ] Fine-tuned models for specific agents
- [ ] Image generation integration
- [ ] Voice input/output (Whisper + TTS)
- [ ] Semantic memory compression
- [ ] Predictive caching of common queries