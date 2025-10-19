# Mundo Tango Coding Standards
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Status:** ✅ Mandatory for all code contributions

## Overview

This document defines the coding standards and best practices for the Mundo Tango platform. All code must adhere to these standards to ensure consistency, maintainability, and quality across the 97-page application with 464+ components.

---

## Core Principles

### **1. Readability Over Cleverness**

```typescript
// ❌ BAD: Clever but confusing
const r = u.map(x => ({ ...x, a: x.p ? 1 : 0 }));

// ✅ GOOD: Clear and explicit
const usersWithActiveStatus = users.map(user => ({
  ...user,
  isActive: user.isPremium ? 1 : 0
}));
```

**Principle:** Code is read 10x more than it's written. Optimize for readability.

---

### **2. Type Safety First**

```typescript
// ❌ BAD: Any type (defeats TypeScript purpose)
function processData(data: any): any {
  return data.value;
}

// ✅ GOOD: Explicit types
interface UserData {
  id: number;
  email: string;
  value: string;
}

function processData(data: UserData): string {
  return data.value;
}
```

**Principle:** Use `any` only as a last resort. TypeScript types prevent 80% of bugs.

---

### **3. Explicit Over Implicit**

```typescript
// ❌ BAD: Implicit return type
function getUser(id) {
  return db.query.users.findFirst({ where: eq(users.id, id) });
}

// ✅ GOOD: Explicit parameters and return type
async function getUser(id: number): Promise<User | null> {
  return await db.query.users.findFirst({
    where: eq(users.id, id)
  });
}
```

---

## TypeScript Standards

### **1. Type Definitions**

**Always define interfaces for:**
- Component props
- Function parameters (>2 args)
- API request/response bodies
- Database models

**Example:**
```typescript
// Component props
interface PostCardProps {
  post: Post;
  onLike: (postId: number) => void;
  showComments?: boolean;
}

export function PostCard({ post, onLike, showComments = true }: PostCardProps) {
  // Component implementation
}
```

---

### **2. Use Type Inference Where Appropriate**

```typescript
// ✅ GOOD: Let TypeScript infer simple types
const count = 5; // Inferred as number
const message = 'Hello'; // Inferred as string

// ✅ GOOD: Explicit for complex types
const user: User = await fetchUser();

// ❌ BAD: Redundant type annotations
const count: number = 5; // Unnecessary
```

---

### **3. Avoid Type Assertions (`as`)**

```typescript
// ❌ BAD: Type assertion bypasses safety
const user = data as User; // Unsafe

// ✅ GOOD: Validate and narrow type
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'email' in data
  );
}

if (isUser(data)) {
  const user = data; // Type-safe
}
```

**When `as` is acceptable:**
- DOM elements: `as HTMLInputElement`
- Known safe transformations after validation

---

### **4. Null Safety**

```typescript
// ❌ BAD: Potential null reference
function getUserName(user: User | null) {
  return user.name; // Crash if null!
}

// ✅ GOOD: Explicit null handling
function getUserName(user: User | null): string {
  return user?.name ?? 'Anonymous';
}

// ✅ GOOD: Early return
function getUserName(user: User | null): string {
  if (!user) return 'Anonymous';
  return user.name;
}
```

---

## Naming Conventions

### **1. Variables and Functions**

```typescript
// camelCase for variables and functions
const userCount = 10;
const isAuthenticated = true;

function calculateTotalPrice() {
  // Implementation
}

async function fetchUserData() {
  // Implementation
}
```

---

### **2. Components and Classes**

```typescript
// PascalCase for components and classes
export function UserProfile() {
  // Component
}

class DatabaseConnection {
  // Class
}
```

---

### **3. Constants**

```typescript
// SCREAMING_SNAKE_CASE for true constants
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';

// camelCase for configuration objects
const config = {
  maxRetries: 3,
  timeout: 5000,
};
```

---

### **4. Private Members**

```typescript
// Prefix with underscore (convention, not enforced)
class UserService {
  private _cache: Map<number, User> = new Map();
  
  private _invalidateCache() {
    this._cache.clear();
  }
  
  public getUser(id: number) {
    return this._cache.get(id);
  }
}
```

---

### **5. Boolean Prefixes**

```typescript
// Use is/has/should/can prefixes
const isLoading = true;
const hasPermission = false;
const shouldRender = true;
const canEdit = false;
```

---

## File Organization

### **1. Import Order**

```typescript
// 1. External packages (React, third-party)
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal modules (shared, lib)
import { User } from '@shared/schema';
import { apiRequest } from '@lib/queryClient';

// 3. Components
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/PostCard';

// 4. Relative imports
import { formatDate } from '../utils/date';
import styles from './HomePage.module.css';
```

---

### **2. Component Structure**

