# ESA PERFORMANCE_METRICS Protocol
**Version:** 1.0  
**Status:** ✅ Active  
**Referenced by:** 106 agent files across ESA LIFE CEO framework

## Purpose
The PERFORMANCE_METRICS protocol defines measurement standards, tracking methodologies, and optimization targets for the Mundo Tango platform. It ensures data-driven decision making and continuous performance improvement.

## Core Principles

### 1. **Measure Everything**
If you can't measure it, you can't improve it.

### 2. **User-Centric Metrics**
Performance from the user's perspective matters most.

### 3. **Continuous Monitoring**
Track metrics in real-time, detect regressions early.

---

## Metric Categories

### **1. Frontend Performance**

#### **Core Web Vitals (Google Standards):**

| Metric | Target | Alert |
|--------|--------|-------|
| **LCP** (Largest Contentful Paint) | <2.5s | >4s |
| **FID** (First Input Delay) | <100ms | >300ms |
| **CLS** (Cumulative Layout Shift) | <0.1 | >0.25 |
| **FCP** (First Contentful Paint) | <1.8s | >3s |
| **TTI** (Time to Interactive) | <3.8s | >7.3s |

**Measurement Tool:** Google Lighthouse, PostHog Analytics

---

#### **Page Load Performance:**

```typescript
// Measure page load times
window.addEventListener('load', () => {
  const perfData = window.performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  
  // Target: <3 seconds
  if (pageLoadTime > 3000) {
    logPerformanceWarning('Slow page load', pageLoadTime);
  }
});
```

**Targets:**
- Home Feed (P10): <2s initial load
- Login Page (P1): <1.5s
- Mr Blue Chat (P62): <3s (includes WebSocket setup)
- Visual Editor (P43): <4s (complex React Flow)

---

#### **React Component Performance:**

```typescript
// Measure component render times
import { Profiler } from 'react';

function onRenderCallback(
  id, phase, actualDuration, baseDuration, startTime, commitTime
) {
  if (actualDuration > 16) { // Slower than 60fps
    console.warn(`${id} took ${actualDuration}ms to render`);
  }
}

<Profiler id="HomeFeed" onRender={onRenderCallback}>
  <HomeFeed />
</Profiler>
```

**Targets:**
- Component render: <16ms (60fps)
- State update: <8ms (120fps)
- Re-render after mutation: <50ms

---

### **2. Backend Performance**

#### **API Response Times:**

| Endpoint Category | p50 | p95 | p99 | Alert |
|-------------------|-----|-----|-----|-------|
| **Auth** (login, register) | <100ms | <200ms | <500ms | >1s |
| **Read** (GET posts, events) | <50ms | <150ms | <300ms | >500ms |
| **Write** (POST, PATCH) | <100ms | <250ms | <500ms | >1s |
| **Complex** (search, recommendations) | <200ms | <500ms | <1s | >2s |
| **AI** (Mr Blue, Life CEO) | <1s | <3s | <5s | >10s |

**Measurement:**
```typescript
// Express middleware for response time tracking
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logMetric('api.response_time', duration, {
      method: req.method,
      path: req.path,
      status: res.statusCode
    });
  });
  next();
});
```

---

#### **Database Query Performance:**

```typescript
// Drizzle query performance tracking
const start = performance.now();
const result = await db.query.posts.findMany({
  where: eq(posts.userId, userId),
  limit: 20
});
const duration = performance.now() - start;

if (duration > 100) {
  logSlowQuery('posts.findMany', duration, { userId, resultCount: result.length });
}
```

**Targets:**
- Simple SELECT: <10ms
- JOIN query (2-3 tables): <50ms
- Complex aggregation: <200ms
- Full-text search: <100ms

**Alert Threshold:** Any query >500ms

---

### **3. Real-Time Performance**

#### **WebSocket Metrics:**

