# Mundo Tango Component Library Guide
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Status:** ✅ Active - Reference for all frontend development

## Overview

This document provides comprehensive guidance on using Mundo Tango's 464+ component library, built on Shadcn UI + Tailwind CSS. It covers component usage, theming, accessibility, and best practices.

**See also:** `docs/MT_COMPONENT_CATALOG.md` for complete component inventory

---

## Component Library Stack

```
┌──────────────────────────────────────────┐
│ MT Custom Components (464+)              │
│ - Community, Admin, Groups, etc.        │
└──────────────────────────────────────────┘
                 ▼
┌──────────────────────────────────────────┐
│ Shadcn UI Base Components (~40)          │
│ - Button, Input, Card, Dialog, etc.     │
└──────────────────────────────────────────┘
                 ▼
┌──────────────────────────────────────────┐
│ Radix UI Primitives (Headless)           │
│ - Accessibility, keyboard nav, ARIA      │
└──────────────────────────────────────────┘
                 ▼
┌──────────────────────────────────────────┐
│ Tailwind CSS (Utility-first styling)     │
│ - MT Ocean theme, responsive, dark mode  │
└──────────────────────────────────────────┘
```

---

## Base UI Components (Shadcn)

### **1. Button Component**

**Location:** `client/src/components/ui/button.tsx`

**Variants:**
```typescript
import { Button } from '@/components/ui/button';

// Primary (default)
<Button>Click me</Button>

// Secondary
<Button variant="secondary">Secondary</Button>

// Ghost (transparent)
<Button variant="ghost">Ghost</Button>

// Destructive (red)
<Button variant="destructive">Delete</Button>

// Link (text only)
<Button variant="link">Learn more</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

**With Icons:**
```typescript
import { Send } from 'lucide-react';

<Button>
  <Send className="mr-2 h-4 w-4" />
  Send Message
</Button>
```

**Loading State:**
```typescript
import { Loader2 } from 'lucide-react';

<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Sending...' : 'Send'}
</Button>
```

**Accessibility:**
```typescript
<Button
  data-testid="button-submit"
  aria-label="Submit form"
  disabled={!isValid}
>
  Submit
</Button>
```

---

### **2. Input Component**

**Location:** `client/src/components/ui/input.tsx`

**Basic Usage:**
```typescript
import { Input } from '@/components/ui/input';

<Input
  type="text"
  placeholder="Enter your name"
  data-testid="input-name"
/>

<Input
  type="email"
  placeholder="email@example.com"
  data-testid="input-email"
/>

<Input
  type="password"
  placeholder="Password"
  data-testid="input-password"
/>
```

**With Form (React Hook Form):**
```typescript
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';

export function LoginForm() {
  const form = useForm();
  
  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="email@example.com"
                data-testid="input-email"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </Form>
  );
}
```

---

### **3. Card Component**

**Location:** `client/src/components/ui/card.tsx`

**Structure:**
```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Post Title</CardTitle>
    <CardDescription>Posted 2 hours ago</CardDescription>
  </CardHeader>
  
  <CardContent>
    <p>Post content goes here...</p>
  </CardContent>
  
  <CardFooter>
    <Button variant="ghost">Like</Button>
    <Button variant="ghost">Comment</Button>
  </CardFooter>
</Card>
```

**MT Ocean Theme (Glassmorphic):**
```typescript
<Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-teal-200 dark:border-teal-700">
  {/* Content */}
</Card>
```

---

### **4. Dialog (Modal)**

**Location:** `client/src/components/ui/dialog.tsx`

**Basic Modal:**
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Create Post</Button>
  </DialogTrigger>
  
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create New Post</DialogTitle>
      <DialogDescription>
        Share your tango experiences with the community
      </DialogDescription>
    </DialogHeader>
    
    {/* Form content */}
    <PostForm />
  </DialogContent>
</Dialog>
```

**Controlled Modal:**
```typescript
const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    {/* Content */}
    <Button onClick={() => setOpen(false)}>Close</Button>
  </DialogContent>
</Dialog>
```

---

### **5. Sheet (Side Panel)**

