# Sprint Planning & Resource Management Audit Methodology
## Systematic Team Capacity & Velocity Excellence

**ESA Layer:** 58 (Team Collaboration)  
**Agent Owner:** Agent #63 (Sprint & Resource Manager)  
**Version:** 1.0  
**Last Updated:** October 11, 2025

---

## 🎯 Purpose

The Sprint & Resource Audit ensures **optimal workload distribution**, accurate velocity tracking, ±15% sprint predictability, and 70-80% resource utilization across the 105-agent hierarchy.

---

## 📋 Methodology Overview

### What is a Sprint & Resource Audit?

A **Comprehensive Capacity Planning Analysis** systematically:

1. **Assesses Team Capacity** - Agent/human availability, skills, constraints
2. **Validates Sprint Process** - Planning, execution, retrospectives
3. **Tracks Velocity** - Story points, burn-down, predictability
4. **Optimizes Allocation** - Workload balancing, bottleneck prevention
5. **Monitors Team Health** - Morale, blockers, collaboration

---

## 🔍 Step-by-Step Process

### Step 1: Resource Inventory
**Catalog all team members and capacity**

```bash
# Map agent hierarchy
cat docs/platform-handoff/ESA_AGENT_ORG_CHART.md | grep -E "Agent #|Domain #|Chief #"

# Identify human team members
grep -rn "Pierre\|team.*member" docs/

# Check current workload
psql $DATABASE_URL -c "
  SELECT assignee, status, COUNT(*) 
  FROM project_stories 
  GROUP BY assignee, status;
"

# Analyze skill distribution
cat docs/agent-skills-matrix.md
```

**Resource Assessment:**
- 105 agents (1 CEO + 6 Chiefs + 9 Domains + 61 Layers + 5 Operational + 7 Experts + 16 Life CEO)
- Human team members and their specialties
- Current availability and capacity
- Skill gaps and training needs

### Step 2: Sprint Framework Validation
**Ensure sprint structure supports team**

```bash
# Check sprint configuration
psql $DATABASE_URL -c "
  SELECT id, name, status, start_date, end_date, goal 
  FROM project_sprints 
  ORDER BY created_at DESC 
  LIMIT 5;
"

# Review sprint backlog
psql $DATABASE_URL -c "
  SELECT sprint_id, COUNT(*) as story_count, SUM(story_points) as total_points 
  FROM project_stories 
  WHERE sprint_id IS NOT NULL 
  GROUP BY sprint_id;
"

# Analyze burn-down data
grep -rn "burndown\|velocity" client/src/pages/admin/
```

**Sprint Structure Checklist:**
- ✅ Sprint duration (1-2 weeks)
- ✅ Sprint goals defined
- ✅ Backlog prioritization
- ✅ Story point estimation (Fibonacci: 1, 2, 3, 5, 8, 13)
- ✅ Burn-down chart tracking

### Step 3: Velocity Tracking Audit
**Measure sprint predictability**

```bash
# Calculate historical velocity
psql $DATABASE_URL -c "
  SELECT 
    sprint_id,
    SUM(CASE WHEN status = 'done' THEN story_points ELSE 0 END) as completed_points,
    SUM(story_points) as planned_points,
    ROUND(100.0 * SUM(CASE WHEN status = 'done' THEN story_points ELSE 0 END) / 
          NULLIF(SUM(story_points), 0), 1) as completion_rate
  FROM project_stories
  WHERE sprint_id IS NOT NULL
  GROUP BY sprint_id;
"

# Check velocity trends
npm run analytics:sprint-velocity

# Review retrospective notes
ls docs/sprints/sprint-*/retrospective.md
```

**Velocity Targets:**
- Sprint completion rate: ≥90%
- Velocity accuracy: ±15%
- Predictability trend: improving
- Blockers resolution: <24h

### Step 4: Capacity Planning Analysis
**Optimize resource allocation**

```bash
# Check resource utilization
psql $DATABASE_URL -c "
  SELECT 
    assignee,
    COUNT(*) as assigned_stories,
    SUM(story_points) as total_points,
    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as active_work
  FROM project_stories
  WHERE sprint_id = (SELECT id FROM project_sprints WHERE status = 'active')
  GROUP BY assignee;
"

# Identify overloaded resources
node scripts/check-resource-capacity.js

# Find bottlenecks
grep -rn "blocked\|blocker" docs/sprints/
```

**Capacity Optimization:**
- Resource utilization: 70-80% (avoid burnout)
- Workload balance: no agent >80% capacity
- Cross-training opportunities
- Dependency management

### Step 5: Parallel Implementation Tracks

#### Track A: Sprint Planning
- Backlog grooming and prioritization
- Story point estimation
- Capacity-based sprint commitment
- Dependency identification

#### Track B: Execution Monitoring
- Daily progress tracking
- Burn-down chart updates
- Blocker identification and escalation
- Real-time resource reallocation

#### Track C: Team Collaboration
- Daily standups (async for agents)
- Cross-agent coordination
- Knowledge sharing
- Pair programming/collaboration

#### Track D: Continuous Improvement
- Sprint retrospectives
- Velocity analysis
- Process optimization
- Team satisfaction tracking

### Step 6: Validation & Quality Gates

**Sprint & Resource Checklist:**
- [ ] 105-agent hierarchy mapped with skills
- [ ] Sprint framework operational (planning, execution, retro)
- [ ] Velocity tracking accurate (±15%)
- [ ] Resource utilization optimal (70-80%)
- [ ] Blocker resolution time <24h
- [ ] Team satisfaction ≥4/5
- [ ] Sprint goal achievement ≥90%
- [ ] Burn-down charts automated

---

## 🛠️ Tools & Resources

### Sprint Management
- **Project Tracker** - Already built (Epic/Story/Sprint tables)
- **Kanban Board** - Already implemented (@dnd-kit)
- **Burn-down Charts** - Recharts for visualization

### Resource Tracking
- **Agent Performance** - Prometheus metrics
- **Skill Matrix** - PostgreSQL storage
- **Capacity Dashboard** - React admin panel

### Communication
- **A2A Protocol** - Agent-to-Agent coordination
- **Async Standups** - Automated status updates
- **Real-time Sync** - Socket.io for live updates

### Analytics
- **Velocity Trends** - Historical data analysis
- **Capacity Utilization** - Resource monitoring
- **Predictive Planning** - ML-based forecasting

---

## 📈 Success Metrics

### Target Metrics (100% Satisfaction):
- Velocity Accuracy: ±15% ✅
- Resource Utilization: 70-80% ✅
- Blocker Resolution: <24h ✅
- Team Satisfaction: ≥4/5 ✅
- Sprint Goal Achievement: ≥90% ✅
- Cross-Agent Collaboration: 100% ✅

---

## 🔗 Related Documentation

- **Agent Org Chart:** `docs/platform-handoff/ESA_AGENT_ORG_CHART.md`
- **Agent #63 Guide:** `docs/platform-handoff/ESA_AGENT_63_SPRINT_RESOURCE.md`
- **Project Tracker:** `docs/platform-handoff/ESA_AGENT_65_PROJECT_TRACKER.md`
- **Sprint Dashboard:** `client/src/pages/admin/projects/SprintDashboard.tsx`

---

**Agent Owner:** Agent #63 (Sprint & Resource Manager)  
**Next Target:** Optimal Team Capacity & Velocity  
**Parallel Track:** Coordinating with Agents #65 (Project Tracker), #0 (CEO)