```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Type definitions
interface HomePageProps {
  userId: number;
}

// 3. Helper functions (outside component)
function formatUserName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

// 4. Component
export function HomePage({ userId }: HomePageProps) {
  // 4a. Hooks (useState, useEffect, custom hooks)
  const [count, setCount] = useState(0);
  
  // 4b. Derived state / computations
  const doubleCount = count * 2;
  
  // 4c. Event handlers
  const handleClick = () => {
    setCount(prev => prev + 1);
  };
  
  // 4d. Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 4e. Render
  return (
    <div>
      <Button onClick={handleClick}>Count: {count}</Button>
    </div>
  );
}
```

---

## Error Handling

### **1. Try-Catch for Async Operations**

```typescript
// ❌ BAD: Unhandled promise rejection
async function fetchUser(id: number) {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// ✅ GOOD: Explicit error handling
async function fetchUser(id: number): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user:', error);
    // Log to error tracking (Sentry)
    logError(error, { userId: id });
    return null;
  }
}
```

---

### **2. Error Boundaries (React)**

```typescript
// Wrap error-prone components
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <HomePage />
    </ErrorBoundary>
  );
}
```

---

### **3. User-Friendly Error Messages**

```typescript
// ❌ BAD: Technical error shown to user
throw new Error('Failed to execute query: SELECT * FROM users WHERE id = ?');

// ✅ GOOD: User-friendly message
throw new Error('Unable to load user profile. Please try again.');

// ✅ BETTER: Log technical details, show friendly message
try {
  await db.query.users.findFirst({ where: eq(users.id, userId) });
} catch (error) {
  console.error('Database query failed:', error);
  toast.error('Unable to load user profile. Please try again.');
}
```

---

## React Best Practices

### **1. Functional Components Only**

```typescript
// ✅ GOOD: Functional component
export function UserProfile({ user }: { user: User }) {
  return <div>{user.name}</div>;
}

// ❌ BAD: Class component (avoid unless legacy)
class UserProfile extends React.Component {
  render() {
    return <div>{this.props.user.name}</div>;
  }
}
```

---

### **2. Hooks Rules**

```typescript
// ✅ GOOD: Hooks at top level
export function HomePage() {
  const [count, setCount] = useState(0);
  const user = useUser();
  
  // Conditional rendering after hooks
  if (!user) return <Loading />;
  
  return <div>{user.name}</div>;
}

// ❌ BAD: Conditional hooks
export function HomePage() {
  const user = useUser();
  
  if (!user) {
    return <Loading />;
  }
  
  // Hook after conditional return - BREAKS RULES!
  const [count, setCount] = useState(0);
  
  return <div>{user.name}</div>;
}
```

---

### **3. Avoid Inline Functions in JSX**

```typescript
// ❌ BAD: Creates new function on every render
<Button onClick={() => handleClick(id)}>Click</Button>

// ✅ GOOD: useCallback for stable reference
const handleClickWithId = useCallback(() => {
  handleClick(id);
}, [id, handleClick]);

<Button onClick={handleClickWithId}>Click</Button>

// ✅ BETTER: If just passing args, use arrow in handler
<Button onClick={() => handleClick(id)}>Click</Button>
// ^ Acceptable for simple cases
```

---

### **4. Keys in Lists**

```typescript
// ❌ BAD: Index as key
posts.map((post, index) => (
  <PostCard key={index} post={post} />
));

// ✅ GOOD: Unique ID as key
posts.map(post => (
  <PostCard key={post.id} post={post} />
));
```

---

## Performance Optimization

### **1. Memoization**

```typescript
// Use React.memo for components that re-render often
export const PostCard = React.memo(function PostCard({ post }: PostCardProps) {
  return <div>{post.content}</div>;
});

// Use useMemo for expensive calculations
const sortedPosts = useMemo(
  () => posts.sort((a, b) => b.createdAt - a.createdAt),
  [posts]
);

// Use useCallback for stable function references
const handleLike = useCallback((postId: number) => {
  // Like logic
}, [/* dependencies */]);
```

**When NOT to use:**
- Simple components that render quickly (<16ms)
- Data that changes frequently anyway
- Over-memoization can hurt performance

---

### **2. Lazy Loading**

```typescript
// Code splitting for routes
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

export function App() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminDashboard />
    </Suspense>
  );
}
```

---

## Security Standards

### **1. Never Trust User Input**

```typescript
// ❌ BAD: Direct use of user input
const query = `SELECT * FROM users WHERE email = '${userInput}'`; // SQL injection!

// ✅ GOOD: Parameterized queries
const user = await db.query.users.findFirst({
  where: eq(users.email, userInput) // Drizzle escapes automatically
});
```

---

### **2. Sanitize HTML**

```typescript
// ❌ BAD: Rendering user content as HTML
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ GOOD: Use library to sanitize
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />

// ✅ BETTER: Use markdown parser
import ReactMarkdown from 'react-markdown';

<ReactMarkdown>{userContent}</ReactMarkdown>
```

