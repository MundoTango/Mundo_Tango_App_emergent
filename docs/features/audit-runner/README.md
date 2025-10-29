# ESA Audit Runner System
**Agent #65 (Project Tracker Manager) - Build Documentation**

## 📋 Overview

The ESA Audit Runner is an automated system that executes comprehensive 43-agent audits following the ESA 105-Agent System with 61-Layer Framework framework, identifies issues, and automatically generates **Human Review Stories** with comprehensive metadata for the Project Tracker.

### Purpose
- **Audit Pages**: Run standardized ESA 105-Agent System with 61-Layer Framework audits on any page
- **Auto-Generate Stories**: Convert audit findings into actionable human review stories
- **Track Quality**: Systematically validate all AI-built features through human review
- **Enable Transparency**: Provide full audit trail with agent assignments, review notes, and documentation

## 🏗️ Architecture

### Components

```
server/
├── audit/
│   ├── types.ts                     # Type definitions
│   ├── audit-runner.ts              # Main orchestrator (43 agents in parallel)
│   ├── story-generator.ts           # Converts findings → stories
│   └── utils/
│       ├── category-mapper.ts       # ESA layers → 8 review categories
│       └── escalation-path.ts       # Agent hierarchy resolver
├── routes/
│   └── audit.ts                     # API endpoints
```

### Data Flow

```
1. User Triggers Audit
   ↓
2. Audit Runner (43 agents in parallel)
   ├── Phase 1: 14 Methodology Audits
   ├── Phase 2: 21 Gap Analysis Checks
   └── Phase 3: 8 Extended Dimensions
   ↓
3. Findings Collection & Scoring
   ↓
4. Story Generator (if score < 70 or severity high/critical)
   ├── Categorize by ESA layers → Review Category
   ├── Generate comprehensive metadata
   ├── Calculate story points & effort
   └── Create project tracker items
   ↓
5. Stories Saved to Database
   ↓
6. Appear in Project Tracker for Human Review
```

## 📊 43-Agent Audit System

### Phase 1: Methodology Audits (14 Agents)

| Agent # | Name | ESA Layers | Pass Threshold | Focus |
|---------|------|------------|----------------|-------|
| #1 | Performance Optimization | 1, 48 | 70 | Core Web Vitals, bundle size, lazy loading |
| #2 | Frontend Architecture | 2, 8 | 90 | React Query, TypeScript, component patterns |
| #3 | Background Processing | 3, 12 | 75 | Async operations, job queues |
| #4 | Real-time Communications | 11, 16 | 85 | WebSocket, polling, reconnection |
| #5 | Business Logic | 5, 21-30 | 90 | Auth, validation, error handling |
| #6 | Search & Analytics | 6, 15, 18 | 85 | Search, filters, analytics |
| #7 | Platform Orchestration | 7-9 | 90 | Error boundaries, resilience |
| #10 | AI Research | 31-46 | 80 | AI integration, cost optimization |
| #11 (17) | UI/UX Design (Aurora Tide) | 9, 11, 54 | 85 | Aurora Tide, dark mode, i18n |
| #12 | Data Visualization | 18 | 80 | Charts, responsive viz |
| #13 | Media Optimization | 13, 19 | 80 | Image compression, WebP |
| #14 | Code Quality | 51, 49 | 75 | TypeScript, ESLint, security |
| #15 | Developer Experience | 52 | 75 | Documentation, patterns |
| #16 | Translation & i18n | 53 | 85 | 68 languages, RTL support |

### Phase 2: Gap Analysis (21 Lightweight Checks)
- Layers 1-21 validation
- Quick compliance checks
- Integration verification

### Phase 3: Extended Dimensions (8 Checks)
- Dependency health
- API contract validation
- Cross-page consistency
- User flow validation
- Security deep dive
- Performance budget
- Technical debt score
- Internationalization coverage

## 🎯 Story Generation

### When Stories are Created

```typescript
if (finding.severity === "critical" || 
    finding.severity === "high" || 
    finding.score < 70) {
  createHumanReviewStory(finding);
}
```

### Story Metadata (11 Sections)

#### 1. Core Identification
- `key`: Story key (e.g., "MUN-EVENTS-AUDIT-STORY-001")
- `summary`: Human-readable title
- `description`: Detailed explanation with context

#### 2. Required Fields (Your 3 Items)
- `assigned_agent_id`: Agent that found the issue
- `review_notes`: Validation checklist and edge cases
- `documentation_links`: References to approved patterns

