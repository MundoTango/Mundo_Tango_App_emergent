# Replit Deployment Patterns
**Owner:** Layer #50 (DevOps Automation)  
**Created:** October 19, 2025  
**Purpose:** Replit-specific deployment best practices and patterns

---

## 🎯 Deployment Types Comparison

### Autoscale (GCE)

**Best For:**
- Simple stateless websites
- Static content sites
- Basic REST APIs without WebSocket
- Low-traffic applications
- Serverless-style apps

**Limitations:**
- ❌ No WebSocket support
- ❌ No server memory state
- ❌ Complex build processes fail
- ❌ Backend can't import frontend dependencies
- ❌ No persistent connections
- ❌ Cold starts (0 → running when request arrives)

**Pricing:** Pay only when requests are made

---

### Reserved VM

**Best For:**
- Production applications with real-time features ✅ **Mundo Tango**
- WebSocket/Socket.io apps
- Complex build processes
- Server state management
- Long-running background jobs
- Database-heavy applications

**Features:**
- ✅ Always running (no cold starts)
- ✅ Full WebSocket support
- ✅ Server memory persistence
- ✅ Complex builds supported
- ✅ Background workers
- ✅ Full Node.js capabilities

**Pricing:** Fixed monthly cost (always running)

---

## 🚀 Mundo Tango Deployment Configuration

### Required Deployment Type

**✅ Reserved VM** - Mundo Tango MUST use Reserved VM because:

1. **WebSocket required** - Real-time notifications, Socket.io
2. **Complex build** - Vite + TypeScript + multiple entry points
3. **Server state** - Life CEO agents, caching, background jobs
4. **Production server** - index-novite.ts imports Vite dependencies
5. **Database connections** - PostgreSQL persistent connections

### Deployment Configuration

```typescript
// .replit deployment settings
{
  "deployment": {
    "type": "vm",  // Reserved VM
    "run": "npm run start",
    "build": "npm run build"
  }
}
```

### Build Command

```json
{
  "scripts": {
    "build": "tsc && vite build",
    "start": "NODE_ENV=production node dist/index.js",
    "dev": "npm run dev:server"
  }
}
```

---

## 🛠️ Deployment Process

### Step 1: Pre-Deployment Checklist

```bash
# 1. Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# 2. Verify build succeeds locally
npm run build

# 3. Check TypeScript compilation
npx tsc --noEmit

# 4. Run database migrations
npm run db:push --force

# 5. Verify environment variables
# Check Replit Secrets panel for:
# - DATABASE_URL
# - JWT_SECRET
# - ANTHROPIC_API_KEY
# - etc.
```

### Step 2: Deployment

1. Click "Deploy" button in Replit
2. Select **Reserved VM** deployment type
3. Configure:
   - **Run command:** `npm run start`
   - **Build command:** `npm run build`
4. Wait for build to complete (2-3 minutes)
5. Verify deployment health

### Step 3: Post-Deployment Verification

```bash
# 1. Check deployment logs
# Look for:
# - "Server running on port XXXX"
# - No error messages
# - Database connected

# 2. Test deployment URL
curl https://your-repl-name.repl.co/

# 3. Verify WebSocket
# Open browser console, check for Socket.io connection

# 4. Test critical endpoints
curl https://your-repl-name.repl.co/api/health
```

---

## ⚡ Performance Optimization

### Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.logs in production
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'vendor': ['other-deps']
        }
      }
    }
  }
})
```

### Server Optimization

```typescript
// Production server configuration
if (process.env.NODE_ENV === 'production') {
  // Enable compression
  app.use(compression());
  
  // Serve static files with caching
  app.use(express.static('dist', {
    maxAge: '1y',
    immutable: true
  }));
  
  // Enable HTTP/2
  // Replit handles this automatically
}
```

---

## 🔒 Security Best Practices

### Environment Variables

```bash
# ✅ Store in Replit Secrets (encrypted)
# ❌ Never commit to .env file

# Required secrets for Mundo Tango:
DATABASE_URL=postgresql://...
JWT_SECRET=random-secret-here
JWT_REFRESH_SECRET=different-secret
ANTHROPIC_API_KEY=sk-...
GEMINI_API_KEY=...
```

### CORS Configuration

```typescript
// server/index.ts
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://your-domain.repl.co'
    : 'http://localhost:5000',
  credentials: true
}));
```

### CSP Headers

```typescript
// Prevent XSS attacks
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );
  next();
});
```

---

## 📊 Monitoring & Logs

### Accessing Deployment Logs

1. Open Replit Deployments pane
2. Select active deployment
3. Click "View Logs"
4. Monitor for:
   - Errors
   - Performance issues
   - Database connection problems

### Log Patterns to Watch

```bash
# ✅ Healthy deployment
✅ Server running on port 5000
✅ Database connected
✅ WebSocket server initialized

# ❌ Problematic deployment
❌ Error: Cannot find module 'X'
❌ Database connection refused
❌ Port already in use
❌ Out of memory
```

---

## 🔄 Rollback Procedure

### If Deployment Fails

1. **Immediate:** Click "Rollback" in Deployments pane
2. **Or:** Revert to previous Git commit
3. **Then:** Fix issue locally, test, redeploy

### Deployment History

- Replit keeps last 10 deployments
- Each deployment tagged with Git commit SHA
- Can rollback to any previous deployment
- Zero downtime rollback

---

## 🚨 Common Deployment Issues

### Issue 1: Build Fails (react-router-dom)

**See:** `DEPLOYMENT_TROUBLESHOOTING.md` for full solution

**Quick Fix:**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run build
```

### Issue 2: Deployment Succeeds, App Crashes

**Symptoms:** Deployment shows success but app doesn't load

**Check:**
```bash
# 1. Verify environment variables
# 2. Check database connection
# 3. Review deployment logs
# 4. Test locally with: NODE_ENV=production npm start
```

### Issue 3: Autoscale Rejection

**Error:** "Your application imports Vite dependencies through routes"

**Solution:** Switch to Reserved VM (see top of this document)

---

## 📈 Deployment Metrics

### Expected Performance

- **Build time:** 2-3 minutes
- **First byte time:** <500ms
- **WebSocket connect:** <100ms
- **API response:** <200ms
- **Uptime:** 99.9%

### Monitoring Tools

- **Replit Analytics:** Built-in metrics
- **Custom monitoring:** Add to server/monitoring.ts
- **External:** UptimeRobot, Pingdom (optional)

---

## 🎯 Production Readiness Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Build succeeds locally
- [ ] Environment variables set in Replit Secrets
- [ ] Database migrations complete
- [ ] Reserved VM deployment type selected
- [ ] Run command: `npm run start`
- [ ] Build command: `npm run build`
- [ ] Error monitoring configured
- [ ] Backup strategy in place
- [ ] Rollback procedure tested

---

## 🔗 Custom Domain Setup

### Adding Custom Domain

1. Go to Replit Deployments
2. Click "Custom Domain"
3. Add your domain (e.g., mundotango.com)
4. Update DNS:
   ```
   Type: CNAME
   Name: @
   Value: your-repl-name.repl.co
   ```
5. Wait for DNS propagation (5-60 minutes)
6. Enable HTTPS (automatic via Let's Encrypt)

---

## 📚 Related Documentation

- `DEPLOYMENT_TROUBLESHOOTING.md` - Fixing deployment failures
- `DEPENDENCY_MANAGEMENT.md` - Managing npm dependencies
- `PREVENTION_GUIDE.md` - Preventing deployment issues
- Layer #50 docs - DevOps automation

---

**Last Updated:** October 19, 2025  
**Maintained By:** Layer #50 (DevOps Automation)
