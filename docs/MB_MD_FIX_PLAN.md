# MB.MD Integration: Complete Fix Plan
**Created:** October 27, 2025
**Status:** MAPPING → BREAKDOWN → MITIGATION → DEPLOYMENT

## 🎯 **ARCHITECT FINDINGS**
Three critical gaps preventing deployment:
1. **Security:** Unauthenticated file uploads
2. **Integration:** Services don't orchestrate together
3. **API:** Dashboard has no data source

---

## 📋 **DETAILED PLAN (BREAKDOWN Phase)**

### **Fix 1: Add Authentication + Session Scoping (5 min)**
**File:** `server/routes/mbmdRoutes.ts`
**Changes:**
- Add `isAuthenticated` middleware to `/evidence/upload-file`
- Scope presigned URLs to `evidence/{userId}/{sessionId}/` format
- Validate session ownership before generating upload URL

**Code:**
```typescript
router.post('/evidence/upload-file', isAuthenticated, async (req: any, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
  
  // Verify session belongs to user
  const session = await db.select().from(mbmdSessions)
    .where(and(eq(mbmdSessions.id, sessionId), eq(mbmdSessions.userId, req.user.id)))
    .limit(1);
  if (!session[0]) return res.status(403).json({ error: 'Session not found' });
  
  const uploadURL = await objectStorageService.getObjectEntityUploadURL(
    `evidence/${req.user.id}/${sessionId}/`
  );
});
```

---

### **Fix 2: Create MBMDSessionManager (15 min)**
**File:** `server/services/mbmd/SessionManager.ts`
**Purpose:** Orchestrate all MB.MD services end-to-end

**Interface:**
```typescript
class MBMDSessionManager {
  // Session lifecycle
  async startSession(feature: string, userId: number, executionMode: string): Promise<Session>
  async completeSession(sessionId: number, status: 'complete' | 'failed'): Promise<void>
  
  // Evidence management
  async recordEvidence(sessionId: number, phase: string, evidence: Evidence): Promise<void>
  async getSessionEvidence(sessionId: number): Promise<Evidence[]>
  
  // Review orchestration
  async requestReview(sessionId: number, reviewer: string, phase: string): Promise<Review>
  async submitReview(reviewId: number, approved: boolean, feedback: string): Promise<void>
  
  // Integration points
  async notifyChatMapping(sessionId: number, mappingResult: any): Promise<void>
  async notifyVisualEditorMapping(sessionId: number, mappingResult: any): Promise<void>
  async notifyVibeGraphPhase(sessionId: number, phase: string, data: any): Promise<void>
}
```

---

### **Fix 3: Dashboard Data Endpoint (5 min)**
**File:** `server/routes/mbmdRoutes.ts`
**Changes:**
- Add `GET /api/mbmd/dashboard` endpoint
- Return sessions, evidence count, stats

**Code:**
```typescript
router.get('/dashboard', isAuthenticated, async (req: any, res) => {
  const sessions = await db.select().from(mbmdSessions)
    .where(eq(mbmdSessions.userId, req.user.id))
    .orderBy(desc(mbmdSessions.startedAt))
    .limit(20);
  
  const stats = {
    total: sessions.length,
    completed: sessions.filter(s => s.status === 'complete').length,
    inProgress: sessions.filter(s => s.status === 'in-progress').length,
    complianceRate: /* calculate */ 100
  };
  
  res.json({ sessions, stats });
});
```

---

### **Fix 4: Wire Services to SessionManager (10 min)**
**Files:**
- `server/services/chat/ChatMappingAgent.ts`
- `server/services/visualEditor/VisualEditorContextMapper.ts`
- `server/services/agents/VibeGraph.ts`

**Changes:**
- Inject `sessionManager` into all services
- Call `sessionManager.notifyX()` after each phase
- Record evidence automatically

---

### **Fix 5: Security Audit (5 min)**
**File:** `server/routes/mbmdRoutes.ts`
**Changes:**
- Add authentication checks to ALL endpoints
- Validate session ownership
- Add rate limiting

---

## ⏱️ **TIMELINE**
- **Total Time:** 40 minutes
- **Execution:** SIMULTANEOUS (all tasks in parallel)
- **Validation:** 10 minutes testing

---

## ✅ **SUCCESS CRITERIA**
1. All endpoints require authentication ✅
2. File uploads scoped to user/session ✅
3. Dashboard loads with real data ✅
4. Services orchestrate through SessionManager ✅
5. End-to-end test passes ✅

---

## 🚀 **EXECUTION ORDER (SIMULTANEOUS)**
```
Task 1: Fix authentication      → 5 min
Task 2: Build SessionManager    → 15 min  } ALL IN
Task 3: Dashboard endpoint      → 5 min   } PARALLEL
Task 4: Wire services          → 10 min  }
Task 5: Security audit         → 5 min   }
─────────────────────────────────────────
TOTAL: 15 min (longest task = SessionManager)
```

## 🎯 **DEPLOYMENT VALIDATION**
- [ ] Screenshot dashboard loading
- [ ] Test file upload with auth
- [ ] Test session creation → evidence → review
- [ ] Run integration tests
- [ ] Architect review

---

**Status:** READY TO BUILD ✅
