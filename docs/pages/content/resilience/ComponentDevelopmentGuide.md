# Resilient Component Development Guide
*(ESA LIFE CEO 61×21 Framework)*

## 🎯 Purpose

This guide provides step-by-step instructions for building **bulletproof components** that never crash, always show meaningful UI, and gracefully handle all error conditions.

## 📝 Component Template

```typescript
// MyComponent.tsx - Resilient Component Template
import { useState, useEffect, useMemo } from 'react';
import { withResilience } from '@/components/resilient/ResilientBoundary';
import { useResilientQuery } from '@/hooks/useResilientQuery';
import { safe, guards, safeArray } from '@shared/resilience/guards';
import { z } from 'zod';

// 1. Define your data schema
const MyDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    value: z.number()
  }))
});

type MyData = z.infer<typeof MyDataSchema>;

// 2. Core component (without error boundary)
function MyComponentCore() {
  // 3. Use resilient data fetching
  const { 
    data, 
    isLoading, 
    isOffline, 
    isDegraded,
    isError 
  } = useResilientQuery({
    endpoint: '/api/my-data',
    schema: MyDataSchema,
    fallback: { id: '', title: 'Loading...', items: [] },
    cacheKey: 'my-data-cache'
  });
  
  // 4. Safe data extraction with validation
  const items = useMemo(() => {
    return safeArray.filter(
      data?.items,
      (item) => item && item.id && item.name,
      []
    );
  }, [data]);
  
  const title = safe.string(data?.title, 'Untitled');
  
  // 5. Handle all UI states
  if (isLoading) {
    return <MyComponentSkeleton />;
  }
  
  if (isOffline && !data) {
    return <OfflineState />;
  }
  
  if (isDegraded) {
    return <DegradedModeUI data={data} readonly />;
  }
  
  if (isError && !data) {
    return <ErrorState />;
  }
  
  if (!items.length) {
    return <EmptyState />;
  }
  
  // 6. Main UI with defensive rendering
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="grid gap-4">
        {items.map((item) => (
          <ItemCard 
            key={safe.property(item, 'id', Math.random())}
            item={item}
          />
        ))}
      </div>
    </div>
  );
}

// 7. Export with error boundary
export default withResilience(
  MyComponentCore,
  'MyComponent',
  {
    fallback: <MinimalFallbackUI />,
    maxRetries: 3,
    showError: process.env.NODE_ENV === 'development'
  }
);
```

## ✅ Required UI States

Every component **MUST** implement these states:

### 1. Loading State
```typescript
function MyComponentSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-4" />
      <div className="h-32 bg-gray-200 rounded" />
    </div>
  );
}
```

### 2. Error State
```typescript
function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="text-center p-8">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold">Something went wrong</h3>
      <p className="text-gray-600 mt-2">We couldn't load this content</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 btn-primary">
          Try Again
        </button>
      )}
    </div>
  );
}
```

### 3. Empty State
```typescript
function EmptyState() {
  return (
    <div className="text-center p-12">
      <InboxIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold">No items found</h3>
      <p className="text-gray-600 mt-2">Start by adding your first item</p>
    </div>
  );
}
```

### 4. Offline State
```typescript
function OfflineState() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <WifiOff className="w-5 h-5 text-yellow-600 inline mr-2" />
      <span className="text-yellow-800">
        You're offline. Some features may be limited.
      </span>
    </div>
  );
}
```

### 5. Degraded State
```typescript
function DegradedModeUI({ data, readonly }: Props) {
  return (
    <>
      <Banner type="warning">
        Running in limited mode. Some features unavailable.
      </Banner>
      <div className="opacity-90">
        {/* Render with limited functionality */}
      </div>
    </>
  );
}
```

## 🛡️ Defensive Programming Patterns

### Pattern 1: Safe Property Access
```typescript
// ❌ Dangerous - Can crash
const userName = user.profile.name;

// ✅ Safe - Never crashes
const userName = safe.property(user, 'profile.name', 'Unknown User');
```

### Pattern 2: Safe Array Operations
```typescript
// ❌ Dangerous - Can crash on null
items.map(item => <Item key={item.id} />)

// ✅ Safe - Handles null/undefined
safeArray.map(items, item => <Item key={item?.id || Math.random()} />)
```

### Pattern 3: Safe URL Processing
```typescript
// ❌ Dangerous - Can crash on invalid URL
const videoId = url.match(/youtube\.com\/watch\?v=([^&]+)/)[1];

// ✅ Safe - Returns null on failure
const videoId = safeUrl.extractYouTubeId(url);
```

### Pattern 4: Conditional Rendering with Guards
```typescript
// ❌ Verbose and error-prone
{data && data.items && data.items.length > 0 && (
  <ItemList items={data.items} />
)}

// ✅ Clean and safe
{guards.isArray(data?.items) && data.items.length > 0 && (
  <ItemList items={data.items} />
)}
```

## 📊 Data Validation Schemas

