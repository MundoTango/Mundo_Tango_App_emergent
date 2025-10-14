# Multi-AI Production Deployment Guide

**For:** DevOps, System Administrators, Production Engineers  
**Platform:** Mundo Tango - Life CEO & Community Platform  

---

## Pre-Deployment Checklist

### Environment Setup

- [ ] API keys configured in environment variables
  - `ANTHROPIC_API_KEY`
  - `OPENAI_API_KEY`
  - `GEMINI_API_KEY`
- [ ] Database connection verified
- [ ] Redis/caching layer configured (optional)
- [ ] HTTPS/TLS enabled
- [ ] Load balancer configured
- [ ] Monitoring tools integrated

### Security

- [ ] Rate limiting enabled
- [ ] API key rotation policy in place
- [ ] CORS configured properly
- [ ] Session management secured
- [ ] Audit logging enabled
- [ ] Data encryption at rest (optional)

### Performance

- [ ] Circuit breakers configured
- [ ] Retry logic tuned
- [ ] Caching strategy defined
- [ ] CDN configured for static assets
- [ ] Database indexes optimized

---

## Configuration

### Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
GEMINI_API_KEY=xxx

# Optional
AI_RATE_LIMIT_ROUTE=100          # Requests per minute
AI_RATE_LIMIT_ENSEMBLE=20        # Requests per minute
AI_CIRCUIT_BREAKER_THRESHOLD=5   # Failures before open
AI_CIRCUIT_BREAKER_TIMEOUT=60000 # Milliseconds
AI_RETRY_MAX_ATTEMPTS=3          # Max retry attempts
AI_RETRY_BASE_DELAY=1000         # Base delay in ms
```

### Rate Limiting

**Default Limits:**
```typescript
{
  status: 300 req/min,
  metrics: 60 req/min,
  route: 100 req/min,
  ensemble: 20 req/min
}
```

**Adjust for Production:**
```typescript
// server/middleware/ai-rate-limiter.ts
const rateLimits = {
  route: {
    points: process.env.AI_RATE_LIMIT_ROUTE || 100,
    duration: 60,
  },
  // ...
};
```

---

## Deployment Steps

### 1. Build Application

```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Verify build
ls dist/
```

### 2. Database Migration

```bash
# Push schema changes
npm run db:push

# Verify schema
npm run db:studio
```

### 3. Start Services

```bash
# Production mode
npm run start

# Or with PM2
pm2 start ecosystem.config.js
pm2 save
```

### 4. Health Check

```bash
# Check system status
curl https://your-domain.com/api/ai/status

# Expected response
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

## Monitoring Setup

### Metrics Collection

**Option 1: Built-in Dashboard**
- Navigate to `/admin/multi-ai/analytics`
- Real-time metrics updated every 30s
- No additional setup required

**Option 2: Prometheus Integration**

```typescript
// Add to server/index.ts
import { register } from 'prom-client';

app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});
```

**Option 3: Custom Integration**

```typescript
import { aiPerformanceMonitor } from './utils/ai-performance-monitor';

aiPerformanceMonitor.on('metric', (metric) => {
  // Send to your monitoring service
  monitoring.track('ai.query', metric);
});
```

### Alerts Configuration

**Critical Alerts:**
```yaml
- name: AI High Error Rate
  condition: success_rate < 0.90
  severity: critical
  action: page_oncall

- name: AI High Cost
  condition: daily_cost > $100
  severity: warning
  action: notify_admin

- name: AI Slow Queries
  condition: avg_latency > 5000
  severity: warning
  action: log_alert
```

---

## Performance Optimization

### 1. Caching Strategy

**Cache Frequent Queries:**
```typescript
import NodeCache from 'node-cache';

const queryCache = new NodeCache({ stdTTL: 3600 }); // 1 hour

app.post('/api/ai/route', async (req, res) => {
  const cacheKey = `query:${req.body.query}`;
  const cached = queryCache.get(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  // ... normal routing logic
  queryCache.set(cacheKey, result);
});
```

### 2. Load Balancing

**Nginx Configuration:**
```nginx
upstream ai_backend {
  server app1:5000 weight=3;
  server app2:5000 weight=3;
  server app3:5000 weight=2;
  
  keepalive 32;
}

server {
  listen 443 ssl;
  server_name your-domain.com;
  
  location /api/ai/ {
    proxy_pass http://ai_backend;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
  }
}
```

### 3. Database Optimization

```sql
-- Add indexes for frequent queries
CREATE INDEX idx_ai_metrics_timestamp ON ai_metrics(timestamp DESC);
CREATE INDEX idx_ai_metrics_model ON ai_metrics(model);
CREATE INDEX idx_ai_metrics_user ON ai_metrics(user_id);
```

---

## Security Hardening

### 1. API Key Management

**Rotate Keys Regularly:**
```bash
# Every 90 days
1. Generate new API keys
2. Update environment variables
3. Restart application
4. Invalidate old keys
```

