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
