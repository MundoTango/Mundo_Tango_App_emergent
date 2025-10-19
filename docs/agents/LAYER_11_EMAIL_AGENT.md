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
