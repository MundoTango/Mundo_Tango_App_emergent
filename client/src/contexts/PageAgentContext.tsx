/**
 * PageAgentContext
 * Global context provider for page agent information
 * 
 * Part of: Phase 0, Task 0.4 - Wire Page Agents
 * Purpose: Share page agent state across the app
 * Updates: Automatically updates when route changes
 */

import { createContext, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { detectPageContext, type PageAgentContext as PageContext } from '@/services/esaContextService';

/**
 * Context value type - page agent information
 */
export type PageAgentContextValue = PageContext;

/**
 * Create context with undefined default
 * (provider required to use this context)
 */
export const PageAgentContext = createContext<PageAgentContextValue | undefined>(undefined);

/**
 * PageAgentProvider component
 * Wraps app to provide page agent context to all children
 * 
 * @example
 * ```tsx
 * <PageAgentProvider>
 *   <App />
 * </PageAgentProvider>
 * ```
 */
export function PageAgentProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [context, setContext] = useState<PageAgentContextValue>(
    detectPageContext(location)
  );

  // Update context whenever location changes
  useEffect(() => {
    const newContext = detectPageContext(location);
    setContext(newContext);
    
    // Debug log in development
    if (import.meta.env.DEV && newContext.hasContext) {
      console.log(`📄 [Page Agent] ${location}`, {
        primary: newContext.agents[0]?.name,
        supporting: newContext.agents.slice(1).map(a => a.name),
        total: newContext.agents.length
      });
    }
  }, [location]);

  return (
    <PageAgentContext.Provider value={context}>
      {children}
    </PageAgentContext.Provider>
  );
}
