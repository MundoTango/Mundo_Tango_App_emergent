import { db } from "../db";
import { learnings, agentCertifications } from "../../shared/schema";

// Agent #80 Learning Coordinator - Seed Critical Learnings
// MB.MD Phase 2A - Oct 21, 2025

export async function seedCriticalLearnings() {
  console.log("🎓 [Learning Seeder] Seeding critical learnings from AGENT_SESSION_LOG.md...");

  const criticalLearnings = [
    {
      title: "Code Exists ≠ Feature Works",
      category: "process",
      severity: "critical",
      problem: "Mr Blue AI modal opened but displayed completely black screens on all 4 tabs despite agents marking work '100% complete'",
      rootCause: "Agents marked work complete based solely on TypeScript compilation, not user-facing functionality. No screenshot verification, no user journey testing.",
      solution: "Implement MB.MD 5 Non-Negotiable Rules: VERIFY → BUILD → INTEGRATE → SCREENSHOT → TEST → ARCHITECT VALIDATES",
      preventionStrategy: "Pre-commit hooks block UI commits without screenshots. Architect review mandatory before marking tasks complete. TypeScript compilation is Step 1 of 5, not completion.",
      relatedDocs: ["docs/MB_MD_QA_PROTOCOL.md", "docs/AGENT_SESSION_LOG.md"],
      relatedIncidents: ["MRBLUE_BLACK_SCREEN_INCIDENT_OCT2025"],
    },
    {
      title: "Screenshot Verification is MANDATORY",
      category: "quality",
      severity: "critical",
      problem: "Features claimed operational but never visually verified. Black screens undetected for weeks.",
      rootCause: "No screenshot = No completion policy not enforced. Agents self-certified without evidence.",
      solution: "Use screenshot tool after EVERY UI change. Capture light + dark mode, mobile (375px), all user roles.",
      preventionStrategy: "Pre-commit hooks check for screenshots in docs/screenshots/YYYY-MM-DD/. Automated visual regression testing (Percy/Chromatic). Page agent validation gate.",
      relatedDocs: ["docs/MB_MD_QA_PROTOCOL.md", "docs/incidents/MRBLUE_BLACK_SCREEN_INCIDENT_OCT2025.md"],
      relatedIncidents: ["MRBLUE_BLACK_SCREEN_INCIDENT_OCT2025"],
    },
    {
      title: "Dark Mode Testing is NOT Optional",
      category: "technical",
      severity: "high",
      problem: "Components used dark:bg-gray-950 (near-black) backgrounds creating black-on-black rendering in dark mode",
      rootCause: "Dark mode testing skipped. Every dark: class must be tested in dark mode with proper color contrast ratios.",
      solution: "Test BOTH themes for every component. Use lighter backgrounds (dark:bg-gray-800) and explicit text colors (text-gray-900 dark:text-gray-100).",
      preventionStrategy: "Screenshot verification requires both light + dark mode captures. Accessibility checks include WCAG contrast ratios in both themes.",
      relatedDocs: ["docs/MB_MD_QA_PROTOCOL.md", "docs/AGENT_SESSION_LOG.md"],
      relatedIncidents: ["MRBLUE_BLACK_SCREEN_INCIDENT_OCT2025"],
    },
    {
      title: "Component Integration Testing Required",
      category: "technical",
      severity: "high",
      problem: "Built 14 components in lib/mrBlue/ but ZERO imports in MrBlueComplete.tsx. Components exist but unreachable = 100% waste.",
      rootCause: "Build ≠ Integration. Agents built in isolation, never wired up components.",
      solution: "Import and wire up components AS YOU BUILD THEM. Test: alone + with children + in real page. Verify CSS propagation.",
      preventionStrategy: "MB.MD Rule #2: INTEGRATE IMMEDIATELY. Check import resolves, component renders in parent, props wired correctly.",
      relatedDocs: ["docs/MB_MD_QA_PROTOCOL.md"],
      relatedIncidents: ["MRBLUE_BLACK_SCREEN_INCIDENT_OCT2025"],
    },
    {
      title: "100% Complete Requires User Validation",
      category: "process",
      severity: "critical",
      problem: "Agents self-certified 'complete' without user testing. No validation that users can actually access features.",
      rootCause: "Self-assessment → (skip peer review) → (skip page agent validation) → (skip user testing) = Ship broken code.",
      solution: "Validation chain: Self-assessment → Peer review → Page agent validation → User testing → Architect approval.",
      preventionStrategy: "No self-certification for user-facing features. Task completion requires architect_reviewed: 'yes'. MB.MD Rule #4: TEST USER JOURNEY.",
      relatedDocs: ["docs/MB_MD_QA_PROTOCOL.md", "docs/AGENT_SESSION_LOG.md"],
      relatedIncidents: ["MRBLUE_BLACK_SCREEN_INCIDENT_OCT2025"],
    },
    {
      title: "React Query Missing queryFn",
      category: "technical",
      severity: "high",
      problem: "Mr Blue Chat tab displays blank screen. useQuery calls have queryKey but no queryFn to actually fetch data.",
      rootCause: "Frontend component built without backend integration. No data fetching logic implemented.",
      solution: "Add queryFn to all useQuery calls OR use default queryFn from queryClient. Connect to /api/mrblue/* endpoints with proper error handling.",
      preventionStrategy: "Test API calls work before marking frontend complete. Use browser DevTools Network tab to verify requests execute.",
      relatedDocs: ["docs/MB_MD_QA_PROTOCOL.md"],
      relatedIncidents: [],
    },
  ];

  for (const learning of criticalLearnings) {
    await db.insert(learnings).values(learning).onConflictDoNothing();
  }

  console.log(`✅ [Learning Seeder] Seeded ${criticalLearnings.length} critical learnings`);
}

