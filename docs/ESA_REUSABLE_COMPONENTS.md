# ESA REUSABLE_COMPONENTS Protocol
**Version:** 1.0  
**Status:** ✅ Active  
**Referenced by:** 106 agent files across ESA LIFE CEO framework

## Quick Links
- 📦 **[Complete Component Catalog](./MT_COMPONENT_CATALOG.md)** - Full inventory of 464 components
- 🔄 **[ESA Protocols Lifecycle](./ESA_PROTOCOLS_LIFECYCLE.md)** - How this protocol integrates with others
- 📋 **[Certification Rubrics](./ESA_AGENT_CERTIFICATION_RUBRICS.md)** - Component creation assessment

## Purpose
The REUSABLE_COMPONENTS protocol promotes code reuse, consistency, and maintainability across the Mundo Tango platform. It defines patterns for creating, documenting, and consuming shared components.

**See `MT_COMPONENT_CATALOG.md` for the complete inventory of all 464 components with ownership, versioning, and usage examples.**

## Core Principles

### 1. **DRY (Don't Repeat Yourself)**
Write code once, use everywhere. If you're copy-pasting, create a component.

### 2. **Consistency Over Customization**
Use existing components before creating new ones.

### 3. **Documentation Required**
Every reusable component must have clear usage examples.

---

## Component Categories

### **1. UI Components (467 total, Shadcn-based)**

#### **Base Components (from Shadcn UI):**
Located in `client/src/components/ui/`

**Form Controls:**
- `Button` - Primary, secondary, ghost, link variants
- `Input` - Text, email, password, number inputs
- `Select` - Dropdown select with search
- `Checkbox` - Checkboxes with labels
- `RadioGroup` - Radio button groups
- `Textarea` - Multi-line text input
- `Form` - React Hook Form integration

**Layout:**
- `Card` - Content containers with header/footer
- `Tabs` - Tab navigation
- `Dialog` - Modal dialogs
- `Sheet` - Side panels
- `Accordion` - Collapsible sections
- `Separator` - Horizontal/vertical dividers

**Feedback:**
- `Toast` - Notification toasts
- `Alert` - Warning/error/info alerts
- `Badge` - Status indicators
- `Progress` - Progress bars
- `Skeleton` - Loading placeholders

**Data Display:**
- `Table` - Data tables with sorting
- `Avatar` - User avatars
- `Calendar` - Date pickers
- `Popover` - Contextual popovers
- `Tooltip` - Hover tooltips

**Usage Example:**
```typescript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

function LoginForm() {
  return (
    <Card>
      <form>
        <Input type="email" placeholder="Email" data-testid="input-email" />
        <Input type="password" placeholder="Password" data-testid="input-password" />
        <Button type="submit" data-testid="button-login">Login</Button>
      </form>
    </Card>
  );
}
```

---

#### **Custom MT Components:**
Located in `client/src/components/`

**MT Ocean Theme Components:**
```typescript
// GlassmorphicCard - Teal/cyan gradient with backdrop blur
import { GlassmorphicCard } from "@/components/GlassmorphicCard";

<GlassmorphicCard>
  <h2>Tango Memory</h2>
  <p>Content with beautiful MT Ocean styling</p>
</GlassmorphicCard>
```

**Layout Components:**
```typescript
// MTNavbar - Platform navigation with logo, search, user menu
import { MTNavbar } from "@/components/MTNavbar";

<MTNavbar 
  currentPath="/home" 
  user={currentUser}
  onSearch={handleSearch}
/>
```

```typescript
// MTSidebar - Collapsible sidebar navigation
import { MTSidebar } from "@/components/MTSidebar";

<MTSidebar 
  items={navigationItems}
  collapsed={isSidebarCollapsed}
/>
```

**Feature-Specific Components:**
```typescript
// MemoryCard - Displays a user post/memory
import { MemoryCard } from "@/components/MemoryCard";

<MemoryCard 
  memory={memoryData}
  onLike={handleLike}
  onComment={handleComment}
  onShare={handleShare}
/>
```

```typescript
// EventCard - Event display with RSVP
import { EventCard } from "@/components/EventCard";

<EventCard 
  event={eventData}
  onRSVP={handleRSVP}
  userStatus={attendanceStatus}
/>
```

---

### **2. React Hooks (Custom)**

#### **Data Fetching Hooks:**
```typescript
// useAuth - Authentication state and methods
import { useAuth } from "@/hooks/use-auth";

function MyComponent() {
  const { user, login, logout, isLoading } = useAuth();
  
  if (isLoading) return <Skeleton />;
  if (!user) return <LoginPrompt />;
  
  return <div>Welcome, {user.name}!</div>;
}
```

```typescript
// useMemories - Fetch and manage memories/posts
import { useMemories } from "@/hooks/use-memories";

function HomeFeed() {
  const { data: memories, isLoading, createMemory } = useMemories({
    userId: currentUser.id,
    limit: 20
  });
  
  return (
    <div>
      {memories?.map(memory => (
        <MemoryCard key={memory.id} memory={memory} />
      ))}
    </div>
  );
}
```

