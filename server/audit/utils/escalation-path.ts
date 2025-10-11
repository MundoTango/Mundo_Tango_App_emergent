/**
 * ESA Agent Escalation Path Resolver
 * Based on: docs/platform-handoff/ESA_AGENT_ORG_CHART.md
 * Resolves agent hierarchy for A2A communication and escalation
 */

interface AgentHierarchy {
  agent_id: number;
  agent_name: string;
  domain_id?: number;
  domain_name?: string;
  chief_id?: number;
  chief_name?: string;
}

/**
 * Agent hierarchy mapping (100-agent structure)
 */
const AGENT_HIERARCHY: Record<number, AgentHierarchy> = {
  // Layer Agents 1-10 (Foundation) → Chief #1
  1: { agent_id: 1, agent_name: "Database Architecture", domain_id: 1, domain_name: "Infrastructure Orchestrator", chief_id: 1, chief_name: "Chief #1 (Foundation)" },
  2: { agent_id: 2, agent_name: "API Structure", domain_id: 1, domain_name: "Infrastructure Orchestrator", chief_id: 1, chief_name: "Chief #1 (Foundation)" },
  3: { agent_id: 3, agent_name: "Server Framework", domain_id: 1, domain_name: "Infrastructure Orchestrator", chief_id: 1, chief_name: "Chief #1 (Foundation)" },
  8: { agent_id: 8, agent_name: "Client Framework", domain_id: 2, domain_name: "Frontend Coordinator", chief_id: 1, chief_name: "Chief #1 (Foundation)" },
  9: { agent_id: 9, agent_name: "UI Framework", domain_id: 2, domain_name: "Frontend Coordinator", chief_id: 1, chief_name: "Chief #1 (Foundation)" },
  10: { agent_id: 10, agent_name: "Component Library", domain_id: 2, domain_name: "Frontend Coordinator", chief_id: 1, chief_name: "Chief #1 (Foundation)" },
  
  // Layer Agents 11-20 (Core) → Chief #2
  11: { agent_id: 11, agent_name: "Real-time Features", domain_id: 4, domain_name: "Real-time Communications", chief_id: 2, chief_name: "Chief #2 (Core)" },
  12: { agent_id: 12, agent_name: "Data Processing", domain_id: 3, domain_name: "Background Processor", chief_id: 2, chief_name: "Chief #2 (Core)" },
  13: { agent_id: 13, agent_name: "File Management", domain_id: 3, domain_name: "Background Processor", chief_id: 2, chief_name: "Chief #2 (Core)" },
  14: { agent_id: 14, agent_name: "Caching Strategy", domain_id: 1, domain_name: "Infrastructure Orchestrator", chief_id: 2, chief_name: "Chief #2 (Core)" },
  16: { agent_id: 16, agent_name: "Translation & i18n Expert", domain_id: 2, domain_name: "Frontend Coordinator", chief_id: 1, chief_name: "Chief #1 (Foundation)" },
  17: { agent_id: 17, agent_name: "UI/UX Design (Aurora)", domain_id: 2, domain_name: "Frontend Coordinator", chief_id: 1, chief_name: "Chief #1 (Foundation)" },
  
  // Layer Agents 21-30 (Business) → Chief #3
  21: { agent_id: 21, agent_name: "User Management", domain_id: 5, domain_name: "Business Logic Manager", chief_id: 3, chief_name: "Chief #3 (Business)" },
  
  // Layer Agents 31-46 (Intelligence) → Chief #4
  35: { agent_id: 35, agent_name: "AI Agent Management", domain_id: 7, domain_name: "Life CEO Core", chief_id: 4, chief_name: "Chief #4 (Intelligence)" },
  
  // Layer Agents 47-56 (Platform) → Chief #5
  48: { agent_id: 48, agent_name: "Performance Monitoring", domain_id: 8, domain_name: "Platform Enhancement", chief_id: 5, chief_name: "Chief #5 (Platform)" },
  51: { agent_id: 51, agent_name: "Testing Framework", domain_id: 8, domain_name: "Platform Enhancement", chief_id: 5, chief_name: "Chief #5 (Platform)" },
  54: { agent_id: 54, agent_name: "Accessibility", domain_id: 8, domain_name: "Platform Enhancement", chief_id: 5, chief_name: "Chief #5 (Platform)" },
  
  // Layer Agents 57-61 (Extended) → Chief #6
  62: { agent_id: 62, agent_name: "Resume AI", domain_id: 7, domain_name: "Life CEO Core", chief_id: 4, chief_name: "Chief #4 (Intelligence)" },
  65: { agent_id: 65, agent_name: "Project Tracker Manager", domain_id: 9, domain_name: "Master Control", chief_id: 6, chief_name: "Chief #6 (Extended)" }
};

/**
 * Get escalation path for an agent
 * Format: "Agent #X → Domain #Y → Chief #Z → Agent #0 (ESA CEO)"
 */
export function getEscalationPath(agentId: number): string {
  const hierarchy = AGENT_HIERARCHY[agentId];
  
  if (!hierarchy) {
    return `Agent #${agentId} → Agent #0 (ESA CEO)`;
  }
  
  const parts: string[] = [`Agent #${agentId} (${hierarchy.agent_name})`];
  
  if (hierarchy.domain_id && hierarchy.domain_name) {
    parts.push(`Domain #${hierarchy.domain_id} (${hierarchy.domain_name})`);
  }
  
  if (hierarchy.chief_id && hierarchy.chief_name) {
    parts.push(hierarchy.chief_name);
  }
  
  parts.push("Agent #0 (ESA CEO)");
  
  return parts.join(" → ");
}

/**
 * Get agent name by ID
 */
export function getAgentName(agentId: number): string {
  return AGENT_HIERARCHY[agentId]?.agent_name || `Agent #${agentId}`;
}

/**
 * Get collaborating agents based on category
 */
export function getCollaboratingAgents(category: string, primaryAgentId: number): number[] {
  const collaborationMap: Record<string, number[]> = {
    "Architecture & Data Integrity": [1, 2, 3, 4, 5, 6],
    "UI/UX & Accessibility": [11, 17, 54],
    "Business Logic & Security": [21, 49],
    "API & Performance": [2, 48],
    "AI Intelligence": [10, 35],
    "Content & i18n": [16, 19],
    "Testing & QA": [51],
    "Documentation & Compliance": [52, 56]
  };
  
  const agents = collaborationMap[category] || [];
  return agents.filter(id => id !== primaryAgentId);
}
