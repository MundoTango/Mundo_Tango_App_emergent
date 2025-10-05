# Agent Monitoring Dashboard

## Overview

The ESA 61x21 Multi-Agent System includes a comprehensive monitoring dashboard at `/admin/agent-metrics` with real-time metrics, performance analytics, error tracking, and queue visualization.

**Components:**
- **Frontend:** `client/src/pages/admin/AgentMetrics.tsx`
- **Backend:** `server/esa-agents/metrics-collector.ts`
- **API:** `server/esa-agents/api-integration.ts`

## Dashboard Features

### Overview Tab

Real-time system health and key metrics:

**Metrics Displayed:**
- **Total Requests:** Cumulative agent invocations
- **Avg Response Time:** Mean processing duration
- **Success Rate:** Percentage of successful operations
- **Health Score:** Overall system health (0-100)

**Visual Components:**
- Health status indicator (Healthy/Degraded/Unhealthy)
- Active agent count
- Real-time request counter
- System uptime

### Agents Tab

Per-agent performance breakdown:

**Table Columns:**
- Agent ID and name
- Request count
- Success rate
- Average response time
- Current status

**Interactive Features:**
- Sort by any column
- Filter by agent type
- Search by agent name
- Export to CSV

**Performance Radar Chart:**
- Multi-dimensional visualization
- Compare agent performance
- Identify bottlenecks

### Performance Tab

Response time and throughput analysis:

**Area Chart:**
- X-axis: Time
- Y-axis: Response time (ms)
- Multiple series per agent
- Real-time updates

**Metrics:**
- P50, P95, P99 latencies
- Requests per second
- Throughput trends
- Processing capacity

### Errors Tab

Error tracking and analysis:

**Error Distribution (Pie Chart):**
- OpenAI API errors
- Database errors
- Validation errors
- Network errors
- Timeout errors

**Recent Errors Table:**
- Timestamp
- Agent ID
- Error type
- Message
- Severity level
- Stack trace (expandable)

**Severity Filters:**
- Critical (red)
- High (orange)
- Medium (yellow)
- Low (blue)

### Queues Tab

Job queue monitoring:

**Bar Chart:**
- Queue depth by agent
- Waiting vs Active jobs
- Processing rate

**Queue Metrics:**
- Total queued jobs
- Jobs in progress
- Completed jobs
- Failed jobs
- Average wait time

### Patterns Tab

ESA 61x21 pattern analytics:

**Pattern Application:**
- Which patterns are being used
- Frequency of application
- Success rate per pattern

**Anti-Pattern Detection:**
- Violations detected
- Pattern misuse count
- Recommendations for fixes

## API Endpoints

### GET /api/esa-agents/metrics

Prometheus-formatted metrics for external monitoring:

```prometheus
# HELP agent_requests_total Total number of agent requests
# TYPE agent_requests_total counter
agent_requests_total{agent_id="infrastructure",agent_name="Infrastructure Orchestrator"} 1523

# HELP agent_response_time_seconds Agent response time in seconds
# TYPE agent_response_time_seconds histogram
agent_response_time_seconds_bucket{agent_id="infrastructure",le="0.1"} 450
agent_response_time_seconds_bucket{agent_id="infrastructure",le="0.5"} 1200
```

**Metrics Collected:**
- `agent_requests_total` - Request counter
- `agent_response_time_seconds` - Response time histogram
- `agent_success_rate` - Success rate gauge
- `agent_active_requests` - Concurrent requests gauge
- `agent_errors_total` - Error counter
- `queue_depth` - Queue size gauge
- `openai_tokens_total` - Token usage counter
- `openai_api_errors_total` - OpenAI error counter

### GET /api/esa-agents/health

Detailed health check with agent status:

```json
{
  "status": "healthy",
  "timestamp": "2025-10-05T10:00:00.000Z",
  "agents": {
    "infrastructure": "healthy",
    "frontend": "healthy",
    "background": "healthy",
    "realtime": "healthy",
    "business": "healthy",
    "search": "healthy",
    "lifeceo": "healthy",
    "enhancement": "healthy",
    "master": "healthy"
  },
  "metrics": {
    "totalRequests": 15234,
    "avgResponseTime": 342,
    "successRate": 98.5,
    "errorRate": 1.5,
    "queueDepth": 12
  },
  "database": {
    "status": "connected",
    "activeConnections": 5,
    "maxConnections": 20
  },
  "openai": {
    "status": "operational",
    "tokensToday": 125000,
    "estimatedCost": "$1.85"
  }
}
```

