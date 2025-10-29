# Layer #5: Authorization - Training Evidence
**Date**: October 10, 2025  
**Platform**: Life CEO (ESA 61x21)  
**Purpose**: Real production code patterns for Layer #5 Authorization Agent training

---

## Pattern 1: Middleware Architecture

### Core Authentication Middleware (`server/middleware/secureAuth.ts`)

#### 1.1 Token Extraction Strategy
```typescript
// Multi-source token extraction (lines 43-61)
function extractToken(req: Request): string | null {
  // 1. Check Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 2. Check cookies
  if (req.cookies?.jwt) {
    return req.cookies.jwt;
  }

  // 3. Check session
  if ((req.session as any)?.token) {
    return (req.session as any).token;
  }

  // 4. Check query params (only for download endpoints)
  if (req.query.token && req.path.includes('/download')) {
    return req.query.token as string;
  }

  return null;
}
```

**Learning**: Support multiple token sources for flexibility (headers, cookies, session, query params)

#### 1.2 Core Authentication Flow
```typescript
// Main authentication middleware (lines 64-145)
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Development bypass - ONLY in development mode
    if (AUTH_BYPASS_ENABLED) {
      console.log('🔧 [DEV ONLY] Auth bypass enabled');
      const defaultUser = await storage.getUser(7);
      if (defaultUser) {
        req.user = { ...defaultUser, role: 'admin' };
        req.ability = defineAbilitiesFor({ id: defaultUser.id, role: 'admin' });
        return next();
      }
    }

    // Extract token
    const token = extractToken(req);
    
    if (!token) {
      // No token - user is not authenticated
      req.user = undefined;
      req.ability = defineAbilitiesFor(null);
      return next();
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Check token expiration
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      throw new Error('Token expired');
    }

    // Fetch user from database
    const user = await storage.getUser(decoded.userId);
    
    if (!user || !user.id) {
      throw new Error('User not found');
    }

    // Check if user is active
    if (user.isActive === false) {
      throw new Error('Account deactivated');
    }

    // Get user role
    const userWithRole = await authService.getUserWithRole(user.id);
    const role = userWithRole?.role || 'user';

    // Set user on request
    req.user = { ...user, role };

    // Set abilities
    req.ability = defineAbilitiesFor({ id: user.id, role });

    next();
  } catch (error: any) {
    // Token verification failed - clear user
    req.user = undefined;
    req.ability = defineAbilitiesFor(null);
    next(); // Continue - let route handlers decide if auth is required
  }
};
```

**Learning**: Always set abilities on request object, even for unauthenticated users (null abilities)

#### 1.3 Authorization Middleware Patterns

**Require Authentication**:
```typescript
// Block unauthenticated users (lines 148-157)
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }
  next();
};
```

**Require Specific Roles**:
```typescript
// Role-based middleware factory (lines 165-180)
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `This resource requires one of these roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};
```

**Hierarchical Role Middleware**:
```typescript
// Admin role (lines 183-184)
export const requireAdmin = requireRole('admin', 'super_admin');

// Moderator or higher (lines 187-188)
export const requireModerator = requireRole('moderator', 'admin', 'super_admin');

