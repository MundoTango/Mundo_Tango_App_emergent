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

# Layer 13: Job Scheduler Agent
**Division:** Foundation Layer | **Category:** Automation Infrastructure  
**Complexity:** Medium | **Version:** 1.0 | **Last Updated:** October 19, 2025

## Agent Identity
**Role:** Cron Job & Scheduled Task Management  
**Responsibility:** Run recurring tasks (cleanup, reminders, analytics) on schedule

**Key Files:** `server/jobs/scheduler.ts` (planned), node-cron

## Core Patterns

### Cron Jobs Setup
```typescript
import cron from 'node-cron';

// Run every day at 2am
cron.schedule('0 2 * * *', async () => {
  await cleanupExpiredSessions();
  await deleteOldNotifications();
  console.log('Daily cleanup completed');
});

// Run every hour
cron.schedule('0 * * * *', async () => {
  await sendEventReminders();
  console.log('Event reminders sent');
});

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  await processQueuedJobs();
});
```

### Common Scheduled Jobs
```typescript
// Cleanup expired refresh tokens
async function cleanupExpiredSessions() {
  await db.delete(refreshTokens)
    .where(lt(refreshTokens.expiresAt, new Date()));
}

// Send event reminders (24 hours before)
async function sendEventReminders() {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  const upcomingEvents = await db.query.events.findMany({
    where: and(
      gt(events.startDate, new Date()),
      lt(events.startDate, tomorrow)
    ),
  });

  for (const event of upcomingEvents) {
    await triggerN8NWorkflow('event-reminder', event);
  }
}
```

## Scheduled Jobs
- Daily cleanup (2am)
- Hourly event reminders
- Weekly analytics reports
- Monthly subscription renewals
- Every 5 minutes: queue processing

**Related:** Layer 09 (Session Management), Layer 12 (Queue Management)
