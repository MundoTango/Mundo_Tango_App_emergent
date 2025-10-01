# ESA Layer 5: Authorization & RBAC Agent 🛡️

## Overview
Layer 5 manages role-based access control (RBAC), attribute-based access control (ABAC), permissions management, and resource-level authorization across the platform.

## Core Responsibilities

### 1. Role Management
- Role definition and hierarchy
- Role assignment and revocation
- Dynamic role creation
- Role inheritance
- Default role templates

### 2. Permission System
- Fine-grained permissions
- Resource-based permissions
- Action-based permissions
- Permission inheritance
- Permission caching

### 3. Access Control
- Route-level protection
- API endpoint authorization
- Resource ownership validation
- Conditional access rules
- Multi-tenant isolation

## Open Source Packages

```json
{
  "@casl/ability": "^6.5.0",
  "@casl/react": "^3.1.0",
  "jsonwebtoken": "^9.0.2",
  "@types/jsonwebtoken": "^9.0.5",
  "speakeasy": "^2.0.0",
  "@types/speakeasy": "^2.0.7",
  "bcrypt": "^5.1.1",
  "bcryptjs": "^2.4.3",
  "@types/bcrypt": "^5.0.2"
}
```

## Integration Points

- **Layer 1 (Database)**: Stores roles and permissions
- **Layer 4 (Authentication)**: Receives user context
- **Layer 6 (Data Validation)**: Validates permission rules
- **Layer 21 (User Management)**: User role assignments
- **Layer 22 (Group Management)**: Group-based permissions

## Implementation Example

```typescript
// CASL Ability Definition
import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability';

type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage';
type Subjects = 'User' | 'Post' | 'Comment' | 'Group' | 'Event' | 'all';

export type AppAbility = MongoAbility<[Actions, Subjects]>;

// Define abilities based on user role
export function defineAbilityFor(user: User): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
  
  // Guest permissions
  can('read', 'Post', { published: true });
  can('read', 'Event', { public: true });
  
  if (user) {
    // Authenticated user permissions
    can('create', 'Post');
    can('update', 'Post', { authorId: user.id });
    can('delete', 'Post', { authorId: user.id });
    can('create', 'Comment');
    can('update', 'User', { id: user.id });
    
    // Role-based permissions
    switch (user.role) {
      case 'admin':
        can('manage', 'all'); // Full access
        break;
        
      case 'moderator':
        can('update', 'Post');
        can('delete', 'Post');
        can('delete', 'Comment');
        can('read', 'User');
        break;
        
      case 'teacher':
        can('create', 'Event');
        can('update', 'Event', { organizerId: user.id });
        can('manage', 'Group', { teacherId: user.id });
        break;
        
      case 'dj':
        can('create', 'Event', { type: 'milonga' });
        can('update', 'Event', { djId: user.id });
        break;
    }
    
    // Group-based permissions
    user.groups?.forEach(group => {
      if (group.role === 'admin') {
        can('manage', 'Group', { id: group.id });
      } else if (group.role === 'member') {
        can('read', 'Group', { id: group.id });
      }
    });
  }
  
  // Global restrictions
  cannot('delete', 'User');
  
  return build();
}
```

## Middleware Implementation

```typescript
// Authorization middleware
export const authorize = (action: Actions, subject: Subjects) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ability = defineAbilityFor(req.user);
    
    if (ability.can(action, subject)) {
      next();
    } else {
      res.status(403).json({
        error: 'Forbidden',
        message: `You are not allowed to ${action} ${subject}`
      });
    }
  };
};

// Resource-level authorization
export const authorizeResource = (action: Actions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const resource = await getResource(req.params.id);
    const ability = defineAbilityFor(req.user);
    
    if (ability.can(action, resource)) {
      req.resource = resource;
      next();
    } else {
      res.status(403).json({ error: 'Access denied to this resource' });
    }
  };
};

// Usage in routes
app.get('/api/posts', authorize('read', 'Post'), postsController.list);
app.put('/api/posts/:id', authorizeResource('update'), postsController.update);
```

## Role Hierarchy