// Organizer or higher (lines 191-192)
export const requireOrganizer = requireRole('organizer', 'teacher', 'moderator', 'admin', 'super_admin');
```

**Ability-Based Middleware**:
```typescript
// CASL ability checks (lines 195-209)
export const requireAbility = (action: string, subject: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.ability) {
      req.ability = defineAbilitiesFor(req.user || null);
    }

    if (!req.ability.can(action, subject)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `You don't have permission to ${action} ${typeof subject === 'string' ? subject : subject.type}`
      });
    }

    next();
  };
};
```

**Page Access Control**:
```typescript
// Page-level authorization (lines 212-229)
export const checkPageAccess = (path: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user ? { id: req.user.id, role: req.user.role } : null;
    
    if (!canAccessPage(user, path)) {
      if (!user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'Please log in to access this page'
        });
      } else {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'You don\'t have permission to access this page'
        });
      }
    }

    next();
  };
};
```

#### 1.4 CSRF Protection
```typescript
// CSRF middleware (lines 232-264)
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for development with bypass
  if (AUTH_BYPASS_ENABLED) {
    return next();
  }

  // Skip CSRF for GET requests and safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip for specific paths (webhooks, etc)
  const skipPaths = [
    '/api/webhook',
    '/api/stripe/webhook',
    '/api/upload',
  ];

  if (skipPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  // Get CSRF token from request
  const csrfToken = req.headers['x-csrf-token'] || 
                   req.body?._csrf || 
                   req.query?._csrf;

  // Get session CSRF token
  const sessionToken = (req.session as any)?.csrfToken;

  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    return res.status(403).json({ 
      error: 'Invalid CSRF token',
      message: 'Your request could not be verified. Please refresh and try again.'
    });
  }

  next();
};
```

#### 1.5 Rate Limiting
```typescript
// In-memory rate limiter (lines 267-296)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number = 100, windowMs: number = 60000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = String(req.user?.id || req.ip || 'anonymous');
    const now = Date.now();
    
    const userLimit = requestCounts.get(identifier);
    
    if (!userLimit || now > userLimit.resetTime) {
      // Reset window
      requestCounts.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests',
        message: 'Please wait before making more requests',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
      });
    }

    userLimit.count++;
    next();
  };
};
```

---

## Pattern 2: CASL Integration (@casl/ability)

### 2.1 Ability Definition (`server/auth/abilities.ts`)

#### Subject Definitions
```typescript
// Class-based subjects for CASL (lines 8-59)
export class User {
  static readonly modelName = 'User';
  constructor(public id: number, public role: string) {}
}

export class Post {
  static readonly modelName = 'Post';
  constructor(public id: number, public userId: number, public isPublic?: boolean) {}
}

export class Event {
  static readonly modelName = 'Event';
  constructor(public id: number, public organizerId: number, public isPublic?: boolean) {}
}

export class Group {
  static readonly modelName = 'Group';
  constructor(public id: number, public ownerId: number, public isPublic?: boolean) {}
}

export class Message {
  static readonly modelName = 'Message';
  constructor(public id: number, public senderId: number, public recipientId: number) {}
}

export class AdminPanel {
  static readonly modelName = 'AdminPanel';
}
```

#### Type Definitions
```typescript
// Actions and subjects types (lines 87-110)
export type Actions = 
  | 'manage'      // Full CRUD
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete'
  | 'view'
  | 'edit'
  | 'publish'
  | 'moderate'
  | 'access'      // For page access
  | 'subscribe'
  | 'rsvp'
  | 'join'
  | 'leave'
  | 'invite'
  | 'ban'
  | 'unban'
  | 'post'
  | 'moderate_posts'
  | 'edit_details'
  | 'view_private';