#### **WebSocket Hooks:**
```typescript
// useSocket - Real-time WebSocket connection
import { useSocket } from "@/hooks/use-socket";

function ChatRoom({ roomId }: { roomId: string }) {
  const { socket, isConnected } = useSocket();
  
  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('join_room', roomId);
    }
  }, [socket, isConnected, roomId]);
  
  return <div>Connected: {isConnected ? 'Yes' : 'No'}</div>;
}
```

#### **UI State Hooks:**
```typescript
// useToast - Toast notification system
import { useToast } from "@/hooks/use-toast";

function SaveButton() {
  const { toast } = useToast();
  
  const handleSave = async () => {
    try {
      await saveData();
      toast({
        title: "Success!",
        description: "Data saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  return <Button onClick={handleSave}>Save</Button>;
}
```

---

### **3. Backend Utilities**

#### **Middleware Components:**
```typescript
// authMiddleware - JWT authentication
import { authMiddleware } from "@/server/middleware/auth";

app.get('/api/protected', authMiddleware, (req, res) => {
  // req.user populated by middleware
  res.json({ user: req.user });
});
```

```typescript
// errorHandler - Centralized error handling
import { errorHandler } from "@/server/middleware/errorHandler";

app.use(errorHandler);

// In routes:
throw new ApiError(404, 'User not found'); // Handled automatically
```

```typescript
// rateLimiter - Rate limiting
import { createRateLimiter } from "@/server/middleware/rateLimit";

const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
});

app.use('/api/', apiLimiter);
```

#### **API Response Utilities:**
```typescript
// apiResponse - Standardized API responses
import { successResponse, errorResponse } from "@/server/utils/apiResponse";

app.get('/api/users', async (req, res) => {
  try {
    const users = await db.query.users.findMany();
    return successResponse(res, users, 'Users fetched successfully');
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch users');
  }
});
```

#### **Validation Utilities:**
```typescript
// validateRequest - Zod validation middleware
import { validateRequest } from "@/server/utils/validation";
import { insertUserSchema } from "@shared/schema";

app.post('/api/users', 
  validateRequest({ body: insertUserSchema }),
  async (req, res) => {
    // req.body is validated and typed
    const user = await createUser(req.body);
    return successResponse(res, user);
  }
);
```

---

### **4. Database Utilities**

#### **Drizzle Query Patterns:**
```typescript
// Reusable query builders
import { db } from "@/server/db";
import { users, posts, events } from "@shared/schema";
import { eq, desc, and, gte } from "drizzle-orm";

// Pattern: Get user with posts
export async function getUserWithPosts(userId: number) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      posts: {
        orderBy: [desc(posts.createdAt)],
        limit: 20
      }
    }
  });
}

// Pattern: Get upcoming events
export async function getUpcomingEvents(limit = 10) {
  return db.query.events.findMany({
    where: gte(events.startDate, new Date()),
    orderBy: [desc(events.startDate)],
    limit
  });
}
```

#### **Transaction Patterns:**
```typescript
// Reusable transaction wrapper
export async function withTransaction<T>(
  callback: (tx: any) => Promise<T>
): Promise<T> {
  return db.transaction(async (tx) => {
    try {
      const result = await callback(tx);
      return result;
    } catch (error) {
      // Transaction automatically rolls back on error
      throw error;
    }
  });
}

// Usage:
await withTransaction(async (tx) => {
  await tx.insert(users).values(userData);
  await tx.insert(profiles).values(profileData);
});
```

---

### **5. Type Utilities**

#### **Shared Types (from schema.ts):**
```typescript
import { insertUserSchema, type User, type Post, type Event } from "@shared/schema";
import { z } from "zod";

// Infer types from schemas
type InsertUser = z.infer<typeof insertUserSchema>;
type SelectUser = typeof users.$inferSelect;

// Use in components
function UserProfile({ user }: { user: SelectUser }) {
  return <div>{user.name}</div>;
}
```

#### **API Response Types:**
```typescript
// Standard API response shape
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Usage with React Query
const { data } = useQuery<ApiResponse<User[]>>({
  queryKey: ['/api/users']
});
```

---

## Component Creation Guidelines

### **When to Create a Reusable Component:**

✅ **DO create when:**
- Component used in 3+ places
- Component has clear, focused responsibility
- Component is generic enough for multiple contexts
- Component reduces code duplication significantly

❌ **DON'T create when:**
- Component is highly specific to one feature
- Component is simpler than its abstraction
- Component is used only once
- Over-engineering a simple pattern

---

### **Component Design Checklist:**

```typescript
// GOOD: Reusable, well-documented component
/**
 * LoadingButton - Button with loading state
 * 
 * @param isLoading - Shows spinner when true
 * @param children - Button content
 * @param onClick - Click handler
 * 
 * @example
 * <LoadingButton isLoading={isSubmitting} onClick={handleSubmit}>
 *   Save
 * </LoadingButton>
 */
interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
}

export function LoadingButton({ 
  isLoading, 
  children, 
  disabled,
  ...props 
}: LoadingButtonProps) {
  return (
    <Button disabled={disabled || isLoading} {...props}>
      {isLoading && <Spinner className="mr-2" />}
      {children}
    </Button>
  );
}
```

