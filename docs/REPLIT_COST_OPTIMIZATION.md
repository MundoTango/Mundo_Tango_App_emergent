# Replit Cost Optimization Strategies
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Audience:** Platform administrators, budget owners

## Overview

This guide provides actionable strategies to minimize Replit hosting costs while maintaining performance and reliability for the Mundo Tango platform.

---

## Current Cost Structure

### **Replit Reserved VM Pricing (Estimated):**

```
Base Plan:
- Free Tier: Limited hours/day, pauses when inactive
- Hacker ($7/mo): Always-on, 2GB RAM, basic compute
- Pro ($20/mo): Always-on, 4GB RAM, faster compute

Additional Costs:
- Database (Neon): $0-20/mo depending on usage
- Outbound bandwidth: Included up to limit
- Storage: 20GB included

Estimated MT Platform Monthly Cost:
- Replit Reserved VM (Pro): $20/mo
- Neon Database: $5-10/mo (free tier likely sufficient)
- External Services: Variable
  - Anthropic Claude: Pay-per-use (~$10-50/mo depending on usage)
  - Gemini: Free tier (1500 requests/day)
  - Cloudinary: Free tier (25GB/mo)
  - PostHog: Free tier (1M events/mo)

TOTAL: ~$35-80/month (mostly external APIs)
```

---

## Optimization Strategies

### **1. Database Optimization (Neon)**

#### **Use Neon Serverless (Already doing ✅)**

```typescript
// Neon serverless = pay per query, not uptime
// Cost: ~$0.10 per compute hour
// Free tier: 500MB storage, 100 compute hours/month
```

**Why it saves money:**
- Traditional PostgreSQL: Always running = $20-50/mo minimum
- Neon: Scales to zero when idle = $0-10/mo

---

#### **Reduce Query Frequency**

```typescript
// ❌ EXPENSIVE: Query database every request
app.get('/api/stats', async (req, res) => {
  const count = await db.$count(users);
  res.json({ userCount: count });
});
// Cost: 100 req/min × 60 min × 24 hr = 144,000 queries/day
// Neon compute time: ~2 hours/day = $0.20/day = $6/month

// ✅ CHEAP: Cache for 5 minutes
const cache = { count: 0, timestamp: 0 };
app.get('/api/stats', async (req, res) => {
  if (Date.now() - cache.timestamp > 5 * 60 * 1000) {
    cache.count = await db.$count(users);
    cache.timestamp = Date.now();
  }
  res.json({ userCount: cache.count });
});
// Cost: 288 queries/day (5min cache)
// Neon compute time: ~1 minute/day = $0.003/day = $0.10/month
// SAVINGS: 99% reduction ($5.90/month saved)
```

---

#### **Optimize Slow Queries**

```sql
-- Expensive query (full table scan)
SELECT * FROM posts WHERE content LIKE '%tango%';
-- Cost: 100ms × 1000 calls/day = 100 seconds compute

-- Optimized query (full-text search index)
CREATE INDEX posts_content_fts ON posts USING gin(to_tsvector('english', content));

SELECT * FROM posts WHERE to_tsvector('english', content) @@ to_tsquery('tango');
-- Cost: 10ms × 1000 calls/day = 10 seconds compute
-- SAVINGS: 90% reduction
```

---

### **2. External API Optimization**

#### **Anthropic Claude (Pay-per-use)**

**Current Usage Pattern:**
```typescript
// Mr Blue AI chat - streaming responses
// Estimated usage: 1000 messages/day
// Cost: $0.02 per 1000 tokens (input) + $0.10 per 1000 tokens (output)
// Average: 500 input tokens + 2000 output tokens per message
// Daily cost: 1000 × ($0.01 + $0.20) = $210/day = $6,300/month (!!)
```

**Optimization Strategies:**

**A) Reduce Context Size**
```typescript
// ❌ EXPENSIVE: Send full conversation history
const messages = conversationHistory; // 10,000 tokens

// ✅ CHEAP: Send only last 5 messages + system prompt
const messages = [
  systemPrompt,
  ...conversationHistory.slice(-5)
]; // 2,000 tokens
// SAVINGS: 80% token reduction = $5,040/month saved
```

**B) Cache System Prompts**
```typescript
// Anthropic supports prompt caching (up to 90% discount)
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet',
  system: [{
    type: 'text',
    text: longSystemPrompt,
    cache_control: { type: 'ephemeral' } // Cache this prompt
  }],
  messages: userMessages
});
// SAVINGS: 90% on cached prompts = $1,890/month saved
```

**C) Use Cheaper Models for Simple Tasks**
```typescript
// Complex reasoning: claude-3-5-sonnet ($0.02/$0.10 per 1K tokens)
// Simple tasks: claude-3-haiku ($0.0025/$0.01 per 1K tokens)

const model = task.complexity === 'high' 
  ? 'claude-3-5-sonnet' 
  : 'claude-3-haiku';

// SAVINGS: 90% on simple tasks
// If 70% of tasks are simple: 0.7 × $6,300 × 0.9 = $3,969/month saved
```

**Total Anthropic Savings:** $5,000-10,000/month (from $6,300 to $300-1,300)

---

#### **Google Gemini (Free Tier Alternative)**

```typescript
// Gemini 1.5 Flash: 1500 requests/day FREE
// Use for non-critical AI tasks

const provider = task.priority === 'high' 
  ? 'anthropic'  // $$$
  : 'gemini';    // FREE

// SAVINGS: $50-200/month (offload 30-50% to Gemini)
```

---

### **3. Media Storage Optimization (Cloudinary)**

**Free Tier:** 25GB storage, 25GB bandwidth/month