**Location:** `client/src/components/ui/sheet.tsx`

**Usage:**
```typescript
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

<Sheet>
  <SheetTrigger asChild>
    <Button>Open Settings</Button>
  </SheetTrigger>
  
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Settings</SheetTitle>
    </SheetHeader>
    
    {/* Settings content */}
  </SheetContent>
</Sheet>
```

**Sides:** `left | right | top | bottom`

---

### **6. Toast (Notifications)**

**Location:** `client/src/components/ui/toast.tsx`

**Usage:**
```typescript
import { useToast } from '@/hooks/use-toast';

export function MyComponent() {
  const { toast } = useToast();
  
  const handleSuccess = () => {
    toast({
      title: 'Success',
      description: 'Post created successfully',
    });
  };
  
  const handleError = () => {
    toast({
      title: 'Error',
      description: 'Failed to create post',
      variant: 'destructive',
    });
  };
  
  return (
    <Button onClick={handleSuccess}>Create Post</Button>
  );
}
```

**Variants:**
- `default` - Neutral (blue)
- `destructive` - Error (red)

---

### **7. Select Dropdown**

**Location:** `client/src/components/ui/select.tsx`

**Usage:**
```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select privacy" />
  </SelectTrigger>
  
  <SelectContent>
    <SelectItem value="public">Public</SelectItem>
    <SelectItem value="friends">Friends Only</SelectItem>
    <SelectItem value="private">Private</SelectItem>
  </SelectContent>
</Select>
```

**With Form:**
```typescript
<FormField
  control={form.control}
  name="privacy"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Privacy</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select privacy" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="public">Public</SelectItem>
          <SelectItem value="friends">Friends Only</SelectItem>
          <SelectItem value="private">Private</SelectItem>
        </SelectContent>
      </Select>
    </FormItem>
  )}
/>
```

---

## Theming (MT Ocean)

### **Color System**

**Primary Colors (Teal/Cyan):**
```css
/* index.css */
:root {
  --primary: 186 94% 50%; /* Teal */
  --primary-foreground: 0 0% 100%;
  
  --secondary: 188 94% 60%; /* Cyan */
  --secondary-foreground: 0 0% 100%;
}

.dark {
  --primary: 186 94% 40%;
  --primary-foreground: 0 0% 100%;
}
```

**Usage:**
```typescript
<Button className="bg-primary text-primary-foreground">
  Primary Button
</Button>

<Card className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10">
  Gradient Card
</Card>
```

---

### **Glassmorphic Design**

**Pattern:**
```typescript
<Card className="
  bg-white/80 dark:bg-gray-800/80
  backdrop-blur-lg
  border border-teal-200 dark:border-teal-700
  shadow-lg shadow-teal-500/20
">
  {/* Content */}
</Card>
```

**Components:**
- Semi-transparent backgrounds (`bg-white/80`)
- Backdrop blur (`backdrop-blur-lg`)
- Colored borders (`border-teal-200`)
- Subtle shadows (`shadow-teal-500/20`)

---

### **Dark Mode**

**Toggle Dark Mode:**
```typescript
// contexts/ThemeContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContext {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContext | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) setTheme(saved);
  }, []);
  
  useEffect(() => {
    // Apply to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

**Usage:**
```typescript
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button onClick={toggleTheme}>
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </Button>
  );
}
```

---

## Accessibility (a11y)

### **1. Keyboard Navigation**

**All interactive elements must be keyboard accessible:**

```typescript
// ✅ GOOD: Button is naturally keyboard accessible
<Button onClick={handleClick}>
  Click me
</Button>

// ❌ BAD: Div onClick is not keyboard accessible
<div onClick={handleClick}>
  Click me
</div>

// ✅ FIX: Add role and keyboard handlers
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

### **2. ARIA Labels**

```typescript
// Icon-only buttons need aria-label
<Button aria-label="Close modal" onClick={onClose}>
  <X className="h-4 w-4" />
</Button>

// Form inputs need labels
<FormItem>
  <FormLabel htmlFor="email">Email</FormLabel>
  <Input
    id="email"
    type="email"
    aria-describedby="email-error"
  />
  <FormMessage id="email-error">Invalid email</FormMessage>
</FormItem>
```

