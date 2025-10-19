# Replit Performance Monitoring Integration
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Audience:** Platform engineers, SRE teams

## Overview

This guide covers performance monitoring setup for Mundo Tango on Replit Reserved VM, integrating PostHog analytics, custom metrics, and alerting systems.

---

## Monitoring Stack

### **Current Setup:**

```
Application Layer:
- Express server with custom metrics middleware
- React Query client-side caching metrics
- Socket.io connection tracking

Planned Integrations (Tasks #48-52):
- PostHog (analytics + session replay)
- Sentry (error tracking + performance APM)
- Custom dashboards (Grafana/Replit metrics)
```

---

## Performance Metrics Tracking

### **1. Server-Side Metrics**

#### **Request Timing Middleware**

```typescript
// server/middleware/metrics.ts
import { Request, Response, NextFunction } from 'express';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log metric
    logMetric('http_request_duration_ms', duration, {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      user_id: req.user?.id,
    });
    
    // Alert if slow
    if (duration > 1000) {
      logWarning('slow_request', {
        duration,
        method: req.method,
        path: req.path,
      });
    }
  });
  
  next();
}

// Apply to all routes
app.use(metricsMiddleware);
```

---

#### **Database Query Performance**

```typescript
// server/db/metrics.ts
import { sql } from 'drizzle-orm';

export async function withQueryMetrics<T>(
  queryName: string,
  query: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  
  try {
    const result = await query();
    const duration = performance.now() - start;
    
    logMetric('db_query_duration_ms', duration, {
      query: queryName,
      success: true,
    });
    
    if (duration > 100) {
      logWarning('slow_db_query', { queryName, duration });
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    
    logMetric('db_query_duration_ms', duration, {
      query: queryName,
      success: false,
      error: error.message,
    });
    
    throw error;
  }
}

// Usage
const users = await withQueryMetrics(
  'users.findMany',
  () => db.query.users.findMany()
);
```

---

#### **System Resource Monitoring**

```typescript
// server/monitoring/system.ts
import { cpus, freemem, totalmem } from 'os';
import { memoryUsage, cpuUsage } from 'process';

export function getSystemMetrics() {
  return {
    cpu: {
      cores: cpus().length,
      usage: getCPUUsage(), // percentage
    },
    memory: {
      total: totalmem(),
      free: freemem(),
      used: totalmem() - freemem(),
      percentage: ((totalmem() - freemem()) / totalmem()) * 100,
    },
    process: {
      uptime: process.uptime(),
      memory: memoryUsage(),
      cpu: cpuUsage(),
    },
  };
}

// Track every minute
setInterval(() => {
  const metrics = getSystemMetrics();
  
  logMetric('system_cpu_percent', metrics.cpu.usage);
  logMetric('system_memory_percent', metrics.memory.percentage);
  logMetric('process_uptime_seconds', metrics.process.uptime);
  
  // Alert if high resource usage
  if (metrics.cpu.usage > 80) {
    logAlert('high_cpu_usage', { usage: metrics.cpu.usage });
  }
  
  if (metrics.memory.percentage > 85) {
    logAlert('high_memory_usage', { usage: metrics.memory.percentage });
  }
}, 60000);
```

---

### **2. Client-Side Metrics**

#### **Page Load Performance (Web Vitals)**

```typescript
// client/src/monitoring/webVitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to PostHog or custom endpoint
  fetch('/api/metrics/web-vitals', {
    method: 'POST',
    body: JSON.stringify(metric),
    headers: { 'Content-Type': 'application/json' },
  });
}

// Track Core Web Vitals
getCLS(sendToAnalytics); // Cumulative Layout Shift
getFID(sendToAnalytics); // First Input Delay
getFCP(sendToAnalytics); // First Contentful Paint
getLCP(sendToAnalytics); // Largest Contentful Paint
getTTFB(sendToAnalytics); // Time to First Byte

// Targets (from ESA_PERFORMANCE_METRICS.md):
// LCP: <2.5s
// FID: <100ms
// CLS: <0.1
```

---

#### **React Component Performance**

```typescript
// client/src/monitoring/componentMetrics.tsx
import { Profiler, ProfilerOnRenderCallback } from 'react';

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  if (actualDuration > 16) { // Slower than 60fps
    console.warn(`${id} took ${actualDuration}ms to ${phase}`);
    
    // Send to analytics
    fetch('/api/metrics/component-performance', {
      method: 'POST',
      body: JSON.stringify({
        component: id,
        phase,
        duration: actualDuration,
        timestamp: startTime,
      }),
    });
  }
};

// Usage
export function MonitoredComponent({ children }: { children: React.ReactNode }) {
  return (
    <Profiler id="HomeFeed" onRender={onRenderCallback}>
      {children}
    </Profiler>
  );
}
```

---

### **3. Real-Time Metrics (WebSocket)**

