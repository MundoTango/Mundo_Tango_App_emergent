# Mundo Tango Type Safety & Validation Guide
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**TypeScript:** Full coverage | **Zod:** 304 validation schemas

## Overview

Mundo Tango uses **TypeScript** for compile-time type safety and **Zod** for runtime validation. This guide covers patterns for ensuring data integrity across the full stack.

---

## TypeScript Patterns

### **Pattern 1: Schema-Driven Types**

```typescript
// shared/schema.ts - Single source of truth
import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
});

// Auto-generated TypeScript types
export type User = typeof users.$inferSelect;      // For reading
export type InsertUser = typeof users.$inferInsert; // For writing

// Usage - Types match database exactly
const user: User = await db.query.users.findFirst();
const newUser: InsertUser = { name: 'John', email: 'john@ex.com' };
```

### **Pattern 2: API Response Types**

```typescript
// Typed API responses
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
  };
  meta?: {
    page?: number;
    total?: number;
  };
}

// Usage
const response: APIResponse<User[]> = await fetch('/api/users').then(r => r.json());
if (response.success) {
  const users: User[] = response.data!;
}
```

### **Pattern 3: Generic Utility Types**

```typescript
// Partial update type
type UpdateUser = Partial<User>;

// Omit sensitive fields
type PublicUser = Omit<User, 'password' | 'apiToken'>;

// Pick specific fields
type UserSummary = Pick<User, 'id' | 'name' | 'email'>;

// Required fields from optional
type RequiredUser = Required<Pick<User, 'name' | 'email'>>;
```

---

## Zod Validation

### **Pattern 1: Schema-to-Zod Integration**

```typescript
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Auto-generate Zod schema from Drizzle table
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,        // Auto-generated
  createdAt: true, // Auto-generated
});

// Extend with additional validation
export const registerSchema = insertUserSchema.extend({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

// TypeScript type from Zod schema
export type RegisterInput = z.infer<typeof registerSchema>;
```

### **Pattern 2: Backend Validation**

```typescript
import { registerSchema } from '@shared/schema';

app.post('/api/auth/register', async (req, res, next) => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);
    
    // validatedData is now typed and validated
    const [user] = await db.insert(users).values(validatedData).returning();
    
    res.status(201).json(apiSuccess({ data: user }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(apiError('Validation failed', 400, error.errors));
    }
    next(error);
  }
});
```

### **Pattern 3: Frontend Form Validation**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@shared/schema';

function RegisterForm() {
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    // data is validated and typed
    await apiRequest('/api/auth/register', {
      method: 'POST',
      body: data,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields with automatic validation */}
      </form>
    </Form>
  );
}
```

### **Pattern 4: Custom Validators**

```typescript
// Email validation
const emailSchema = z.string().email('Invalid email format');

// URL validation
const urlSchema = z.string().url('Invalid URL');

// Date validation
const dateSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Invalid date format' }
);

// Custom business logic
const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username cannot exceed 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
  .refine(async (username) => {
    // Check if username is available
    const existing = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    return !existing;
  }, { message: 'Username already taken' });
```

---

## Common Validation Patterns

### **1. Nullable vs Optional**

```typescript
// Optional (field may be missing)
const schema = z.object({
  name: z.string(),
  bio: z.string().optional(), // Can be undefined
});

// Nullable (field present but value can be null)
const schema = z.object({
  name: z.string(),
  bio: z.string().nullable(), // Can be null
});

// Both
const schema = z.object({
  name: z.string(),
  bio: z.string().optional().nullable(), // Can be undefined or null
});
```

### **2. Arrays**

```typescript
const schema = z.object({
  tags: z.array(z.string()),                    // String array
  roles: z.array(z.enum(['admin', 'user'])),    // Enum array
  posts: z.array(insertPostSchema),             // Object array
  scores: z.array(z.number()).min(1, 'At least one score required'),
});
```

### **3. Enums**

```typescript
const privacySchema = z.enum(['public', 'friends', 'private']);

// Usage
type Privacy = z.infer<typeof privacySchema>; // 'public' | 'friends' | 'private'

// In forms
const postSchema = z.object({
  title: z.string(),
  privacy: privacySchema.default('public'),
});
```

### **4. Conditional Validation**

```typescript
const eventSchema = z.object({
  title: z.string(),
  isRecurring: z.boolean(),
  recurrenceRule: z.string().optional(),
}).refine(
  (data) => {
    // If recurring, recurrence rule is required
    if (data.isRecurring) {
      return !!data.recurrenceRule;
    }
    return true;
  },
  {
    message: 'Recurrence rule required for recurring events',
    path: ['recurrenceRule'],
  }
);
```

---

## Error Handling

### **Backend: Zod Error Formatting**

```typescript
app.post('/api/posts', authMiddleware, async (req, res, next) => {
  try {
    const validated = insertPostSchema.parse(req.body);
    // Process...
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format validation errors
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      return res.status(400).json(apiError('Validation failed', 400, { errors }));
    }
    next(error);
  }
});
```

### **Frontend: Form Error Display**

```typescript
function PostForm() {
  const form = useForm({
    resolver: zodResolver(insertPostSchema),
  });

  // Access errors
  console.log(form.formState.errors);
  
  // Errors automatically shown by FormMessage component
  return (
    <Form {...form}>
      <FormField
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage /> {/* Shows validation error */}
          </FormItem>
        )}
      />
    </Form>
  );
}
```

---

## Type Guards

### **Runtime Type Checking**

```typescript
// Type guard function
function isUser(obj: any): obj is User {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.email === 'string'
  );
}

// Usage
const data = await fetch('/api/user').then(r => r.json());
if (isUser(data)) {
  // TypeScript knows data is User
  console.log(data.name);
}
```

---

## Performance Optimization

### **1. Lazy Validation**

```typescript
// Only validate when needed
const validateLater = registerSchema.safeParse(data);

if (!validateLater.success) {
  console.error(validateLater.error);
}
```

### **2. Partial Validation**

```typescript
// Validate only specific fields
const partialSchema = registerSchema.pick({ email: true, password: true });

// Or exclude fields
const withoutPassword = registerSchema.omit({ password: true, confirmPassword: true });
```

---

## Testing

```typescript
import { describe, it, expect } from 'vitest';
import { registerSchema } from '@shared/schema';

describe('registerSchema', () => {
  it('validates correct data', () => {
    const valid = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    };

    expect(() => registerSchema.parse(valid)).not.toThrow();
  });

  it('rejects invalid email', () => {
    const invalid = {
      name: 'John Doe',
      email: 'not-an-email',
      password: 'Password123',
      confirmPassword: 'Password123',
    };

    expect(() => registerSchema.parse(invalid)).toThrow();
  });

  it('rejects mismatched passwords', () => {
    const invalid = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: 'Different',
    };

    expect(() => registerSchema.parse(invalid)).toThrow();
  });
});
```

---

## Next Steps

1. Read `docs/MT_CODING_STANDARDS.md` for TypeScript best practices
2. See `docs/MT_DRIZZLE_ORM_GUIDE.md` for schema-driven development
3. Review `shared/schema.ts` for all 304 Zod schemas

**Related Files:**
- `shared/schema.ts` - All schemas and types
- `server/routes.ts` - Backend validation examples
- `client/src/pages/*` - Frontend form validation
