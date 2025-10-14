# Multi-AI Integration Guide

**For:** Developers integrating Multi-AI capabilities  
**Difficulty:** Intermediate  
**Time:** 15-30 minutes  

---

## Quick Start

### 1. Install Dependencies

The Multi-AI system is already included in the Mundo Tango platform. No additional packages needed!

### 2. Import Types

```typescript
import type {
  AIRouteRequest,
  AIRouteResponse,
  AIModel,
} from '@shared/multi-ai-types';
```

### 3. Make Your First Query

```typescript
import { apiRequest } from '@/lib/queryClient';

// Simple query with smart routing
const response = await apiRequest('/api/ai/route', {
  method: 'POST',
  body: JSON.stringify({
    query: 'What is machine learning?',
    costPriority: 'balanced',
  }),
});

console.log(response.model); // e.g., "gpt-4o"
console.log(response.content); // AI response
console.log(response.routing.estimatedCost); // e.g., 0.001
```

---

## Integration Patterns

### Pattern 1: Simple AI Query (React Component)

```typescript
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { AIRouteRequest, AIRouteResponse } from '@shared/multi-ai-types';

export function SimpleAIQuery() {
  const [query, setQuery] = useState('');
  
  const queryMutation = useMutation<AIRouteResponse, Error, AIRouteRequest>({
    mutationFn: async (request) => {
      const response = await apiRequest('/api/ai/route', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      return response as unknown as AIRouteResponse;
    },
  });

  const handleSubmit = () => {
    queryMutation.mutate({
      query,
      costPriority: 'balanced',
    });
  };

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <button onClick={handleSubmit} disabled={queryMutation.isPending}>
        {queryMutation.isPending ? 'Loading...' : 'Ask AI'}
      </button>
      {queryMutation.data && (
        <div>
          <strong>{queryMutation.data.model}:</strong>
          <p>{queryMutation.data.content}</p>
        </div>
      )}
    </div>
  );
}
```

### Pattern 2: Cost-Optimized Queries

```typescript
// For simple FAQ-style questions (use cheapest model)
const simpleQuery = await apiRequest('/api/ai/route', {
  method: 'POST',
  body: JSON.stringify({
    query: 'What are your business hours?',
    costPriority: 'cheap', // Selects Gemini Flash
  }),
});

// For complex analysis (use best model)
const complexQuery = await apiRequest('/api/ai/route', {
  method: 'POST',
  body: JSON.stringify({
    query: 'Analyze the economic implications of AI on employment...',
    costPriority: 'quality', // Selects Claude Sonnet 4.5
  }),
});
```

### Pattern 3: Ensemble Synthesis (High-Stakes Decisions)

```typescript
import type { EnsembleRequest, EnsembleResponse } from '@shared/multi-ai-types';

// Get multiple AI opinions and synthesize
const ensemble = await apiRequest<EnsembleResponse>('/api/ai/ensemble', {
  method: 'POST',
  body: JSON.stringify({
    query: 'Should we pivot our business strategy?',
    models: ['claude', 'openai', 'gemini'],
    synthesize: true,
  }),
});

console.log('Consensus:', ensemble.synthesis.consensus); // 0.85 (85% agreement)
console.log('Combined answer:', ensemble.synthesis.combined);
console.log('Disagreements:', ensemble.synthesis.disagreements);
```

### Pattern 4: Model-Specific Selection

```typescript
// Force a specific AI model (bypass smart routing)
const claudeResponse = await apiRequest('/api/ai/route', {
  method: 'POST',
  body: JSON.stringify({
    query: 'Write a creative story about...',
    preferredModel: 'claude', // Always use Claude
  }),
});
```

---

## Backend Integration

### Express Route Example

```typescript
import { Router } from 'express';
import { apiRequest } from '../utils/api-client';

const router = Router();

router.post('/process-user-question', async (req, res) => {
  try {
    const { userQuestion } = req.body;
    
    // Query Multi-AI system
    const aiResponse = await apiRequest('/api/ai/route', {
      method: 'POST',
      body: JSON.stringify({
        query: userQuestion,
        costPriority: 'balanced',
      }),
    });
    
    // Store result, send response, etc.
    res.json({
      answer: aiResponse.content,
      model: aiResponse.model,
      cost: aiResponse.routing.estimatedCost,
    });
  } catch (error) {
    res.status(500).json({ error: 'AI query failed' });
  }
});

export default router;
```