---

### **3. Focus Indicators**

```typescript
// Ensure visible focus ring
<Button className="focus:ring-2 focus:ring-primary focus:ring-offset-2">
  Click me
</Button>
```

---

### **4. Screen Reader Support**

```typescript
// Announce dynamic content changes
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <Button onClick={() => setCount(c => c + 1)}>
        Increment
      </Button>
      
      <p
        aria-live="polite"
        aria-atomic="true"
      >
        Count: {count}
      </p>
    </div>
  );
}
```

---

## Responsive Design

### **Tailwind Breakpoints**

```
sm:  640px  (tablet)
md:  768px  (small desktop)
lg:  1024px (desktop)
xl:  1280px (large desktop)
2xl: 1536px (extra large)
```

**Mobile-First Pattern:**
```typescript
<Card className="
  w-full           /* Mobile: full width */
  sm:w-[500px]     /* Tablet: fixed 500px */
  md:w-[600px]     /* Desktop: fixed 600px */
  p-4              /* Mobile: padding 16px */
  md:p-6           /* Desktop: padding 24px */
">
  {/* Content */}
</Card>
```

**Grid Layouts:**
```typescript
<div className="
  grid
  grid-cols-1       /* Mobile: 1 column */
  sm:grid-cols-2    /* Tablet: 2 columns */
  lg:grid-cols-3    /* Desktop: 3 columns */
  gap-4
">
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</div>
```

---

## Icon System (Lucide React)

**Installation:**
```bash
npm install lucide-react
```

**Usage:**
```typescript
import { Heart, Send, Trash2, Settings, User } from 'lucide-react';

<Button>
  <Heart className="mr-2 h-4 w-4" />
  Like
</Button>

<Button variant="destructive">
  <Trash2 className="mr-2 h-4 w-4" />
  Delete
</Button>
```

**Icon Sizes:**
```typescript
<User className="h-4 w-4" />  // Small (16px)
<User className="h-5 w-5" />  // Medium (20px)
<User className="h-6 w-6" />  // Large (24px)
```

**Animated Icons:**
```typescript
import { Loader2 } from 'lucide-react';

<Loader2 className="h-4 w-4 animate-spin" />
```

---

## Form Patterns

### **Complete Form Example**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await login(data);
      toast({ title: 'Logged in successfully' });
    } catch (error) {
      toast({ 
        title: 'Login failed', 
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  data-testid="input-email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  data-testid="input-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button
          type="submit"
          data-testid="button-submit"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </Form>
  );
}
```

---

## Loading States

### **Skeleton Loader**

```typescript
import { Skeleton } from '@/components/ui/skeleton';

export function PostCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  );
}

// Usage
export function PostList() {
  const { data: posts, isLoading } = useQuery({ queryKey: ['/api/posts'] });
  
  if (isLoading) {
    return (
      <>
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </>
    );
  }
  
  return posts.map(post => <PostCard key={post.id} post={post} />);
}
```

---

## Component Testing

### **Testing with React Testing Library**

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## Performance Optimization

### **1. Code Splitting**

```typescript
// Lazy load heavy components
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

export function App() {
  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <AdminDashboard />
    </Suspense>
  );
}
```

---

### **2. Memoize Expensive Components**

```typescript
import { memo } from 'react';

export const PostCard = memo(function PostCard({ post }: PostCardProps) {
  return (
    <Card>
      {/* Complex rendering logic */}
    </Card>
  );
});
```

---

## Integration with ESA Protocols

**REUSABLE_COMPONENTS:**
- All components cataloged in MT_COMPONENT_CATALOG.md
- Follow component standards
- Reuse before creating new

**CHECK_BEFORE_BUILD:**
- Verify components compile
- Test accessibility with axe
- Check responsive design

**PERFORMANCE_METRICS:**
- Component render time <16ms
- Bundle size monitored

---

**Document Owner:** UI/UX Division (#5) + Component Library Team  
**Review Cycle:** Quarterly or when components added  
**Last Updated:** October 19, 2025
