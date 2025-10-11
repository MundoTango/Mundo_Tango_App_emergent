# ESA Reusable Component Registry
**Living Registry of Platform Components - Check Before Building**

**Lead:** Agent #64 (Documentation Architect)  
**Updated By:** All agents after every build  
**Created:** October 11, 2025  
**Status:** ✅ LIVING DOCUMENT

---

## 🎯 Purpose

**Central registry of ALL reusable code to prevent duplication.**

Before building anything:
1. ✅ Check this registry FIRST
2. ✅ Reuse existing component if available
3. ✅ Extend existing if close match
4. ✅ Only build new if truly unique
5. ✅ Update registry after building new

---

## 📚 Table of Contents

1. [UI Components](#ui-components)
2. [API Utilities](#api-utilities)
3. [Database Patterns](#database-patterns)
4. [Business Logic](#business-logic)
5. [Authentication & Authorization](#authentication--authorization)
6. [Data Validation](#data-validation)
7. [State Management](#state-management)
8. [Real-Time Features](#real-time-features)
9. [Internationalization](#internationalization)
10. [Testing Utilities](#testing-utilities)

---

## 🎨 UI Components

### Layout & Structure

#### GlassCard (Aurora Tide Design System)
**Location:** `client/src/components/ui/GlassCard.tsx`  
**Usage:** Primary container with glassmorphic effect  
**Props:**
```typescript
interface GlassCardProps {
  variant?: 'default' | 'hover' | 'interactive';
  className?: string;
  children: React.ReactNode;
}
```
**Example:**
```tsx
import { GlassCard } from '@/components/ui/GlassCard';

<GlassCard variant="hover">
  <h2>Content here</h2>
</GlassCard>
```
**Used In:** Dashboard, Profile, Events, Housing, Project Tracker

---

#### Modal
**Location:** `client/src/components/ui/modal.tsx`  
**Usage:** Accessible modal dialogs  
**Features:** Focus trap, ESC to close, backdrop click  
**Example:**
```tsx
import { Modal } from '@/components/ui/modal';

<Modal open={isOpen} onClose={() => setIsOpen(false)}>
  <Modal.Title>Title</Modal.Title>
  <Modal.Content>Content</Modal.Content>
</Modal>
```

---

### Forms & Inputs

#### Form (shadcn + react-hook-form)
**Location:** `client/src/components/ui/form.tsx`  
**Usage:** Type-safe forms with validation  
**Pattern:**
```tsx
import { useForm } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(mySchema),
  defaultValues: {}
});

<Form {...form}>
  <FormField name="email" control={form.control} />
</Form>
```

---

#### Input Components
**Location:** `client/src/components/ui/input.tsx`  
**Variants:**
- Text input
- Password input (with visibility toggle)
- Search input (with icon)
- Number input

**Usage:**
```tsx
import { Input } from '@/components/ui/input';

<Input type="email" placeholder="Enter email" />
```

---

### Buttons & Actions

#### Button (shadcn)
**Location:** `client/src/components/ui/button.tsx`  
**Variants:**
- default, destructive, outline, secondary, ghost, link
- Sizes: default, sm, lg, icon

**Usage:**
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="lg">Click me</Button>
```

---

### Feedback & Notifications

#### Toast Notifications
**Location:** `client/src/hooks/use-toast.ts`  
**Usage:** Global toast system  
**Example:**
```tsx
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
  title: "Success",
  description: "Item saved successfully"
});
```

---

### Data Display

#### Table (shadcn)
**Location:** `client/src/components/ui/table.tsx`  
**Features:** Responsive, sortable, with pagination  
**Usage:** Project Tracker, Admin panels

#### Card (shadcn)
**Location:** `client/src/components/ui/card.tsx`  
**Note:** Use GlassCard for Aurora Tide compliance

---

## 🔌 API Utilities

### Middleware

#### Authentication Middleware
**Location:** `server/middleware/auth.ts`  
**Usage:** Protect routes requiring authentication  
**Example:**
```typescript
import { authenticateToken } from './middleware/auth';

router.get('/api/protected', authenticateToken, handler);
```

---

#### Validation Middleware
**Location:** `server/middleware/validation.ts`  
**Usage:** Validate request bodies with Zod  
**Example:**
```typescript
import { validateRequest } from './middleware/validation';

router.post('/api/users', 
  validateRequest(insertUserSchema), 
  handler
);
```

---

#### Error Handler
**Location:** `server/middleware/errorHandler.ts`  
**Usage:** Global error handling  
**Features:** Logs errors, returns consistent format  
**Setup:**
```typescript
import { errorHandler } from './middleware/errorHandler';

app.use(errorHandler);
```

---

#### Rate Limiting
**Location:** `server/middleware/rateLimit.ts`  
**Usage:** Prevent abuse  
**Example:**
```typescript
import { apiLimiter } from './middleware/rateLimit';

router.post('/api/auth/login', apiLimiter, handler);
```

---

### API Response Patterns

#### Success Response
```typescript
// Pattern used across all API routes
res.json({
  success: true,
  data: result
});
```

#### Error Response
```typescript
// Pattern used across all API routes
res.status(400).json({
  success: false,
  error: "Error message"
});
```

---

## 💾 Database Patterns

### Common Schemas (shared/schema.ts)

#### User Schema
```typescript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email').notNull().unique(),
  username: varchar('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

---

#### Audit Pattern (Soft Deletes + Timestamps)
```typescript
// Reusable pattern for auditable tables
{
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'), // Soft delete
  createdBy: integer('created_by').references(() => users.id),
  updatedBy: integer('updated_by').references(() => users.id),
}
```

---

### Common Queries

#### Paginated Query Pattern
**Location:** `server/utils/pagination.ts`  
**Usage:**
```typescript
import { paginatedQuery } from './utils/pagination';

const result = await paginatedQuery(
  db.select().from(users),
  { page: 1, limit: 20 }
);
```

---

#### Soft Delete Query Pattern
```typescript
// Always exclude soft-deleted records
const activeRecords = await db
  .select()
  .from(table)
  .where(isNull(table.deletedAt));
```

---

## 🔐 Authentication & Authorization

### Auth Utilities

#### JWT Token Generation
**Location:** `server/utils/jwt.ts`  
**Usage:**
```typescript
import { generateToken } from './utils/jwt';

const token = generateToken({ userId: user.id });
```

---

#### Password Hashing
**Location:** `server/utils/password.ts`  
**Usage:**
```typescript
import { hashPassword, verifyPassword } from './utils/password';

const hash = await hashPassword(plainPassword);
const valid = await verifyPassword(plainPassword, hash);
```

---

#### Permission Checks (CASL)
**Location:** `server/utils/permissions.ts`  
**Usage:**
```typescript
import { defineAbilitiesFor } from './utils/permissions';

const ability = defineAbilitiesFor(user);
if (ability.can('update', 'Post')) {
  // Allow action
}
```

---

## ✅ Data Validation

### Zod Schemas (shared/)

#### Insert Schemas (from Drizzle)
```typescript
import { createInsertSchema } from 'drizzle-zod';

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});
```

---

#### Common Validators
**Location:** `shared/validators/`  
**Available:**
- Email validator
- Password strength validator
- Phone number validator
- URL validator
- Credit card validator (via Stripe)

**Usage:**
```typescript
import { emailSchema } from '@shared/validators';

const result = emailSchema.safeParse(input);
```

---

## 🌐 State Management

### React Query Patterns

#### Query Pattern
```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['/api/users', userId],
  // Default fetcher handles the request
});
```

---

#### Mutation Pattern
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@lib/queryClient';

const mutation = useMutation({
  mutationFn: (data) => apiRequest('POST', '/api/users', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/users'] });
  }
});
```

---

### Context Patterns

#### Auth Context
**Location:** `client/src/contexts/AuthContext.tsx`  
**Usage:** Global auth state  
**Example:**
```tsx
import { useAuth } from '@/contexts/AuthContext';

const { user, login, logout } = useAuth();
```

---

## 🔄 Real-Time Features

### WebSocket Patterns

#### Socket.io Setup (Server)
**Location:** `server/websocket.ts`  
**Usage:** Real-time events  
**Example:**
```typescript
import { io } from './websocket';

io.on('connection', (socket) => {
  socket.on('message', (data) => {
    io.emit('message', data); // Broadcast
  });
});
```

---

#### Socket.io Client
**Location:** `client/src/lib/socket.ts`  
**Usage:**
```tsx
import { socket } from '@/lib/socket';

socket.emit('message', data);
socket.on('message', (data) => {
  // Handle incoming
});
```

---

## 🌍 Internationalization

### i18next Patterns

#### Translation Hook
**Location:** `client/src/hooks/useTranslation.ts`  
**Usage:**
```tsx
import { useTranslation } from '@/hooks/useTranslation';

const { t } = useTranslation();

<h1>{t('welcome.title')}</h1>
```

---

#### Language Switcher
**Location:** `client/src/components/LanguageSwitcher.tsx`  
**Usage:** Reusable language selector  
**Features:** 68 languages supported

---

## 🧪 Testing Utilities

### Test Helpers

#### API Test Helper
**Location:** `server/__tests__/helpers/api.ts`  
**Usage:**
```typescript
import { testRequest } from './helpers/api';

const response = await testRequest
  .post('/api/users')
  .send(userData);
```

---

#### Mock Data Factory
**Location:** `server/__tests__/helpers/factories.ts`  
**Usage:**
```typescript
import { createMockUser } from './helpers/factories';

const user = createMockUser({ email: 'test@example.com' });
```

---

## 📝 How to Update This Registry

### After Building New Component:

**Step 1: Add Entry**
```markdown
#### [Component Name]
**Location:** `path/to/file.tsx`
**Usage:** Brief description
**Props/API:** Interface or example
**Example:** Code snippet
**Used In:** List pages/features using it
```

**Step 2: Submit to Agent #64**
- Create PR or message to Agent #64
- Agent #64 reviews and approves
- Entry added to registry

**Step 3: Link in Documentation**
- Cross-reference in ESA_CHECK_BEFORE_BUILD.md
- Update agent memory files if relevant

---

## 🔗 Quick Search Guide

**Looking for:**
- Authentication? → [Auth Utilities](#authentication--authorization)
- UI Component? → [UI Components](#ui-components)
- Form validation? → [Data Validation](#data-validation)
- Database pattern? → [Database Patterns](#database-patterns)
- API middleware? → [API Utilities](#api-utilities)
- Real-time? → [Real-Time Features](#real-time-features)
- Translations? → [Internationalization](#internationalization)

**Not finding what you need?**
1. Search codebase: `grep -r "similar pattern"`
2. Ask Agent #64: "Is there a component for X?"
3. Check similar features for patterns
4. If truly new: Build it, then update this registry

---

**Last Updated:** October 11, 2025  
**Maintained By:** Agent #64 (Documentation Architect)  
**Contributors:** All 105 agents  
**Update Frequency:** After every new component built
