/**
 * Page Agent Context
 * Phase 0 Task 0.4: 276-agent context visibility
 * 
 * Provides page-specific agent context for AI assistance
 */

import { createContext, useContext, ReactNode } from 'react';

interface PageAgent {
  id: string;
  name: string;
  category: string;
  purpose: string;
}

interface PageAgentContextValue {
  agents: PageAgent[];
  hasContext: boolean;
  currentPage: string;
}

const PageAgentContext = createContext<PageAgentContextValue>({
  agents: [],
  hasContext: false,
  currentPage: '/',
});

export function PageAgentProvider({ children }: { children: ReactNode }) {
  // Get current page from URL
  const currentPage = window.location.pathname;

  // Map pages to their agents
  const getPageAgents = (page: string): PageAgent[] => {
    // Map route to agent
    const pageAgentMap: Record<string, PageAgent[]> = {
      '/': [
        {
          id: 'page-agent-home',
          name: 'Home Page Agent',
          category: 'Page Agents',
          purpose: 'Provide context-aware assistance on home page',
        },
      ],
      '/discover': [
        {
          id: 'page-agent-discover',
          name: 'Discover Page Agent',
          category: 'Page Agents',
          purpose: 'Help users discover events and communities',
        },
      ],
      '/events': [
        {
          id: 'page-agent-events',
          name: 'Events Page Agent',
          category: 'Page Agents',
          purpose: 'Assist with event browsing and management',
        },
      ],
      '/memories': [
        {
          id: 'page-agent-memories',
          name: 'Memories Page Agent',
          category: 'Page Agents',
          purpose: 'Help users create and share memories',
        },
      ],
      '/community': [
        {
          id: 'page-agent-community',
          name: 'Community Page Agent',
          category: 'Page Agents',
          purpose: 'Guide community exploration and participation',
        },
      ],
    };

    return pageAgentMap[page] || [];
  };

  const agents = getPageAgents(currentPage);

  return (
    <PageAgentContext.Provider
      value={{
        agents,
        hasContext: agents.length > 0,
        currentPage,
      }}
    >
      {children}
    </PageAgentContext.Provider>
  );
}

export function usePageAgent() {
  const context = useContext(PageAgentContext);
  if (!context) {
    throw new Error('usePageAgent must be used within PageAgentProvider');
  }
  return context;
}
