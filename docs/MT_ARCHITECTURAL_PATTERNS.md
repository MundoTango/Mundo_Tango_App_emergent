# Mundo Tango Architectural Patterns
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Status:** ✅ Active - Mandatory reference for system design

## Overview

This document defines the architectural patterns and design decisions for the Mundo Tango platform. These patterns ensure consistency, scalability, and maintainability across the 927+ agent ecosystem, 97 pages, and 464+ components.

---

## Core Architecture

### **Full-Stack JavaScript (Node.js + React)**

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                     │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  React 18 + TypeScript + Vite                       │ │
│  │  - Components (464+)                                │ │
│  │  - Pages (97 routes)                                │ │
│  │  - React Query (caching)                            │ │
│  │  - Wouter (routing)                                 │ │
│  │  - Shadcn UI + Tailwind CSS                         │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                        │ HTTP/WebSocket
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   SERVER (Replit Reserved VM)             │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Express.js + TypeScript                            │ │
│  │  - RESTful API routes (100-150 endpoints)           │ │
│  │  - Socket.io (real-time)                            │ │
│  │  - Middleware (auth, logging, CORS)                 │ │
│  │  - Business logic (927+ agents)                     │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                        │ SQL over HTTP
                        ▼
┌─────────────────────────────────────────────────────────┐
│                DATABASE (Neon PostgreSQL)                 │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  PostgreSQL 16 (serverless)                         │ │
│  │  - Drizzle ORM                                      │ │
│  │  - 88 tables                                        │ │
│  │  - 13 optimized indexes                             │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Layered Architecture

### **1. Presentation Layer (Client)**

**Responsibility:** User interface and user experience

**Technologies:**
- React 18 (functional components, hooks)
- TypeScript (type safety)
- Shadcn UI (base components)
- Tailwind CSS (styling)
- Wouter (routing)

**Pattern: Container/Presentational Components**

```typescript
// Presentational Component (pure, no logic)
interface PostCardProps {
  post: Post;
  onLike: (id: number) => void;
}

export function PostCard({ post, onLike }: PostCardProps) {
  return (
    <Card>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <Button onClick={() => onLike(post.id)}>Like</Button>
    </Card>
  );
}

// Container Component (logic, data fetching)
export function PostCardContainer({ postId }: { postId: number }) {
  const { data: post } = useQuery({
    queryKey: ['/api/posts', postId],
  });
  
  const likeMutation = useMutation({
    mutationFn: (id: number) => apiRequest('POST', `/api/posts/${id}/like`),
  });
  
  if (!post) return <Skeleton />;
  
  return <PostCard post={post} onLike={likeMutation.mutate} />;
}
```

---

### **2. API Layer (Server Routes)**

**Responsibility:** HTTP endpoints, request validation, response formatting

**Pattern: Thin Controllers**

```typescript
// server/routes/posts.ts
import { Router } from 'express';
import { z } from 'zod';
import { createPost, getPosts } from '../services/postService';

const router = Router();

// Validation schema
const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  privacy: z.enum(['public', 'friends', 'private']),
});

// Route handler (thin - delegates to service)
router.post('/api/posts', authMiddleware, async (req, res, next) => {
  try {
    // Validate
    const data = createPostSchema.parse(req.body);
    
    // Delegate to service
    const post = await createPost({
      ...data,
      userId: req.user.id, // From auth middleware
    });
    
    // Return success
    res.status(201).json(apiSuccess(post));
  } catch (error) {
    next(error); // Error handling middleware
  }
});

export default router;
```

**Benefits:**
- ✅ Routes are simple (validate → delegate → respond)
- ✅ Easy to test (mock service layer)
- ✅ Business logic not coupled to HTTP

---

### **3. Service Layer (Business Logic)**

**Responsibility:** Core business logic, orchestration

**Pattern: Service Objects**

```typescript
// server/services/postService.ts
import { db } from '../db';
import { posts, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface CreatePostInput {
  title: string;
  content: string;
  privacy: 'public' | 'friends' | 'private';
  userId: number;
}

export async function createPost(input: CreatePostInput) {
  // Business logic
  const user = await db.query.users.findFirst({
    where: eq(users.id, input.userId),
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Create post
  const [post] = await db.insert(posts).values({
    title: input.title,
    content: input.content,
    privacy: input.privacy,
    userId: input.userId,
  }).returning();
  
  // Trigger side effects
  await notifyFollowers(post);
  await indexForSearch(post);
  await logAnalytics('post_created', { postId: post.id });
  
  return post;
}
```

