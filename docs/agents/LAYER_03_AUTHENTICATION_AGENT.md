# Layer 03: Authentication Agent
**Division:** Foundation Layer  
**Category:** Security Infrastructure  
**Complexity:** High  
**Dependencies:** JWT, Replit OAuth, Session Management  
**Version:** 1.0 | **Last Updated:** October 19, 2025

## Agent Identity

**Role:** User Authentication & Authorization Management  
**Responsibility:** Secure user authentication, JWT token generation/verification, session management, RBAC (Role-Based Access Control)

**Key Files:**
- `server/middleware/auth.ts` - Authentication middleware
- `server/routes/auth.ts` - Auth endpoints (login, register, logout)
- `client/src/hooks/use-user.ts` - Client-side auth state

---

## Architecture

### **Authentication Flow**

```
┌───────────┐                 ┌───────────┐                ┌───────────┐
│  Client   │────Login────────>│  Server   │──Verify─────>│ Database  │
│           │<─Access Token───│  (JWT)    │<─User Data──│           │
│           │                 │           │                │           │
│  Stores   │────API Request->│  Verify   │                │           │
│  Token    │    + Token      │  Token    │                │           │
│           │<─Response───────│  (Auth    │                │           │
│           │                 │  Middleware)                │           │
└───────────┘                 └───────────┘                └───────────┘
```

---

## JWT Token Management

### **Pattern 1: Token Generation**

```typescript
// server/utils/jwt.ts
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export function generateAccessToken(userId: number): string {
  return jwt.sign(
    { userId, type: 'access' },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' } // Short-lived
  );
}

export function generateRefreshToken(userId: number): string {
  return jwt.sign(
    { userId, type: 'refresh' },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' } // Long-lived
  );
}

export function verifyToken(token: string, type: 'access' | 'refresh'): any {
  const secret = type === 'access' ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET;
  return jwt.verify(token, secret);
}
```

---

### **Pattern 2: Login Endpoint**

```typescript
// POST /api/auth/login
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return res.status(401).json(apiError('Invalid credentials', 401));
    }

    // 2. Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json(apiError('Invalid credentials', 401));
    }

    // 3. Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // 4. Store refresh token in database
    await db.insert(refreshTokens).values({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // 5. Return tokens
    res.json(apiSuccess({
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        accessToken,
        refreshToken,
      },
    }));
  } catch (error) {
    next(error);
  }
});
```

---

### **Pattern 3: Authentication Middleware**

```typescript
// server/middleware/auth.ts
import { verifyToken } from '../utils/jwt';

export const authMiddleware = async (req, res, next) => {
  try {
    // 1. Extract token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(apiError('No token provided', 401));
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    const decoded = verifyToken(token, 'access');

    // 3. Fetch user
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId),
    });

    if (!user || !user.isActive) {
      return res.status(401).json(apiError('Invalid token', 401));
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(apiError('Token expired', 401));
    }
    return res.status(401).json(apiError('Authentication failed', 401));
  }
};

// Usage
app.get('/api/posts', authMiddleware, async (req, res) => {
  // req.user is available here
  const posts = await db.query.posts.findMany();
  res.json(apiSuccess({ data: posts }));
});
```

---

## Role-Based Access Control (RBAC)

### **Pattern 1: Admin Middleware**

```typescript
export const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(apiError('Authentication required', 401));
  }

  if (!req.user.isAdmin) {
    return res.status(403).json(apiError('Admin access required', 403));
  }

  next();
};

// Usage: Chain middlewares
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  const users = await db.query.users.findMany();
  res.json(apiSuccess({ data: users }));
});
```

---

### **Pattern 2: Role Checker**

```typescript
export const requireRole = (role: string) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(apiError('Authentication required', 401));
    }

    const userRole = await db.query.userRoles.findFirst({
      where: and(
        eq(userRoles.userId, req.user.id),
        eq(userRoles.roleName, role)
      ),
    });

    if (!userRole) {
      return res.status(403).json(apiError(`${role} role required`, 403));
    }

    next();
  };
};

// Usage
app.post('/api/events', authMiddleware, requireRole('event_organizer'), async (req, res) => {
  // Only users with 'event_organizer' role can create events
});
```

---

## Refresh Token Flow

### **Pattern: Token Refresh**

```typescript
// POST /api/auth/refresh
app.post('/api/auth/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json(apiError('Refresh token required', 401));
    }

    // 1. Verify refresh token
    const decoded = verifyToken(refreshToken, 'refresh');

    // 2. Check if token exists in database
    const storedToken = await db.query.refreshTokens.findFirst({
      where: and(
        eq(refreshTokens.token, refreshToken),
        eq(refreshTokens.userId, decoded.userId),
        gt(refreshTokens.expiresAt, new Date())
      ),
    });

    if (!storedToken) {
      return res.status(401).json(apiError('Invalid refresh token', 401));
    }

    // 3. Generate new access token
    const newAccessToken = generateAccessToken(decoded.userId);

    res.json(apiSuccess({
      data: { accessToken: newAccessToken },
    }));
  } catch (error) {
    next(error);
  }
});
```

---

## Client-Side Integration

### **Pattern 1: Auth Context**

```typescript
// client/src/hooks/use-user.ts
import { useQuery } from '@tanstack/react-query';

export function useUser() {
  return useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
  });
}

// Usage
function Header() {
  const { data: user, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <LoginButton />;

  return <div>Welcome, {user.name}</div>;
}
```

---

### **Pattern 2: Protected Routes**

```typescript
import { useUser } from '@/hooks/use-user';
import { Redirect } from 'wouter';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Redirect to="/login" />;

  return <>{children}</>;
}

// Usage
<Route path="/dashboard">
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
</Route>
```

---

## Security Best Practices

### **✅ DO:**
- Use HTTPS in production
- Store JWT secret in environment variables
- Use short-lived access tokens (15 minutes)
- Implement refresh token rotation
- Hash passwords with bcrypt (cost factor 10+)
- Validate all input data

### **❌ DON'T:**
- Store sensitive data in JWT payload
- Use same secret for access and refresh tokens
- Store tokens in localStorage (use httpOnly cookies for web)
- Allow unlimited login attempts (implement rate limiting)
- Expose stack traces in error messages

---

## Testing

```typescript
import { describe, it, expect } from 'vitest';

describe('Authentication Agent', () => {
  it('generates valid access token', () => {
    const token = generateAccessToken(1);
    const decoded = verifyToken(token, 'access');

    expect(decoded.userId).toBe(1);
    expect(decoded.type).toBe('access');
  });

  it('rejects expired token', () => {
    const expiredToken = jwt.sign(
      { userId: 1 },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '-1s' } // Already expired
    );

    expect(() => verifyToken(expiredToken, 'access')).toThrow('jwt expired');
  });
});
```

---

## Related Agents

- **Layer 04: WebSocket Connection** - Real-time auth
- **Layer 09: Session Management** - Session storage
- **Layer 15: Security/CORS** - Security headers

**Next:** Read `docs/MT_API_CONVENTIONS.md` for auth patterns
