# 🧪 Testing Guide
## Complete Testing Strategy Across ESA 61x21 Layers

**Framework:** ESA LIFE CEO 61x21  
**Last Updated:** October 10, 2025

---

## 📋 Testing Philosophy

**ESA Layer 51: Testing Framework**

Every layer of the 61x21 framework has specific testing requirements:

| ESA Layer | Test Type | Tool | Coverage Target |
|-----------|-----------|------|-----------------|
| **1-6** | Integration Tests | Vitest + pg-mem | 80%+ |
| **7-10** | Component Tests | Testing Library | 75%+ |
| **11** | Real-time Tests | Socket.io Mock | 70%+ |
| **17** | Payment Tests | Stripe Test Mode | 100% |
| **31-46** | AI Agent Tests | OpenAI Mock | 80%+ |
| **47** | Mobile Tests | Playwright Mobile | Critical paths |
| **51** | E2E Tests | Playwright | All user journeys |

---

## 🎯 Unit Testing (Vitest)

**ESA Layers: Business Logic (5, 21-30)**

### Setup

```bash
# Install testing dependencies (already included)
npm install -D vitest @vitest/ui

# Run tests
npm run test              # Run once
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage
```

### Example: Storage Layer Test

**File:** `server/__tests__/storage.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { newDb } from 'pg-mem'
import { drizzle } from 'drizzle-orm/pg-mem'
import { DbStorage } from '../storage'
import { users, posts } from '@shared/schema'

describe('DbStorage', () => {
  let storage: DbStorage
  
  beforeEach(() => {
    // ESA Layer 1: In-memory database for testing
    const mem = newDb()
    const db = drizzle(mem.adapters.createPgDb())
    storage = new DbStorage(db)
  })
  
  describe('User Management', () => {
    it('should create user with hashed password', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
      }
      
      // Act
      const user = await storage.createUser(userData)
      
      // Assert
      expect(user.id).toBeDefined()
      expect(user.email).toBe('test@example.com')
      expect(user.password).not.toBe('password123')  // Hashed
      expect(user.password.startsWith('$2b$')).toBe(true)  // bcrypt
    })
    
    it('should throw on duplicate email', async () => {
      // Arrange
      await storage.createUser({
        email: 'test@example.com',
        password: 'pass1',
        username: 'user1'
      })
      
      // Act & Assert
      await expect(
        storage.createUser({
          email: 'test@example.com',
          password: 'pass2',
          username: 'user2'
        })
      ).rejects.toThrow('Email already exists')
    })
  })
  
  describe('Post Management', () => {
    it('should create post with user relationship', async () => {
      // Arrange
      const user = await storage.createUser({
        email: 'test@example.com',
        password: 'password',
        username: 'testuser'
      })
      
      // Act
      const post = await storage.createPost({
        userId: user.id,
        content: 'Test post',
        cityId: 1
      })
      
      // Assert
      expect(post.id).toBeDefined()
      expect(post.userId).toBe(user.id)
      expect(post.content).toBe('Test post')
    })
  })
})
```

### Validation Testing (Zod)

**ESA Layer 6: Data Validation**

```typescript
import { describe, it, expect } from 'vitest'
import { insertUserSchema, insertPostSchema } from '@shared/schema'

describe('Schema Validation', () => {
  describe('User Schema', () => {
    it('should validate correct user data', () => {
      const data = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        username: 'testuser'
      }
      
      const result = insertUserSchema.parse(data)
      expect(result).toEqual(data)
    })
    
    it('should reject invalid email', () => {
      const data = {
        email: 'not-an-email',
        password: 'password',
        username: 'testuser'
      }
      
      expect(() => insertUserSchema.parse(data)).toThrow()
    })
    
    it('should require minimum password length', () => {
      const data = {
        email: 'test@example.com',
        password: '123',  // Too short
        username: 'testuser'
      }
      
      expect(() => insertUserSchema.parse(data)).toThrow('at least 8 characters')
    })
  })
})
```

---

## ⚛️ Component Testing (React Testing Library)

**ESA Layers: UI/UX (8-10)**

### Setup