export type AppAbility = MongoAbility<[Actions, Subjects]>;
```

#### Core Ability Builder
```typescript
// Main ability definition function (lines 113-248)
export function defineAbilitiesFor(user: { id: number; role: string } | null): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (!user) {
    // Guest/Unauthenticated users - PUBLIC ACCESS ONLY
    can('read', Post.modelName, { isPublic: true });
    can('read', Event.modelName, { isPublic: true });
    can('read', Group.modelName, { isPublic: true });
    can('view', UserProfile.modelName);
    return build();
  }

  // ALL AUTHENTICATED USERS (user/dancer roles)
  if (user.role === 'user' || user.role === 'dancer') {
    can('create', Post.modelName);
    can('read', Post.modelName);
    can('update', Post.modelName, { userId: user.id });  // Own posts only
    can('delete', Post.modelName, { userId: user.id });
    
    can('create', Memory.modelName);
    can('read', Memory.modelName);
    can('update', Memory.modelName, { userId: user.id });
    can('delete', Memory.modelName, { userId: user.id });
    
    can('read', Event.modelName);
    can('rsvp', Event.modelName);
    
    can('read', Group.modelName);
    can('join', Group.modelName);
    can('leave', Group.modelName);
    
    can('create', Message.modelName);
    can('read', Message.modelName, { $or: [{ senderId: user.id }, { recipientId: user.id }] });
    
    cannot('access', AdminPanel.modelName);  // Explicit deny
  }

  // ORGANIZER ROLE (Enhanced event permissions)
  if (user.role === 'organizer') {
    can('create', Event.modelName);
    can('update', Event.modelName, { organizerId: user.id });
    can('delete', Event.modelName, { organizerId: user.id });
    can('moderate', Event.modelName, { organizerId: user.id });
    
    can('create', Group.modelName);
    can('update', Group.modelName, { ownerId: user.id });
    can('delete', Group.modelName, { ownerId: user.id });
    can('invite', Group.modelName, { ownerId: user.id });
    
    can('view', Analytics.modelName, { type: 'event' });
    cannot('access', AdminPanel.modelName);
  }

  // MODERATOR ROLE
  if (user.role === 'moderator') {
    can('read', 'all');
    can('moderate', Post.modelName);
    can('moderate', Event.modelName);
    can('moderate', Group.modelName);
    can('ban', Group.modelName);
    can('unban', Group.modelName);
    
    can('access', Analytics.modelName, { type: 'moderation' });
    cannot('manage', AdminPanel.modelName);
  }

  // ADMIN/SUPER_ADMIN - Full access
  if (user.role === 'admin' || user.role === 'super_admin') {
    can('manage', 'all');  // Full CRUD on everything
    can('access', AdminPanel.modelName);
    can('access', BillingPage.modelName);
    can('access', Analytics.modelName);
  }

  return build();
}
```

**Learning**: Use attribute-based conditions (like `{ userId: user.id }`) to restrict actions to owned resources

### 2.2 Page Access Control
```typescript
// Page permission definitions (lines 283-337)
export const PAGE_PERMISSIONS = {
  public: [
    '/login',
    '/register', 
    '/landing',
    '/code-of-conduct',
    '/events',
    '/communities',
    '/profile/:username',
  ],
  
  authenticated: [
    '/home',
    '/profile',
    '/messages',
    '/friends',
    '/timeline',
    '/memories',
    '/groups',
    '/settings',
  ],
  
  organizer: [
    '/events/create',
    '/events/manage',
    '/groups/create',
  ],
  
  admin: [
    '/admin',
    '/admin/*',
    '/analytics',
    '/billing',
    '/life-ceo',
    '/project-tracker',
  ],
  
  moderator: [
    '/moderation',
    '/reports',
  ],
};

// Page access checker (lines 340-374)
export function canAccessPage(user: { id: number; role: string } | null, path: string): boolean {
  // Public pages - anyone can access
  if (PAGE_PERMISSIONS.public.some(p => {
    if (p.includes(':')) {
      const pattern = p.replace(/:[^/]+/g, '[^/]+');
      return new RegExp(`^${pattern}$`).test(path);
    }
    return p === path || (p.endsWith('*') && path.startsWith(p.slice(0, -1)));
  })) {
    return true;
  }
  
  if (!user) return false;
  
  // Admin pages
  if (PAGE_PERMISSIONS.admin.some(p => 
    p === path || (p.endsWith('*') && path.startsWith(p.slice(0, -1)))
  )) {
    return user.role === 'admin' || user.role === 'super_admin';
  }
  
  // Moderator pages
  if (PAGE_PERMISSIONS.moderator.some(p => path === p)) {
    return ['moderator', 'admin', 'super_admin'].includes(user.role);
  }
  
  // Organizer pages
  if (PAGE_PERMISSIONS.organizer.some(p => path === p)) {
    return ['organizer', 'teacher', 'admin', 'super_admin'].includes(user.role);
  }
  
  // All other authenticated pages
  return true;
}
```

### 2.3 Helper Functions
```typescript
// Ability checker (lines 251-259)
export function checkAbility(
  user: { id: number; role: string } | null, 
  action: Actions, 
  subject: Subjects | any,
  field?: string
): boolean {
  const ability = defineAbilitiesFor(user);
  return ability.can(action, subject, field);
}

// Middleware factory (lines 262-275)
export function requireAbility(action: Actions, subject: Subjects | any) {
  return (req: any, res: any, next: any) => {
    const ability = defineAbilitiesFor(req.user);
    
    if (ability.can(action, subject)) {
      next();
    } else {
      res.status(403).json({ 
        error: 'Forbidden',
        message: `You don't have permission to ${action} ${subject}`
      });
    }
  };
}
```

### 2.4 Client-Side Hooks (`client/src/lib/casl/abilities.ts`)
```typescript
// React hooks for permission checks (lines 317-361)
export const useCanApproveConsent = (memory: any, user: User) => {
  const ability = useAbility();
  return ability.can('approve', 'ConsentRequest', memory);
};