```typescript
// server/monitoring/websocket.ts
import { Server } from 'socket.io';

export function setupWebSocketMetrics(io: Server) {
  io.on('connection', (socket) => {
    const connectTime = Date.now();
    
    logMetric('websocket_connection', 1, {
      socket_id: socket.id,
      user_id: socket.data.userId,
    });
    
    socket.on('message', (msg) => {
      const latency = Date.now() - msg.timestamp;
      
      logMetric('websocket_message_latency_ms', latency, {
        socket_id: socket.id,
        message_type: msg.type,
      });
      
      if (latency > 200) {
        logWarning('high_websocket_latency', { latency, socket_id: socket.id });
      }
    });
    
    socket.on('disconnect', () => {
      const sessionDuration = Date.now() - connectTime;
      
      logMetric('websocket_session_duration_ms', sessionDuration, {
        socket_id: socket.id,
      });
    });
  });
  
  // Track concurrent connections
  setInterval(() => {
    const connections = io.engine.clientsCount;
    logMetric('websocket_concurrent_connections', connections);
    
    if (connections > 1000) {
      logAlert('high_websocket_connections', { count: connections });
    }
  }, 30000);
}
```

---

## PostHog Integration (Task #48)

### **Setup**

```bash
# Install PostHog
npm install posthog-node posthog-js
```

**Backend:**
```typescript
// server/analytics/posthog.ts
import { PostHog } from 'posthog-node';

export const posthog = new PostHog(
  process.env.POSTHOG_API_KEY!,
  { host: 'https://app.posthog.com' }
);

// Track server events
export function trackEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, any>
) {
  posthog.capture({
    distinctId,
    event,
    properties: {
      ...properties,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
}

// Example usage
trackEvent(req.user.id, 'post_created', {
  post_id: post.id,
  content_length: post.content.length,
});
```

**Frontend:**
```typescript
// client/src/lib/posthog.ts
import posthog from 'posthog-js';

posthog.init(import.meta.env.VITE_POSTHOG_PUBLIC_KEY!, {
  api_host: 'https://app.posthog.com',
  session_recording: {
    enabled: true, // Session replay
  },
});

// Track page views
posthog.capture('page_view', {
  page: window.location.pathname,
});

// Track user actions
posthog.capture('button_clicked', {
  button: 'create_post',
});
```

---

### **PostHog Dashboard Queries**

**1. Average API Response Time (P95):**
```sql
SELECT
  quantile(0.95)(properties.duration) AS p95_response_time
FROM events
WHERE event = 'api_request'
  AND timestamp > now() - INTERVAL 1 DAY
```

**2. Error Rate:**
```sql
SELECT
  countIf(properties.status >= 400) / count(*) * 100 AS error_rate_percent
FROM events
WHERE event = 'api_request'
  AND timestamp > now() - INTERVAL 1 HOUR
```

**3. Most Used Features:**
```sql
SELECT
  event,
  count(*) AS event_count
FROM events
WHERE timestamp > now() - INTERVAL 7 DAYS
GROUP BY event
ORDER BY event_count DESC
LIMIT 10
```

---

## Custom Metrics Endpoint

```typescript
// server/routes/metrics.ts
import { Router } from 'express';
import { getSystemMetrics } from '../monitoring/system';

const router = Router();

router.get('/metrics/prometheus', (req, res) => {
  // Prometheus-compatible metrics
  const metrics = getSystemMetrics();
  
  res.setHeader('Content-Type', 'text/plain');
  res.send(`
# HELP cpu_usage_percent CPU usage percentage
# TYPE cpu_usage_percent gauge
cpu_usage_percent ${metrics.cpu.usage}

# HELP memory_usage_percent Memory usage percentage
# TYPE memory_usage_percent gauge
memory_usage_percent ${metrics.memory.percentage}

# HELP process_uptime_seconds Process uptime in seconds
# TYPE process_uptime_seconds counter
process_uptime_seconds ${metrics.process.uptime}
  `.trim());
});

router.get('/metrics/json', (req, res) => {
  res.json(getSystemMetrics());
});

export default router;
```

---

## Alerting System

### **Alert Rules**

```typescript
// server/monitoring/alerts.ts
interface AlertRule {
  name: string;
  condition: (metrics: any) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

const alertRules: AlertRule[] = [
  {
    name: 'high_error_rate',
    condition: (m) => m.error_rate > 0.05, // >5%
    severity: 'high',
    message: 'Error rate exceeds 5%',
  },
  {
    name: 'slow_api_response',
    condition: (m) => m.api_p95_ms > 1000, // >1s
    severity: 'medium',
    message: 'API p95 response time >1s',
  },
  {
    name: 'high_cpu_usage',
    condition: (m) => m.cpu_percent > 90,
    severity: 'critical',
    message: 'CPU usage >90%',
  },
  {
    name: 'high_memory_usage',
    condition: (m) => m.memory_percent > 85,
    severity: 'critical',
    message: 'Memory usage >85%',
  },
];

export async function checkAlerts() {
  const metrics = await getCurrentMetrics();
  
  for (const rule of alertRules) {
    if (rule.condition(metrics)) {
      await sendAlert({
        rule: rule.name,
        severity: rule.severity,
        message: rule.message,
        metrics,
        timestamp: new Date(),
      });
    }
  }
}

// Run every 60 seconds
setInterval(checkAlerts, 60000);
```