**Use Secrets Manager:**
```typescript
// AWS Secrets Manager example
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

async function getAPIKey(secretName: string) {
  const client = new SecretsManagerClient();
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: secretName })
  );
  return JSON.parse(response.SecretString);
}
```

### 2. Rate Limit Protection

**IP-based Protection:**
```typescript
// Block abusive IPs
import { blockUser } from './middleware/ai-rate-limiter';

// Manual block
await blockUser('ip:192.168.1.100', 86400); // 24 hours
```

### 3. Input Validation

**Sanitize All Inputs:**
```typescript
import { z } from 'zod';

const querySchema = z.object({
  query: z.string()
    .min(1)
    .max(5000)
    .regex(/^[\w\s\.,!?-]+$/), // Alphanumeric only
  costPriority: z.enum(['cheap', 'balanced', 'quality']).optional(),
});
```

---

## Disaster Recovery

### Backup Strategy

**What to Backup:**
- Environment variables (encrypted)
- Database (if using persistent storage)
- Configuration files
- Monitoring data (optional)

**Backup Schedule:**
- Daily: Database snapshot
- Weekly: Full configuration backup
- Monthly: Disaster recovery test

### Failover Procedure

**If Primary Model Fails:**
1. Circuit breaker opens automatically
2. Requests route to fallback models
3. Monitor fallback performance
4. Investigate primary model issue
5. Close circuit breaker when resolved

**If All Models Fail:**
1. System returns degraded responses
2. Alert sent to on-call engineer
3. Check API key validity
4. Verify network connectivity
5. Contact AI provider support

---

## Cost Management

### Budget Alerts

```typescript
// Example: Daily cost tracking
const DAILY_BUDGET = 100; // $100/day

setInterval(() => {
  const metrics = aiPerformanceMonitor.getMetrics();
  const dailyCost = metrics.lastDay.reduce((sum, m) => sum + m.cost, 0);
  
  if (dailyCost > DAILY_BUDGET) {
    sendAlert(`Daily budget exceeded: $${dailyCost.toFixed(2)}`);
  }
}, 60 * 60 * 1000); // Check hourly
```

### Cost Optimization Tips

1. **Increase Gemini usage** - Route more low-complexity queries
2. **Cache aggressively** - Reduce duplicate queries
3. **Batch requests** - Combine similar queries
4. **Monitor trends** - Adjust routing strategy based on data
5. **Set cost priorities** - Default to "cheap" unless quality is critical

---

## Troubleshooting

### Issue: High Latency

**Diagnosis:**
```bash
# Check average latency
curl https://your-domain.com/api/ai/metrics | jq '.averageLatency'

# Check model-specific latency
curl https://your-domain.com/api/ai/analytics/model-comparison
```

**Solutions:**
- Switch to faster models (Gemini)
- Increase timeout values
- Check network latency to AI providers
- Enable caching

### Issue: Rate Limit Errors

**Diagnosis:**
```bash
# Check rate limit status
curl https://your-domain.com/api/ai/status \
  -H "Cookie: your-session-cookie"
```

**Solutions:**
- Increase rate limits in configuration
- Implement request queuing
- Add more application instances
- Contact support for limit increase

### Issue: High Costs

**Diagnosis:**
```bash
# Check cost breakdown
curl https://your-domain.com/api/ai/analytics/summary | jq '.overview.totalCost'
```

**Solutions:**
- Review complexity distribution
- Adjust cost priority to "cheap"
- Increase caching TTL
- Optimize routing algorithm

---

## Scaling

### Horizontal Scaling

**Add More Instances:**
```bash
# Using PM2
pm2 scale ai-app +3

# Using Kubernetes
kubectl scale deployment ai-app --replicas=5
```

**Load Balancer Configuration:**
- Session affinity: Not required (stateless)
- Health check endpoint: `/api/ai/status`
- Timeout: 30 seconds

### Vertical Scaling

**Resource Requirements:**
- CPU: 2 cores minimum
- Memory: 2GB minimum
- Network: 100Mbps minimum

**Recommended Production:**
- CPU: 4-8 cores
- Memory: 4-8GB
- Network: 1Gbps

---

## Compliance

### Data Privacy

- **Query content:** Not logged or stored
- **User IDs:** Hashed in metrics
- **API responses:** Ephemeral (not persisted)
- **Metrics:** Aggregated only, no PII

### GDPR Compliance

- Right to erasure: User metrics can be deleted
- Data portability: Metrics exportable as JSON
- Consent: Document AI usage in terms of service

---

## Support

**Production Issues:** Open support ticket  
**Performance Questions:** Review monitoring dashboard  
**Cost Concerns:** Contact finance team  
**Security Incidents:** Follow incident response plan  

**Escalation Path:**
1. Check monitoring dashboard
2. Review this guide
3. Contact DevOps team
4. Escalate to engineering lead

---

## Additional Resources

- [API Reference](./API_REFERENCE.md)
- [Architecture Documentation](./ARCHITECTURE.md)
- [Monitoring Guide](./MONITORING.md)
- [Integration Guide](./INTEGRATION_GUIDE.md)
