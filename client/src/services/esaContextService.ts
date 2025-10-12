/**
 * ESA Framework - Context Detection Service
 * Provides context-aware information about current page and responsible agents
 * 
 * Purpose: Enable ESA Mind tools to understand which agents built what
 * Based on: docs/platform-handoff/esa.md Section 10.1
 */

import { getPageAgents } from '@/config/esaAgentPageRegistry';
import { esaAgents } from '@/data/esaFrameworkData';

/**
 * Agent context information for a specific page
 */
export interface PageAgentContext {
  route: string;
  agentIds: number[];
  agents: Array<{
    id: number;
    name: string;
    role: string;
    division?: string;
    layers?: string;
    isPrimary: boolean; // First agent in list = primary
  }>;
  hasContext: boolean; // true if agents found for this page
}

/**
 * ESA Mind link with context params
 */
export interface ESAMindLink {
  url: string;
  label: string;
  context?: string;
  view?: string;
  agentId?: number;
}

/**
 * Detect current page context and return responsible agents
 * @param route - Current route path from useLocation()
 * @returns Page agent context with detailed agent information
 */
export function detectPageContext(route: string): PageAgentContext {
  const agentIds = getPageAgents(route);
  const hasContext = agentIds.length > 0;
  
  const agents = agentIds.map((id, index) => {
    const agent = esaAgents.find(a => a.id === id);
    return {
      id,
      name: agent?.name || `Agent #${id}`,
      role: agent?.role || 'Unknown Role',
      division: agent?.division,
      layers: agent?.layers,
      isPrimary: index === 0 // First agent is primary builder
    };
  });
  
  return {
    route,
    agentIds,
    agents,
    hasContext
  };
}

/**
 * Generate ESA Mind dashboard link with context
 * @param currentRoute - Current page route
 * @param view - Optional specific view (quality-gates, training, etc.)
 * @returns ESA Mind URL with context params
 */
export function getESAMindLink(currentRoute?: string, view?: string): string {
  const baseUrl = '/admin/esa-mind';
  const params = new URLSearchParams();
  
  if (currentRoute) {
    params.append('context', currentRoute);
  }
  
  if (view) {
    params.append('view', view);
  }
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Generate Quick Navigator links with current page context
 * @param currentRoute - Current route for context
 * @returns Array of ESA Mind links with appropriate context
 */
export function getQuickNavigatorLinks(currentRoute: string): ESAMindLink[] {
  return [
    {
      url: getESAMindLink(),
      label: 'Full Dashboard',
      context: undefined,
      view: undefined
    },
    {
      url: getESAMindLink(undefined, 'org-chart'),
      label: 'Agent Org Chart',
      view: 'org-chart'
    },
    {
      url: getESAMindLink(undefined, 'quality-gates'),
      label: 'Quality Gates',
      view: 'quality-gates'
    },
    {
      url: getESAMindLink(undefined, 'audit'),
      label: '17-Phase Audit',
      view: 'audit'
    },
    {
      url: getESAMindLink(undefined, 'training'),
      label: 'Training Status',
      view: 'training'
    },
    {
      url: getESAMindLink(currentRoute),
      label: 'Current Page Agents',
      context: currentRoute
    }
  ];
}

/**
 * Format agent list for display
 * @param context - Page agent context
 * @returns Formatted string for display (e.g., "Agent #65, #64, #6")
 */
export function formatAgentList(context: PageAgentContext): string {
  if (!context.hasContext) {
    return 'No agents identified';
  }
  
  return context.agents
    .map(a => `#${a.id}`)
    .join(', ');
}

/**
 * Get primary agent for a page (first in list)
 * @param route - Current route
 * @returns Primary agent or null
 */
export function getPrimaryAgent(route: string) {
  const context = detectPageContext(route);
  return context.agents[0] || null;
}

/**
 * Check if current route is an admin page
 * @param route - Current route
 * @returns true if admin page
 */
export function isAdminPage(route: string): boolean {
  return route.startsWith('/admin') || route.startsWith('/admin-legacy');
}

/**
 * Get context summary for display
 * @param route - Current route
 * @returns Human-readable context summary
 */
export function getContextSummary(route: string): string {
  const context = detectPageContext(route);
  
  if (!context.hasContext) {
    return `Page: ${route} • No agent mapping available`;
  }
  
  const primaryAgent = context.agents[0];
  const supportCount = context.agents.length - 1;
  
  if (supportCount === 0) {
    return `Page: ${route} • Built by ${primaryAgent.name}`;
  }
  
  return `Page: ${route} • Built by ${primaryAgent.name} + ${supportCount} supporting agent${supportCount > 1 ? 's' : ''}`;
}