### Creating Flexible Schemas
```typescript
// Handle multiple API response formats
const FlexibleResponseSchema = z.union([
  // Format 1: { data: [...] }
  z.object({ data: z.array(ItemSchema) }),
  
  // Format 2: { items: [...] }
  z.object({ items: z.array(ItemSchema) }),
  
  // Format 3: Direct array
  z.array(ItemSchema)
]);

// Transform to consistent format
function normalizeResponse(data: unknown) {
  const parsed = FlexibleResponseSchema.parse(data);
  
  if (Array.isArray(parsed)) return parsed;
  if ('data' in parsed) return parsed.data;
  if ('items' in parsed) return parsed.items;
  return [];
}
```

## 🎨 UI Component Patterns

### Resilient Card Component
```typescript
function ResilientCard({ data }: { data: unknown }) {
  // Extract with fallbacks
  const title = safe.string(safe.property(data, 'title'), 'Untitled');
  const description = safe.string(safe.property(data, 'description'), '');
  const imageUrl = safe.string(safe.property(data, 'image.url'));
  
  return (
    <div className="card">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={title}
          onError={(e) => {
            e.currentTarget.src = '/placeholder.png';
          }}
        />
      ) : (
        <div className="placeholder-image" />
      )}
      
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}
```

### Resilient List Component
```typescript
function ResilientList({ items }: { items: unknown }) {
  const safeItems = safeArray.filter(
    items,
    (item) => guards.isObject(item) && 'id' in item
  );
  
  if (!safeItems.length) {
    return <EmptyState />;
  }
  
  return (
    <ul>
      {safeItems.map((item, index) => (
        <li key={safe.property(item, 'id', `item-${index}`)}>
          {safe.string(safe.property(item, 'name'), 'Item')}
        </li>
      ))}
    </ul>
  );
}
```

## 🔄 State Management

### Managing Component State Safely
```typescript
function MyComponent() {
  // Safe state initialization
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    sort: 'date'
  });
  
  // Safe state updates
  const updateFilter = useCallback((key: keyof FilterState, value: unknown) => {
    setFilters(prev => ({
      ...prev,
      [key]: safe.string(value, prev[key])
    }));
  }, []);
  
  // Derived state with validation
  const filteredItems = useMemo(() => {
    const items = safeArray.filter(data?.items, Boolean);
    
    if (!filters.search) return items;
    
    return items.filter(item => {
      const name = safe.string(item?.name, '').toLowerCase();
      const search = filters.search.toLowerCase();
      return name.includes(search);
    });
  }, [data, filters.search]);
}
```

## 🧪 Testing Resilient Components

### Test Template
```typescript
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './MyComponent';

describe('MyComponent Resilience', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  );

  test('handles null data gracefully', () => {
    render(<MyComponent />, { wrapper });
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  test('shows loading state', () => {
    render(<MyComponent />, { wrapper });
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  test('shows empty state when no items', () => {
    render(<MyComponent />, { wrapper });
    expect(screen.getByText(/no items found/i)).toBeInTheDocument();
  });

  test('recovers from error state', async () => {
    render(<MyComponent />, { wrapper });
    const retryButton = await screen.findByText(/try again/i);
    fireEvent.click(retryButton);
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });
});
```

## 📋 Component Checklist

Before marking a component as complete:

### Data Layer
- [ ] Schema defined with Zod
- [ ] API response validated
- [ ] Fallback data provided
- [ ] Cache key specified

### UI States
- [ ] Loading skeleton implemented
- [ ] Error state with retry
- [ ] Empty state with CTA
- [ ] Offline state warning
- [ ] Degraded mode UI

### Safety Checks
- [ ] All data access uses safe accessors
- [ ] Arrays validated before mapping
- [ ] URLs validated before use
- [ ] Keys provided for list items
- [ ] Error boundaries in place

### Performance
- [ ] Memoization where needed
- [ ] Lazy loading for heavy components
- [ ] Image fallbacks on error
- [ ] Debounced user inputs
- [ ] Virtual scrolling for long lists

## 🚀 Quick Reference

### Import Everything You Need
```typescript
import { withResilience } from '@/components/resilient/ResilientBoundary';
import { useResilientQuery } from '@/hooks/useResilientQuery';
import { safe, guards, safeArray, safeUrl } from '@shared/resilience/guards';
import { z } from 'zod';
```

### Component Structure
```typescript
1. Define Schema
2. Create Core Component
3. Add Resilient Data Fetching
4. Implement All UI States
5. Safe Data Extraction
6. Defensive Rendering
7. Export with Error Boundary
```

## 💡 Pro Tips

1. **Always provide fallbacks** - Never assume data exists
2. **Validate at boundaries** - Check data when it enters your component
3. **Fail fast in dev, gracefully in prod** - Show errors in development, fallbacks in production
4. **Test the unhappy path** - Spend more time testing failures than successes
5. **Monitor and iterate** - Track which fallbacks are used most

## 📚 Related Resources

- [Platform Resilience Guide](./PlatformResilienceGuide.md)
- [Testing Resilience](./TestingResilience.md)
- [Error Patterns](../fixes/TypeError-URL-Fixes.md)
- [API Integration](./APIIntegration.md)

---

*Follow this guide to build components that never fail, always recover, and provide excellent user experience under all conditions.*