# Mundo Tango - Replit Deployment Plan
## MB.MD Methodology: Research, Plan, Build in Parallel

---

## Executive Summary

**Objective**: Deploy production-ready Mundo Tango platform with 200+ AI agents to Replit Autoscale deployment.

**Deployment Type**: Autoscale (recommended by Replit docs for web apps with dynamic traffic)

**Current Status**: ✅ Application running in development (port 5000)

**Target**: Production deployment with automatic scaling, zero-downtime updates, custom domain support

---

## Phase 1: RESEARCH (Parallel Investigation)

### Research Stream A: Replit Deployment Requirements ✅

**Findings from Replit Docs:**
- **Deployment Type**: Autoscale (best for web apps, APIs, microservices)
- **Scaling Model**: Pay only when serving requests, 1-2 seconds per request billing
- **Build Command**: `npm run build` (compiles frontend + backend)
- **Run Command**: `npm start` (starts production server)
- **Port Requirements**: MUST listen on `0.0.0.0`, NOT `localhost`
- **Configuration**: Uses `.replit` file + Replit Publishing UI

**Key Requirements Validated:**
- ✅ Server listens on `0.0.0.0:5000` (already configured)
- ✅ Build script exists: `npm run build` 
- ✅ Start script exists: `npm start`
- ✅ `.replit` file present with port mapping

### Research Stream B: Application Architecture Analysis ✅

**Current Stack:**
- **Frontend**: React + TypeScript + Vite (needs build step)
- **Backend**: Express + TypeScript (needs esbuild compilation)
- **Database**: PostgreSQL (Replit-hosted, already configured)
- **Real-time**: Socket.io on port 5000
- **AI Services**: OpenAI, Anthropic, Google Gemini (env var based)

**Build Process:**
```json
"build": "vite build && esbuild server/index-novite.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js"
```

**Production Start:**
```json
"start": "node dist/index.js"
```