| Metric | Target | Alert |
|--------|--------|-------|
| Connection Time | <500ms | >2s |
| Message Latency | <50ms | >200ms |
| Reconnection Time | <1s | >5s |
| Concurrent Connections | 1000+ | N/A |

```typescript
// Socket.io performance tracking
io.on('connection', (socket) => {
  const connectTime = Date.now();
  
  socket.on('message', (msg) => {
    const latency = Date.now() - msg.timestamp;
    if (latency > 200) {
      logMetric('websocket.high_latency', latency, { socketId: socket.id });
    }
  });
  
  socket.on('disconnect', () => {
    const sessionDuration = Date.now() - connectTime;
    logMetric('websocket.session_duration', sessionDuration);
  });
});
```

---

### **4. Infrastructure Metrics**

#### **Replit Reserved VM:**

| Resource | Normal | Warning | Critical |
|----------|--------|---------|----------|
| CPU Usage | <60% | 60-80% | >80% |
| Memory Usage | <70% | 70-85% | >85% |
| Disk I/O | <50MB/s | 50-100MB/s | >100MB/s |
| Network I/O | <10MB/s | 10-50MB/s | >50MB/s |

**Monitoring Command:**
```bash
# System resource monitoring
while true; do
  echo "=== $(date) ==="
  top -bn1 | grep "Cpu(s)"
  free -h | grep "Mem:"
  iostat -x 1 1 | tail -n +4
  sleep 60
done > /tmp/system-metrics.log
```

---

#### **Neon PostgreSQL (Serverless):**

| Metric | Target | Notes |
|--------|--------|-------|
| Active Time | Minimize | Serverless charges for compute time |
| Connection Pool | 5-10 | Auto-scales, monitor for leaks |
| Query Efficiency | >90% use indexes | Prevent full table scans |
| Database Size | <10GB | Hard limit on Replit |

**Monitoring:**
```sql
-- Active connection count
SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active';

-- Slow queries (>100ms)
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE idx_scan = 0; -- Unused indexes
```

---

### **5. Agent Performance**

#### **Agent Execution Metrics:**

```typescript
interface AgentMetrics {
  agentId: string;
  taskType: string;
  startTime: number;
  endTime: number;
  success: boolean;
  resourcesUsed: {
    cpu: number; // percentage
    memory: number; // MB
    duration: number; // ms
  };
}

// Example: Customer Journey Audit
const metrics: AgentMetrics = {
  agentId: 'J1-New-User-Audit',
  taskType: 'UI_AUDIT',
  startTime: Date.now(),
  endTime: Date.now() + 5000,
  success: true,
  resourcesUsed: {
    cpu: 15,
    memory: 200,
    duration: 5000
  }
};
```

**Targets:**
- UI Audit (1 page): <10s
- Documentation Creation: <30s
- E2E Test (1 journey): <2min
- Code Generation: <15s

---

### **6. User Experience Metrics**

#### **PostHog Analytics Integration:**

```typescript
// Track user interactions
posthog.capture('page_view', {
  page: 'home_feed',
  load_time: pageLoadTime,
  user_tier: userTier
});

posthog.capture('feature_used', {
  feature: 'mr_blue_chat',
  response_time: aiResponseTime,
  satisfaction: userRating
});
```

**Key UX Metrics:**
- **Time to First Interaction:** <3s
- **Task Completion Rate:** >90%
- **Error Rate:** <1%
- **User Satisfaction (CSAT):** >4.5/5
- **Feature Adoption:** >60% within 30 days

---

## Performance Testing

### **Load Testing (Planned):**

```bash
# Simulate 100 concurrent users
artillery run load-test.yml

# Configuration (load-test.yml)
config:
  target: 'https://mundotango.replit.app'
  phases:
    - duration: 60
      arrivalRate: 10 # 10 new users/second
scenarios:
  - name: "Browse Home Feed"
    flow:
      - get:
          url: "/api/posts"
      - think: 2
      - post:
          url: "/api/posts"
          json:
            content: "Test post"
```

