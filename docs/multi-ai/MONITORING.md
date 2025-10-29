# Multi-AI Monitoring Guide

**For:** System administrators and DevOps  
**Agents:** #117 (Meta-Orchestrator), #68 (Pattern Learning)  

---

## Overview

The Multi-AI Orchestration platform includes comprehensive monitoring capabilities for tracking performance, costs, and system health in real-time.

---

## Monitoring Components

### 1. Performance Monitor

**Location:** `server/utils/ai-performance-monitor.ts`

**Tracks:**
- Total queries processed
- Cost per query
- Model-specific usage
- Query complexity distribution
- Success/failure rates
- Latency metrics

**Usage:**
```typescript
import { aiPerformanceMonitor, trackAIPerformance } from '@/server/utils/ai-performance-monitor';

// Track a query
trackAIPerformance(
  '/api/ai/route',
  'gpt-4o',
  'medium',
  1200, // latency in ms
  true, // success
  userId
);

// Get metrics
const metrics = aiPerformanceMonitor.getMetrics();
console.log('Total queries:', metrics.totalQueries);
console.log('Cost savings:', metrics.totalCostSaved);
```

---

## Key Metrics

### Cost Metrics

**Total Cost:**
```
Sum of all query costs across all models
```

**Cost Savings:**
```
Baseline Cost (always using Claude) - Actual Cost (smart routing)
```

**Savings Percentage:**
```
(Cost Savings / Baseline Cost) × 100
```

**Example:**
- Baseline: 1000 queries × $0.025 = $25.00
- Actual: $5.44 (smart routing)
- Savings: $19.56 (78%)

---

### Performance Metrics

**Average Latency:**
```
Total latency of all queries / Number of queries
```

**Success Rate:**
```
Successful queries / Total queries
```

**Quality Retention:**
```
Measured accuracy compared to always using Claude
Target: 95%+
```

---

### Usage Metrics

**Model Distribution:**
```
{
  "claude-sonnet-4.5": 450 queries (29%),
  "gpt-4o": 720 queries (47%),
  "gemini-2.5-pro": 372 queries (24%)
}
```

**Complexity Distribution:**
```
{
  "low": 400 queries (40%),
  "medium": 400 queries (40%),
  "high": 200 queries (20%)
}
```

---

## Dashboards

### Admin Dashboard

**URL:** `/admin/multi-ai`

**Displays:**
- System status (operational/degraded/offline)
- Agent health (Router, Ensemble, Meta-Orchestrator)
- Model availability (Claude, GPT-4o, Gemini)
- Real-time metrics
- Cost savings

**Refresh Rate:** 30 seconds

---

### Analytics Dashboard

**URL:** `/admin/multi-ai/analytics`

**Displays:**
- Cost savings over time (line chart)
- Model usage distribution (pie chart)
- Query volume by model (bar chart)
- Performance summary cards
- Model comparison table

**Refresh Rate:** 30 seconds

---

## API Endpoints

### GET /api/ai/status

Returns system health status.

**Response:**
```json
{
  "status": "operational",
  "agents": {
    "orchestrator": "active",
    "router": "active",
    "ensemble": "active"
  },
  "models": {
    "claude": true,
    "openai": true,
    "gemini": true
  }
}
```

---

### GET /api/ai/metrics

Returns aggregated performance metrics.

**Response:**
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

### GET /api/ai/analytics/time-series

Returns time-series data for cost trends.

**Query Parameters:**
- `interval` (optional): Minutes per data point (default: 60)

**Response:**
```json
[
  {
    "timestamp": 1697298000000,
    "date": "2025-10-14T20:00:00.000Z",
    "actualCost": 2.15,
    "baselineCost": 12.50,
    "savings": 10.35
  },
  ...
]
```

---

### GET /api/ai/analytics/model-comparison

Returns detailed model performance comparison.

**Response:**
```json
[
  {
    "model": "claude-sonnet-4.5",
    "queries": 450,
    "totalCost": 11.25,
    "avgCost": 0.025,
    "avgLatency": 2400,
    "successRate": 0.98
  },
  ...
]
```

---

## Alerts & Monitoring

### Performance Alerts

**Slow Query Alert:**
- **Trigger:** Latency > 5 seconds
- **Action:** Log warning, emit event
- **Event:** `slow-query`

**High Error Rate:**
- **Trigger:** Success rate < 90%
- **Action:** Log error, notify admin
- **Event:** `high-error-rate`

### Cost Alerts

**Cost Threshold Alert:**
- **Trigger:** Daily cost > $100
- **Action:** Send notification
- **Event:** `cost-threshold`

**Unexpected Spike:**
- **Trigger:** Cost increases >200% in 1 hour
- **Action:** Investigate, log alert
- **Event:** `cost-spike`

### Event Listeners

