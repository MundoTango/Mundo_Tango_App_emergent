/**
 * H2AC Pattern: Context Detector
 * Detects current page and loads relevant agents automatically
 */

import { useMemo } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { 
  matchAgentsToRole, 
  getPageAgentForRoute, 
  getJourneyAgentForRoute,
  type AgentMatch,
  type UserRole
} from './AgentMatcher';

export interface PageContext {
  route: string;
  pageAgent: AgentMatch | null;
  journeyAgent: AgentMatch | null;
  matchedAgents: AgentMatch[];
  userRole: UserRole;
  isContextReady: boolean;
}

/**
 * Hook to detect page context and load relevant agents
 */
export function usePageContext(): PageContext {
  const [location] = useLocation();
  const { user } = useAuth();

  const context = useMemo(() => {
    if (!user) {
      return {
        route: location,
        pageAgent: null,
        journeyAgent: null,
        matchedAgents: [],
        userRole: 'frontend' as UserRole,
        isContextReady: false,
      };
    }

    // Determine user role from permissions
    const userRole = determineUserRole(user);

    // Get page-specific agent
    const pageAgent = getPageAgentForRoute(location);

    // Get journey agent
    const journeyAgent = getJourneyAgentForRoute(location);

    // Match agents to role and page
    const matchedAgents = matchAgentsToRole(userRole, location);

    return {
      route: location,
      pageAgent,
      journeyAgent,
      matchedAgents,
      userRole,
      isContextReady: true,
    };
  }, [location, user]);

  return context;
}

/**
 * Determine user role from user object
 */
function determineUserRole(user: any): UserRole {
  // Check user.role field
  if (user.role === 'superadmin' || user.role === 'admin') {
    return user.role;
  }

  // Check for specific skills or tags (future: user.skills field)
  if (user.skills) {
    const skills = Array.isArray(user.skills) ? user.skills : [];
    
    if (skills.some((s: string) => ['React', 'Vue', 'Angular', 'CSS', 'Frontend'].includes(s))) {
      return 'frontend';
    }
    
    if (skills.some((s: string) => ['Node.js', 'Python', 'Backend', 'API', 'Database'].includes(s))) {
      return 'backend';
    }
    
    if (skills.some((s: string) => ['Design', 'UI', 'UX', 'Figma'].includes(s))) {
      return 'designer';
    }
  }

  // Default: frontend for regular users
  return 'frontend';
}

/**
 * Hook to get agents for specific role (for human onboarding)
 */
export function useRoleAgents(role: UserRole) {
  return useMemo(() => {
    return matchAgentsToRole(role);
  }, [role]);
}

/**
 * Hook to check if specific agent is active in current context
 */
export function useIsAgentActive(agentId: string): boolean {
  const { matchedAgents } = usePageContext();
  return matchedAgents.some(agent => agent.id === agentId);
}

/**
 * Hook to get context message for Mr Blue
 */
export function useContextMessage(): string {
  const { pageAgent, journeyAgent, matchedAgents, isContextReady } = usePageContext();

  if (!isContextReady) {
    return "Loading context...";
  }

  const agentList = matchedAgents.slice(0, 5).map(a => a.id).join(', ');
  
  let message = `I'm here to help! `;
  
  if (pageAgent) {
    message += `You're on the ${pageAgent.name} (${pageAgent.id}). `;
  }
  
  if (journeyAgent) {
    message += `Part of ${journeyAgent.name} (${journeyAgent.id}). `;
  }
  
  message += `\n\nActive agents: ${agentList}`;
  
  return message;
}