**Targets:**
- 100 concurrent users: p95 <500ms
- 1000 concurrent users: p95 <1s
- 10000 concurrent users: p95 <2s (with autoscaling)

---

### **Stress Testing:**

```typescript
// Find breaking point
const concurrentRequests = [10, 50, 100, 500, 1000, 5000];

for (const load of concurrentRequests) {
  const promises = Array(load).fill(null).map(() => 
    fetch('/api/posts').then(r => r.json())
  );
  
  const start = Date.now();
  await Promise.all(promises);
  const duration = Date.now() - start;
  
  console.log(`${load} requests: ${duration}ms (${duration/load}ms avg)`);
}
```

---

## Optimization Targets

### **40x20s Framework Integration:**

**800 Quality Checkpoints** across MT platform:
- 40 feature areas × 20 quality dimensions = 800 checks
- Performance is 1 of 20 dimensions
- Target: 100% compliance

**Example Checkpoints:**
- ✅ Home Feed loads in <2s (LCP)
- ✅ Login response <200ms (p95)
- ✅ No memory leaks after 1hr usage
- ✅ Database queries use indexes
- ✅ Images optimized with Cloudinary

---

### **Continuous Improvement:**

**Monthly Performance Sprints:**
1. Identify slowest 10% of operations
2. Analyze root causes (profiling, monitoring)
3. Implement optimizations
4. Measure improvement (before/after)
5. Document learnings

**Target:** 10% performance improvement per sprint

---

## Alerting and Monitoring

### **PostHog Dashboard (To Be Implemented):**

**Panels:**
1. Real-time user count
2. API response times (p50/p95/p99)
3. Error rate by endpoint
4. Page load times by route
5. WebSocket connection health
6. Database query performance
7. Resource utilization (CPU/memory)
8. User funnel drop-offs

**Alerts:**
- Error rate >1% for 5 minutes → Slack notification
- API p95 >1s for 10 minutes → PagerDuty alert
- System CPU >90% for 5 minutes → Auto-scale trigger

---

### **Error Tracking (Sentry - To Be Implemented):**

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions
  beforeSend(event) {
    // Add performance context
    event.contexts = {
      ...event.contexts,
      performance: {
        pageLoadTime: window.performance.timing.loadEventEnd - window.performance.timing.navigationStart,
        memoryUsed: (performance as any).memory?.usedJSHeapSize
      }
    };
    return event;
  }
});
```

---

## Integration with Other ESA Protocols

**Related Protocols:**
- `ESA_CHECK_BEFORE_BUILD.md` - Baseline performance before changes
- `ESA_PARALLEL_BY_DEFAULT.md` - Measure parallel execution speedup
- `ESA_WORKLOAD_BALANCING.md` - Track queue metrics and throughput
- `ESA_AGENT_CERTIFICATION.md` - Performance requirements for certification

---

## Success Criteria

### **Platform-Wide Targets:**

| Category | Current | Target | Status |
|----------|---------|--------|--------|
| Page Load (avg) | Unknown | <2s | 🔴 Needs measurement |
| API Response (p95) | Unknown | <500ms | 🔴 Needs measurement |
| Error Rate | Unknown | <0.5% | 🔴 Needs measurement |
| Uptime | Unknown | 99.9% | 🔴 Needs measurement |
| User Satisfaction | Unknown | >4.5/5 | 🔴 Needs measurement |

**Next Steps:**
1. Implement PostHog analytics (Task #48)
2. Set up Sentry error tracking (Task #49)
3. Create performance dashboards (Task #51)
4. Run baseline load tests (Task #56)
5. Establish monitoring alerts (Task #52)

---

**Protocol Owner:** Platform Enhancement Division (Domain #8) + Layer #48  
**Last Updated:** October 19, 2025  
**Review Cycle:** Weekly (during optimization phase), Monthly (steady state)
