/**
 * usePageAgent Hook
 * Access page agent context from any component
 * 
 * Part of: Phase 0, Task 0.4 - Wire Page Agents
 * Purpose: Convenient hook to access page agent information
 */

import { useContext } from 'react';
import { PageAgentContext, type PageAgentContextValue } from '@/contexts/PageAgentContext';

/**
 * Hook to access page agent context
 * 
 * @throws Error if used outside PageAgentProvider
 * @returns Current page agent context
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const pageAgent = usePageAgent();
 *   
 *   if (pageAgent.hasContext) {
 *     console.log('Primary agent:', pageAgent.agents[0].name);
 *   }
 * }
 * ```
 */
export function usePageAgent(): PageAgentContextValue {
  const context = useContext(PageAgentContext);
  
  if (context === undefined) {
    throw new Error('usePageAgent must be used within a PageAgentProvider');
  }
  
  return context;
}