---

## Error Handling

### Recommended Pattern

```typescript
const queryMutation = useMutation<AIRouteResponse, Error, AIRouteRequest>({
  mutationFn: async (request) => {
    const response = await apiRequest('/api/ai/route', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response as unknown as AIRouteResponse;
  },
  onError: (error) => {
    if (error.message.includes('429')) {
      toast.error('Rate limit exceeded. Please wait a moment.');
    } else if (error.message.includes('401')) {
      toast.error('Please log in to use AI features.');
    } else {
      toast.error('AI query failed. Please try again.');
    }
  },
  onSuccess: (data) => {
    console.log('AI responded with:', data.model);
  },
});
```

---

## Performance Best Practices

### 1. Use Cost Priority Wisely

```typescript
// FAQ bot → Use 'cheap'
const faqResponse = await fetch('/api/ai/route', {
  costPriority: 'cheap',
});

// Product recommendations → Use 'balanced'
const recommendationResponse = await fetch('/api/ai/route', {
  costPriority: 'balanced',
});

// Legal advice → Use 'quality'
const legalResponse = await fetch('/api/ai/route', {
  costPriority: 'quality',
});
```

### 2. Batch Similar Queries

```typescript
// ❌ Bad: Multiple individual queries
for (const question of questions) {
  await apiRequest('/api/ai/route', { query: question });
}

// ✅ Good: Combine into one query
const combinedQuery = questions.join('\n');
await apiRequest('/api/ai/route', { query: combinedQuery });
```

### 3. Cache Responses

```typescript
import { useQuery } from '@tanstack/react-query';

// Cache AI responses for frequently asked questions
const { data } = useQuery({
  queryKey: ['/api/ai/route', query],
  queryFn: async () => {
    return apiRequest('/api/ai/route', {
      method: 'POST',
      body: JSON.stringify({ query, costPriority: 'cheap' }),
    });
  },
  staleTime: 1000 * 60 * 60, // Cache for 1 hour
});
```

---

## Testing

### Unit Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { apiRequest } from '@/lib/queryClient';

vi.mock('@/lib/queryClient');

describe('AI Integration', () => {
  it('should route simple query to cheap model', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      model: 'gemini-2.5-flash',
      content: 'Answer',
      complexity: 'low',
      routing: {
        costPriority: 'cheap',
        estimatedCost: 0.0001,
        reasoning: 'Selected Gemini for low cost',
      },
    });

    const response = await apiRequest('/api/ai/route', {
      method: 'POST',
      body: JSON.stringify({
        query: 'What is 2+2?',
        costPriority: 'cheap',
      }),
    });

    expect(response.model).toBe('gemini-2.5-flash');
    expect(response.routing.estimatedCost).toBeLessThan(0.001);
  });
});
```

---

## Monitoring Integration

### Track Usage in Your App

```typescript
import { useQuery } from '@tanstack/react-query';
import type { AIMetricsResponse } from '@shared/multi-ai-types';

export function AIUsageTracker() {
  const { data: metrics } = useQuery<AIMetricsResponse>({
    queryKey: ['/api/ai/metrics'],
    refetchInterval: 30000, // Update every 30s
  });

  return (
    <div>
      <h3>AI Usage Today</h3>
      <p>Total Queries: {metrics?.totalQueries}</p>
      <p>Cost Savings: ${metrics?.costSavings.toFixed(2)}</p>
      <p>Average Quality: {(metrics?.qualityRetention * 100).toFixed(0)}%</p>
    </div>
  );
}
```

---

## Common Issues

### Issue 1: "Query too long" error
**Solution:** Split into smaller queries or use ensemble mode

### Issue 2: "Rate limit exceeded"
**Solution:** Implement request throttling or upgrade rate limit

### Issue 3: "Model unavailable"
**Solution:** System will auto-fallback to available models

---

## Next Steps

- Read [User Guide](./USER_GUIDE.md) for feature overview
- Check [API Reference](./API_REFERENCE.md) for detailed specs
- Review [Architecture](./ARCHITECTURE.md) for system design
- See [Monitoring Guide](./MONITORING.md) for analytics

---

## Support

**Internal Issues:** Contact Agent #117 (Meta-Orchestrator)  
**Documentation:** See `docs/multi-ai/`  
**Examples:** Check `client/src/components/ai/` for reference implementations