---

### **Alert Channels**

**1. Console Logging (Development):**
```typescript
function sendAlert(alert: Alert) {
  console.error(`🚨 [${alert.severity.toUpperCase()}] ${alert.message}`, alert.metrics);
}
```

**2. PostHog (Production):**
```typescript
function sendAlert(alert: Alert) {
  posthog.capture({
    distinctId: 'system',
    event: 'alert_triggered',
    properties: alert,
  });
}
```

**3. Slack (Future):**
```typescript
async function sendAlert(alert: Alert) {
  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    body: JSON.stringify({
      text: `🚨 *${alert.severity}*: ${alert.message}`,
      attachments: [{
        fields: [
          { title: 'Rule', value: alert.rule, short: true },
          { title: 'Time', value: alert.timestamp, short: true },
        ]
      }]
    }),
  });
}
```

**4. PagerDuty (Critical Alerts):**
```typescript
async function sendAlert(alert: Alert) {
  if (alert.severity === 'critical') {
    await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token token=${process.env.PAGERDUTY_TOKEN}`,
      },
      body: JSON.stringify({
        routing_key: process.env.PAGERDUTY_INTEGRATION_KEY,
        event_action: 'trigger',
        payload: {
          summary: alert.message,
          severity: alert.severity,
          source: 'Mundo Tango',
          custom_details: alert.metrics,
        },
      }),
    });
  }
}
```

---

## Dashboards

### **1. Real-Time Dashboard (Server Endpoint)**

```typescript
// server/routes/admin.ts
app.get('/admin/dashboard', authMiddleware, roleMiddleware('admin'), (req, res) => {
  const metrics = {
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: getCPUUsage(),
    },
    requests: {
      total: getRequestCount(),
      rps: getRequestsPerSecond(),
      errorRate: getErrorRate(),
    },
    database: {
      activeConnections: getActiveDBConnections(),
      queryDuration: getAvgQueryDuration(),
    },
    websocket: {
      activeConnections: getActiveWebSocketConnections(),
      messageLatency: getAvgWebSocketLatency(),
    },
  };
  
  res.json(metrics);
});
```

---

### **2. PostHog Dashboard (Recommended)**

**Panels to Create:**
1. **User Engagement**
   - Active users (DAU/WAU/MAU)
   - Session duration
   - Retention cohorts

2. **Performance**
   - API response time (p50, p95, p99)
   - Page load time
   - Error rate over time

3. **Features Usage**
   - Most used features
   - Feature adoption rate
   - User funnel (signup → first post → active)

4. **System Health**
   - CPU/Memory usage
   - Database query performance
   - WebSocket connection health

---

## Performance Budgets

### **Define Targets (from ESA_PERFORMANCE_METRICS.md)**

```typescript
// server/monitoring/budgets.ts
export const performanceBudgets = {
  api: {
    p50: 100,   // <100ms
    p95: 500,   // <500ms
    p99: 1000,  // <1s
  },
  database: {
    simple: 10,    // <10ms
    join: 50,      // <50ms
    complex: 200,  // <200ms
  },
  page_load: {
    lcp: 2500, // <2.5s
    fid: 100,  // <100ms
    cls: 0.1,  // <0.1
  },
  websocket: {
    connection: 500,  // <500ms
    latency: 50,      // <50ms
  },
};

// Check if within budget
export function isWithinBudget(metric: string, value: number): boolean {
  const budget = getBudget(metric);
  return value <= budget;
}

// Alert if budget exceeded
export function checkBudgets(metrics: any) {
  for (const [key, value] of Object.entries(metrics)) {
    if (!isWithinBudget(key, value)) {
      sendAlert({
        rule: 'performance_budget_exceeded',
        severity: 'medium',
        message: `${key} (${value}) exceeds budget (${getBudget(key)})`,
      });
    }
  }
}
```

---

## Integration with ESA Protocols

**PERFORMANCE_METRICS Protocol:**
- All metrics align with targets defined in ESA_PERFORMANCE_METRICS.md
- Automated tracking and alerting
- Dashboard visualization

**CHECK_BEFORE_BUILD:**
- Verify monitoring is running before deployment
- Test alert rules
- Check metric endpoints accessible

**WORKLOAD_BALANCING:**
- Monitor queue depth and task latency
- Track agent performance
- Alert if system overloaded

---

**Document Owner:** Platform Enhancement Division (#8) + Layer #48  
**Review Cycle:** Monthly or when performance targets change  
**Last Updated:** October 19, 2025