#### 3. ESA Framework Tracking
- `esa_layers`: Affected ESA layers [8, 9, 10]
- `implementation_phase`: Phase in 40x20s framework
- `quality_checkpoints`: Gates that failed
- `checkpoint_status`: "pass" | "fail" | "partial"

#### 4. Performance & Quality Metrics
- `current_metrics`: Current state {"dark_mode": "52%"}
- `target_metrics`: Target state {"dark_mode": "100%"}
- `gap_percentage`: 48
- `success_criteria`: ["All cards have dark: variants", ...]

#### 5. Risk & Impact Assessment
- `risk_level`: "critical" | "high" | "medium" | "low"
- `risk_description`: Business/technical impact
- `impact_scope`: ["User Experience", "Accessibility"]
- `affected_users`: "~200 users (40% use dark mode)"
- `business_impact`: Impact on revenue/reputation

#### 6. Complexity & Effort Estimation
- `complexity`: "high" | "medium" | "low"
- `complexity_factors`: ["Multi-layer changes (3 layers)"]
- `story_points`: 1 | 2 | 3 | 5 | 8 | 13 | 21
- `estimated_hours`: points × 2
- `estimated_tasks`: ceil(points / 2)

#### 7. Technical Details
- `technologies`: ["React", "Tailwind CSS"]
- `tools_required`: ["GlassCard from @/components/glass"]
- `affected_files`: ["client/src/pages/EventsPage.tsx"]
- `code_complexity`: "Refactor 3 files across multiple layers"
- `api_endpoints`: ["/api/events"]

#### 8. Audit Trail & Compliance
- `audit_type`: "ESA 105-Agent System with 61-Layer Framework Framework Audit"
- `audit_date`: Date
- `audited_by_agent`: 17
- `compliance_requirements`: ["WCAG 2.1 AA"]
- `compliance_status`: "non-compliant"

