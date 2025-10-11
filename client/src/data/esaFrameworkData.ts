// ESA Framework (105 Agents, 61 Layers) - Complete Data Structure
// Source: docs/platform-handoff/esa.md

export interface Agent {
  id: number;
  name: string;
  role: string;
  division?: string;
  layers?: string;
  responsibilities: string[];
  reports_to?: string;
  escalation_level?: number;
}

export interface Layer {
  id: number;
  name: string;
  division: string;
  chief: string;
  domain?: string;
  technologies: string[];
}

export interface AuditPhase {
  phase: number;
  name: string;
  tier: number;
  tierName: string;
  execution: 'sequential' | 'parallel';
  agent: string;
  agentId: number;
  focus: string;
  dependencies?: number[];
}

export interface CommunicationSLA {
  from: string;
  to: string;
  responseTime: string;
  escalationPath: string[];
}

export interface DecisionLevel {
  level: number;
  name: string;
  authority: string;
  scope: string;
  examples: string[];
}

// 105-Agent Hierarchy
export const esaAgents: Agent[] = [
  // Agent #0 - CEO
  {
    id: 0,
    name: "ESA CEO",
    role: "Strategic Orchestrator",
    responsibilities: [
      "Framework governance & integrity",
      "Cross-division coordination",
      "40x20s quality validation (800 checkpoints)",
      "Agent certification & training",
      "Production deployment approval",
      "Level 4 escalation & conflict resolution"
    ],
    escalation_level: 4
  },

  // Division Chiefs (#1-6)
  {
    id: 1,
    name: "Foundation Chief",
    role: "Division Chief",
    division: "Foundation",
    layers: "1-10",
    responsibilities: [
      "Database, API, Server, Auth, RBAC, Validation",
      "Layer management (10 layers)",
      "Quality gates enforcement",
      "Cross-division coordination"
    ],
    reports_to: "Agent #0",
    escalation_level: 2
  },
  {
    id: 2,
    name: "Core Chief",
    role: "Division Chief",
    division: "Core",
    layers: "11-20",
    responsibilities: [
      "Real-time, Processing, File Mgmt, Caching",
      "Search, Notifications, Payment, Analytics",
      "Resource allocation within division",
      "Agent supervision & mentoring"
    ],
    reports_to: "Agent #0",
    escalation_level: 2
  },
  {
    id: 3,
    name: "Business Chief",
    role: "Division Chief",
    division: "Business",
    layers: "21-30",
    responsibilities: [
      "Users, Groups, Events, Social, Messaging",
      "Recommendations, Gamification, Marketplace",
      "Business logic coordination",
      "User experience optimization"
    ],
    reports_to: "Agent #0",
    escalation_level: 2
  },
  {
    id: 4,
    name: "Intelligence Chief",
    role: "Division Chief",
    division: "Intelligence",
    layers: "31-46",
    responsibilities: [
      "AI Infrastructure (16 layers)",
      "Life CEO agent orchestration",
      "ML/AI integration & optimization",
      "Cognitive capabilities development"
    ],
    reports_to: "Agent #0",
    escalation_level: 2
  },
  {
    id: 5,
    name: "Platform Chief",
    role: "Division Chief",
    division: "Platform",
    layers: "47-56",
    responsibilities: [
      "Mobile, Performance, Security, DevOps",
      "Testing, Documentation, i18n, Accessibility",
      "Platform-wide quality assurance",
      "Compliance & standards"
    ],
    reports_to: "Agent #0",
    escalation_level: 2
  },
  {
    id: 6,
    name: "Extended Chief",
    role: "Division Chief",
    division: "Extended",
    layers: "57-61",
    responsibilities: [
      "Automation, Third-party integrations",
      "Open Source management",
      "GitHub & Supabase integration",
      "External ecosystem coordination"
    ],
    reports_to: "Agent #0",
    escalation_level: 2
  },

  // Expert Agents (#10-16)
  {
    id: 10,
    name: "AI Research Expert",
    role: "Expert Agent",
    responsibilities: [
      "LLM best practices & architecture",
      "AI innovation & research",
      "Cross-platform AI consulting",
      "Training & mentorship"
    ],
    reports_to: "Agent #0"
  },
  {
    id: 11,
    name: "UI/UX Design Expert",
    role: "Expert Agent",
    responsibilities: [
      "Aurora Tide design system",
      "Glassmorphic & MT Ocean aesthetics",
      "WCAG 2.1 AA accessibility",
      "Design specification & approval"
    ],
    reports_to: "Agent #0"
  },
  {
    id: 12,
    name: "Data Visualization Expert",
    role: "Expert Agent",
    responsibilities: [
      "Charts, dashboards, analytics UI",
      "Interactive visualization design",
      "Data storytelling",
      "Performance optimization"
    ],
    reports_to: "Agent #0"
  },
  {
    id: 13,
    name: "Content & Media Expert",
    role: "Expert Agent",
    responsibilities: [
      "Images, video, rich media",
      "SEO optimization",
      "Content strategy",
      "Media processing"
    ],
    reports_to: "Agent #0"
  },
  {
    id: 14,
    name: "Code Quality Expert",
    role: "Expert Agent",
    responsibilities: [
      "Architecture patterns",
      "Performance optimization",
      "Code review standards",
      "Quality gate definitions"
    ],
    reports_to: "Agent #0"
  },
  {
    id: 15,
    name: "Developer Experience Expert",
    role: "Expert Agent",
    responsibilities: [
      "Tools & workflows",
      "Productivity enhancement",
      "DX optimization",
      "Build system improvement"
    ],
    reports_to: "Agent #0"
  },
  {
    id: 16,
    name: "i18n Expert",
    role: "Expert Agent",
    responsibilities: [
      "68 language support",
      "Cultural adaptation",
      "RTL implementation",
      "Localization strategy"
    ],
    reports_to: "Agent #0"
  },

  // Operational Excellence Agents (#63-67)
  {
    id: 63,
    name: "Sprint & Resource Manager",
    role: "Operational Agent",
    responsibilities: [
      "Sprint planning & execution",
      "Workload balancing across 105 agents",
      "Capacity management (<85% utilization)",
      "SLA monitoring & enforcement"
    ],
    reports_to: "Agent #0"
  },
  {
    id: 64,
    name: "Documentation Architect",
    role: "Operational Agent",
    responsibilities: [
      "Framework documentation",
      "Consolidation reviews (10-30% code reduction)",
      "Reusable component registry",
      "Phase 0 pre-flight checks"
    ],
    reports_to: "Agent #0"
  },
  {
    id: 65,
    name: "Project Tracker Manager",
    role: "Operational Agent",
    responsibilities: [
      "Task management (Epic/Story/Task)",
      "Dependency tracking",
      "Progress monitoring",
      "Agent assignment"
    ],
    reports_to: "Agent #0"
  },
  {
    id: 66,
    name: "Code Review Expert",
    role: "Operational Agent",
    responsibilities: [
      "PR reviews & approvals",
      "ESLint rule enforcement",
      "Quality gate validation",
      "Aurora Tide compliance"
    ],
    reports_to: "Agent #0"
  },
  {
    id: 67,
    name: "Community Relations",
    role: "Operational Agent",
    responsibilities: [
      "GitHub integration & sync",
      "Open source coordination",
      "External collaboration",
      "Story↔Issue, Task↔PR bidirectional sync"
    ],
    reports_to: "Agent #0"
  }
];

