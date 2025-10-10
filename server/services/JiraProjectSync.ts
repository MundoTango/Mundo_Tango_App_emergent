import { JiraDirectAPI } from './JiraDirectAPI';

export interface JiraEpic {
  id?: string;
  key?: string;
  summary: string;
  description: string;
  projectKey: string;
  status?: string;
  labels?: string[];
}

export interface JiraStory {
  id?: string;
  key?: string;
  summary: string;
  description: string;
  epicKey?: string;
  status?: string;
  assignee?: string;
  labels?: string[];
}

export interface JiraTask {
  id?: string;
  key?: string;
  summary: string;
  description: string;
  parentKey?: string;
  status?: string;
  labels?: string[];
}

export class JiraProjectSync {
  private projectKey: string = 'MUN';
  private api: JiraDirectAPI;
  
  constructor() {
    this.api = new JiraDirectAPI();
  }
  
  async syncProjectPlan() {
    console.log('🔄 Starting Jira project sync...');
    
    try {
      // Test connection first
      const connectionTest = await this.api.testConnection();
      if (!connectionTest.success) {
        throw new Error(`Jira connection failed: ${connectionTest.error}`);
      }
      console.log(`✅ Connected as: ${connectionTest.user?.displayName}`);
      
      const project = await this.ensureProjectExists();
      console.log(`✅ Project confirmed: ${project.key}`);
      
      const epics = await this.createEpics();
      console.log(`✅ Created ${epics.length} epics`);
      
      const stories = await this.createStories(epics);
      console.log(`✅ Created ${stories.length} stories`);
      
      console.log('✨ Jira sync complete!');
      
      return {
        project,
        epics,
        stories,
        summary: {
          projectKey: this.projectKey,
          epicsCreated: epics.length,
          storiesCreated: stories.length
        }
      };
    } catch (error) {
      console.error('❌ Jira sync failed:', error);
      throw error;
    }
  }

  private async ensureProjectExists() {
    try {
      const project = await this.api.getProject(this.projectKey);
      return project;
    } catch (error) {
      console.log('Project not found, you may need to create it manually in Jira');
      throw new Error('Project does not exist. Please create MUN project in Jira first.');
    }
  }

  private async createEpics(): Promise<any[]> {
    const epics = [
      {
        summary: 'EPIC 1: Documentation Infrastructure',
        description: `Complete documentation for ESA 61x21 framework including hierarchical mentorship model, Resume AI integration, and A2A performance tracking.
        
**Status:** COMPLETE ✅
**Completed:** October 10, 2025
**Agent Lead:** Division Chief #5 (Platform) + Expert #15 (DevEx)

**Stories:**
- Hierarchical Mentorship Model (ESA_NEW_AGENT_GUIDE.md)
- Resume AI Integration (esa.md + ESA_AGENT_RESUME_AI.md)
- A2A Performance Tracking (ESA_AGENT_A2A_PROTOCOL.md)`,
        status: 'Done',
        labels: ['phase-1', 'documentation', 'esa-framework']
      },
      {
        summary: 'EPIC 2: Technical Infrastructure',
        description: `Build LangGraph orchestration and BullMQ task coordination for 100-agent ESA hierarchy.

**Status:** COMPLETE ✅
**Completed:** October 10, 2025
**Agent Lead:** Division Chief #1 (Foundation) + Chief #6 (Extended)

**Stories:**
- LangGraph Agent Orchestration (100-agent graph)
- BullMQ Task Coordination (6 queues, graceful shutdown)`,
        status: 'Done',
        labels: ['phase-2', 'infrastructure', 'langgraph', 'bullmq']
      },
      {
        summary: 'EPIC 3: Baseline Audit & Discovery',
        description: `Comprehensive audit of 97 production pages discovering 314 issues with priority matrix.

**Status:** COMPLETE ✅
**Completed:** October 10, 2025
**Agent Lead:** Chief #5 (Platform) + Agent #59 (Open Source Management)

**Issues:** 314 total (0 critical, 116 high, 92 medium, 106 low)
**Coverage Gaps:** Data-testid 37%, ARIA 43%, Error Boundaries 5%, SEO 6%`,
        status: 'Done',
        labels: ['phase-3', 'audit', 'quality-assurance']
      },
      {
        summary: 'EPIC 4: Squad Formation & Training',
        description: `Form 7 mentor squads with 14 certified agents ready for parallel execution.

**Status:** COMPLETE ✅
**Completed:** October 10, 2025
**Agent Lead:** Division Chief #5 + All Domain Coordinators

**Squads:**
1. Resilience (92 pages) - Agents 7+15
2. SEO (91 pages) - Agents 55+54
3. Testing (61 pages) - Agents 53+14
4. Accessibility (55 pages) - Agents 51+11
5. Design (14 pages) - Agents 11+2
6. Performance (97 pages) - Agents 1+6
7. Security (97 pages) - Agents 5+12`,
        status: 'Done',
        labels: ['phase-4', 'squad-formation', 'training']
      },
      {
        summary: 'EPIC 5: Hybrid Blitz Execution',
        description: `Deploy 7 squads in parallel to remediate 314 issues across 97 pages.

**Status:** READY TO START
**Agent Lead:** Agent #0 (ESA Orchestrator) + Agent #62 (Resume AI)

**Target Impact:**
- 314 issues → <50 (84% reduction)
- Data-testid: 37% → 95%
- ARIA: 43% → 90%
- Error Boundaries: 5% → 100%
- SEO: 6% → 95%

**Timeline:** Week 4-6 (awaiting human approval)`,
        status: 'To Do',
        labels: ['phase-5', 'execution', 'parallel', 'awaiting-approval']
      }
    ];

    const createdEpics = [];
    for (const epic of epics) {
      try {
        const issue = await this.api.createEpic(this.projectKey, {
          summary: epic.summary,
          description: epic.description
        });
        createdEpics.push({ ...epic, id: issue.id, key: issue.key });
        console.log(`  ✓ Created epic: ${issue.key} - ${epic.summary}`);
      } catch (error: any) {
        console.error(`  ✗ Failed to create epic: ${epic.summary}`, error.message);
      }
    }

    return createdEpics;
  }