```bash
# Already installed
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

### Example: Button Component Test

**File:** `client/src/__tests__/components/Button.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })
  
  it('should call onClick handler', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
  
  it('should apply correct variant classes', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-destructive')
    
    rerender(<Button variant="outline">Cancel</Button>)
    expect(screen.getByRole('button')).toHaveClass('border')
  })
})
```

### Form Testing with React Hook Form

**File:** `client/src/__tests__/forms/LoginForm.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/auth/LoginForm'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const createWrapper = () => {
  const queryClient = new QueryClient()
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('LoginForm', () => {
  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<LoginForm />, { wrapper: createWrapper() })
    
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })
  
  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    
    render(<LoginForm onSubmit={onSubmit} />, { wrapper: createWrapper() })
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })
})
```

---

## 🔌 Real-time Testing (Socket.io)

**ESA Layer 11: Real-time Features**

### Example: WebSocket Test

**File:** `client/src/__tests__/hooks/useMemoriesFeed.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { io, Socket } from 'socket.io-client'
import { useMemoriesFeed } from '@/hooks/useMemoriesFeed'

// Mock Socket.io
vi.mock('socket.io-client')

describe('useMemoriesFeed', () => {
  let mockSocket: any
  
  beforeEach(() => {
    mockSocket = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn()
    }
    
    ;(io as any).mockReturnValue(mockSocket)
  })
  
  afterEach(() => {
    vi.clearAllMocks()
  })
  
  it('should connect to socket on mount', () => {
    renderHook(() => useMemoriesFeed())
    expect(io).toHaveBeenCalledWith()
  })
  
  it('should listen for new posts', async () => {
    const { result } = renderHook(() => useMemoriesFeed())
    
    // Simulate socket event
    const newPost = { id: 1, content: 'New memory' }
    const callback = mockSocket.on.mock.calls.find(
      ([event]) => event === 'post:created'
    )?.[1]
    
    callback(newPost)
    
    await waitFor(() => {
      expect(result.current.posts).toContainEqual(newPost)
    })
  })
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useMemoriesFeed())
    unmount()
    
    expect(mockSocket.off).toHaveBeenCalledWith('post:created')
    expect(mockSocket.disconnect).toHaveBeenCalled()
  })
})
```

---

## 💳 Payment Testing (Stripe)

**ESA Layer 17: Payment Processing**

### Stripe Test Mode

```typescript
import { describe, it, expect } from 'vitest'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_TEST_KEY!)

describe('Stripe Integration', () => {
  it('should create payment intent', async () => {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2000,  // $20.00
      currency: 'usd',
      payment_method_types: ['card']
    })
    
    expect(paymentIntent.id).toBeDefined()
    expect(paymentIntent.amount).toBe(2000)
    expect(paymentIntent.status).toBe('requires_payment_method')
  })
  
  it('should handle successful payment', async () => {
    // Use Stripe test card: 4242 4242 4242 4242
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: 'tok_visa'  // Test token
      }
    })
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000,
      currency: 'usd',
      payment_method: paymentMethod.id,
      confirm: true,
      return_url: 'http://localhost:5000/success'
    })
    
    expect(paymentIntent.status).toBe('succeeded')
  })
  
  it('should handle declined payment', async () => {
    // Use Stripe test card for decline: 4000 0000 0000 0002
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: 'tok_chargeDeclined'  // Test token for decline
      }
    })
    
    await expect(
      stripe.paymentIntents.create({
        amount: 1000,
        currency: 'usd',
        payment_method: paymentMethod.id,
        confirm: true
      })
    ).rejects.toThrow('card was declined')
  })
})
```

---

## 🤖 AI Agent Testing

**ESA Layers 31-46: Intelligence Infrastructure**

### Mock OpenAI Responses

```typescript
import { describe, it, expect, vi } from 'vitest'
import { AgentService } from '../services/agentService'

// Mock OpenAI
vi.mock('openai', () => ({
  default: class {
    chat = {
      completions: {
        create: vi.fn()
      }
    }
  }
}))

describe('Life CEO Agent', () => {
  it('should generate response from prompt', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: 'To improve your sleep, try maintaining a consistent bedtime schedule...'
        }
      }]
    }
    
    const openai = new OpenAI()
    ;(openai.chat.completions.create as any).mockResolvedValue(mockResponse)
    
    const agent = new AgentService('health')
    const response = await agent.chat('How can I improve my sleep?')
    
    expect(response).toContain('consistent bedtime schedule')
    expect(openai.chat.completions.create).toHaveBeenCalledWith({
      model: 'gpt-4o',
      messages: expect.arrayContaining([
        { role: 'system', content: expect.stringContaining('health') },
        { role: 'user', content: 'How can I improve my sleep?' }
      ])
    })
  })
})
```

---

## 🎭 End-to-End Testing (Playwright)

**ESA Layer 51: E2E Tests**

### Setup

```bash
# Install Playwright
npx playwright install

