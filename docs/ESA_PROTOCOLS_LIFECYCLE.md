# ESA Protocols Master Lifecycle
**Version:** 1.0  
**Status:** ✅ Active  
**Purpose:** Unified execution flow showing how all 6 ESA protocols integrate for agent coordination

## Overview

This document provides the master lifecycle diagram showing how all 6 ESA protocols work together to coordinate 927+ agents across the Mundo Tango platform.

---

## The Six ESA Protocols

1. **ESA_CHECK_BEFORE_BUILD** - Pre-work validation
2. **ESA_PARALLEL_BY_DEFAULT** - Concurrent execution optimization
3. **ESA_WORKLOAD_BALANCING** - Task distribution and queuing
4. **ESA_PERFORMANCE_METRICS** - Measurement and monitoring
5. **ESA_AGENT_CERTIFICATION** - Training and competency standards
6. **ESA_REUSABLE_COMPONENTS** - Code reuse and consistency

---

## Master Lifecycle Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AGENT ONBOARDING                             │
│                                                                       │
│  New Agent → Read Docs → Shadow Tasks → Pass Certification          │
│              (Protocol 6)  (Protocol 5)    (Protocol 5)              │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      TASK ASSIGNMENT                                 │
│                                                                       │
│  Queue Manager → Priority Check → Resource Check → Assign Agent     │
│                  (Protocol 3)      (Protocol 3)     (Protocol 3)     │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    PRE-WORK VALIDATION                               │
│                    (Protocol 1: CHECK_BEFORE_BUILD)                  │
│                                                                       │
│  Step 1: ✅ Critical File Integrity Check                           │
│          - Run scripts/agent-verification.sh                         │
│          - Verify no 0-byte files                                    │
│          - Confirm build system healthy                              │
│                                                                       │
│  Step 2: ✅ Dependency Health Check                                 │
│          - Verify npm packages installed                             │
│          - Check for conflicts                                       │
│                                                                       │
│  Step 3: ✅ Database Connectivity Check                             │
│          - Test DATABASE_URL connection                              │
│          - Verify Drizzle ORM access                                 │
│                                                                       │
│  Step 4: ✅ Build System Test                                       │
│          - Run TypeScript compilation (tsc --noEmit)                 │
│          - Verify all imports resolve                                │
│                                                                       │
│  Step 5: ✅ Documentation Context Check                             │
│          - Identify MB.MD phase (MAPPING/BREAKDOWN/etc.)             │
│          - Read phase-specific documentation                         │
│          - Review previous session logs                              │
│                                                                       │
│  ❌ ANY CHECK FAILS → STOP → Recover → Retry                        │
│  ✅ ALL CHECKS PASS → Proceed to Execution                          │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      TASK EXECUTION                                  │
│                 (Protocol 2: PARALLEL_BY_DEFAULT)                    │
│                                                                       │
│  Analyze Task → Check Dependencies → Choose Execution Mode          │
│                                                                       │
│  ┌──────────────────────┐         ┌──────────────────────┐         │
│  │  PARALLEL EXECUTION  │         │ SEQUENTIAL EXECUTION │         │
│  │  (Independent ops)   │         │ (Dependent ops)      │         │
│  │                      │         │                      │         │
│  │  Promise.all([       │         │  const a = await...; │         │
│  │    op1(),            │         │  const b = await...; │         │
│  │    op2(),            │         │  const c = await...; │         │
│  │    op3()             │         │                      │         │
│  │  ])                  │         │                      │         │
│  │                      │         │                      │         │
│  │  ✅ 3-5x faster      │         │  ✅ Correct order    │         │
│  │  Max 6 parallel      │         │  needed              │         │
│  └──────────────────────┘         └──────────────────────┘         │
│                                                                       │
│  (Protocol 3: Monitor system load during execution)                  │
│  (Protocol 4: Track execution metrics)                               │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE MONITORING                            │
│                   (Protocol 4: PERFORMANCE_METRICS)                  │
│                                                                       │
│  Collect Metrics:                                                    │
│  ✅ Execution time (target <10s for typical task)                   │
│  ✅ CPU usage (alert if >80%)                                       │
│  ✅ Memory usage (alert if >85%)                                    │
│  ✅ Error rate (alert if >1%)                                       │
│  ✅ Task throughput (target >100/min)                               │
│                                                                       │
│  Feed to:                                                            │
│  → PostHog Analytics Dashboard                                      │
│  → Sentry Error Tracking                                            │
│  → Performance Dashboards                                           │
│                                                                       │
│  Trigger Alerts if thresholds exceeded                               │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    POST-WORK VALIDATION                              │
│                    (Protocol 1: CHECK_BEFORE_BUILD)                  │
│                                                                       │
│  Step 1: ✅ Run scripts/verify-completion.sh                        │
│          - Check for 0-byte files                                    │
│          - Verify critical files intact                              │
│          - Test TypeScript compilation                               │
│          - Confirm server still running                              │
│                                                                       │
│  Step 2: ✅ Test Changes                                            │
│          - If UI work: Take screenshot                               │
│          - If backend: Test API routes                               │
│          - If database: Verify schema                                │
│                                                                       │
│  Step 3: ✅ Update Session Log                                      │
│          - Document what was done                                    │
│          - Log any issues encountered                                │
│          - Note learnings for next agent                             │
│                                                                       │
│  ❌ VALIDATION FAILS → Fix → Re-validate                            │
│  ✅ VALIDATION PASSES → Proceed to Review                           │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ARCHITECT REVIEW                                  │
│                                                                       │
│  Call Architect Agent for code review:                               │
│  ✅ Verify changes meet requirements                                │
│  ✅ Check for regressions                                           │
│  ✅ Validate quality standards                                      │
│  ✅ Confirm documentation updated                                   │
│                                                                       │
│  ❌ REVIEW FAILS → Address feedback → Re-review                     │
│  ✅ REVIEW PASSES → Mark task complete                              │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   WORKLOAD BALANCING FEEDBACK                        │
│                    (Protocol 3: WORKLOAD_BALANCING)                  │
│                                                                       │
│  Update Queue Metrics:                                               │
│  → Task completion time (feed to scheduler)                          │
│  → Agent utilization (adjust allocations)                            │
│  → System resource usage (scale if needed)                           │
│  → Error patterns (route similar tasks differently)                  │
│                                                                       │
│  Agent Performance Tracking:                                         │
│  → Success rate (for certification renewal)                          │
│  → Average task duration (for capacity planning)                     │
│  → Quality score (from architect reviews)                            │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CERTIFICATION MAINTENANCE                         │
│                    (Protocol 5: AGENT_CERTIFICATION)                 │
│                                                                       │
│  Continuous Tracking:                                                │
│  ✅ Task completion count                                           │
│  ✅ Error rate (must stay <1%)                                      │
│  ✅ Quality score (from reviews)                                    │
│  ✅ Compliance rate (CHECK_BEFORE_BUILD adherence)                  │
│                                                                       │
│  Triggers:                                                           │
│  → 90 days: Level 2 recertification required                         │
│  → 180 days: Level 3 recertification required                        │
│  → Error rate >5%: Immediate decertification review                  │
│  → Skip CHECK_BEFORE_BUILD: Warning + mandatory re-training          │
│                                                                       │
│  Outcome:                                                            │
│  ✅ Maintain certification → Continue work                          │
│  ❌ Fail recertification → Return to training                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Integration Points

