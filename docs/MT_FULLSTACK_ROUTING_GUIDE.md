# Mundo Tango Full-Stack Routing Guide
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Frontend:** Wouter (180 refs) | **Backend:** Express (178 routes)  
**Combined References:** 358 instances

## Overview

Mundo Tango uses **Wouter** (lightweight React router) for frontend routing and **Express** for backend API routes. This guide covers both systems and their integration patterns.

---

## Frontend Routing (Wouter)

### **Configuration** (`client/src/App.tsx`)

```typescript
import { Route, Switch } from 'wouter';

export function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/posts" component={PostListPage} />
      <Route path="/posts/:id" component={PostDetailPage} />
      <Route path="/profile/:username" component={ProfilePage} />
      <Route path="/admin/*" component={AdminRoutes} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}
```

### **Pattern 1: Basic Navigation**

```typescript
import { Link, useLocation } from 'wouter';

function Navigation() {
  const [location] = useLocation();

  return (
    <nav>
      <Link href="/" className={location === '/' ? 'active' : ''}>
        Home
      </Link>
      <Link href="/posts" className={location === '/posts' ? 'active' : ''}>
        Posts
      </Link>
      <Link href="/events" className={location === '/events' ? 'active' : ''}>
        Events
      </Link>
    </nav>
  );
}
```

### **Pattern 2: Programmatic Navigation**

```typescript
import { useLocation } from 'wouter';

function LoginForm() {
  const [, setLocation] = useLocation();

  const handleLogin = async (credentials) => {
    await apiRequest('/api/auth/login', { method: 'POST', body: credentials });
    setLocation('/'); // Redirect to home
  };

  return <form onSubmit={handleLogin}>...</form>;
}
```

### **Pattern 3: Route Parameters**

```typescript
import { useRoute } from 'wouter';

function PostDetailPage() {
  const [match, params] = useRoute('/posts/:id');

  const postId = parseInt(params?.id || '0');

  const { data: post } = useQuery({
    queryKey: ['/api/posts', postId],
  });

  return <div>{post?.title}</div>;
}
```

### **Pattern 4: Protected Routes**

```typescript
import { Route, Redirect } from 'wouter';
import { useUser } from '@/hooks/use-user';

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Redirect to="/login" />;

  return <Route {...rest} component={Component} />;
}

// Usage
<ProtectedRoute path="/dashboard" component={DashboardPage} />
<ProtectedRoute path="/admin/*" component={AdminRoutes} />
```

### **Pattern 5: Nested Routes**

```typescript
function AdminRoutes() {
  return (
    <div>
      <AdminSidebar />
      <Switch>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/users" component={UserManagement} />
        <Route path="/admin/posts" component={PostModeration} />
        <Route path="/admin/analytics" component={AnalyticsDashboard} />
      </Switch>
    </div>
  );
}
```

---

## Backend Routing (Express)

### **Configuration** (`server/routes.ts`)

```typescript
import express from 'express';
import { authMiddleware, adminMiddleware } from './middleware/auth';

const app = express();

// Public routes
app.post('/api/auth/login', async (req, res, next) => {
  // Login logic
});

app.post('/api/auth/register', async (req, res, next) => {
  // Registration logic
});

// Protected routes (require authentication)
app.get('/api/posts', authMiddleware, async (req, res, next) => {
  // List posts
});

app.post('/api/posts', authMiddleware, async (req, res, next) => {
  // Create post
});

// Admin routes (require admin role)
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res, next) => {
  // List users (admin only)
});
```

### **Pattern 1: RESTful API Routes**