# Run E2E tests
npm run test:e2e
npm run test:e2e:ui    # With UI
```

### Example: User Journey Test

**File:** `e2e/user-journey.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('User Registration and Login', () => {
  test('should complete full user journey', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('http://localhost:5000')
    
    // 2. Navigate to register
    await page.getByTestId('link-register').click()
    await expect(page).toHaveURL('/register')
    
    // 3. Fill registration form
    await page.getByTestId('input-email').fill('test@example.com')
    await page.getByTestId('input-username').fill('testuser')
    await page.getByTestId('input-password').fill('SecurePass123!')
    await page.getByTestId('button-register').click()
    
    // 4. Verify welcome message
    await expect(page.getByText(/welcome/i)).toBeVisible()
    
    // 5. Logout
    await page.getByTestId('button-logout').click()
    
    // 6. Login again
    await page.getByTestId('link-login').click()
    await page.getByTestId('input-email').fill('test@example.com')
    await page.getByTestId('input-password').fill('SecurePass123!')
    await page.getByTestId('button-login').click()
    
    // 7. Verify dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('testuser')).toBeVisible()
  })
})

test.describe('Post Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5000/login')
    await page.getByTestId('input-email').fill('test@example.com')
    await page.getByTestId('input-password').fill('password')
    await page.getByTestId('button-login').click()
    await page.waitForURL('/dashboard')
  })
  
  test('should create and view post', async ({ page }) => {
    // Create post
    await page.getByTestId('button-create-post').click()
    await page.getByTestId('textarea-post-content').fill('My first post!')
    await page.getByTestId('button-submit-post').click()
    
    // Verify post appears
    await expect(page.getByText('My first post!')).toBeVisible()
    
    // Verify on feed
    await page.getByTestId('link-feed').click()
    await expect(page.getByText('My first post!')).toBeVisible()
  })
})
```

### Visual Regression Testing

```typescript
import { test, expect } from '@playwright/test'

test.describe('Visual Regression', () => {
  test('homepage should match snapshot', async ({ page }) => {
    await page.goto('http://localhost:5000')
    await expect(page).toHaveScreenshot('homepage.png')
  })
  
  test('dark mode should match snapshot', async ({ page }) => {
    await page.goto('http://localhost:5000')
    await page.getByTestId('button-theme-toggle').click()
    await expect(page).toHaveScreenshot('homepage-dark.png')
  })
})
```

---

## 📱 Mobile Testing

**ESA Layer 47: Mobile Optimization**

```typescript
import { test, expect, devices } from '@playwright/test'

test.describe('Mobile Experience', () => {
  test.use({ ...devices['iPhone 13'] })
  
  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('http://localhost:5000')
    
    // Check mobile menu
    await expect(page.getByTestId('button-mobile-menu')).toBeVisible()
    
    // Check touch targets (min 44x44px)
    const button = page.getByTestId('button-create-post')
    const box = await button.boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(44)
    expect(box?.height).toBeGreaterThanOrEqual(44)
    
    // Check viewport
    const viewport = page.viewportSize()
    expect(viewport?.width).toBe(390)  // iPhone 13 width
  })
})
```

---

## 🎯 Coverage Targets

**By ESA Layer:**

| Layer | Coverage | Commands |
|-------|----------|----------|
| **1-6** (Backend) | 80%+ | `npm run test:coverage --filter=server` |
| **7-10** (Frontend) | 75%+ | `npm run test:coverage --filter=client` |
| **11** (Real-time) | 70%+ | `npm run test:e2e --grep=websocket` |
| **17** (Payments) | 100% | `npm run test --grep=stripe` |
| **31-46** (AI) | 80%+ | `npm run test --grep=agent` |
| **51** (E2E) | All paths | `npm run test:e2e` |

---

## 🚀 CI/CD Integration

**ESA Layer 50: DevOps Automation**

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm install
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test:coverage
      - run: npx playwright install
      - run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

**Next Read:** `DEPLOYMENT_GUIDE.md` for production deployment
