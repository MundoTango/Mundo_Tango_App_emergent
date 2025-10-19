# Vite Configuration Template for Replit

## Overview
This is the **REQUIRED** Vite configuration for all Mundo Tango development on Replit. Both `port` and `allowedHosts` are mandatory - one without the other will cause UI blocking.

## Complete Configuration

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'client',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@assets': path.resolve(__dirname, './attached_assets'),
    },
  },
  server: {
    host: '0.0.0.0',        // CRITICAL: Listen on all network interfaces
    port: 5000,             // CRITICAL: Must be 5000 (only non-firewalled port in Replit)
    strictPort: false,      // Allow fallback if port taken
    allowedHosts: ['.replit.dev', '.replit.app'], // CRITICAL: Allow Replit dynamic hostnames
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/public'),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
```

## Why These Settings Matter

### 1. Port: 5000 (MANDATORY)
**Problem if wrong:** UI won't appear in Replit's iframe preview  
**Why:** Replit only allows port 5000 for non-firewalled external access  
**Common mistake:** Using Vite default (5173) or other ports  
**Symptom:** Server runs fine, but user sees blank screen

### 2. Host: '0.0.0.0' (MANDATORY)
**Problem if wrong:** External connections blocked  
**Why:** Listens on all network interfaces, not just localhost  
**Common mistake:** Using `host: true` (less explicit)  
**Note:** `host: true` works but `'0.0.0.0'` is clearer

### 3. allowedHosts: ['.replit.dev', '.replit.app'] (MANDATORY)
**Problem if wrong:** "Blocked request. This host is not allowed" error  
**Why:** Vite's DNS rebinding protection blocks unknown Host headers  
**Common mistake:** Omitting this entirely (assumes localhost)  
**Replit hostnames look like:** `3059bb1f-f13e-4679-9ae4-c1e95fc9d219-00-893quv9jrlb.kirk.replit.dev`  
**Leading dot pattern:** `.replit.dev` = matches domain + all subdomains

## Failure Patterns

### Incident 1: Port Mismatch (Oct 19, 2025)
```typescript
// ❌ WRONG - Default Vite port
server: {
  port: 5173  // User can't see UI
}

// ✅ CORRECT
server: {
  port: 5000  // UI visible in iframe
}
```

### Incident 2: Missing allowedHosts (Oct 19, 2025)
```typescript
// ❌ WRONG - Port correct but allowedHosts missing
server: {
  host: true,
  port: 5000,
  // Missing allowedHosts - Vite blocks Replit hostname
}

// ✅ CORRECT - Both configurations present
server: {
  host: '0.0.0.0',
  port: 5000,
  allowedHosts: ['.replit.dev', '.replit.app'],
}
```

## Verification

### Automated Check
```bash
# Run before any UI work
bash scripts/agent-verification.sh

# This checks:
# - Port is 5000 ✓
# - allowedHosts is present ✓
```

### Manual Check
```bash
# Check port
grep "port:" vite.config.ts
# Should show: port: 5000

# Check allowedHosts
grep "allowedHosts" vite.config.ts
# Should show: allowedHosts: ['.replit.dev', '.replit.app']
```

### Test UI Loads
1. Run `npm run dev`
2. Check logs show: `VITE v... ready in ... ms`
3. Visit preview URL (should load immediately)
4. No "Blocked request" errors in browser console

## Alternative Patterns (NOT RECOMMENDED)

```typescript
// Alternative 1: Allow ALL hosts (less secure)
server: {
  host: '0.0.0.0',
  port: 5000,
  allowedHosts: true,  // Disables all Host header checks
}

// Alternative 2: Specific hostname pattern (requires updates)
server: {
  host: '0.0.0.0',
  port: 5000,
  allowedHosts: ['*.kirk.replit.dev'],  // Only works for kirk subdomain
}
```

**Why not recommended:**
- Alternative 1: Security risk (no DNS rebinding protection)
- Alternative 2: Breaks on different Replit subdomains (user-dependent)

**Use the recommended pattern** with `.replit.dev` and `.replit.app` wildcards.

## Related Documentation

- **MB.MD Phase Map:** `docs/MB_MD_DOCUMENTATION_PHASE_MAP.md` (lines 93-123)
- **Prevention Guide:** `docs/PREVENTION_GUIDE.md` (Vite Port Mismatch, allowedHosts Blocking)
- **Agent Verification:** `scripts/agent-verification.sh` (step 1.5/5)
- **System Prompt:** Web dev rules (port 5000 requirement)

## When to Use This Template

✅ **Use when:**
- Starting new Replit project with Vite
- Fixing "UI not loading" issues
- Migrating from other ports to port 5000
- Setting up Visual Editor or development environment

❌ **Don't modify for:**
- Local development (Replit-specific)
- Production deployments (different configuration)
- Other cloud platforms (different hostname patterns)

---

**Last updated:** October 19, 2025  
**Incidents prevented:** 2 (Port mismatch, allowedHosts blocking)  
**Verification:** Automated via `scripts/agent-verification.sh`
