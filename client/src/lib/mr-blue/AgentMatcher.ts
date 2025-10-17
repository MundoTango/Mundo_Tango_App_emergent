/**
 * H2AC Pattern: Agent Matcher
 * Matches human roles to relevant AI agents for optimal collaboration
 */

export type UserRole = 'frontend' | 'backend' | 'designer' | 'admin' | 'superadmin';
export type AgentId = string; // e.g., "P1", "ESA2", "MB6"

export interface AgentMatch {
  id: AgentId;
  name: string;
  type: 'mr_blue' | 'esa' | 'page' | 'journey';
  relevance: number; // 0-1 score
}

/**
 * Match agents to user role for H2AC collaboration
 */
export function matchAgentsToRole(userRole: UserRole, currentPage?: string): AgentMatch[] {
  // Base Mr Blue agents (always available)
  const baseAgents: AgentMatch[] = [
    { id: 'MB1', name: '3D Avatar', type: 'mr_blue', relevance: 1.0 },
    { id: 'MB2', name: 'Chat Interface', type: 'mr_blue', relevance: 1.0 },
    { id: 'MB3', name: 'Voice I/O', type: 'mr_blue', relevance: 0.8 },
    { id: 'MB4', name: 'Interactive Tours', type: 'mr_blue', relevance: 0.6 },
    { id: 'MB5', name: 'Subscription Manager', type: 'mr_blue', relevance: 0.5 },
    { id: 'MB7', name: 'AI Site Builder', type: 'mr_blue', relevance: 0.7 },
    { id: 'MB8', name: 'Learning Coordinator', type: 'mr_blue', relevance: 0.9 },
  ];

  // Role-specific agent mappings
  const roleMapping: Record<UserRole, AgentMatch[]> = {
    frontend: [
      { id: 'MB6', name: 'Visual Editor', type: 'mr_blue', relevance: 1.0 },
      { id: 'ESA2', name: 'Frontend Coordinator', type: 'esa', relevance: 1.0 },
      { id: 'ESA48', name: 'UI/UX Design', type: 'esa', relevance: 0.9 },
      { id: 'ESA11', name: 'Aurora Tide Expert', type: 'esa', relevance: 0.9 },
      { id: 'ESA51', name: 'QA Testing', type: 'esa', relevance: 0.7 },
    ],
    backend: [
      { id: 'ESA1', name: 'Infrastructure', type: 'esa', relevance: 1.0 },
      { id: 'ESA3', name: 'Background Processor', type: 'esa', relevance: 0.9 },
      { id: 'ESA5', name: 'Business Logic', type: 'esa', relevance: 1.0 },
      { id: 'ESA14', name: 'Database Layer', type: 'esa', relevance: 0.9 },
      { id: 'ESA51', name: 'QA Testing', type: 'esa', relevance: 0.7 },
    ],
    designer: [
      { id: 'MB6', name: 'Visual Editor', type: 'mr_blue', relevance: 1.0 },
      { id: 'ESA11', name: 'Aurora Tide Expert', type: 'esa', relevance: 1.0 },
      { id: 'ESA48', name: 'UI/UX Design', type: 'esa', relevance: 1.0 },
      { id: 'ESA13', name: 'Data Visualization', type: 'esa', relevance: 0.8 },
    ],
    admin: [
      { id: 'ESA0', name: 'ESA CEO', type: 'esa', relevance: 0.9 },
      { id: 'ESA51', name: 'QA Testing', type: 'esa', relevance: 1.0 },
      { id: 'ESA64', name: 'Documentation', type: 'esa', relevance: 0.8 },
      { id: 'ESA65', name: 'The Plan', type: 'esa', relevance: 1.0 },
    ],
    superadmin: [
      { id: 'ESA0', name: 'ESA CEO', type: 'esa', relevance: 1.0 },
      { id: 'ESA51', name: 'QA Testing', type: 'esa', relevance: 1.0 },
      { id: 'ESA64', name: 'Documentation', type: 'esa', relevance: 0.9 },
      { id: 'ESA65', name: 'The Plan', type: 'esa', relevance: 1.0 },
      { id: 'MB6', name: 'Visual Editor', type: 'mr_blue', relevance: 1.0 },
      { id: 'MB7', name: 'AI Site Builder', type: 'mr_blue', relevance: 1.0 },
    ],
  };

  let matched = [...baseAgents, ...roleMapping[userRole]];

  // Add page agent if on specific page
  if (currentPage) {
    const pageAgent = getPageAgentForRoute(currentPage);
    if (pageAgent) {
      matched.push(pageAgent);
    }
  }

  // Remove duplicates and sort by relevance
  const uniqueAgents = matched.filter((agent, index, self) =>
    index === self.findIndex((a) => a.id === agent.id)
  );

  return uniqueAgents.sort((a, b) => b.relevance - a.relevance);
}