### GET /api/esa-agents/analytics

Comprehensive usage analytics:

```json
{
  "overview": {
    "totalRequests": 15234,
    "totalAgents": 9,
    "avgResponseTime": 342,
    "successRate": 98.5,
    "healthScore": 95
  },
  "agentPerformance": [
    {
      "agentId": "infrastructure",
      "agentName": "Infrastructure Orchestrator",
      "requests": 3456,
      "successRate": 99.2,
      "avgResponseTime": 287,
      "lastActive": "2025-10-05T10:00:00.000Z"
    }
  ],
  "errors": [
    {
      "timestamp": "2025-10-05T09:55:00.000Z",
      "agentId": "lifeceo",
      "errorType": "openai_timeout",
      "message": "Request timeout after 30s",
      "severity": "medium"
    }
  ],
  "queueStats": {
    "agent_infrastructure": {
      "waiting": 2,
      "active": 1,
      "completed": 3453,
      "failed": 3
    }
  },
  "patterns": {
    "applied": [
      {
        "pattern": "context_object_memoization",
        "count": 234,
        "successRate": 100
      }
    ],
    "antiPatterns": [
      {
        "pattern": "suspense_direct_import",
        "count": 2,
        "lastDetected": "2025-10-05T08:30:00.000Z"
      }
    ]
  }
}
```

## Metrics Collection

### Prometheus Integration

**Metric Types:**

1. **Counters** - Monotonically increasing values
   ```typescript
   agentRequests.inc({ agent_id: 'infrastructure', agent_name: 'Infrastructure Orchestrator' });
   ```

2. **Histograms** - Response time distribution
   ```typescript
   agentResponseTime.observe({ agent_id: 'infrastructure' }, responseTime);
   ```

3. **Gauges** - Current state values
   ```typescript
   agentActiveRequests.set({ agent_id: 'infrastructure' }, activeCount);
   ```

### Automatic Collection

Metrics collector runs every 30 seconds:

```typescript
class MetricsCollector {
  private interval: NodeJS.Timeout;
  
  start() {
    this.interval = setInterval(async () => {
      await this.collectMetrics();
      await this.calculateSuccessRates();
      await this.updateHealthScores();
    }, 30000); // 30 seconds
  }
  
  async collectMetrics() {
    const metrics = agentSystem.getMetrics();
    const health = await agentSystem.healthCheck();
    
    // Update Prometheus metrics
    this.updateSystemHealth(health);
    this.updateQueueMetrics(metrics.queueStats);
    this.updateAgentAvailability(health.agents);
  }
}
```

### Error Tracking

Automatic error capture and categorization:

```typescript
export interface AgentError {
  timestamp: Date;
  agentId: string;
  agentName: string;
  errorType: 'openai_api' | 'database' | 'validation' | 'network' | 'timeout';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  stackTrace?: string;
  context?: Record<string, any>;
}

// Captured automatically on agent failures
agentErrors.inc({
  agent_id: agentId,
  agent_name: agentName,
  error_type: errorType,
  severity: severity
});
```

## Real-Time Updates

### Auto-Refresh