```typescript
// GET /api/posts - List all posts
app.get('/api/posts', authMiddleware, async (req, res, next) => {
  try {
    const posts = await db.query.posts.findMany({
      orderBy: [desc(posts.createdAt)],
      limit: 20,
    });
    res.json(apiSuccess({ data: posts }));
  } catch (error) {
    next(error);
  }
});

// GET /api/posts/:id - Get single post
app.get('/api/posts/:id', authMiddleware, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });
    
    if (!post) {
      return res.status(404).json(apiError('Post not found', 404));
    }
    
    res.json(apiSuccess({ data: post }));
  } catch (error) {
    next(error);
  }
});

// POST /api/posts - Create post
app.post('/api/posts', authMiddleware, async (req, res, next) => {
  try {
    const validatedData = insertPostSchema.parse(req.body);
    
    const [newPost] = await db.insert(posts).values({
      ...validatedData,
      userId: req.user.id,
    }).returning();
    
    res.status(201).json(apiSuccess({ data: newPost }));
  } catch (error) {
    next(error);
  }
});

// PATCH /api/posts/:id - Update post
app.patch('/api/posts/:id', authMiddleware, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });
    
    if (!post) {
      return res.status(404).json(apiError('Post not found', 404));
    }
    
    if (post.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json(apiError('Access denied', 403));
    }
    
    const [updated] = await db.update(posts)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(posts.id, postId))
      .returning();
    
    res.json(apiSuccess({ data: updated }));
  } catch (error) {
    next(error);
  }
});

// DELETE /api/posts/:id - Delete post
app.delete('/api/posts/:id', authMiddleware, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });
    
    if (!post) {
      return res.status(404).json(apiError('Post not found', 404));
    }
    
    if (post.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json(apiError('Access denied', 403));
    }
    
    // Soft delete
    await db.update(posts)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(posts.id, postId));
    
    res.json(apiSuccess({ message: 'Post deleted' }));
  } catch (error) {
    next(error);
  }
});
```

### **Pattern 2: Middleware Chain**

```typescript
// Authentication middleware
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json(apiError('No token provided', 401));
    }
    
    const decoded = verifyToken(token, 'access');
    const user = await storage.getUser(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json(apiError('Invalid token', 401));
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json(apiError('Authentication failed', 401));
  }
};

// Admin authorization middleware
export const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json(apiError('Admin access required', 403));
  }
  next();
};

// Usage: Chain middlewares
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res, next) => {
  // Only authenticated admins can access
});
```

### **Pattern 3: Route Grouping**

```typescript
import { Router } from 'express';

// Posts router
const postsRouter = Router();
postsRouter.get('/', authMiddleware, listPosts);
postsRouter.get('/:id', authMiddleware, getPost);
postsRouter.post('/', authMiddleware, createPost);
postsRouter.patch('/:id', authMiddleware, updatePost);
postsRouter.delete('/:id', authMiddleware, deletePost);

// Events router
const eventsRouter = Router();
eventsRouter.get('/', authMiddleware, listEvents);
eventsRouter.post('/', authMiddleware, createEvent);

// Mount routers
app.use('/api/posts', postsRouter);
app.use('/api/events', eventsRouter);
```

---

## Frontend ↔ Backend Integration

### **Pattern: Matching Routes**

```typescript
// Frontend route (Wouter)
<Route path="/posts/:id" component={PostDetailPage} />

// PostDetailPage component
function PostDetailPage() {
  const [match, params] = useRoute('/posts/:id');
  const postId = parseInt(params?.id || '0');

  // Fetch from backend API
  const { data: post } = useQuery({
    queryKey: ['/api/posts', postId], // ← Backend endpoint
  });

  return <div>{post?.title}</div>;
}

// Backend route (Express)
app.get('/api/posts/:id', authMiddleware, async (req, res, next) => {
  const postId = parseInt(req.params.id);
  // Return post data
});
```

---

## Testing

### **Frontend Route Testing**

```typescript
import { render, screen } from '@testing-library/react';
import { Router } from 'wouter';
import { PostDetailPage } from './PostDetailPage';

test('renders post detail page', () => {
  render(
    <Router>
      <PostDetailPage />
    </Router>
  );
  
  expect(screen.getByTestId('post-detail')).toBeInTheDocument();
});
```

### **Backend Route Testing**

```typescript
import request from 'supertest';
import { app } from './server';

describe('POST /api/posts', () => {
  it('creates a new post', async () => {
    const response = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Post',
        content: 'Test content',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Test Post');
  });
});
```

---

## Next Steps

1. Read `docs/MT_API_CONVENTIONS.md` for complete API patterns
2. See `docs/MT_WEBSOCKET_REALTIME_ARCHITECTURE.md` for WebSocket routes
3. Review `server/routes.ts` for all 178 API endpoints

**Related Files:**
- `client/src/App.tsx` - Frontend route configuration
- `server/routes.ts` - Backend API routes
- `server/middleware/auth.ts` - Authentication middleware
