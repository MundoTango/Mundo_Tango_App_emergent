# Multi-AI Orchestration API Reference

**Version:** 1.0.0  
**Base URL:** `/api/ai`  
**Agents:** #115 (Router), #116 (Ensemble), #117 (Meta-Orchestrator)  

---

## Overview

The Multi-AI Orchestration API provides intelligent routing across multiple AI models (Claude Sonnet 4.5, GPT-4o, Gemini 2.5 Pro/Flash) with cost optimization, ensemble synthesis, and performance tracking.

---

## Authentication

All endpoints require authentication. The user must be logged in with a valid session.

```typescript
// Authentication is handled via session middleware
// No additional headers required for authenticated users
```

---

## Endpoints

### 1. System Status

**GET** `/api/ai/status`

Returns the current status of the Multi-AI orchestration system.

**Response:**
```json
{
  "status": "operational" | "degraded" | "offline",
  "agents": {
    "orchestrator": "active" | "inactive",
    "router": "active" | "inactive",
    "ensemble": "active" | "inactive"
  },
  "models": {
    "claude": true | false,
    "openai": true | false,
    "gemini": true | false
  }
}
```

**Example:**
```bash
curl http://localhost:5000/api/ai/status
```

---

### 2. Smart AI Routing

**POST** `/api/ai/route`

Routes a query to the optimal AI model based on complexity and cost priority.

**Request Body:**
```typescript
{
  query: string;           // Required: The question or prompt
  costPriority?: 'cheap' | 'balanced' | 'quality'; // Optional
  preferredModel?: 'claude' | 'openai' | 'gemini';  // Optional
}
```

**Response:**
```json
{
  "model": "claude-sonnet-4.5" | "gpt-4o" | "gemini-2.5-flash" | "gemini-2.5-pro",
  "content": string,
  "complexity": "low" | "medium" | "high",
  "routing": {
    "costPriority": string,
    "estimatedCost": number,
    "reasoning": string
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/ai/route \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Explain quantum entanglement",
    "costPriority": "quality"
  }'
```

**Response Example:**
```json
{
  "model": "claude-sonnet-4.5",
  "content": "Quantum entanglement is a phenomenon where...",
  "complexity": "high",
  "routing": {
    "costPriority": "quality",
    "estimatedCost": 0.025,
    "reasoning": "Selected Claude for high complexity and quality priority"
  }
}
```

---

### 3. Performance Metrics

**GET** `/api/ai/metrics`

Returns aggregated performance metrics for the Multi-AI system.

**Response:**
```json
{
  "totalQueries": number,
  "costSavings": number,
  "qualityRetention": number,
  "averageLatency": number,
  "modelUsage": {
    "claude-sonnet-4.5": number,
    "gpt-4o": number,
    "gemini-2.5-pro": number
  }
}
```

**Example:**
```bash
curl http://localhost:5000/api/ai/metrics
```

**Response Example:**
```json
{
  "totalQueries": 1542,
  "costSavings": 127.50,
  "qualityRetention": 0.95,
  "averageLatency": 1200,
  "modelUsage": {
    "claude-sonnet-4.5": 450,
    "gpt-4o": 720,
    "gemini-2.5-pro": 372
  }
}
```

---

### 4. Ensemble Synthesis

**POST** `/api/ai/ensemble`

Consults multiple AI models in parallel and synthesizes a combined response.

**Request Body:**
```typescript
{
  query: string;                  // Required
  models: ('claude' | 'openai' | 'gemini')[]; // 2-3 models
  synthesize?: boolean;           // Default: true
}
```

**Response:**
```json
{
  "query": string,
  "responses": [
    {
      "model": string,
      "content": string,
      "latency": number,
      "confidence"?: number
    }
  ],
  "synthesis": {
    "combined": string,
    "consensus": number,
    "disagreements": string[],
    "recommendation": string
  },
  "metadata": {
    "totalLatency": number,
    "costEstimate": number,
    "timestamp": string
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/ai/ensemble \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the implications of AI on society?",
    "models": ["claude", "openai", "gemini"],
    "synthesize": true
  }'
```

---

## Error Handling

All endpoints return standard HTTP status codes:

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 401 | Unauthorized (not logged in) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

**Error Response Format:**
```json
{
  "error": string,
  "message": string,
  "details"?: object
}
```

---

## Rate Limits

- **Default:** 100 requests per minute per user
- **Burst:** 20 requests per 10 seconds
- **Enforcement:** 429 status code when exceeded

---

## Cost Optimization

### Routing Strategy

**Cost Priority = "cheap":**
- Simple queries → Gemini 2.5 Flash ($0.0001/query)
- Medium queries → Gemini 2.5 Flash
- Complex queries → GPT-4o

**Cost Priority = "balanced" (default):**
- Simple queries → Gemini 2.5 Flash
- Medium queries → GPT-4o ($0.001/query)
- Complex queries → Claude Sonnet 4.5

**Cost Priority = "quality":**
- Simple queries → GPT-4o
- Medium queries → Claude Sonnet 4.5 ($0.025/query)
- Complex queries → Claude Sonnet 4.5

### Complexity Detection

Query complexity is determined by:
- Word count
- Technical terminology
- Reasoning requirements
- Context depth

---

## TypeScript Types

```typescript
import type {
  AIModel,
  AIRouteRequest,
  AIRouteResponse,
  EnsembleRequest,
  EnsembleResponse,
  AIStatusResponse,
  AIMetricsResponse,
} from '@shared/multi-ai-types';
```

---

## See Also

- [Integration Guide](./INTEGRATION_GUIDE.md)
- [User Guide](./USER_GUIDE.md)
- [Architecture Documentation](./ARCHITECTURE.md)
- [Monitoring Guide](./MONITORING.md)
