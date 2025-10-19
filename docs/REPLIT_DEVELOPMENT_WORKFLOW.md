# Replit Development Workflow Guide
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Audience:** All developers working on Mundo Tango

## Overview

This guide covers the day-to-day development workflow on Replit, including the IDE, collaboration features, testing, and debugging.

---

## Replit IDE Basics

### **Project Structure**

```
mundo-tango/
├── client/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components (routing)
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities
│   │   └── App.tsx      # Main app component
│   └── index.html       # HTML entry point
├── server/              # Backend (Express + TypeScript)
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── utils/           # Backend utilities
│   └── index.ts         # Server entry point
├── shared/              # Shared types + schema
│   └── schema.ts        # Drizzle database schema
├── docs/                # Documentation (335+ files)
├── scripts/             # Utility scripts
├── package.json         # Dependencies
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript config
└── .replit              # Replit configuration
```

---

## Development Workflow

### **Step 1: Read Agent Onboarding Protocol**

**MANDATORY before any work:**
```bash
bash scripts/agent-verification.sh
```

**What it does:**
- ✅ Verifies critical files exist (no 0-byte files)
- ✅ Tests build system health
- ✅ Confirms database connectivity
- ✅ Prompts for MB.MD phase (identifies required docs)
- ✅ Recommends phase-specific documentation to read

**Answer the MB.MD phase prompt:**
```
Which MB.MD phase are you in?
1) MAPPING
2) BREAKDOWN
3) MITIGATION
4) DEPLOYMENT
5) Skip (not recommended)

Your choice [1-5]:
```

**Read the recommended docs before proceeding!**

---

### **Step 2: Make Code Changes**

**Frontend Development:**
```bash
# Hot reload is automatic with Vite
# Edit files in client/src/
# Browser auto-refreshes on save
```

**Backend Development:**
```bash
# Server auto-restarts on file changes (nodemon)
# Edit files in server/
# Check terminal for restart confirmation
```

**Database Schema Changes:**
```bash
# Edit shared/schema.ts
# Apply changes
npm run db:push

# If data-loss warning:
npm run db:push --force
```

---

### **Step 3: Test Changes**

**Manual Testing:**
```bash
# Frontend: Open webview (CTRL+K → Open Preview)
# Backend: Test API with curl or Postman

# Example: Test API endpoint
curl http://localhost:5000/api/users

# Test with authentication
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/protected
```

**Automated Testing:**
```bash
# Run all tests
npm test

# Run specific test file
npm test -- HomeFeed.test.tsx

# Run tests in watch mode
npm test -- --watch
```

---

### **Step 4: Verify Completion**

```bash
# Run post-work verification
bash scripts/verify-completion.sh
```

**What it does:**
- ✅ Checks for 0-byte files
- ✅ Verifies critical files intact
- ✅ Tests TypeScript compilation
- ✅ Confirms server still running
- ✅ Prompts to update session log

**Update session log:**
```markdown
# Add to docs/AGENT_SESSION_LOG.md

## Session: 2025-10-19 - [Your Agent Name]

**Task:** [Description of what you did]

**Documentation Read:**
- ESA_CHECK_BEFORE_BUILD.md
- REPLIT_DEVELOPMENT_WORKFLOW.md
- [Other docs...]

**Changes Made:**
- Modified client/src/pages/HomeFeed.tsx
- Updated server/routes/posts.ts
- Added index to shared/schema.ts

**Issues Encountered:**
- TypeScript error on line 42 (fixed with type assertion)

**Learnings:**
- Always read docs before starting
- verify-completion.sh catches issues early

**Verification:**
- ✅ Scripts ran successfully
- ✅ TypeScript compiles
- ✅ Server running
```

---

## Replit Shell Commands

### **Essential Commands**

```bash
# Install dependencies
npm install <package-name>

# Check logs
cat /tmp/server.log | tail -50

# Database commands
psql $DATABASE_URL
npm run db:push

# System monitoring
top           # CPU/memory usage
free -h       # Memory stats
df -h         # Disk usage
netstat -tulpn  # Network connections

# Git operations
git status
git log --oneline -10
git diff
```

