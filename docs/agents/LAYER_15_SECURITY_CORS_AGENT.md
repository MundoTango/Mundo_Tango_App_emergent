# Layer 15: Security/CORS Agent
**Division:** Foundation Layer | **Category:** Security Infrastructure  
**Complexity:** High | **Version:** 1.0 | **Last Updated:** October 19, 2025

## Agent Identity
**Role:** Application Security & CORS Configuration  
**Responsibility:** Configure security headers, CORS policies, prevent common attacks (XSS, CSRF, SQL injection)

**Key Files:** `server/middleware/security.ts`, CORS configuration in `server/index.ts`

## Core Patterns

### Security Headers (Helmet)
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

### CORS Configuration
```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5000',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### SQL Injection Prevention
```typescript
// ✅ GOOD: Parameterized queries (Drizzle ORM)
const user = await db.query.users.findFirst({
  where: eq(users.email, email), // Safe
});

// ❌ BAD: String concatenation (vulnerable)
const query = `SELECT * FROM users WHERE email = '${email}'`; // NEVER DO THIS
```

### XSS Prevention
```typescript
// Sanitize user input
import DOMPurify from 'isomorphic-dompurify';

function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty);
}

// Use in post content
const [post] = await db.insert(posts).values({
  title: req.body.title,
  content: sanitizeHTML(req.body.content), // Sanitize
}).returning();
```

## Security Checklist
✅ Use Helmet for security headers  
✅ Configure CORS properly  
✅ Use parameterized queries (prevent SQL injection)  
✅ Sanitize user input (prevent XSS)  
✅ Use HTTPS in production  
✅ Validate all input with Zod  
✅ Implement rate limiting  
✅ Use httpOnly cookies for tokens  
❌ Don't trust client-side validation  
❌ Don't expose stack traces  
❌ Don't use `eval()` or `innerHTML`

**Related:** Layer 03 (Authentication), Layer 06 (Error Handling), Layer 14 (Rate Limiting)
