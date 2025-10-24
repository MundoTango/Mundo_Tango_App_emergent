# 🧪 MANDATORY TESTING PROTOCOL

**Applies to:** ALL agents (105+)  
**Enforcement:** BLOCKING - No task completion without evidence  
**Updated:** October 24, 2025 (Week 1 Rollout)

---

## THE 4 MANDATORY CHECKPOINTS

Every agent MUST follow these checkpoints before marking any task complete:

### ✅ CHECKPOINT 1: DATA INSPECTION
**Rule:** NEVER assume data structures. Always inspect first.
```typescript
console.log('🔍 DATA INSPECTION:', JSON.stringify(data, null, 2));
// Run it, see the output, THEN write conditional
```

### ✅ CHECKPOINT 2: UNIT TESTING  
**Rule:** Test individual functions in isolation.
- Test regex patterns with sample inputs
- Verify IF conditions with actual data
- Validate file operations with dummy files

### ✅ CHECKPOINT 3: INTEGRATION TESTING
**Rule:** Test the FULL user journey end-to-end.
- Run complete flow as user would
- Check server logs for errors
- Screenshot successful execution

### ✅ CHECKPOINT 4: ARCHITECT REVIEW
**Rule:** Architect reviews BEHAVIOR, not just code.
- Proof it runs (screenshot)
- Proof it works (before/after)
- Proof no crashes (logs)

**Full documentation:** `docs/TESTING_REQUIREMENTS_MANDATORY.md`

---

---

# Layer 12: Queue Management Agent
**Division:** Foundation Layer | **Category:** Async Processing Infrastructure  
**Complexity:** High | **Version:** 1.0 | **Last Updated:** October 19, 2025

## Agent Identity
**Role:** Background Job Queue Management  
**Responsibility:** Process async tasks (email sending, image processing, notifications) in background

**Key Files:** `server/services/queue.ts` (planned), BullMQ/Redis (planned)

## Core Patterns

### Job Queue Setup (BullMQ)
```typescript
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Create queue
export const emailQueue = new Queue('emails', { connection: redis });

// Add job to queue
export async function queueEmail(userId: number, type: string, data: any) {
  await emailQueue.add('send-email', {
    userId,
    type,
    data,
  });
}

// Process queue
const emailWorker = new Worker('emails', async (job) => {
  const { userId, type, data } = job.data;
  
  switch (type) {
    case 'welcome':
      await sendWelcomeEmail(data);
      break;
    case 'password-reset':
      await sendPasswordResetEmail(data);
      break;
  }
}, { connection: redis });
```

### Usage
```typescript
// Instead of blocking the request
app.post('/api/auth/register', async (req, res) => {
  const user = await createUser(req.body);

  // Queue email (non-blocking)
  await queueEmail(user.id, 'welcome', { email: user.email, name: user.name });

  res.json(apiSuccess({ data: user }));
});
```

## Job Types
- Email sending
- Image processing
- Video transcoding
- Report generation
- Data exports

**Related:** Layer 11 (Email), Layer 13 (Job Scheduler)