---

## Replit IDE Features

### **1. Multiplayer Coding**

**Invite Collaborators:**
```
Share button (top-right) → Invite via email or link
```

**Real-time collaboration:**
- See other developers' cursors
- Live code updates
- Built-in chat

**Permissions:**
- **Editor:** Can edit code, but not deploy
- **Admin:** Can edit, deploy, manage secrets

---

### **2. Nix Package Management**

**Installing system packages:**
```bash
# Search for packages
nix-env -qaP | grep <package>

# Install package
nix-env -iA nixpkgs.<package>

# Example: Install ImageMagick
nix-env -iA nixpkgs.imagemagick
```

**Replit Packager (Preferred):**
```
Tools → Packages → Search → Install
```

---

### **3. Secrets Management**

**Add Secret:**
```
Tools → Secrets → Add Secret
Name: ANTHROPIC_API_KEY
Value: sk-ant-...
```

**Access in Code:**
```typescript
const apiKey = process.env.ANTHROPIC_API_KEY;
```

**See:** `docs/REPLIT_SECRETS_MANAGEMENT.md`

---

### **4. Database Management**

**Access Database:**
```
Tools → Database → Open
```

**Features:**
- Visual table browser
- SQL query editor
- Schema viewer
- Data export

**Or use command line:**
```bash
psql $DATABASE_URL

# List tables
\dt

# Describe table
\d users

# Query
SELECT * FROM users LIMIT 5;
```

---

### **5. Version Control (Git)**

**Replit has built-in Git:**
```
Tools → Version Control
```

**Commit changes:**
```
Version Control → Stage changes → Commit → Push
```

**Or use command line:**
```bash
git add .
git commit -m "Add user authentication"
git push origin main
```

**View history:**
```bash
git log --oneline --graph -10
```

---

## Debugging

### **1. Server-Side Debugging**

**Console Logging:**
```typescript
console.log('Debug:', variable);
console.error('Error:', error);
console.warn('Warning:', message);
```

**Structured Logging:**
```typescript
import { logger } from './utils/logger';

logger.info('User logged in', { userId: user.id });
logger.error('Database error', { error: err.message, query });
```

**Check Logs:**
```bash
# Real-time logs
tail -f /tmp/server.log

# Last 100 lines
cat /tmp/server.log | tail -100

# Search logs
grep "ERROR" /tmp/server.log
```

---

### **2. Client-Side Debugging**

**Browser DevTools:**
```
Right-click → Inspect → Console
```

**React DevTools:**
```
Replit installs React DevTools automatically
Check "Components" and "Profiler" tabs
```

**Network Debugging:**
```
DevTools → Network → Filter by XHR
See all API requests and responses
```

---

### **3. Database Debugging**

**Query Performance:**
```sql
-- Explain query plan
EXPLAIN ANALYZE
SELECT * FROM posts WHERE user_id = 123;

-- Find slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Connection Issues:**
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check active connections
psql $DATABASE_URL -c "SELECT COUNT(*) FROM pg_stat_activity"
```

---

## Testing Strategies

### **1. Unit Tests (Jest)**

```typescript
// client/src/__tests__/utils.test.ts
import { formatDate } from '../utils/date';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2025-10-19');
    expect(formatDate(date)).toBe('October 19, 2025');
  });
  
  it('handles invalid date', () => {
    expect(formatDate(null)).toBe('Invalid date');
  });
});
```

**Run:**
```bash
npm test utils.test.ts
```

---

### **2. Integration Tests**

```typescript
// server/__tests__/auth.integration.test.ts
import request from 'supertest';
import app from '../index';

describe('POST /api/auth/login', () => {
  it('returns JWT on successful login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
  
  it('returns 401 on invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });
    
    expect(response.status).toBe(401);
  });
});
```

---