```typescript
import { aiPerformanceMonitor } from '@/server/utils/ai-performance-monitor';

// Listen for slow queries
aiPerformanceMonitor.on('slow-query', (metric) => {
  console.warn('Slow query detected:', metric);
  // Send to monitoring service
});

// Listen for errors
aiPerformanceMonitor.on('error', (metric) => {
  console.error('Query error:', metric);
  // Alert admin
});

// Listen for new metrics
aiPerformanceMonitor.on('metric', (metric) => {
  // Send to analytics service
});
```

---

## Rate Limiting Monitoring

### Check Rate Limit Status

```typescript
import { getRateLimitStatus } from '@/server/middleware/ai-rate-limiter';

const status = await getRateLimitStatus(req);
console.log(status);
// {
//   route: { limit: 100, remaining: 75, reset: Date },
//   ensemble: { limit: 20, remaining: 18, reset: Date }
// }
```

### Rate Limit Headers

Every API response includes:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 75
X-RateLimit-Reset: 2025-10-14T22:30:00.000Z
```

---

## Error Tracking

### Circuit Breaker Status

```typescript
import { getCircuitBreaker } from '@/server/utils/ai-error-recovery';

const breaker = getCircuitBreaker('claude-sonnet-4.5');
console.log('Circuit state:', breaker.getState());
// "closed" | "open" | "half-open"
```

**States:**
- **Closed:** Normal operation
- **Open:** Too many failures, blocking requests
- **Half-Open:** Testing if service recovered

### Fallback Tracking

Monitor which models are being used as fallbacks:

```typescript
// Check logs for fallback events
[AI Recovery] Fallback successful: claude-sonnet-4.5 → gpt-4o
```

---

## Data Retention

### In-Memory Storage

- **Max Metrics:** 10,000 recent queries
- **Retention:** 24 hours
- **Cleanup:** Automatic hourly cleanup

### Long-Term Storage (Future)

For production environments, consider:
- PostgreSQL for historical data
- Time-series database (InfluxDB, TimescaleDB)
- Export to analytics platform

---

## Performance Optimization

### Monitoring Best Practices

1. **Set up alerts** for critical metrics
2. **Review dashboards** daily
3. **Track trends** over time
4. **Optimize routing** based on data
5. **Monitor costs** regularly

### Key Performance Indicators (KPIs)

| Metric | Target | Action if Below |
|--------|--------|----------------|
| Success Rate | >95% | Investigate errors, check fallbacks |
| Quality Retention | >95% | Adjust routing strategy |
| Cost Savings | >40% | Optimize model selection |
| Avg Latency | <2000ms | Check model performance |

---

## Troubleshooting

### High Latency

**Symptoms:** Average latency > 3 seconds

**Checklist:**
1. Check model-specific latency in comparison table
2. Look for slow queries in time-series data
3. Verify network connectivity
4. Check if models are overloaded

### Low Cost Savings

**Symptoms:** Savings < 40%

**Checklist:**
1. Review complexity distribution
2. Check if too many queries routed to Claude
3. Adjust cost priority settings
4. Verify routing algorithm

### High Error Rate

**Symptoms:** Success rate < 90%

**Checklist:**
1. Check circuit breaker states
2. Review error logs
3. Verify API keys are valid
4. Check model availability

---

## Integration with External Monitoring

### Prometheus Metrics

```typescript
// Example: Export metrics to Prometheus
import { register, Counter, Gauge } from 'prom-client';

const queryCounter = new Counter({
  name: 'ai_queries_total',
  help: 'Total AI queries',
  labelNames: ['model', 'complexity'],
});

const costGauge = new Gauge({
  name: 'ai_cost_total',
  help: 'Total AI cost',
});

// Update metrics
aiPerformanceMonitor.on('metric', (metric) => {
  queryCounter.inc({ model: metric.model, complexity: metric.complexity });
  costGauge.set(aiPerformanceMonitor.getMetrics().totalCost);
});
```

### Logging Integration

```typescript
import { aiPerformanceMonitor } from '@/server/utils/ai-performance-monitor';
import logger from '@/lib/logger';

aiPerformanceMonitor.on('metric', (metric) => {
  logger.info('AI Query', {
    model: metric.model,
    latency: metric.latency,
    cost: metric.cost,
    success: metric.success,
  });
});
```

---

## Security Considerations

- **Do not log** query content (privacy)
- **Protect** monitoring endpoints with authentication
- **Rate limit** analytics endpoints
- **Sanitize** user IDs in logs

---

## Next Steps

- Set up [Production Guide](./PRODUCTION_GUIDE.md)
- Configure alerts for your environment
- Integrate with existing monitoring tools
- Review [Architecture](./ARCHITECTURE.md) for system design

---

## Support

**Monitoring Issues:** Contact Agent #117 (Meta-Orchestrator)  
**Performance Problems:** Review time-series data  
**Cost Concerns:** Check analytics dashboard  
**Alert Configuration:** See production guide