```typescript
const roleHierarchy = {
  superadmin: ['admin', 'moderator', 'teacher', 'dj', 'user', 'guest'],
  admin: ['moderator', 'teacher', 'dj', 'user', 'guest'],
  moderator: ['user', 'guest'],
  teacher: ['user', 'guest'],
  dj: ['user', 'guest'],
  user: ['guest'],
  guest: []
};

// Check if role has permission through hierarchy
function hasPermissionThroughHierarchy(userRole: string, requiredRole: string): boolean {
  if (userRole === requiredRole) return true;
  return roleHierarchy[userRole]?.includes(requiredRole) || false;
}
```

## Permission Templates

```typescript
// Predefined permission sets
const permissionTemplates = {
  communityAdmin: [
    'community.manage',
    'events.create',
    'events.update',
    'events.delete',
    'members.invite',
    'members.remove',
    'content.moderate'
  ],
  
  eventOrganizer: [
    'events.create',
    'events.update.own',
    'events.cancel.own',
    'attendees.manage.own'
  ],
  
  contentModerator: [
    'posts.update',
    'posts.delete',
    'comments.delete',
    'users.warn',
    'users.suspend'
  ]
};

// Apply template to user
async function applyPermissionTemplate(userId: string, template: string) {
  const permissions = permissionTemplates[template];
  await userService.addPermissions(userId, permissions);
}
```

## Attribute-Based Access Control (ABAC)

```typescript
// ABAC rules engine
interface AccessRule {
  resource: string;
  action: string;
  condition: (user: User, resource: any, context: any) => boolean;
}

const abacRules: AccessRule[] = [
  {
    resource: 'Event',
    action: 'update',
    condition: (user, event, context) => {
      // Can update if organizer or if event is in user's city
      return event.organizerId === user.id || 
             event.cityId === user.cityId;
    }
  },
  {
    resource: 'Post',
    action: 'delete',
    condition: (user, post, context) => {
      // Can delete if author or if moderator and post is reported
      return post.authorId === user.id ||
             (user.role === 'moderator' && post.reportCount > 5);
    }
  }
];

// Evaluate ABAC rules
function evaluateABACRules(user: User, action: string, resource: any): boolean {
  const rules = abacRules.filter(r => 
    r.resource === resource.constructor.name && r.action === action
  );
  
  return rules.every(rule => rule.condition(user, resource, {}));
}
```

## Multi-Tenant Isolation

```typescript
// Tenant-based access control
export const tenantIsolation = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }
    
    // Add tenant filter to all queries
    req.tenantFilter = { tenantId };
    
    // Verify user belongs to tenant
    if (req.user && req.user.tenantId !== tenantId) {
      return res.status(403).json({ error: 'Access denied to this tenant' });
    }
    
    next();
  };
};
```

## Performance Optimization

```typescript
// Permission caching
import { LRUCache } from 'lru-cache';

const permissionCache = new LRUCache<string, AppAbility>({
  max: 1000,
  ttl: 1000 * 60 * 5 // 5 minutes
});

export function getCachedAbility(user: User): AppAbility {
  const cacheKey = `ability:${user.id}:${user.updatedAt}`;
  
  let ability = permissionCache.get(cacheKey);
  if (!ability) {
    ability = defineAbilityFor(user);
    permissionCache.set(cacheKey, ability);
  }
  
  return ability;
}
```

## Security Patterns

| Pattern | Description |
|---------|------------|
| Least Privilege | Users get minimal permissions by default |
| Deny by Default | All actions denied unless explicitly allowed |
| Role Separation | Clear boundaries between role capabilities |
| Audit Logging | All permission checks are logged |
| Permission Review | Regular audits of user permissions |

## Testing

```typescript
describe('Authorization', () => {
  it('should allow user to update own post', () => {
    const user = { id: '1', role: 'user' };
    const post = { id: '123', authorId: '1' };
    const ability = defineAbilityFor(user);
    
    expect(ability.can('update', post)).toBe(true);
  });
  
  it('should prevent user from deleting others post', () => {
    const user = { id: '1', role: 'user' };
    const post = { id: '123', authorId: '2' };
    const ability = defineAbilityFor(user);
    
    expect(ability.can('delete', post)).toBe(false);
  });
  
  it('should allow admin to manage all resources', () => {
    const admin = { id: '1', role: 'admin' };
    const ability = defineAbilityFor(admin);
    
    expect(ability.can('manage', 'all')).toBe(true);
  });
});
```

