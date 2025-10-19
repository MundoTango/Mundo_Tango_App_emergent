# Replit Reserved VM Advanced Configuration Guide
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Audience:** Senior+ agents working on production systems

## Overview

Mundo Tango runs on a **Replit Reserved VM** (not Autoscale), which provides dedicated compute resources with persistent state. This guide covers advanced configuration, optimization, and troubleshooting.

---

## Reserved VM vs Autoscale

### **When to Use Reserved VM (✅ Mundo Tango choice):**
- ✅ WebSocket servers (Socket.io requires persistent connections)
- ✅ Stateful applications (in-memory caching, session storage)
- ✅ Always-on services (background jobs, scheduled tasks)
- ✅ Databases with local storage (though we use Neon PostgreSQL)
- ✅ Applications needing predictable performance

### **When to Use Autoscale (❌ Not suitable for MT):**
- Stateless websites (no WebSocket, no server state)
- Traffic with long idle periods (cost optimization)
- Simple APIs without real-time features

**MT Platform Requirements:**
- Socket.io for real-time chat (Mr Blue AI)
- Background agent orchestration (927+ agents)
- In-memory caching (Redis planned)
- Persistent WebSocket connections

**Decision:** Reserved VM is mandatory for MT platform.

---

## VM Specifications

### **Current Configuration:**

```yaml
# From Replit environment
CPU: 2-4 vCPUs (shared)
RAM: 4GB
Disk: 20GB (NixOS filesystem)
Network: 1Gbps
Uptime: 99.9% SLA
```

**Resource Limits:**
- Max CPU: 400% (4 cores)
- Max Memory: 4GB (hard limit, OOM if exceeded)
- Max Disk: 20GB (includes dependencies, build artifacts)
- Max Concurrent Connections: 10,000 (OS limit)

---

## Port Configuration

### **Port Binding Rules:**

```javascript
// ALWAYS bind to 0.0.0.0:5000 for frontend
// This is the ONLY port exposed to the internet

// server/index.ts
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Why 0.0.0.0?**
- Binds to all network interfaces
- Makes server accessible via Replit's proxy
- Required for webview to work

**Why Port 5000?**
- Only port not firewalled by Replit
- Replit automatically proxies this port to public URL

**Common Mistakes:**
```javascript
// ❌ WRONG: localhost only
app.listen(5000, 'localhost');

// ❌ WRONG: Different port
app.listen(3000, '0.0.0.0');

// ✅ CORRECT
app.listen(5000, '0.0.0.0');
```

---

## Environment Variables

### **Replit-Provided Variables:**

```bash
# Deployment Environment
REPL_ID                 # Unique repl identifier
REPL_OWNER              # Username of repl owner
REPL_SLUG               # URL-safe repl name
REPLIT_DOMAINS          # Public domain (e.g., mundotango.replit.app)
REPLIT_DEV_DOMAIN       # Dev domain for testing

# Database (Neon PostgreSQL)
DATABASE_URL            # Full connection string
PGHOST                  # Database host
PGPORT                  # Database port (5432)
PGDATABASE              # Database name
PGUSER                  # Database username
PGPASSWORD              # Database password

# Runtime
NODE_ENV                # 'development' or 'production'
```

**Usage in Code:**
```typescript
// Always use environment variables, never hardcode
const isDev = process.env.NODE_ENV === 'development';
const publicURL = process.env.REPLIT_DOMAINS || 'http://localhost:5000';

// Database connection
import { drizzle } from 'drizzle-orm/neon-http';
const db = drizzle(process.env.DATABASE_URL!);
```

---

## Resource Monitoring

### **Check Current Usage:**

```bash
# CPU and Memory
top -bn1 | grep "Cpu(s)"
free -h | grep "Mem:"

# Disk Space
df -h

# Network Connections
netstat -an | grep ESTABLISHED | wc -l

# Process List
ps aux --sort=-%mem | head -10
```

**Expected Baseline:**
- CPU: 10-30% idle, 40-60% under load
- Memory: 1-2GB (Node.js + PostgreSQL client + caching)
- Disk: 5-10GB used (node_modules + build artifacts)
- Connections: 50-200 active (WebSocket + HTTP)

**Alert Thresholds:**
- 🟡 CPU >80% for 5 minutes → Investigate bottleneck
- 🔴 CPU >95% sustained → Vertical scaling needed
- 🟡 Memory >3GB → Check for leaks
- 🔴 Memory >3.8GB → OOM imminent, restart required
- 🟡 Disk >15GB → Clean old logs/dependencies
- 🔴 Disk >18GB → Critical, delete or upgrade

---

## Performance Optimization

### **1. Node.js Configuration**

```javascript
// server/index.ts
import { cpus } from 'os';