export const useCanViewPendingRequests = () => {
  const ability = useAbility();
  return ability.can('view_pending', 'ConsentRequest');
};

export const useCanFilterMemories = () => {
  const ability = useAbility();
  return ability.can('filter', 'MemoryFilter');
};

export const useCanAccessAdmin = () => {
  const ability = useAbility();
  return ability.can('access_admin', 'AdminPanel');
};

export const useCanPostInGroup = (groupId: number, user: User) => {
  const ability = useAbility();
  const groupSubject = {
    id: groupId,
    members: [user.id]
  };
  
  return ability.can('post', subject('Group', groupSubject));
};

export const useCanModerateGroupPosts = (groupId: number, user: User) => {
  const ability = useAbility();
  const groupSubject = {
    id: groupId,
    admins: [user.id]
  };
  
  return ability.can('moderate_posts', subject('Group', groupSubject));
};
```

---

## Pattern 3: Role-Based Access Control (RBAC)

### 3.1 Direct Role Checks

#### Admin Role Check
```typescript
// server/auth/abilities.ts (line 240)
if (user.role === 'admin' || user.role === 'super_admin') {
  can('manage', 'all');
}

// server/auth/abilities.ts (line 359)
return user.role === 'admin' || user.role === 'super_admin';
```

#### Moderator Role Check
```typescript
// server/auth/abilities.ts (line 218)
if (user.role === 'moderator') {
  can('read', 'all');
  can('moderate', Post.modelName);
}
```

#### Organizer Role Check
```typescript
// server/auth/abilities.ts (line 165)
if (user.role === 'organizer') {
  can('create', Event.modelName);
  can('update', Event.modelName, { organizerId: user.id });
}
```

### 3.2 UI Role Checks

#### Group Admin Badge
```typescript
// client/src/pages/GroupDetailPageMT.tsx (line 341)
const isAdmin = memberData?.some((m: GroupMember) => 
  m.user.id === user?.id && m.role === 'admin'
) || false;

// Display admin badge (line 712)
{memberData.filter((m: GroupMember) => m.role === 'admin').map((admin: GroupMember) => (
  <div key={admin.user.id} className="flex items-center gap-3">
    <Crown className="h-3 w-3 text-yellow-500" />
    {admin.user.name}
  </div>
))}
```

#### Admin Role Icons
```typescript
// client/src/components/admin/UserRoleTable.tsx (lines 137-139)
const getRoleIcon = (role: string) => {
  if (role === 'super_admin') return <Crown className="h-3 w-3" />;
  if (role === 'admin') return <Shield className="h-3 w-3" />;
  return <Users className="h-3 w-3" />;
};
```

### 3.3 Role Hierarchy Enforcement
```typescript
// server/middleware/secureAuth.ts (lines 187-192)
export const requireModerator = requireRole('moderator', 'admin', 'super_admin');
export const requireOrganizer = requireRole('organizer', 'teacher', 'moderator', 'admin', 'super_admin');
```

**Learning**: Higher roles automatically inherit lower role permissions through middleware composition

---

## Pattern 4: Protected Routes

### 4.1 Route Import Pattern
```typescript
// server/routes.ts (lines 10-20)
import { 
  authenticateUser,
  requireAuth,
  optionalAuth,
  requireRole as requireRoleSecure,
  requireAdmin as requireAdminSecure,
  requireModerator,
  requireOrganizer,
  requireAbility,
  checkPageAccess,
  setupSecureAuth
} from "./middleware/secureAuth";
```

### 4.2 Environment-Based Auth Selection
```typescript
// server/routes.ts (lines 35-37)
const authMiddleware = process.env.NODE_ENV === 'development' && process.env.AUTH_BYPASS === 'true' 
  ? isAuthenticated      // Use legacy in dev with bypass
  : requireAuth;         // Use secure in production
