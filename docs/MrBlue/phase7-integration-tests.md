# Phase 7 Integration Tests - MB.MD V2 Methodology

## Research-First Validation Framework

### Test Philosophy
Following MB.MD V2 principles: Evidence-based, parallel execution, systematic validation

---

## Track 1: Autonomous Cycle Validation

### Test Scenario: Database Migration Auto-Fix
**Agent**: Backend Specialist (Agent #3)
**Trigger**: Intentional schema validation failure
**Expected Flow**:
1. ✅ Test execution detects schema mismatch
2. 🤖 Auto-Fix Engine proposes migration
3. 🧠 ML Confidence Scorer evaluates (target: 75%+)
4. ✅ Validation confirms fix
5. 📚 Learning captured in database

**Success Criteria**:
- Auto-fix automation rate: >80%
- ML confidence score: >75%
- Learning persisted with metadata
- Total cycle time: <30 seconds

---

## Track 2: Cross-Division Collaboration

### Test Scenario: API Performance Optimization
**Agents**: 
- Frontend Performance Specialist (Division 2)
- Backend Infrastructure Specialist (Division 1)
- Database Optimization Specialist (Division 3)

**Trigger**: Slow API endpoint detected (>500ms)
**Expected Flow**:
1. 📊 3 agents submit solutions with confidence scores
2. 🗳️ Voting system applies weighted consensus (70% threshold)
3. 🏆 Best solution selected based on expertise + confidence
4. 📡 Inter-agent communication logged
5. 📈 Collaborative metrics updated

**Success Criteria**:
- All 3 agents participate
- Consensus reached within 60 seconds
- Winner confidence score: >85%
- Communication protocol verified

---

## Track 3: Agent Detail Page Navigation

### Test Scenario: Individual Agent Dashboard
**Agent**: UI/UX Specialist (Agent #15)
**Route**: `/agent-intelligence/agent-15`

**5-Tab Validation**:
1. **Overview Tab**: Agent metadata, role, division, expertise
2. **Tests Tab**: Self-test history, pass/fail rates
3. **Learnings Tab**: Captured patterns, confidence scores
4. **Fixes Tab**: Auto-fix history, success rates
5. **Metrics Tab**: Performance KPIs, trends

**Success Criteria**:
- All tabs render without errors
- Data loaded from API endpoints
- Real-time updates functional
- Navigation smooth (<100ms transitions)

---

## MB.MD V2 Validation Metrics

### Parallel Execution Efficiency
- **Target**: 3 tests complete within 90 seconds total
- **Method**: Concurrent API calls, parallel validation

### Evidence Collection
- API response times logged
- Database queries monitored
- Console errors tracked
- Success rates calculated

### Decision Framework
| Metric | Target | Action if Failed |
|--------|--------|------------------|
| Auto-Fix Rate | >80% | Tune confidence thresholds |
| Consensus Time | <60s | Optimize voting algorithm |
| UI Load Time | <2s | Add caching layer |
| ML Accuracy | >75% | Retrain similarity model |

---

## Test Execution Commands

```bash
# Track 1: Autonomous Cycle
curl -X POST http://localhost:5000/api/agent-intelligence/auto-fix/trigger \
  -H "Content-Type: application/json" \
  -d '{"agentId": "agent-3", "testType": "schema-validation", "scenario": "migration-failure"}'

# Track 2: Collaboration
curl -X POST http://localhost:5000/api/agent-intelligence/collaboration/trigger \
  -H "Content-Type: application/json" \
  -d '{"scenario": "api-performance", "agentIds": ["agent-2-1", "agent-1-3", "agent-3-2"]}'

# Track 3: Agent Detail
curl http://localhost:5000/api/agent-intelligence/registry/agents/agent-15
```

---

## Expected Results Timeline

**T+0s**: Tests initiated in parallel
**T+10s**: Track 1 auto-fix proposed
**T+20s**: Track 2 agents voting
**T+30s**: Track 1 complete, learning captured
**T+45s**: Track 2 consensus reached
**T+60s**: Track 3 UI validation complete
**T+90s**: All evidence collected, report generated

---

## Phase 7 Acceptance Criteria

✅ **Functional**: All 17 API endpoints operational
✅ **Intelligence**: ML confidence scoring active
✅ **Collaboration**: Cross-agent communication working
✅ **UI**: 8-tab main + 5-tab detail pages rendering
✅ **Performance**: <2s page load, <500ms API responses
✅ **Learning**: Patterns captured and retrievable
✅ **Autonomy**: >80% auto-fix success rate

---

**Next Phase**: Phase 8 - Production Deployment & Monitoring