export async function seedAgentCertifications() {
  console.log("🎓 [Learning Seeder] Creating certification records for 350+ agents...");

  const agents = [
    // Tier 1: Quality/Learning/Documentation (Priority training)
    { agentId: "Agent #79", agentName: "Quality Validator", agentType: "core" },
    { agentId: "Agent #80", agentName: "Learning Coordinator", agentType: "core" },
    { agentId: "Agent #64", agentName: "Documentation Architect", agentType: "core" },
    { agentId: "Agent #65", agentName: "Project Tracker", agentType: "core" },
    { agentId: "Agent #66", agentName: "Code Review Expert", agentType: "core" },
    
    // Core Mr Blue Agents (#73-80)
    { agentId: "Agent #73", agentName: "Tour Guide", agentType: "core" },
    { agentId: "Agent #74", agentName: "Subscription Manager", agentType: "core" },
    { agentId: "Agent #75", agentName: "Avatar Manager", agentType: "core" },
    { agentId: "Agent #76", agentName: "Admin Assistant", agentType: "core" },
    { agentId: "Agent #77", agentName: "AI Site Builder", agentType: "core" },
    { agentId: "Agent #78", agentName: "Visual Editor", agentType: "core" },
    
    // Intelligence Network (#110-116)
    { agentId: "Agent #110", agentName: "Code Intelligence", agentType: "intelligence" },
    { agentId: "Agent #111", agentName: "Cross-Phase Learning", agentType: "intelligence" },
    { agentId: "Agent #112", agentName: "Dependency Intelligence", agentType: "intelligence" },
    { agentId: "Agent #113", agentName: "Pattern Recognition", agentType: "intelligence" },
    { agentId: "Agent #114", agentName: "Federated Learning", agentType: "intelligence" },
    { agentId: "Agent #115", agentName: "Knowledge Graph", agentType: "intelligence" },
    { agentId: "Agent #116", agentName: "Meta-Intelligence", agentType: "intelligence" },
    
    // Agent #0 CEO
    { agentId: "Agent #0", agentName: "CEO Orchestrator", agentType: "core" },
  ];

  for (const agent of agents) {
    await db.insert(agentCertifications).values({
      ...agent,
      status: "pending",
      trainingCompleted: false,
    }).onConflictDoNothing();
  }

  console.log(`✅ [Learning Seeder] Created ${agents.length} agent certification records`);
}
