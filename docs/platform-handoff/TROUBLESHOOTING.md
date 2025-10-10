# 🔧 Troubleshooting Guide
## Common Issues & Fixes Mapped to ESA Layers

**Framework:** ESA LIFE CEO 61x21  
**Last Updated:** October 10, 2025

---

## 🚨 Critical Issues (Fix Immediately)

### Database Connection Errors
**ESA Layer 1: Database Architecture**

**Symptoms:**
```
Error: connect ECONNREFUSED
Error: password authentication failed
```

**Fixes:**

```bash
# 1. Check DATABASE_URL
env | grep DATABASE_URL

# 2. Verify Neon connection
# Should show: postgresql://user:pass@host/db

# 3. Test connection
npm run db:push

# 4. If still failing, force sync
npm run db:push --force
```

**Root Causes:**
- ❌ Missing DATABASE_URL environment variable
- ❌ Expired database credentials
- ❌ Network/firewall blocking connection
- ❌ Database server down

---

### Build Failures
**ESA Layers 3, 8, 50: Server, Client, DevOps**

**Symptoms:**
```
Error: Cannot find module '@/components/...'
TypeScript error: Property 'xyz' does not exist
```

**Fixes:**

```bash
# 1. TypeScript errors
npm run typecheck

# 2. Fix imports (use @-prefixed paths)
import { Button } from '@/components/ui/button'  # ✅ Correct
import { Button } from '../../../components/ui/button'  # ❌ Wrong

# 3. Clear cache and rebuild
rm -rf node_modules/.vite
npm run dev

# 4. Check for circular dependencies
# Look for files importing each other
```

**Common TypeScript Fixes:**
```typescript
// ❌ Wrong: Using 'any'
const data: any = await fetch(...)

// ✅ Correct: Use proper types
const data: Todo[] = await fetch(...)

// ❌ Wrong: Missing null check
user.name.toUpperCase()

// ✅ Correct: Optional chaining
user?.name?.toUpperCase()
```

---

### Authentication Failures
**ESA Layers 4, 5: Authentication, Authorization**

**Symptoms:**
```
401 Unauthorized
403 Forbidden
Session expired
```

**Fixes:**

```bash
# 1. Check session middleware
# File: server/index.ts
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))

# 2. Verify JWT token
# File: server/routes.ts
const token = req.headers.authorization?.split(' ')[1]
const decoded = jwt.verify(token, process.env.JWT_SECRET)

# 3. Check RBAC permissions
# File: server/middleware/checkPermission.ts
if (!ability.can('read', subject)) {
  return res.status(403).json({ error: 'Forbidden' })
}
```

**Common Auth Issues:**
- ❌ Missing JWT_SECRET environment variable
- ❌ Token expired (default: 7 days)
- ❌ Wrong permissions in @casl/ability rules
- ❌ Session store not configured

---

## ⚠️ Common Issues (Fix When Possible)

### React Query Cache Issues
**ESA Layer 7: State Management**

**Symptoms:**
- Stale data showing
- Mutations not updating UI
- Infinite loading states

**Fixes:**

```typescript
// ❌ Wrong: Flat query key
useQuery({ queryKey: ['/api/todos/123'] })

// ✅ Correct: Hierarchical query key
useQuery({ queryKey: ['/api/todos', '123'] })

// ❌ Wrong: Forgetting to invalidate
const mutation = useMutation({
  mutationFn: createTodo
})

// ✅ Correct: Always invalidate
const mutation = useMutation({
  mutationFn: createTodo,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/todos'] })
  }
})

// ✅ Better: Optimistic updates
const mutation = useMutation({
  mutationFn: createTodo,
  onMutate: async (newTodo) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: ['/api/todos'] })
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['/api/todos'])
    
    // Optimistically update
    queryClient.setQueryData(['/api/todos'], old => [...old, newTodo])
    
    return { previous }
  },
  onError: (err, newTodo, context) => {
    // Rollback on error
    queryClient.setQueryData(['/api/todos'], context.previous)
  }
})
```

---

### Slow Performance
**ESA Layers 14, 48: Caching, Performance Monitoring**

**Symptoms:**
- API responses >1s
- UI feels sluggish
- High memory usage

**Fixes:**

