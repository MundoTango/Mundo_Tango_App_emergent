# ESA Layer 8: Client Framework Agent ⚛️

## Overview
Layer 8 manages the React 18 client framework, including component architecture, hooks management, rendering optimization, and build configuration.

## Core Responsibilities

### 1. React Architecture
- Component structure and hierarchy
- Functional components best practices
- Custom hooks development
- Context providers setup
- Error boundaries

### 2. Build Configuration
- Vite configuration and optimization
- Hot module replacement (HMR)
- Code splitting strategies
- Bundle optimization
- Development server setup

### 3. Performance Optimization
- React.memo and useMemo usage
- useCallback optimization
- Virtual DOM optimization
- Lazy loading components
- Concurrent rendering features

## Open Source Packages

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@types/react": "^18.2.47",
  "@types/react-dom": "^18.2.18",
  "@vitejs/plugin-react": "^4.2.1",
  "vite": "^5.0.10",
  "next": "^14.0.4",
  "next-themes": "^0.2.1"
}
```

## Integration Points

- **Layer 7 (State Management)**: State hooks and providers
- **Layer 9 (UI Framework)**: Styling integration
- **Layer 10 (Components)**: Component library usage
- **Layer 11 (Real-time)**: WebSocket hooks
- **Layer 53 (i18n)**: Translation hooks

## Implementation Example

```typescript
// Modern React 18 Component Structure
import { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';

// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Custom hook example
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Optimized functional component
export const OptimizedComponent = React.memo(({ data, onUpdate }: Props) => {
  const [localState, setLocalState] = useState(data);
  const debouncedValue = useDebounce(localState, 500);
  
  // Memoized expensive computation
  const processedData = useMemo(() => {
    return expensiveProcessing(debouncedValue);
  }, [debouncedValue]);
  
  // Stable callback reference
  const handleUpdate = useCallback((newValue: string) => {
    setLocalState(newValue);
    onUpdate(newValue);
  }, [onUpdate]);
  
  return (
    <Suspense fallback={<Skeleton />}>
      <div>
        <input value={localState} onChange={e => handleUpdate(e.target.value)} />
        <HeavyComponent data={processedData} />
      </div>
    </Suspense>
  );
});
```

## Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    })
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@components': path.resolve(__dirname, './client/src/components'),
      '@hooks': path.resolve(__dirname, './client/src/hooks'),
      '@utils': path.resolve(__dirname, './client/src/lib'),
      '@assets': path.resolve(__dirname, './attached_assets'),
      '@shared': path.resolve(__dirname, './shared')
    }
  },
  
  build: {
    target: 'es2022',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['lodash', 'date-fns', 'clsx']
        }
      }
    }
  },
  
  server: {
    port: 5000,
    host: '0.0.0.0',
    hmr: {
      overlay: true
    }
  }
});
```

## React 18 Features

### 1. Concurrent Features
```typescript
import { useTransition, useDeferredValue, startTransition } from 'react';

function SearchResults({ query }: { query: string }) {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState([]);
  
  const deferredQuery = useDeferredValue(query);
  
  useEffect(() => {
    startTransition(() => {
      // Non-urgent update
      searchAPI(deferredQuery).then(setResults);
    });
  }, [deferredQuery]);
  
  return (
    <div>
      {isPending && <Spinner />}
      <ResultsList results={results} />
    </div>
  );
}
```

### 2. Automatic Batching
```typescript
// React 18 automatically batches these updates
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // Only one re-render!
}

// Works in timeouts, promises, and native event handlers
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // Still only one re-render!
}, 1000);
```

### 3. Suspense for Data Fetching
```typescript
const resource = fetchProfileData();

function ProfilePage() {
  return (
    <Suspense fallback={<h1>Loading profile...</h1>}>
      <ProfileDetails />
      <Suspense fallback={<h1>Loading posts...</h1>}>
        <ProfileTimeline />
      </Suspense>
    </Suspense>
  );
}

function ProfileDetails() {
  const user = resource.user.read();
  return <h1>{user.name}</h1>;
}
```

## Error Boundaries

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## Custom Hooks Library

```typescript
// useLocalStorage hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving to localStorage:`, error);
    }
  };
  
  return [storedValue, setValue] as const;
}

// useOnScreen hook for intersection observer
export function useOnScreen<T extends HTMLElement>(
  ref: RefObject<T>,
  rootMargin = '0px'
): boolean {
  const [isIntersecting, setIntersecting] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { rootMargin }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, rootMargin]);
  
  return isIntersecting;
}
```

## Performance Patterns

| Pattern | Description | Use Case |
|---------|-------------|----------|
| Code Splitting | Dynamic imports for route-based splitting | Large applications |
| React.memo | Prevent unnecessary re-renders | Pure components |
| useMemo | Memoize expensive computations | Heavy calculations |
| useCallback | Stable function references | Child component props |
| Virtualization | Render only visible items | Long lists |
| Suspense | Declarative loading states | Async components |

## Component Organization

```
client/src/
├── components/
│   ├── common/        # Shared components
│   ├── layouts/       # Layout components
│   └── features/      # Feature-specific components
├── hooks/            # Custom hooks
├── contexts/         # React contexts
├── pages/           # Page components
├── lib/             # Utilities
└── App.tsx          # Root component
```

## Testing

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('OptimizedComponent', () => {
  it('should debounce input changes', async () => {
    const onUpdate = jest.fn();
    render(<OptimizedComponent data="initial" onUpdate={onUpdate} />);
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test');
    
    // Should not call immediately
    expect(onUpdate).not.toHaveBeenCalled();
    
    // Wait for debounce
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith('initialtest');
    }, { timeout: 600 });
  });
});
```

## Next Steps

- [ ] Implement React Server Components
- [ ] Add React DevTools integration
- [ ] Enhanced error recovery
- [ ] Performance monitoring dashboard

---

**Status**: 🟢 Operational
**Dependencies**: React 18, Vite, Next.js
**Owner**: Frontend Team
**Last Updated**: September 2025