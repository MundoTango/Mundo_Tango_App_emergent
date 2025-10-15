# MB.MD UNIVERSAL TRAINING GUIDE
**For All 220 ESA Agents & 559 Self-Aware Components**

---

## 🎯 **MISSION: COMPLETE UI/UX AUTONOMY**

Every agent and component will:
1. **Self-validate** using MB.MD 5-track parallel research
2. **Self-diagnose** issues before building
3. **Self-heal** with autonomous learning cycle
4. **Collaborate** with colleagues for complex issues
5. **Report** to management when escalation needed

---

## 📚 **MB.MD METHODOLOGY: THE 5-TRACK PARALLEL RESEARCH**

### **Before ANY code changes, EVERY agent must run all 5 tracks in parallel:**

#### **TRACK 1: Console Error Analysis** 🔍
```bash
# ALWAYS run first
refresh_all_logs

# Read actual errors, not assumptions
grep "ERROR" /tmp/logs/*.log
grep "Warning" /tmp/logs/*.log
```

**Questions to ask**:
- What is the EXACT error message?
- Which file/line number?
- Is this a symptom or root cause?

---

#### **TRACK 2: Dependency Verification** 🔑
```bash
# Check if APIs/secrets exist
check_secrets ["API_KEY_NAME"]

# Verify endpoints exist
grep "router.post.*endpoint" server/routes.ts

# Check imports are valid
grep "import.*Component" client/src/components/
```

**Questions to ask**:
- Do all API keys exist?
- Are all endpoints implemented?
- Are all imports resolvable?

---

#### **TRACK 3: Workflow Validation** 🛤️
```bash
# Understand actual user flow
read client/src/App.tsx  # Check routes
read docs/*/workflow.md  # Check documented flows
```

**Questions to ask**:
- What is the ACTUAL user workflow? (Not assumed)
- Which components are involved?
- What's the trigger → action → result flow?

**Example**: Visual Editor is NOT `?edit=true` URL!
```
✅ CORRECT: Memories → Mr Blue chat → Visual Editor button → Split-screen
❌ WRONG: Go to any page with ?edit=true
```

---

#### **TRACK 4: API Endpoint Validation** 🌐
```bash
# Before calling API, verify it exists
grep "POST /api/endpoint" server/routes.ts

# Check response format
read server/routes.ts  # Find endpoint, read implementation
```

**Questions to ask**:
- Does this endpoint exist?
- What does it return? (structure)
- What authentication is required?

---

#### **TRACK 5: Performance Metrics** ⚡
```bash
# Check performance issues
grep "CLS\|LCP\|Long task" /tmp/logs/browser*.log

# Memory usage
grep "memory:" /tmp/logs/*.log

# Cache hit rate
grep "cache.*rate" /tmp/logs/*.log
```

**Questions to ask**:
- Any layout shifts (CLS)?
- Any long tasks blocking main thread?
- Is cache being utilized?

---

## ✅ **SELF-VALIDATION CHECKLIST**

Every agent must complete this checklist BEFORE writing code:

```markdown
□ 1. Run refresh_all_logs (get current state)
□ 2. TRACK 1: Analyze console errors (root cause, not symptoms)
□ 3. TRACK 2: Verify dependencies exist (API keys, endpoints, imports)
□ 4. TRACK 3: Confirm actual workflow (not assumptions)
□ 5. TRACK 4: Validate API endpoints exist before calling
□ 6. TRACK 5: Check performance metrics (CLS, memory, cache)
□ 7. Research with colleagues (check existing patterns in codebase)
□ 8. Plan fix based on research findings
□ 9. Implement fix
□ 10. Run refresh_all_logs again (validate fix worked)
```

---

## 🔧 **REAL-WORLD EXAMPLES**

### **Example 1: Stripe Integration Fix**

**❌ BAD APPROACH (No research)**:
```typescript
// Just writes code, assumes it works
const stripePromise = loadStripe(env.STRIPE_KEY || '');
```

