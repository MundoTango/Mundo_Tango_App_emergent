// ESA Framework (105 Agents, 61 Layers) - 8 Common Orchestration Patterns
// Source: esa.md Section 3

export interface ESAPattern {
  id: string;
  number: number;
  name: string;
  scenario: string;
  agentsInvolved: string;
  leadAgent: string;
  timeline: string;
  executionType: 'parallel' | 'sequential' | 'mixed';
  steps: PatternStep[];
  priority: 'normal' | 'high' | 'critical';
  color: string;
}

export interface PatternStep {
  agent: string;
  action: string;
  parallel?: PatternStep[];
  sequential?: boolean;
}

export const esaPatterns: ESAPattern[] = [
  {
    id: 'full-stack-feature',
    number: 1,
    name: 'Full-Stack Feature Development',
    scenario: 'Building a complete new feature across all layers',
    agentsInvolved: '6 agents (vertical stack)',
    leadAgent: 'Division Chief',
    timeline: '3-5 days',
    executionType: 'sequential',
    priority: 'normal',
    color: 'from-blue-500 to-cyan-500',
    steps: [
      { agent: 'Agent #0 (CEO)', action: 'Defines feature requirements' },
      { agent: 'Division Chief', action: 'Assigns agents to layers' },
      {
        agent: 'Parallel Layer Work',
        action: 'All layers execute simultaneously',
        parallel: [
          { agent: 'Agent #1 (Database)', action: 'Drizzle schema + types' },
          { agent: 'Agent #2 (API)', action: 'REST endpoints' },
          { agent: 'Agent #8 (Frontend)', action: 'React components' },
          { agent: 'Agent #11 (UI/UX)', action: 'Design approval' },
          { agent: 'Agent #49 (Security)', action: 'Security review' },
        ]
      },
      { agent: 'Agent #66 (Code Review)', action: 'Reviews all code' },
      { agent: 'Agent #0 (CEO)', action: 'Deployment approval' }
    ]
  },
  {
    id: 'performance-optimization',
    number: 2,
    name: 'Performance Optimization',
    scenario: 'Improving system performance across multiple layers',
    agentsInvolved: '5 agents (multi-layer)',
    leadAgent: 'Domain #1 (Infrastructure)',
    timeline: '1-2 days',
    executionType: 'mixed',
    priority: 'high',
    color: 'from-orange-500 to-red-500',
    steps: [
      { agent: 'Domain #1', action: 'Identifies performance bottleneck' },
      {
        agent: 'Parallel Analysis',
        action: 'Concurrent investigation',
        parallel: [
          { agent: 'Agent #1 (Database)', action: 'Query optimization, indexing' },
          { agent: 'Agent #14 (Caching)', action: 'Cache strategy review' },
          { agent: 'Agent #48 (Performance)', action: 'Monitoring & profiling' },
        ]
      },
      { agent: 'Domain #1', action: 'Consolidates findings' },
      { agent: 'Assigned agents', action: 'Implement fixes in parallel' },
      { agent: 'Agent #48', action: 'Validates improvements' }
    ]
  },
  {
    id: 'ai-integration',
    number: 3,
    name: 'AI Agent Integration',
    scenario: 'Adding new Life CEO AI agent functionality',
    agentsInvolved: '7 agents (AI stack)',
    leadAgent: 'Chief #4 (Intelligence) + Domain #7 (Life CEO Core)',
    timeline: '2-3 days',
    executionType: 'sequential',
    priority: 'normal',
    color: 'from-purple-500 to-pink-500',
    steps: [
      { agent: 'Chief #4', action: 'Reviews AI requirements' },
      { agent: 'Agent #31 (AI Infrastructure)', action: 'OpenAI connection setup' },
      {
        agent: 'Parallel AI Development',
        action: 'Build AI capabilities',
        parallel: [
          { agent: 'Agent #32 (Prompt Engineering)', action: 'Prompt templates' },
          { agent: 'Agent #33 (Context Management)', action: 'Context handling' },
          { agent: 'Agent #34 (Response Generation)', action: 'Response formatting' },
        ]
      },
      { agent: 'Agent #35 (AI Agent Mgmt)', action: 'Integrates Life CEO agent' },
      { agent: 'Domain #7', action: 'Tests agent interactions' },
      { agent: 'Agent #0', action: 'Approves agent deployment' }
    ]
  },
  {
    id: 'ui-redesign',
    number: 4,
    name: 'UI/UX Redesign',
    scenario: 'Redesigning page or component with Aurora Tide',
    agentsInvolved: '4 agents (design + implementation)',
    leadAgent: 'Agent #11 (UI/UX Design Expert)',
    timeline: '1-2 days',
    executionType: 'sequential',
    priority: 'normal',
    color: 'from-teal-500 to-emerald-500',
    steps: [
      { agent: 'Agent #11', action: 'Creates Aurora Tide design spec' },
      { agent: 'Agent #11', action: 'Defines MT Ocean gradients & glassmorphic elements' },
      { agent: 'Agent #8 (Frontend)', action: 'Implements design with approved components' },
      { agent: 'Agent #54 (Accessibility)', action: 'WCAG 2.1 AA compliance check' },
      { agent: 'Agent #66 (Code Review)', action: 'Reviews Aurora Tide standards' },
      { agent: 'Agent #0', action: 'Deployment approval' }
    ]
  },
  {
    id: 'database-migration',
    number: 5,
    name: 'Database Schema Migration',
    scenario: 'Changing database schema with zero downtime',
    agentsInvolved: '4 agents (database impact)',
    leadAgent: 'Chief #1 (Foundation) + Agent #1 (Database)',
    timeline: '1 day',
    executionType: 'sequential',
    priority: 'high',
    color: 'from-indigo-500 to-violet-500',
    steps: [
      { agent: 'Agent #1', action: 'Proposes schema change' },
      { agent: 'Chief #1', action: 'Reviews impact analysis' },
      {
        agent: 'Impact Analysis',
        action: 'Identify affected systems',
        parallel: [
          { agent: 'Agent #2 (API)', action: 'Identifies affected endpoints' },
          { agent: 'Agent #8 (Frontend)', action: 'Identifies affected components' },
        ]
      },
      { agent: 'Domain #1', action: 'Coordinates migration plan' },
      {
        agent: 'Sequential Migration',
        action: 'Order-critical steps',
        sequential: true,
        parallel: [
          { agent: '1. Agent #1', action: 'Update schema + migration script' },
          { agent: '2. Agent #2', action: 'Update API for backward compatibility' },
          { agent: '3. Agent #1', action: 'Run migration (npm run db:push --force)' },
          { agent: '4. Agent #2', action: 'Update API to use new schema only' },
          { agent: '5. Agent #8', action: 'Update frontend' },
        ]
      },
      { agent: 'Agent #0', action: 'Validates zero-downtime migration' }
    ]
  },
  {
    id: 'security-emergency',
    number: 6,
    name: 'Emergency Security Response',
    scenario: 'Critical security vulnerability detected',
    agentsInvolved: 'Immediate response team',
    leadAgent: 'Agent #0 (CEO) + Agent #49 (Security)',
    timeline: '2-4 hours',
    executionType: 'parallel',
    priority: 'critical',
    color: 'from-red-500 to-rose-500',
    steps: [
      { agent: 'Security Alert', action: 'Vulnerability detected' },
      { agent: 'Agent #0 (CEO)', action: 'Declares emergency - all other work paused' },
      {
        agent: 'Immediate Parallel Response',
        action: 'Concurrent emergency actions',
        parallel: [
          { agent: 'Agent #49 (Security)', action: 'Assesses threat severity' },
          { agent: 'Agent #66 (Code Review)', action: 'Identifies affected code' },
          { agent: 'Agent #64 (Documentation)', action: 'Notifies all 105 agents' },
        ]
      },
      { agent: 'All agents', action: 'Report to Agent #0 within 15 minutes' },
      { agent: 'Agent #0', action: 'Makes fix decision' },
      { agent: 'Assigned agent', action: 'Implements priority fix' },
      { agent: 'Agent #66', action: 'Expedited code review' },
      { agent: 'Agent #0', action: 'Immediate deployment approval' },
      { agent: 'Agent #64', action: 'Updates security documentation' }
    ]
  },
  {
    id: 'audit-consolidation',
    number: 7,
    name: 'Page Audit & Consolidation',
    scenario: 'Complete page audit with code consolidation',
    agentsInvolved: '5+ agents (depends on findings)',
    leadAgent: 'Agent #64 (Documentation Architect)',
    timeline: '1-2 days',
    executionType: 'mixed',
    priority: 'normal',
    color: 'from-amber-500 to-yellow-500',
    steps: [
      { agent: 'Agent #0', action: 'Requests page audit' },
      { agent: 'Agent #64', action: 'Leads audit process' },
      { agent: 'Step 0.0', action: 'Consolidation check - identify duplicates' },
      {
        agent: 'Parallel Audit',
        action: 'All layers audit simultaneously',
        parallel: [
          { agent: 'Agent #11 (UI/UX)', action: 'Aurora Tide compliance' },
          { agent: 'Agent #2 (API)', action: 'API pattern checks' },
          { agent: 'Agent #1 (Database)', action: 'Schema validation' },
          { agent: 'Agent #49 (Security)', action: 'Security audit' },
        ]
      },
      { agent: 'Agent #64', action: 'Consolidates findings' },
      { agent: 'Agent #64', action: 'Removes duplicates (10-30% code reduction)' },
      { agent: 'All agents', action: 'Fix layer issues in parallel' },
      { agent: 'Agent #66', action: 'Reviews all fixes' },
      { agent: 'Agent #0', action: 'Approves deployment' }
    ]
  },
  {
    id: 'sprint-planning',
    number: 8,
    name: 'Sprint Planning & Execution',
    scenario: '2-week sprint with all 105 agents',
    agentsInvolved: 'All 105 agents',
    leadAgent: 'Agent #63 (Sprint Manager) + Domain #9 (Master Control)',
    timeline: '2 weeks',
    executionType: 'parallel',
    priority: 'normal',
    color: 'from-green-500 to-lime-500',
    steps: [
      { agent: 'Agent #0', action: 'Defines sprint goals' },
      { agent: 'Agent #63', action: 'Creates sprint plan' },
      { agent: 'Domain #9', action: 'Validates agent capacity' },
      {
        agent: 'Capacity Check',
        action: 'Monitor all 105 agents',
        parallel: [
          { agent: '<70% utilization', action: 'Green ✅ - Ready for work' },
          { agent: '70-85% utilization', action: 'Yellow ⚠️ - Monitor closely' },
          { agent: '>85% utilization', action: 'Red 🚨 - Rebalance needed' },
        ]
      },
      { agent: 'Agent #63', action: 'Assigns tasks based on capacity' },
      { agent: 'All 105 agents', action: 'Parallel execution on assigned tasks' },
      { agent: 'Agent #63', action: 'Daily standups' },
      { agent: 'Domain #9', action: 'Monitors progress' },
      { agent: 'Any agent', action: 'Blockers escalated immediately' },
      { agent: 'Agent #0', action: 'Reviews sprint completion' }
    ]
  }
];

// Quick selection guide
export const patternSelectionGuide = [
  { scenario: 'New full-stack feature', pattern: 'Pattern 1', leadAgent: 'Division Chief', timeline: '3-5 days' },
  { scenario: 'Performance issue', pattern: 'Pattern 2', leadAgent: 'Domain #1', timeline: '1-2 days' },
  { scenario: 'AI integration', pattern: 'Pattern 3', leadAgent: 'Chief #4 + Domain #7', timeline: '2-3 days' },
  { scenario: 'UI redesign', pattern: 'Pattern 4', leadAgent: 'Agent #11', timeline: '1-2 days' },
  { scenario: 'Database change', pattern: 'Pattern 5', leadAgent: 'Chief #1 + Agent #1', timeline: '1 day' },
  { scenario: 'Security emergency', pattern: 'Pattern 6', leadAgent: 'Agent #0 + Agent #49', timeline: '2-4 hours' },
  { scenario: 'Page audit', pattern: 'Pattern 7', leadAgent: 'Agent #64', timeline: '1-2 days' },
  { scenario: 'Sprint planning', pattern: 'Pattern 8', leadAgent: 'Agent #63 + Domain #9', timeline: '2 weeks' },
];
