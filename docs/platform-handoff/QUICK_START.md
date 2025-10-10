# 🚀 Quick Start Guide
## Get Up and Running in 15 Minutes

**For:** New developers, AI agents, contractors  
**Time:** 15 minutes  
**Framework:** ESA LIFE CEO 61x21

---

## ⚡ 5-Minute Setup

### Step 1: Environment Check (1 min)

```bash
# Verify you have access
node --version   # Should be v18+
npm --version    # Should be v9+

# Check database connection
env | grep DATABASE_URL
```

**ESA Layer Check:**
- ✅ Layer 1: Database Architecture (PostgreSQL)
- ✅ Layer 3: Server Framework (Node.js)

### Step 2: Install Dependencies (2 min)

```bash
# Install all packages
npm install

# Verify installation
npm run db:push  # Sync database schema
```

**ESA Layer Check:**
- ✅ Layer 59: Open Source Management (359 packages)
- ✅ Layer 1: Database Architecture (Drizzle ORM)

### Step 3: Start the Application (1 min)

```bash
# Start development server
npm run dev

# Server starts on port 5000
# Frontend: Vite dev server
# Backend: Express API
```

**ESA Layer Check:**
- ✅ Layer 3: Server Framework (Express)
- ✅ Layer 8: Client Framework (React + Vite)

### Step 4: Verify It's Working (1 min)

```bash
# Check health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {"status":"ok","timestamp":"2025-10-10T..."}
```

**ESA Layer Check:**
- ✅ Layer 2: API Structure (REST endpoints)
- ✅ Layer 50: DevOps Automation (Health checks)

---

## 🏗️ 10-Minute First Feature

### Example: Add a New API Endpoint

**Time: 10 minutes**  
**ESA Layers: 1, 2, 5, 6**

#### Step 1: Define Schema (2 min)

**File:** `shared/schema.ts`

```typescript
// ESA Layer 1: Database Architecture
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  completed: boolean('completed').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

// ESA Layer 6: Data Validation (Zod)
export const insertTodoSchema = createInsertSchema(todos).omit({
  id: true,
  createdAt: true
});

export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type Todo = typeof todos.$inferSelect;
```

#### Step 2: Update Storage (2 min)

**File:** `server/storage.ts`

```typescript
// ESA Layer 5: Business Logic
interface IStorage {
  // ... existing methods
  
  // Add new methods
  getTodos(): Promise<Todo[]>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(id: number, updates: Partial<InsertTodo>): Promise<Todo>;
}

// Implementation
class DbStorage implements IStorage {
  async getTodos() {
    return db.select().from(todos);
  }
  
  async createTodo(todo: InsertTodo) {
    const [created] = await db.insert(todos).values(todo).returning();
    return created;
  }
  
  async updateTodo(id: number, updates: Partial<InsertTodo>) {
    const [updated] = await db
      .update(todos)
      .set(updates)
      .where(eq(todos.id, id))
      .returning();
    return updated;
  }
}
```

#### Step 3: Create API Routes (2 min)

**File:** `server/routes.ts`

```typescript
// ESA Layer 2: API Structure
import { insertTodoSchema } from '@shared/schema';

// GET /api/todos
app.get('/api/todos', async (req, res) => {
  const todos = await storage.getTodos();
  res.json(todos);
});

// POST /api/todos
app.post('/api/todos', async (req, res) => {
  // ESA Layer 6: Data Validation
  const validated = insertTodoSchema.parse(req.body);
  const todo = await storage.createTodo(validated);
  res.json(todo);
});

// PATCH /api/todos/:id
app.patch('/api/todos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const validated = insertTodoSchema.partial().parse(req.body);
  const todo = await storage.updateTodo(id, validated);
  res.json(todo);
});
```

#### Step 4: Create Frontend Component (4 min)

