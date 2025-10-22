# Agent #127 - Deployment Safety Engineer

**Type:** Operational Agent  
**Category:** DevOps & Production Safety  
**Created:** October 22, 2025  
**Status:** Active

---

## 🎯 Purpose

Ensure zero-downtime deployments with pre-flight validation, automatic rollback, and comprehensive health monitoring.

**Core Mission:** Deploy safely like Replit's publishing system - validate, snapshot, deploy, monitor, rollback if needed.

---

## 🔧 Responsibilities

### 1. **Deployment Type Detection**
- Analyze project structure (React SPA vs Express API)
- Auto-suggest deployment type:
  - **Static:** HTML/CSS/JS sites, React SPAs
  - **Autoscale:** APIs with variable traffic
  - **Reserved VM:** Apps needing dedicated resources
- Calculate cost estimates per deployment type

### 2. **Pre-Flight Validation**
- Run build command (must succeed)
- Check environment variables (all required set)
- Validate dependencies (no missing packages)
- Estimate resource needs (CPU/RAM)
- Run functional tests (minimum 8 pass)

### 3. **Snapshot System**
- Create pre-deploy backup:
  - All workspace files
  - Database state (schema + data)
  - Conversation context
  - Environment configuration
- Enable instant rollback if deployment fails

### 4. **Health Monitoring**
- Monitor for 5 minutes post-deploy:
  - HTTP endpoint health checks (every 30s)
  - Response time < 500ms
  - Error rate < 1%
  - CPU/RAM usage normal
- Auto-rollback if 3 consecutive failures

### 5. **Deployment Dashboard**
- **Overview Tab:** Status, domain, type, uptime
- **Logs Tab:** Real-time streaming logs with filters
- **Resources Tab:** CPU/RAM usage graphs
- **Analytics Tab:** Page views, top URLs, request duration

---

## 📋 Implementation Details

### **API Endpoints**
- `POST /api/deploy/preflight` - Pre-flight validation checks
- `POST /api/deploy/execute` - Execute deployment
- `GET /api/deploy/health` - Health check endpoint
- `POST /api/deploy/rollback` - Rollback to previous snapshot
- `GET /api/deploy/logs` - Stream deployment logs
- `GET /api/deploy/status` - Current deployment status
- `POST /api/deploy/snapshot` - Create pre-deploy snapshot

### **Frontend Components**
- `DeploymentTypeSelector` - Choose Static/Autoscale/VM with cost estimates
- `DeploymentConfigScreen` - Domain, build cmd, run cmd, secrets
- `DeploymentDashboard` - Overview/Logs/Resources/Analytics tabs
- `SnapshotManager` - View and restore snapshots

### **Backend Processing**
```typescript
// Pre-flight validation
async function runPreFlightChecks() {
  const checks = {
    build: await testBuild(),
    envVars: await checkEnvironmentVariables(),
    dependencies: await validateDependencies(),
    tests: await runFunctionalTests(),
    resources: await estimateResourceNeeds()
  };
  
  const failed = Object.entries(checks)
    .filter(([_, result]) => !result.passed);
  
  if (failed.length > 0) {
    throw new PreFlightError(failed);
  }
  
  return { canDeploy: true, checks };
}

// Health monitoring
async function monitorDeployment(deploymentId: string) {
  for (let i = 0; i < 10; i++) { // 5 minutes (30s intervals)
    await sleep(30000);
    const health = await checkHealth(deploymentId);
    
    if (!health.healthy) {
      consecutiveFailures++;
      if (consecutiveFailures >= 3) {
        await rollback(deploymentId);
        throw new DeploymentError('Auto-rollback triggered');
      }
    } else {
      consecutiveFailures = 0;
    }
  }
}
```

---

## 🧪 Testing Protocol

### **Minimum 8 Functional Tests Required:**

1. **Build Failure Blocks Deployment**
   - Introduce build error → Verify deploy blocked

2. **Missing Env Vars Detection**
   - Remove required var → Verify preflight fails

3. **Deployment Type Detection**
   - React SPA → Verify suggests "Static"
   - Express API → Verify suggests "Autoscale"

4. **Snapshot Creation**
   - Deploy → Verify snapshot contains files + DB + config

5. **Health Check Monitoring**
   - Deploy → Verify 10 health checks over 5 minutes

6. **Auto-Rollback on Failure**
   - Deploy broken code → Verify auto-rollback triggers

7. **Cost Estimation Accuracy**
   - Estimate cost → Deploy → Verify within 10% of actual

8. **Logs Streaming**
   - Deploy → Verify real-time logs appear in dashboard

---

## 📊 Success Metrics

- ✅ 0 deployments with missing env vars
- ✅ 100% health checks pass (or auto-rollback)
- ✅ Cost estimates within 10% of actual
- ✅ Rollback completes in < 2 minutes
- ✅ Zero downtime during deployments

---

## 🔗 Integration Points

**Coordinates With:**
- **Agent #79 (Quality Validator)** - Validates code before deploy
- **Agent #126 (Git Operations)** - Ensures code committed before deploy
- **Agent #80 (Learning Coordinator)** - Learns from deployment patterns
- **Visual Editor** - Provides Deploy Dashboard in sidebar

**Reports To:**
- Agent #79 for quality validation
- Agent #0 for coordination

---

## 📝 Example User Journey

```
User Flow:
1. User clicks "Deploy" button in Visual Editor
2. Agent #127 analyzes project:
   - "Detected: React SPA"
   - "Suggested: Static Deployment"
   - "Estimated cost: $3/month"
3. User reviews configuration:
   - Domain: myapp.replit.app
   - Build: npm run build
   - Public dir: dist/
4. Pre-flight checks run:
   ✅ Build succeeded
   ✅ All env vars set
   ✅ 8/8 tests passed
   ✅ Resources estimated
5. Snapshot created: "Pre-deploy backup ready"
6. Deployment executes:
   - Streaming logs appear
   - Progress: 25% → 50% → 75% → 100%
7. Health monitoring (5 minutes):
   - 10/10 checks passed ✅
8. Dashboard shows:
   - Status: Live ✅
   - URL: myapp.replit.app
   - Uptime: 99.9%
```

---

## 🚀 Dependencies

- Docker (for containerized deployments)
- Replit Deployments API (or custom deployment service)
- PostgreSQL for snapshot storage
- WebSocket for log streaming

---

## 🔒 Safety Guarantees

1. **Never deploy without snapshot** - Rollback always available
2. **Never skip pre-flight checks** - Build must succeed
3. **Auto-rollback on failure** - 3 consecutive health failures
4. **User confirmation required** - For destructive operations
5. **Encrypted secrets** - Never log environment variables

---

## 📖 Documentation

- Implementation: `docs/DEPLOYMENT_WORKFLOW_COMPLETE.md`
- Testing: `docs/ESA_AGENT_TESTING_PROTOCOL.md`
- User Guide: `docs/VisualEditor/DEPLOYMENT_USER_GUIDE.md`

---

**Last Updated:** October 22, 2025  
**Next Review:** After 25 deployments logged