// Optimize V8 heap
const heapSize = Math.floor(3.5 * 1024); // 3.5GB (leave buffer)
process.env.NODE_OPTIONS = `--max-old-space-size=${heapSize}`;

// Use all CPU cores (for non-blocking I/O)
console.log(`Available CPUs: ${cpus().length}`);
```

---

### **2. Connection Pooling (Neon PostgreSQL)**

```typescript
// Neon is serverless, auto-scales connections
// But we still need to manage client-side pooling

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!, {
  // Neon connection settings
  fetchConnectionCache: true, // Reuse HTTP connections
});

const db = drizzle(sql);

// For traditional Postgres (if switching from Neon):
import { Pool } from 'pg';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Max connections (Neon free tier: 100)
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

**Best Practices:**
- Neon serverless: No pool needed, HTTP-based
- Traditional Postgres: Pool size = 10-20 (reserved VM)
- Always close connections after queries
- Monitor active connections (Neon dashboard)

---

### **3. Caching Strategy**

```typescript
// In-memory caching (for small datasets)
const cache = new Map<string, any>();

function getCached<T>(key: string, fetcher: () => Promise<T>, ttl = 60000): Promise<T> {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return Promise.resolve(cached.value);
  }
  
  return fetcher().then(value => {
    cache.set(key, { value, timestamp: Date.now() });
    return value;
  });
}

// Usage
const users = await getCached('all-users', () => db.query.users.findMany(), 5 * 60 * 1000);
```

**When to Use:**
- Small datasets (<1MB)
- Frequently accessed data
- Low write frequency

**When NOT to Use:**
- Large datasets (>10MB) → Use Redis/external cache
- User-specific data → Redis with user-scoped keys
- Real-time data → No caching, use WebSocket

---

## Deployment Configuration

### **deploy.toml (Reserved VM)**

```toml
[deployment]
# Reserved VM deployment
deploymentTarget = "vm"

# Build command (compile TypeScript)
build = ["npm", "run", "build"]

# Start command (production server)
run = ["npm", "run", "start"]

# Health check (optional)
# Replit pings this URL to verify deployment
# [deployment.health]
# url = "/"
# interval = 30
```

**For Mundo Tango:**
```bash
# Check current deploy config
cat .replit

# Expected configuration
[deployment]
deploymentTarget = "vm"
build = ["npm", "run", "build"]
run = ["npm", "run", "start"]
```

---

## Troubleshooting

### **Issue 1: Server Not Accessible**

**Symptoms:** Webview shows "Unable to connect"

**Diagnosis:**
```bash
# Check if server is running
ps aux | grep node

# Check port binding
netstat -tulpn | grep :5000

# Check logs
cat /tmp/server.log
```