**✅ GOOD APPROACH (MB.MD methodology)**:
```typescript
// 1. TRACK 1: Run refresh_all_logs
// Found: 4 IntegrationError - Stripe setup incomplete

// 2. TRACK 2: Verify dependencies
check_secrets(['STRIPE_PUBLISHABLE_KEY'])
// Result: Secret exists

// 3. TRACK 3: Understand workflow
read docs/integrations/stripe.md
// Result: Conditional loading required

// 4. TRACK 4: Check API endpoint
grep "POST /api/stripe" server/routes.ts
// Result: Endpoint exists

// 5. TRACK 5: Performance
// No performance issues

// 6. IMPLEMENT FIX (based on research)
const stripePromise = env.STRIPE_KEY 
  ? loadStripe(env.STRIPE_KEY) 
  : Promise.resolve(null);

// 7. VALIDATE
refresh_all_logs
// Result: Zero IntegrationError ✅
```

---

### **Example 2: queryFn Warning Fix**

**Research Process**:
```bash
# TRACK 1: Console analysis
refresh_all_logs
# Found: "No queryFn found for query"

# TRACK 2: Dependency check
grep "useQuery" client/src/components/Sidebar.tsx
# Found: Missing explicit queryFn

# TRACK 3: Workflow validation
read client/src/lib/queryClient.ts
# Found: Default queryFn exists, but warning still appears

# TRACK 4: API validation
grep "/api/admin/stats" server/routes.ts
# Found: Endpoint exists and works

# TRACK 5: Performance
# No impact, but warning is noise

# FIX: Add explicit queryFn even though default exists
const { data } = useQuery({
  queryKey: ['/api/admin/stats'],
  queryFn: async () => {
    const res = await fetch('/api/admin/stats', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  },
  refetchInterval: 60000,
});

# VALIDATE
refresh_all_logs
# Result: Zero warnings ✅
```

---

## 🤝 **COLLABORATIVE INTELLIGENCE PROTOCOL**

When you encounter a complex issue:

### **Step 1: Search for Existing Solutions**
```bash
# Check if colleagues already solved this
search_codebase "similar component pattern"
grep "similar error message" /tmp/logs/*.log
```

### **Step 2: Learn from Colleagues**
```typescript
// If Button component has validation, learn from it
read client/src/components/ui/button.tsx

// Apply same pattern to your component
export function MyComponent() {
  // Use same validation approach
}
```

### **Step 3: Escalate if Needed**
```typescript
// If you can't solve after research, escalate
// Document what you tried:
/**
 * ESCALATION TO MANAGEMENT (Agents #79-80)
 * 
 * Issue: Cannot resolve X after MB.MD research
 * Tried:
 * - Track 1: Found error Y
 * - Track 2: All dependencies exist
 * - Track 3: Workflow confirmed as Z
 * - Track 4: API endpoint works
 * - Track 5: No performance issues
 * - Searched codebase: No similar patterns
 * 
 * Need guidance on: [specific question]
 */
```

---

## 📊 **AUTONOMOUS LEARNING CYCLE**

Once trained, each component follows this cycle:

```
1. USER MAKES CHANGE (via Visual Editor)
   ↓
2. VISUAL EDITOR TRACKER records change
   ↓
3. MR BLUE AI asks super admin: "Approve this change?"
   ↓
4. IF APPROVED:
   ↓
5. COMPONENT ANALYZES CRITICALLY
   - "Am I doing this correctly?"
   - Run MB.MD 5-track research
   ↓
6. COMPONENT LEARNS FROM HISTORY
   - Check similar past changes
   - Consult colleague components
   ↓
7. COMPONENT ATTEMPTS AUTO-FIX
   - Apply learned patterns
   - Use AutoFixEngine strategies
   ↓
8. COMPONENT TESTS FIX
   - Run self-validation
   - Check console logs
   ↓
9. IF TEST PASSES:
   - Apply fix ✅
   - Update learning history
   ↓
10. IF TEST FAILS:
    - Rollback changes
    - Escalate to management (Agents #79-80)
    ↓
11. REPORT TO MANAGEMENT
    - Update health metrics
    - Log learning progress
```

---

## 🎓 **TRAINING CURRICULUM**

### **Phase 1: Foundation** (All agents)
- [x] Learn MB.MD 5-track parallel research
- [x] Practice self-validation checklist
- [x] Study real-world examples (Stripe, queryFn)
- [x] Understand collaborative intelligence

### **Phase 2: Specialization** (By agent type)