#### 9. Human Review Workflow
- `review_category`: One of 8 categories
- `review_checklist`: ["☐ Apply dark: variants", ...]
- `acceptance_criteria`: Success conditions
- `manual_testing_required`: true
- `expert_review_needed`: true
- `expert_agents`: [11] (Agent #11 approval)

#### 10. Status & Progress Tracking
- `status`: "to_do" | "in_progress" | "in_review" | "done"
- `blocked_by`: Dependencies/blockers
- `tasks_completed`: 0
- `tasks_total`: 3
- `review_progress`: 0%
- `sprint_id`: null
- `target_release`: "v2.2.0"

#### 11. Collaboration & Communication
- `collaborating_agents`: [17, 11]
- `escalation_path`: "Agent #17 → Domain #2 → Chief #1 → Agent #0"
- `a2a_messages`: [] (Agent-to-agent communication)
- `lessons_learned`: []
- `reusable_patterns`: ["events page pattern"]

## 🏷️ 8 Review Categories

Stories are automatically categorized based on affected ESA layers:

| Category | ESA Layers | Focus Areas |
|----------|------------|-------------|
| **Architecture & Data Integrity** | 1-6 | Database, API design, security, data safety |
| **UI/UX & Accessibility** | 8-10, 54 | Aurora Tide, WCAG 2.1 AA, dark mode, responsive |
| **Business Logic & Security** | 21-30, 49 | Workflows, edge cases, XSS/CSRF, vulnerabilities |
| **API & Performance** | 2, 12, 13, 48 | External APIs, file uploads, performance metrics |
| **AI Intelligence** | 31-46 | AI accuracy, prompt engineering, token usage |
| **Content & i18n** | 19, 53 | 68 languages, cultural sensitivity, RTL |
| **Testing & QA** | 51 | Test coverage, E2E, regression, error handling |
| **Documentation & Compliance** | 52, 56 | API docs, GDPR, licenses, legal |

## 🔗 API Endpoints

### POST /api/audit/run
Trigger a new audit for a page.

**Request:**
```json
{
  "page": "events",
  "mode": "full",
  "generate_stories": true
}
```

**Response:**
```json
{
  "audit_id": "audit_2025-10-11_events",
  "overall_score": 73,
  "certification_status": "CONDITIONAL",
  "stories_generated": 8,
  "story_ids": ["MUN-EVENTS-AUDIT-STORY-001", ...],
  "report_url": "/api/audit/audit_2025-10-11_events"
}
```

### GET /api/audit/:id
Retrieve audit results by ID.

### GET /api/audit
List all audit reports.

## 📈 Scoring System

### Overall Score Calculation
```typescript
overall_score = avg(all_agent_scores)
```

### Certification Status
- **90-100**: ✅ CERTIFIED (Production ready)
- **70-89**: ⚠️ CONDITIONAL (Minor improvements needed)
- **0-69**: ❌ NEEDS WORK (Significant issues)

### Consensus Calculation
```typescript
consensus = (passing_agents / total_agents) × 100
```

## 🚀 Usage Examples

### Example 1: Audit Events Page
```bash
# Via API
curl -X POST /api/audit/run \
  -H "Content-Type: application/json" \
  -d '{
    "page": "events",
    "mode": "full",
    "generate_stories": true
  }'

# Result
{
  "overall_score": 73,
  "certification_status": "CONDITIONAL",
  "stories_generated": 3
}
```

### Example 2: Audit Result → Generated Story

**Audit Finding:**
- Agent #17 (UI/UX)
- Score: 65 (below 70 threshold)
- Issue: Missing Aurora Tide components

**Generated Story:**
```
Title: Human Review: Missing Aurora Tide Design System Components
Agent: #17 (UI/UX Design)
Category: UI/UX & Accessibility

Description:
Page uses plain shadcn components instead of Aurora Tide (GlassCard, 
MTButton). No MT Ocean gradients or glassmorphic effects. This violates 
Aurora Tide 100% coverage requirement.

Review Checklist:
☐ Replace all Card with GlassCard
☐ Add MT Ocean gradients (turquoise → ocean → blue)
☐ Add glassmorphic-card backdrop-blur-xl classes
☐ Implement complete dark mode variants

Story Points: 2
Estimated Hours: 4
Expert Review: Agent #11 (Aurora Tide) approval required

Escalation Path:
Agent #17 → Domain #2 (Frontend) → Chief #1 → Agent #0 (ESA CEO)
```

## 🔄 Integration with Project Tracker

Stories are saved as **Project Tracker Items** with:

```typescript
{
  type: "Story",
  layer: "Layer 8,9,11",
  tags: ["MUN-EVENTS-AUDIT", "agent-17", "UI/UX & Accessibility"],
  priority: "high",
  estimatedHours: 4,
  metadata: {
    assigned_agent_id: 17,
    review_notes: "...",
    documentation_links: [...],
    review_category: "UI/UX & Accessibility",
    story_points: 2,
    // ... all 11 sections of metadata
  }
}
```

## 📝 Best Practices

### When to Run Audits
1. **After Major Features**: Audit new pages/features before production
2. **Weekly Quality Checks**: Run audits on key pages regularly
3. **Pre-Release**: Audit all pages before major releases
4. **Post-Refactor**: Verify refactoring didn't introduce issues

### Human Review Process
1. **Review Story**: Check auto-generated findings
2. **Validate Recommendations**: Verify suggested fixes are correct
3. **Test Edge Cases**: Manual testing per review checklist
4. **Expert Consultation**: Involve expert agents (e.g., Agent #11 for UI)
5. **Approve & Implement**: Mark story complete after validation

### Escalation Path
```
Story Created (Agent X)
   ↓ (if blocked or complex)
Domain Coordinator Review
   ↓ (if strategic decision needed)
Division Chief Approval
   ↓ (if platform-wide impact)
Agent #0 (ESA CEO) Decision
```

## 🎯 Success Metrics

### Audit Quality
- **Agent Coverage**: 43 agents executed
- **Consensus**: >90% agent approval
- **Confidence**: Low variance in scores

### Story Quality
- **Comprehensive Metadata**: All 11 sections populated
- **Actionable**: Clear review checklist
- **Traceable**: Full audit trail & escalation path

## 🔍 Troubleshooting

### Low Audit Scores
1. Check agent-specific findings
2. Review affected ESA layers
3. Compare with approved patterns
4. Consult expert agents

### Story Generation Issues
1. Verify finding severity/score thresholds
2. Check project tracker integration
3. Validate metadata completeness

## 📚 Related Documentation

- **ESA Framework**: `/docs/platform-handoff/esa.md`
- **Standardized Audit**: `/docs/pages/esa-tools/standardized-page-audit.md`
- **Project Tracker**: `/docs/platform-handoff/ESA_AGENT_65_PROJECT_TRACKER.md`
- **Agent Org Chart**: `/docs/platform-handoff/ESA_AGENT_ORG_CHART.md`
- **Approved Patterns**: `/docs/platform-handoff/approved-patterns-2025-10-10.md`

---

**Built by Agent #65 (Project Tracker Manager)**  
**ESA 105-Agent System with 61-Layer Framework Framework - Human Review System**  
**Last Updated: October 11, 2025**