  private async createStories(epics: any[]): Promise<any[]> {
    const stories = [
      {
        epicIndex: 0,
        summary: 'Story 1.1: Hierarchical Mentorship Model',
        description: `Document 5-level training cascade enabling 14 certified agents → 40+ new agents in 4-5 days.

**File:** docs/platform-handoff/ESA_NEW_AGENT_GUIDE.md
**Status:** DONE ✅

**Tasks Completed:**
- [x] 5-level cascade (CEO → Chiefs → Domains → Layers → New)
- [x] Peer mentoring (Level 4 - most effective)
- [x] 4-5 day certification (480x faster than bootcamps)
- [x] Exponential scaling (14 → 40+ agents)`,
        status: 'Done',
        labels: ['documentation', 'mentorship', 'training']
      },
      {
        epicIndex: 0,
        summary: 'Story 1.2: Resume AI Integration',
        description: `Create Agent #62 (Resume AI) for human review workflow and Jira project management.

**Files:** 
- docs/platform-handoff/esa.md
- docs/platform-handoff/ESA_AGENT_RESUME_AI.md
- docs/jira-project-plan.md

**Status:** DONE ✅

**Created:**
- [x] Agent #62 following ESA_NEW_AGENT_GUIDE.md
- [x] Human review workflow
- [x] Jira integration architecture
- [x] Performance metrics structure
- [x] Quality control checkpoints`,
        status: 'Done',
        labels: ['resume-ai', 'agent-62', 'jira-integration']
      },
      {
        epicIndex: 0,
        summary: 'Story 1.3: A2A Performance Tracking',
        description: `Implement real-time agent performance monitoring with Prometheus, BullMQ, and LangGraph.

**File:** docs/platform-handoff/ESA_AGENT_A2A_PROTOCOL.md
**Status:** DONE ✅

**Integrated:**
- [x] Prometheus metrics (prom-client)
- [x] BullMQ job tracking
- [x] LangGraph state monitoring
- [x] Real-time dashboard (/admin/agent-metrics)`,
        status: 'Done',
        labels: ['monitoring', 'metrics', 'performance']
      },
      {
        epicIndex: 1,
        summary: 'Story 2.1: LangGraph Agent Orchestration',
        description: `Build executable graph for 100-agent ESA hierarchy with hierarchical routing.

**File:** server/services/LangGraphAgentOrchestrator.ts
**Status:** DONE ✅

**Implemented:**
- [x] 100-agent structure (1 CEO + 6 Chiefs + 9 Domains + 61 Layers + 7 Experts + 16 Life CEO)
- [x] Hierarchical routing (CEO → Chiefs by layer range)
- [x] State management (MemorySaver checkpoints)
- [x] Conditional edges (task-based routing)
- [x] Zero LSP errors`,
        status: 'Done',
        labels: ['langgraph', 'orchestration', 'infrastructure']
      },
      {
        epicIndex: 1,
        summary: 'Story 2.2: BullMQ Task Coordination',
        description: `Setup 6 task queues with graceful shutdown and Redis safety checks.

**File:** server/lib/bullmq-config.ts
**Status:** DONE ✅

**Configured:**
- [x] 6 isolated queues (email, image, analytics, notifications, dataSync, metrics)
- [x] Graceful shutdown with Redis safety
- [x] Queue event monitoring
- [x] Retry logic (exponential backoff)
- [x] Zero LSP errors`,
        status: 'Done',
        labels: ['bullmq', 'task-queue', 'infrastructure']
      },
      {
        epicIndex: 2,
        summary: 'Story 3.1: Page Registry Sync',
        description: `Sync 6 certified pages with audit history and quality scores.

**File:** docs/pages/page-audit-registry.json
**Status:** DONE ✅

**Synced Pages:**
- [x] Housing Marketplace (88)
- [x] Auth Login (82)
- [x] Profile (85)
- [x] Home Dashboard (78)
- [x] Life CEO Enhanced (85)
- [x] Groups (82)`,
        status: 'Done',
        labels: ['audit', 'registry', 'baseline']
      },
      {
        epicIndex: 2,
        summary: 'Story 3.2: Automated Audit Script',
        description: `Create comprehensive audit script scanning 97 pages for 6 quality categories.

**File:** scripts/audit/baseline-audit.ts
**Status:** DONE ✅

**Discovered:** 314 issues (0 critical, 116 high, 92 medium, 106 low)
**Coverage Gaps:** Data-testid 37%, ARIA 43%, Error Boundaries 5%, SEO 6%`,
        status: 'Done',
        labels: ['audit', 'automation', 'quality-check']
      },
      {
        epicIndex: 2,
        summary: 'Story 3.3: Issue Prioritization Matrix',
        description: `Generate priority matrix and coverage gap analysis for all 314 issues.

**Files:**
- docs/audit-reports/baseline-audit-2025-10-10.json
- docs/audit-reports/baseline-audit-2025-10-10.md

**Status:** DONE ✅

**Priorities:** Resilience (92 pages), SEO (91), Testing (61), Accessibility (55)`,
        status: 'Done',
        labels: ['prioritization', 'reporting', 'analysis']
      },
      {
        epicIndex: 3,
        summary: 'Story 4.1: Resilience Squad (92 pages)',
        description: `Add error boundary protection to 92 pages missing resilience.

**Mentor Agents:** #7 (Platform Orchestration) + #15 (DevEx)
**Priority:** HIGH
**Target:** 100% error boundary coverage
**Status:** READY TO DEPLOY

**Scope:**
- [ ] Add error boundaries to all pages
- [ ] Implement graceful degradation
- [ ] Create fallback UI components
- [ ] Test error recovery flows`,
        status: 'To Do',
        labels: ['squad-1', 'resilience', 'error-boundaries', 'high-priority']
      },
      {
        epicIndex: 3,
        summary: 'Story 4.2: SEO Squad (91 pages)',
        description: `Add SEO optimization to 91 pages missing meta tags.

**Mentor Agents:** #55 (SEO) + #54 (i18n Coverage)
**Priority:** HIGH
**Target:** 95% SEO coverage
**Status:** READY TO DEPLOY

**Scope:**
- [ ] Add SEO Helmet with titles/descriptions
- [ ] Implement Open Graph tags
- [ ] Add structured data (JSON-LD)
- [ ] Validate with Lighthouse`,
        status: 'To Do',
        labels: ['squad-2', 'seo', 'meta-tags', 'high-priority']
      },
      {
        epicIndex: 3,
        summary: 'Story 4.3: Testing Squad (61 pages)',
        description: `Add data-testid coverage to 61 pages for TestSprite AI.

**Mentor Agents:** #53 (TestSprite) + #14 (Code Quality)
**Priority:** HIGH
**Target:** 95% test coverage
**Status:** READY TO DEPLOY

**Scope:**
- [ ] Add data-testid to all interactive elements
- [ ] Follow naming patterns (action-target)
- [ ] Tag dynamic lists with unique IDs
- [ ] Validate with TestSprite AI`,
        status: 'To Do',
        labels: ['squad-3', 'testing', 'data-testid', 'high-priority']
      },
      {
        epicIndex: 3,
        summary: 'Story 4.4: Accessibility Squad (55 pages)',
        description: `Add ARIA labels to 55 pages for WCAG 2.1 AA compliance.

**Mentor Agents:** #51 (ARIA) + #11 (UI/UX)
**Priority:** HIGH
**Target:** 90% ARIA coverage
**Status:** READY TO DEPLOY

**Scope:**
- [ ] Add ARIA labels to interactive elements
- [ ] Implement keyboard navigation
- [ ] Test with screen readers
- [ ] Achieve WCAG 2.1 AA`,
        status: 'To Do',
        labels: ['squad-4', 'accessibility', 'aria', 'high-priority']
      },
      {
        epicIndex: 4,
        summary: 'Story 5.1: Parallel Squad Deployment',
        description: `Deploy 7 squads in parallel using LangGraph + BullMQ coordination.

**Status:** PENDING (awaiting human approval)
**Agent Lead:** Agent #0 + Agent #62

**Timeline:**
- Week 4: High-Priority Squads (1-4)
- Week 5: Medium-Priority Squads (5-7)

**Infrastructure:**
- [ ] Activate LangGraph orchestration
- [ ] Deploy BullMQ task queues
- [ ] Start mentor training (14 → 40+)
- [ ] Monitor via dashboard
- [ ] Auto-sync to Jira`,
        status: 'To Do',
        labels: ['phase-5', 'deployment', 'parallel-execution', 'awaiting-approval']
      },
      {
        epicIndex: 4,
        summary: 'Story 5.2: Real-time Progress Tracking',
        description: `Monitor all squad progress with real-time metrics and Jira sync.

**Status:** PENDING
**Owner:** Agent #62 (Resume AI)

**Monitoring:**
- [ ] LangGraph state tracking
- [ ] BullMQ job progress
- [ ] Prometheus metrics export
- [ ] Live dashboard (/admin/agent-metrics)
- [ ] Auto-update Jira status`,
        status: 'To Do',
        labels: ['phase-5', 'monitoring', 'metrics', 'real-time']
      },
      {
        epicIndex: 4,
        summary: 'Story 5.3: Human Review & Approval',
        description: `Enable human review workflow with Resume AI package generation.

**Status:** PENDING
**Owner:** Agent #62 (Resume AI)

**Workflow:**
1. Agent completes work → Resume AI packages
2. Package: summary, technical details, metrics, risks
3. Human reviews in Jira
4. Approve/reject with feedback
5. Iterate or merge based on decision

**Setup:**
- [ ] Resume AI package generation
- [ ] Jira review workflow
- [ ] Approval criteria
- [ ] Feedback loop
- [ ] Track approval rate (target: >85%)`,
        status: 'To Do',
        labels: ['phase-5', 'human-review', 'resume-ai', 'quality-gate']
      }
    ];

    const createdStories = [];
    for (const story of stories) {
      try {
        const epic = epics[story.epicIndex];
        if (!epic) continue;

        const issue = await this.api.createStory(this.projectKey, {
          summary: story.summary,
          description: story.description,
          epicKey: epic.key,
          labels: story.labels
        });
        
        createdStories.push({ ...story, id: issue.id, key: issue.key });
        console.log(`  ✓ Created story: ${issue.key} - ${story.summary}`);
      } catch (error: any) {
        console.error(`  ✗ Failed to create story: ${story.summary}`, error.message);
      }
    }

    return createdStories;
  }

  async getProjectStatus(): Promise<any> {
    try {
      const issues = await this.api.searchIssues(
        `project = ${this.projectKey} ORDER BY created DESC`,
        ['summary', 'status', 'issuetype', 'labels']
      );

      return {
        total: issues.length,
        issues: issues.map((issue: any) => ({
          key: issue.key,
          type: issue.fields.issuetype.name,
          summary: issue.fields.summary,
          status: issue.fields.status.name,
          labels: issue.fields.labels
        }))
      };
    } catch (error) {
      console.error('Failed to get project status:', error);
      throw error;
    }
  }
}

export const jiraProjectSync = new JiraProjectSync();
