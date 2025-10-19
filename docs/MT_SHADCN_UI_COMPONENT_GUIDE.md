# Mundo Tango Shadcn UI Component Patterns Guide
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**UI Library:** Shadcn UI + Tailwind CSS  
**References:** 1,588 codebase instances

## Overview

Mundo Tango uses **Shadcn UI** (unstyled, accessible components) styled with **Tailwind CSS** and the custom **MT Ocean Theme** (teal/cyan gradients, glassmorphic design). This guide covers production patterns across 467 components and 97 pages.

**Key Features:**
- ✅ Copy-paste components (no npm package bloat)
- ✅ Full dark mode support
- ✅ Accessible (ARIA labels, keyboard navigation)
- ✅ Form integration with React Hook Form + Zod
- ✅ Customizable with Tailwind

---

## Theme Configuration

### **MT Ocean Theme Colors** (`client/src/index.css`)

```css
:root {
  /* Primary: Teal/Cyan gradient */
  --primary: 180 80% 50%;        /* Teal */
  --primary-foreground: 0 0% 100%;
  
  /* Accent: Cyan highlights */
  --accent: 185 85% 55%;
  --accent-foreground: 0 0% 100%;
  
  /* Background: Glassmorphic */
  --background: 210 20% 98%;
  --foreground: 210 20% 10%;
  
  /* Muted: Subtle backgrounds */
  --muted: 210 30% 96%;
  --muted-foreground: 210 10% 40%;
  
  /* Card: Glassmorphic cards */
  --card: 0 0% 100%;
  --card-foreground: 210 20% 10%;
  
  /* Border */
  --border: 210 30% 88%;
  --input: 210 30% 88%;
  --ring: 180 80% 50%;
}

.dark {
  --primary: 180 75% 45%;
  --primary-foreground: 0 0% 100%;
  
  --background: 210 20% 10%;
  --foreground: 210 20% 98%;
  
  --muted: 210 20% 15%;
  --muted-foreground: 210 10% 60%;
  
  --card: 210 20% 12%;
  --card-foreground: 210 20% 98%;
  
  --border: 210 20% 20%;
  --input: 210 20% 20%;
}
```

---

## Core Components

### **1. Button** (`@/components/ui/button.tsx`)

```typescript
import { Button } from '@/components/ui/button';

// Variants
<Button variant="default">Primary Action</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Subtle Action</Button>
<Button variant="link">Link Style</Button>

// Sizes
<Button size="default">Normal</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><PlusIcon /></Button>

// States
<Button disabled>Disabled</Button>
<Button loading>Processing...</Button>

// With Icons (Lucide React)
import { Send } from 'lucide-react';

<Button>
  <Send className="mr-2 h-4 w-4" />
  Send Message
</Button>

// Test IDs (REQUIRED)
<Button data-testid="button-submit">Submit</Button>
<Button data-testid="button-delete">Delete</Button>
```

---

### **2. Form Components** (`@/components/ui/form.tsx`)

**Pattern:** React Hook Form + Zod + Shadcn Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { insertUserSchema } from '@shared/schema';

// Extend schema with client-side validation
const formSchema = insertUserSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

function UserRegistrationForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    // API call
    const res = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: data,
    });
    toast.success('Account created!');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="John Doe" 
                  {...field}
                  data-testid="input-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="john@example.com" 
                  {...field}
                  data-testid="input-email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={form.formState.isSubmitting}
          data-testid="button-submit"
        >
          {form.formState.isSubmitting ? 'Creating...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}
```

**Form Best Practices:**
- ✅ Always use `zodResolver` for validation
- ✅ Provide `defaultValues` (controlled form)
- ✅ Show loading state (`isSubmitting`)
- ✅ Display errors with `<FormMessage />`
- ✅ Add `data-testid` to all inputs/buttons

---

### **3. Dialog (Modal)** (`@/components/ui/dialog.tsx`)

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

function DeletePostDialog({ postId }: { postId: number }) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await apiRequest(`/api/posts/${postId}`, { method: 'DELETE' });
    toast.success('Post deleted');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" data-testid="button-delete-post">
          Delete
        </Button>
      </DialogTrigger>
      
      <DialogContent data-testid="dialog-delete-post">
        <DialogHeader>
          <DialogTitle>Delete Post?</DialogTitle>
        </DialogHeader>
        
        <p>This action cannot be undone.</p>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            data-testid="button-confirm-delete"
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### **4. Select (Dropdown)** (`@/components/ui/select.tsx`)

```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function CitySelector() {
  const [city, setCity] = useState('');

  return (
    <Select value={city} onValueChange={setCity}>
      <SelectTrigger data-testid="select-city">
        <SelectValue placeholder="Select a city" />
      </SelectTrigger>
      
      <SelectContent>
        <SelectItem value="buenos-aires">Buenos Aires</SelectItem>
        <SelectItem value="montevideo">Montevideo</SelectItem>
        <SelectItem value="paris">Paris</SelectItem>
        <SelectItem value="berlin">Berlin</SelectItem>
      </SelectContent>
    </Select>
  );
}

// Within Form
<FormField
  control={form.control}
  name="city"
  render={({ field }) => (
    <FormItem>
      <FormLabel>City</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger data-testid="select-city">
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="buenos-aires">Buenos Aires</SelectItem>
          <SelectItem value="montevideo">Montevideo</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

**⚠️ CRITICAL:** `<SelectItem>` requires `value` prop or throws error!

---

### **5. Toast Notifications** (`@/components/ui/toast.tsx`)

```typescript
import { useToast } from '@/hooks/use-toast';

function SomeComponent() {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: 'Success!',
      description: 'Your post has been created.',
    });
  };

  const handleError = () => {
    toast({
      title: 'Error',
      description: 'Failed to save. Please try again.',
      variant: 'destructive',
    });
  };

  const handleInfo = () => {
    toast({
      title: 'New notification',
      description: 'You have 3 unread messages.',
    });
  };

  return (
    <div>
      <Button onClick={handleSuccess}>Show Success</Button>
      <Button onClick={handleError}>Show Error</Button>
    </div>
  );
}
```

**Alternative:** Sonner toast (higher performance)

```typescript
import { toast } from 'sonner';

toast.success('Success message');
toast.error('Error message');
toast.info('Info message');
toast.warning('Warning message');
toast.loading('Loading...', { id: 'upload' });
toast.success('Done!', { id: 'upload' }); // Replace loading toast
```

---

### **6. Card** (`@/components/ui/card.tsx`)

```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function PostCard({ post }: { post: Post }) {
  return (
    <Card 
      className="hover:shadow-lg transition-shadow"
      data-testid={`card-post-${post.id}`}
    >
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
        <CardDescription>
          By {post.user.name} • {formatDate(post.createdAt)}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground">{post.content}</p>
      </CardContent>
    </Card>
  );
}
```

**Glassmorphic Card (MT Ocean Theme):**

```typescript
<Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-white/20">
  {/* Content */}
</Card>
```

---

## Dark Mode Implementation

### **Theme Provider** (`client/src/components/ThemeProvider.tsx`)

```typescript
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
} | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
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

**Theme Toggle Button:**

```typescript
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      data-testid="button-theme-toggle"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
}
```

---

## Accessibility Patterns

### **Keyboard Navigation**

```typescript
import { Dialog, DialogContent } from '@/components/ui/dialog';

function AccessibleDialog() {
  return (
    <Dialog>
      {/* Automatically handles: */}
      {/* - Escape key to close */}
      {/* - Tab trap inside dialog */}
      {/* - Focus management */}
      {/* - ARIA attributes */}
      <DialogContent>
        <h2 id="dialog-title">Accessible Dialog</h2>
        <p id="dialog-description">Content here</p>
      </DialogContent>
    </Dialog>
  );
}
```

### **ARIA Labels**

```typescript
<Button 
  aria-label="Close menu"
  data-testid="button-close-menu"
>
  <X className="h-4 w-4" />
</Button>

<Input 
  aria-label="Search posts"
  aria-describedby="search-help"
  data-testid="input-search"
/>
<span id="search-help" className="text-sm text-muted-foreground">
  Search by title, content, or author
</span>
```

---

## Common Patterns

### **Skeleton Loading States**

```typescript
import { Skeleton } from '@/components/ui/skeleton';

function PostListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  );
}

function PostList() {
  const { data, isLoading } = useQuery({ queryKey: ['/api/posts'] });

  if (isLoading) return <PostListSkeleton />;

  return (
    <div>
      {data?.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
```

---

### **Responsive Design**

```typescript
// Mobile-first approach
<div className="
  grid 
  grid-cols-1       /* Mobile: 1 column */
  md:grid-cols-2    /* Tablet: 2 columns */
  lg:grid-cols-3    /* Desktop: 3 columns */
  gap-4
">
  {posts.map(post => <PostCard key={post.id} post={post} />)}
</div>

// Hide on mobile, show on desktop
<div className="hidden md:block">
  Sidebar content
</div>

// Show on mobile, hide on desktop
<div className="block md:hidden">
  Mobile menu
</div>
```

---

### **Infinite Scroll List**

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

function InfinitePostList() {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['/api/posts'],
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage]);

  return (
    <div>
      {data?.pages.map(page =>
        page.data.map(post => (
          <PostCard key={post.id} post={post} />
        ))
      )}
      
      <div ref={ref}>
        {isLoading && <Skeleton />}
      </div>
    </div>
  );
}
```

---

## Testing with Shadcn Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('should handle click', () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} data-testid="button-test">
        Click me
      </Button>
    );

    const button = screen.getByTestId('button-test');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled', () => {
    render(
      <Button disabled data-testid="button-disabled">
        Disabled
      </Button>
    );

    const button = screen.getByTestId('button-disabled');
    expect(button).toBeDisabled();
  });
});
```

---

## Performance Optimization

### **Lazy Load Components**

```typescript
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

---

### **Memoize Expensive Components**

```typescript
import { memo } from 'react';

export const PostCard = memo(function PostCard({ post }: { post: Post }) {
  return (
    <Card>
      {/* Component content */}
    </Card>
  );
});
```

---

## Next Steps

1. Read `docs/MT_COMPONENT_LIBRARY_GUIDE.md` (existing) for full component catalog
2. See `docs/MT_CODING_STANDARDS.md` for React best practices
3. Review `client/src/components/ui/*` for all Shadcn components

**Related Files:**
- `client/src/components/ui/*` - All Shadcn UI components
- `client/src/index.css` - Theme configuration
- `client/src/components/ThemeProvider.tsx` - Dark mode implementation