### **Protocol 1 ↔ Protocol 3**
**CHECK_BEFORE_BUILD verifies system health → WORKLOAD_BALANCING uses health status for task assignment**

Example: If CHECK_BEFORE_BUILD detects CPU >80%, WORKLOAD_BALANCING reduces parallelism.

---

### **Protocol 2 ↔ Protocol 4**
**PARALLEL_BY_DEFAULT executes concurrently → PERFORMANCE_METRICS measures speedup**

Example: Task that previously took 500ms sequential now takes 100ms parallel (5x speedup tracked).

---

### **Protocol 3 ↔ Protocol 5**
**WORKLOAD_BALANCING tracks agent performance → AGENT_CERTIFICATION uses metrics for renewal**

Example: Agent with 99% success rate over 100 tasks qualifies for Level 3 certification.

---

### **Protocol 5 ↔ Protocol 6**
**AGENT_CERTIFICATION requires component knowledge → REUSABLE_COMPONENTS provides catalog**

Example: Page agents must demonstrate knowledge of 20+ Shadcn UI components to certify.

---

## Failure Scenarios and Recovery

### **Scenario 1: CHECK_BEFORE_BUILD Fails**

```
Agent attempts task → Pre-check fails (missing file) 
                   → STOP execution
                   → Restore file from Git
                   → Re-run pre-check
                   → ✅ Pass → Continue
```