/**
 * Get page agent for current route
 */
export function getPageAgentForRoute(route: string): AgentMatch | null {
  const routeMap: Record<string, AgentMatch> = {
    '/login': { id: 'P1', name: 'Login Page', type: 'page', relevance: 1.0 },
    '/register': { id: 'P2', name: 'Register Page', type: 'page', relevance: 1.0 },
    '/onboarding': { id: 'P3', name: 'Onboarding', type: 'page', relevance: 1.0 },
    '/profile': { id: 'P4', name: 'Profile', type: 'page', relevance: 1.0 },
    '/settings': { id: 'P5', name: 'Settings', type: 'page', relevance: 1.0 },
    '/': { id: 'P10', name: 'Home Feed', type: 'page', relevance: 1.0 },
    '/admin/projects': { id: 'P34', name: 'The Plan', type: 'page', relevance: 1.0 },
    '/admin/esa-mind': { id: 'P35', name: 'ESA Mind', type: 'page', relevance: 1.0 },
    // Add more as needed
  };

  // Handle dynamic routes (e.g., /profile/:username)
  const normalizedRoute = route.replace(/\/[^/]+$/, '/:id');
  
  return routeMap[route] || routeMap[normalizedRoute] || null;
}

/**
 * Get journey agent for route
 */
export function getJourneyAgentForRoute(route: string): AgentMatch | null {
  // Tier 1: Core User Journeys
  const tier1Routes = ['/login', '/register', '/onboarding', '/profile', '/settings'];
  const tier2Routes = ['/', '/post', '/events', '/friends', '/messages'];
  const tier3Routes = ['/groups', '/recommendations', '/map', '/travel', '/calendar'];
  const tier4Routes = ['/admin'];

  if (tier1Routes.some(r => route.startsWith(r))) {
    return { id: 'J1', name: 'New User Journey', type: 'journey', relevance: 1.0 };
  } else if (tier2Routes.some(r => route.startsWith(r))) {
    return { id: 'J2', name: 'Active User Journey', type: 'journey', relevance: 1.0 };
  } else if (tier3Routes.some(r => route.startsWith(r))) {
    return { id: 'J3', name: 'Power User Journey', type: 'journey', relevance: 1.0 };
  } else if (tier4Routes.some(r => route.startsWith(r))) {
    return { id: 'J4', name: 'Super Admin Journey', type: 'journey', relevance: 1.0 };
  }

  return null;
}

/**
 * Filter agents by type
 */
export function filterAgentsByType(agents: AgentMatch[], type: AgentMatch['type']): AgentMatch[] {
  return agents.filter(agent => agent.type === type);
}

/**
 * Get top N agents by relevance
 */
export function getTopAgents(agents: AgentMatch[], count: number): AgentMatch[] {
  return agents.slice(0, count);
}

/**
 * Format agent list for display
 */
export function formatAgentList(agents: AgentMatch[]): string {
  return agents.map(a => a.id).join(', ');
}
