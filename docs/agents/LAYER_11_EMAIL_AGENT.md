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

# Layer 11: Email Agent
**Division:** Foundation Layer | **Category:** Communication Infrastructure  
**Complexity:** Low | **Version:** 1.0 | **Last Updated:** October 19, 2025

## Agent Identity
**Role:** Transactional Email Sending  
**Responsibility:** Send welcome emails, notifications, password resets, and event reminders

**Key Files:** `server/services/email.ts` (planned), n8n integration

## Core Patterns

### Email via n8n Workflow
```typescript
async function sendWelcomeEmail(user: User) {
  await triggerN8NWorkflow('welcome-email', {
    to: user.email,
    name: user.name,
    userId: user.id,
  });
}
```

### Direct Email (Nodemailer)
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: 'noreply@mundotango.com',
    to,
    subject,
    html,
  });
}
```

## Email Types
- Welcome emails (registration)
- Password reset
- Event reminders
- Subscription confirmations
- Weekly digest

**Related:** Layer 03 (Authentication), n8n Workflow Integration