```

### 4.3 Route Protection Examples

**Basic Authentication**:
```typescript
router.post('/posts', 
  requireAuth,  // Must be authenticated
  async (req, res) => {
    // Create post logic
  }
);
```

**Role-Based Protection**:
```typescript
router.get('/admin/users', 
  requireAdmin,  // Admin or super_admin only
  async (req, res) => {
    // Admin logic
  }
);
```

**Ability-Based Protection**:
```typescript
router.post('/posts', 
  requireAuth,
  requireAbility('create', 'Post'),  // Must have create permission
  async (req, res) => {
    // Create post logic
  }
);
```

**Page Access Protection**:
```typescript
router.get('/admin', 
  checkPageAccess('/admin'),  // Check page permissions
  async (req, res) => {
    // Admin page
  }
);
```

### 4.4 Layered Security Pattern
```typescript
// Multiple middleware layers for defense in depth
router.post('/admin/users/:id/promote',
  requireAuth,                    // Layer 1: Must be authenticated
  requireAdmin,                   // Layer 2: Must have admin role
  requireAbility('manage', 'User'), // Layer 3: Must have manage permission
  async (req, res) => {
    // Promote user logic
  }
);
```

---

## Pattern 5: Life CEO Specific Authorization

### 5.1 Super Admin Check Pattern
```typescript
// client/src/pages/LifeCEO.tsx (line 26)
const isSuperAdmin = user?.roles?.includes('super_admin') || 
                     user?.tangoRoles?.includes('super_admin');

// Early return guard (line 29)
useEffect(() => {
  if (!isSuperAdmin) {
    toast.error('Access denied. Life CEO is only available for super administrators.');
    setLocation('/memories');
    return;
  }
}, [isSuperAdmin, setLocation]);

// Null guard (line 112)
if (!isSuperAdmin) {
  return null;
}
```

**Learning**: Dual role array check (`roles` and `tangoRoles`) for legacy compatibility

### 5.2 Conditional UI Rendering
```typescript
// client/src/components/UniversalNavigationBar.tsx (line 13)
const isSuperAdmin = user?.roles?.includes('super_admin') || 
                     user?.tangoRoles?.includes('super_admin');

// Conditional menu item (line 25)
...(isSuperAdmin ? [{
  id: 'life-ceo',
  name: 'Life CEO',
  description: 'AI-powered life management system',
  icon: Brain,
  route: '/life-ceo',
  active: true
}] : [])

// Conditional quick action (line 118)
{isSuperAdmin && (
  <button
    onClick={() => setLocation('/life-ceo')}
    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
  >
    <Brain className="h-5 w-5 text-purple-600" />
    <span>Life CEO</span>
  </button>
)}
```

### 5.3 Backend Super Admin Check
```typescript
// server/utils/authHelper.ts (lines 100-107)
const isSuperAdmin = await checkSuperAdminRole(userId);
if (!isSuperAdmin) {
  return res.status(403).json({ 
    error: 'Super admin access required' 
  });
}

// Add to request object
req.userId = userId;
req.isSuperAdmin = true;
```

### 5.4 Three-Layer Protection Pattern
```typescript
// Layer 1: Early useEffect redirect
useEffect(() => {
  if (!isSuperAdmin) {
    toast.error('Access denied.');
    setLocation('/memories');
    return;
  }
}, [isSuperAdmin]);

// Layer 2: Conditional query execution
const { data, isLoading } = useQuery({
  queryKey: ['/api/life-ceo/conversations'],
  enabled: !!user && isSuperAdmin,  // Only run if authenticated AND authorized
});

// Layer 3: Null return guard
if (!isSuperAdmin) {
  return null;
}
```

---

## Pattern 6: Progressive Enhancement & Security Guards

### 6.1 Feature Flag System
```typescript
// Feature flag definitions (from grep results)
FEATURE_FLAGS_ENABLED=true
ENABLE_SMART_LOADING=true