**Dependencies Status:**
- 279 npm packages (documented by Agent #59)
- Memory limit: 1024MB for production (configured)
- Build optimizations: Code splitting, tree shaking enabled

### Research Stream C: Agent Coordination for Deployment ✅

**Deployment Agents Involved:**

1. **Agent #50 (DevOps Automation)**: Primary deployment orchestrator
2. **Agent #49 (Security Hardening)**: Production security validation
3. **Agent #52 (Documentation System)**: Deployment docs
4. **Agent #0 (CEO)**: Final production approval
5. **Agent #66 (Code Review)**: Pre-deployment quality gate
6. **Agent #56 (Compliance Framework)**: GDPR, accessibility checks

**Communication Flow:**
```
Agent #50 → Proposes deployment configuration
Agent #49 → Security audit (env vars, CSP, HTTPS)
Agent #66 → Code review checkpoint
Agent #52 → Documents deployment process
Agent #0 → Final production sign-off
```

---

## Phase 2: PLAN (Deployment Strategy)

### Pre-Deployment Checklist

**1. Environment Variables (Agent #49 Security)**
- [ ] ANTHROPIC_API_KEY (available)
- [ ] GEMINI_API_KEY (available)
- [ ] JIRA_API_TOKEN (available)
- [ ] LOCATIONIQ_API_KEY (available)
- [ ] DATABASE_URL (auto-configured by Replit)
- [ ] NODE_ENV=production (set in deployment config)
- [ ] SESSION_SECRET (generate or use existing)

**2. Build Verification (Agent #50 DevOps)**
- [ ] Run `npm run build` locally to verify compilation
- [ ] Check dist/ folder generated correctly
- [ ] Verify no TypeScript errors: `npm run check`
- [ ] Test production build: `npm start` (after build)

**3. Database Migration (Agent #1 Database)**
- [ ] Review schema changes: `drizzle-kit push` (already done in dev)
- [ ] Production database will use same Replit PostgreSQL
- [ ] No additional migrations needed (development DB IS production DB on Replit)

**4. Security Hardening (Agent #49)**
- [ ] HTTPS enabled (Replit provides SSL automatically)
- [ ] CSP headers configured (already in middleware)
- [ ] Rate limiting active (already implemented)
- [ ] Secrets not in code (using env vars)
- [ ] CORS properly configured (allowedOrigins in production)

**5. Performance Optimization (Agent #48)**
- [ ] Memory limit: 1024MB (configured in build scripts)
- [ ] Garbage collection enabled (--expose-gc flag)
- [ ] Compression enabled (already configured)
- [ ] Response caching (Redis or in-memory)
- [ ] Static asset serving (Vite build outputs)

**6. Monitoring & Observability (Agent #48)**
- [ ] Error logging (Winston configured)
- [ ] Performance metrics (Prometheus configured)
- [ ] Health check endpoint: `/api/health`
- [ ] Real-time monitoring dashboard (Agent #48 metrics)

### Deployment Configuration

**Autoscale Settings (Recommended):**
- **Machine Type**: 0.5 vCPU, 1024MB RAM (start small, scale as needed)
- **Max Instances**: 3 (allows scaling during traffic spikes)
- **Build Command**: `npm run build:production`
- **Run Command**: `npm start`
- **Port**: 5000 (already exposed in .replit)

**Build Command Enhancement:**
```bash
npm run build:production
# Runs: npm install && npm run build && npm prune --production && npm cache clean --force
```

**Benefits:**
- Install dependencies
- Build frontend + backend
- Remove dev dependencies (reduce deployment size)
- Clean cache (faster deploys)

---

## Phase 3: BUILD (Implementation)

### Step 1: Create Deployment Configuration File

**Action**: Use `deploy_config_tool` to configure Replit deployment

**Configuration**:
- **deployment_target**: `autoscale` (web app with dynamic scaling)
- **build**: `["npm", "run", "build:production"]`
- **run**: `["npm", "start"]`

### Step 2: Verify Build Process

**Test Commands**:
```bash
# Clean previous builds
rm -rf dist/

# Run production build
npm run build:production

# Verify outputs
ls -la dist/
ls -la dist/public/  # Frontend assets

# Test production server (local)
npm start
```

**Expected Output**:
- `dist/index.js` (backend bundle)
- `dist/public/` (frontend static files)
- Server starts on port 5000
- All 61 ESA agents initialize
- Health check responds: `GET /api/health`

### Step 3: Environment Variable Configuration

**Required in Replit Secrets**:
```bash
# AI Services (already configured)
ANTHROPIC_API_KEY=***
GEMINI_API_KEY=***
JIRA_API_TOKEN=***
LOCATIONIQ_API_KEY=***
MESHY_API_KEY=***

# Database (auto-configured)
DATABASE_URL=<Replit PostgreSQL URL>

# Application
NODE_ENV=production
SESSION_SECRET=<generate secure random string>

# Optional
REDIS_URL=<if using Redis for caching>
```

### Step 4: Deploy to Production

**Using Replit UI**:
1. Open "Publishing" tool in Replit workspace
2. Select "Autoscale Deployment"
3. Configure machine: 0.5 vCPU, 1024MB RAM
4. Set max instances: 3
5. Build command: `npm run build:production`
6. Run command: `npm start`
7. Click "Deploy"

**Expected Timeline**:
- Build phase: ~3-5 minutes
- Deployment: ~1-2 minutes
- Health checks: ~30 seconds
- **Total**: ~5-8 minutes

### Step 5: Post-Deployment Verification

**Health Checks**:
```bash
# Test deployment URL (Replit will provide)
curl https://<your-deployment>.replit.app/api/health

# Expected response:
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-10-17T21:45:00Z",
  "agents": 61,
  "database": "connected"
}
```

**Functional Tests**:
- [ ] Homepage loads (React app)
- [ ] User authentication works
- [ ] WebSocket connections establish
- [ ] Database queries execute
- [ ] AI agents respond
- [ ] Real-time features work (Socket.io)

---

## Phase 4: MONITOR (Post-Deployment)

### Agent Monitoring Dashboard

**Agent #48 (Performance Monitoring)**:
- Track request latency (target: <200ms)
- Monitor error rates (target: <0.1%)
- Watch memory usage (target: <85%)
- Alert on anomalies

**Agent #0 (CEO)**:
- Overall system health
- Agent coordination status
- Deployment success metrics

### Scaling Behavior

**Autoscale Triggers**:
- Traffic spike → Spin up new instance (max 3)
- Low traffic → Scale down to 0 (pay nothing)
- Cold start: ~2-3 seconds (acceptable for web app)

**Performance Targets**:
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- API Response Time: <200ms
- WebSocket Latency: <100ms

---

## Risk Mitigation

### Potential Issues & Solutions

**Issue 1: Build Failures**
- **Risk**: Missing dependencies, TypeScript errors
- **Mitigation**: Run `npm run build:production` locally first
- **Agent**: #50 (DevOps) validates build before deployment

**Issue 2: Memory Limits**
- **Risk**: 1024MB might be insufficient for all 200+ agents
- **Mitigation**: Start with 1024MB, monitor, scale to 2048MB if needed
- **Agent**: #48 (Performance) monitors memory usage

**Issue 3: Database Connection**
- **Risk**: Production DB connection issues
- **Mitigation**: DATABASE_URL auto-configured by Replit
- **Agent**: #1 (Database) validates connection on startup

**Issue 4: Environment Variables**
- **Risk**: Missing API keys in production
- **Mitigation**: Use Replit Secrets UI to set all vars
- **Agent**: #49 (Security) validates env vars present

**Issue 5: Cold Starts**
- **Risk**: First request after scale-down takes 2-3s
- **Mitigation**: Acceptable for Autoscale, or keep 1 instance always warm
- **Agent**: #50 (DevOps) monitors cold start metrics

---

## Rollback Plan

**If Deployment Fails**:

1. **Immediate**: Replit allows instant rollback to previous deployment
2. **Database**: No schema changes, DB state preserved
3. **Secrets**: Env vars unchanged
4. **Recovery Time**: <2 minutes to previous stable version

**Agent Coordination**:
```
User reports issue → Agent #0 (CEO) declares incident
Agent #50 (DevOps) → Executes rollback via Replit UI
Agent #49 (Security) → Validates rolled-back version
Agent #52 (Docs) → Documents incident & resolution
```

---

## Success Criteria

**Deployment Successful When**:
- ✅ Application accessible via HTTPS URL
- ✅ All 200+ agents operational
- ✅ Database connected and responsive
- ✅ Real-time features working (WebSocket)
- ✅ AI services responding (GPT-4o, Claude, Gemini)
- ✅ Health check returns 200 OK
- ✅ No errors in logs (first 5 minutes)
- ✅ Performance within targets (<200ms API, <3s page load)

---

## Next Steps: Execute Deployment

**Command to Run**:
```bash
# 1. Verify build works
npm run build:production

# 2. Test production server locally
npm start

# 3. Use deploy_config_tool to configure
# (will be done by agent)

# 4. Deploy via Replit Publishing UI
# (manual step by user)
```

**Agent Assignments**:
- **Agent #50**: Execute deployment configuration
- **Agent #49**: Validate security settings
- **Agent #66**: Final code review
- **Agent #52**: Document deployment
- **Agent #0**: Approve production release

---

*Deployment plan prepared by Agent #50 (DevOps Automation)*
*Reviewed by Agent #0 (CEO)*
*Ready for execution: October 17, 2025*