```bash
# 1. Check cache hit rate
curl http://localhost:5000/api/metrics | grep cache_hit_rate
# Target: >95%

# 2. Enable Redis caching
# File: server/routes.ts
app.get('/api/posts', cacheMiddleware(300), async (req, res) => {
  // 5-minute cache
  const posts = await storage.getPosts()
  res.json(posts)
})

# 3. Add React.memo for expensive components
import { memo } from 'react'

const ExpensiveComponent = memo(({ data }) => {
  // Component logic
})

# 4. Use virtual scrolling for long lists
import { useVirtualizer } from '@tanstack/react-virtual'
```

**Performance Checklist:**
- ✅ Redis cache enabled (Layer 14)
- ✅ React Query cache configured (Layer 7)
- ✅ Images lazy loaded (Layer 13)
- ✅ Code splitting on routes (Layer 8)
- ✅ Bundle size <200KB gzipped (Layer 48)

---

### Real-time Updates Not Working
**ESA Layer 11: Real-time Features**

**Symptoms:**
- Socket.io not connecting
- Events not received
- Duplicate connections

**Fixes:**

```typescript
// ❌ Wrong: Creating multiple connections
useEffect(() => {
  const socket = io()  // New connection every render!
}, [])

// ✅ Correct: Single connection
const socket = useMemo(() => io(), [])

useEffect(() => {
  socket.on('post:created', handleNewPost)
  
  return () => {
    socket.off('post:created', handleNewPost)  // Cleanup!
  }
}, [])

// ✅ Better: Auto-reconnect with fallback
const useMemoriesFeed = () => {
  const socket = useMemo(() => io(), [])
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  
  useEffect(() => {
    socket.on('connect_error', () => {
      setReconnectAttempts(prev => prev + 1)
      
      // Fallback to polling after 3 failed attempts
      if (reconnectAttempts > 3) {
        const interval = setInterval(() => {
          refetch()  // React Query refetch
        }, 30000)  // 30s polling
        
        return () => clearInterval(interval)
      }
    })
  }, [reconnectAttempts])
}
```

---

### Zod Validation Errors
**ESA Layer 6: Data Validation**

**Symptoms:**
```
ZodError: Expected string, received undefined
Invalid type
```

**Fixes:**

```typescript
// ❌ Wrong: No defaults
const schema = z.object({
  name: z.string(),
  age: z.number()
})

// ✅ Correct: With defaults and optionals
const schema = z.object({
  name: z.string().min(1, 'Name required'),
  age: z.number().optional(),
  email: z.string().email().default('')
})

// ✅ Better: Coercion for form data
const formSchema = z.object({
  age: z.coerce.number(),  // Converts string to number
  active: z.coerce.boolean()  // Converts "true"/"false" to boolean
})

// Handle validation errors gracefully
try {
  const validated = schema.parse(data)
} catch (error) {
  if (error instanceof z.ZodError) {
    // Map errors to form fields
    const fieldErrors = error.errors.reduce((acc, err) => {
      acc[err.path[0]] = err.message
      return acc
    }, {})
    
    return res.status(400).json({ errors: fieldErrors })
  }
}
```

---

## 🎨 UI/UX Issues

### Dark Mode Not Working
**ESA Layer 9: UI Framework**

**Symptoms:**
- Colors don't change in dark mode
- Inconsistent theming
- Missing dark variants

**Fixes:**

```typescript
// ❌ Wrong: Hardcoded colors
<div className="bg-white text-black">

// ✅ Correct: Dark mode variants
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">

// ✅ Better: Use design tokens
<div className="bg-ocean-50 dark:bg-ocean-950 text-ocean-900 dark:text-ocean-100">

// Check theme provider is set up
// File: client/src/App.tsx
import { ThemeProvider } from '@/components/ThemeProvider'

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      {/* Your app */}
    </ThemeProvider>
  )
}
```

---

### Translation Keys Missing
**ESA Layer 53: Internationalization**

**Symptoms:**
```
Translation key not found: "housing.title"
```

**Fixes:**

```bash
# 1. Check translation file
# File: client/public/locales/en/translation.json
{
  "housing": {
    "title": "Tango Housing"
  }
}

# 2. Verify i18n initialization
# File: client/src/i18n.ts
i18n.use(HttpBackend).use(LanguageDetector).init({
  fallbackLng: 'en',
  ns: ['translation'],
  defaultNS: 'translation'
})

# 3. Use translation hook correctly
import { useTranslation } from 'react-i18next'

const { t } = useTranslation()
<h1>{t('housing.title', 'Tango Housing')}</h1>  // Fallback provided
```

---

### Accessibility Errors
**ESA Layer 54: Accessibility**