---

### **3. Secrets Management**

```typescript
// ❌ BAD: Hardcoded secrets
const apiKey = 'sk-1234567890abcdef';

// ✅ GOOD: Environment variables
const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error('Missing ANTHROPIC_API_KEY');
}
```

---

## Testing Standards

### **1. Unit Tests**

```typescript
// Test file naming: <ComponentName>.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

### **2. Test Coverage Targets**

- **Critical paths:** 100% coverage (auth, payments, data loss)
- **Business logic:** 80% coverage (features, workflows)
- **UI components:** 60% coverage (rendering, interactions)
- **Utilities:** 90% coverage (pure functions)

---

## Code Review Checklist

**Before requesting review:**
- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] Linting passes (no warnings)
- [ ] Type errors resolved
- [ ] Added `data-testid` attributes
- [ ] Updated documentation if needed
- [ ] Followed naming conventions
- [ ] No console.log() left in code
- [ ] Error handling added
- [ ] Performance considered (no obvious bottlenecks)

**Reviewing code:**
- [ ] Logic is correct
- [ ] Edge cases handled
- [ ] Code is readable
- [ ] No security vulnerabilities
- [ ] Tests are meaningful
- [ ] Documentation is clear

---

## Anti-Patterns to Avoid

### **1. Magic Numbers**

```typescript
// ❌ BAD
if (user.age > 18) {
  allowAccess();
}

// ✅ GOOD
const MINIMUM_AGE = 18;

if (user.age > MINIMUM_AGE) {
  allowAccess();
}
```

---

### **2. Deep Nesting**

```typescript
// ❌ BAD
if (user) {
  if (user.isPremium) {
    if (user.hasAccess) {
      if (feature.enabled) {
        // Do something
      }
    }
  }
}

// ✅ GOOD: Early returns
if (!user) return;
if (!user.isPremium) return;
if (!user.hasAccess) return;
if (!feature.enabled) return;

// Do something
```

---

### **3. God Objects/Functions**

```typescript
// ❌ BAD: 500-line function that does everything
function processUser(user) {
  // Validate
  // Update database
  // Send email
  // Log analytics
  // Update cache
  // etc...
}

// ✅ GOOD: Single responsibility
function validateUser(user) { /* ... */ }
function updateUserInDB(user) { /* ... */ }
function sendWelcomeEmail(user) { /* ... */ }
function logUserEvent(user) { /* ... */ }
function invalidateUserCache(user) { /* ... */ }

// Compose
async function processUser(user) {
  validateUser(user);
  await updateUserInDB(user);
  await sendWelcomeEmail(user);
  logUserEvent(user);
  invalidateUserCache(user);
}
```

---

## Accessibility (a11y)

### **1. Semantic HTML**

```tsx
// ❌ BAD
<div onClick={handleClick}>Submit</div>

// ✅ GOOD
<button onClick={handleClick}>Submit</button>
```

---

### **2. ARIA Labels**

```tsx
// ✅ All interactive elements need accessible names
<button aria-label="Close modal" onClick={onClose}>
  <X className="icon" />
</button>

<input
  type="text"
  aria-label="Search posts"
  placeholder="Search..."
/>
```

---

### **3. Keyboard Navigation**

```tsx
// Ensure all interactive elements are keyboard accessible
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click me
</div>
```

---

## Comments and Documentation

### **1. When to Comment**

```typescript
// ❌ BAD: Obvious comments
// Increment count by 1
count++;

// ✅ GOOD: Explain WHY, not WHAT
// Using setTimeout instead of setInterval to prevent
// overlapping executions if API call takes >5s
setTimeout(fetchData, 5000);
```

---

### **2. JSDoc for Public APIs**

```typescript
/**
 * Fetches user data from the database by ID
 * 
 * @param userId - The unique user identifier
 * @returns User object or null if not found
 * @throws {DatabaseError} If database connection fails
 * 
 * @example
 * const user = await getUser(123);
 * if (user) {
 *   console.log(user.email);
 * }
 */
export async function getUser(userId: number): Promise<User | null> {
  // Implementation
}
```

---

## Integration with ESA Protocols

**CHECK_BEFORE_BUILD:**
- Run linter before committing
- Verify TypeScript compilation
- Check test coverage

**REUSABLE_COMPONENTS:**
- Follow component standards
- Add to MT_COMPONENT_CATALOG.md
- Document usage examples

**AGENT_CERTIFICATION:**
- Level 2: Must demonstrate coding standards knowledge
- Level 3: Must enforce standards in code reviews
- Level 4: Can propose updates to standards

---

**Document Owner:** All Developers  
**Review Cycle:** Quarterly  
**Last Updated:** October 19, 2025
