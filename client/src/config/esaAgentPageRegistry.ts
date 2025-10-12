/**
 * ESA Framework - Agent-to-Page Registry
 * Maps admin pages to responsible ESA agents
 * 
 * Purpose: Enable context-aware admin tools to show which agents built each page
 * Maintained by: All agents (Agent #64 reviews accuracy)
 * 
 * Based on: docs/platform-handoff/esa.md Section 10.2
 * Pattern: Route → Array of Agent IDs (primary agent first)
 */

/**
 * Registry mapping admin routes to responsible ESA agents
 * 
 * Format: [primary_agent, supporting_agent_2, supporting_agent_3, ...]
 * - Primary agent: Core builder/owner of the page
 * - Supporting agents: Contributed to design, state, data, etc.
 * 
 * Agent Reference (from esa.md):
 * - Agent #0: CEO - Strategic orchestration
 * - Agent #6: State Management - Frontend state, React Query
 * - Agent #8: User Management - User systems
 * - Agent #11: UI/UX Design - Aurora Tide, design systems
 * - Agent #12: Data Visualization - Charts, dashboards, analytics
 * - Agent #14: Code Quality - Architecture, patterns
 * - Agent #64: Documentation - Consolidation, reusable components
 * - Agent #65: Project Tracker - Self-hosted project management
 */
export const AGENT_PAGE_REGISTRY: Record<string, number[]> = {
  // ========== ESA Tools ==========
  '/admin/esa-mind': [0, 12, 6, 11],          // Agent #0 (CEO orchestration) + #12 (metrics viz) + #6 (state) + #11 (UI)
  '/admin/agent-metrics': [0, 12, 6],         // Agent #0 + #12 (visualization) + #6 (state)
  
  // ========== Project Management (Agent #65) ==========
  '/admin/projects': [65, 64, 6, 11],         // Agent #65 (tracker) + #64 (docs) + #6 (state) + #11 (UI)
  '/admin/projects/epics': [65, 17, 11],      // Agent #65 + #17 (hierarchy) + #11 (UI)
  '/admin/projects/stories': [65, 17, 11],    // Agent #65 + #17 (hierarchy) + #11 (UI)
  '/admin/projects/epic/:id': [65, 64, 11],   // Agent #65 + #64 (docs) + #11 (UI)
  '/admin/projects/story/:id': [65, 64, 11],  // Agent #65 + #64 (docs) + #11 (UI)
  '/admin/sprints': [63, 65, 11],             // Agent #63 (sprint planning) + #65 (tracker) + #11 (UI)
  
  // ========== Admin Center & Dashboard ==========
  '/admin': [0, 11, 64],                      // Agent #0 (CEO) + #11 (UI design) + #64 (docs)
  '/admin-legacy': [0, 11, 64],               // Legacy admin center - same agents
  '/admin/dashboard': [0, 12, 11],            // Agent #0 + #12 (viz) + #11 (UI)
  
  // ========== User Management ==========
  '/admin/users': [8, 11, 6],                 // Agent #8 (user mgmt) + #11 (UI) + #6 (state)
  '/admin/moderation': [8, 11, 6],            // Agent #8 + #11 (UI) + #6 (state)
  
  // ========== Analytics & Metrics ==========
  '/admin/analytics': [12, 6, 11],            // Agent #12 (data viz) + #6 (state) + #11 (UI)
  '/admin/subscription-analytics': [12, 6, 11], // Agent #12 + #6 + #11
  '/analytics': [12, 6, 11],                  // Agent #12 (visualization) + #6 (state) + #11 (UI)
  '/stats': [12, 6, 11],                      // Agent #12 + #6 + #11
  
  // ========== Subscription & Billing ==========
  '/admin/promo-codes': [0, 11, 6],           // Agent #0 (admin) + #11 (UI) + #6 (state)
  '/subscribe': [11, 6, 1],                   // Agent #11 (UI) + #6 (state) + #1 (subscription logic)
  '/settings/billing': [11, 6, 1],            // Agent #11 + #6 + #1
  '/payment-methods': [11, 6, 1],             // Agent #11 + #6 + #1
  '/invoices': [11, 6, 1],                    // Agent #11 + #6 + #1
  '/subscription': [11, 6, 1],                // Agent #11 + #6 + #1
  '/checkout/:tier': [11, 6, 1],              // Agent #11 + #6 + #1
  
  // ========== Agent Framework ==========
  '/agent-framework': [0, 12, 11],            // Agent #0 (CEO) + #12 (viz) + #11 (UI)
  '/hierarchy': [17, 12, 11],                 // Agent #17 (hierarchy) + #12 (viz) + #11 (UI)
  
  // ========== Life CEO ==========
  '/life-ceo': [0, 11, 6],                    // Agent #0 (CEO orchestration) + #11 (UI) + #6 (state)
  '/lifeceo': [0, 11, 6],                     // Alias
  '/life-ceo-performance': [12, 6, 11],       // Agent #12 (metrics) + #6 (state) + #11 (UI)
  
  // ========== Content & Social ==========
  '/memories': [6, 11, 13],                   // Agent #6 (state) + #11 (UI) + #13 (content/media)
  '/community': [11, 6, 8],                   // Agent #11 (UI) + #6 (state) + #8 (users)
  '/groups': [11, 6, 8],                      // Agent #11 + #6 + #8
  '/groups/:slug': [11, 6, 8],                // Agent #11 + #6 + #8
  '/events': [11, 6, 23],                     // Agent #11 (UI) + #6 (state) + #23 (events)
  '/events/:id': [11, 6, 23],                 // Agent #11 + #6 + #23
  
  // ========== User Features ==========
  '/profile/:username?': [11, 6, 8],          // Agent #11 (UI) + #6 (state) + #8 (users)
  '/settings': [11, 6, 8],                    // Agent #11 + #6 + #8
  '/friends': [11, 6, 8],                     // Agent #11 + #6 + #8
  '/messages': [11, 6, 29],                   // Agent #11 (UI) + #6 (state) + #29 (messaging)
  
  // ========== Search & Discovery ==========
  '/search': [11, 6, 30],                     // Agent #11 (UI) + #6 (state) + #30 (search)
  '/recommendations': [11, 6, 30],            // Agent #11 + #6 + #30
  
  // ========== Housing & Marketplace ==========
  '/housing-marketplace': [11, 6, 31],        // Agent #11 (UI) + #6 (state) + #31 (marketplace)
  '/host-dashboard': [11, 6, 31],             // Agent #11 + #6 + #31
  '/listing/:id': [11, 6, 31],                // Agent #11 + #6 + #31
  
  // ========== Monitoring & Testing ==========
  '/monitoring': [12, 6, 11],                 // Agent #12 (viz) + #6 (state) + #11 (UI)
  '/monitoring-test': [12, 6, 11],            // Agent #12 + #6 + #11
  '/database-security': [0, 12, 11],          // Agent #0 (admin) + #12 (viz) + #11 (UI)
  
  // ========== Authentication ==========
  '/login': [11, 6, 8],                       // Agent #11 (UI) + #6 (state) + #8 (users)
  '/register': [11, 6, 8],                    // Agent #11 + #6 + #8
  '/forgot-password': [11, 6, 8],             // Agent #11 + #6 + #8
  '/onboarding': [11, 6, 8],                  // Agent #11 + #6 + #8
};