// 17-Phase Tiered Audit System
export const auditPhases: AuditPhase[] = [
  // Tier 1: Foundation (Sequential)
  { phase: 1, name: "Database/Schema Audit", tier: 1, tierName: "Foundation", execution: "sequential", agent: "Database Architecture", agentId: 1, focus: "Schema validation, indexes, relationships, query optimization" },
  { phase: 2, name: "API/Backend Audit", tier: 1, tierName: "Foundation", execution: "sequential", agent: "API Development", agentId: 2, focus: "Endpoints, validation, error handling, rate limiting", dependencies: [1] },
  { phase: 3, name: "Real-time Communication", tier: 1, tierName: "Foundation", execution: "sequential", agent: "Real-time Features", agentId: 4, focus: "WebSocket, Socket.io, live updates, connection handling", dependencies: [2] },
  { phase: 4, name: "Caching Strategy", tier: 1, tierName: "Foundation", execution: "sequential", agent: "Caching Layer", agentId: 5, focus: "Redis, in-memory, query optimization, invalidation", dependencies: [3] },

  // Tier 2: Application Layer (Parallel)
  { phase: 5, name: "Frontend/UI Audit", tier: 2, tierName: "Application Layer", execution: "parallel", agent: "Client Framework", agentId: 8, focus: "Component structure, state management, routing", dependencies: [4] },
  { phase: 6, name: "Security & Auth", tier: 2, tierName: "Application Layer", execution: "parallel", agent: "RBAC/ABAC", agentId: 7, focus: "Permissions, authentication, authorization, CSRF", dependencies: [4] },
  { phase: 7, name: "File Management", tier: 2, tierName: "Application Layer", execution: "parallel", agent: "File Upload/Storage", agentId: 6, focus: "Media handling, CDN, compression, storage limits", dependencies: [4] },

  // Tier 3: Quality Assurance (Parallel)
  { phase: 8, name: "Performance Optimization", tier: 3, tierName: "Quality Assurance", execution: "parallel", agent: "Performance", agentId: 48, focus: "Load times, bundle size, Core Web Vitals, memory leaks", dependencies: [5, 6, 7] },
  { phase: 9, name: "Testing & QA", tier: 3, tierName: "Quality Assurance", execution: "parallel", agent: "Testing/QA", agentId: 52, focus: "Unit, integration, E2E tests, coverage", dependencies: [5, 6, 7] },
  { phase: 10, name: "Documentation", tier: 3, tierName: "Quality Assurance", execution: "parallel", agent: "Technical Documentation", agentId: 54, focus: "Code docs, API specs, user guides, inline comments", dependencies: [5, 6, 7] },

  // Tier 4: User Experience (Parallel)
  { phase: 11, name: "Design System Compliance", tier: 4, tierName: "User Experience", execution: "parallel", agent: "UI/UX Design", agentId: 11, focus: "Aurora Tide, glassmorphic, MT Ocean gradients, dark mode", dependencies: [8, 9, 10] },
  { phase: 12, name: "Accessibility", tier: 4, tierName: "User Experience", execution: "parallel", agent: "Accessibility", agentId: 50, focus: "WCAG 2.1 AA, ARIA, keyboard nav, screen readers", dependencies: [8, 9, 10] },
  { phase: 13, name: "i18n/Localization", tier: 4, tierName: "User Experience", execution: "parallel", agent: "i18n", agentId: 16, focus: "68 languages, RTL, cultural adaptation, date/number formats", dependencies: [8, 9, 10] },
  { phase: 14, name: "SEO Optimization", tier: 4, tierName: "User Experience", execution: "parallel", agent: "SEO", agentId: 55, focus: "Meta tags, Open Graph, structured data, sitemap", dependencies: [8, 9, 10] },

  // Tier 5: Deployment & Validation (Sequential)
  { phase: 15, name: "Open Source Deployment", tier: 5, tierName: "Deployment & Validation", execution: "sequential", agent: "Open Source Mgmt", agentId: 59, focus: "5-criteria checklist, training needs, consolidation", dependencies: [11, 12, 13, 14] },
  { phase: 16, name: "Deployment Readiness", tier: 5, tierName: "Deployment & Validation", execution: "sequential", agent: "DevOps/Infrastructure", agentId: 49, focus: "CI/CD, environment configs, health checks, monitoring", dependencies: [15] },
  { phase: 17, name: "CEO Certification", tier: 5, tierName: "Deployment & Validation", execution: "sequential", agent: "CEO", agentId: 0, focus: "Final approval, go/no-go decision, production sign-off", dependencies: [16] }
];