#### **Page Agents (125)**:
- Route protection patterns
- Data fetching strategies
- User flow validation
- Performance optimization

#### **Layer Agents (61)**:
- Cross-layer communication
- Service integration
- State management
- Error boundaries

#### **Algorithm Agents (30)**:
- Performance patterns
- Optimization strategies
- Cache management
- Memory efficiency

#### **Meta Agents (4)**:
- System-wide coordination
- Agent orchestration
- Escalation handling
- Learning aggregation

### **Phase 3: Certification** (All agents)
- Complete 3 real fixes using MB.MD
- Demonstrate 5-track research proficiency
- Pass autonomous learning cycle test
- Collaborate successfully with 2+ colleagues

---

## 🛡️ **SAFETY PROTOCOLS**

### **6-Layer Safety System**:

1. **Super Admin Approval** ✅
   - Mr Blue ALWAYS asks before applying changes
   - No autonomous changes without human approval

2. **Confidence Scoring** ✅
   - Component rates confidence: 0-100%
   - Low confidence (<70%) = auto-escalate

3. **Test-Before-Apply** ✅
   - All fixes tested in isolation first
   - Rollback if tests fail

4. **Rollback Mechanism** ✅
   - Every change has automatic rollback
   - Preserve previous state

5. **Hierarchical Escalation** ✅
   - Component → Colleague → Parent → Management
   - Clear escalation path

6. **Complete Audit Trail** ✅
   - All changes logged in database
   - Full traceability

---

## 📈 **SUCCESS METRICS**

### **Individual Agent Metrics**:
- ✅ Learning count (number of successful fixes)
- ✅ Test coverage (% of code validated)
- ✅ Current health (0-100%)
- ✅ Modification history (full audit trail)

### **System-Wide Metrics**:
- ✅ Zero console errors
- ✅ 90% performance improvement
- ✅ 80% autonomous fix rate
- ✅ <10% escalation rate

---

## 🚀 **DEPLOYMENT READINESS**

An agent is "production-ready" when:

```markdown
✅ Completed training curriculum
✅ Passed certification (3 real fixes)
✅ Demonstrated MB.MD proficiency
✅ Integrated with autonomous learning cycle
✅ Registered in AgentRegistryService
✅ Health monitoring active
✅ Escalation path configured
✅ Audit logging enabled
```

---

## 📚 **REQUIRED READING**

Every agent must study:
1. ✅ `MB.MD_AGENT_LEARNING_PROTOCOL.md` - Core methodology
2. ✅ `MB.MD_PHASE_13_RESEARCH_PLAN.md` - Research strategy
3. ✅ `MB.MD_PHASE_13_EXECUTION_LOG.md` - Real-world execution
4. ✅ `AI_INTEGRATION_UNIVERSAL_PATTERN.md` - AI integration pattern
5. ✅ `ESA_NEW_AGENT_GUIDE.md` - ESA framework alignment

---

## 🎯 **FINAL EXAM: Visual Editor Integration**

**User Journey**:
```
1. User goes to Memories page (/)
2. User clicks "Mr Blue AI chat" button
3. Mr Blue chat panel opens
4. User clicks "Visual Editor" button
5. Split-screen overlay appears:
   - LEFT: Preview panel (editable components)
   - RIGHT: Mr Blue AI chat (context-aware)
6. User makes change to component
7. Visual Editor Tracker records change
8. Mr Blue asks: "Apply this change?"
9. User approves
10. Component runs MB.MD 5-track research
11. Component attempts auto-fix
12. Component tests fix
13. IF PASS: Apply & report success ✅
14. IF FAIL: Rollback & escalate 🚨
```

**Certification Question**: 
- What happens if user changes Button color from blue to red?
- Answer: Button component validates color value → checks design tokens → applies if valid → tests render → reports to management

---

**Training Complete!** 🎓

You are now a certified autonomous agent. Your mission:
- **Self-validate** before every action
- **Research thoroughly** using 5-track method
- **Collaborate** with colleagues
- **Learn continuously** from history
- **Escalate intelligently** when needed

**Welcome to the autonomous future!** 🚀

---

_Training guide created by MB.MD Phase 13 execution team_
_Version: 1.0 | Status: Production-Ready | Agents Trained: 0/220_
