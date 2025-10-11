# Layer #6: Session Management - ESA 105-Agent System with 61-Layer Framework CERTIFIED

**Agent ID:** #6  
**Domain:** Foundation Division (Layers 1-10)  
**Division Chief:** Chief #1 (Foundation)  
**Operational Report:** Domain #1 (Infrastructure Orchestrator)  
**Certification Date:** October 10, 2025  
**Status:** ✅ CERTIFIED via Real Production Work

---

## 🎯 Core Responsibilities

Layer #6 (Session Management) manages user session lifecycle, session storage, cookie configuration, and session security across the platform. This agent ensures secure, persistent user sessions with proper cleanup and protection.

---

## 📚 Training Material Source

**Real Production Work:**
- Express-session configuration with PostgreSQL store
- Secure cookie settings for production
- Session-based authentication flow
- Session cleanup and timeout handling

**Key Files:**
- `server/routes.ts` - Express-session setup
- `server/index.ts` - Session middleware configuration
- Authentication flow with session management

---

## ✅ Proven Patterns

### Pattern 1: PostgreSQL Session Store
**Context:** Persist sessions in database for reliability

**Implementation:**
```typescript
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { db } from './db';

const PgSession = connectPgSimple(session);

app.use(
  session({
    store: new PgSession({
      pool: db, // PostgreSQL connection pool
      tableName: 'user_sessions', // Custom table name
      createTableIfMissing: true, // Auto-create sessions table
    }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true, // Prevent XSS attacks
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax', // CSRF protection
    },
  })
);
```

**Benefits:**
- ✅ Sessions survive server restarts
- ✅ Distributed deployment support (shared session store)
- ✅ Automatic cleanup of expired sessions

### Pattern 2: Secure Cookie Configuration
**Context:** Protect session cookies from attacks

**Implementation:**
```typescript
const cookieConfig = {
  // Security flags
  secure: process.env.NODE_ENV === 'production', // HTTPS only
  httpOnly: true, // No JavaScript access (XSS protection)
  sameSite: 'lax' as const, // CSRF protection
  
  // Expiration
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  
  // Domain (for subdomains)
  domain: process.env.COOKIE_DOMAIN || undefined,
  
  // Path
  path: '/',
};

app.use(session({
  cookie: cookieConfig,
  // ... other options
}));
```

**Security Checklist:**
- [x] `secure: true` in production (HTTPS)
- [x] `httpOnly: true` (prevent XSS)
- [x] `sameSite: 'lax'` (prevent CSRF)
- [x] Strong session secret (32+ random chars)
- [x] Reasonable maxAge (not forever)

### Pattern 3: Session-Based Authentication Flow
**Context:** Store user info in session after login

**Implementation:**
```typescript
// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Verify credentials
  const user = await storage.getUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Create session
  req.session.userId = user.id;
  req.session.role = user.role;
  
  // Save session (force save before response)
  req.session.save((err) => {
    if (err) {
      return res.status(500).json({ error: 'Session creation failed' });
    }
    
    res.json({ 
      user: { id: user.id, email: user.email, role: user.role }
    });
  });
});

// Logout route
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    
    res.clearCookie('connect.sid'); // Clear session cookie
    res.json({ message: 'Logged out successfully' });
  });
});

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Protected route
app.get('/api/profile', requireAuth, async (req, res) => {
  const user = await storage.getUserById(req.session.userId);
  res.json(user);
});
```

### Pattern 4: Session Cleanup & Timeout
**Context:** Remove expired sessions, prevent session fixation

**Implementation:**
```typescript
// Automatic cleanup (built-in with connect-pg-simple)
const PgSession = connectPgSimple(session);

app.use(
  session({
    store: new PgSession({
      pool: db,
      // Cleanup expired sessions daily
      pruneSessionInterval: 60 * 60 * 24, // 24 hours
      // Session TTL matches cookie maxAge
      ttl: 60 * 60 * 24 * 7, // 7 days
    }),
    // Rolling sessions (refresh on activity)
    rolling: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

// Regenerate session on sensitive actions (prevent fixation)
app.post('/api/change-password', requireAuth, (req, res) => {
  // ... change password logic
  
  // Regenerate session ID
  req.session.regenerate((err) => {
    if (err) {
      return res.status(500).json({ error: 'Session refresh failed' });
    }
    
    // Re-set user data
    req.session.userId = req.user.id;
    
    res.json({ message: 'Password changed, session refreshed' });
  });
});
```