**Common Causes:**
1. ❌ Server bound to localhost instead of 0.0.0.0
2. ❌ Server using port other than 5000
3. ❌ Server crashed (check logs)
4. ❌ Firewall blocking connections (shouldn't happen on Replit)

**Fix:**
```javascript
// Ensure correct binding
app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on 0.0.0.0:5000');
});
```

---

### **Issue 2: Out of Memory (OOM)**

**Symptoms:** Server crashes with "JavaScript heap out of memory"

**Diagnosis:**
```bash
# Check memory usage
free -h

# Check Node.js heap usage
node -e "console.log(process.memoryUsage())"
```

**Fixes:**
1. **Increase heap size (if <3.5GB already):**
```javascript
process.env.NODE_OPTIONS = '--max-old-space-size=3584'; // 3.5GB
```

2. **Find memory leaks:**
```bash
# Use --inspect for memory profiling
node --inspect server/index.js

# Or use heapdump package
npm install heapdump
```

3. **Optimize queries:**
```typescript
// ❌ BAD: Load all data into memory
const allPosts = await db.query.posts.findMany();

// ✅ GOOD: Paginate
const posts = await db.query.posts.findMany({ limit: 20 });
```

---

### **Issue 3: High CPU Usage**

**Symptoms:** Server slow, CPU >90%

**Diagnosis:**
```bash
# Top CPU processes
top -bn1 | head -20

# Node.js profiling
node --prof server/index.js
```

**Common Causes:**
1. Infinite loops
2. Unoptimized algorithms (O(n²) instead of O(n))
3. Heavy synchronous operations
4. Too many concurrent requests

**Fixes:**
```typescript
// ❌ BAD: Blocking operation
const result = expensiveSync();

// ✅ GOOD: Async + worker threads for CPU-intensive
import { Worker } from 'worker_threads';

function expensiveAsync() {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.js');
    worker.on('message', resolve);
    worker.on('error', reject);
  });
}
```

---

## Scaling Strategies

### **Vertical Scaling (Upgrade VM):**

**When to Scale:**
- Consistent CPU >80%
- Memory >3GB with optimization done
- Need faster response times

**Replit Plans:**
- Free: 0.5 vCPU, 0.5GB RAM
- Hacker: 2 vCPU, 2GB RAM
- Pro: 4 vCPU, 4GB RAM
- **Current (Reserved VM):** ~2-4 vCPU, 4GB RAM

---

### **Horizontal Scaling (Multiple Instances):**

**Not directly supported on single Replit**
**But can be simulated:**

1. **Load Balancer Pattern:**
```typescript
// Use Cloudflare Load Balancer
// Point to multiple Replit deployments

// Replits:
// - mundotango-1.replit.app
// - mundotango-2.replit.app
// - mundotango-3.replit.app

// Cloudflare LB:
// - mundotango.com → round-robin to all 3
```

2. **Stateless Architecture:**
```typescript
// Store state in external services
// - Session: Redis (Upstash)
// - Database: Neon (already using)
// - Cache: Cloudflare Workers KV
// - WebSocket: Socket.io Redis adapter

import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';

const pubClient = new Redis(process.env.REDIS_URL);
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

---

## Monitoring and Alerts

### **Built-in Monitoring:**

```bash
# Replit metrics (in IDE)
# - CPU usage graph
# - Memory usage graph
# - Network I/O

# Access via:
# Shell → Run `replit resources`
```

---

### **Custom Monitoring:**

```typescript
// server/monitoring.ts
import { cpus, freemem, totalmem } from 'os';

export function getSystemMetrics() {
  return {
    cpu: {
      cores: cpus().length,
      load: process.cpuUsage(),
    },
    memory: {
      free: freemem(),
      total: totalmem(),
      used: totalmem() - freemem(),
      percentage: ((totalmem() - freemem()) / totalmem()) * 100,
    },
    process: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    },
  };
}

// Endpoint for monitoring
app.get('/health/metrics', (req, res) => {
  res.json(getSystemMetrics());
});
```

**Integrate with PostHog:**
```typescript
import posthog from 'posthog-node';

setInterval(() => {
  const metrics = getSystemMetrics();
  posthog.capture({
    distinctId: 'system',
    event: 'system_metrics',
    properties: metrics,
  });
}, 60000); // Every minute
```

---

## Security Considerations

### **1. Firewall Rules:**

**Default Replit Firewall:**
- ✅ Port 5000: Open (public webserver)
- ❌ All other ports: Blocked from internet
- ✅ Internal: All ports accessible within repl

**Implications:**
- Backend services on port 3000: Not directly accessible (good!)
- Database on localhost: Protected (good!)
- WebSocket on port 5000: Must share with HTTP (handled by Express)

---

### **2. Secrets Management:**

```bash
# NEVER commit secrets to Git
# Use Replit Secrets (Environment Variables pane)

# Access in code:
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error('Missing OPENAI_API_KEY');
```

---

### **3. Rate Limiting:**

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later.',
});

app.use('/api/', limiter);
```

---

## Cost Optimization

**Reserved VM Pricing (Estimated):**
- Free tier: Limited hours/day
- Paid (Always On): $7-20/month depending on plan

**Optimization Tips:**
1. Use Neon serverless DB (pay per query, not uptime)
2. Optimize code to reduce CPU usage
3. Cache aggressively (reduce DB queries)
4. Compress responses (gzip middleware)
5. Use CDN for static assets (Cloudinary)

---

## Integration with ESA Protocols

**CHECK_BEFORE_BUILD:**
- Verify VM resources available before deployment
- Check disk space >2GB free

**PERFORMANCE_METRICS:**
- Monitor CPU/memory as part of metrics protocol
- Alert if VM resources exhausted

**WORKLOAD_BALANCING:**
- Queue tasks when CPU >80%
- Reduce parallelism to conserve resources

---

**Document Owner:** Platform Enhancement Division (#8) + Layer #46  
**Review Cycle:** Quarterly or when scaling  
**Last Updated:** October 19, 2025