Dashboard refreshes every 5 seconds:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    refetch(); // React Query refetch
  }, 5000);
  
  return () => clearInterval(interval);
}, [refetch]);
```

**User Controls:**
- Pause/Resume auto-refresh
- Manual refresh button
- Configurable refresh interval

### WebSocket Updates (Future)

Plan for real-time push:

```typescript
io.on('connection', (socket) => {
  // Subscribe to agent metrics
  socket.on('subscribe:metrics', () => {
    socket.join('agent-metrics');
  });
  
  // Push updates on metric changes
  metricsCollector.on('update', (metrics) => {
    io.to('agent-metrics').emit('metrics:update', metrics);
  });
});
```

## Alerting

### Alert Rules

Configured in metrics collector:

```typescript
const alertRules = [
  {
    name: 'high_error_rate',
    condition: (metrics) => metrics.errorRate > 5,
    severity: 'critical',
    message: 'Error rate exceeded 5%'
  },
  {
    name: 'slow_response_time',
    condition: (metrics) => metrics.avgResponseTime > 1000,
    severity: 'warning',
    message: 'Average response time above 1s'
  },
  {
    name: 'queue_backup',
    condition: (metrics) => metrics.queueDepth > 100,
    severity: 'warning',
    message: 'Job queue depth exceeds 100'
  }
];
```

### Alert Actions

When alert triggered:

1. **Log to console** with severity
2. **Increment Prometheus counter**
3. **Store in database** for history
4. **Send notification** (email/Slack - future)
5. **Display in dashboard** with badge

### Critical Alerts

Automatic recovery actions:

```typescript
if (alert.severity === 'critical') {
  // Attempt auto-recovery
  if (alert.name === 'database_connection_lost') {
    await db.reconnect();
  }
  
  if (alert.name === 'openai_rate_limit') {
    await pauseAgentRequests(60000); // Pause for 1 minute
  }
  
  // Log recovery attempt
  logger.info('Recovery action attempted', { alert: alert.name });
}
```

## Performance Optimization

### Data Aggregation

Reduce query load with aggregation:

```typescript
// Calculate hourly aggregates
const hourlyMetrics = await db
  .select({
    hour: sql`date_trunc('hour', created_at)`,
    requests: sql`count(*)`,
    avgResponseTime: sql`avg(response_time)`,
    errorRate: sql`sum(case when status = 'failed' then 1 else 0 end)::float / count(*)`
  })
  .from(agentJobs)
  .groupBy(sql`date_trunc('hour', created_at)`)
  .orderBy(sql`date_trunc('hour', created_at) DESC`)
  .limit(24);
```

### Caching

Cache expensive queries:

```typescript
const cacheKey = 'agent-analytics';
const cached = await cache.get(cacheKey);

if (cached) {
  return cached;
}

const analytics = await computeAnalytics();
await cache.set(cacheKey, analytics, 30); // 30 seconds TTL

return analytics;
```

### Query Optimization

Indexed columns for fast lookups:

```sql
CREATE INDEX idx_agent_jobs_created_at ON agent_jobs(created_at DESC);
CREATE INDEX idx_agent_jobs_agent_id ON agent_jobs(agent_id);
CREATE INDEX idx_agent_jobs_status ON agent_jobs(status);
```

## Export & Reporting

### Data Export

Download metrics as CSV:

```typescript
function exportToCSV() {
  const csv = [
    ['Agent', 'Requests', 'Success Rate', 'Avg Response Time'],
    ...analytics.agentPerformance.map(a => [
      a.agentName,
      a.requests,
      `${a.successRate}%`,
      `${a.avgResponseTime}ms`
    ])
  ].map(row => row.join(',')).join('\n');
  
  downloadFile('agent-metrics.csv', csv);
}
```

### PDF Reports

Generate weekly reports:

```typescript
async function generateWeeklyReport() {
  const metrics = await getWeeklyMetrics();
  
  const pdf = await generatePDF({
    title: 'ESA Agent System - Weekly Report',
    sections: [
      { title: 'Overview', data: metrics.overview },
      { title: 'Agent Performance', data: metrics.agents },
      { title: 'Error Summary', data: metrics.errors },
      { title: 'Recommendations', data: metrics.recommendations }
    ]
  });
  
  return pdf;
}
```

## Troubleshooting

### Dashboard Not Loading
- Check `/api/esa-agents/health` endpoint
- Verify database connection
- Check browser console for errors

### Metrics Not Updating
- Verify metrics collector is running
- Check Prometheus endpoint: `/api/esa-agents/metrics`
- Restart workflow if needed

### High Response Times
- Check database query performance
- Review agent processing logic
- Scale up resources if needed

## Best Practices

1. **Monitor Daily:** Check dashboard at least once per day
2. **Set Alerts:** Configure critical thresholds
3. **Review Trends:** Analyze weekly/monthly patterns
4. **Optimize Queries:** Keep response times under 500ms
5. **Clean Old Data:** Archive metrics after 30 days
6. **Document Incidents:** Record and learn from failures

## Future Enhancements

- [ ] Grafana integration for advanced dashboards
- [ ] Slack/Email alert notifications
- [ ] Anomaly detection with ML
- [ ] Predictive scaling recommendations
- [ ] Cost optimization insights
- [ ] A/B testing integration
- [ ] Custom dashboard builder