### **3. E2E Tests (Playwright)**

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');
  
  await page.fill('[data-testid="input-email"]', 'test@example.com');
  await page.fill('[data-testid="input-password"]', 'password');
  await page.click('[data-testid="button-login"]');
  
  await expect(page).toHaveURL('/home');
  await expect(page.locator('[data-testid="text-username"]')).toContainText('Test User');
});
```

**Run:**
```bash
npx playwright test
```

---

## Code Quality

### **1. TypeScript Type Checking**

```bash
# Check for type errors
npx tsc --noEmit

# Watch mode
npx tsc --noEmit --watch
```

---

### **2. Linting (ESLint)**

```bash
# Lint all files
npm run lint

# Auto-fix issues
npm run lint -- --fix

# Lint specific file
npx eslint client/src/pages/HomeFeed.tsx
```

---

### **3. Code Formatting (Prettier)**

```bash
# Format all files
npm run format

# Check formatting without changing
npm run format -- --check

# Format specific file
npx prettier --write client/src/pages/HomeFeed.tsx
```

---

## Performance Optimization

### **1. Vite Build Analysis**

```bash
# Analyze bundle size
npm run build

# View bundle report
npx vite-bundle-visualizer
```

**Optimize large bundles:**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog'],
        }
      }
    }
  }
});
```

---

### **2. React Performance**

```typescript
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  // Heavy rendering logic
  return <div>{/* ... */}</div>;
});

// Use useMemo for expensive calculations
const sortedData = useMemo(
  () => data.sort((a, b) => b.score - a.score),
  [data]
);

// Use useCallback for stable function references
const handleClick = useCallback(() => {
  console.log('Clicked');
}, []);
```

---

## Collaboration Best Practices

### **1. Code Reviews**

**Before Requesting Review:**
- [ ] Code compiles (`npm run build`)
- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] TypeScript checks (`tsc --noEmit`)
- [ ] Session log updated

**During Review:**
- Respond to comments promptly
- Explain design decisions
- Be open to feedback

---

### **2. Git Workflow**

**Branch Naming:**
```bash
# Feature
git checkout -b feature/mr-blue-3d-avatar

# Bug fix
git checkout -b fix/login-validation

# Hotfix
git checkout -b hotfix/security-patch
```

**Commit Messages:**
```bash
# Good
git commit -m "feat: Add 3D avatar to Mr Blue chat"
git commit -m "fix: Resolve login validation bug"
git commit -m "docs: Update deployment guide"

# Bad
git commit -m "changes"
git commit -m "fix stuff"
git commit -m "WIP"
```

---

### **3. Documentation**

**Update Docs When:**
- Adding new feature
- Changing architecture
- Discovering new patterns
- Fixing obscure bugs

**Files to Update:**
- `replit.md` - Project overview
- `docs/AGENT_SESSION_LOG.md` - Your learnings
- Relevant protocol docs - If changing workflows

---

## Integration with ESA Protocols

**CHECK_BEFORE_BUILD:**
- Always run `scripts/agent-verification.sh` before starting work
- Run `scripts/verify-completion.sh` before claiming done

**MB.MD METHODOLOGY:**
- Identify phase (MAPPING/BREAKDOWN/MITIGATION/DEPLOYMENT)
- Read phase-specific documentation
- Follow quality gates between phases

**AGENT_CERTIFICATION:**
- Level 2: Follow this workflow for all tasks
- Level 3: Mentor others on this workflow
- Level 4: Improve and update this workflow

---

## Quick Reference

```bash
# Start development
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Pre-work check
bash scripts/agent-verification.sh

# Post-work check
bash scripts/verify-completion.sh

# Deploy
git push origin main  # Auto-deploys on Replit

# Database
npm run db:push       # Apply schema changes
psql $DATABASE_URL    # Access database

# Logs
tail -f /tmp/server.log

# System health
top                   # CPU/memory
free -h               # Memory
df -h                 # Disk
```

---

**Document Owner:** All Developers  
**Review Cycle:** Quarterly or when workflow changes  
**Last Updated:** October 19, 2025