**Benefits:**
- ✅ Reusable (can be called from routes, background jobs, tests)
- ✅ Testable (no HTTP dependencies)
- ✅ Orchestrates multiple data access calls

---

### **4. Data Access Layer (Drizzle ORM)**

**Responsibility:** Database queries, schema management

**Pattern: Repository (via Drizzle)**

```typescript
// shared/schema.ts
import { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  privacy: varchar('privacy', { length: 20 }).notNull().default('public'),
  userId: integer('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

// Usage (in service layer)
const allPosts = await db.query.posts.findMany({
  with: {
    user: true, // Join
  },
  where: eq(posts.privacy, 'public'),
  limit: 20,
});
```

**Benefits:**
- ✅ Type-safe queries
- ✅ Schema as single source of truth
- ✅ Auto-generated TypeScript types

---

## Design Patterns

### **1. Dependency Injection**

```typescript
// ❌ BAD: Hardcoded dependencies
export class UserService {
  async getUser(id: number) {
    // Hardcoded db access
    return await db.query.users.findFirst({ where: eq(users.id, id) });
  }
}

// ✅ GOOD: Dependency injection
export class UserService {
  constructor(private db: Database) {}
  
  async getUser(id: number) {
    return await this.db.query.users.findFirst({
      where: eq(users.id, id)
    });
  }
}

// Usage
const userService = new UserService(db); // Inject dependency
const mockService = new UserService(mockDb); // Easy to test
```

---

### **2. Factory Pattern (React Query)**

```typescript
// client/src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

// Default fetcher
queryClient.setDefaultOptions({
  queries: {
    queryFn: async ({ queryKey }) => {
      const url = queryKey[0] as string;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network error');
      return response.json();
    },
  },
});
```

**Usage:**
```typescript
// Components just use queryKey - fetcher is automatic
const { data: posts } = useQuery({
  queryKey: ['/api/posts'],
});
```

---

### **3. Strategy Pattern (Multi-Model AI Routing)**

```typescript
// server/ai/providers.ts
interface AIProvider {
  generateResponse(prompt: string): Promise<string>;
}

class AnthropicProvider implements AIProvider {
  async generateResponse(prompt: string) {
    // Call Claude API
    return '...';
  }
}

class GeminiProvider implements AIProvider {
  async generateResponse(prompt: string) {
    // Call Gemini API
    return '...';
  }
}

// Strategy selector
function selectProvider(task: Task): AIProvider {
  if (task.complexity === 'high') {
    return new AnthropicProvider(); // More capable
  } else {
    return new GeminiProvider(); // Free tier
  }
}

// Usage
const provider = selectProvider(currentTask);
const response = await provider.generateResponse(prompt);
```

---

### **4. Observer Pattern (WebSocket Events)**

```typescript
// server/websocket/eventBus.ts
import { EventEmitter } from 'events';

export const eventBus = new EventEmitter();

// Subscribers
eventBus.on('post_created', (post) => {
  // Notify followers via WebSocket
  io.to(`user:${post.userId}:followers`).emit('new_post', post);
});

eventBus.on('post_created', (post) => {
  // Update search index
  searchIndex.add(post);
});

// Publisher
eventBus.emit('post_created', newPost);
```

---

## State Management

### **1. Server State (React Query)**

**Use for:** Data from backend APIs

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function usePosts() {
  const queryClient = useQueryClient();
  
  // Fetch posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ['/api/posts'],
  });
  
  // Create post mutation
  const createMutation = useMutation({
    mutationFn: (data: CreatePostInput) => 
      apiRequest('POST', '/api/posts', data),
    onSuccess: () => {
      // Invalidate cache to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
  });
  
  return { posts, isLoading, createPost: createMutation.mutate };
}
```

**Benefits:**
- ✅ Automatic caching
- ✅ Background refetching
- ✅ Optimistic updates
- ✅ Error handling

---

### **2. Client State (React Hooks)**

**Use for:** UI-only state (modals, forms, toggles)

```typescript
// Simple state
const [isOpen, setIsOpen] = useState(false);

// Form state
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    title: '',
    content: '',
  },
});
```

---

### **3. Global State (Context API)**

**Use for:** Auth, theme, rarely changing data

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useState } from 'react';

interface AuthContext {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  const login = async (email: string, password: string) => {
    const response = await apiRequest('POST', '/api/auth/login', { email, password });
    setUser(response.user);
  };
  
  const logout = () => {
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

---

## Real-Time Architecture (WebSocket)

### **Socket.io Pattern**

```typescript
// server/websocket/index.ts
import { Server } from 'socket.io';