**Checklist:**
- ✅ Clear JSDoc documentation
- ✅ Usage example in comments
- ✅ TypeScript types for all props
- ✅ Sensible default props
- ✅ Accessible (ARIA labels, keyboard support)
- ✅ Mobile responsive
- ✅ Dark mode support
- ✅ data-testid attributes for testing

---

## Component Organization

### **File Structure:**

```
client/src/components/
├── ui/                      # Shadcn base components
│   ├── button.tsx
│   ├── input.tsx
│   └── ...
├── layout/                  # Layout components
│   ├── MTNavbar.tsx
│   ├── MTSidebar.tsx
│   └── MTFooter.tsx
├── features/                # Feature-specific
│   ├── memory/
│   │   ├── MemoryCard.tsx
│   │   ├── MemoryForm.tsx
│   │   └── MemoryList.tsx
│   ├── events/
│   │   ├── EventCard.tsx
│   │   └── EventCalendar.tsx
│   └── ...
└── shared/                  # Cross-feature shared
    ├── LoadingButton.tsx
    ├── ErrorBoundary.tsx
    └── ImageUpload.tsx
```

---

## Performance Patterns

### **Memoization:**
```typescript
import { memo, useMemo } from 'react';

// Memoize expensive components
export const MemoryCard = memo(function MemoryCard({ memory }: Props) {
  const formattedDate = useMemo(
    () => formatDate(memory.createdAt),
    [memory.createdAt]
  );
  
  return <div>{formattedDate}</div>;
});
```

### **Lazy Loading:**
```typescript
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const VisualEditor = lazy(() => import('@/components/VisualEditor'));

function AdminPage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <VisualEditor />
    </Suspense>
  );
}
```

### **Virtual Scrolling:**
```typescript
// For large lists (1000+ items)
import { useVirtualizer } from '@tanstack/react-virtual';

function LargeMemoryList({ memories }: { memories: Memory[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: memories.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated row height
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => (
        <MemoryCard key={virtualRow.index} memory={memories[virtualRow.index]} />
      ))}
    </div>
  );
}
```

---

## Testing Reusable Components

### **Component Tests:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LoadingButton } from './LoadingButton';

describe('LoadingButton', () => {
  it('shows spinner when loading', () => {
    render(<LoadingButton isLoading>Save</LoadingButton>);
    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner
  });
  
  it('disables button when loading', () => {
    render(<LoadingButton isLoading>Save</LoadingButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
  
  it('calls onClick when not loading', () => {
    const handleClick = jest.fn();
    render(<LoadingButton onClick={handleClick}>Save</LoadingButton>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## Component Library Documentation

### **Storybook (Recommended for MT Platform):**
```typescript
// MemoryCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryCard } from './MemoryCard';

const meta: Meta<typeof MemoryCard> = {
  title: 'Features/Memory/MemoryCard',
  component: MemoryCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MemoryCard>;

export const Default: Story = {
  args: {
    memory: {
      id: 1,
      content: 'My first tango memory!',
      userId: 1,
      createdAt: new Date(),
    }
  }
};

export const WithImage: Story = {
  args: {
    memory: {
      id: 2,
      content: 'Milonga last night',
      imageUrl: 'https://example.com/image.jpg',
      userId: 1,
      createdAt: new Date(),
    }
  }
};
```

---

## Integration with Other ESA Protocols

**Related Protocols:**
- `ESA_CHECK_BEFORE_BUILD.md` - Verify component dependencies before use
- `ESA_PARALLEL_BY_DEFAULT.md` - Create components in parallel when independent
- `ESA_PERFORMANCE_METRICS.md` - Monitor component render times
- `ESA_AGENT_CERTIFICATION.md` - Component creation is part of certification

---

## Migration from Copy-Paste to Reusable

### **Before (BAD):**
```typescript
// LoginPage.tsx
<button className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded">
  Login
</button>

// RegisterPage.tsx
<button className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded">
  Register
</button>

// ProfilePage.tsx
<button className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded">
  Save
</button>
```

### **After (GOOD):**
```typescript
// components/ui/button.tsx
export function Button({ children, ...props }: ButtonProps) {
  return (
    <button className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded" {...props}>
      {children}
    </button>
  );
}

// All pages now use:
import { Button } from "@/components/ui/button";

<Button>Login</Button>
<Button>Register</Button>
<Button>Save</Button>
```

**Benefits:**
- ✅ Single source of truth for styling
- ✅ Easy to update globally
- ✅ Consistent user experience
- ✅ Reduced code duplication

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Component Reuse Rate | Unknown | >80% |
| Average Component Uses | Unknown | >5 |
| Code Duplication | Unknown | <5% |
| Component Documentation Coverage | Unknown | 100% |

---

**Protocol Owner:** UI/UX Division + Layer #9 (UI Framework)  
**Last Updated:** October 19, 2025  
**Review Cycle:** Monthly or when adding major component library