**Metrics Impact:**
- Task blocked count +1
- Recovery time tracked
- Alert if pattern detected

---

### **Scenario 2: Parallel Execution Race Condition**

```
Agent runs parallel operations → Race condition detected
                               → Roll back transaction
                               → Switch to sequential mode
                               → Re-execute safely
                               → ✅ Complete
```

**Metrics Impact:**
- Parallel failure count +1
- Performance hit recorded
- Pattern analysis for future prevention

---

### **Scenario 3: System Overload**

```
WORKLOAD_BALANCING detects CPU >90% → Pause new P2/P3 tasks
                                     → Reduce parallelism (6→3→1)
                                     → Alert monitoring
                                     → Wait for resources
                                     → ✅ Resume when CPU <60%
```

**Metrics Impact:**
- Queue depth increases
- Task latency increases
- Capacity alert triggered

---

### **Scenario 4: Agent Certification Expiration**

```
Agent attempts task → Certification check → EXPIRED
                                          → Block task execution
                                          → Route to recertification
                                          → Pass exam + practical
                                          → ✅ Re-certified → Resume work
```

**Metrics Impact:**
- Agent downtime tracked
- Recertification success rate
- Knowledge gap analysis

---

## Performance Optimization Loop

```
┌──────────────────────────────────────────────────────────────┐
│                    CONTINUOUS IMPROVEMENT                     │
│                                                               │
│  1. MEASURE (Protocol 4):                                    │
│     - Collect performance metrics                            │
│     - Identify bottlenecks (slowest 10%)                     │
│                                                               │
│  2. ANALYZE:                                                 │
│     - Root cause analysis                                    │
│     - Pattern detection                                      │
│     - Comparison with targets                                │
│                                                               │
│  3. OPTIMIZE:                                                │
│     - Implement parallel execution (Protocol 2)              │
│     - Adjust workload distribution (Protocol 3)              │
│     - Update components (Protocol 6)                         │
│                                                               │
│  4. VALIDATE (Protocol 1):                                   │
│     - Test optimizations                                     │
│     - Measure improvement                                    │
│     - Roll back if regression                                │
│                                                               │
│  5. DOCUMENT:                                                │
│     - Update session logs                                    │
│     - Share learnings with team                              │
│     - Update training materials (Protocol 5)                 │
│                                                               │
│  Target: 10% performance improvement per sprint              │
└──────────────────────────────────────────────────────────────┘
```

---

## MB.MD Methodology Integration

The 6 ESA protocols support the MB.MD (Mapping-Breakdown-Mitigation-Deployment) methodology at each phase:

### **MAPPING Phase:**
- **CHECK_BEFORE_BUILD:** Verify system state before analysis
- **PERFORMANCE_METRICS:** Baseline current performance
- **Documentation:** Read mapping-phase docs

### **BREAKDOWN Phase:**
- **PARALLEL_BY_DEFAULT:** Identify parallelizable sub-tasks
- **REUSABLE_COMPONENTS:** Find existing components to reuse
- **WORKLOAD_BALANCING:** Estimate resource requirements

### **MITIGATION Phase:**
- **CHECK_BEFORE_BUILD:** Verify prerequisites before fixes
- **AGENT_CERTIFICATION:** Ensure agent has mitigation skills
- **Documentation:** Read mitigation-phase docs

