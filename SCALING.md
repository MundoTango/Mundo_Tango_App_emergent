# Scaling Strategies - Mundo Tango Platform
**Current Scale**: ~1,000 users (MVP target)  
**Target Scale**: 100,000+ users (Phase 3)  
**Date**: October 17, 2025

---

## 🎯 **CURRENT STATE**

### **Infrastructure**:
- **Hosting**: Replit Reserved VM
- **vCPUs**: 2-4
- **RAM**: 4GB
- **Database**: PostgreSQL (single instance)
- **Port**: 5000 (single server)
- **Concurrent connections**: ~500

**This setup handles**: 1,000-5,000 users comfortably

---

## 📊 **SCALING ROADMAP**

### **Phase 1: MVP (0-1,000 users)** ✅ **CURRENT**
**Infrastructure**: Single Replit VM  
**Database**: PostgreSQL (single instance)  
**Strategy**: Vertical scaling (add more RAM/CPU)

**Optimizations**:
- ✅ Caching (Redis/React Query)
- ✅ Database indexes
- ✅ Image compression
- ✅ Code splitting
- ✅ Lazy loading

**Cost**: ~$20-50/month (Replit Reserved VM)

---

### **Phase 2: Growth (1,000-10,000 users)**
**Timeline**: Months 3-6  
**Infrastructure**: Load balancing + database optimization

**Horizontal Scaling**:
```
Load Balancer
    ├─ App Server 1 (Replit VM #1)
    ├─ App Server 2 (Replit VM #2)
    └─ App Server 3 (Replit VM #3)
        ↓
PostgreSQL Primary (with read replicas)
        ↓
Redis Cluster (caching + sessions)
```

**Database Scaling**:
- Add read replicas for queries
- Write to primary, read from replicas
- Connection pooling (PgBouncer)
- Query optimization

**Caching Strategy**:
- Redis for session storage
- Cache frequent queries (events, user profiles)
- CDN for static assets (Cloudinary)
- Browser caching headers

**Cost**: ~$200-500/month

---

### **Phase 3: Scale (10,000-100,000 users)**
**Timeline**: Months 6-12  
**Infrastructure**: Distributed system

**Microservices Architecture**:
```
API Gateway
    ├─ User Service
    ├─ Post Service
    ├─ Event Service
    ├─ Real-time Service (Socket.io)
    └─ Media Service
        ↓
Database Cluster (PostgreSQL)
        ↓
Message Queue (RabbitMQ/Redis)
        ↓
CDN (Cloudinary/CloudFlare)
```

**Geographic Distribution**:
- Deploy in multiple regions:
  - US East (for North America)
  - EU West (for Europe)
  - SA East (for South America - tango heartland!)
- Route users to nearest server
- Database replication across regions

**Real-time Scaling**:
- Separate Socket.io cluster
- Redis pub/sub for cross-server events
- Sticky sessions for WebSocket

**Cost**: ~$1,000-2,000/month

---

### **Phase 4: Hyper-scale (100,000+ users)**
**Timeline**: Year 2+  
**Infrastructure**: Cloud-native

**Full Cloud Migration**:
```
CloudFlare (CDN + DDoS protection)
    ↓
AWS/GCP Load Balancer
    ├─ Auto-scaling ECS/Kubernetes clusters
    │   ├─ 10-50 app containers
    │   └─ 5-10 Socket.io containers
    ↓
Database:
    ├─ PostgreSQL RDS (primary + replicas)
    └─ DynamoDB (for high-write data)
    ↓
Caching:
    ├─ Redis ElastiCache cluster
    └─ CloudFront CDN
    ↓
Storage:
    ├─ S3 (media files)
    └─ CloudFront (global delivery)
```

**Advanced Optimization**:
- Serverless functions for background jobs
- GraphQL Federation for efficient queries
- Edge computing (CloudFlare Workers)
- AI/ML optimization for recommendations

**Cost**: ~$5,000-15,000/month

---

## 🔧 **OPTIMIZATION STRATEGIES**

### **Database Optimization**:

#### **Indexing**:
```sql
-- Critical indexes for performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_events_city ON events(city);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_users_city ON users(city);

-- Composite indexes for common queries
CREATE INDEX idx_posts_user_created 
  ON posts(user_id, created_at DESC);
CREATE INDEX idx_events_city_time 
  ON events(city, start_time);
```

#### **Query Optimization**:
```typescript
// BAD: N+1 query problem
const posts = await db.select().from(posts);
for (const post of posts) {
  post.user = await db.select()
    .from(users)
    .where(eq(users.id, post.userId));
}

// GOOD: Join query
const posts = await db.select()
  .from(posts)
  .leftJoin(users, eq(posts.userId, users.id))
  .limit(20);
```

#### **Connection Pooling**:
```typescript
// Use connection pool
const pool = new Pool({
  max: 20, // Max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

### **Caching Strategies**:

#### **Redis Caching**:
```typescript
// Cache hot data
async function getUserProfile(userId: number) {
  const cacheKey = `user:${userId}`;
  
  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Cache miss - query database
  const user = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  // Store in cache (TTL: 5 minutes)
  await redis.setex(cacheKey, 300, JSON.stringify(user));
  
  return user;
}
```

#### **React Query Client Cache**:
```typescript
// Frontend caching
const { data } = useQuery({
  queryKey: ['/api/events', city],
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
});
```

#### **CDN Caching**:
```typescript
// Set cache headers
app.get('/api/public/events', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  res.json(events);
});
```

---

### **Load Balancing**:

#### **Round Robin**:
```nginx
upstream app_servers {
    server app1.repl.co:5000;
    server app2.repl.co:5000;
    server app3.repl.co:5000;
}

