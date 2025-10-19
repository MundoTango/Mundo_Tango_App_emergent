# Mundo Tango n8n Workflow Integration Guide
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Platform:** n8n (Workflow Automation)  
**References:** 69 codebase instances

## Overview

Mundo Tango integrates with **n8n** for workflow automation, including webhook triggers, external service integration, and event-driven automation. This guide covers webhook setup and automation patterns.

---

## Configuration

### **Environment Variables**

```bash
# .env
N8N_WEBHOOK_URL=https://n8n.mundotango.com/webhook
N8N_API_KEY=...
N8N_ENABLE=true
```

---

## Webhook Integration

### **Pattern 1: Trigger n8n Workflow**

```typescript
// server/services/n8n.ts
async function triggerN8NWorkflow(
  workflowId: string,
  data: Record<string, any>
): Promise<void> {
  if (process.env.N8N_ENABLE !== 'true') {
    console.log('n8n disabled, skipping workflow trigger');
    return;
  }

  const webhookUrl = `${process.env.N8N_WEBHOOK_URL}/${workflowId}`;

  await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.N8N_API_KEY}`,
    },
    body: JSON.stringify(data),
  });
}

// Usage: New user registration
app.post('/api/auth/register', async (req, res) => {
  const user = await createUser(req.body);

  // Trigger welcome email workflow
  await triggerN8NWorkflow('welcome-email', {
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  res.json(apiSuccess({ data: user }));
});
```

---

### **Pattern 2: Receive Webhook from n8n**

```typescript
// POST /api/webhooks/n8n
app.post('/api/webhooks/n8n', async (req, res) => {
  try {
    // Verify n8n signature (optional security)
    const signature = req.headers['x-n8n-signature'];
    if (signature !== process.env.N8N_WEBHOOK_SECRET) {
      return res.status(401).json(apiError('Invalid signature', 401));
    }

    const { eventType, data } = req.body;

    switch (eventType) {
      case 'email_sent':
        // Update email status in database
        await db.update(emailLogs).set({
          status: 'sent',
          sentAt: new Date(),
        }).where(eq(emailLogs.id, data.emailId));
        break;

      case 'payment_processed':
        // Update subscription status
        await db.update(subscriptions).set({
          status: 'active',
          activatedAt: new Date(),
        }).where(eq(subscriptions.id, data.subscriptionId));
        break;

      default:
        console.warn(`Unknown event type: ${eventType}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('n8n webhook error:', error);
    res.status(500).json(apiError('Webhook processing failed', 500));
  }
});
```

---

## Common Workflows

### **1. Welcome Email (New User)**

```typescript
// Trigger on user registration
async function sendWelcomeEmail(user: User) {
  await triggerN8NWorkflow('welcome-email', {
    userId: user.id,
    email: user.email,
    name: user.name,
    registeredAt: user.createdAt,
  });
}

// n8n workflow steps:
// 1. Webhook trigger
// 2. Gmail/SendGrid node - Send welcome email
// 3. Slack notification - Alert team
// 4. HTTP Request - Update Mundo Tango email log
```

---

### **2. Subscription Notifications**

```typescript
// Trigger on subscription change
async function notifySubscriptionChange(subscription: Subscription) {
  await triggerN8NWorkflow('subscription-notification', {
    userId: subscription.userId,
    tier: subscription.tier,
    status: subscription.status,
    nextBillingDate: subscription.nextBillingDate,
  });
}

// n8n workflow:
// 1. Webhook trigger
// 2. If statement - Check subscription status
// 3a. Active → Send confirmation email
// 3b. Cancelled → Send exit survey
// 4. Update CRM (HubSpot/Salesforce)
```

---

### **3. Event Reminders**

```typescript
// Scheduled workflow (runs daily)
async function scheduleEventReminders() {
  const upcomingEvents = await db.query.events.findMany({
    where: and(
      gt(events.startDate, new Date()),
      lt(events.startDate, new Date(Date.now() + 24 * 60 * 60 * 1000)), // Next 24 hours
    ),
  });

  for (const event of upcomingEvents) {
    await triggerN8NWorkflow('event-reminder', {
      eventId: event.id,
      eventName: event.name,
      startTime: event.startDate,
      attendees: event.attendeeEmails,
    });
  }
}

// n8n workflow:
// 1. Schedule trigger (daily at 9am)
// 2. HTTP Request - Fetch upcoming events from Mundo Tango
// 3. Loop over events
// 4. Send reminder emails to attendees
```

---

### **4. Content Moderation Alert**

```typescript
// Trigger on flagged content
async function alertModerators(report: PostReport) {
  await triggerN8NWorkflow('moderation-alert', {
    reportId: report.id,
    postId: report.postId,
    reason: report.reason,
    reportedBy: report.reportedBy,
    reportedAt: report.createdAt,
  });
}

// n8n workflow:
// 1. Webhook trigger
// 2. HTTP Request - Get full post details
// 3. Slack message - Alert moderators
// 4. Jira ticket - Create moderation task
// 5. Discord webhook - Log in admin channel
```

---

## Error Handling

```typescript
async function safeN8NTrigger(
  workflowId: string,
  data: Record<string, any>
): Promise<boolean> {
  try {
    await triggerN8NWorkflow(workflowId, data);
    return true;
  } catch (error) {
    console.error(`n8n workflow ${workflowId} failed:`, error);
    
    // Log failure to database
    await db.insert(n8nLogs).values({
      workflowId,
      status: 'failed',
      error: error.message,
      payload: data,
    });

    return false;
  }
}
```

---

## Testing

```typescript
import { describe, it, expect, vi } from 'vitest';

// Mock fetch for n8n calls
global.fetch = vi.fn();

describe('n8n Integration', () => {
  it('triggers workflow', async () => {
    (fetch as any).mockResolvedValue({ ok: true });

    await triggerN8NWorkflow('test-workflow', { userId: 1 });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('test-workflow'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ userId: 1 }),
      })
    );
  });
});
```

---

## Production Setup

### **n8n Self-Hosted Configuration**

```yaml
# docker-compose.yml
version: '3'
services:
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - '5678:5678'
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=securepassword
      - N8N_HOST=n8n.mundotango.com
      - WEBHOOK_URL=https://n8n.mundotango.com
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

---

## Best Practices

1. **✅ Use environment flags** - Disable n8n in development
2. **✅ Implement retry logic** - Workflows may fail
3. **✅ Log all triggers** - Track automation executions
4. **✅ Secure webhooks** - Use signature verification
5. **✅ Monitor failures** - Alert on repeated failures

---

## Next Steps

1. Set up n8n instance (self-hosted or cloud)
2. Create workflow templates
3. Implement webhook endpoints
4. Test automation flows
5. Monitor workflow executions

**Related Files:**
- `server/services/n8n.ts` - n8n service (to be created)
- `server/routes/webhooks.ts` - Webhook endpoints
- `docs/MT_API_CONVENTIONS.md` - Webhook security patterns