**Symptoms:**
- Screen reader can't navigate
- Keyboard shortcuts don't work
- Missing ARIA labels

**Fixes:**

```typescript
// ❌ Wrong: No accessibility
<button onClick={handleClick}>
  <ThumbsUp />
</button>

// ✅ Correct: Full accessibility
<button
  onClick={handleClick}
  aria-label="Like post"
  data-testid="button-like"
>
  <ThumbsUp className="w-5 h-5" />
</button>

// ✅ Keyboard navigation
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
  aria-label="Open menu"
>
```

**Accessibility Checklist:**
- ✅ All buttons have aria-label
- ✅ Images have alt text
- ✅ Forms have proper labels
- ✅ Color contrast ratio ≥4.5:1
- ✅ Keyboard navigation works
- ✅ Focus indicators visible

---

## 🔐 Security Issues

### XSS Vulnerabilities
**ESA Layer 49: Security Hardening**

**Symptoms:**
- User input showing raw HTML
- Scripts executing from user content

**Fixes:**

```typescript
// ❌ Wrong: Raw HTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Correct: Sanitize with DOMPurify
import DOMPurify from 'isomorphic-dompurify'

<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userInput)
}} />

// ✅ Better: Use React (auto-escapes)
<div>{userInput}</div>

// Backend validation
import xss from 'xss'

const cleaned = xss(req.body.content, {
  whiteList: {
    a: ['href', 'title'],
    strong: [],
    em: []
  }
})
```

---

### CSRF Attacks
**ESA Layer 49: Security Hardening**

**Fixes:**

```typescript
// File: server/index.ts
import csrf from 'csurf'

app.use(csrf({ cookie: true }))

// Add CSRF token to forms
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

// Frontend: Include in requests
const { data } = await fetch('/api/csrf-token')
await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'CSRF-Token': data.csrfToken
  }
})
```

---

## 🚀 Deployment Issues

### Environment Variables Missing
**ESA Layer 50: DevOps Automation**

**Symptoms:**
```
Error: STRIPE_SECRET_KEY is not defined
```

**Fixes:**

```bash
# 1. Check Replit Secrets
# Go to Tools > Secrets
# Add: STRIPE_SECRET_KEY, OPENAI_API_KEY, etc.

# 2. Verify in code
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY required')
}

# 3. For frontend vars (must start with VITE_)
VITE_API_URL=http://localhost:5000
```

---

### Database Migration Failures
**ESA Layer 1: Database Architecture**

**Symptoms:**
```
Error: column "xyz" does not exist
Migration failed
```

**Fixes:**

```bash
# Never manually write SQL migrations!
# Use Drizzle push instead:

# 1. Update schema in shared/schema.ts
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  newField: text('new_field')  // Added field
})

# 2. Push to database
npm run db:push

# 3. If data loss warning, force it
npm run db:push --force

# CRITICAL: Never change ID column types!
# ❌ Wrong: serial -> varchar
# ✅ Right: Keep ID type consistent
```

---

## 📊 Diagnostic Commands

```bash
# Health Check
curl http://localhost:5000/api/health

# Database Status
npm run db:push

# TypeScript Errors
npm run typecheck

# Linting Errors
npm run lint

# Test Coverage
npm run test --coverage

# Performance Metrics
curl http://localhost:5000/api/metrics

# Bundle Size
npm run build && ls -lh dist/

# Agent Status (ESA Layers 31-46)
curl http://localhost:5000/api/esa-agents/health
```

---

## 🆘 Emergency Procedures

### Complete Reset

```bash
# 1. Clear all caches
rm -rf node_modules/.vite
rm -rf dist
rm -rf .next

# 2. Reinstall dependencies
rm -rf node_modules
npm install

# 3. Reset database
npm run db:push --force

# 4. Restart server
npm run dev
```

### Rollback to Last Working State

```bash
# Use Replit's checkpoint system
# Go to: Version control > View checkpoints
# Select: Last working checkpoint
# Click: Rollback
```

---

## 📞 Getting Help

**If issue persists:**

1. **Check Logs:**
   - Browser console (F12)
   - Server logs (terminal)
   - Database logs (Neon dashboard)

2. **Search Documentation:**
   - `esa.md` for framework
   - `approved-patterns-2025-10-10.md` for patterns
   - `api-routes-reference.md` for API issues

3. **Ask for Rollback:**
   - If system is broken, request checkpoint rollback
   - Reference this guide for issue description

---

**Next Read:** `TESTING_GUIDE.md` for testing strategies