## Groups Implementation

### Group-Level Permissions

The Groups feature implements comprehensive RBAC for community management with role-based access controls for city groups and professional groups.

```typescript
// Group permission structure
interface GroupPermissions {
  canView: boolean;           // View group details and content
  canJoin: boolean;            // Join the group
  canPost: boolean;            // Create posts in the group
  canModerate: boolean;        // Moderate group content
  canManageMembers: boolean;   // Add/remove members
  canManageSettings: boolean;  // Update group settings
  canDelete: boolean;          // Delete the group
}

// Group role definitions
enum GroupRole {
  ADMIN = 'admin',           // Full group management permissions
  MODERATOR = 'moderator',   // Content moderation + member management
  MEMBER = 'member',         // View + post permissions
  PENDING = 'pending',       // View-only until approved
  GUEST = 'guest'            // Public view-only access
}
```

### Permission Enforcement

Group permissions are enforced at multiple levels:

1. **Route-Level Protection**: Middleware validates user's group membership and role
2. **API Authorization**: Backend endpoints check permissions before operations
3. **UI Conditional Rendering**: Frontend components hide/disable actions based on permissions
4. **Database Row-Level Security**: Queries filter results based on user's access level

```typescript
// API middleware for group permissions
export const requireGroupPermission = (permission: keyof GroupPermissions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params;
    const userId = req.user?.id;
    
    const membership = await getGroupMembership(slug, userId);
    
    if (!membership || !hasPermission(membership.role, permission)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: permission
      });
    }
    
    next();
  };
};

// Example usage
router.post('/api/groups/:slug/posts',
  authenticate,
  requireGroupPermission('canPost'),
  createGroupPost
);
```

### Group Search Permissions

The advanced search functionality (`/api/groups/search`) respects visibility rules:

- **Public groups**: Searchable and viewable by all users
- **Private groups**: Only visible to members
- **Pending members**: Cannot search or view private group content

### Analytics Permissions

Group health analytics (`GroupHealthAnalytics.tsx`) are restricted to:
- Group admins: Full analytics access
- Group moderators: Limited analytics (no member-level data)
- Members: No analytics access

### Implementation Files

**Backend:**
- `server/routes/groupRoutes.ts` - Group permission middleware
- `server/services/groupService.ts` - Permission validation logic

**Frontend:**
- `client/src/pages/GroupDetailPageMT.tsx` - Permission-based UI rendering
- `client/src/components/groups/GroupSearch.tsx` - Search with visibility filters
- `client/src/components/groups/GroupHealthAnalytics.tsx` - Admin-only analytics

### Permission Matrix

| Action | Guest | Pending | Member | Moderator | Admin |
|--------|-------|---------|--------|-----------|-------|
| View Public Group | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Private Group | ❌ | ❌ | ✅ | ✅ | ✅ |
| Join Group | ✅ | ❌ | ✅ | ✅ | ✅ |
| Create Post | ❌ | ❌ | ✅ | ✅ | ✅ |
| Moderate Content | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage Members | ❌ | ❌ | ❌ | ✅ | ✅ |
| View Analytics | ❌ | ❌ | ❌ | 📊 | ✅ |
| Update Settings | ❌ | ❌ | ❌ | ❌ | ✅ |
| Delete Group | ❌ | ❌ | ❌ | ❌ | ✅ |

📊 = Limited access

## Next Steps

- [ ] Implement dynamic permission creation UI
- [ ] Add permission delegation system
- [ ] Enhanced audit logging
- [ ] Permission analytics dashboard
- [x] Groups RBAC implementation (October 2025)
- [x] Group search with visibility controls (October 2025)
- [x] Group analytics access controls (October 2025)

---

**Status**: 🟢 Operational
**Dependencies**: CASL, JWT, bcrypt
**Owner**: Security Team
**Last Updated**: October 2025