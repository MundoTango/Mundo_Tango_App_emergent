/**
 * usePageAgent Hook
 * Provides context-aware page agent information for current route
 * 
 * Part of: Phase 0, Task 0.4 - Wire Page Agents
 * Purpose: Enable all pages to access their assigned ESA agents
 * Connects to: Mr Blue (#73) for context visibility
 */

import { useLocation } from 'wouter';
import { useContext } from 'react';
import { PageAgentContext } from '@/contexts/PageAgentContext';
import { detectPageContext, type PageAgentContext as PageContext } from '@/services/esaContextService';

/**
 * Hook to access page agent information for current route
 * 
 * @returns Page agent context with agent details
 * 
 * @example
 * ```tsx
 * function MyPage() {
 *   const { agents, route, hasContext } = usePageAgent();
 *   
 *   if (hasContext) {
 *     console.log(`Page built by: ${agents[0].name}`);
 *   }
 *   
 *   return <div>...</div>;
 * }
 * ```
 */
export function usePageAgent(): PageContext {
  const [location] = useLocation();
  const context = useContext(PageAgentContext);
  
  // If PageAgentContext provider is available, use it
  if (context !== undefined) {
    return context;
  }
  
  // Fallback: Detect context from current location
  // This ensures hook works even if provider not yet added
  return detectPageContext(location);
}

/**
 * Hook to check if current page has agent assignments
 * @returns true if agents are assigned to this page
 */
export function useHasPageAgent(): boolean {
  const { hasContext } = usePageAgent();
  return hasContext;
}

/**
 * Hook to get primary agent for current page
 * @returns Primary agent or null if no agents assigned
 */
export function usePrimaryAgent() {
  const { agents } = usePageAgent();
  return agents[0] || null;
}

/**
 * Hook to get all supporting agents (excluding primary)
 * @returns Array of supporting agents
 */
export function useSupportingAgents() {
  const { agents } = usePageAgent();
  return agents.slice(1);
}

/**
 * Hook to check if specific agent contributed to current page
 * @param agentId - Agent ID to check
 * @returns true if agent contributed to this page
 */
export function useIsAgentOnPage(agentId: number): boolean {
  const { agentIds } = usePageAgent();
  return agentIds.includes(agentId);
}