### **DEPLOYMENT Phase:**
- **CHECK_BEFORE_BUILD:** Final validation before deploy
- **PERFORMANCE_METRICS:** Monitor deployment metrics
- **WORKLOAD_BALANCING:** Manage deployment task queue
- **Documentation:** Read deployment-phase docs

---

## Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Pre-check compliance rate | 100% | Unknown | 🔴 Needs baseline |
| Parallel execution usage | >80% | Unknown | 🔴 Needs baseline |
| Average task latency | <10s | Unknown | 🔴 Needs baseline |
| Agent error rate | <1% | Unknown | 🔴 Needs baseline |
| Certification pass rate | >70% | Unknown | 🔴 Needs baseline |
| Component reuse rate | >80% | Unknown | 🔴 Needs baseline |

**Next Steps:**
1. Implement PostHog metrics collection (Task #48)
2. Set up automated pre-check enforcement (exists: scripts/agent-verification.sh)
3. Create performance dashboards (Task #51)
4. Begin agent certification program (Task #55-59)

---

## Real-World Example: Customer Journey UI Audit

**Task:** Audit P10 Home Feed (Customer Journey J2)

```
1. CERTIFICATION CHECK
   - Agent "J2-Active-User-Audit" is Level 2 certified ✅
   
2. TASK ASSIGNMENT (WORKLOAD_BALANCING)
   - Priority: P1 (high)
   - Queue: Customer Journey queue
   - Assigned to: J2 agent
   
3. PRE-WORK VALIDATION (CHECK_BEFORE_BUILD)
   - Run agent-verification.sh → ✅ PASS
   - MB.MD Phase: MAPPING
   - Read: H2AC pattern docs, React Query docs, Home Feed spec
   
4. EXECUTION (PARALLEL_BY_DEFAULT)
   - Parallel checks:
     * Screenshot P10 page
     * Check accessibility
     * Test mobile responsive
     * Validate load performance
   - All 4 checks run simultaneously → 5x faster
   
5. PERFORMANCE MONITORING (PERFORMANCE_METRICS)
   - Total audit time: 8 seconds (target <10s) ✅
   - CPU usage: 25% (healthy) ✅
   - Memory: 300MB (healthy) ✅
   
6. POST-WORK VALIDATION (CHECK_BEFORE_BUILD)
   - Run verify-completion.sh → ✅ PASS
   - Update session log with findings
   
7. ARCHITECT REVIEW
   - Review audit report → ✅ APPROVED
   - Found 3 issues (documented for fixes)
   
8. WORKLOAD BALANCING FEEDBACK
   - J2 agent: 1 task completed successfully
   - Performance: Excellent (8s vs 10s target)
   - Quality: High (architect approved)
   
9. CERTIFICATION TRACKING
   - J2 agent: 21/100 tasks completed (Level 2 progress)
   - Error rate: 0% (excellent)
   - Next recertification: 69 days
```

**Total time:** 8 seconds (vs 40 seconds if sequential)  
**Result:** 5x speedup using PARALLEL_BY_DEFAULT protocol

---

## Protocol Ownership

| Protocol | Primary Owner | Secondary Owners |
|----------|--------------|------------------|
| CHECK_BEFORE_BUILD | Documentation Agent (#52) | All Division Chiefs |
| PARALLEL_BY_DEFAULT | CEO Agent (#0) | Intelligence Division |
| WORKLOAD_BALANCING | CEO Agent (#0) | Infrastructure Orchestrator |
| PERFORMANCE_METRICS | Platform Enhancement (#8) | Layer #48 |
| AGENT_CERTIFICATION | CEO Agent (#0) | All Division Chiefs |
| REUSABLE_COMPONENTS | UI/UX Division (#5) | Layer #9, #10 |

---

## Version History

- **1.0** (Oct 19, 2025): Initial master lifecycle created
- Future: Add visual diagrams, automation scripts, dashboard templates

---

**Document Owner:** CEO Agent (#0) + Documentation Agent (#52)  
**Review Cycle:** Monthly or after protocol updates  
**Last Updated:** October 19, 2025