// Decision Authority Matrix (4 Levels)
export const decisionLevels: DecisionLevel[] = [
  {
    level: 1,
    name: "Layer Agent Authority",
    authority: "Autonomous",
    scope: "Within single layer, no external dependencies",
    examples: [
      "Code implementation details (variable naming, file structure)",
      "Minor bug fixes (typos, small logic errors)",
      "Layer-specific optimizations (query optimization, caching)",
      "Layer documentation updates"
    ]
  },
  {
    level: 2,
    name: "Division Chief Authority",
    authority: "Strategic",
    scope: "Cross-layer within division, division-wide decisions",
    examples: [
      "Division architecture decisions",
      "Cross-layer integration patterns",
      "Resource allocation within division",
      "Division-wide quality standards"
    ]
  },
  {
    level: 3,
    name: "Domain Coordinator Authority",
    authority: "Operational",
    scope: "Cross-division coordination, domain expertise",
    examples: [
      "Multi-division features",
      "Domain-specific best practices",
      "Cross-layer technical integration",
      "Performance optimization strategies"
    ]
  },
  {
    level: 4,
    name: "CEO Authority",
    authority: "Final",
    scope: "Platform-wide, production deployment, conflict resolution",
    examples: [
      "Production deployment approval",
      "Inter-division dispute resolution",
      "Framework governance decisions",
      "Emergency incident response"
    ]
  }
];