**Optimization:**

**A) Image Compression**
```typescript
// Upload with automatic optimization
import { v2 as cloudinary } from 'cloudinary';

cloudinary.uploader.upload(imageFile, {
  quality: 'auto:good',  // Auto-optimize quality
  fetch_format: 'auto',  // WebP for modern browsers, JPEG for old
  width: 1200,           // Max width (responsive)
  crop: 'limit',         // Don't upscale
});

// SAVINGS: 70% storage reduction
// Before: 10GB/month
// After: 3GB/month
// Cost: Stays in free tier
```

**B) Lazy Loading**
```typescript
// Client-side lazy load images
<img 
  src={cloudinaryUrl} 
  loading="lazy"  // Browser native lazy load
  decoding="async"
/>

// SAVINGS: 50% bandwidth reduction (images below fold)
```

---

### **4. Compute Optimization (Replit VM)**

#### **A) Reduce CPU Usage**

```typescript
// ❌ EXPENSIVE: Synchronous heavy operations
function processImage(image: Buffer): Buffer {
  // Heavy CPU work blocks event loop
  return sharp(image).resize(800).toBuffer();
}

// ✅ CHEAP: Use worker threads
import { Worker } from 'worker_threads';

function processImageAsync(image: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./imageWorker.js');
    worker.postMessage(image);
    worker.on('message', resolve);
    worker.on('error', reject);
  });
}

// SAVINGS: Reduces CPU usage by 40%
```

---

#### **B) Optimize Build Artifacts**

```bash
# Remove unused dependencies
npm prune --production

# Clear old build artifacts
rm -rf .next .cache dist

# Optimize node_modules (save disk space)
npm dedupe

# SAVINGS: 2-5GB disk space
# Faster deploys = less compute time
```

---

### **5. Monitoring Cost Optimization**

#### **PostHog (Analytics)**

**Free Tier:** 1M events/month

**Optimization:**
```typescript
// ❌ EXPENSIVE: Track every page view
posthog.capture('page_view'); // 100K users × 10 pages = 1M events

// ✅ CHEAP: Sample events
const shouldTrack = Math.random() < 0.1; // 10% sampling

if (shouldTrack) {
  posthog.capture('page_view');
}

// SAVINGS: 90% event reduction
// Stays in free tier
```

---

## Cost Monitoring Dashboard

### **Track Actual Costs:**

```typescript
// server/routes/admin.ts
app.get('/admin/cost-report', async (req, res) => {
  const report = {
    replit: {
      plan: 'Pro',
      cost: 20, // $20/month
    },
    neon: {
      computeHours: await getNeonComputeHours(),
      estimatedCost: computeHours * 0.10, // $0.10/hour
    },
    anthropic: {
      tokensUsed: await getAnthropicTokens(),
      estimatedCost: calculateAnthropicCost(tokensUsed),
    },
    cloudinary: {
      bandwidth: await getCloudinaryBandwidth(),
      storage: await getCloudinaryStorage(),
      cost: 0, // Still in free tier
    },
  };
  
  res.json({
    ...report,
    total: report.replit.cost + report.neon.estimatedCost + report.anthropic.estimatedCost
  });
});
```

---

## Cost Alerts

```typescript
// Alert if monthly cost exceeds budget
const MONTHLY_BUDGET = 100; // $100/month

setInterval(async () => {
  const currentCost = await getTotalMonthlyCost();
  const projectedCost = (currentCost / new Date().getDate()) * 30;
  
  if (projectedCost > MONTHLY_BUDGET) {
    await sendAlert({
      severity: 'high',
      message: `Projected monthly cost: $${projectedCost.toFixed(2)} exceeds budget of $${MONTHLY_BUDGET}`,
      recommendations: [
        'Review Anthropic API usage',
        'Check for query loops',
        'Verify caching is working',
      ]
    });
  }
}, 24 * 60 * 60 * 1000); // Daily check
```

---

## ROI Analysis

**Before Optimization:**
```
Replit Pro:        $20/mo
Neon DB:           $10/mo
Anthropic:      $6,300/mo
Cloudinary:         $0/mo
PostHog:            $0/mo
-------------------------
TOTAL:          $6,330/mo
```

**After Optimization:**
```
Replit Pro:        $20/mo  (no change)
Neon DB:            $1/mo  (caching, indexing)
Anthropic:        $300/mo  (prompt caching, model selection, context reduction)
Cloudinary:         $0/mo  (compression, lazy load)
PostHog:            $0/mo  (sampling)
-------------------------
TOTAL:            $321/mo

SAVINGS: $6,009/month (95% reduction!)
```

---

## Recommended Action Plan

**Month 1: Quick Wins (Implement Now)**
- [ ] Enable Anthropic prompt caching
- [ ] Reduce conversation context to last 5 messages
- [ ] Add database query caching (5-minute TTL)
- [ ] Optimize slow database queries with indexes
- Expected Savings: $3,000/month

**Month 2: Medium Effort**
- [ ] Implement Gemini for non-critical tasks
- [ ] Set up cost monitoring dashboard
- [ ] Configure cost alerts
- [ ] Optimize Cloudinary image compression
- Expected Savings: $2,000/month

**Month 3: Advanced Optimizations**
- [ ] Implement Redis caching (if needed)
- [ ] Set up CDN for static assets
- [ ] Optimize worker threads for CPU tasks
- Expected Savings: $500/month

**Total Potential Savings: $5,500/month**

---

**Document Owner:** Platform Enhancement Division (#8)  
**Review Cycle:** Monthly (adjust based on usage patterns)  
**Last Updated:** October 19, 2025