**Cleanup Features:**
- Automatic pruning of expired sessions
- Rolling sessions (extend on activity)
- Session regeneration on sensitive actions
- Cookie refresh on each request (rolling: true)

---

## 🎓 Quality Gates

- [x] **Gate 1:** PostgreSQL session store configured
- [x] **Gate 2:** Secure cookie settings (httpOnly, secure, sameSite)
- [x] **Gate 3:** Session cleanup scheduled (auto-prune)
- [x] **Gate 4:** Session regeneration on sensitive actions
- [x] **Gate 5:** Strong session secret (env variable, 32+ chars)

---

## 🔗 Integration Points

### Upstream Dependencies:
- **Layer #1 (Database):** Provides PostgreSQL connection for session store
- **Layer #4 (Authentication):** Provides user authentication flow

### Downstream Consumers:
- **Layer #5 (Authorization):** Uses session user data for permissions
- **All Protected Routes:** Depend on session authentication
- **Frontend Auth State:** Reads session cookie

---

## 💡 Lessons Learned

### Lesson 1: PostgreSQL Sessions > Memory Sessions
**Discovery:** In-memory sessions don't survive server restarts.

**Problem:**
```typescript
// ❌ Memory store (development only)
app.use(session({
  secret: 'secret',
  // No store specified = MemoryStore
}));

// Server restarts = all users logged out
```

**Solution:**
```typescript
// ✅ PostgreSQL store (production-ready)
app.use(session({
  store: new PgSession({ pool: db }),
  secret: process.env.SESSION_SECRET,
}));

// Server restarts = sessions persist
```

**Impact:**
- ✅ Sessions survive deployments
- ✅ Distributed deployment support
- ✅ Better user experience (stay logged in)

### Lesson 2: Always Use Rolling Sessions
**Discovery:** Fixed-TTL sessions expire while users are active.

**Problem:**
```typescript
// ❌ Fixed TTL (7 days from login)
app.use(session({
  rolling: false, // Default
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
}));

// User active every day = still logged out after 7 days
```

**Solution:**
```typescript
// ✅ Rolling sessions (7 days from last activity)
app.use(session({
  rolling: true,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
}));

// User active = cookie refreshes = stays logged in
```

**Impact:**
- ✅ Active users never logged out unexpectedly
- ✅ Inactive users still expire (security)

### Lesson 3: Regenerate Sessions on Privilege Escalation
**Discovery:** Session fixation attacks possible without regeneration.

**Attack:**
1. Attacker gets session ID
2. User logs in (same session ID)
3. Attacker now has authenticated session

**Solution:**
```typescript
// Regenerate session on login
app.post('/api/login', async (req, res) => {
  const user = await verifyCredentials(req.body);
  
  // Destroy old session, create new one
  req.session.regenerate((err) => {
    req.session.userId = user.id;
    req.session.save(() => res.json({ user }));
  });
});

// Also regenerate on privilege changes
app.post('/api/grant-admin', async (req, res) => {
  req.session.regenerate((err) => {
    req.session.userId = req.user.id;
    req.session.role = 'admin'; // New privilege
    res.json({ message: 'Admin granted' });
  });
});
```

---

## 📋 Certification Checklist

- [x] Training material documented (express-session + PostgreSQL store)
- [x] 4 proven patterns extracted (PG store, secure cookies, auth flow, cleanup)
- [x] Quality gates defined (5 gates)
- [x] Integration points mapped (2 upstream, 3 downstream)
- [x] Lessons learned captured (3 session security insights)

---

**Agent #6 Status:** ✅ **CERTIFIED**  
**Training Method:** Real production work (Session management with PostgreSQL)  
**Certification Evidence:** Secure cookies, persistent sessions, auto-cleanup, session regeneration