export function setupWebSocket(io: Server) {
  io.use(authenticateSocket); // Middleware for auth
  
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join user-specific room
    socket.join(`user:${socket.data.userId}`);
    
    // Listen for events
    socket.on('send_message', async (data) => {
      const message = await createMessage(data);
      
      // Broadcast to room
      io.to(`chat:${data.chatId}`).emit('new_message', message);
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}
```

**Client:**
```typescript
// client/src/hooks/useSocket.ts
import { useEffect } from 'react';
import { io } from 'socket.io-client';

export function useSocket() {
  useEffect(() => {
    const socket = io({
      auth: {
        token: localStorage.getItem('token'),
      },
    });
    
    socket.on('new_message', (message) => {
      // Update UI
      queryClient.setQueryData(['messages'], (old) => [...old, message]);
    });
    
    return () => {
      socket.disconnect();
    };
  }, []);
}
```

---

## Caching Strategy

### **Multi-Layer Caching**

```
┌──────────────────────────────────────┐
│ 1. Browser Cache (Static Assets)     │
│    - JS/CSS bundles (immutable)      │
│    - Images (Cloudinary CDN)         │
│    - Cache-Control: max-age=31536000 │
└──────────────────────────────────────┘
                 ▼
┌──────────────────────────────────────┐
│ 2. React Query Cache (Client)        │
│    - API responses (5 min default)   │
│    - Optimistic updates              │
│    - Background refetch              │
└──────────────────────────────────────┘
                 ▼
┌──────────────────────────────────────┐
│ 3. Server Memory Cache (optional)    │
│    - Frequently accessed data        │
│    - Short TTL (1-5 min)             │
└──────────────────────────────────────┘
                 ▼
┌──────────────────────────────────────┐
│ 4. Database (Neon PostgreSQL)        │
│    - Source of truth                 │
│    - Optimized queries + indexes     │
└──────────────────────────────────────┘
```

---

## Error Handling Architecture

### **Centralized Error Handler**

```typescript
// server/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  console.error('Error:', error);
  logToSentry(error);
  
  // Determine response
  if (error instanceof ValidationError) {
    return res.status(400).json(apiError('Validation failed', 400, error.details));
  }
  
  if (error instanceof UnauthorizedError) {
    return res.status(401).json(apiError('Unauthorized', 401));
  }
  
  if (error instanceof NotFoundError) {
    return res.status(404).json(apiError('Not found', 404));
  }
  
  // Default: 500
  res.status(500).json(apiError('Internal server error', 500));
}

// Apply to Express app
app.use(errorHandler);
```

---

## Security Architecture

### **Defense in Depth**

```
┌──────────────────────────────────────┐
│ 1. HTTPS (Replit provides)           │
└──────────────────────────────────────┘
                 ▼
┌──────────────────────────────────────┐
│ 2. CORS (Express middleware)         │
│    - Whitelist Replit domains        │
└──────────────────────────────────────┘
                 ▼
┌──────────────────────────────────────┐
│ 3. Rate Limiting (express-rate-limit)│
│    - 100 req/15min per IP            │
└──────────────────────────────────────┘
                 ▼
┌──────────────────────────────────────┐
│ 4. Authentication (JWT)              │
│    - req.user populated by middleware│
└──────────────────────────────────────┘
                 ▼
┌──────────────────────────────────────┐
│ 5. Authorization (RBAC)              │
│    - Check user.role before access   │
└──────────────────────────────────────┘
                 ▼
┌──────────────────────────────────────┐
│ 6. Input Validation (Zod)            │
│    - Validate all user input         │
└──────────────────────────────────────┘
                 ▼
┌──────────────────────────────────────┐
│ 7. SQL Injection Prevention (Drizzle)│
│    - Parameterized queries           │
└──────────────────────────────────────┘
                 ▼
┌──────────────────────────────────────┐
│ 8. XSS Prevention (React escaping)   │
│    - React escapes by default        │
│    - DOMPurify for user HTML         │
└──────────────────────────────────────┘
```

---

## Deployment Architecture

**See:** `docs/REPLIT_RESERVED_VM_ADVANCED.md`

---

## Integration with ESA Protocols

**ESA_PARALLEL_BY_DEFAULT:**
- Independent API calls execute in parallel
- React Query batches requests automatically

**ESA_PERFORMANCE_METRICS:**
- Caching reduces load by 80%
- WebSocket reduces polling overhead

**ESA_CHECK_BEFORE_BUILD:**
- Architecture review before major changes
- Verify patterns followed

---

**Document Owner:** CEO Agent (#0) + Architecture Team  
**Review Cycle:** Quarterly or after major architecture changes  
**Last Updated:** October 19, 2025