server {
    location / {
        proxy_pass http://app_servers;
    }
}
```

#### **Sticky Sessions** (for WebSocket):
```nginx
upstream socket_servers {
    ip_hash; # Sticky sessions
    server socket1.repl.co:5000;
    server socket2.repl.co:5000;
}
```

---

### **Background Jobs**:

```typescript
// Queue system for heavy tasks
import { Queue, Worker } from 'bullmq';

const imageQueue = new Queue('image-processing', {
  connection: redisConnection
});

// Producer: Add jobs
await imageQueue.add('compress', {
  imageUrl: '/uploads/large-image.jpg',
  userId: 123
});

// Consumer: Process jobs
const worker = new Worker('image-processing', async (job) => {
  const { imageUrl } = job.data;
  await compressImage(imageUrl);
}, { connection: redisConnection });
```

---

## 📊 **MONITORING & ALERTS**

### **Key Metrics to Track**:

```typescript
// Performance metrics
const metrics = {
  responseTime: {
    p50: 120, // ms
    p95: 350,
    p99: 800
  },
  throughput: 500, // requests/second
  errorRate: 0.02, // 2%
  databaseConnections: 15, // active
  cacheHitRate: 0.85, // 85%
  cpuUsage: 0.45, // 45%
  memoryUsage: 0.65 // 65%
};
```

### **Alert Thresholds**:
```yaml
alerts:
  - name: High Response Time
    condition: p95 > 500ms
    action: Scale up servers
    
  - name: High Error Rate
    condition: errorRate > 5%
    action: Notify team immediately
    
  - name: Database Connection Limit
    condition: connections > 80% of max
    action: Add connection pooling
    
  - name: High Memory Usage
    condition: memory > 85%
    action: Investigate memory leaks
```

---

## 💰 **COST OPTIMIZATION**

### **Current Costs** (Phase 1):
```
Replit Reserved VM: $20/month
PostgreSQL: Included
Domain: $15/year
Total: ~$25/month
```

### **Projected Costs** (Phase 2-4):

| Phase | Users | Infrastructure | Monthly Cost |
|-------|-------|---------------|--------------|
| Phase 1 | 1K | Single VM | $25 |
| Phase 2 | 10K | 3 VMs + Redis + Replicas | $300 |
| Phase 3 | 100K | Microservices + CDN + Multi-region | $2,000 |
| Phase 4 | 1M+ | Cloud-native + Auto-scaling | $15,000 |

### **Cost Optimization Strategies**:
1. **Use CDN aggressively** - Offload 80% of requests
2. **Cache everything** - Reduce database load
3. **Optimize images** - Reduce bandwidth costs
4. **Auto-scaling** - Scale down during low traffic
5. **Reserved instances** - 30-50% savings vs. on-demand

---

## 🎯 **SCALING DECISION TREE**

```
Current users: < 1,000
    ↓
Phase 1: Single VM ← WE ARE HERE
    ↓
Users growing to 5,000?
    ↓
Add Redis caching + database indexes
    ↓
Users growing to 10,000?
    ↓
Phase 2: Horizontal scaling (3 VMs + load balancer)
    ↓
Users growing to 50,000?
    ↓
Phase 3: Microservices + multi-region
    ↓
Users growing to 100,000+?
    ↓
Phase 4: Cloud-native + auto-scaling
```

---

## 🚀 **IMMEDIATE ACTIONS** (Phase 1 → Phase 2)

### **When to scale**:
- Response time p95 > 500ms consistently
- Database connections > 80% of limit
- CPU usage > 80% sustained
- Memory usage > 85%
- User complaints about slowness

### **First steps**:
1. ✅ Add Redis caching (already done)
2. ✅ Optimize database queries (in progress)
3. ⚠️ Add database indexes
4. ⚠️ Implement CDN for images
5. ⚠️ Add monitoring/alerting
6. ⚠️ Set up load testing

---

## 🧪 **LOAD TESTING**

```bash
# Using Apache Bench
ab -n 10000 -c 100 https://mundo-tango.repl.co/api/events

# Using k6
k6 run --vus 100 --duration 30s load-test.js
```

**Target benchmarks**:
- 1,000 requests/second (Phase 2)
- 10,000 requests/second (Phase 3)
- p95 response time < 300ms
- 99.9% uptime

---

## ✅ **SCALING CHECKLIST**

### **Before scaling to Phase 2**:
- [ ] Database indexes optimized
- [ ] Redis caching implemented
- [ ] CDN configured for static assets
- [ ] Load testing completed
- [ ] Monitoring/alerting active
- [ ] Backup/restore tested
- [ ] Database replication configured
- [ ] Cost projections reviewed

### **Before scaling to Phase 3**:
- [ ] Microservices architecture planned
- [ ] Message queue implemented
- [ ] Multi-region strategy defined
- [ ] Disaster recovery plan documented
- [ ] Security audit completed
- [ ] Performance benchmarks met

---

**Current status**: Phase 1 (optimized for 1K-5K users)  
**Next milestone**: 5,000 users → Add Redis + optimize queries  
**Future**: Modular scaling based on actual growth

---

*For questions, consult Layer 48 (Performance Monitoring Agent) or Layer 50 (DevOps Agent)*
