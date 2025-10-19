import { createContext, useContext, ReactNode } from 'react';
interface PageAgentContextType { currentPage: string; agentReady: boolean; }
const PageAgentContext = createContext<PageAgentContextType | undefined>(undefined);
export function PageAgentProvider({ children }: { children: ReactNode }) {
  const value = { currentPage: 'default', agentReady: false };
  return <PageAgentContext.Provider value={value}>{children}</PageAgentContext.Provider>;
}
export function usePageAgent() {
  const context = useContext(PageAgentContext);
  if (!context) throw new Error('usePageAgent must be used within PageAgentProvider');
  return context;
}