/**
 * Get agents responsible for a specific page
 * @param route - Current route path (e.g., '/admin/projects')
 * @returns Array of agent IDs, or empty array if no match
 */
export function getPageAgents(route: string): number[] {
  // Exact match first
  if (AGENT_PAGE_REGISTRY[route]) {
    return AGENT_PAGE_REGISTRY[route];
  }
  
  // Try to match dynamic routes (e.g., /groups/:slug)
  const matchingKey = Object.keys(AGENT_PAGE_REGISTRY).find(key => {
    if (!key.includes(':')) return false;
    const pattern = key.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(route);
  });
  
  if (matchingKey) {
    return AGENT_PAGE_REGISTRY[matchingKey];
  }
  
  // No match found
  return [];
}

/**
 * Get all pages built by a specific agent
 * @param agentId - ESA agent ID (e.g., 65)
 * @returns Array of routes where this agent contributed
 */
export function getAgentPages(agentId: number): string[] {
  return Object.entries(AGENT_PAGE_REGISTRY)
    .filter(([_, agents]) => agents.includes(agentId))
    .map(([route, _]) => route);
}

/**
 * Check if an agent contributed to a specific page
 * @param route - Current route path
 * @param agentId - ESA agent ID to check
 * @returns true if agent contributed to this page
 */
export function isAgentOnPage(route: string, agentId: number): boolean {
  const agents = getPageAgents(route);
  return agents.includes(agentId);
}