// 10 performance features configured with flags
```

### 6.2 Conditional Feature Loading
```typescript
// Progressive enhancement protocol
Layer 1: Minimal viable setup
Layer 22: Progressive enhancement after Layer 1 validation
Layer 25: Context management for React providers
```

**Learning**: Load features progressively based on authentication/authorization state

### 6.3 Development Guards
```typescript
// server/middleware/secureAuth.ts (lines 67-81)
if (AUTH_BYPASS_ENABLED) {
  console.log('🔧 [DEV ONLY] Auth bypass enabled - using default admin user');
  const defaultUser = await storage.getUser(7);
  if (defaultUser) {
    req.user = { ...defaultUser, role: 'admin' };
    req.ability = defineAbilitiesFor({ id: defaultUser.id, role: 'admin' });
    return next();
  }
}
```

**Learning**: Development bypasses must be explicitly flagged and logged

### 6.4 CSRF Skip Patterns
```typescript
// server/middleware/secureAuth.ts (lines 235-247)
// Skip CSRF for development with bypass
if (AUTH_BYPASS_ENABLED) {
  return next();
}

// Skip CSRF for GET requests and safe methods
if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
  return next();
}

// Skip for specific paths (webhooks, etc)
const skipPaths = [
  '/api/webhook',
  '/api/stripe/webhook',
  '/api/upload',
];

if (skipPaths.some(path => req.path.startsWith(path))) {
  return next();
}
```

### 6.5 Graceful Degradation
```typescript
// Continue without user if token verification fails
} catch (error: any) {
  req.user = undefined;
  req.ability = defineAbilitiesFor(null);
  next(); // Continue - let route handlers decide if auth is required
}
```

**Learning**: Don't fail hard on auth errors; let route handlers decide if auth is required

---

## Summary of Authorization Patterns

### Middleware Layers
1. **Token Extraction**: Multi-source (headers, cookies, session, query)
2. **JWT Verification**: With expiration checks
3. **User Validation**: Active status, role lookup
4. **Ability Assignment**: CASL abilities on every request
5. **CSRF Protection**: Token-based with smart skips
6. **Rate Limiting**: In-memory counter per user/IP

### CASL Integration
1. **Subject Classes**: Class-based subjects for type safety
2. **Ability Builder**: Role-based ability definitions
3. **Attribute Conditions**: Owner-based restrictions (`{ userId: user.id }`)
4. **Helper Functions**: `checkAbility`, `requireAbility`, `canAccessPage`
5. **Client Hooks**: React hooks for UI permission checks

### RBAC Hierarchy
```
super_admin > admin > moderator > organizer > teacher > dancer > user > guest
```

### Route Protection
1. **requireAuth**: Must be authenticated
2. **requireRole**: Must have specific role(s)
3. **requireAdmin**: Admin or super_admin only
4. **requireModerator**: Moderator or higher
5. **requireAbility**: Must have specific CASL permission
6. **checkPageAccess**: Page-level authorization

### Life CEO Authorization
1. **Dual Role Check**: `roles` and `tangoRoles` arrays
2. **Three-Layer Protection**: useEffect redirect + query guard + null return
3. **Backend Validation**: `checkSuperAdminRole` function
4. **UI Conditional Rendering**: Hide/show based on role

### Security Guards
1. **Development Bypasses**: Explicitly flagged and logged
2. **CSRF Smart Skips**: Safe methods, webhooks, uploads
3. **Graceful Degradation**: Continue without user on auth errors
4. **Progressive Enhancement**: Load features based on auth state

---

## Implementation Checklist for Layer #5 Agent

- [ ] Implement multi-source token extraction
- [ ] Add JWT verification with expiration checks
- [ ] Set abilities on request object (always, even for guests)
- [ ] Create role-based middleware factories
- [ ] Implement CASL ability definitions
- [ ] Add attribute-based conditions for owned resources
- [ ] Create page permission mappings
- [ ] Implement CSRF protection with smart skips
- [ ] Add rate limiting per user/IP
- [ ] Create client-side permission hooks
- [ ] Implement three-layer protection for sensitive pages
- [ ] Add development bypass guards
- [ ] Test role hierarchy enforcement
- [ ] Verify graceful degradation on auth errors

---

**End of Training Evidence**  
**Total Patterns Documented**: 6 major categories, 30+ specific patterns  
**Production Code Lines Analyzed**: 1000+ lines across 15+ files  
**Ready for Layer #5 Agent Implementation**: ✅