// Communication SLAs
export const communicationSLAs: CommunicationSLA[] = [
  {
    from: "Layer Agent",
    to: "Division Chief",
    responseTime: "4 hours",
    escalationPath: ["Division Chief", "Agent #0 (CEO)"]
  },
  {
    from: "Layer Agent",
    to: "Domain Coordinator",
    responseTime: "2 hours",
    escalationPath: ["Domain Coordinator", "Division Chief", "Agent #0 (CEO)"]
  },
  {
    from: "Division Chief",
    to: "Agent #0 (CEO)",
    responseTime: "8 hours",
    escalationPath: ["Agent #0 (CEO)"]
  },
  {
    from: "Any Agent",
    to: "Expert Agent (UI/UX)",
    responseTime: "4 hours",
    escalationPath: ["Agent #0 (CEO)"]
  },
  {
    from: "Any Agent",
    to: "Sprint Manager (#63)",
    responseTime: "4 hours",
    escalationPath: ["Domain #9", "Agent #0 (CEO)"]
  },
  {
    from: "Any Agent",
    to: "Code Review (#66)",
    responseTime: "2 hours",
    escalationPath: ["Agent #14 (Code Quality)", "Agent #0 (CEO)"]
  }
];

// Training Cascade Structure
export const trainingCascade = {
  ceo: {
    name: "Agent #0 (CEO)",
    certifies: ["Division Chiefs", "Expert Agents", "Operational Agents"],
    duration: "2 weeks",
    focus: "Framework governance, 40x20s validation, cross-division coordination"
  },
  chiefs: {
    name: "Division Chiefs (#1-6)",
    certifies: ["Layer Agents within division"],
    duration: "1 week per layer",
    focus: "Layer expertise, quality gates, division methodologies"
  },
  domains: {
    name: "Domain Coordinators (#1-9)",
    certifies: ["Layer Agents cross-division"],
    duration: "3 days per domain",
    focus: "Domain integration, cross-layer patterns, operational execution"
  },
  experts: {
    name: "Expert Agents (#10-16)",
    certifies: ["All agents in specialty"],
    duration: "Ongoing mentorship",
    focus: "Specialized knowledge, best practices, innovation"
  }
};

// Agent Orchestration Decision Tree
export const orchestrationDecisionTree = {
  scenarios: [
    {
      type: "Full-Stack Feature",
      question: "New feature with DB + API + UI?",
      agents: ["Agent #1 (DB)", "Agent #2 (API)", "Agent #8 (Frontend)", "Agent #11 (UI/UX)"],
      pattern: "Pattern 1: Full-Stack Feature",
      timeline: "3-5 days",
      execution: "Parallel (DB+API+UI simultaneously)"
    },
    {
      type: "Performance Issue",
      question: "Slow page load or API response?",
      agents: ["Agent #48 (Performance)", "Agent #1 (DB)", "Agent #5 (Caching)"],
      pattern: "Pattern 2: Performance Optimization",
      timeline: "1-2 days",
      execution: "Parallel investigation → Sequential fixes"
    },
    {
      type: "AI Integration",
      question: "New Life CEO agent or AI feature?",
      agents: ["Chief #4 (Intelligence)", "Agent #35 (AI Agent Mgmt)", "Agent #31 (AI Infra)", "Expert #10 (AI Research)"],
      pattern: "Pattern 3: AI Integration",
      timeline: "2-3 days",
      execution: "Sequential (Infrastructure → Agent → Integration)"
    },
    {
      type: "UI Redesign",
      question: "Visual update or new page design?",
      agents: ["Agent #11 (UI/UX)", "Agent #8 (Frontend)", "Agent #66 (Code Review)"],
      pattern: "Pattern 4: UI/UX Update",
      timeline: "1-2 days",
      execution: "Sequential (Design approval → Build → Review)"
    },
    {
      type: "Security Issue",
      question: "Vulnerability or auth problem?",
      agents: ["Agent #0 (CEO)", "Agent #49 (Security)", "Agent #66 (Code Review)", "Agent #64 (Docs)"],
      pattern: "Pattern 6: Emergency Response",
      timeline: "2-4 hours",
      execution: "Immediate parallel response"
    },
    {
      type: "Page Audit",
      question: "Quality check or compliance review?",
      agents: ["Agent #64 (Docs)", "Agent #0 (CEO)", "All relevant layer agents"],
      pattern: "Pattern 7: Audit & Consolidation",
      timeline: "1-2 days",
      execution: "17-phase tiered structure (Tier 1-5)"
    }
  ]
};
