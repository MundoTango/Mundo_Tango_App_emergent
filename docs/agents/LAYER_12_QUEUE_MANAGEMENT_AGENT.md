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