**File:** `client/src/pages/TodoList.tsx`

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ESA Layer 7: State Management (React Query)
export default function TodoList() {
  const { data: todos, isLoading } = useQuery<Todo[]>({
    queryKey: ['/api/todos']
  });
  
  // ESA Layer 2: API Integration
  const createMutation = useMutation({
    mutationFn: (title: string) =>
      apiRequest('/api/todos', { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos'] });
    }
  });
  
  const [title, setTitle] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(title);
    setTitle('');
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New todo..."
          data-testid="input-todo-title"
        />
        <Button type="submit" data-testid="button-add-todo">
          Add
        </Button>
      </form>
      
      <div className="space-y-2">
        {todos?.map(todo => (
          <div key={todo.id} className="flex items-center gap-2">
            <input type="checkbox" checked={todo.completed} />
            <span>{todo.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Step 5: Register Route (1 min)

**File:** `client/src/App.tsx`

```typescript
import { Route, Switch } from 'wouter';
import TodoList from './pages/TodoList';

function App() {
  return (
    <Switch>
      {/* ... existing routes */}
      <Route path="/todos" component={TodoList} />
    </Switch>
  );
}
```

#### Step 6: Test (1 min)

```bash
# Sync database
npm run db:push

# Visit in browser
open http://localhost:5000/todos

# Or test API directly
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"My first todo"}'
```

**✅ Done! You've built a complete feature in 10 minutes.**

---

## 🎨 Design System Quick Reference

**ESA Layer 9: UI Framework (Aurora Tide)**

```typescript
// Use glassmorphic cards
import { GlassCard } from '@/components/glass/GlassComponents';

<GlassCard depth={2} className="p-6">
  {/* Your content */}
</GlassCard>

// Add animations
import { FadeIn } from '@/components/animations/FramerMotionWrappers';

<FadeIn delay={0.1}>
  <div>Animated content</div>
</FadeIn>

// Use design tokens (MT Ocean Theme)
<div className="bg-ocean-100 dark:bg-ocean-900">
  {/* Ocean palette colors */}
</div>
```

**Design System Checklist:**
- ✅ Use GlassCard components (depth 1-4)
- ✅ Add dark mode (`dark:` classes)
- ✅ Use i18n (`t()` pattern)
- ✅ Add data-testid attributes
- ✅ Include ARIA labels

---

## 🔍 ESA Layer Quick Reference

**Use this when building features:**

| Layer | What | When to Use |
|-------|------|-------------|
| **1** | Database | Define tables, relationships |
| **2** | API | Create endpoints |
| **3** | Server | Add middleware, config |
| **4** | Auth | Login, permissions |
| **5** | Business Logic | Validation, workflows |
| **6** | Validation | Zod schemas |
| **7** | State | React Query, Context |
| **8** | React | Components, hooks |
| **9** | UI | Tailwind, design system |
| **10** | Components | shadcn/ui, Radix |
| **11** | Real-time | WebSocket, Socket.io |
| **14** | Cache | Redis, in-memory |
| **17** | Payments | Stripe integration |
| **31-46** | AI | OpenAI, Life CEO agents |
| **47** | Mobile | PWA, responsive |
| **51** | Testing | Vitest, Playwright |

---

## 📚 Next Steps

**After 15 minutes, dive deeper:**

1. **Read Core Docs (30 min)**
   - ESA_ORCHESTRATION.md - Framework overview
   - approved-patterns-2025-10-10.md - Code patterns
   - aurora-tide-design.md - Design system

2. **Explore the Codebase (1 hour)**
   - `client/src/pages/` - All pages
   - `server/routes.ts` - API routes
   - `shared/schema.ts` - Database schema

3. **Build a Real Feature (2-4 hours)**
   - Pick a feature from current-implementation-status.md
   - Follow the 6-phase agent methodology
   - Use ESA layers as a checklist

---

## 🛠️ Common Commands

```bash
# Development
npm run dev                    # Start dev server
npm run db:push                # Sync database schema
npm run db:push --force        # Force schema sync

# Testing
npm run test                   # Run unit tests
npm run test:e2e              # Run Playwright tests
npm run audit-page <name>     # Audit specific page

# Code Quality
npm run lint                   # ESLint check
npm run typecheck             # TypeScript check
npm run format                # Prettier format

# Production
npm run build                 # Build for production
npm run preview               # Preview production build
```

---

## 🚨 Quick Troubleshooting

**Database connection error?**
```bash
env | grep DATABASE_URL  # Check connection string
npm run db:push --force  # Force schema sync
```

**Build failing?**
```bash
npm run typecheck        # Check TypeScript errors
npm run lint             # Check ESLint errors
```

**Feature not working?**
```bash
# Check logs
npm run dev              # Watch console output
# Check API
curl http://localhost:5000/api/health
```

---

## 🎯 Success Checklist

After 15 minutes, you should be able to:

- ✅ Run the application locally
- ✅ Access the database
- ✅ Make API calls
- ✅ Build a simple CRUD feature
- ✅ Use the design system
- ✅ Understand ESA layer mapping

**🎉 You're ready to build!**

---

**Next Read:** `TROUBLESHOOTING.md` for common issues and fixes
